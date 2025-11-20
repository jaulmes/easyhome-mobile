import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, Image } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';

const EditPropertyScreen = ({ route }) => {
  const { property } = route.params;
  const [title, setTitle] = useState(property.title);
  const [description, setDescription] = useState(property.description);
  const [price, setPrice] = useState(property.price.toString());
  const [type, setType] = useState(property.type);
  const [city, setCity] = useState(property.location.city);
  const [neighborhood, setNeighborhood] = useState(property.location.neighborhood);
  const [rooms, setRooms] = useState(property.details.rooms.toString());
  const [bathrooms, setBathrooms] = useState(property.details.bathrooms.toString());
  const [area, setArea] = useState(property.details.area.toString());
  const [images, setImages] = useState(property.images);
  const navigation = useNavigation();

  const handleChooseImages = () => {
    launchImageLibrary({ mediaType: 'photo', selectionLimit: 5 }, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else {
        const newImages = response.assets.map(asset => ({
            id: `new_${asset.fileName}`,
            url: asset.uri,
            hint: ''
        }))
        setImages([...images, ...newImages]);
      }
    });
  };

  const handleUpdateProperty = async () => {
    const user = auth().currentUser;
    if (!user) {
      return Alert.alert('Error', 'You must be logged in to update a property.');
    }

    try {
      // Upload new images to Firebase Storage
      const newImages = images.filter(image => image.url.startsWith('file://'));
      const uploadedImageUrls = await Promise.all(
        newImages.map(async (image) => {
          const reference = storage().ref(`properties/${user.uid}/${Date.now()}_${image.id}`);
          await reference.putFile(image.url);
          const url = await reference.getDownloadURL();
          return { id: reference.path, url, hint: '' };
        })
      );

      const existingImages = images.filter(image => !image.url.startsWith('file://'));
      const allImages = [...existingImages, ...uploadedImageUrls];

      // Update property in Firestore
      await firestore().collection('properties').doc(property.id).update({
        title,
        description,
        price: parseInt(price, 10),
        type,
        location: {
          city,
          neighborhood,
          mapCoordinates: { lat: 0, lng: 0 }, // Placeholder
        },
        details: {
          rooms: parseInt(rooms, 10),
          bathrooms: parseInt(bathrooms, 10),
          area: parseInt(area, 10),
        },
        images: allImages,
      });

      Alert.alert('Success', 'Property updated successfully.');
      navigation.goBack();

    } catch (error) => {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 p-6">
      <Text className="text-3xl font-bold text-gray-800 mb-6">Edit Property</Text>

      <TextInput className="bg-white border border-gray-300 rounded-lg px-4 py-3 mb-4" placeholder="Title" value={title} onChangeText={setTitle} />
      <TextInput className="bg-white border border-gray-300 rounded-lg px-4 py-3 mb-4" placeholder="Description" value={description} onChangeText={setDescription} multiline />
      <TextInput className="bg-white border border-gray-300 rounded-lg px-4 py-3 mb-4" placeholder="Price (FCFA)" value={price} onChangeText={setPrice} keyboardType="numeric" />
      <TextInput className="bg-white border border-gray-300 rounded-lg px-4 py-3 mb-4" placeholder="Type (e.g., apartment, house)" value={type} onChangeText={setType} />
      <TextInput className="bg-white border border-gray-300 rounded-lg px-4 py-3 mb-4" placeholder="City" value={city} onChangeText={setCity} />
      <TextInput className="bg-white border border-gray-300 rounded-lg px-4 py-3 mb-4" placeholder="Neighborhood" value={neighborhood} onChangeText={setNeighborhood} />
      <TextInput className="bg-white border border-gray-300 rounded-lg px-4 py-3 mb-4" placeholder="Number of Rooms" value={rooms} onChangeText={setRooms} keyboardType="numeric" />
      <TextInput className="bg-white border border-gray-300 rounded-lg px-4 py-3 mb-4" placeholder="Number of Bathrooms" value={bathrooms} onChangeText={setBathrooms} keyboardType="numeric" />
      <TextInput className="bg-white border border-gray-300 rounded-lg px-4 py-3 mb-6" placeholder="Area (m²)" value={area} onChangeText={setArea} keyboardType="numeric" />

      <TouchableOpacity className="bg-gray-200 rounded-lg py-3 mb-4" onPress={handleChooseImages}>
        <Text className="text-center font-semibold text-gray-700">Choose Images</Text>
      </TouchableOpacity>

      <View className="flex-row flex-wrap justify-start mb-6">
        {images.map(image => (
          <Image key={image.id} source={{ uri: image.url }} className="w-24 h-24 rounded-lg mr-2 mb-2" />
        ))}
      </View>

      <TouchableOpacity className="bg-blue-600 rounded-lg py-4" onPress={handleUpdateProperty}>
        <Text className="text-white text-center font-bold text-lg">Update Property</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default EditPropertyScreen;