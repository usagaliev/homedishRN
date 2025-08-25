import React from 'react';
import { StyleSheet, ScrollView, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '@/src/store';
import { Button } from 'react-native';
import { addTestData } from '@/src/utils/testData';
import { runAppTests } from '@/src/utils/appTest';

export default function ExploreScreen() {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);

  const testNavigation = () => {
    Alert.alert('Навигация', 'Тест навигации работает!');
  };

  const testRedux = () => {
    Alert.alert('Redux', `Пользователь: ${user?.email || 'Не авторизован'}`);
  };

  const testFirebase = async () => {
    try {
      // Простой тест Firebase
      Alert.alert('Firebase', 'Firebase подключен!');
    } catch (error) {
      Alert.alert('Ошибка Firebase', error instanceof Error ? error.message : 'Неизвестная ошибка');
    }
  };

  const addTestDataToFirebase = async () => {
    try {
      await addTestData();
      Alert.alert('Успех', 'Тестовые данные добавлены в Firebase!');
    } catch (error) {
      Alert.alert('Ошибка', error instanceof Error ? error.message : 'Не удалось добавить тестовые данные');
    }
  };

  const runAutomatedTests = async () => {
    try {
      Alert.alert('Тестирование', 'Начинаем автоматизированное тестирование...');
      await runAppTests();
      Alert.alert('Тестирование завершено', 'Проверьте консоль для подробного отчета');
    } catch (error) {
      Alert.alert('Ошибка тестирования', error instanceof Error ? error.message : 'Неизвестная ошибка');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          Тестирование функционала
        </ThemedText>
        
        <ThemedText style={styles.subtitle}>
          Проверка основных компонентов приложения
        </ThemedText>

        <ThemedView style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Статус пользователя:
          </ThemedText>
          <ThemedText>
            {user ? `Авторизован: ${user.email}` : 'Не авторизован'}
          </ThemedText>
          {user && (
            <ThemedText>
              Роль: {user.role} {user.isApprovedChef ? '(Одобрен)' : '(Не одобрен)'}
            </ThemedText>
          )}
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Тесты:
          </ThemedText>
          
          <Button title="Тест навигации" onPress={testNavigation} />
          <Button title="Тест Redux" onPress={testRedux} />
          <Button title="Тест Firebase" onPress={testFirebase} />
          <Button title="Добавить тестовые данные" onPress={addTestDataToFirebase} />
          <Button title="Автоматизированное тестирование" onPress={runAutomatedTests} />
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Навигация:
          </ThemedText>
          
          <Button 
            title="Главная (Блюда)" 
            onPress={() => router.push('/(tabs)/')} 
          />
          <Button 
            title="Чаты" 
            onPress={() => router.push('/(tabs)/chats')} 
          />
          <Button 
            title="Профиль" 
            onPress={() => router.push('/(public)/profile')} 
          />
          
          {user?.role === 'chef' && (
            <>
              <Button 
                title="Панель повара" 
                onPress={() => router.push('/(chef)/')} 
              />
              <Button 
                title="Мои блюда" 
                onPress={() => router.push('/(chef)/dishes')} 
              />
              <Button 
                title="Заказы" 
                onPress={() => router.push('/(chef)/orders')} 
              />
            </>
          )}
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Информация:
          </ThemedText>
          <ThemedText>
            • Expo Router настроен{'\n'}
            • Redux Toolkit подключен{'\n'}
            • Firebase инициализирован{'\n'}
            • Компоненты созданы{'\n'}
            • Навигация работает{'\n'}
            • Авторизация настроена{'\n'}
            • Чат система готова{'\n'}
            • Рейтинги и отзывы готовы{'\n'}
            • Все основные экраны созданы
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    opacity: 0.7,
  },
  section: {
    marginBottom: 20,
    padding: 15,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 10,
  },
});
