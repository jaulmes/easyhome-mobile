import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { getPropertyById, updateProperty } from '../../services/propertyService';
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';

const FormInput = ({ label, value, onChangeText, ...props }) => (
  <View className="mb-4">
    <Text className="text-lg font-semibold text-text-secondary mb-2">{label}</Text>
    <TextInput
      className="w-full h-14 bg-white border border-gray-300 rounded-xl px-4 text-lg text-text-primary"
      value={value}
      onChangeText={onChangeText}
      placeholderTextColor="#ADB5BD"
      {...props}
    />
  </View>
);

const EditListingScreen = ({ route, navigation }) => {
  const { propertyId } = route.params;
  const [propertyData, setPropertyData] = useState(null);
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]); // URIs locaux
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const prop = await getPropertyById(propertyId);
        setPropertyData({
          title: prop.title,
          description: prop.description,
          price: String(prop.price),
          city: prop.city,
          neighborhood: prop.neighborhood,
          propertyType: prop.propertyType,
          bedrooms: String(prop.bedrooms),
          bathrooms: String(prop.bathrooms),
          area: String(prop.area),
        });
        setExistingImages(prop.imageUrls || []);
      } catch (error) {
        Alert.alert("Erreur", "Impossible de charger les données de l'annonce.");
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [propertyId, navigation]);

  const handleInputChange = (field, value) => {
    setPropertyData(prev => ({ ...prev, [field]: value }));
  };

  const handleSelectImages = () => {
    launchImageLibrary({ mediaType: 'photo', selectionLimit: 5 - existingImages.length - newImages.length }, (response) => {
      if (response.didCancel || response.errorCode) return;
      setNewImages(prev => [...prev, ...response.assets.map(a => a.uri)]);
    });
  };

  const removeExistingImage = (url) => {
    setExistingImages(prev => prev.filter(img => img !== url));
  };

  const removeNewImage = (uri) => {
    setNewImages(prev => prev.filter(img => img !== uri));
  };

  const handleUpdateListing = async () => {
    setSaving(true);
    try {
      const dataToUpdate = {
        ...propertyData,
        price: parseFloat(propertyData.price),
        bedrooms: parseInt(propertyData.bedrooms),
        bathrooms: parseInt(propertyData.bathrooms),
        area: parseFloat(propertyData.area),
      };

      await updateProperty(propertyId, dataToUpdate, newImages, existingImages);
      Alert.alert('Succès', 'Votre annonce a été mise à jour !');
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', "La mise à jour de l'annonce a échoué.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#3D7BFF" className="flex-1 justify-center" />;
  }

  return (
    <ScrollView className="flex-1 bg-background-light" contentContainerStyle={{ padding: 16 }}>
      <Text className="text-3xl font-bold text-text-primary mb-6">Modifier l'annonce</Text>

      <FormInput label="Titre" value={propertyData.title} onChangeText={(val) => handleInputChange('title', val)} />
      {/* ... autres inputs ... */}
      <FormInput label="Description" value={propertyData.description} onChangeText={(val) => handleInputChange('description', val)} multiline />
      <FormInput label="Prix (€/mois)" value={propertyData.price} onChangeText={(val) => handleInputChange('price', val)} keyboardType="numeric" />
      <FormInput label="Ville" value={propertyData.city} onChangeText={(val) => handleInputChange('city', val)} />
      <FormInput label="Quartier" value={propertyData.neighborhood} onChangeText={(val) => handleInputChange('neighborhood', val)} />
      <FormInput label="Type de bien" value={propertyData.propertyType} onChangeText={(val) => handleInputChange('propertyType', val)} />
      <FormInput label="Nombre de pièces" value={propertyData.bedrooms} onChangeText={(val) => handleInputChange('bedrooms', val)} keyboardType="numeric" />
      <FormInput label="Salles de bain" value={propertyData.bathrooms} onChangeText={(val) => handleInputChange('bathrooms', val)} keyboardType="numeric" />
      <FormInput label="Superficie (m²)" value={propertyData.area} onChangeText={(val) => handleInputChange('area', val)} keyboardType="numeric" />


      <Text className="text-lg font-semibold text-text-secondary mb-2 mt-4">Images</Text>
      <View className="flex-row flex-wrap">
        {existingImages.map(url => (
          <View key={url} className="w-24 h-24 m-1">
            <Image source={{ uri: url }} className="w-full h-full rounded-lg" />
            <TouchableOpacity onPress={() => removeExistingImage(url)} className="absolute -top-1 -right-1 bg-danger p-1 rounded-full">
              <Icon name="close" size={16} color="white" />
            </TouchableOpacity>
          </View>
        ))}
        {newImages.map(uri => (
          <View key={uri} className="w-24 h-24 m-1">
            <Image source={{ uri }} className="w-full h-full rounded-lg" />
            <TouchableOpacity onPress={() => removeNewImage(uri)} className="absolute -top-1 -right-1 bg-danger p-1 rounded-full">
              <Icon name="close" size={16} color="white" />
            </TouchableOpacity>
          </View>
        ))}
        {existingImages.length + newImages.length < 5 &&
          <TouchableOpacity onPress={handleSelectImages} className="w-24 h-24 m-1 bg-background rounded-lg justify-center items-center border-2 border-dashed border-gray-400">
            <Icon name="add" size={32} color="#ADB5BD" />
          </TouchableOpacity>
        }
      </View>

      <TouchableOpacity
        className={`h-16 justify-center items-center rounded-xl shadow-md mt-8 ${saving ? 'bg-gray-400' : 'bg-primary'}`}
        onPress={handleUpdateListing}
        disabled={saving}
      >
        {saving ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-xl">Enregistrer</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
};

export default EditListingScreen;
