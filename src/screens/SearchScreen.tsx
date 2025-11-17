import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getAllProperties } from '../services/propertyService';
import PropertyCard from '../components/PropertyCard';

const SearchScreen = ({ navigation }) => {
  const [properties, setProperties] = useState([]);
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
      const props = await getAllProperties(appliedFilters);
      setProperties(props);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les données.");
    } finally {
      setLoading(false);
    }
  }, []);

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
      <Text className="text-2xl font-bold text-text-primary mb-4">Résultats de la recherche</Text>
    </>
  );

  return (
    <View className="flex-1 bg-background-light">
      <View className="bg-white p-4 shadow-md">
        <Text className="text-3xl font-bold text-text-primary">Explorer</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4 -mx-4 px-4">
          <TextInput placeholder="Ville" value={filters.city} onChangeText={v => handleFilterChange('city', v)} className="bg-background rounded-lg p-3 mr-2 w-36 text-text-primary" placeholderTextColor="#ADB5BD" />
          <TextInput placeholder="Type" value={filters.propertyType} onChangeText={v => handleFilterChange('propertyType', v)} className="bg-background rounded-lg p-3 mr-2 w-36" placeholderTextColor="#ADB5BD" />
          <TextInput placeholder="Prix min" value={filters.minPrice} onChangeText={v => handleFilterChange('minPrice', v)} className="bg-background rounded-lg p-3 mr-2 w-28" keyboardType="numeric" placeholderTextColor="#ADB5BD" />
          <TextInput placeholder="Prix max" value={filters.maxPrice} onChangeText={v => handleFilterChange('maxPrice', v)} className="bg-background rounded-lg p-3 mr-2 w-28" keyboardType="numeric" placeholderTextColor="#ADB5BD" />
          <TextInput placeholder="Pièces min" value={filters.bedrooms} onChangeText={v => handleFilterChange('bedrooms', v)} className="bg-background rounded-lg p-3 mr-2 w-32" keyboardType="numeric" placeholderTextColor="#ADB5BD" />
        </ScrollView>
        <TouchableOpacity onPress={handleSearch} className="bg-primary h-12 justify-center items-center rounded-xl mt-4 shadow-md">
          <Text className="text-white font-bold text-lg">Rechercher</Text>
        </TouchableOpacity>
      </View>

      {loading ? <ActivityIndicator size="large" color="#3D7BFF" className="mt-10" /> : error ? (
        <View className="flex-1 justify-center items-center p-5">
          <Text className="text-danger text-lg text-center">{error}</Text>
          <TouchableOpacity className="mt-4 bg-primary p-3 rounded-lg" onPress={handleSearch}>
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
          ListEmptyComponent={<Text className="text-text-secondary text-lg text-center mt-16">Aucun résultat trouvé pour ces critères.</Text>}
        />
      )}
    </View>
  );
};

export default SearchScreen;
