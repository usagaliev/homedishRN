import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as fbSignOut, User } from 'firebase/auth';
import { app } from './firebase';
import { setDocument } from './db';
import { AppUser } from '../utils/types';

const auth = getAuth(app);

export async function signUp(email: string, password: string, displayName?: string) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  // Создаем профиль пользователя в Firestore
  const userProfile: Partial<AppUser> = {
    id: user.uid,
    email: user.email!,
    displayName: displayName || user.email!.split('@')[0],
    role: 'buyer', // По умолчанию регистрируемся как покупатель
    createdAt: Date.now(),
  };
  
  await setDocument(`users/${user.uid}`, userProfile);
  
  return user;
}

export async function signIn(email: string, password: string) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

export async function signOut() {
  await fbSignOut(auth);
}

export function getCurrentUser(): User | null {
  return auth.currentUser;
}
