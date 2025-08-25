import { Dish, Order, AppUser } from './types';
import { setDocument } from '../services/db';

// Тестовые данные для проверки функционала
export const testDishes: Partial<Dish>[] = [
  {
    id: 'test-dish-1',
    chefId: 'test-chef-1',
    title: 'Борщ домашний',
    description: 'Настоящий украинский борщ с мясом и овощами',
    price: 350,
    category: 'soup',
    photoURL: 'https://via.placeholder.com/300x200/FF6B6B/FFFFFF?text=Борщ',
    availableQty: 5,
    status: 'active',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'test-dish-2',
    chefId: 'test-chef-1',
    title: 'Пельмени с говядиной',
    description: 'Домашние пельмени с сочной начинкой',
    price: 280,
    category: 'main',
    photoURL: 'https://via.placeholder.com/300x200/4ECDC4/FFFFFF?text=Пельмени',
    availableQty: 10,
    status: 'active',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'test-dish-3',
    chefId: 'test-chef-2',
    title: 'Цезарь с курицей',
    description: 'Свежий салат с куриным филе и соусом цезарь',
    price: 220,
    category: 'salad',
    photoURL: 'https://via.placeholder.com/300x200/45B7D1/FFFFFF?text=Салат',
    availableQty: 8,
    status: 'active',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'test-dish-4',
    chefId: 'test-chef-2',
    title: 'Пирожки с капустой',
    description: 'Домашние пирожки с тушеной капустой',
    price: 150,
    category: 'bakery',
    photoURL: 'https://via.placeholder.com/300x200/96CEB4/FFFFFF?text=Пирожки',
    availableQty: 15,
    status: 'active',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

export const testUsers: Partial<AppUser>[] = [
  {
    id: 'test-chef-1',
    email: 'chef1@test.com',
    displayName: 'Анна Петрова',
    role: 'chef',
    isApprovedChef: true,
    createdAt: Date.now(),
  },
  {
    id: 'test-chef-2',
    email: 'chef2@test.com',
    displayName: 'Мария Иванова',
    role: 'chef',
    isApprovedChef: true,
    createdAt: Date.now(),
  },
  {
    id: 'test-buyer-1',
    email: 'buyer1@test.com',
    displayName: 'Иван Сидоров',
    role: 'buyer',
    createdAt: Date.now(),
  },
];

export const testOrders: Partial<Order>[] = [
  {
    id: 'test-order-1',
    dishId: 'test-dish-1',
    chefId: 'test-chef-1',
    buyerId: 'test-buyer-1',
    qty: 2,
    unitPrice: 350,
    totalPrice: 700,
    note: 'Доставить к 18:00',
    deliveryType: 'delivery',
    status: 'pending',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    chatEnabled: true,
  },
];

// Функция для добавления тестовых данных в Firestore
export const addTestData = async () => {
  try {
    console.log('Начинаем добавление тестовых данных...');
    
    // Добавляем тестовых пользователей
    for (const user of testUsers) {
      if (user.id) {
        await setDocument(`users/${user.id}`, user);
        console.log(`Добавлен пользователь: ${user.displayName}`);
      }
    }
    
    // Добавляем тестовые блюда
    for (const dish of testDishes) {
      if (dish.id) {
        await setDocument(`dishes/${dish.id}`, dish);
        console.log(`Добавлено блюдо: ${dish.title}`);
      }
    }
    
    // Добавляем тестовые заказы
    for (const order of testOrders) {
      if (order.id) {
        await setDocument(`orders/${order.id}`, order);
        console.log(`Добавлен заказ: ${order.id}`);
      }
    }
    
    console.log('✅ Тестовые данные успешно добавлены!');
  } catch (error) {
    console.error('❌ Ошибка при добавлении тестовых данных:', error);
    throw error;
  }
};
