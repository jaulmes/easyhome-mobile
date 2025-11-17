import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/Ionicons';

const ReservationsScreen = () => {
  const [reservations, setReservations] = useState([]);
  const user = auth().currentUser;
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    if (user) {
      const userDoc = firestore().collection('users').doc(user.uid);
      const unsubscribeUser = userDoc.onSnapshot(doc => {
        if (doc.exists) {
          setUserRole(doc.data().role);
        }
      });

      const subscriber = firestore()
        .collection('reservations')
        .where('participantIds', 'array-contains', user.uid)
        .onSnapshot(querySnapshot => {
          const reservations = [];
          querySnapshot.forEach(documentSnapshot => {
            reservations.push({
              id: documentSnapshot.id,
              ...documentSnapshot.data(),
            });
          });
          setReservations(reservations);
        });

      return () => {
        unsubscribeUser();
        subscriber();
      }
    }
  }, [user]);

  const handleUpdateStatus = (reservationId, status) => {
    firestore().collection('reservations').doc(reservationId).update({ status })
      .then(() => Alert.alert('Success', `Reservation ${status}.`))
      .catch(error => Alert.alert('Error', error.message));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'orange';
      case 'accepted': return 'green';
      case 'rejected': return 'red';
      default: return 'gray';
    }
  };

  const renderItem = ({ item }) => (
    <View className="bg-white rounded-xl shadow-md p-4 mb-4">
      <Text className="text-lg font-bold text-gray-800 mb-2">{item.propertyTitle}</Text>
      <Text className="text-gray-600 mb-1">Tenant: {item.tenantName}</Text>
      <Text className="text-gray-600 mb-2">Visit Date: {new Date(item.visitDate).toLocaleDateString()}</Text>
      <View className="flex-row items-center">
          <View className={`w-3 h-3 rounded-full mr-2`} style={{backgroundColor: getStatusColor(item.status)}} />
          <Text className="font-semibold capitalize" style={{color: getStatusColor(item.status)}}>{item.status}</Text>
      </View>

      {userRole === 'landlord' && item.status === 'pending' && (
        <View className="flex-row justify-end mt-4">
          <TouchableOpacity onPress={() => handleUpdateStatus(item.id, 'accepted')} className="bg-green-500 py-2 px-4 rounded-lg mr-2">
            <Text className="text-white font-bold">Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleUpdateStatus(item.id, 'rejected')} className="bg-red-500 py-2 px-4 rounded-lg">
            <Text className="text-white font-bold">Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
       <View className="p-4 bg-white border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-800">Reservations</Text>
      </View>
      <FlatList
        data={reservations}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
};

export default ReservationsScreen;