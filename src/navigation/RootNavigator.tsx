import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator'; // This will be created in the next step
import RoleChoiceScreen from '../screens/auth/RoleChoiceScreen';

const RootNavigator = () => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const authSubscriber = auth().onAuthStateChanged(setUser);

    return authSubscriber;
  }, []);

  useEffect(() => {
    if (user) {
      const firestoreSubscriber = firestore()
        .collection('users')
        .doc(user.uid)
        .onSnapshot(documentSnapshot => {
          setUserProfile(documentSnapshot.data());
        });

      return () => firestoreSubscriber();
    }
  }, [user]);

  if (!user) {
    return (
      <NavigationContainer>
        <AuthNavigator />
      </NavigationContainer>
    );
  }

  if (userProfile && userProfile.role === null) {
    return <RoleChoiceScreen />;
  }

  return (
    <NavigationContainer>
      <MainNavigator />
    </NavigationContainer>
  );
};

export default RootNavigator;