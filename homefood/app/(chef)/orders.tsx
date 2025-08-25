import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Button, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../src/store';
import { queryCollection, updateDocument } from '../../src/services/db';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { EmptyState } from '../../src/components/EmptyState';

const statusTabs = [
  { label: 'Ожидание', value: 'pending' },
  { label: 'Приняты', value: 'accepted' },
  { label: 'Готово', value: 'ready' },
  { label: 'Забрано', value: 'picked_up' },
  { label: 'Завершён', value: 'completed' },
  { label: 'Отклонён', value: 'rejected' },
  { label: 'Отменён', value: 'cancelled' },
];

const nextStatus: Record<string, string | null> = {
  pending: 'accepted',
  accepted: 'ready',
  ready: 'picked_up',
  picked_up: 'completed',
};

export default function ChefOrdersScreen() {
  const user = useSelector((s: RootState) => s.auth.user);
  const [orders, setOrders] = useState<any[]>([]);
  const [status, setStatus] = useState('pending');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const allOrders = await queryCollection('orders');
      setOrders(allOrders.filter((o: any) => o.chefId === user.id));
      setLoading(false);
    })();
  }, [user]);

  const filtered = orders.filter(o => o.status === status);

  const handleStatus = async (orderId: string, currentStatus: string, action: 'next' | 'reject' | 'cancel') => {
    let newStatus = '';
    if (action === 'next') newStatus = nextStatus[currentStatus] || '';
    if (action === 'reject') newStatus = 'rejected';
    if (action === 'cancel') newStatus = 'cancelled';
    if (!newStatus) return;
    try {
      await updateDocument(`orders/${orderId}`, { status: newStatus, updatedAt: Date.now() });
      Toast.show({ type: 'success', text1: 'Статус обновлён' });
      setOrders(orders => orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Ошибка', text2: e.message || 'Не удалось обновить статус' });
    }
  };

  if (!user) return <Text style={styles.error}>Нет доступа</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Мои заказы</Text>
      <View style={styles.tabs}>
        {statusTabs.map(tab => (
          <TouchableOpacity key={tab.value} style={[styles.tab, status === tab.value && styles.tabActive]} onPress={() => setStatus(tab.value)}>
            <Text style={status === tab.value ? styles.tabTextActive : styles.tabText}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {loading ? (
        <Text style={styles.loading}>Загрузка...</Text>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.orderRow}>
              <TouchableOpacity onPress={() => router.push(`/order/${item.id}`)}>
                <Text style={styles.orderTitle}>Заказ #{item.id.slice(-5)} | {item.status}</Text>
                <Text>Блюдо: {item.dishId}</Text>
                <Text>Порций: {item.qty}</Text>
                <Text>Покупатель: {item.buyerId}</Text>
              </TouchableOpacity>
              <View style={styles.btnRow}>
                {status === 'pending' && (
                  <>
                    <Button title="Принять" onPress={() => handleStatus(item.id, item.status, 'next')} />
                    <Button title="Отклонить" color="#d00" onPress={() => handleStatus(item.id, item.status, 'reject')} />
                  </>
                )}
                {['accepted', 'ready', 'picked_up'].includes(status) && nextStatus[item.status] && (
                  <Button title={
                    status === 'accepted' ? 'Готово' : status === 'ready' ? 'Забрано' : 'Завершить'
                  } onPress={() => handleStatus(item.id, item.status, 'next')} />
                )}
                {['pending', 'accepted', 'ready'].includes(status) && (
                  <Button title="Отменить" color="#d00" onPress={() => handleStatus(item.id, item.status, 'cancel')} />
                )}
              </View>
            </View>
          )}
          ListEmptyComponent={
            <EmptyState
              title="Нет заказов"
              description="Заказы появятся здесь, когда покупатели начнут заказывать ваши блюда"
              icon="📋"
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  tabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    justifyContent: 'center',
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#eee',
    margin: 2,
  },
  tabActive: {
    backgroundColor: '#0a7ea4',
  },
  tabText: {
    color: '#333',
    fontWeight: 'bold',
  },
  tabTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  orderRow: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    elevation: 1,
  },
  orderTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  loading: {
    textAlign: 'center',
    marginTop: 32,
    fontSize: 18,
  },
  empty: {
    textAlign: 'center',
    color: '#888',
    marginTop: 32,
    fontSize: 18,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 32,
    fontSize: 18,
  },
});
