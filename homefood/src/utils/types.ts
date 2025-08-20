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
  createdAt: number;
}

export type DishStatus = 'active' | 'hidden' | 'archived';

export interface Dish {
  id: string;
  chefId: string;
  title: string;
  description: string;
  price: number;
  category: 'soup' | 'bakery' | 'main' | 'salad' | 'vegan' | 'other';
  photoURL: string;
  location?: { lat: number; lng: number };
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
