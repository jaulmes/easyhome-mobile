import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getAllProperties } from '../services/propertyService';
import { suggestProperties } from '../services/genkitService';
import PropertyCard from '../components/PropertyCard';
import SuggestedPropertyCard from '../components/SuggestedPropertyCard';
import Icon from 'react-native-vector-icons/Ionicons';

const SearchScreen = ({ navigation }) => {
  const [properties, setProperties] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    city: '',
    propertyType: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
  });

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const fetchData = useCallback(async (appliedFilters) => {
    try {
      setLoading(true);
      setError(null);
      const [props, suggs] = await Promise.all([
        getAllProperties(appliedFilters),
        suggestProperties() // Les suggestions ne sont pas filtrées pour l'instant
      ]);
      setProperties(props);
      setSuggestions(suggs);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les données.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Premier chargement
  useFocusEffect(
    useCallback(() => {
      fetchData({});
    }, [fetchData])
  );

  const handleSearch = () => {
    fetchData(filters);
  };

  const ListHeader = () => (
    <>
      {suggestions.length > 0 && (
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-800 mb-4">Suggestions pour vous</Text>
          <FlatList data={suggestions} renderItem={({ item }) => (<SuggestedPropertyCard property={item} onPress={() => navigation.navigate('PropertyDetails', { propertyId: item.id })} />)} keyExtractor={item => item.id} horizontal showsHorizontalScrollIndicator={false} />
        </View>
      )}
      <Text className="text-2xl font-bold text-gray-800 mb-4">Résultats</Text>
    </>
  );

  return (
    <View className="flex-1 bg-gray-100">
      <View className="bg-white p-4 shadow-md">
        <Text className="text-3xl font-bold text-gray-800">Explorer</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4">
          <TextInput placeholder="Ville" value={filters.city} onChangeText={v => handleFilterChange('city', v)} className="bg-gray-200 rounded-lg p-3 mr-2 w-32" />
          <TextInput placeholder="Type" value={filters.propertyType} onChangeText={v => handleFilterChange('propertyType', v)} className="bg-gray-200 rounded-lg p-3 mr-2 w-32" />
          <TextInput placeholder="Prix min" value={filters.minPrice} onChangeText={v => handleFilterChange('minPrice', v)} className="bg-gray-200 rounded-lg p-3 mr-2 w-24" keyboardType="numeric" />
          <TextInput placeholder="Prix max" value={filters.maxPrice} onChangeText={v => handleFilterChange('maxPrice', v)} className="bg-gray-200 rounded-lg p-3 mr-2 w-24" keyboardType="numeric" />
          <TextInput placeholder="Pièces min" value={filters.bedrooms} onChangeText={v => handleFilterChange('bedrooms', v)} className="bg-gray-200 rounded-lg p-3 mr-2 w-28" keyboardType="numeric" />
        </ScrollView>
        <TouchableOpacity onPress={handleSearch} className="bg-blue-600 p-3 rounded-lg mt-4 items-center">
          <Text className="text-white font-bold text-lg">Rechercher</Text>
        </TouchableOpacity>
      </View>

      {loading ? <ActivityIndicator size="large" color="#007AFF" className="mt-10" /> : error ? (
        <View className="flex-1 justify-center items-center p-5">
          <Text className="text-red-500 text-lg text-center">{error}</Text>
          <TouchableOpacity className="mt-4 bg-blue-600 p-3 rounded-lg" onPress={handleSearch}>
            <Text className="text-white font-bold">Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={properties}
          renderItem={({ item }) => (<PropertyCard property={item} onPress={() => navigation.navigate('PropertyDetails', { propertyId: item.id })} />)}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16 }}
          ListHeaderComponent={<ListHeader />}
          ListEmptyComponent={<Text className="text-gray-600 text-lg text-center mt-10">Aucun résultat trouvé pour ces critères.</Text>}
        />
      )}
    </View>
  );
};

export default SearchScreen;
