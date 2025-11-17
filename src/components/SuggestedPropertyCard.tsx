import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';

const SuggestedPropertyCard = ({ property, onPress }) => {
  const { imageUrls, price, title } = property;

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-lg shadow-md mr-4 w-64 overflow-hidden"
    >
      <Image
        source={{ uri: imageUrls?.[0] || 'https://via.placeholder.com/200' }}
        className="w-full h-32"
      />
      <View className="p-3">
        <Text className="text-base font-bold text-gray-800" numberOfLines={1}>{title}</Text>
        <Text className="text-sm font-semibold text-blue-600 mt-1">{price} € / mois</Text>
      </View>
    </TouchableOpacity>
  );
};

export default SuggestedPropertyCard;
