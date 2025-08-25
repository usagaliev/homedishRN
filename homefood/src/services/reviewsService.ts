import { collection, addDoc, updateDoc, doc, query, where, orderBy, getDocs, onSnapshot } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { Review } from '../utils/types';

const db = getFirestore();

export async function createReview(review: Omit<Review, 'id' | 'createdAt'>): Promise<string> {
  try {
    const reviewData = {
      ...review,
      createdAt: Date.now(),
      moderated: false,
    };
    const docRef = await addDoc(collection(db, 'reviews'), reviewData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
}

export async function getReviewsByChef(chefId: string): Promise<Review[]> {
  try {
    const q = query(
      collection(db, 'reviews'),
      where('chefId', '==', chefId),
      where('moderated', '==', true),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Review[];
  } catch (error) {
    console.error('Error getting reviews by chef:', error);
    throw error;
  }
}

export async function getReviewsByDish(dishId: string): Promise<Review[]> {
  try {
    const q = query(
      collection(db, 'reviews'),
      where('dishId', '==', dishId),
      where('moderated', '==', true),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Review[];
  } catch (error) {
    console.error('Error getting reviews by dish:', error);
    throw error;
  }
}

export async function getUserReviews(userId: string): Promise<Review[]> {
  try {
    const q = query(
      collection(db, 'reviews'),
      where('buyerId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Review[];
  } catch (error) {
    console.error('Error getting user reviews:', error);
    throw error;
  }
}

export async function getChefRating(chefId: string): Promise<{ average: number; count: number }> {
  try {
    const reviews = await getReviewsByChef(chefId);
    if (reviews.length === 0) {
      return { average: 0, count: 0 };
    }
    
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const average = totalRating / reviews.length;
    
    return { average: Math.round(average * 10) / 10, count: reviews.length };
  } catch (error) {
    console.error('Error getting chef rating:', error);
    return { average: 0, count: 0 };
  }
}

export async function getDishRating(dishId: string): Promise<{ average: number; count: number }> {
  try {
    const reviews = await getReviewsByDish(dishId);
    if (reviews.length === 0) {
      return { average: 0, count: 0 };
    }
    
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const average = totalRating / reviews.length;
    
    return { average: Math.round(average * 10) / 10, count: reviews.length };
  } catch (error) {
    console.error('Error getting dish rating:', error);
    return { average: 0, count: 0 };
  }
}

export function subscribeToChefReviews(chefId: string, callback: (reviews: Review[]) => void): () => void {
  const q = query(
    collection(db, 'reviews'),
    where('chefId', '==', chefId),
    where('moderated', '==', true),
    orderBy('createdAt', 'desc')
  );
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const reviews = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Review[];
    callback(reviews);
  });

  return unsubscribe;
}

export function subscribeToDishReviews(dishId: string, callback: (reviews: Review[]) => void): () => void {
  const q = query(
    collection(db, 'reviews'),
    where('dishId', '==', dishId),
    where('moderated', '==', true),
    orderBy('createdAt', 'desc')
  );
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const reviews = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Review[];
    callback(reviews);
  });

  return unsubscribe;
}


