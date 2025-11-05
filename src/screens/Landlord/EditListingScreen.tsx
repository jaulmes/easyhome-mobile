import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Image } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { launchImageLibrary } from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';

const EditListingScreen = ({ route, navigation }) => {
  const { listingId } = route.params;
  const [listing, setListing] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [city, setCity] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [area, setArea] = useState('');
  const [images, setImages] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);

  useEffect(() => {
    const subscriber = firestore()
      .collection('annonces')
      .doc(listingId)
      .onSnapshot(documentSnapshot => {
        const data = documentSnapshot.data();
        setListing(data);
        setTitle(data.title);
        setDescription(data.description);
        setPrice(data.price.toString());
        setCity(data.city);
        setNeighborhood(data.neighborhood);
        setPropertyType(data.propertyType);
        setBathrooms(data.bathrooms.toString());
        setArea(data.area ? data.area.toString() : '');
        setImageUrls(data.imageUrls || []);
      });

    return () => subscriber();
  }, [listingId]);

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

  const handleUpdateListing = async () => {
    const currentUser = auth().currentUser;
    if (currentUser) {
      const newImageUrls = [...imageUrls];
      for (const image of images) {
        const reference = storage().ref(`listings/${currentUser.uid}/${Date.now()}`);
        await reference.putFile(image.uri);
        const url = await reference.getDownloadURL();
        newImageUrls.push(url);
      }

      firestore()
        .collection('annonces')
        .doc(listingId)
        .update({
          title,
          description,
          price: parseFloat(price),
          city,
          neighborhood,
          propertyType,
          bathrooms: parseInt(bathrooms),
          area: area ? parseFloat(area) : null,
          imageUrls: newImageUrls,
        })
        .then(() => {
          console.log('Listing updated!');
          navigation.goBack();
        });
    }
  };

  if (!listing) {
    return <Text>Loading...</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Modifier l'annonce</Text>
      <TextInput style={styles.input} placeholder="Titre" value={title} onChangeText={setTitle} />
      <TextInput style={styles.input} placeholder="Description" value={description} onChangeText={setDescription} multiline />
      <TextInput style={styles.input} placeholder="Prix" value={price} onChangeText={setPrice} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Ville" value={city} onChangeText={setCity} />
      <TextInput style={styles.input} placeholder="Quartier" value={neighborhood} onChangeText={setNeighborhood} />
      <TextInput style={styles.input} placeholder="Type de bien" value={propertyType} onChangeText={setPropertyType} />
      <TextInput style={styles.input} placeholder="Salles de bain" value={bathrooms} onChangeText={setBathrooms} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Superficie (facultatif)" value={area} onChangeText={setArea} keyboardType="numeric" />

      <Button title="Sélectionner de nouvelles photos" onPress={handleSelectImages} />
      <View style={styles.imageContainer}>
        {imageUrls.map((url, index) => (
          <Image key={index} source={{ uri: url }} style={styles.image} />
        ))}
        {images.map((image, index) => (
          <Image key={index} source={{ uri: image.uri }} style={styles.image} />
        ))}
      </View>

      <Button title="Mettre à jour l'annonce" onPress={handleUpdateListing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
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
  },
});

export default EditListingScreen;
