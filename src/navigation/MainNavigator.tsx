import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ExploreNavigator from './ExploreNavigator';
import MyPropertiesNavigator from './MyPropertiesNavigator';
import ListPropertyScreen from '../screens/ListPropertyScreen';
import ReservationsScreen from '../screens/ReservationsScreen';
import MessagesNavigator from './MessagesNavigator';
import ProfileNavigator from './ProfileNavigator';
import Icon from 'react-native-vector-icons/Ionicons';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const Tab = createBottomTabNavigator();

const MainNavigator = () => {
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const user = auth().currentUser;
    if (user) {
      const userDoc = firestore().collection('users').doc(user.uid);
      const unsubscribe = userDoc.onSnapshot(doc => {
        if (doc.exists) {
          setUserRole(doc.data().role);
        }
      });
      return () => unsubscribe();
    }
  }, []);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Explore') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'My Properties') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'List Property') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Reservations') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Messages') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Explore" component={ExploreNavigator} options={{ headerShown: false }}/>
      {userRole === 'landlord' && (
        <Tab.Screen name="My Properties" component={MyPropertiesNavigator} options={{ headerShown: false }} />
      )}
      <Tab.Screen name="List Property" component={ListPropertyScreen} />
      <Tab.Screen name="Reservations" component={ReservationsScreen} />
      <Tab.Screen name="Messages" component={MessagesNavigator} options={{ headerShown: false }} />
      <Tab.Screen name="Profile" component={ProfileNavigator} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
};

export default MainNavigator;