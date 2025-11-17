import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const PropertyCard = ({ property, onPress }) => {
  const { imageUrls, price, title, city, neighborhood, bedrooms, bathrooms, area } = property;

  const DetailItem = ({ icon, text }) => (
    <View className="flex-row items-center bg-background-light px-3 py-1 rounded-full">
      <Icon name={icon} size={18} color="#495057" />
      <Text className="ml-2 text-sm text-text-secondary font-medium">{text}</Text>
    </View>
  );

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden"
      style={{ elevation: 5 }} // Ajoute une ombre plus prononcée sur Android
    >
      <Image
        source={{ uri: imageUrls?.[0] || 'https://via.placeholder.com/400' }}
        className="w-full h-56"
      />
      <View className="p-5">
        <Text className="text-2xl font-bold text-text-primary" numberOfLines={1}>{title}</Text>
        <Text className="text-lg text-text-secondary mt-1">{city}, {neighborhood}</Text>

        <View className="flex-row justify-between items-center mt-4">
          <DetailItem icon="bed-outline" text={`${bedrooms} ch.`} />
          <DetailItem icon="water-outline" text={`${bathrooms} sdb.`} />
          <DetailItem icon="resize-outline" text={`${area} m²`} />
        </View>

        <View className="border-t border-gray-200 mt-4 pt-4">
          <Text className="text-2xl font-bold text-primary">{price} €
            <Text className="text-lg font-normal text-text-secondary"> / mois</Text>
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default PropertyCard;
