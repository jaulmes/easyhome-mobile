import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

const MessagesScreen = ({ navigation }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = auth().currentUser;

  useEffect(() => {
    if (currentUser) {
      const subscriber = firestore()
        .collection('conversations')
        .where('participants', 'array-contains', currentUser.uid)
        .onSnapshot(async querySnapshot => {
          const conversationsData = [];
          for (const doc of querySnapshot.docs) {
            const data = doc.data();
            const otherUserId = data.participants.find(uid => uid !== currentUser.uid);
            let otherUserName = 'Utilisateur inconnu';
            let otherUserPhoto = 'https://via.placeholder.com/150';

            if (otherUserId) {
              const userDoc = await firestore().collection('utilisateurs').doc(otherUserId).get();
              if (userDoc.exists) {
                otherUserName = userDoc.data().nom;
                otherUserPhoto = userDoc.data().photoProfil;
              }
            }

            conversationsData.push({
              id: doc.id,
              otherUserName,
              otherUserPhoto,
              ...data,
            });
          }
          setConversations(conversationsData);
          setLoading(false);
        });

      return () => subscriber();
    }
  }, [currentUser]);

  if (loading) {
    return <ActivityIndicator size="large" color={colors.primary} />;
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => navigation.navigate('Chat', { conversationId: item.id, otherUserName: item.otherUserName })}
    >
      <Image source={{ uri: item.otherUserPhoto }} style={styles.avatar} />
      <View style={styles.textContainer}>
        <Text style={typography.h2}>{item.otherUserName}</Text>
        <Text style={styles.lastMessage}>{item.lastMessage?.text}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={conversations}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  lastMessage: {
    ...typography.body,
    color: 'gray',
  },
});

export default MessagesScreen;
