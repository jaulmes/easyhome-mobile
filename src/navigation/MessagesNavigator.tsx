import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MessagesScreen from '../screens/MessagesScreen';
import ChatScreen from '../screens/ChatScreen';

const Stack = createNativeStackNavigator();

const MessagesNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="MessagesList" component={MessagesScreen} options={{ headerShown: false }}/>
      <Stack.Screen name="Chat" component={ChatScreen} options={({ route }) => ({ title: route.params.recipientName })}/>
    </Stack.Navigator>
  );
};

export default MessagesNavigator;