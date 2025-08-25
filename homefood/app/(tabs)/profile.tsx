import React from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '@/src/store';
import { Button } from 'react-native';

export default function ProfileTabScreen() {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);

  const handleEditProfile = () => {
    router.push('/(public)/profile');
  };

  const handleLogout = () => {
    Alert.alert(
      'Выход',
      'Вы уверены, что хотите выйти?',
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Выйти', onPress: () => router.push('/(auth)/login') }
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Профиль
      </ThemedText>
      
      {user && (
        <ThemedView style={styles.userInfo}>
          <ThemedText type="defaultSemiBold" style={styles.label}>
            Email:
          </ThemedText>
          <ThemedText style={styles.value}>{user.email}</ThemedText>
          
          <ThemedText type="defaultSemiBold" style={styles.label}>
            Имя:
          </ThemedText>
          <ThemedText style={styles.value}>{user.displayName || 'Не указано'}</ThemedText>
          
          <ThemedText type="defaultSemiBold" style={styles.label}>
            Роль:
          </ThemedText>
          <ThemedText style={styles.value}>
            {user.role === 'chef' ? 'Повар' : 'Покупатель'}
            {user.role === 'chef' && (
              <ThemedText style={styles.approvalStatus}>
                {user.isApprovedChef ? ' (Одобрен)' : ' (Ожидает одобрения)'}
              </ThemedText>
            )}
          </ThemedText>
        </ThemedView>
      )}

      <View style={styles.buttonContainer}>
        <Button 
          title="Редактировать профиль" 
          onPress={handleEditProfile}
        />
        
        <View style={styles.buttonSpacer} />
        
        <Button 
          title="Выйти" 
          onPress={handleLogout}
          color="#ff4444"
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  userInfo: {
    marginBottom: 30,
    padding: 15,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  label: {
    fontSize: 14,
    marginTop: 10,
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    marginBottom: 10,
  },
  approvalStatus: {
    fontSize: 14,
    opacity: 0.7,
  },
  buttonContainer: {
    marginTop: 20,
  },
  buttonSpacer: {
    height: 15,
  },
});

