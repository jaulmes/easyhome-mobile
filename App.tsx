import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import SplashScreen from 'react-native-splash-screen';
import Icon from 'react-native-vector-icons/Ionicons';

// Screens
import SearchScreen from './src/screens/SearchScreen';
import MessagesScreen from './src/screens/MessagesScreen';
import ChatScreen from './src/screens/ChatScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import SignInScreen from './src/screens/Auth/SignInScreen';
import SignUpScreen from './src/screens/Auth/SignUpScreen';
import RoleSelectionScreen from './src/screens/Auth/RoleSelectionScreen';
import MyListingsScreen from './src/screens/Landlord/MyListingsScreen';
import AddListingScreen from './src/screens/Landlord/AddListingScreen';
import ReservationsScreen from './src/screens/ReservationsScreen';
import PropertyDetailsScreen from './src/screens/PropertyDetailsScreen';
import EditListingScreen from './src/screens/Landlord/EditListingScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stacks de navigation
const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="SignIn" component={SignInScreen} />
    <Stack.Screen name="SignUp" component={SignUpScreen} />
  </Stack.Navigator>
);

const AppTabs = ({ userRole, navigation }) => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ focused, color, size }) => {
        const icons = {
          Explorer: focused ? 'search' : 'search-outline',
          MyProperties: focused ? 'briefcase' : 'briefcase-outline',
          ListProperty: focused ? 'add-circle' : 'add-circle-outline',
          Reservations: focused ? 'calendar' : 'calendar-outline',
          Messages: focused ? 'chatbubbles' : 'chatbubbles-outline',
          Profile: focused ? 'person' : 'person-outline',
        };
        return <Icon name={icons[route.name]} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#007AFF',
      tabBarInactiveTintColor: 'gray',
    })}
  >
    <Tab.Screen name="Explorer" component={SearchScreen} />
    {userRole === 'landlord' && (
      <Tab.Screen name="MyProperties" component={MyListingsScreen} options={{ title: 'Mes Annonces' }} />
    )}
    <Tab.Screen
      name="ListProperty"
      component={AddListingScreen} // Un composant factice, ne sera jamais montré
      options={{ title: "Publier" }}
      listeners={{
        tabPress: e => {
          e.preventDefault(); // Empêche la navigation vers l'onglet
          navigation.navigate('AddProperty'); // Navigue vers l'écran modal
        },
      }}
    />
    <Tab.Screen name="Reservations" component={ReservationsScreen} />
    <Tab.Screen name="Messages" component={MessagesScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

const App = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    SplashScreen.hide();

    const authSubscriber = auth().onAuthStateChanged(userState => {
      setUser(userState);
      if (initializing) {
        setInitializing(false);
      }
    });

    return authSubscriber;
  }, [initializing]);

  useEffect(() => {
    if (user) {
      const firestoreSubscriber = firestore()
        .collection('users')
        .doc(user.uid)
        .onSnapshot(documentSnapshot => {
          if (documentSnapshot.exists) {
            setUserRole(documentSnapshot.data()?.role || null);
          } else {
            setUserRole(null);
          }
        });

      return () => firestoreSubscriber();
    } else {
      setUserRole(null);
    }
  }, [user]);

  if (initializing) {
    return null; // ou un écran de chargement
  }

  const renderContent = (navigation) => {
    if (!user) {
      return <AuthStack />;
    }
    if (user && userRole === null) {
      return <RoleSelectionScreen />;
    }
    return <AppTabs userRole={userRole} navigation={navigation} />;
  };

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Root">
          {({ navigation }) => renderContent(navigation)}
        </Stack.Screen>
        <Stack.Screen name="AddProperty" component={AddListingScreen} options={{ presentation: 'modal' }}/>
        <Stack.Screen name="PropertyDetails" component={PropertyDetailsScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="EditListing" component={EditListingScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
