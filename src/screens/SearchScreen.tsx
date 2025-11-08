import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TextInput, TouchableOpacity, Image } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

const SearchScreen = ({ navigation }) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Input states
  const [searchQuery, setSearchQuery] = useState('');
  const [city, setCity] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Active search filters
  const [activeFilters, setActiveFilters] = useState({
    searchQuery: '',
    city: '',
    propertyType: '',
    minPrice: '',
    maxPrice: '',
  });

  const handleSearch = () => {
    setLoading(true);
    setActiveFilters({
      searchQuery,
      city,
      propertyType,
      minPrice,
      maxPrice,
    });
  };

  useEffect(() => {
    let query = firestore().collection('annonces').where('status', '==', 'visible');

    if (activeFilters.city) {
      query = query.where('city', '==', activeFilters.city);
    }
    if (activeFilters.propertyType) {
      query = query.where('propertyType', '==', activeFilters.propertyType);
    }
    if (activeFilters.minPrice) {
      query = query.where('price', '>=', parseFloat(activeFilters.minPrice));
    }
    if (activeFilters.maxPrice) {
      query = query.where('price', '<=', parseFloat(activeFilters.maxPrice));
    }

    const subscriber = query.onSnapshot(querySnapshot => {
      let listingsData = [];
      querySnapshot.forEach(documentSnapshot => {
        listingsData.push({
          ...documentSnapshot.data(),
          id: documentSnapshot.id,
        });
      });

      if (activeFilters.searchQuery) {
        listingsData = listingsData.filter(item =>
          item.title.toLowerCase().includes(activeFilters.searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(activeFilters.searchQuery.toLowerCase()) ||
          item.neighborhood.toLowerCase().includes(activeFilters.searchQuery.toLowerCase())
        );
      }

      setListings(listingsData);
      setLoading(false);
    });

    return () => subscriber();
  }, [activeFilters]);

  if (loading) {
    return <ActivityIndicator size="large" color={colors.primary} />;
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ListingDetails', { listingId: item.id })}>
      <Image source={{ uri: item.imageUrls?.[0] || 'https://via.placeholder.com/150' }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <Text style={typography.h2}>{item.title}</Text>
        <Text style={styles.price}>{item.price} €</Text>
        <Text style={styles.location}>{item.city}, {item.neighborhood}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.filtersContainer}>
        <TextInput style={styles.input} placeholder="Rechercher..." value={searchQuery} onChangeText={setSearchQuery} placeholderTextColor="#A9A9A9" />
        <View style={styles.row}>
          <TextInput style={[styles.input, styles.halfInput]} placeholder="Ville" value={city} onChangeText={setCity} placeholderTextColor="#A9A9A9" />
          <TextInput style={[styles.input, styles.halfInput]} placeholder="Type de bien" value={propertyType} onChangeText={setPropertyType} placeholderTextColor="#A9A9A9" />
        </View>
        <View style={styles.row}>
          <TextInput style={[styles.input, styles.halfInput]} placeholder="Prix min" value={minPrice} onChangeText={setMinPrice} keyboardType="numeric" placeholderTextColor="#A9A9A9" />
          <TextInput style={[styles.input, styles.halfInput]} placeholder="Prix max" value={maxPrice} onChangeText={setMaxPrice} keyboardType="numeric" placeholderTextColor="#A9A9A9" />
        </View>
        <TouchableOpacity style={styles.button} onPress={handleSearch}>
          <Text style={styles.buttonText}>Rechercher</Text>
        </TouchableOpacity>
      </View>
      {listings.length === 0 && !loading ? (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsText}>Aucun résultat trouvé.</Text>
        </View>
      ) : (
        <FlatList
          data={listings}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filtersContainer: {
    padding: 10,
    backgroundColor: colors.surface,
  },
  input: {
    height: 50,
    backgroundColor: colors.surface,
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    color: colors.text,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  cardContent: {
    padding: 15,
  },
  price: {
    ...typography.h2,
    color: colors.primary,
    marginVertical: 5,
  },
  location: {
    ...typography.body,
    color: 'gray',
  },
  button: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: 'bold',
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResultsText: {
    ...typography.h2,
    color: 'gray',
  },
});

export default SearchScreen;
