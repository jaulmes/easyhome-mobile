import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { addProperty } from '../../services/propertyService';

const FormInput = ({ label, value, onChangeText, placeholder, keyboardType = 'default', multiline = false }) => (
  <View className="mb-4">
    <Text className="text-lg font-semibold text-gray-700 mb-2">{label}</Text>
    <TextInput
      className="w-full h-14 bg-white border border-gray-300 rounded-lg px-4 text-lg"
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      multiline={multiline}
      placeholderTextColor="#A9A9A9"
    />
  </View>
);

const AddListingScreen = ({ navigation }) => {
  const [propertyData, setPropertyData] = useState({
    title: '',
    description: '',
    price: '',
    city: '',
    neighborhood: '',
    propertyType: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
  });
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleInputChange = (field, value) => {
    setPropertyData({ ...propertyData, [field]: value });
  };

  const handleSelectImages = () => {
    launchImageLibrary({ mediaType: 'photo', selectionLimit: 5, quality: 0.7 }, (response) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert("Erreur", "Une erreur est survenue lors de la sélection des images.");
        return;
      }
      setImages(response.assets.map(asset => asset.uri));
    });
  };

  const handleAddListing = async () => {
    // Validation simple
    for (const key in propertyData) {
      if (!propertyData[key]) {
        Alert.alert('Champ requis', `Veuillez remplir le champ : ${key}`);
        return;
      }
    }
    if (images.length === 0) {
      Alert.alert('Images requises', 'Veuillez sélectionner au moins une image.');
      return;
    }

    setUploading(true);
    try {
      const dataToSave = {
        ...propertyData,
        price: parseFloat(propertyData.price),
        bedrooms: parseInt(propertyData.bedrooms),
        bathrooms: parseInt(propertyData.bathrooms),
        area: parseFloat(propertyData.area),
      };
      await addProperty(dataToSave, images);
      Alert.alert('Succès', 'Votre annonce a été publiée !');
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', "Une erreur est survenue lors de la publication de l'annonce.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-100" contentContainerStyle={{ padding: 16 }}>
      <Text className="text-3xl font-bold text-gray-800 mb-6">Publier une annonce</Text>

      <FormInput label="Titre" value={propertyData.title} onChangeText={(val) => handleInputChange('title', val)} placeholder="Ex: Bel appartement en centre-ville" />
      <FormInput label="Description" value={propertyData.description} onChangeText={(val) => handleInputChange('description', val)} placeholder="Décrivez votre bien en détail" multiline />
      <FormInput label="Prix (€/mois)" value={propertyData.price} onChangeText={(val) => handleInputChange('price', val)} placeholder="1200" keyboardType="numeric" />
      <FormInput label="Ville" value={propertyData.city} onChangeText={(val) => handleInputChange('city', val)} placeholder="Paris" />
      <FormInput label="Quartier" value={propertyData.neighborhood} onChangeText={(val) => handleInputChange('neighborhood', val)} placeholder="Le Marais" />
      <FormInput label="Type de bien" value={propertyData.propertyType} onChangeText={(val) => handleInputChange('propertyType', val)} placeholder="Appartement, Maison..." />
      <FormInput label="Nombre de pièces" value={propertyData.bedrooms} onChangeText={(val) => handleInputChange('bedrooms', val)} placeholder="3" keyboardType="numeric" />
      <FormInput label="Salles de bain" value={propertyData.bathrooms} onChangeText={(val) => handleInputChange('bathrooms', val)} placeholder="2" keyboardType="numeric" />
      <FormInput label="Superficie (m²)" value={propertyData.area} onChangeText={(val) => handleInputChange('area', val)} placeholder="75" keyboardType="numeric" />

      <TouchableOpacity className="bg-blue-500 p-4 rounded-lg mb-4 items-center" onPress={handleSelectImages}>
        <Text className="text-white font-bold text-lg">Sélectionner des photos</Text>
      </TouchableOpacity>

      <View className="flex-row flex-wrap mb-4">
        {images.map((uri, index) => (
          <Image key={index} source={{ uri }} className="w-24 h-24 rounded-lg m-1" />
        ))}
      </View>

      <TouchableOpacity
        className={`h-16 justify-center items-center rounded-lg ${uploading ? 'bg-gray-400' : 'bg-green-500'}`}
        onPress={handleAddListing}
        disabled={uploading}
      >
        {uploading ? <ActivityIndicator size="small" color="#fff" /> : <Text className="text-white font-bold text-xl">Publier</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
};

export default AddListingScreen;
