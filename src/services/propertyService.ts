import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';

const db = firestore();
const propertiesCollection = db.collection('properties');

/**
 * Récupère toutes les annonces en appliquant des filtres.
 * @param {object} filters - Un objet contenant les filtres.
 */
export const getAllProperties = async (filters = {}) => {
  let query = propertiesCollection;

  if (filters.city) {
    query = query.where('city', '>=', filters.city).where('city', '<=', filters.city + '\uf8ff');
  }
  if (filters.propertyType) {
    query = query.where('propertyType', '==', filters.propertyType);
  }
  if (filters.minPrice) {
    query = query.where('price', '>=', parseFloat(filters.minPrice));
  }
  if (filters.maxPrice) {
    query = query.where('price', '<=', parseFloat(filters.maxPrice));
  }
  if (filters.bedrooms) {
    query = query.where('bedrooms', '>=', parseInt(filters.bedrooms, 10));
  }

  const snapshot = await query.get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * Récupère une seule annonce par son ID.
 * @param {string} propertyId - L'ID de l'annonce.
 */
export const getPropertyById = async (propertyId) => {
  const doc = await propertiesCollection.doc(propertyId).get();
  if (!doc.exists) {
    throw new Error("Annonce non trouvée.");
  }
  return { id: doc.id, ...doc.data() };
};

/**
 * Récupère les annonces d'un utilisateur spécifique.
 * @param {string} userId - L'ID de l'utilisateur.
 */
export const getUserProperties = async (userId) => {
  const snapshot = await propertiesCollection.where('ownerId', '==', userId).get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

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
 * Gère la suppression sécurisée d'une liste d'images sur Firebase Storage.
 * Ignore les erreurs "object-not-found".
 * @param {string[]} urls - Les URLs des images à supprimer.
 */
const deleteImagesSafely = async (urls) => {
    const deletePromises = urls.map(url => {
      if (typeof url === 'string' && url.includes('firebasestorage.googleapis.com')) {
        return storage().refFromURL(url).delete().catch(error => {
          // Si l'objet n'est pas trouvé, on considère que la suppression est réussie.
          if (error.code === 'storage/object-not-found') {
            console.log(`Image déjà supprimée ou inexistante : ${url}`);
            return;
          }
          // Pour les autres erreurs, on les logue mais on ne bloque pas le processus.
          console.error(`Erreur lors de la suppression de l'image ${url}:`, error);
        });
      }
      return Promise.resolve();
    });
    await Promise.all(deletePromises);
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

    const originalDoc = await propertiesCollection.doc(propertyId).get();
    const originalImageUrls = originalDoc.data().imageUrls || [];

    const imagesToDelete = originalImageUrls.filter(url => !existingImageUrls.includes(url));
    await deleteImagesSafely(imagesToDelete);

    const newUploadedUrls = await uploadImages(newImageUris, user.uid);

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
  const propertyDoc = await propertiesCollection.doc(propertyId).get();
  if (!propertyDoc.exists) {
    console.warn("Tentative de suppression d'une annonce déjà supprimée.");
    return; // Pas besoin de lever une erreur, l'objectif est atteint.
  }

  const { imageUrls } = propertyDoc.data();
  if (imageUrls && imageUrls.length > 0) {
    await deleteImagesSafely(imageUrls);
  }

  return propertiesCollection.doc(propertyId).delete();
};

/**
 * Téléverse les images vers Firebase Storage et retourne leurs URLs.
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
