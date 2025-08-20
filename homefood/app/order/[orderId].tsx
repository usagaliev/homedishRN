import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Button, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getDocument, updateDocument } from '../../src/services/db';
import { collection, onSnapshot, addDoc, query, orderBy } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { useSelector } from 'react-redux';
import { RootState } from '../../src/store';

const statusLabels: Record<string, string> = {
  pending: 'Ожидание',
  accepted: 'Принят',
  rejected: 'Отклонён',
  ready: 'Готово',
  picked_up: 'Забрано',
  completed: 'Завершён',
  cancelled: 'Отменён',
};

export default function OrderScreen() {
  const { orderId } = useLocalSearchParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [msg, setMsg] = useState('');
  const [sending, setSending] = useState(false);
  const user = useSelector((s: RootState) => s.auth.user);
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      const data = await getDocument(`orders/${orderId}`);
      setOrder(data);
      setLoading(false);
    };
    fetchOrder();
  }, [orderId]);

  // Subscribe to messages
  useEffect(() => {
    if (!orderId) return;
    const db = getFirestore();
    const q = query(collection(db, `orders/${orderId}/messages`), orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    });
    return () => unsub();
  }, [orderId]);

  const sendMessage = async () => {
    if (!msg.trim() || !user) return;
    setSending(true);
    try {
      const db = getFirestore();
      await addDoc(collection(db, `orders/${orderId}/messages`), {
        senderId: user.id,
        text: msg.trim(),
        createdAt: Date.now(),
      });
      setMsg('');
    } catch (e: any) {
      Alert.alert('Ошибка', e.message || 'Не удалось отправить сообщение');
    } finally {
      setSending(false);
    }
  };

  const cancelOrder = async () => {
    if (!orderId) return;
    try {
      await updateDocument(`orders/${orderId}`, { status: 'cancelled', updatedAt: Date.now() });
      router.replace('/');
    } catch (e: any) {
      Alert.alert('Ошибка', e.message || 'Не удалось отменить заказ');
    }
  };

  if (loading) return <Text style={styles.loading}>Загрузка...</Text>;
  if (!order) return <Text style={styles.error}>Заказ не найден</Text>;

  const isBuyer = user && user.id === order.buyerId;
  const canCancel = isBuyer && order.status === 'pending';

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        <Text style={styles.status}>Статус: {statusLabels[order.status] || order.status}</Text>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={[styles.msg, item.senderId === user?.id ? styles.myMsg : styles.otherMsg]}>
              <Text>{item.text}</Text>
              <Text style={styles.msgTime}>{new Date(item.createdAt).toLocaleTimeString()}</Text>
            </View>
          )}
          contentContainerStyle={{ paddingVertical: 12 }}
        />
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Сообщение..."
            value={msg}
            onChangeText={setMsg}
            editable={!sending}
          />
          <Button title="Отправить" onPress={sendMessage} disabled={sending || !msg.trim()} />
        </View>
        {canCancel && (
          <Button title="Отменить заказ" color="#d00" onPress={cancelOrder} />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
  },
  status: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  loading: {
    flex: 1,
    textAlign: 'center',
    marginTop: 32,
    fontSize: 18,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 32,
    fontSize: 18,
  },
  msg: {
    padding: 10,
    borderRadius: 8,
    marginVertical: 4,
    maxWidth: '80%',
  },
  myMsg: {
    backgroundColor: '#e0f7fa',
    alignSelf: 'flex-end',
  },
  otherMsg: {
    backgroundColor: '#f1f1f1',
    alignSelf: 'flex-start',
  },
  msgTime: {
    fontSize: 10,
    color: '#888',
    marginTop: 2,
    textAlign: 'right',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginRight: 8,
    fontSize: 16,
  },
});
