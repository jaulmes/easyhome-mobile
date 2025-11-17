import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { signIn, signInWithGoogle } from '../../services/authService';
import Icon from 'react-native-vector-icons/Ionicons';

const SignInScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(null); // 'email', 'google', or null

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Champs requis', 'Veuillez saisir votre email et votre mot de passe.');
      return;
    }
    setLoading('email');
    try {
      await signIn(email, password);
    } catch (error) {
      Alert.alert('Erreur de connexion', "L'email ou le mot de passe est incorrect.");
    } finally {
      setLoading(null);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading('google');
    try {
      await signInWithGoogle();
    } catch (error) {
      Alert.alert('Erreur de connexion', "Une erreur est survenue lors de la connexion avec Google.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <View className="flex-1 justify-center p-6 bg-background-light">
      <View className="items-center mb-12">
        <Icon name="home" size={60} color="#3D7BFF" />
        <Text className="text-4xl font-bold text-text-primary mt-2">EasyHome</Text>
        <Text className="text-lg text-text-secondary mt-1">Connectez-vous pour continuer</Text>
      </View>

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
        onPress={handleSignIn}
        disabled={loading !== null}
      >
        {loading === 'email' ? <ActivityIndicator color="white" /> : <Text className="text-white text-lg font-bold">Se connecter</Text>}
      </TouchableOpacity>

      <View className="flex-row items-center my-6">
        <View className="flex-1 h-px bg-gray-300" />
        <Text className="mx-4 text-text-secondary">OU</Text>
        <View className="flex-1 h-px bg-gray-300" />
      </View>

      <TouchableOpacity
        className="w-full h-14 bg-white border border-gray-300 flex-row justify-center items-center rounded-xl shadow-md"
        onPress={handleGoogleSignIn}
        disabled={loading !== null}
      >
        {loading === 'google' ? <ActivityIndicator /> : (
          <>
            <Icon name="logo-google" size={24} color="#DC3545" />
            <Text className="text-text-primary text-lg font-semibold ml-3">Continuer avec Google</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('SignUp')} className="mt-8 items-center">
        <Text className="text-text-secondary text-base">
          Vous n'avez pas de compte ? <Text className="text-primary font-bold">S'inscrire</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default SignInScreen;
