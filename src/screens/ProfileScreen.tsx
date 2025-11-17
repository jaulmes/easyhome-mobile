import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { signOut } from '../services/authService';
import Icon from 'react-native-vector-icons/Ionicons';

const ProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = auth().currentUser;

  useEffect(() => {
    if (!user) return;

    const subscriber = firestore()
      .collection('users')
      .doc(user.uid)
      .onSnapshot(documentSnapshot => {
        if (documentSnapshot.exists) {
          setUserData({ ...documentSnapshot.data(), email: user.email });
        } else {
          setUserData({ email: user.email, displayName: user.displayName || 'Utilisateur inconnu' });
        }
        setLoading(false);
      });

    return () => subscriber();
  }, [user]);

  if (loading) {
    return <ActivityIndicator size="large" color="#3D7BFF" className="flex-1 justify-center" />;
  }

  const InfoRow = ({ icon, label, value }) => (
    <View className="flex-row items-center bg-white p-4 rounded-xl mb-3">
      <Icon name={icon} size={24} color="#3D7BFF" />
      <View className="ml-4">
        <Text className="text-sm text-text-secondary">{label}</Text>
        <Text className="text-lg text-text-primary font-medium">{value}</Text>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-background-light">
      <View className="items-center p-8 bg-white shadow-md">
        <Image
          source={{ uri: userData?.photoURL || 'https://via.placeholder.com/150' }}
          className="w-32 h-32 rounded-full border-4 border-primary-light"
        />
        <Text className="text-3xl font-bold text-text-primary mt-4">{userData?.displayName}</Text>
        <Text className="text-base text-text-secondary capitalize">{userData?.role}</Text>
      </View>

      <View className="p-5">
        <InfoRow icon="mail-outline" label="Email" value={userData?.email} />
        <InfoRow icon="call-outline" label="Téléphone" value={userData?.phone || 'Non renseigné'} />

        <TouchableOpacity
          className="bg-primary h-14 justify-center items-center rounded-xl mt-6 shadow-md"
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Text className="text-white font-bold text-lg">Modifier le profil</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-danger h-14 justify-center items-center rounded-xl mt-4 shadow-md"
          onPress={signOut}
        >
          <Text className="text-white font-bold text-lg">Déconnexion</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProfileScreen;
