import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

interface DishCardProps {
  id: string;
  title: string;
  price: number;
  category: string;
  photoURL: string;
  distanceKm?: number;
  onPress: () => void;
}

export const DishCard: React.FC<DishCardProps> = ({ id, title, price, category, photoURL, distanceKm, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image source={{ uri: photoURL }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.price}>{price} ₽</Text>
        <Text style={styles.category}>{category}</Text>
        {distanceKm !== undefined && (
          <Text style={styles.distance}>{distanceKm.toFixed(1)} км</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    overflow: 'hidden',
  },
  image: {
    width: 100,
    height: 100,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  info: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  price: {
    fontSize: 16,
    color: '#0a7ea4',
    marginTop: 4,
  },
  category: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  distance: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});
