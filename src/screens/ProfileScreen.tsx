import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { signOut } from '../services/authService';

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = auth().currentUser;
    if (currentUser) {
      const subscriber = firestore()
        .collection('utilisateurs')
        .doc(currentUser.uid)
        .onSnapshot(documentSnapshot => {
          setUser(documentSnapshot.data());
          setLoading(false);
        });

      return () => subscriber();
    }
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color={colors.primary} />;
  }

  return (
    <View style={styles.container}>
      {user ? (
        <>
          <Image source={{ uri: user.photoProfil || 'https://via.placeholder.com/150' }} style={styles.profileImage} />
          <Text style={typography.h1}>{user.nom}</Text>
          <Text style={styles.info}>{user.email}</Text>
          <Text style={styles.info}>{user.role}</Text>
          <Text style={styles.info}>{user.telephone}</Text>
          <Text style={styles.description}>{user.description}</Text>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('EditProfile')}>
            <Text style={styles.buttonText}>Modifier le profil</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text>Aucune information de profil trouvée.</Text>
      )}
      <TouchableOpacity style={[styles.button, styles.signOutButton]} onPress={signOut}>
        <Text style={styles.buttonText}>Déconnexion</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.background,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
  },
  info: {
    ...typography.body,
    marginBottom: 5,
  },
  description: {
    ...typography.body,
    textAlign: 'center',
    marginVertical: 15,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: colors.background,
    fontSize: 18,
    fontWeight: 'bold',
  },
  signOutButton: {
    backgroundColor: colors.error,
  },
});

export default ProfileScreen;
