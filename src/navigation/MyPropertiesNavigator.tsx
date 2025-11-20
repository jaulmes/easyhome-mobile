import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MyPropertiesScreen from '../screens/MyPropertiesScreen';
import EditPropertyScreen from '../screens/EditPropertyScreen';

const Stack = createNativeStackNavigator();

const MyPropertiesNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="MyPropertiesList" component={MyPropertiesScreen} options={{ headerShown: false }}/>
      <Stack.Screen name="EditProperty" component={EditPropertyScreen} />
    </Stack.Navigator>
  );
};

export default MyPropertiesNavigator;