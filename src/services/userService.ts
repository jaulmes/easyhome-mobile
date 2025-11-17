import firestore from '@react-native-firebase/firestore';

/**
 * Crée ou met à jour un document utilisateur dans la collection 'users'.
 * @param {string} uid - L'ID de l'utilisateur.
 * @param {object} data - Les données à sauvegarder.
 * @param {object} options - Options supplémentaires, comme { merge: true }.
 */
export const createUserDocument = (uid, data, options = {}) => {
  return firestore()
    .collection('users')
    .doc(uid)
    .set(data, options);
};

/**
 * Récupère les données d'un utilisateur depuis Firestore.
 * @param {string} uid - L'ID de l'utilisateur.
 * @returns {Promise<firestore.DocumentSnapshot>}
 */
export const getUserDocument = (uid) => {
  return firestore()
    .collection('users')
    .doc(uid)
    .get();
};

/**
 * Met à jour le document d'un utilisateur.
 * @param {string} uid - L'ID de l'utilisateur.
 * @param {object} data - Les données à mettre à jour.
 */
export const updateUserDocument = (uid, data) => {
  return firestore()
    .collection('users')
    .doc(uid)
    .update(data);
};
