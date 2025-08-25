import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../src/store';
import { getDocument, getDocuments } from '../../src/services/db';
import { ChatSession } from '../../src/utils/types';

const statusLabels: Record<string, string> = {
  pending: 'Ожидание',
  accepted: 'Принят',
  rejected: 'Отклонён',
  ready: 'Готово',
  picked_up: 'Забрано',
  completed: 'Завершён',
  cancelled: 'Отменён',
};

export default function ChatsScreen() {
  const [chatSessions, setChatSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useSelector((s: RootState) => s.auth.user);
  const router = useRouter();

  useEffect(() => {
    const fetchChats = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Получаем заказы пользователя
        const ordersQuery = user.role === 'buyer' 
          ? `orders?buyerId=${user.id}`
          : `orders?chefId=${user.id}`;
        
        const orders = await getDocuments(ordersQuery);
        
        // Фильтруем заказы с чатами
        const ordersWithChats = orders.filter((order: any) => order.chatEnabled !== false);
        
        // Получаем информацию о блюдах и пользователях
        const enrichedChats = await Promise.all(
          ordersWithChats.map(async (order: any) => {
            const [dish, otherUser] = await Promise.all([
              getDocument(`dishes/${order.dishId}`),
              getDocument(`users/${user.role === 'buyer' ? order.chefId : order.buyerId}`)
            ]);
            
            return {
              id: order.id,
              orderId: order.id,
              dish,
              otherUser,
              order,
              lastMessage: 'Нажмите, чтобы открыть чат',
              lastMessageTime: order.updatedAt || order.createdAt,
            };
          })
        );
        
        // Сортируем по времени последнего обновления
        enrichedChats.sort((a, b) => b.lastMessageTime - a.lastMessageTime);
        setChatSessions(enrichedChats);
      } catch (error) {
        console.error('Error fetching chats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [user]);

  const handleChatPress = (chatSession: any) => {
    router.push(`/order/${chatSession.orderId}`);
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Вчера';
    } else {
      return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
    }
  };

  const renderChatItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.chatItem} onPress={() => handleChatPress(item)}>
      <Image 
        source={{ uri: item.dish?.photoURL || 'https://via.placeholder.com/50' }} 
        style={styles.dishImage} 
      />
      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={styles.dishTitle}>{item.dish?.title || 'Блюдо'}</Text>
          <Text style={styles.timeText}>{formatTime(item.lastMessageTime)}</Text>
        </View>
        <Text style={styles.userName}>
          {user?.role === 'buyer' ? 'Повар' : 'Покупатель'}: {item.otherUser?.displayName || 'Пользователь'}
        </Text>
        <Text style={styles.statusText}>
          Статус: {statusLabels[item.order.status] || item.order.status}
        </Text>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.lastMessage}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Загрузка чатов...</Text>
      </View>
    );
  }

  if (chatSessions.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>У вас пока нет активных чатов</Text>
        <Text style={styles.emptySubtext}>Чаты появятся после создания заказов</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={chatSessions}
        keyExtractor={item => item.id}
        renderItem={renderChatItem}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  listContainer: {
    padding: 12,
  },
  chatItem: {
    flexDirection: 'row',
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
  dishImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  dishTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  timeText: {
    fontSize: 12,
    color: '#666',
  },
  userName: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  statusText: {
    fontSize: 12,
    color: '#0a7ea4',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
  },
});
