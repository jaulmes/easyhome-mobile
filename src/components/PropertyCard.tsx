import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const PropertyCard = ({ property }) => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      className="bg-white rounded-xl shadow-lg overflow-hidden mb-6"
      onPress={() => navigation.navigate('PropertyDetails', { propertyId: property.id })}
    >
      <Image
        source={{ uri: property.images[0]?.url || 'https://via.placeholder.com/400x200' }}
        className="w-full h-48"
      />
      <View className="p-4">
        <Text className="text-xl font-bold text-gray-800 mb-1">{property.title}</Text>
        <Text className="text-lg font-semibold text-blue-600 mb-2">{property.price} FCFA / month</Text>
        <View className="flex-row items-center mb-2">
          <Icon name="location-outline" size={16} color="#666" />
          <Text className="text-gray-600 ml-2">{property.location.city}, {property.location.neighborhood}</Text>
        </View>
        <View className="flex-row justify-between mt-2">
          <View className="flex-row items-center">
            <Icon name="bed-outline" size={20} color="#666" />
            <Text className="ml-2 text-gray-700">{property.details.rooms} Beds</Text>
          </View>
          <View className="flex-row items-center">
            <Icon name="water-outline" size={20} color="#666" />
            <Text className="ml-2 text-gray-700">{property.details.bathrooms} Baths</Text>
          </View>
          <View className="flex-row items-center">
            <Icon name="scan-outline" size={20} color="#666" />
            <Text className="ml-2 text-gray-700">{property.details.area} m²</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default PropertyCard;