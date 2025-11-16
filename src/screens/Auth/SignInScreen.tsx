import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { signIn, signInWithGoogle } from '../../services/authService';

const SignInScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }
    try {
      await signIn(email, password);
      console.log('User signed in!');
      // La navigation se fera via le listener d'état d'authentification
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur de connexion', error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      console.log('User signed in with Google!');
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur de connexion', "Une erreur est survenue lors de la connexion avec Google.");
    }
  };

  return (
    <View className="flex-1 justify-center items-center p-5 bg-gray-100">
      <Text className="text-4xl font-bold mb-8 text-gray-800">Bienvenue !</Text>

      <TextInput
        className="w-full h-14 bg-white border border-gray-300 rounded-lg mb-4 px-4 text-lg text-gray-800"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholderTextColor="#A9A9A9"
      />

      <TextInput
        className="w-full h-14 bg-white border border-gray-300 rounded-lg mb-6 px-4 text-lg text-gray-800"
        placeholder="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="#A9A9A9"
      />

      <TouchableOpacity
        className="w-full h-14 bg-blue-600 justify-center items-center rounded-lg mb-4"
        onPress={handleSignIn}
      >
        <Text className="text-white text-lg font-bold">Se connecter</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="w-full h-14 bg-red-500 justify-center items-center rounded-lg mb-4"
        onPress={handleGoogleSignIn}
      >
        <Text className="text-white text-lg font-bold">Continuer avec Google</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
        <Text className="text-blue-600 mt-4 text-base">Vous n'avez pas de compte ? S'inscrire</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SignInScreen;
