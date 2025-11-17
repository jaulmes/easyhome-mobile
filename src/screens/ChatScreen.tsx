import React, { useState, useEffect, useCallback } from 'react';
import { GiftedChat, Bubble } from 'react-native-gifted-chat';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const ChatScreen = ({ route }) => {
  const { conversationId } = route.params;
  const [messages, setMessages] = useState([]);
  const currentUser = auth().currentUser;

  useEffect(() => {
    const subscriber = firestore()
      .collection('conversations')
      .doc(conversationId)
      .collection('messages')
      .orderBy('createdAt', 'desc')
      .onSnapshot(querySnapshot => {
        const messages = querySnapshot.docs.map(doc => {
          const firebaseData = doc.data();
          return {
            _id: doc.id,
            text: firebaseData.text,
            createdAt: firebaseData.createdAt ? firebaseData.createdAt.toDate() : new Date(),
            user: {
              _id: firebaseData.user._id,
              name: firebaseData.user.name,
            },
          };
        });
        setMessages(messages);
      });

    return () => subscriber();
  }, [conversationId]);

  const onSend = useCallback((messages = []) => {
    const { _id, createdAt, text, user } = messages[0];
    const messageRef = firestore()
      .collection('conversations')
      .doc(conversationId)
      .collection('messages')
      .doc(_id);

    messageRef.set({
        createdAt,
        text,
        user,
      });

    firestore()
      .collection('conversations')
      .doc(conversationId)
      .update({
        lastMessage: {
          text,
          createdAt,
        },
      });
  }, [conversationId]);

  const renderBubble = (props) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: '#3D7BFF', // primary.DEFAULT
          },
          left: {
            backgroundColor: '#F1F3F5', // background.DEFAULT
          },
        }}
        textStyle={{
          right: {
            color: '#FFFFFF',
          },
          left: {
            color: '#212529', // text.primary
          },
        }}
      />
    );
  };

  if (!currentUser) {
      return null; // or a loading indicator
  }

  return (
    <GiftedChat
      messages={messages}
      onSend={messages => onSend(messages)}
      user={{
        _id: currentUser.uid,
        name: currentUser.displayName,
      }}
      renderBubble={renderBubble}
      placeholder="Écrivez un message..."
    />
  );
};

export default ChatScreen;
