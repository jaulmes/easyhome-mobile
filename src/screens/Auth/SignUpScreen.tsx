import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { signUp, signInWithGoogle } from '../../services/authService';
import { createUserDocument } from '../../services/userService';

const SignUpScreen = ({ navigation }) => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async () => {
    if (!displayName || !email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }
    try {
      const userCredential = await signUp(email, password);
      const user = userCredential.user;

      await user.updateProfile({ displayName });

      const userData = {
        uid: user.uid,
        displayName,
        email: user.email,
        role: null,
        createdAt: new Date(),
      };
      await createUserDocument(user.uid, userData);

      console.log('User account created & signed in!');
    } catch (error) {
      console.error(error);
      Alert.alert("Erreur d'inscription", error.message);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const userCredential = await signInWithGoogle();
      const user = userCredential.user;

      // La logique de création de document doit être idempotente
      // pour gérer les cas où l'utilisateur existe déjà.
      const userData = {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        role: null, // Sera écrasé si le document existe déjà avec un rôle
        createdAt: new Date(),
      };
      await createUserDocument(user.uid, userData, { merge: true });

      console.log('User signed up with Google!');
    } catch (error) {
      console.error(error);
      Alert.alert("Erreur d'inscription", "Une erreur est survenue lors de l'inscription avec Google.");
    }
  };

  return (
    <View className="flex-1 justify-center items-center p-5 bg-gray-100">
      <Text className="text-4xl font-bold mb-8 text-gray-800">Créer un compte</Text>

      <TextInput
        className="w-full h-14 bg-white border border-gray-300 rounded-lg mb-4 px-4 text-lg text-gray-800"
        placeholder="Nom complet"
        value={displayName}
        onChangeText={setDisplayName}
        placeholderTextColor="#A9A9A9"
      />
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
        onPress={handleSignUp}
      >
        <Text className="text-white text-lg font-bold">Créer un compte</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="w-full h-14 bg-red-500 justify-center items-center rounded-lg mb-4"
        onPress={handleGoogleSignUp}
      >
        <Text className="text-white text-lg font-bold">S'inscrire avec Google</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
        <Text className="text-blue-600 mt-4 text-base">Vous avez déjà un compte ? Se connecter</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SignUpScreen;
