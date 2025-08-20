import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../../src/store';
import { queryCollection } from '../../src/services/db';

export default function ChefDashboard() {
  const router = useRouter();
  const user = useSelector((s: RootState) => s.auth.user);
  const [dishCount, setDishCount] = useState(0);
  const [activeOrders, setActiveOrders] = useState(0);
  const [completedOrders, setCompletedOrders] = useState(0);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const dishes = await queryCollection('dishes');
      setDishCount(dishes.filter((d: any) => d.chefId === user.id).length);
      const orders = await queryCollection('orders');
      setActiveOrders(orders.filter((o: any) => o.chefId === user.id && ['pending','accepted','ready','picked_up'].includes(o.status)).length);
      setCompletedOrders(orders.filter((o: any) => o.chefId === user.id && o.status === 'completed').length);
    })();
  }, [user]);

  if (!user) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Дашборд повара</Text>
      <View style={styles.metrics}>
        <Text style={styles.metric}>Мои блюда: {dishCount}</Text>
        <Text style={styles.metric}>Активных заказов: {activeOrders}</Text>
        <Text style={styles.metric}>Завершённых заказов: {completedOrders}</Text>
      </View>
      <Button title="Мои блюда" onPress={() => router.push('/(chef)/dishes')} />
      <Button title="Мои заказы" onPress={() => router.push('/(chef)/orders')} />
      <Button title="Добавить блюдо" onPress={() => router.push('/(chef)/dish-edit')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  metrics: {
    marginBottom: 24,
  },
  metric: {
    fontSize: 18,
    marginBottom: 8,
    textAlign: 'center',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 32,
    fontSize: 18,
  },
});
