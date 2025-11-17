import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';

const db = firestore();
const propertiesCollection = db.collection('properties');

// ... (getAllProperties, getPropertyById, getUserProperties restent les mêmes)

/**
 * Ajoute une nouvelle annonce.
 * @param {object} propertyData - Les données de l'annonce.
 * @param {string[]} imageUris - Les URIs locales des images à téléverser.
 */
export const addProperty = async (propertyData, imageUris) => {
  const user = auth().currentUser;
  if (!user) throw new Error("Utilisateur non authentifié.");

  const imageUrls = await uploadImages(imageUris, user.uid);

  const dataToSave = {
    ...propertyData,
    ownerId: user.uid,
    ownerName: user.displayName,
    ownerAvatar: user.photoURL,
    imageUrls,
    createdAt: firestore.FieldValue.serverTimestamp(),
  };

  return propertiesCollection.add(dataToSave);
};

/**
 * Met à jour une annonce existante, y compris les images.
 * @param {string} propertyId - L'ID de l'annonce à mettre à jour.
 * @param {object} propertyData - Les nouvelles données de l'annonce.
 * @param {string[]} newImageUris - Les URIs locales des nouvelles images à ajouter.
 * @param {string[]} existingImageUrls - Les URLs des images existantes à conserver.
 */
export const updateProperty = async (propertyId, propertyData, newImageUris, existingImageUrls) => {
    const user = auth().currentUser;
    if (!user) throw new Error("Utilisateur non authentifié.");

    // 1. Identifier et supprimer les anciennes images
    const originalDoc = await propertiesCollection.doc(propertyId).get();
    const originalImageUrls = originalDoc.data().imageUrls || [];

    const imagesToDelete = originalImageUrls.filter(url => !existingImageUrls.includes(url));

    if (imagesToDelete.length > 0) {
      const deletePromises = imagesToDelete.map(url => storage().refFromURL(url).delete());
      await Promise.all(deletePromises);
    }

    // 2. Téléverser les nouvelles images
    const newUploadedUrls = await uploadImages(newImageUris, user.uid);

    // 3. Mettre à jour le document Firestore
    const updatedImageUrls = [...existingImageUrls, ...newUploadedUrls];

    const dataToUpdate = {
      ...propertyData,
      imageUrls: updatedImageUrls,
    };

    return propertiesCollection.doc(propertyId).update(dataToUpdate);
  };


/**
 * Supprime une annonce et toutes les images associées.
 * @param {string} propertyId - L'ID de l'annonce à supprimer.
 */
export const deleteProperty = async (propertyId) => {
    // ... (la fonction deleteProperty reste la même)
};

/**
 * Téléverse les images vers Firebase Storage et retourne leurs URLs.
 * @param {string[]} uris - Tableau d'URIs d'images locales.
 * @param {string} userId - L'ID de l'utilisateur.
 */
const uploadImages = async (uris, userId) => {
  const uploadPromises = uris.map(async (uri) => {
    const fileName = `${Date.now()}_${uri.split('/').pop()}`;
    const reference = storage().ref(`properties/${userId}/${fileName}`);
    await reference.putFile(uri);
    return reference.getDownloadURL();
  });

  return Promise.all(uploadPromises);
};
