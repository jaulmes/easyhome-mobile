import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const db = firestore();
const reservationsCollection = db.collection('reservations');

/**
 * Crée une nouvelle demande de réservation.
 * @param {string} propertyId - L'ID de l'annonce.
 * @param {string} ownerId - L'ID du propriétaire.
 * @param {object} propertyInfo - Infos de base de l'annonce (titre, image).
 */
export const createReservation = async (propertyId, ownerId, propertyInfo) => {
  const user = auth().currentUser;
  if (!user) throw new Error("Utilisateur non authentifié.");

  const reservationData = {
    propertyId,
    ownerId,
    tenantId: user.uid,
    tenantName: user.displayName,
    propertyInfo,
    status: 'pending', // 'pending', 'accepted', 'rejected'
    createdAt: firestore.FieldValue.serverTimestamp(),
  };

  return reservationsCollection.add(reservationData);
};

/**
 * Récupère les réservations pour un utilisateur (en tant que locataire ou propriétaire).
 * @param {string} userId - L'ID de l'utilisateur.
 */
export const getUserReservations = async (userId) => {
  // Requête pour les réservations où l'utilisateur est le locataire
  const asTenantQuery = reservationsCollection.where('tenantId', '==', userId).get();

  // Requête pour les réservations où l'utilisateur est le propriétaire
  const asOwnerQuery = reservationsCollection.where('ownerId', '==', userId).get();

  const [tenantSnapshot, ownerSnapshot] = await Promise.all([asTenantQuery, asOwnerQuery]);

  const reservations = [];
  tenantSnapshot.forEach(doc => reservations.push({ id: doc.id, ...doc.data() }));
  ownerSnapshot.forEach(doc => reservations.push({ id: doc.id, ...doc.data() }));

  // Trier par date de création
  return reservations.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
};

/**
 * Met à jour le statut d'une réservation.
 * @param {string} reservationId - L'ID de la réservation.
 * @param {'accepted' | 'rejected'} status - Le nouveau statut.
 */
export const updateReservationStatus = (reservationId, status) => {
  return reservationsCollection.doc(reservationId).update({ status });
};
