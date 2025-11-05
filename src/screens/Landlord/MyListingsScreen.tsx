import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

const MyListingsScreen = ({ navigation }) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = auth().currentUser;

  useEffect(() => {
    if (currentUser) {
      const subscriber = firestore()
        .collection('annonces')
        .where('ownerId', '==', currentUser.uid)
        .onSnapshot(querySnapshot => {
          const listings = [];
          querySnapshot.forEach(documentSnapshot => {
            listings.push({
              ...documentSnapshot.data(),
              id: documentSnapshot.id,
            });
          });
          setListings(listings);
          setLoading(false);
        });

      return () => subscriber();
    }
  }, [currentUser]);

  const handleDelete = (listingId) => {
    firestore().collection('annonces').doc(listingId).delete();
  };

  if (loading) {
    return <ActivityIndicator size="large" color={colors.primary} />;
  }

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.imageUrls?.[0] || 'https://via.placeholder.com/150' }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <Text style={typography.h2}>{item.title}</Text>
        <Text style={styles.price}>{item.price} €</Text>
        <View style={styles.actions}>
          <Button title="Modifier" onPress={() => navigation.navigate('EditListing', { listingId: item.id })} />
          <Button title="Supprimer" onPress={() => handleDelete(item.id)} color={colors.error} />
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Button title="Ajouter une nouvelle annonce" onPress={() => navigation.navigate('AddListing')} />
      <FlatList
        data={listings}
        renderItem={renderItem}
        keyExtractor={item => item.id}
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
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
});

export default MyListingsScreen;
