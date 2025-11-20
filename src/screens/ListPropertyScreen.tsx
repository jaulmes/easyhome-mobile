import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, Image } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';

const ListPropertyScreen = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [type, setType] = useState('apartment');
  const [city, setCity] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [rooms, setRooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [area, setArea] = useState('');
  const [images, setImages] = useState([]);

  const handleChooseImages = () => {
    launchImageLibrary({ mediaType: 'photo', selectionLimit: 5 }, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else {
        setImages(response.assets);
      }
    });
  };

  const handleListProperty = async () => {
    const user = auth().currentUser;
    if (!user) {
      return Alert.alert('Error', 'You must be logged in to list a property.');
    }

    try {
      // Upload images to Firebase Storage
      const imageUrls = await Promise.all(
        images.map(async (image) => {
          const reference = storage().ref(`properties/${user.uid}/${Date.now()}_${image.fileName}`);
          await reference.putFile(image.uri);
          const url = await reference.getDownloadURL();
          return { id: reference.path, url, hint: '' };
        })
      );

      // Add property to Firestore
      await firestore().collection('properties').add({
        landlordId: user.uid,
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
        images: imageUrls,
        amenities: [], // Placeholder
        availability: 'available',
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      Alert.alert('Success', 'Property listed successfully.');
      // Clear form
      setTitle('');
      setDescription('');
      setPrice('');
      setType('apartment');
      setCity('');
      setNeighborhood('');
      setRooms('');
      setBathrooms('');
      setArea('');
      setImages([]);

    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 p-6">
      <Text className="text-3xl font-bold text-gray-800 mb-6">List a New Property</Text>

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
          <Image key={image.uri} source={{ uri: image.uri }} className="w-24 h-24 rounded-lg mr-2 mb-2" />
        ))}
      </View>

      <TouchableOpacity className="bg-blue-600 rounded-lg py-4" onPress={handleListProperty}>
        <Text className="text-white text-center font-bold text-lg">List Property</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ListPropertyScreen;