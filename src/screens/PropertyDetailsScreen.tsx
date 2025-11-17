import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, Alert, ScrollView, FlatList } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const PropertyDetailsScreen = ({ route }) => {
  const { propertyId } = route.params;
  const [property, setProperty] =useState(null);
  const [landlord, setLandlord] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const subscriber = firestore()
      .collection('properties')
      .doc(propertyId)
      .onSnapshot(documentSnapshot => {
        const propertyData = { id: documentSnapshot.id, ...documentSnapshot.data() };
        setProperty(propertyData);

        // Fetch landlord info
        firestore()
          .collection('users')
          .doc(propertyData.landlordId)
          .get()
          .then(landlordSnapshot => {
            setLandlord(landlordSnapshot.data());
          });
      });

    return () => subscriber();
  }, [propertyId]);

  const handleRequestVisit = async () => {
    const user = auth().currentUser;
    if (!user) {
      return Alert.alert('Error', 'You must be logged in to request a visit.');
    }

    try {
      await firestore().collection('reservations').add({
        propertyId,
        tenantId: user.uid,
        landlordId: property.landlordId,
        participantIds: [user.uid, property.landlordId],
        visitDate: new Date().toISOString(),
        status: 'pending',
        propertyTitle: property.title,
        tenantName: auth().currentUser.displayName,
      });
      Alert.alert('Success', 'Visit requested successfully.');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleSendMessage = () => {
    const user = auth().currentUser;
    if (!user) {
      return Alert.alert('Error', 'You must be logged in to send a message.');
    }
    const chatId = [user.uid, property.landlordId].sort().join('_');
    navigation.navigate('Chat', { chatId, recipientName: landlord.name });
  };

  if (!property) {
    return (
        <View className="flex-1 justify-center items-center">
            <Text>Loading...</Text>
        </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <FlatList
        data={property.images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Image source={{ uri: item.url }} className="w-screen h-64" />
        )}
      />

      <View className="p-6">
        <Text className="text-3xl font-bold text-gray-800 mb-2">{property.title}</Text>
        <Text className="text-2xl font-semibold text-blue-600 mb-4">{property.price} FCFA / month</Text>

        <View className="flex-row items-center mb-4">
          <Icon name="location-outline" size={20} color="#666" />
          <Text className="text-lg text-gray-700 ml-2">{property.location.city}, {property.location.neighborhood}</Text>
        </View>

        <Text className="text-gray-800 text-base leading-6 mb-6">{property.description}</Text>

        {/* Details Section */}
        <View className="bg-white rounded-xl p-4 shadow-md mb-6">
            <Text className="text-xl font-bold text-gray-800 mb-4">Details</Text>
            <View className="flex-row justify-around">
                 <View className="items-center">
                    <Icon name="bed-outline" size={30} color="#333" />
                    <Text className="mt-1">{property.details.rooms} Beds</Text>
                 </View>
                 <View className="items-center">
                    <Icon name="water-outline" size={30} color="#333" />
                    <Text className="mt-1">{property.details.bathrooms} Baths</Text>
                 </View>
                 <View className="items-center">
                    <Icon name="scan-outline" size={30} color="#333" />
                    <Text className="mt-1">{property.details.area} m²</Text>
                 </View>
            </View>
        </View>

        {/* Landlord Section */}
        {landlord && (
          <View className="bg-white rounded-xl p-4 shadow-md mb-6">
             <Text className="text-xl font-bold text-gray-800 mb-4">Landlord</Text>
             <View className="flex-row items-center">
                <Image source={{uri: landlord.photoURL || 'https://via.placeholder.com/150'}} className="w-16 h-16 rounded-full" />
                <Text className="ml-4 text-lg font-semibold">{landlord.name}</Text>
             </View>
          </View>
        )}

        {/* Action Buttons */}
        <View className="mt-4">
          <TouchableOpacity className="bg-blue-600 rounded-lg py-4 mb-3" onPress={handleRequestVisit}>
            <Text className="text-white text-center font-bold text-lg">Request a Visit</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-green-600 rounded-lg py-4" onPress={handleSendMessage}>
            <Text className="text-white text-center font-bold text-lg">Send a Message</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default PropertyDetailsScreen;