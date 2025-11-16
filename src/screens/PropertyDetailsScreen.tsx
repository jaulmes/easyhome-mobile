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
        // Lancer les deux appels en parallèle
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

  if (loading) {
    return <ActivityIndicator size="large" color="#007AFF" className="flex-1 justify-center items-center" />;
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-5">
        <Text className="text-red-500 text-lg text-center">{error}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} className="mt-4">
          <Text className="text-blue-600 font-bold">Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!property) return null;

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

  const { title, description, price, city, neighborhood, bedrooms, bathrooms, area, amenities, ownerName, ownerAvatar, imageUrls } = property;

  return (
    <ScrollView className="flex-1 bg-gray-100">
      <Image source={{ uri: imageUrls?.[0] || 'https://via.placeholder.com/400' }} className="w-full h-64" />

      <View className="p-4 bg-white">
        <Text className="text-3xl font-bold text-gray-800">{title}</Text>
        <Text className="text-2xl font-semibold text-blue-600 my-2">{price} € / mois</Text>
        <Text className="text-lg text-gray-600">{city}, {neighborhood}</Text>
      </View>

      {/* ... autres sections ... */}
       <View className="p-4 mt-2 bg-white flex-row justify-around">
        <View className="items-center"><Icon name="bed-outline" size={24} /><Text>{bedrooms} ch.</Text></View>
        <View className="items-center"><Icon name="water-outline" size={24} /><Text>{bathrooms} sdb.</Text></View>
        <View className="items-center"><Icon name="resize-outline" size={24} /><Text>{area} m²</Text></View>
      </View>

      <View className="p-4 mt-2 bg-white">
        <Text className="text-xl font-bold mb-2">Description</Text>
        <Text className="text-base text-gray-700">{description}</Text>
      </View>

      <View className="p-4 mt-2 bg-white">
        <Text className="text-xl font-bold mb-3">Propriétaire</Text>
        <TouchableOpacity className="flex-row items-center">
          <Image source={{ uri: ownerAvatar || 'https://via.placeholder.com/50' }} className="w-16 h-16 rounded-full" />
          <Text className="ml-4 text-lg font-semibold">{ownerName}</Text>
        </TouchableOpacity>
      </View>

      <View className="p-4 mt-2 flex-row justify-between">
        <TouchableOpacity
          className="flex-1 bg-green-500 h-14 justify-center items-center rounded-lg mr-2"
          onPress={handleRequestVisit}
        >
          <Text className="text-white font-bold text-lg">Demander une visite</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 bg-blue-600 h-14 justify-center items-center rounded-lg ml-2"
          onPress={() => navigation.navigate('Chat', { otherUserId: property.ownerId, otherUserName: ownerName })}
        >
          <Text className="text-white font-bold text-lg">Envoyer un message</Text>
        </TouchableOpacity>
      </View>

      {similarProperties.length > 0 && (
        <View className="p-4 mt-2 bg-white">
          <Text className="text-xl font-bold mb-4">Vous pourriez aussi aimer</Text>
          <FlatList
            data={similarProperties}
            renderItem={({ item }) => (
              <SuggestedPropertyCard
                property={item}
                onPress={() => navigation.push('PropertyDetails', { propertyId: item.id })}
              />
            )}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>
      )}
    </ScrollView>
  );
};

export default PropertyDetailsScreen;
