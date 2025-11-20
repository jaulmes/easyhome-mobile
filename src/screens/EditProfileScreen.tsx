import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';

const EditProfileScreen = ({ route }) => {
  const { userProfile, privateData } = route.params;
  const [name, setName] = useState(userProfile.name);
  const [phoneNumber, setPhoneNumber] = useState(privateData.phoneNumber || '');
  const navigation = useNavigation();
  const user = auth().currentUser;

  const handleUpdateProfile = async () => {
    if (!user) return;

    try {
      // Update public profile
      await firestore().collection('users').doc(user.uid).update({
        name,
      });

      // Update private data
      const privateDocs = await firestore().collection('users').doc(user.uid).collection('private').get();
      if (!privateDocs.empty) {
        const privateDocId = privateDocs.docs[0].id;
        await firestore().collection('users').doc(user.uid).collection('private').doc(privateDocId).update({
          phoneNumber,
        });
      }

      Alert.alert('Success', 'Profile updated successfully.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 p-6">
      <Text className="text-3xl font-bold text-gray-800 mb-6">Edit Profile</Text>

      <TextInput
        className="bg-white border border-gray-300 rounded-lg px-4 py-3 mb-4"
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        className="bg-white border border-gray-300 rounded-lg px-4 py-3 mb-6"
        placeholder="Phone Number"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
      />

      <TouchableOpacity
        className="bg-blue-600 rounded-lg py-4"
        onPress={handleUpdateProfile}
      >
        <Text className="text-white text-center font-bold text-lg">Update Profile</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default EditProfileScreen;