import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { launchImageLibrary } from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

const AddListingScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [city, setCity] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [area, setArea] = useState('');
  const [images, setImages] = useState([]);

  const handleSelectImages = () => {
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

  const handleAddListing = async () => {
    const currentUser = auth().currentUser;
    if (currentUser) {
      const imageUrls = [];
      for (const image of images) {
        const reference = storage().ref(`listings/${currentUser.uid}/${Date.now()}`);
        await reference.putFile(image.uri);
        const url = await reference.getDownloadURL();
        imageUrls.push(url);
      }

      firestore()
        .collection('annonces')
        .add({
          title,
          description,
          price: parseFloat(price),
          city,
          neighborhood,
          propertyType,
          bathrooms: parseInt(bathrooms),
          area: area ? parseFloat(area) : null,
          ownerId: currentUser.uid,
          createdAt: firestore.FieldValue.serverTimestamp(),
          status: 'visible',
          imageUrls,
        })
        .then(() => {
          console.log('Listing added!');
          navigation.goBack();
        });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={typography.h1}>Ajouter une nouvelle annonce</Text>
      <TextInput style={styles.input} placeholder="Titre" value={title} onChangeText={setTitle} placeholderTextColor="#A9A9A9" />
      <TextInput style={styles.input} placeholder="Description" value={description} onChangeText={setDescription} multiline placeholderTextColor="#A9A9A9" />
      <TextInput style={styles.input} placeholder="Prix" value={price} onChangeText={setPrice} keyboardType="numeric" placeholderTextColor="#A9A9A9" />
      <TextInput style={styles.input} placeholder="Ville" value={city} onChangeText={setCity} placeholderTextColor="#A9A9A9" />
      <TextInput style={styles.input} placeholder="Quartier" value={neighborhood} onChangeText={setNeighborhood} placeholderTextColor="#A9A9A9" />
      <TextInput style={styles.input} placeholder="Type de bien" value={propertyType} onChangeText={setPropertyType} placeholderTextColor="#A9A9A9" />
      <TextInput style={styles.input} placeholder="Salles de bain" value={bathrooms} onChangeText={setBathrooms} keyboardType="numeric" placeholderTextColor="#A9A9A9" />
      <TextInput style={styles.input} placeholder="Superficie (facultatif)" value={area} onChangeText={setArea} keyboardType="numeric" placeholderTextColor="#A9A9A9" />

      <TouchableOpacity style={styles.button} onPress={handleSelectImages}>
        <Text style={styles.buttonText}>Sélectionner des photos</Text>
      </TouchableOpacity>
      <View style={styles.imageContainer}>
        {images.map((image, index) => (
          <Image key={index} source={{ uri: image.uri }} style={styles.image} />
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleAddListing}>
        <Text style={styles.buttonText}>Ajouter l'annonce</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: colors.background,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: colors.surface,
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 15,
    fontSize: 16,
    color: colors.text,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: 'bold',
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 10,
  },
  image: {
    width: 100,
    height: 100,
    margin: 5,
    borderRadius: 5,
  },
});

export default AddListingScreen;
