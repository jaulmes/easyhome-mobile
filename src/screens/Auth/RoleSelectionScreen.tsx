import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import { updateUserDocument } from '../../services/userService';

const RoleSelectionScreen = () => {
  const [selectedRole, setSelectedRole] = useState(null);

  const handleContinue = async () => {
    if (!selectedRole) {
      Alert.alert('Erreur', 'Veuillez sélectionner un rôle.');
      return;
    }

    const user = auth().currentUser;
    if (user) {
      try {
        await updateUserDocument(user.uid, { role: selectedRole });
        console.log('User role updated!');
        // Le changement de rôle devrait déclencher le listener d'état global
        // et rediriger l'utilisateur vers l'écran principal.
      } catch (error) {
        console.error("Erreur lors de la mise à jour du rôle :", error);
        Alert.alert('Erreur', 'Impossible de sauvegarder votre rôle.');
      }
    }
  };

  return (
    <View className="flex-1 justify-center items-center p-5 bg-gray-100">
      <Text className="text-3xl font-bold mb-8 text-center text-gray-800">
        Quel est votre rôle ?
      </Text>

      <TouchableOpacity
        className={`w-full h-20 justify-center items-center rounded-lg mb-4 border-2 ${selectedRole === 'tenant' ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}
        onPress={() => setSelectedRole('tenant')}
      >
        <Text className={`text-xl font-bold ${selectedRole === 'tenant' ? 'text-white' : 'text-gray-800'}`}>
          Je suis locataire
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className={`w-full h-20 justify-center items-center rounded-lg mb-8 border-2 ${selectedRole === 'landlord' ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}
        onPress={() => setSelectedRole('landlord')}
      >
        <Text className={`text-xl font-bold ${selectedRole === 'landlord' ? 'text-white' : 'text-gray-800'}`}>
          Je suis bailleur
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="w-full h-14 bg-green-500 justify-center items-center rounded-lg"
        onPress={handleContinue}
        disabled={!selectedRole}
      >
        <Text className="text-white text-lg font-bold">Continuer</Text>
      </TouchableOpacity>
    </View>
  );
};

export default RoleSelectionScreen;
