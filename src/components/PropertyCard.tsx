import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const PropertyCard = ({ property, onPress }) => {
  const { imageUrls, price, title, city, neighborhood, bedrooms, bathrooms, area } = property;

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-lg shadow-md mb-4 overflow-hidden"
    >
      <Image
        source={{ uri: imageUrls?.[0] || 'https://via.placeholder.com/300' }}
        className="w-full h-48"
      />
      <View className="p-4">
        <Text className="text-xl font-bold text-gray-800 mb-1">{title}</Text>
        <Text className="text-lg font-semibold text-blue-600 mb-2">{price} € / mois</Text>
        <Text className="text-base text-gray-600 mb-3">{city}, {neighborhood}</Text>

        <View className="flex-row justify-between items-center border-t border-gray-200 pt-3">
          <View className="flex-row items-center">
            <Icon name="bed-outline" size={20} color="#4A5568" />
            <Text className="ml-2 text-sm text-gray-700">{bedrooms} ch.</Text>
          </View>
          <View className="flex-row items-center">
            <Icon name="water-outline" size={20} color="#4A5568" />
            <Text className="ml-2 text-sm text-gray-700">{bathrooms} sdb.</Text>
          </View>
          <View className="flex-row items-center">
            <Icon name="resize-outline" size={20} color="#4A5568" />
            <Text className="ml-2 text-sm text-gray-700">{area} m²</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default PropertyCard;
