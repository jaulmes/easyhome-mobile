import React, { useState, useEffect, useCallback } from 'react';
import { GiftedChat, Bubble, InputToolbar } from 'react-native-gifted-chat';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const ChatScreen = ({ route }) => {
  const { chatId } = route.params;
  const [messages, setMessages] = useState([]);
  const user = auth().currentUser;

  useEffect(() => {
    const subscriber = firestore()
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .orderBy('createdAt', 'desc')
      .onSnapshot(querySnapshot => {
        const messages = querySnapshot.docs.map(doc => {
          const firebaseData = doc.data();

          const data = {
            _id: doc.id,
            text: firebaseData.content,
            createdAt: firebaseData.createdAt.toDate(),
            user: {
              _id: firebaseData.senderId,
            },
          };

          return data;
        });

        setMessages(messages);
      });

    return () => subscriber();
  }, [chatId]);

  const onSend = useCallback((messages = []) => {
    const { _id, createdAt, text, user } = messages[0];
    const messageToSend = {
      content: text,
      senderId: user._id,
      createdAt: firestore.Timestamp.fromDate(createdAt),
    };

    firestore()
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .add(messageToSend);

    firestore()
        .collection('chats')
        .doc(chatId)
        .set({
            lastMessage: text,
            updatedAt: firestore.FieldValue.serverTimestamp(),
            participants: chatId.split('_')
        }, {merge: true})

  }, [chatId]);

  const renderBubble = (props) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: '#2563EB',
          },
          left: {
            backgroundColor: '#E5E7EB',
          },
        }}
        textStyle={{
            right: {
                color: '#fff'
            },
            left: {
                color: '#000'
            }
        }}
      />
    );
  };

  const renderInputToolbar = (props) => {
      return <InputToolbar {...props} containerStyle={{borderTopWidth: 1, borderTopColor: '#E5E7EB'}} />
  }

  return (
    <GiftedChat
      messages={messages}
      onSend={messages => onSend(messages)}
      user={{
        _id: user.uid,
      }}
      renderBubble={renderBubble}
      renderInputToolbar={renderInputToolbar}
    />
  );
};

export default ChatScreen;