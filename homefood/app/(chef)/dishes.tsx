import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../../src/store';
import { queryCollection } from '../../src/services/db';
import { DishCard } from '../../src/components/DishCard';

export default function ChefDishesScreen() {
  const router = useRouter();
  const user = useSelector((s: RootState) => s.auth.user);
  const [dishes, setDishes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const allDishes = await queryCollection('dishes');
      setDishes(allDishes.filter((d: any) => d.chefId === user.id));
      setLoading(false);
    })();
  }, [user]);

  if (!user) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Мои блюда</Text>
      <Button title="Новое блюдо" onPress={() => router.push('/(chef)/dish-edit')} />
      {loading ? (
        <Text style={styles.loading}>Загрузка...</Text>
      ) : (
        <FlatList
          data={dishes}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.dishRow}>
              <DishCard
                id={item.id}
                title={item.title}
                price={item.price}
                category={item.category}
                photoURL={item.photoURL}
                onPress={() => router.push(`/dish/${item.id}`)}
              />
              <TouchableOpacity style={styles.editBtn} onPress={() => router.push({ pathname: '/(chef)/dish-edit', params: { dishId: item.id } })}>
                <Text style={styles.editText}>Редактировать</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.empty}>Нет блюд</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  dishRow: {
    marginBottom: 16,
  },
  editBtn: {
    alignSelf: 'flex-end',
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#0a7ea4',
    borderRadius: 6,
  },
  editText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loading: {
    textAlign: 'center',
    marginTop: 32,
    fontSize: 18,
  },
  empty: {
    textAlign: 'center',
    color: '#888',
    marginTop: 32,
    fontSize: 18,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 32,
    fontSize: 18,
  },
});
