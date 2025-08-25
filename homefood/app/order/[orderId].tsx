import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, KeyboardAvoidingView, Platform, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getDocument } from '../../src/services/db';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../src/store';
import { ChatBubble } from '../../src/components/ChatBubble';
import { MessageInput } from '../../src/components/MessageInput';
import { 
  setMessages, 
  addMessage, 
  updateMessageStatus,
  setTyping 
} from '../../src/features/chat/chatSlice';
import { 
  sendMessage, 
  subscribeToMessages, 
  markMessagesAsRead,
  updateMessageStatus as updateMessageStatusService 
} from '../../src/services/chatService';
import { Message, MessageType } from '../../src/utils/types';
import { Ionicons } from '@expo/vector-icons';

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
  const [sending, setSending] = useState(false);
  const user = useSelector((s: RootState) => s.auth.user);
  const messages = useSelector((s: RootState) => s.chat.messages[orderId as string] || []);
  const typing = useSelector((s: RootState) => s.chat.typing[orderId as string] || []);
  const dispatch = useDispatch();
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

  // Подписка на сообщения
  useEffect(() => {
    if (!orderId) return;
    
    const unsubscribe = subscribeToMessages(orderId as string, (newMessages) => {
      dispatch(setMessages({ orderId: orderId as string, messages: newMessages }));
      
      // Автоскролл к последнему сообщению
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    return () => unsubscribe();
  }, [orderId, dispatch]);

  // Отметить сообщения как прочитанные
  useEffect(() => {
    if (user && messages.length > 0) {
      const unreadMessages = messages.filter(
        msg => msg.senderId !== user.id && msg.status !== 'read'
      );
      if (unreadMessages.length > 0) {
        markMessagesAsRead(orderId as string, user.id);
      }
    }
  }, [messages, user, orderId]);

  const handleSendMessage = async (text: string, type: MessageType, mediaUrl?: string) => {
    if (!user || !orderId) return;
    
    setSending(true);
    try {
      const messageData = {
        orderId: orderId as string,
        senderId: user.id,
        text: type === 'text' ? text : '',
        type,
        mediaUrl,
        status: 'sent' as const,
      };

      const messageId = await sendMessage(orderId as string, messageData);
      
      // Добавляем сообщение в Redux
      const newMessage: Message = {
        id: messageId,
        ...messageData,
        createdAt: Date.now(),
      };
      
      dispatch(addMessage({ orderId: orderId as string, message: newMessage }));
      
      // Обновляем статус на "доставлено"
      setTimeout(() => {
        updateMessageStatusService(orderId as string, messageId, 'delivered');
        dispatch(updateMessageStatus({ orderId: orderId as string, messageId, status: 'delivered' }));
      }, 1000);
      
    } catch (error: any) {
      Alert.alert('Ошибка', error.message || 'Не удалось отправить сообщение');
    } finally {
      setSending(false);
    }
  };

  const handleTyping = (isTyping: boolean) => {
    if (!user || !orderId) return;
    dispatch(setTyping({ orderId: orderId as string, userId: user.id, isTyping }));
  };

  const handleImagePress = (imageUrl: string) => {
    // TODO: Открыть изображение в полноэкранном режиме
    Alert.alert('Изображение', 'Просмотр изображений будет доступен в следующем обновлении');
  };

  const handleReviewPress = () => {
    router.push(`/review/${orderId}`);
  };

  if (loading) return <Text style={styles.loading}>Загрузка...</Text>;
  if (!order) return <Text style={styles.error}>Заказ не найден</Text>;

  const isOwnMessage = (message: Message) => message.senderId === user?.id;
  const isCompleted = order.status === 'completed';
  const isBuyer = user && user.id === order.buyerId;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.status}>Статус: {statusLabels[order.status] || order.status}</Text>
          {typing.length > 0 && (
            <Text style={styles.typing}>
              {typing.filter(id => id !== user?.id).length > 0 ? 'Печатает...' : ''}
            </Text>
          )}
          {isCompleted && isBuyer && (
            <TouchableOpacity style={styles.reviewButton} onPress={handleReviewPress}>
              <Ionicons name="star" size={16} color="#fff" />
              <Text style={styles.reviewButtonText}>Оставить отзыв</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <ChatBubble
              message={item}
              isOwnMessage={isOwnMessage(item)}
              onImagePress={handleImagePress}
            />
          )}
          contentContainerStyle={{ paddingVertical: 12 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
        
        <MessageInput
          onSendMessage={handleSendMessage}
          onTyping={handleTyping}
          disabled={sending}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#f8f8f8',
  },
  status: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  typing: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'center',
    marginTop: 8,
  },
  reviewButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 4,
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
});
