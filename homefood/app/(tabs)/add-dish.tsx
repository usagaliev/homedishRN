import React from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useRouter } from 'expo-router';
import { Button } from 'react-native';

export default function AddDishScreen() {
  const router = useRouter();

  const handleAddDish = () => {
    router.push('/(chef)/dish-edit');
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Добавить новое блюдо
      </ThemedText>
      
      <ThemedText style={styles.subtitle}>
        Создайте новое блюдо для продажи
      </ThemedText>

      <View style={styles.buttonContainer}>
        <Button 
          title="Создать блюдо" 
          onPress={handleAddDish}
        />
      </View>

      <ThemedText style={styles.info}>
        Здесь вы можете быстро добавить новое блюдо в свой каталог
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
    opacity: 0.7,
  },
  buttonContainer: {
    marginBottom: 30,
    width: '100%',
  },
  info: {
    textAlign: 'center',
    opacity: 0.6,
  },
});

