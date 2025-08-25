import { getFirestore, doc, getDoc, setDoc, addDoc, updateDoc, collection, query, where, getDocs, QueryConstraint } from 'firebase/firestore';
import { app } from './firebase';

const db = getFirestore(app);

export async function getDocument(path: string) {
  const ref = doc(db, path);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

export async function setDocument(path: string, data: any) {
  const ref = doc(db, path);
  await setDoc(ref, data);
}

export async function addDocument(collectionPath: string, data: any) {
  const colRef = collection(db, collectionPath);
  const docRef = await addDoc(colRef, data);
  return docRef.id;
}

export async function updateDocument(path: string, data: any) {
  const ref = doc(db, path);
  await updateDoc(ref, data);
}

export async function queryCollection(collectionPath: string, constraints: QueryConstraint[] = []) {
  const colRef = collection(db, collectionPath);
  const q = query(colRef, ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Функция для совместимости с существующим кодом
export async function getDocuments(queryString: string) {
  const [collectionPath, ...filters] = queryString.split('?');
  const constraints: QueryConstraint[] = [];
  
  filters.forEach(filter => {
    const [field, value] = filter.split('=');
    if (field && value) {
      constraints.push(where(field, '==', value));
    }
  });
  
  return queryCollection(collectionPath, constraints);
}
