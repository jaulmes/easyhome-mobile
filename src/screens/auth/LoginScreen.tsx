import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();

  const handleLogin = async () => {
    try {
      await auth().signInWithEmailAndPassword(email, password);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-white p-8">
      <Text className="text-4xl font-bold text-gray-800 mb-8">Welcome Back</Text>

      <TextInput
        className="w-full bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 mb-4 text-gray-700"
        placeholder="Email"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        className="w-full bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 mb-6 text-gray-700"
        placeholder="Password"
        placeholderTextColor="#999"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        className="w-full bg-blue-600 rounded-lg py-3 mb-4"
        onPress={handleLogin}
      >
        <Text className="text-white text-center font-bold text-lg">Login</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="w-full"
        onPress={() => navigation.navigate('Register')}
      >
        <Text className="text-blue-600 text-center font-semibold">
          Don't have an account? Sign up
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;