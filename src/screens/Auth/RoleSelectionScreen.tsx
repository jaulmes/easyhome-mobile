import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import auth from '@react-native-firebase/auth';
import { updateUserDocument } from '../../services/userService';
import Icon from 'react-native-vector-icons/Ionicons';

const RoleSelectionScreen = () => {
  const [selectedRole, setSelectedRole] = useState(null); // 'tenant' or 'landlord'
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!selectedRole) {
      Alert.alert('Sélection requise', 'Veuillez sélectionner un rôle pour continuer.');
      return;
    }

    const user = auth().currentUser;
    if (user) {
      setLoading(true);
      try {
        await updateUserDocument(user.uid, { role: selectedRole });
        // La navigation se fera automatiquement via le listener dans App.tsx
      } catch (error) {
        Alert.alert('Erreur', 'Impossible de sauvegarder votre rôle. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    }
  };

  const RoleOption = ({ role, title, icon, description }) => (
    <TouchableOpacity
      className={`border-2 rounded-xl p-6 mb-6 ${selectedRole === role ? 'bg-primary-light border-primary' : 'bg-white border-gray-300'}`}
      onPress={() => setSelectedRole(role)}
    >
      <View className="flex-row items-center">
        <Icon name={icon} size={40} color={selectedRole === role ? '#FFFFFF' : '#3D7BFF'} />
        <View className="ml-4">
          <Text className={`text-2xl font-bold ${selectedRole === role ? 'text-white' : 'text-text-primary'}`}>{title}</Text>
          <Text className={`mt-1 text-base ${selectedRole === role ? 'text-white' : 'text-text-secondary'}`}>{description}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 justify-center p-6 bg-background-light">
      <View className="items-center mb-12">
        <Text className="text-3xl font-bold text-text-primary text-center">Presque terminé !</Text>
        <Text className="text-lg text-text-secondary mt-2 text-center">Comment utiliserez-vous EasyHome ?</Text>
      </View>

      <RoleOption
        role="tenant"
        title="Je suis locataire"
        icon="key-outline"
        description="Pour chercher et louer un bien"
      />

      <RoleOption
        role="landlord"
        title="Je suis bailleur"
        icon="home-outline"
        description="Pour publier et gérer mes annonces"
      />

      <TouchableOpacity
        className="w-full h-14 bg-primary justify-center items-center rounded-xl shadow-md mt-8"
        onPress={handleContinue}
        disabled={loading || !selectedRole}
      >
        {loading ? <ActivityIndicator color="white" /> : <Text className="text-white text-lg font-bold">Continuer</Text>}
      </TouchableOpacity>
    </View>
  );
};

export default RoleSelectionScreen;
