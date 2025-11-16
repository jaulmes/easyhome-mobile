import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { getPropertyById, updateProperty } from '../../services/propertyService';

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

const EditListingScreen = ({ route, navigation }) => {
  const { propertyId } = route.params;
  const [propertyData, setPropertyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const prop = await getPropertyById(propertyId);
        // Convertir les nombres en chaînes pour les champs de texte
        const stringifiedProp = Object.entries(prop).reduce((acc, [key, value]) => {
            acc[key] = value !== null && value !== undefined ? String(value) : '';
            return acc;
        }, {});
        setPropertyData(stringifiedProp);
      } catch (error) {
        console.error(error);
        Alert.alert("Erreur", "Impossible de charger les données de l'annonce.");
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [propertyId, navigation]);

  const handleInputChange = (field, value) => {
    setPropertyData({ ...propertyData, [field]: value });
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
      // Retirer les champs non modifiables
      delete dataToUpdate.id;
      delete dataToUpdate.ownerId;
      delete dataToUpdate.createdAt;

      await updateProperty(propertyId, dataToUpdate);
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
    return <ActivityIndicator size="large" color="#007AFF" className="flex-1 justify-center" />;
  }

  if (!propertyData) return null;

  return (
    <ScrollView className="flex-1 bg-gray-100" contentContainerStyle={{ padding: 16 }}>
      <Text className="text-3xl font-bold text-gray-800 mb-6">Modifier l'annonce</Text>

      <FormInput label="Titre" value={propertyData.title} onChangeText={(val) => handleInputChange('title', val)} />
      <FormInput label="Description" value={propertyData.description} onChangeText={(val) => handleInputChange('description', val)} multiline />
      <FormInput label="Prix (€/mois)" value={propertyData.price} onChangeText={(val) => handleInputChange('price', val)} keyboardType="numeric" />
      <FormInput label="Ville" value={propertyData.city} onChangeText={(val) => handleInputChange('city', val)} />
      <FormInput label="Quartier" value={propertyData.neighborhood} onChangeText={(val) => handleInputChange('neighborhood', val)} />
      <FormInput label="Type de bien" value={propertyData.propertyType} onChangeText={(val) => handleInputChange('propertyType', val)} />
      <FormInput label="Nombre de pièces" value={propertyData.bedrooms} onChangeText={(val) => handleInputChange('bedrooms', val)} keyboardType="numeric" />
      <FormInput label="Salles de bain" value={propertyData.bathrooms} onChangeText={(val) => handleInputChange('bathrooms', val)} keyboardType="numeric" />
      <FormInput label="Superficie (m²)" value={propertyData.area} onChangeText={(val) => handleInputChange('area', val)} keyboardType="numeric" />

      <Text className="text-gray-600 my-4">La modification des images n'est pas encore disponible.</Text>

      <TouchableOpacity
        className={`h-16 justify-center items-center rounded-lg ${saving ? 'bg-gray-400' : 'bg-green-500'}`}
        onPress={handleUpdateListing}
        disabled={saving}
      >
        {saving ? <ActivityIndicator size="small" color="#fff" /> : <Text className="text-white font-bold text-xl">Enregistrer les modifications</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
};

export default EditListingScreen;
