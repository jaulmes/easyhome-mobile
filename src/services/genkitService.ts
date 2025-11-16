import functions from '@react-native-firebase/functions';

/**
 * Appelle le flow Genkit 'suggestProperties' pour obtenir des suggestions personnalisées.
 * @param {object} filters - Les filtres de recherche actifs, le cas échéant.
 * @returns {Promise<any>} La liste des propriétés suggérées.
 */
export const suggestProperties = async (filters = {}) => {
  try {
    // Note : Pour les tests, il est parfois utile de se connecter à l'émulateur local.
    // functions().useEmulator('localhost', 5001);
    const getSuggestions = functions().httpsCallable('suggestProperties');
    const result = await getSuggestions(filters);
    return result.data;
  } catch (error) {
    console.error("Erreur lors de l'appel à suggestProperties:", error);
    // Retourner un tableau vide en cas d'erreur pour ne pas planter l'UI
    return [];
  }
};

/**
 * Appelle le flow Genkit 'findSimilarProperties' pour trouver des biens similaires.
 * @param {string} propertyId - L'ID de la propriété actuelle.
 * @returns {Promise<any>} La liste des propriétés similaires.
 */
export const findSimilarProperties = async (propertyId) => {
  try {
    const findSimilar = functions().httpsCallable('findSimilarProperties');
    const result = await findSimilar({ propertyId });
    return result.data;
  } catch (error) {
    console.error("Erreur lors de l'appel à findSimilarProperties:", error);
    return [];
  }
};
