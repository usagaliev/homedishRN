import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Button } from 'react-native';
import * as Location from 'expo-location';
import { useDispatch, useSelector } from 'react-redux';
import { setLocation } from '../../src/features/user/userSlice';
import { setDishes, setLoading } from '../../src/features/dishes/dishesSlice';
import { RootState } from '../../src/store';
import { queryCollection } from '../../src/services/db';
import { getDistanceKm } from '../../src/utils/geo';
import { DishCard } from '../../src/components/DishCard';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { EmptyState } from '../../src/components/EmptyState';

const categories = [
  { label: 'Все', value: '' },
  { label: 'Супы', value: 'soup' },
  { label: 'Выпечка', value: 'bakery' },
  { label: 'Основные', value: 'main' },
  { label: 'Салаты', value: 'salad' },
  { label: 'Веган', value: 'vegan' },
  { label: 'Другое', value: 'other' },
];
const radii = [3, 5, 10];

export default function HomeScreen() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { list: dishes, loading } = useSelector((s: RootState) => s.dishes);
  const userLocation = useSelector((s: RootState) => s.user.location);
  const user = useSelector((s: RootState) => s.auth.user);
  const [category, setCategory] = useState('');
  const [radius, setRadius] = useState(5);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('user:', user);
  }, [user]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Нет доступа к геолокации');
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      dispatch(setLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude }));
    })();
  }, []);

  useEffect(() => {
    const fetchDishes = async () => {
      dispatch(setLoading(true));
      let constraints = [];
      if (category) {
        constraints.push({ field: 'category', op: '==', value: category });
      }
      const allDishes = await queryCollection('dishes');
      const filtered = allDishes.filter((d: any) => d.status === 'active' && (!category || d.category === category));
      dispatch(setDishes(filtered));
      dispatch(setLoading(false));
    };
    fetchDishes();
  }, [category, dispatch]);

  const filteredDishes = dishes.filter((dish: any) => {
    if (!userLocation || !dish.location) return true;
    const dist = getDistanceKm(userLocation.lat, userLocation.lng, dish.location.lat, dish.location.lng);
    return dist <= radius;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Блюда рядом</Text>
        <Button title="Профиль" onPress={() => router.push('/(public)/profile')} />
      </View>
      <Text style={{ color: 'red', fontSize: 12, marginBottom: 8 }}>user: {JSON.stringify(user)}</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.filters}>
        <Picker
          selectedValue={category}
          style={styles.picker}
          onValueChange={setCategory}
        >
          {categories.map(c => (
            <Picker.Item key={c.value} label={c.label} value={c.value} />
          ))}
        </Picker>
        <Picker
          selectedValue={radius}
          style={styles.picker}
          onValueChange={setRadius}
        >
          {radii.map(r => (
            <Picker.Item key={r} label={r + ' км'} value={r} />
          ))}
        </Picker>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#0a7ea4" />
      ) : (
        <FlatList
          data={filteredDishes}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <DishCard
              id={item.id}
              title={item.title}
              price={item.price}
              category={item.category}
              photoURL={item.photoURL}
              distanceKm={userLocation && item.location ? getDistanceKm(userLocation.lat, userLocation.lng, item.location.lat, item.location.lng) : undefined}
              onPress={() => router.push(`/dish/${item.id}`)}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              title="Нет блюд поблизости"
              description="Попробуйте увеличить радиус поиска или изменить фильтры"
              icon="🍽️"
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 24,
    paddingHorizontal: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  filters: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  picker: {
    flex: 1,
    height: 44,
    marginHorizontal: 4,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 8,
  },
  empty: {
    textAlign: 'center',
    color: '#888',
    marginTop: 32,
    fontSize: 18,
  },
});
