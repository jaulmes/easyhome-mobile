import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useFocusEffect } from '@react-navigation/native';

const MessagesScreen = ({ navigation }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = auth().currentUser;

  const fetchConversations = useCallback(() => {
    if (!user) return;

    setLoading(true);
    const subscriber = firestore()
      .collection('conversations')
      .where('participants', 'array-contains', user.uid)
      .onSnapshot(async querySnapshot => {
        const conversationsData = [];
        for (const doc of querySnapshot.docs) {
          const data = doc.data();
          const otherUserId = data.participants.find(uid => uid !== user.uid);
          let otherUserName = 'Utilisateur inconnu';
          let otherUserPhoto = 'https://via.placeholder.com/150';

          if (otherUserId) {
            const userDoc = await firestore().collection('users').doc(otherUserId).get();
            if (userDoc.exists) {
              otherUserName = userDoc.data().displayName;
              otherUserPhoto = userDoc.data().photoURL;
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
  }, [user]);

  useFocusEffect(fetchConversations);

  if (loading) {
    return (
        <View className="flex-1 bg-background-light">
            <View className="bg-white p-4 shadow-md">
                <Text className="text-3xl font-bold text-text-primary">Messages</Text>
            </View>
            <ActivityIndicator size="large" color="#3D7BFF" className="mt-10" />
        </View>
    );
  }

  return (
    <View className="flex-1 bg-background-light">
      <View className="bg-white p-4 shadow-md">
        <Text className="text-3xl font-bold text-text-primary">Messages</Text>
      </View>
      <FlatList
        data={conversations}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="flex-row items-center p-4 border-b border-gray-200 bg-white"
            onPress={() => navigation.navigate('Chat', { conversationId: item.id, otherUserName: item.otherUserName })}
          >
            <Image source={{ uri: item.otherUserPhoto || 'https://via.placeholder.com/150' }} className="w-14 h-14 rounded-full" />
            <View className="flex-1 ml-4">
              <Text className="text-lg font-bold text-text-primary">{item.otherUserName}</Text>
              <Text className="text-base text-text-secondary" numberOfLines={1}>{item.lastMessage?.text}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text className="text-text-secondary text-lg text-center mt-16">Aucune conversation.</Text>}
      />
    </View>
  );
};

export default MessagesScreen;
