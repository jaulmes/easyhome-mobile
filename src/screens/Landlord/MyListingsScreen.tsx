import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import { getUserProperties, deleteProperty } from '../../services/propertyService';
import MyPropertyCard from '../../components/MyPropertyCard';

const MyListingsScreen = ({ navigation }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = auth().currentUser;

  const fetchUserProperties = useCallback(async () => {
    if (!user) {
      setError("Vous devez être connecté pour voir vos annonces.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const props = await getUserProperties(user.uid);
      setProperties(props);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger vos annonces.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(fetchUserProperties);

  const handleDelete = async (propertyId) => {
    try {
      await deleteProperty(propertyId);
      Alert.alert('Succès', 'Annonce supprimée.');
      // Rafraîchir la liste
      setProperties(prev => prev.filter(p => p.id !== propertyId));
    } catch (err) {
      console.error(err);
      Alert.alert('Erreur', 'La suppression a échoué.');
    }
  };

  const handleEdit = (propertyId) => {
    navigation.navigate('EditListing', { propertyId });
  };

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator size="large" color="#007AFF" className="mt-10" />;
    }

    if (error) {
      return <Text className="text-red-500 text-lg text-center mt-10">{error}</Text>;
    }

    if (properties.length === 0) {
      return (
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-600 text-lg">Vous n'avez publié aucune annonce.</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={properties}
        renderItem={({ item }) => (
          <MyPropertyCard
            property={item}
            onEdit={() => handleEdit(item.id)}
            onDelete={() => handleDelete(item.id)}
          />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
      />
    );
  };

  return (
    <View className="flex-1 bg-gray-100">
      <View className="bg-white p-4 shadow-md flex-row justify-between items-center">
        <Text className="text-3xl font-bold text-gray-800">Mes Annonces</Text>
        <TouchableOpacity
            onPress={() => navigation.navigate('AddProperty')}
            className="bg-blue-600 p-3 rounded-lg"
        >
            <Text className="text-white font-bold">Ajouter</Text>
        </TouchableOpacity>
      </View>
      {renderContent()}
    </View>
  );
};

export default MyListingsScreen;
