import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Review } from '../utils/types';
import { RatingStars } from './RatingStars';

interface ReviewCardProps {
  review: Review;
  showPhotos?: boolean;
  onPhotoPress?: (photoUrl: string) => void;
  compact?: boolean;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  showPhotos = true,
  onPhotoPress,
  compact = false,
}) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderPhotos = () => {
    if (!showPhotos || !review.photos || review.photos.length === 0) {
      return null;
    }

    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosContainer}>
        {review.photos.map((photo, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => onPhotoPress?.(photo)}
            style={styles.photoContainer}
          >
            <Image source={{ uri: photo }} style={styles.photo} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  return (
    <View style={[styles.container, compact && styles.compactContainer]}>
      <View style={styles.header}>
        <View style={styles.ratingContainer}>
          <RatingStars rating={review.rating} readonly size={16} />
          <Text style={styles.ratingText}>{review.rating.toFixed(1)}</Text>
        </View>
        <Text style={styles.dateText}>{formatDate(review.createdAt)}</Text>
      </View>
      
      {review.text && (
        <Text style={[styles.reviewText, compact && styles.compactText]} numberOfLines={compact ? 2 : undefined}>
          {review.text}
        </Text>
      )}
      
      {renderPhotos()}
      
      {!review.moderated && (
        <View style={styles.moderationBadge}>
          <Ionicons name="time" size={12} color="#FF9800" />
          <Text style={styles.moderationText}>На модерации</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  compactContainer: {
    padding: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  dateText: {
    fontSize: 12,
    color: '#666',
  },
  reviewText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 8,
  },
  compactText: {
    fontSize: 13,
    lineHeight: 18,
  },
  photosContainer: {
    marginTop: 8,
  },
  photoContainer: {
    marginRight: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  moderationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  moderationText: {
    fontSize: 12,
    color: '#FF9800',
    marginLeft: 4,
  },
});


