import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import PropertyCard from '../components/PropertyCard';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const MyPropertiesScreen = () => {
  const [properties, setProperties] = useState([]);
  const navigation = useNavigation();
  const user = auth().currentUser;

  useEffect(() => {
    if (user) {
      const subscriber = firestore()
        .collection('properties')
        .where('landlordId', '==', user.uid)
        .onSnapshot(querySnapshot => {
          const properties = [];
          querySnapshot.forEach(documentSnapshot => {
            properties.push({
              id: documentSnapshot.id,
              ...documentSnapshot.data(),
            });
          });
          setProperties(properties);
        });

      return () => subscriber();
    }
  }, [user]);

  const handleDelete = (propertyId) => {
    Alert.alert(
      "Delete Property",
      "Are you sure you want to delete this property?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "OK",
          onPress: () => {
            firestore().collection('properties').doc(propertyId).delete()
              .then(() => Alert.alert('Success', 'Property deleted successfully.'))
              .catch(error => Alert.alert('Error', error.message));
          }
        }
      ]
    );
  };

  const handleEdit = (property) => {
    navigation.navigate('EditProperty', { property });
  };

  const renderItem = ({ item }) => (
    <View>
      <PropertyCard property={item} />
      <View className="flex-row justify-end p-2 -mt-4">
         <TouchableOpacity onPress={() => handleEdit(item)} className="bg-blue-500 p-2 rounded-full mr-2">
            <Icon name="pencil" size={20} color="white" />
         </TouchableOpacity>
         <TouchableOpacity onPress={() => handleDelete(item.id)} className="bg-red-500 p-2 rounded-full">
            <Icon name="trash" size={20} color="white" />
         </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <View className="p-4 bg-white border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-800">My Properties</Text>
      </View>
      <FlatList
        data={properties}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
};

export default MyPropertiesScreen;