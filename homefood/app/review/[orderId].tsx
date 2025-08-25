import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  Alert,
  KeyboardAvoidingView,
  Platform 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../src/store';
import { RatingStars } from '../../src/components/RatingStars';
import { createReview } from '../../src/services/reviewsService';
import { addReview } from '../../src/features/reviews/reviewsSlice';
import { getDocument } from '../../src/services/db';

export default function ReviewScreen() {
  const { orderId } = useLocalSearchParams();
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [dish, setDish] = useState<any>(null);
  
  const user = useSelector((s: RootState) => s.auth.user);
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    const fetchOrderData = async () => {
      if (!orderId) return;
      
      try {
        const orderData = await getDocument(`orders/${orderId}`);
        setOrder(orderData);
        
        if (orderData?.dishId) {
          const dishData = await getDocument(`dishes/${orderData.dishId}`);
          setDish(dishData);
        }
      } catch (error) {
        console.error('Error fetching order data:', error);
        Alert.alert('Ошибка', 'Не удалось загрузить данные заказа');
      }
    };

    fetchOrderData();
  }, [orderId]);

  const handleAddPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        setPhotos(prev => [...prev, imageUri]);
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось выбрать фото');
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!user || !orderId || !order) return;
    
    if (rating === 0) {
      Alert.alert('Ошибка', 'Пожалуйста, поставьте оценку');
      return;
    }

    if (!text.trim()) {
      Alert.alert('Ошибка', 'Пожалуйста, напишите отзыв');
      return;
    }

    setLoading(true);
    try {
      const reviewData = {
        orderId: orderId as string,
        chefId: order.chefId,
        buyerId: user.id,
        dishId: order.dishId,
        rating,
        text: text.trim(),
        photos: photos.length > 0 ? photos : undefined,
      };

      const reviewId = await createReview(reviewData);
      
      const newReview = {
        id: reviewId,
        ...reviewData,
        createdAt: Date.now(),
        moderated: false,
      };

      dispatch(addReview(newReview));
      
      Alert.alert(
        'Успешно!', 
        'Ваш отзыв отправлен на модерацию',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      Alert.alert('Ошибка', error.message || 'Не удалось отправить отзыв');
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = rating > 0 && text.trim().length > 0 && !loading;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Оставить отзыв</Text>
          {dish && (
            <View style={styles.dishInfo}>
              <Image source={{ uri: dish.photoURL }} style={styles.dishImage} />
              <View style={styles.dishDetails}>
                <Text style={styles.dishTitle}>{dish.title}</Text>
                <Text style={styles.dishPrice}>{dish.price} ₽</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.ratingSection}>
          <Text style={styles.sectionTitle}>Ваша оценка</Text>
          <RatingStars
            rating={rating}
            onRatingChange={setRating}
            size={32}
          />
          <Text style={styles.ratingText}>
            {rating > 0 ? `${rating} из 5 звезд` : 'Поставьте оценку'}
          </Text>
        </View>

        <View style={styles.textSection}>
          <Text style={styles.sectionTitle}>Ваш отзыв</Text>
          <TextInput
            style={styles.textInput}
            value={text}
            onChangeText={setText}
            placeholder="Расскажите о вашем опыте..."
            multiline
            numberOfLines={6}
            maxLength={1000}
          />
          <Text style={styles.charCount}>{text.length}/1000</Text>
        </View>

        <View style={styles.photosSection}>
          <Text style={styles.sectionTitle}>Фото (необязательно)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosContainer}>
            {photos.map((photo, index) => (
              <View key={index} style={styles.photoContainer}>
                <Image source={{ uri: photo }} style={styles.photo} />
                <TouchableOpacity
                  style={styles.removePhotoButton}
                  onPress={() => handleRemovePhoto(index)}
                >
                  <Ionicons name="close-circle" size={24} color="#ff4444" />
                </TouchableOpacity>
              </View>
            ))}
            {photos.length < 5 && (
              <TouchableOpacity style={styles.addPhotoButton} onPress={handleAddPhoto}>
                <Ionicons name="camera" size={32} color="#666" />
                <Text style={styles.addPhotoText}>Добавить фото</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, canSubmit && styles.submitButtonActive]}
          onPress={handleSubmit}
          disabled={!canSubmit}
        >
          <Text style={[styles.submitButtonText, canSubmit && styles.submitButtonTextActive]}>
            {loading ? 'Отправка...' : 'Отправить отзыв'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  dishInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dishImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  dishDetails: {
    flex: 1,
  },
  dishTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  dishPrice: {
    fontSize: 14,
    color: '#666',
  },
  ratingSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 12,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  ratingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  textSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginTop: 4,
  },
  photosSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 12,
  },
  photosContainer: {
    marginTop: 12,
  },
  photoContainer: {
    marginRight: 12,
    position: 'relative',
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  addPhotoButton: {
    width: 80,
    height: 80,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addPhotoText: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#ccc',
    padding: 16,
    borderRadius: 8,
    margin: 20,
    alignItems: 'center',
  },
  submitButtonActive: {
    backgroundColor: '#0a7ea4',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  submitButtonTextActive: {
    color: '#fff',
  },
});


