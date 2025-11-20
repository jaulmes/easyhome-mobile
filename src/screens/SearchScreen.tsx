import React, { useState, useEffect } from 'react';
import { View, FlatList, TextInput, Text, TouchableOpacity } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import PropertyCard from '../components/PropertyCard';

const SearchScreen = () => {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [city, setCity] = useState('');
  const [type, setType] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [rooms, setRooms] = useState('');

  useEffect(() => {
    const subscriber = firestore()
      .collection('properties')
      .onSnapshot(querySnapshot => {
        const properties = [];
        querySnapshot.forEach(documentSnapshot => {
          properties.push({
            id: documentSnapshot.id,
            ...documentSnapshot.data(),
          });
        });
        setProperties(properties);
        setFilteredProperties(properties);
      });

    return () => subscriber();
  }, []);

  const applyFilters = () => {
      let filtered = properties;

      if (searchQuery) {
          filtered = filtered.filter(p =>
              p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.location.neighborhood.toLowerCase().includes(searchQuery.toLowerCase())
          );
      }
      if (city) {
          filtered = filtered.filter(p => p.location.city.toLowerCase().includes(city.toLowerCase()));
      }
      if (type) {
          filtered = filtered.filter(p => p.type.toLowerCase() === type.toLowerCase());
      }
      if (minPrice) {
          filtered = filtered.filter(p => p.price >= parseInt(minPrice, 10));
      }
      if (maxPrice) {
          filtered = filtered.filter(p => p.price <= parseInt(maxPrice, 10));
      }
      if (rooms) {
          filtered = filtered.filter(p => p.details.rooms === parseInt(rooms, 10));
      }

      setFilteredProperties(filtered);
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="p-4 bg-white border-b border-gray-200">
        <TextInput
          className="bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 text-gray-700 mb-4"
          placeholder="Search by title or neighborhood"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <View className="flex-row justify-between mb-2">
            <TextInput className="bg-gray-100 border-gray-300 rounded-lg px-4 py-2 text-sm w-[48%]" placeholder="City" value={city} onChangeText={setCity} />
            <TextInput className="bg-gray-100 border-gray-300 rounded-lg px-4 py-2 text-sm w-[48%]" placeholder="Type (e.g., apartment)" value={type} onChangeText={setType} />
        </View>
        <View className="flex-row justify-between mb-2">
            <TextInput className="bg-gray-100 border-gray-300 rounded-lg px-4 py-2 text-sm w-[48%]" placeholder="Min Price" value={minPrice} onChangeText={setMinPrice} keyboardType="numeric" />
            <TextInput className="bg-gray-100 border-gray-300 rounded-lg px-4 py-2 text-sm w-[48%]" placeholder="Max Price" value={maxPrice} onChangeText={setMaxPrice} keyboardType="numeric" />
        </View>
        <TextInput className="bg-gray-100 border-gray-300 rounded-lg px-4 py-2 text-sm mb-4" placeholder="Number of Rooms" value={rooms} onChangeText={setRooms} keyboardType="numeric" />

        <TouchableOpacity className="bg-blue-600 rounded-lg py-3" onPress={applyFilters}>
            <Text className="text-white text-center font-bold">Apply Filters</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={filteredProperties}
        renderItem={({ item }) => <PropertyCard property={item} />}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
};

export default SearchScreen;