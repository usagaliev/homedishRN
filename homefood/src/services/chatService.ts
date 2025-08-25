import { collection, addDoc, updateDoc, doc, query, orderBy, limit, getDocs, onSnapshot } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { Message, MessageStatus, ChatSession } from '../utils/types';

const db = getFirestore();

export async function sendMessage(orderId: string, message: Omit<Message, 'id' | 'createdAt'>): Promise<string> {
  try {
    const messageData = {
      ...message,
      createdAt: Date.now(),
    };
    const docRef = await addDoc(collection(db, `orders/${orderId}/messages`), messageData);
    return docRef.id;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

export async function updateMessageStatus(
  orderId: string,
  messageId: string,
  status: MessageStatus
): Promise<void> {
  try {
    const messageRef = doc(db, `orders/${orderId}/messages/${messageId}`);
    await updateDoc(messageRef, { status, updatedAt: Date.now() });
  } catch (error) {
    console.error('Error updating message status:', error);
    // Не выбрасываем ошибку, чтобы не прерывать работу чата
    // Вместо этого логируем её для отладки
  }
}

export async function loadMessages(orderId: string, limitCount: number = 50): Promise<Message[]> {
  try {
    const q = query(
      collection(db, `orders/${orderId}/messages`),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Message[];
    return messages.reverse(); // возвращаем в хронологическом порядке
  } catch (error) {
    console.error('Error loading messages:', error);
    throw error;
  }
}

export function subscribeToMessages(
  orderId: string,
  callback: (messages: Message[]) => void
): () => void {
  const q = query(
    collection(db, `orders/${orderId}/messages`),
    orderBy('createdAt', 'asc')
  );
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Message[];
    callback(messages);
  });

  return unsubscribe;
}

export async function markMessagesAsRead(orderId: string, userId: string): Promise<void> {
  try {
    const q = query(
      collection(db, `orders/${orderId}/messages`),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const snapshot = await getDocs(q);
    
    const updatePromises = snapshot.docs
      .filter(doc => {
        const msg = doc.data();
        return msg.senderId !== userId && msg.status !== 'read';
      })
      .map(doc => updateMessageStatus(orderId, doc.id, 'read'));
    
    if (updatePromises.length > 0) {
      await Promise.all(updatePromises);
    }
  } catch (error) {
    console.error('Error marking messages as read:', error);
    // Не выбрасываем ошибку, чтобы не прерывать работу чата
  }
}

export async function createChatSession(session: Omit<ChatSession, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const sessionData = {
      ...session,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const docRef = await addDoc(collection(db, 'chat_sessions'), sessionData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating chat session:', error);
    throw error;
  }
}

export async function updateChatSession(sessionId: string, updates: Partial<ChatSession>): Promise<void> {
  try {
    const sessionRef = doc(db, 'chat_sessions', sessionId);
    await updateDoc(sessionRef, {
      ...updates,
      updatedAt: Date.now(),
    });
  } catch (error) {
    console.error('Error updating chat session:', error);
    throw error;
  }
}

