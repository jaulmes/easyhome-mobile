import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';

const MessagesScreen = () => {
  const [chats, setChats] = useState([]);
  const user = auth().currentUser;
  const navigation = useNavigation();
  const [userNames, setUserNames] = useState({});

  useEffect(() => {
    if (user) {
      const subscriber = firestore()
        .collection('chats')
        .where('participants', 'array-contains', user.uid)
        .onSnapshot(querySnapshot => {
          const chatsData = [];
          const userIdsToFetch = new Set();

          querySnapshot.forEach(documentSnapshot => {
            const data = documentSnapshot.data();
            chatsData.push({
              id: documentSnapshot.id,
              ...data,
            });
            const otherUserId = data.participants.find(id => id !== user.uid);
            if (otherUserId) {
                userIdsToFetch.add(otherUserId);
            }
          });

          // Fetch user names
          userIdsToFetch.forEach(userId => {
              if(!userNames[userId]) { // Fetch only if not already fetched
                firestore().collection('users').doc(userId).get().then(doc => {
                    if(doc.exists) {
                        setUserNames(prev => ({...prev, [userId]: doc.data().name}));
                    }
                })
              }
          })

          setChats(chatsData);
        });

      return () => subscriber();
    }
  }, [user]);

  const handleChatPress = (chatId, participants) => {
    const otherUserId = participants.find(id => id !== user.uid);
    navigation.navigate('Chat', { chatId, recipientName: userNames[otherUserId] || 'Chat' });
  };

  const renderItem = ({ item }) => {
    const otherUserId = item.participants.find(id => id !== user.uid);
    const recipientName = userNames[otherUserId] || 'Loading...';

    return (
        <TouchableOpacity onPress={() => handleChatPress(item.id, item.participants)} className="bg-white rounded-xl shadow-md p-4 mb-4">
          <Text className="text-lg font-bold text-gray-800">{recipientName}</Text>
          <Text className="text-gray-600 mt-1" numberOfLines={1}>{item.lastMessage}</Text>
        </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
        <View className="p-4 bg-white border-b border-gray-200">
            <Text className="text-2xl font-bold text-gray-800">Messages</Text>
        </View>
        <FlatList
            data={chats}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={{ padding: 16 }}
        />
    </View>
  );
};

export default MessagesScreen;