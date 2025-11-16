import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import { getUserReservations, updateReservationStatus } from '../services/reservationService';
import ReservationCard from '../components/ReservationCard';

const ReservationsScreen = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = auth().currentUser;

  const fetchReservations = useCallback(async () => {
    if (!user) {
      setError("Vous devez être connecté pour voir vos réservations.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const userReservations = await getUserReservations(user.uid);
      setReservations(userReservations);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les réservations.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(fetchReservations);

  const handleStatusUpdate = async (reservationId, newStatus) => {
    try {
      await updateReservationStatus(reservationId, newStatus);
      // Mettre à jour l'état local pour refléter le changement
      setReservations(prev =>
        prev.map(res =>
          res.id === reservationId ? { ...res, status: newStatus } : res
        )
      );
      Alert.alert('Succès', `La réservation a été ${newStatus === 'accepted' ? 'acceptée' : 'refusée'}.`);
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', 'La mise à jour du statut a échoué.');
    }
  };

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator size="large" color="#007AFF" className="mt-10" />;
    }

    if (error) {
      return <Text className="text-red-500 text-lg text-center mt-10">{error}</Text>;
    }

    if (reservations.length === 0) {
      return (
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-600 text-lg">Vous n'avez aucune réservation.</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={reservations}
        renderItem={({ item }) => (
          <ReservationCard
            reservation={item}
            onAccept={() => handleStatusUpdate(item.id, 'accepted')}
            onReject={() => handleStatusUpdate(item.id, 'rejected')}
          />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
      />
    );
  };

  return (
    <View className="flex-1 bg-gray-100">
      <View className="bg-white p-4 shadow-md">
        <Text className="text-3xl font-bold text-gray-800">Mes Réservations</Text>
      </View>
      {renderContent()}
    </View>
  );
};

export default ReservationsScreen;
