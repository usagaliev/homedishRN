import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as fbSignOut, User } from 'firebase/auth';
import { app } from './firebase';

const auth = getAuth(app);

export async function signUp(email: string, password: string) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  return userCredential.user;
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
