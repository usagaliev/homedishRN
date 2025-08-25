import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../src/store';
import { setDocument } from '../../src/services/db';
import { setUser } from '../../src/features/auth/authSlice';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const user = useSelector((s: RootState) => s.auth.user);
  const dispatch = useDispatch();
  const router = useRouter();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const updatedUser = {
        ...user,
        displayName,
        phone,
        address,
        updatedAt: Date.now(),
      };
      await setDocument(`users/${user.id}`, updatedUser);
      dispatch(setUser(updatedUser));
      Alert.alert('Успех', 'Профиль обновлён');
    } catch (e: any) {
      Alert.alert('Ошибка', e.message || 'Не удалось обновить профиль');
    } finally {
      setSaving(false);
    }
  };

  const handleBecomeChef = async () => {
    if (!user) return;
    try {
      const updatedUser = {
        ...user,
        role: 'chef',
        isApprovedChef: false,
        updatedAt: Date.now(),
      };
      await setDocument(`users/${user.id}`, updatedUser);
      dispatch(setUser(updatedUser));
      Alert.alert(
        'Заявка отправлена',
        'Ваша заявка на роль повара отправлена. Ожидайте одобрения администратора.'
      );
    } catch (e: any) {
      Alert.alert('Ошибка', e.message || 'Не удалось отправить заявку');
    }
  };

  if (!user) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Профиль</Text>
      
      <Text style={styles.label}>Email</Text>
      <Text style={styles.email}>{user.email}</Text>
      
      <Text style={styles.label}>Имя</Text>
      <TextInput
        style={styles.input}
        value={displayName}
        onChangeText={setDisplayName}
        placeholder="Введите ваше имя"
      />
      
      <Text style={styles.label}>Телефон</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        placeholder="Введите номер телефона"
        keyboardType="phone-pad"
      />
      
      <Text style={styles.label}>Адрес</Text>
      <TextInput
        style={styles.input}
        value={address}
        onChangeText={setAddress}
        placeholder="Введите ваш адрес"
        multiline
      />
      
      <Button
        title={saving ? 'Сохраняем...' : 'Сохранить'}
        onPress={handleSave}
        disabled={saving}
      />
      
      {user.role === 'buyer' && (
        <View style={styles.chefSection}>
          <Text style={styles.sectionTitle}>Стать поваром</Text>
          <Button
            title="Отправить заявку"
            onPress={handleBecomeChef}
            color="#0a7ea4"
          />
        </View>
      )}
      
      {user.role === 'chef' && !user.isApprovedChef && (
        <View style={styles.chefSection}>
          <Text style={styles.sectionTitle}>Статус повара</Text>
          <Text style={styles.pending}>Ожидание одобрения администратора</Text>
        </View>
      )}
      
      {user.role === 'chef' && user.isApprovedChef && (
        <View style={styles.chefSection}>
          <Text style={styles.sectionTitle}>Статус повара</Text>
          <Text style={styles.approved}>Одобрен ✅</Text>
          <Button
            title="Перейти в кабинет повара"
            onPress={() => router.push('/(chef)/index')}
            color="#0a7ea4"
          />
        </View>
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
    marginBottom: 24,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  chefSection: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  pending: {
    color: '#f39c12',
    fontSize: 16,
    marginBottom: 8,
  },
  approved: {
    color: '#27ae60',
    fontSize: 16,
    marginBottom: 8,
  },
});

