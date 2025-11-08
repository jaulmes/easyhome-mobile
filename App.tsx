import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';
import { Alert } from 'react-native';
import SplashScreen from 'react-native-splash-screen';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from './src/theme/colors';

import HomeScreen from './src/screens/HomeScreen';
import SearchScreen from './src/screens/SearchScreen';
import MessagesScreen from './src/screens/MessagesScreen';
import ChatScreen from './src/screens/ChatScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import SignInScreen from './src/screens/Auth/SignInScreen';
import SignUpScreen from './src/screens/Auth/SignUpScreen';
import PasswordResetScreen from './src/screens/Auth/PasswordResetScreen';
import MyListingsScreen from './src/screens/Landlord/MyListingsScreen';
import AddListingScreen from './src/screens/Landlord/AddListingScreen';
import EditListingScreen from './src/screens/Landlord/EditListingScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const LandlordStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="MyListings" component={MyListingsScreen} options={{ title: 'Mes annonces' }} />
    <Stack.Screen name="AddListing" component={AddListingScreen} options={{ title: 'Ajouter une annonce' }} />
    <Stack.Screen name="EditListing" component={EditListingScreen} options={{ title: "Modifier l'annonce" }} />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Mon Profil' }} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Modifier le profil' }} />
  </Stack.Navigator>
);

const MessagesStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Messages" component={MessagesScreen} options={{ title: 'Mes Messages' }} />
    <Stack.Screen name="Chat" component={ChatScreen} options={({ route }) => ({ title: route.params.otherUserName })} />
  </Stack.Navigator>
);

const App = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    SplashScreen.hide();
  }, []);

  useEffect(() => {
    // Request permission for push notifications
    async function requestUserPermission() {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Authorization status:', authStatus);
        getFCMToken();
      }
    }

    // Get the FCM token
    async function getFCMToken() {
      const fcmToken = await messaging().getToken();
      if (fcmToken) {
        console.log('FCM Token:', fcmToken);
        // Save the token to Firestore
        if (user) {
          firestore().collection('utilisateurs').doc(user.uid).update({
            fcmToken: fcmToken,
          });
        }
      }
    }

    if (user) {
      requestUserPermission();
    }

    // Handle incoming messages
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
    });

    return unsubscribe;
  }, [user]);

  function onAuthStateChanged(user) {
    setUser(user);
    if (user) {
      firestore()
        .collection('utilisateurs')
        .doc(user.uid)
        .get()
        .then(documentSnapshot => {
          if (documentSnapshot.exists) {
            setUserRole(documentSnapshot.data().role);
          }
        });
    } else {
      setUserRole(null);
    }
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  if (initializing) return null;

  if (!user) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="PasswordReset" component={PasswordResetScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Accueil') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Recherche') {
              iconName = focused ? 'search' : 'search-outline';
            } else if (route.name === 'Messages') {
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
            } else if (route.name === 'Profil') {
              iconName = focused ? 'person' : 'person-outline';
            } else if (route.name === 'Propriétaire') {
              iconName = focused ? 'briefcase' : 'briefcase-outline';
            }

            return <Icon name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen name="Accueil" component={HomeScreen} options={{ title: 'Annonces' }} />
        <Tab.Screen name="Recherche" component={SearchScreen} />
        <Tab.Screen name="Messages" component={MessagesStack} />
        <Tab.Screen name="Profil" component={ProfileStack} />
        {userRole === 'propriétaire' && (
          <Tab.Screen name="Propriétaire" component={LandlordStack} />
        )}
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;
