import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TextInput, TouchableOpacity, Image } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

const SearchScreen = ({ navigation }) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [city, setCity] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    let query = firestore().collection('annonces').where('status', '==', 'visible');

    if (city) {
      query = query.where('city', '==', city);
    }
    if (propertyType) {
      query = query.where('propertyType', '==', propertyType);
    }
    if (minPrice) {
      query = query.where('price', '>=', parseFloat(minPrice));
    }
    if (maxPrice) {
      query = query.where('price', '<=', parseFloat(maxPrice));
    }

    const subscriber = query.onSnapshot(querySnapshot => {
      let listings = [];
      querySnapshot.forEach(documentSnapshot => {
        listings.push({
          ...documentSnapshot.data(),
          id: documentSnapshot.id,
        });
      });

      if (searchQuery) {
        listings = listings.filter(item =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.neighborhood.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      setListings(listings);
      setLoading(false);
    });

    return () => subscriber();
  }, [searchQuery, city, propertyType, minPrice, maxPrice]);

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
        <TextInput style={styles.input} placeholder="Rechercher..." value={searchQuery} onChangeText={setSearchQuery} />
        <View style={styles.row}>
          <TextInput style={[styles.input, styles.halfInput]} placeholder="Ville" value={city} onChangeText={setCity} />
          <TextInput style={[styles.input, styles.halfInput]} placeholder="Type de bien" value={propertyType} onChangeText={setPropertyType} />
        </View>
        <View style={styles.row}>
          <TextInput style={[styles.input, styles.halfInput]} placeholder="Prix min" value={minPrice} onChangeText={setMinPrice} keyboardType="numeric" />
          <TextInput style={[styles.input, styles.halfInput]} placeholder="Prix max" value={maxPrice} onChangeText={setMaxPrice} keyboardType="numeric" />
        </View>
      </View>
      <FlatList
        data={listings}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
      />
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
    height: 40,
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: colors.background,
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
});

export default SearchScreen;
