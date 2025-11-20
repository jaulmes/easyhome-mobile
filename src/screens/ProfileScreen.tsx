import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, FlatList } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import PropertyCard from '../components/PropertyCard';
import Icon from 'react-native-vector-icons/Ionicons';

const ProfileScreen = ({ route }) => {
  const navigation = useNavigation();
  const userId = route.params?.userId || auth().currentUser?.uid;
  const [userProfile, setUserProfile] = useState(null);
  const [privateData, setPrivateData] = useState(null);
  const [userProperties, setUserProperties] = useState([]);

  useEffect(() => {
    if (!userId) return;

    const userSubscriber = firestore()
      .collection('users')
      .doc(userId)
      .onSnapshot(documentSnapshot => {
        setUserProfile(documentSnapshot.data());
      });

    const propertiesSubscriber = firestore()
      .collection('properties')
      .where('landlordId', '==', userId)
      .onSnapshot(querySnapshot => {
        const properties = [];
        querySnapshot.forEach(documentSnapshot => {
          properties.push({
            id: documentSnapshot.id,
            ...documentSnapshot.data(),
          });
        });
        setUserProperties(properties);
      });

    let privateSubscriber = () => {};
    if (userId === auth().currentUser?.uid) {
      privateSubscriber = firestore()
        .collection('users')
        .doc(userId)
        .collection('private')
        .onSnapshot(querySnapshot => {
          if (!querySnapshot.empty) {
            setPrivateData(querySnapshot.docs[0].data());
          }
        });
    }

    return () => {
      userSubscriber();
      propertiesSubscriber();
      privateSubscriber();
    };
  }, [userId]);

  if (!userProfile) {
    return <View className="flex-1 justify-center items-center"><Text>Loading profile...</Text></View>;
  }

  const isOwnProfile = userId === auth().currentUser?.uid;

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white p-6 shadow-md">
        <View className="flex-row items-center">
            <Image
              source={{ uri: userProfile.photoURL || 'https://via.placeholder.com/150' }}
              className="w-24 h-24 rounded-full"
            />
            <View className="ml-6 flex-1">
                <Text className="text-2xl font-bold text-gray-800">{userProfile.name}</Text>
                <Text className="text-gray-600 capitalize">{userProfile.role}</Text>
                <Text className="text-gray-500 text-sm mt-1">Member since: {userProfile.registrationDate?.toDate().toLocaleDateString()}</Text>
            </View>
        </View>
        {isOwnProfile && privateData && (
          <View className="mt-6">
            <View className="flex-row items-center mb-2">
                <Icon name="mail-outline" size={20} color="#666" />
                <Text className="ml-3 text-gray-700">{privateData.email}</Text>
            </View>
            <View className="flex-row items-center">
                <Icon name="call-outline" size={20} color="#666" />
                <Text className="ml-3 text-gray-700">{privateData.phoneNumber || 'Not provided'}</Text>
            </View>
          </View>
        )}
      </View>

      {isOwnProfile && (
        <View className="p-4 mt-2">
             <TouchableOpacity
                className="bg-blue-500 py-3 rounded-lg mb-3"
                onPress={() => navigation.navigate('EditProfile', { userProfile, privateData })}>
                <Text className="text-white text-center font-bold">Edit Profile</Text>
             </TouchableOpacity>
             <TouchableOpacity
                className="bg-red-500 py-3 rounded-lg"
                onPress={() => auth().signOut()}>
                <Text className="text-white text-center font-bold">Sign Out</Text>
             </TouchableOpacity>
        </View>
      )}

      {userProfile.role === 'landlord' && (
        <>
          <Text className="text-xl font-bold p-4 text-gray-800 mt-2">
            {isOwnProfile ? 'My Listings' : `${userProfile.name}'s Listings`}
          </Text>
          <FlatList
            data={userProperties}
            renderItem={({ item }) => <PropertyCard property={item} />}
            keyExtractor={item => item.id}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          />
        </>
      )}
    </View>
  );
};

export default ProfileScreen;