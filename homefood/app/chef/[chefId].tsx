import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../src/store';
import { getDocument, getDocuments } from '../../src/services/db';
import { getChefRating, getReviewsByChef } from '../../src/services/reviewsService';
import { setChefRatings, setReviews } from '../../src/features/reviews/reviewsSlice';
import { ReviewCard } from '../../src/components/ReviewCard';
import { RatingStars } from '../../src/components/RatingStars';
import { Ionicons } from '@expo/vector-icons';

export default function ChefProfileScreen() {
  const { chefId } = useLocalSearchParams();
  const [chef, setChef] = useState<any>(null);
  const [dishes, setDishes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dishes' | 'reviews'>('dishes');
  
  const user = useSelector((s: RootState) => s.auth.user);
  const reviews = useSelector((s: RootState) => s.reviews.reviews);
  const chefRatings = useSelector((s: RootState) => s.reviews.chefRatings);
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    const fetchChefData = async () => {
      if (!chefId) return;
      
      setLoading(true);
      try {
        const [chefData, dishesData, ratingData, reviewsData] = await Promise.all([
          getDocument(`users/${chefId}`),
          getDocuments(`dishes?chefId=${chefId}&status=active`),
          getChefRating(chefId as string),
          getReviewsByChef(chefId as string),
        ]);

        setChef(chefData);
        setDishes(dishesData);
        
        dispatch(setChefRatings({ [chefId as string]: ratingData }));
        dispatch(setReviews(reviewsData));
      } catch (error) {
        console.error('Error fetching chef data:', error);
        Alert.alert('Ошибка', 'Не удалось загрузить данные повара');
      } finally {
        setLoading(false);
      }
    };

    fetchChefData();
  }, [chefId, dispatch]);

  const handleDishPress = (dish: any) => {
    router.push(`/dish/${dish.id}`);
  };

  const handlePhotoPress = (photoUrl: string) => {
    // TODO: Открыть фото в полноэкранном режиме
    Alert.alert('Фото', 'Просмотр фото будет доступен в следующем обновлении');
  };

  const renderDishItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.dishItem} onPress={() => handleDishPress(item)}>
      <Image source={{ uri: item.photoURL }} style={styles.dishImage} />
      <View style={styles.dishInfo}>
        <Text style={styles.dishTitle}>{item.title}</Text>
        <Text style={styles.dishPrice}>{item.price} ₽</Text>
        <Text style={styles.dishDescription} numberOfLines={2}>
          {item.description}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderReviewItem = ({ item }: { item: any }) => (
    <ReviewCard
      review={item}
      onPhotoPress={handlePhotoPress}
      compact={true}
    />
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Загрузка профиля...</Text>
      </View>
    );
  }

  if (!chef) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Повар не найден</Text>
      </View>
    );
  }

  const rating = chefRatings[chefId as string] || { average: 0, count: 0 };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image 
          source={{ uri: chef.photoURL || 'https://via.placeholder.com/100' }} 
          style={styles.chefImage} 
        />
        <View style={styles.chefInfo}>
          <Text style={styles.chefName}>{chef.displayName}</Text>
          <View style={styles.ratingContainer}>
            <RatingStars rating={rating.average} readonly size={20} />
            <Text style={styles.ratingText}>
              {rating.average > 0 ? `${rating.average} (${rating.count} отзывов)` : 'Нет отзывов'}
            </Text>
          </View>
          {chef.address && (
            <Text style={styles.address}>📍 {chef.address}</Text>
          )}
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'dishes' && styles.activeTab]}
          onPress={() => setActiveTab('dishes')}
        >
          <Ionicons 
            name="restaurant" 
            size={20} 
            color={activeTab === 'dishes' ? '#0a7ea4' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'dishes' && styles.activeTabText]}>
            Блюда ({dishes.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'reviews' && styles.activeTab]}
          onPress={() => setActiveTab('reviews')}
        >
          <Ionicons 
            name="star" 
            size={20} 
            color={activeTab === 'reviews' ? '#0a7ea4' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'reviews' && styles.activeTabText]}>
            Отзывы ({reviews.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <FlatList
        data={activeTab === 'dishes' ? dishes : reviews}
        keyExtractor={item => item.id}
        renderItem={activeTab === 'dishes' ? renderDishItem : renderReviewItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
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
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  chefImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  chefInfo: {
    flex: 1,
  },
  chefName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  address: {
    fontSize: 14,
    color: '#666',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#0a7ea4',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  activeTabText: {
    color: '#0a7ea4',
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 12,
  },
  dishItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dishImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  dishInfo: {
    flex: 1,
  },
  dishTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  dishPrice: {
    fontSize: 16,
    color: '#0a7ea4',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  dishDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
});


