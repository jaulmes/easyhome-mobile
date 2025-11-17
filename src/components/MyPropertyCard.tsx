import React from 'react';
import { View, TouchableOpacity, Text, Alert } from 'react-native';
import PropertyCard from './PropertyCard';
import Icon from 'react-native-vector-icons/Ionicons';

const MyPropertyCard = ({ property, onEdit, onDelete }) => {

  const handleDeletePress = () => {
    Alert.alert(
      "Confirmer la suppression",
      "Êtes-vous sûr de vouloir supprimer cette annonce ? Cette action est irréversible.",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Supprimer", onPress: onDelete, style: "destructive" }
      ]
    );
  };

  return (
    <View>
      <PropertyCard property={property} onPress={() => { /* La navigation se fait depuis l'écran parent si nécessaire */ }} />
      <View className="flex-row justify-end p-2 bg-white -mt-4 rounded-b-lg">
        <TouchableOpacity
          onPress={onEdit}
          className="flex-row items-center bg-blue-500 py-2 px-4 rounded-lg mr-2"
        >
          <Icon name="pencil" size={20} color="white" />
          <Text className="text-white font-bold ml-2">Modifier</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleDeletePress}
          className="flex-row items-center bg-red-500 py-2 px-4 rounded-lg"
        >
          <Icon name="trash" size={20} color="white" />
          <Text className="text-white font-bold ml-2">Supprimer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MyPropertyCard;
