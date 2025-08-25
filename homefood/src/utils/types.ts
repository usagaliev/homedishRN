export type UserRole = 'buyer' | 'chef' | 'admin';

export interface AppUser {
  id: string;
  email: string;
  displayName: string;
  phone?: string;
  photoURL?: string;
  role: UserRole;
  isApprovedChef?: boolean;
  location?: { lat: number; lng: number };
  address?: string;
  createdAt: number;
  updatedAt?: number;
}

export interface GeoPointLike { lat: number; lng: number }

export type DishStatus = 'active' | 'hidden' | 'archived';

export interface Dish {
  id: string;
  chefId: string;
  title: string;
  description: string;
  price: number;
  category: 'soup' | 'bakery' | 'main' | 'salad' | 'vegan' | 'other';
  photoURL: string;
  location?: GeoPointLike;
  availableQty: number;
  status: DishStatus;
  createdAt: number;
  updatedAt: number;
}

export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'ready'
  | 'picked_up'
  | 'completed'
  | 'cancelled';

export interface Order {
  id: string;
  dishId: string;
  chefId: string;
  buyerId: string;
  qty: number;
  unitPrice: number;
  totalPrice: number;
  note?: string;
  deliveryType: 'pickup' | 'delivery';
  status: OrderStatus;
  createdAt: number;
  updatedAt: number;
  chatEnabled?: boolean;
}

// Новые типы для улучшенного чата
export type MessageType = 'text' | 'photo' | 'audio';
export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface Message {
  id: string;
  orderId: string;
  senderId: string;
  text: string;
  type: MessageType;
  mediaUrl?: string;
  status: MessageStatus;
  createdAt: number;
  updatedAt?: number;
}

// Типы для рейтингов (готовимся к следующему этапу)
export interface Review {
  id: string;
  orderId: string;
  chefId: string;
  buyerId: string;
  dishId?: string;
  rating: number; // 1-5
  text: string;
  photos?: string[];
  createdAt: number;
  moderated: boolean;
}

export interface ChatSession {
  id: string;
  orderId: string;
  chefId: string;
  buyerId: string;
  lastMessage?: string;
  lastMessageTime?: number;
  unreadCount: { [userId: string]: number };
  createdAt: number;
  updatedAt: number;
}
