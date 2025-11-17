import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, ActivityIndicator, TouchableOpacity, Alert, FlatList } from 'react-native';
import { getPropertyById } from '../services/propertyService';
import { findSimilarProperties } from '../services/genkitService';
import { createReservation } from '../services/reservationService';
import Icon from 'react-native-vector-icons/Ionicons';
import SuggestedPropertyCard from '../components/SuggestedPropertyCard';

const PropertyDetailsScreen = ({ route, navigation }) => {
  const { propertyId } = route.params;
  const [property, setProperty] = useState(null);
  const [similarProperties, setSimilarProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [prop, similar] = await Promise.all([
          getPropertyById(propertyId),
          findSimilarProperties(propertyId)
        ]);
        setProperty(prop);
        setSimilarProperties(similar);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger les données de l'annonce.");
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [propertyId]);

  const handleRequestVisit = async () => {
    try {
      const propertyInfo = {
        title: property.title,
        imageUrl: property.imageUrls?.[0] || '',
      };
      await createReservation(propertyId, property.ownerId, propertyInfo);
      Alert.alert("Succès", "Votre demande de visite a été envoyée au propriétaire.");
    } catch (error) {
      console.error(error);
      Alert.alert("Erreur", "Une erreur est survenue lors de l'envoi de votre demande.");
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#3D7BFF" className="flex-1 justify-center items-center" />;
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-5 bg-background-light">
        <Text className="text-danger text-lg text-center">{error}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} className="mt-4 bg-primary p-3 rounded-lg">
          <Text className="text-white font-bold">Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!property) return null;

  const { title, description, price, city, neighborhood, bedrooms, bathrooms, area, ownerName, ownerAvatar, imageUrls } = property;

  const DetailItem = ({ icon, text, label }) => (
    <View className="items-center p-3 bg-background-light rounded-xl flex-1 mx-1">
      <Icon name={icon} size={28} color="#3D7BFF" />
      <Text className="text-lg font-bold text-text-primary mt-1">{text}</Text>
      <Text className="text-sm text-text-secondary">{label}</Text>
    </View>
  );

  return (
    <View className="flex-1 bg-background">
      <ScrollView>
        <Image source={{ uri: imageUrls?.[0] || 'https://via.placeholder.com/400' }} className="w-full h-72" />
        <TouchableOpacity onPress={() => navigation.goBack()} className="absolute top-12 left-4 bg-white/70 p-2 rounded-full">
            <Icon name="arrow-back" size={28} color="#000" />
        </TouchableOpacity>

        <View className="p-5 bg-white rounded-t-3xl -mt-6">
          <Text className="text-3xl font-bold text-text-primary">{title}</Text>
          <Text className="text-lg text-text-secondary mt-1">{city}, {neighborhood}</Text>
        </View>

        <View className="px-5 py-4 mt-2 bg-white flex-row justify-between">
          <DetailItem icon="bed-outline" text={bedrooms} label="Pièces" />
          <DetailItem icon="water-outline" text={bathrooms} label="S. de bain" />
          <DetailItem icon="resize-outline" text={`${area} m²`} label="Surface" />
        </View>

        <View className="p-5 mt-2 bg-white">
          <Text className="text-2xl font-bold mb-2 text-text-primary">Description</Text>
          <Text className="text-base text-text-secondary leading-6">{description}</Text>
        </View>

        <View className="p-5 mt-2 bg-white">
          <Text className="text-2xl font-bold mb-4 text-text-primary">Propriétaire</Text>
          <TouchableOpacity className="flex-row items-center">
            <Image source={{ uri: ownerAvatar || 'https://via.placeholder.com/50' }} className="w-16 h-16 rounded-full" />
            <Text className="ml-4 text-xl font-semibold text-text-primary">{ownerName}</Text>
          </TouchableOpacity>
        </View>

        {similarProperties.length > 0 && (
          <View className="py-5 mt-2 bg-white">
            <Text className="text-2xl font-bold mb-4 text-text-primary px-5">Vous pourriez aussi aimer</Text>
            <FlatList
              data={similarProperties}
              renderItem={({ item }) => (<SuggestedPropertyCard property={item} onPress={() => navigation.push('PropertyDetails', { propertyId: item.id })} />)}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
            />
          </View>
        )}
      </ScrollView>

      <View className="flex-row justify-between items-center p-4 bg-white border-t border-gray-200">
        <Text className="text-3xl font-bold text-primary">{price} € <Text className="text-lg font-normal text-text-secondary">/ mois</Text></Text>
        <TouchableOpacity
          className="bg-primary h-14 justify-center items-center rounded-xl px-6 shadow-md"
          onPress={handleRequestVisit}
        >
          <Text className="text-white font-bold text-lg">Demander une visite</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PropertyDetailsScreen;
