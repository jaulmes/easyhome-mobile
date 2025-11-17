import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { launchImageLibrary } from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';
import { updateUserDocument } from '../services/userService';

const EditProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState({ displayName: '', phone: '' });
  const [profileImageUri, setProfileImageUri] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const user = auth().currentUser;

  useEffect(() => {
    if (!user) return;

    firestore()
      .collection('users')
      .doc(user.uid)
      .get()
      .then(documentSnapshot => {
        if (documentSnapshot.exists) {
          const data = documentSnapshot.data();
          setUserData({ displayName: data.displayName, phone: data.phone || '' });
          setProfileImageUri(data.photoURL);
        }
        setLoading(false);
      });
  }, [user]);

  const handleSelectImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.7 }, (response) => {
      if (response.didCancel || response.errorCode) return;
      setProfileImageUri(response.assets[0].uri);
    });
  };

  const handleUpdateProfile = async () => {
    if (!user) return;

    setSaving(true);
    try {
      let newPhotoURL = userData.photoURL;
      // Si une nouvelle image a été sélectionnée et ce n'est pas l'ancienne URL
      if (profileImageUri && profileImageUri !== userData.photoURL) {
        const reference = storage().ref(`profileImages/${user.uid}`);
        await reference.putFile(profileImageUri);
        newPhotoURL = await reference.getDownloadURL();
      }

      const dataToUpdate = {
        displayName: userData.displayName,
        phone: userData.phone,
        photoURL: newPhotoURL,
      };

      await updateUserDocument(user.uid, dataToUpdate);
      await user.updateProfile({ displayName: userData.displayName, photoURL: newPhotoURL });

      Alert.alert('Succès', 'Votre profil a été mis à jour.');
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', 'La mise à jour a échoué.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#3D7BFF" className="flex-1 justify-center" />;
  }

  return (
    <ScrollView className="flex-1 bg-background-light p-6">
      <Text className="text-3xl font-bold text-text-primary mb-8">Modifier le profil</Text>

      <View className="items-center mb-8">
        <TouchableOpacity onPress={handleSelectImage}>
          <Image
            source={{ uri: profileImageUri || 'https://via.placeholder.com/150' }}
            className="w-32 h-32 rounded-full border-4 border-primary-light"
          />
        </TouchableOpacity>
      </View>

      <Text className="text-lg font-semibold text-gray-700 mb-2">Nom complet</Text>
      <TextInput
        className="w-full h-14 bg-white border border-gray-300 rounded-xl mb-6 px-4 text-lg"
        placeholder="Votre nom"
        value={userData.displayName}
        onChangeText={(text) => setUserData(prev => ({...prev, displayName: text}))}
        placeholderTextColor="#ADB5BD"
      />

      <Text className="text-lg font-semibold text-gray-700 mb-2">Téléphone</Text>
      <TextInput
        className="w-full h-14 bg-white border border-gray-300 rounded-xl mb-8 px-4 text-lg"
        placeholder="Votre numéro de téléphone"
        value={userData.phone}
        onChangeText={(text) => setUserData(prev => ({...prev, phone: text}))}
        keyboardType="phone-pad"
        placeholderTextColor="#ADB5BD"
      />

      <TouchableOpacity
        className={`h-16 justify-center items-center rounded-xl shadow-md ${saving ? 'bg-gray-400' : 'bg-primary'}`}
        onPress={handleUpdateProfile}
        disabled={saving}
      >
        {saving ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-xl">Enregistrer</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
};

export default EditProfileScreen;
