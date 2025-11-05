import React, { useState, useEffect, useCallback } from 'react';
import { GiftedChat, Bubble } from 'react-native-gifted-chat';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { colors } from '../theme/colors';

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
    firestore()
      .collection('conversations')
      .doc(conversationId)
      .collection('messages')
      .add({
        _id,
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
            backgroundColor: colors.primary,
          },
          left: {
            backgroundColor: colors.surface,
          },
        }}
        textStyle={{
          right: {
            color: colors.background,
          },
          left: {
            color: colors.text,
          },
        }}
      />
    );
  };

  return (
    <GiftedChat
      messages={messages}
      onSend={messages => onSend(messages)}
      user={{
        _id: currentUser.uid,
        name: currentUser.displayName,
      }}
      renderBubble={renderBubble}
    />
  );
};

export default ChatScreen;
