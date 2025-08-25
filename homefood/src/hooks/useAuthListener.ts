import { useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useDispatch } from 'react-redux';
import { setUser } from '../features/auth/authSlice';
import { getDocument } from '../services/db';
import { AppUser } from '../utils/types';

export function useAuthListener() {
  const dispatch = useDispatch();
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Загружаем полные данные пользователя из Firestore
          const userData = await getDocument(`users/${firebaseUser.uid}`) as AppUser;
          if (userData) {
            dispatch(setUser(userData));
          } else {
            // Если данных нет в Firestore, создаем базовый объект
            dispatch(setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              displayName: firebaseUser.displayName || firebaseUser.email!.split('@')[0],
              photoURL: firebaseUser.photoURL,
              role: 'buyer',
              createdAt: Date.now(),
            }));
          }
        } catch (error) {
          console.error('Error loading user data:', error);
          // В случае ошибки используем базовые данные Firebase
          dispatch(setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email!,
            displayName: firebaseUser.displayName || firebaseUser.email!.split('@')[0],
            photoURL: firebaseUser.photoURL,
            role: 'buyer',
            createdAt: Date.now(),
          }));
        }
      } else {
        dispatch(setUser(null));
      }
    });
    return unsubscribe;
  }, [dispatch]);
}
