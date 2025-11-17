import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { signUp, signInWithGoogle } from '../../services/authService';
import { createUserDocument } from '../../services/userService';
import Icon from 'react-native-vector-icons/Ionicons';

const SignUpScreen = ({ navigation }) => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(null); // 'email', 'google', or null

  const handleSignUp = async () => {
    if (!displayName || !email || !password) {
      Alert.alert('Champs requis', 'Veuillez remplir tous les champs.');
      return;
    }
    setLoading('email');
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
    } catch (error) {
      Alert.alert("Erreur d'inscription", error.message);
    } finally {
      setLoading(null);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading('google');
    try {
      const userCredential = await signInWithGoogle();
      const user = userCredential.user;

      const userData = {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        role: null,
        createdAt: new Date(),
      };
      await createUserDocument(user.uid, userData, { merge: true });
    } catch (error) {
      Alert.alert("Erreur d'inscription", "Une erreur est survenue lors de l'inscription avec Google.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <View className="flex-1 justify-center p-6 bg-background-light">
      <View className="items-center mb-10">
        <Text className="text-4xl font-bold text-text-primary">Créer un compte</Text>
        <Text className="text-lg text-text-secondary mt-1">Rejoignez la communauté EasyHome</Text>
      </View>

      <TextInput
        className="w-full h-14 bg-white border border-gray-300 rounded-xl mb-4 px-4 text-lg text-text-primary focus:border-primary"
        placeholder="Nom complet"
        value={displayName}
        onChangeText={setDisplayName}
        placeholderTextColor="#ADB5BD"
      />
      <TextInput
        className="w-full h-14 bg-white border border-gray-300 rounded-xl mb-4 px-4 text-lg text-text-primary focus:border-primary"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholderTextColor="#ADB5BD"
      />
      <TextInput
        className="w-full h-14 bg-white border border-gray-300 rounded-xl mb-6 px-4 text-lg text-text-primary focus:border-primary"
        placeholder="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="#ADB5BD"
      />

      <TouchableOpacity
        className="w-full h-14 bg-primary justify-center items-center rounded-xl shadow-md"
        onPress={handleSignUp}
        disabled={loading !== null}
      >
        {loading === 'email' ? <ActivityIndicator color="white" /> : <Text className="text-white text-lg font-bold">Créer mon compte</Text>}
      </TouchableOpacity>

      <View className="flex-row items-center my-6">
        <View className="flex-1 h-px bg-gray-300" />
        <Text className="mx-4 text-text-secondary">OU</Text>
        <View className="flex-1 h-px bg-gray-300" />
      </View>

      <TouchableOpacity
        className="w-full h-14 bg-white border border-gray-300 flex-row justify-center items-center rounded-xl shadow-md"
        onPress={handleGoogleSignUp}
        disabled={loading !== null}
      >
        {loading === 'google' ? <ActivityIndicator /> : (
          <>
            <Icon name="logo-google" size={24} color="#DC3545" />
            <Text className="text-text-primary text-lg font-semibold ml-3">S'inscrire avec Google</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('SignIn')} className="mt-8 items-center">
        <Text className="text-text-secondary text-base">
          Vous avez déjà un compte ? <Text className="text-primary font-bold">Se connecter</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default SignUpScreen;
