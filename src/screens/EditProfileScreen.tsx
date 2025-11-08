import React, { useState, useEffect } from 'react';
import { Text, TextInput, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { launchImageLibrary } from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

const EditProfileScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [currentProfileImageUrl, setCurrentProfileImageUrl] = useState(null);

  const currentUser = auth().currentUser;

  useEffect(() => {
    if (currentUser) {
      firestore()
        .collection('utilisateurs')
        .doc(currentUser.uid)
        .get()
        .then(documentSnapshot => {
          if (documentSnapshot.exists) {
            const userData = documentSnapshot.data();
            setName(userData.nom);
            setPhone(userData.telephone);
            setDescription(userData.description);
            setCurrentProfileImageUrl(userData.photoProfil);
          }
        });
    }
  }, [currentUser]);

  const handleSelectImage = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else {
        setProfileImage(response.assets[0]);
      }
    });
  };

  const handleUpdateProfile = async () => {
    if (currentUser) {
      let imageUrl = currentProfileImageUrl;
      if (profileImage) {
        const reference = storage().ref(`profileImages/${currentUser.uid}`);
        await reference.putFile(profileImage.uri);
        imageUrl = await reference.getDownloadURL();
      }

      firestore()
        .collection('utilisateurs')
        .doc(currentUser.uid)
        .update({
          nom: name,
          telephone: phone,
          description: description,
          photoProfil: imageUrl,
        })
        .then(() => {
          console.log('User updated!');
          navigation.goBack();
        });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={typography.h1}>Modifier le profil</Text>
      <TouchableOpacity onPress={handleSelectImage}>
        <Image
          source={{ uri: profileImage ? profileImage.uri : currentProfileImageUrl || 'https://via.placeholder.com/150' }}
          style={styles.profileImage}
        />
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        placeholder="Nom"
        value={name}
        onChangeText={setName}
        placeholderTextColor="#A9A9A9"
      />
      <TextInput
        style={styles.input}
        placeholder="Téléphone"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        placeholderTextColor="#A9A9A9"
      />
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
        placeholderTextColor="#A9A9A9"
      />
      <TouchableOpacity style={styles.button} onPress={handleUpdateProfile}>
        <Text style={styles.buttonText}>Mettre à jour</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: colors.surface,
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 15,
    fontSize: 16,
    color: colors.text,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonText: {
    color: colors.background,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default EditProfileScreen;
