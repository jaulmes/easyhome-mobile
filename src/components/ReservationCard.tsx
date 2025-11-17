import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import auth from '@react-native-firebase/auth';

const ReservationCard = ({ reservation, onAccept, onReject }) => {
  const { propertyInfo, status, tenantName, ownerId } = reservation;
  const currentUser = auth().currentUser;
  const isOwner = currentUser && currentUser.uid === ownerId;

  const getStatusBadgeStyle = () => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <View className="bg-white rounded-lg shadow-md mb-4 p-4">
      <View className="flex-row items-center">
        <Image
          source={{ uri: propertyInfo.imageUrl || 'https://via.placeholder.com/100' }}
          className="w-20 h-20 rounded-lg"
        />
        <View className="flex-1 ml-4">
          <Text className="text-lg font-bold text-gray-800" numberOfLines={1}>{propertyInfo.title}</Text>
          <Text className="text-base text-gray-600 mt-1">
            {isOwner ? `Demandé par : ${tenantName}` : 'Votre demande de visite'}
          </Text>
          <View className={`px-2 py-1 rounded-full self-start mt-2 ${getStatusBadgeStyle()}`}>
            <Text className="text-sm font-semibold">{status}</Text>
          </View>
        </View>
      </View>

      {isOwner && status === 'pending' && (
        <View className="flex-row justify-end mt-4 border-t border-gray-200 pt-3">
          <TouchableOpacity
            onPress={onReject}
            className="bg-red-500 py-2 px-4 rounded-lg mr-2"
          >
            <Text className="text-white font-bold">Refuser</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onAccept}
            className="bg-green-500 py-2 px-4 rounded-lg"
          >
            <Text className="text-white font-bold">Accepter</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default ReservationCard;
