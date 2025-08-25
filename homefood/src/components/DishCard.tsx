import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { RatingStars } from './RatingStars';
import { Dish } from '../utils/types';

interface DishCardProps {
  dish: Dish;
  onPress?: () => void;
}

export const DishCard: React.FC<DishCardProps> = ({ dish, onPress }) => {
  const router = useRouter();
  const chefRatings = useSelector((s: RootState) => s.reviews.chefRatings);
  const rating = chefRatings[dish.chefId] || { average: 0, count: 0 };

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/dish/${dish.id}`);
    }
  };

  const handleChefPress = () => {
    router.push(`/chef/${dish.chefId}`);
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <Image source={{ uri: dish.photoURL }} style={styles.image} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={2}>
            {dish.title}
          </Text>
          <Text style={styles.price}>{dish.price} ₽</Text>
        </View>
        
        <Text style={styles.description} numberOfLines={2}>
          {dish.description}
        </Text>
        
        <TouchableOpacity style={styles.chefInfo} onPress={handleChefPress}>
          <View style={styles.ratingContainer}>
            <RatingStars rating={rating.average} readonly size={12} />
            <Text style={styles.ratingText}>
              {rating.average > 0 ? `${rating.average} (${rating.count})` : 'Нет отзывов'}
            </Text>
          </View>
        </TouchableOpacity>
        
        <View style={styles.footer}>
          <Text style={styles.category}>{dish.category}</Text>
          <Text style={styles.available}>
            Доступно: {dish.availableQty}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0a7ea4',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  chefInfo: {
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  category: {
    fontSize: 12,
    color: '#0a7ea4',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    textTransform: 'capitalize',
  },
  available: {
    fontSize: 12,
    color: '#666',
  },
});
