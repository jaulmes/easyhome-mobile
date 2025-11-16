import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';

const db = firestore();
const propertiesCollection = db.collection('properties');

/**
 * Récupère toutes les annonces en appliquant des filtres.
 * @param {object} filters - Un objet contenant les filtres.
 * Ex: { city: 'Paris', minPrice: 1000, maxPrice: 2000, bedrooms: 3, propertyType: 'Appartement' }
 */
export const getAllProperties = async (filters = {}) => {
  let query = propertiesCollection;

  if (filters.city) {
    // Firestore ne supporte pas la recherche de sous-chaînes, donc on cherche une correspondance exacte (insensible à la casse)
    // Pour une recherche plus avancée, il faudrait un service comme Algolia.
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
 * Met à jour une annonce existante.
 * Ne gère pas la mise à jour des images pour le moment.
 * @param {string} propertyId - L'ID de l'annonce à mettre à jour.
 * @param {object} propertyData - Les nouvelles données de l'annonce.
 */
export const updateProperty = async (propertyId, propertyData) => {
  return propertiesCollection.doc(propertyId).update(propertyData);
};

/**
 * Supprime une annonce et toutes les images associées.
 * @param {string} propertyId - L'ID de l'annonce à supprimer.
 */
export const deleteProperty = async (propertyId) => {
  const propertyDoc = await propertiesCollection.doc(propertyId).get();
  if (!propertyDoc.exists) {
    throw new Error("Annonce non trouvée.");
  }

  const { imageUrls } = propertyDoc.data();

  // 1. Supprimer les images de Firebase Storage
  if (imageUrls && imageUrls.length > 0) {
    const deletePromises = imageUrls.map(url => {
      // Pour éviter les erreurs si l'URL est malformée, on s'assure qu'elle est valide
      if (typeof url === 'string' && url.includes('firebasestorage.googleapis.com')) {
        return storage().refFromURL(url).delete();
      }
      return Promise.resolve(); // Ignore les URLs invalides
    });

    try {
      await Promise.all(deletePromises);
      console.log("Images associées supprimées avec succès.");
    } catch (error) {
      console.error("Erreur lors de la suppression d'une image :", error);
      // On continue même si une image ne peut être supprimée pour ne pas bloquer
    }
  }

  // 2. Supprimer le document de Firestore
  return propertiesCollection.doc(propertyId).delete();
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
