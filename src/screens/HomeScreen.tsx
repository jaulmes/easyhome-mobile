import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

const HomeScreen = ({ navigation }) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const subscriber = firestore()
      .collection('annonces')
      .where('status', '==', 'visible')
      .orderBy('createdAt', 'desc')
      .limit(10)
      .onSnapshot(querySnapshot => {
        const listings = [];
        if (querySnapshot) {
          querySnapshot.forEach(documentSnapshot => {
            listings.push({
              ...documentSnapshot.data(),
              id: documentSnapshot.id,
            });
          });
        }
        setListings(listings);
        setLoading(false);
      }, error => {
        console.error("Firestore Error: ", error);
        setLoading(false);
      });

    return () => subscriber();
  }, []);

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
      <Text style={typography.h1}>Annonces récentes</Text>
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
    padding: 10,
    backgroundColor: colors.background,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    marginBottom: 15,
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
    color: colors.text,
  },
});

export default HomeScreen;
