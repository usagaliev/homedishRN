import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../src/store';
import { getDocuments } from '../../src/services/db';
import { DishCard } from '../../src/components/DishCard';
import { setDishes } from '../../src/features/dishes/dishesSlice';
import { Dish } from '../../src/utils/types';
import { Ionicons } from '@expo/vector-icons';

const categories = [
  { id: 'all', name: 'Все', icon: 'restaurant' },
  { id: 'soup', name: 'Супы', icon: 'bowl' },
  { id: 'main', name: 'Основные', icon: 'restaurant' },
  { id: 'salad', name: 'Салаты', icon: 'leaf' },
  { id: 'bakery', name: 'Выпечка', icon: 'bread' },
  { id: 'vegan', name: 'Веган', icon: 'leaf' },
  { id: 'other', name: 'Другое', icon: 'ellipsis-horizontal' },
];

export default function HomeScreen() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const dishes = useSelector((s: RootState) => s.dishes.list);
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    fetchDishes();
  }, []);

  const fetchDishes = async () => {
    setLoading(true);
    try {
      const dishesData = await getDocuments('dishes?status=active') as Dish[];
      dispatch(setDishes(dishesData));
    } catch (error) {
      console.error('Error fetching dishes:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить блюда');
    } finally {
      setLoading(false);
    }
  };

  const filteredDishes = selectedCategory === 'all' 
    ? dishes 
    : dishes.filter(dish => dish.category === selectedCategory);

  const handleDishPress = (dish: Dish) => {
    router.push(`/dish/${dish.id}`);
  };

  const renderCategoryItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory === item.id && styles.selectedCategory
      ]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <Ionicons
        name={item.icon as any}
        size={24}
        color={selectedCategory === item.id ? '#fff' : '#666'}
      />
      <Text style={[
        styles.categoryText,
        selectedCategory === item.id && styles.selectedCategoryText
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderDishItem = ({ item }: { item: any }) => (
    <DishCard dish={item} onPress={() => handleDishPress(item)} />
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Загрузка блюд...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Домашняя еда</Text>
        <TouchableOpacity onPress={() => router.push('/chats')}>
          <Ionicons name="chatbubbles" size={24} color="#0a7ea4" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={categories}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={renderCategoryItem}
        keyExtractor={item => item.id}
        style={styles.categoriesList}
        contentContainerStyle={styles.categoriesContainer}
      />

      <FlatList
        data={filteredDishes}
        renderItem={renderDishItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.dishesList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {selectedCategory === 'all' 
                ? 'Пока нет доступных блюд' 
                : `Нет блюд в категории "${categories.find(c => c.id === selectedCategory)?.name}"`
              }
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  categoriesList: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryItem: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#f8f8f8',
  },
  selectedCategory: {
    backgroundColor: '#0a7ea4',
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  selectedCategoryText: {
    color: '#fff',
  },
  dishesList: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
