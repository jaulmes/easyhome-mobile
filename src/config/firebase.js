import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import '@react-native-firebase/firestore';
import '@react-native-firebase/storage';
import '@react-native-firebase/messaging';

const firebaseConfig = {
  projectId: "studio-3316263020-abd3e",
  appId: "1:661627782061:web:24276d59179ee726dbd724",
  apiKey: "AIzaSyDt_qDxZsfqRoyZI6vHO9yC6zrLQdWIbKs",
  authDomain: "studio-3316263020-abd3e.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "661627782061"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const auth = firebase.auth();
export const firestore = firebase.firestore();
export const storage = firebase.storage();
export const messaging = firebase.messaging();
export default firebase;
