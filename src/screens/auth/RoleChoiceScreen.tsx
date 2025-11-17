import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const RoleChoiceScreen = () => {
  const handleRoleSelection = async (role) => {
    try {
      const user = auth().currentUser;
      if (user) {
        await firestore().collection('users').doc(user.uid).update({
          role,
        });
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-white p-8">
      <Text className="text-4xl font-bold text-gray-800 mb-8 text-center">Choose Your Role</Text>

      <TouchableOpacity
        className="w-full bg-blue-600 rounded-lg py-4 mb-4"
        onPress={() => handleRoleSelection('tenant')}
      >
        <Text className="text-white text-center font-bold text-xl">I am a Tenant</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="w-full bg-green-600 rounded-lg py-4"
        onPress={() => handleRoleSelection('landlord')}
      >
        <Text className="text-white text-center font-bold text-xl">I am a Landlord</Text>
      </TouchableOpacity>
    </View>
  );
};

export default RoleChoiceScreen;