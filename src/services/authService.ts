import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Il est crucial de configurer GoogleSignin, idéalement au démarrage de l'app.
// Le webClientId doit être obtenu depuis votre console Firebase (et correspond souvent au "Client ID" de type "Web application" dans vos identifiants OAuth 2.0).
// Ce fichier est souvent ajouté via le fichier google-services.json dans votre projet Android.
// SANS CETTE VALEUR, LA CONNEXION GOOGLE NE FONCTIONNERA PAS.
GoogleSignin.configure({
  webClientId: 'REMPLACER_PAR_VOTRE_WEB_CLIENT_ID_DEPUIS_FIREBASE',
});

export const signIn = (email, password) => {
  return auth().signInWithEmailAndPassword(email, password);
};

export const signInWithGoogle = async () => {
  try {
    // 1. Récupérer le jeton d'identification Google
    await GoogleSignin.hasPlayServices();
    const { idToken } = await GoogleSignin.signIn();

    // 2. Créer des identifiants Firebase avec le jeton
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);

    // 3. Connecter l'utilisateur avec ces identifiants
    return auth().signInWithCredential(googleCredential);
  } catch (error) {
    console.error("Erreur lors de la connexion avec Google : ", error);
    throw error;
  }
};

export const signUp = (email, password) => {
  return auth().createUserWithEmailAndPassword(email, password);
};

export const signOut = async () => {
  try {
    await auth().signOut();
    // Déconnecter aussi de Google pour que l'utilisateur puisse choisir un autre compte la prochaine fois
    await GoogleSignin.revokeAccess();
    await GoogleSignin.signOut();
  } catch (error) {
    console.error("Erreur lors de la déconnexion : ", error);
  }
};

export const sendPasswordResetEmail = (email) => {
  return auth().sendPasswordResetEmail(email);
};

export const onAuthStateChanged = (callback) => {
  return auth().onAuthStateChanged(callback);
};
