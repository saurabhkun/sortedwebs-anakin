import { useEffect, useState } from 'react';
import { collection, query, orderBy, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './useAuth';
import { Website } from './useWebsites';

export interface Stack {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  isPublic: boolean;
  createdAt: any;
  links: Website[];
}

export function usePublicStacks() {
  const [stacks, setStacks] = useState<Stack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPublicStacks() {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'publicStacks'),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        })) as Stack[];
        
        setStacks(data);
      } catch (err) {
        console.error('Error fetching public stacks', err);
        setStacks([]);
      }
      setLoading(false);
    }

    fetchPublicStacks();
  }, []);

  return { stacks, loading };
}

export function useMyStacks() {
  const { user } = useAuth();
  const [stacks, setStacks] = useState<Stack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStacks = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, `users/${user.uid}/stacks`),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      })) as Stack[];
      
      setStacks(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      setStacks([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStacks();
  }, [user]);

  const addStack = async (stack: Omit<Stack, 'id' | 'createdAt' | 'userId'>) => {
    if (!user) return null;
    try {
      const newStackData = {
        ...stack,
        userId: user.uid,
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, `users/${user.uid}/stacks`), newStackData);
      
      if (stack.isPublic) {
        await setDoc(doc(db, 'publicStacks', docRef.id), newStackData);
      }
      
      const newDoc = await getDoc(docRef);
      const data = { id: newDoc.id, ...newDoc.data() } as Stack;
      setStacks([data, ...stacks]);
      return data;
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      return null;
    }
  };

  const deleteStack = async (id: string) => {
    if (!user) return false;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/stacks`, id));
      await deleteDoc(doc(db, 'publicStacks', id)); // Try to delete from public as well
      
      setStacks(stacks.filter((s) => s.id !== id));
      return true;
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      return false;
    }
  };

  const updateStack = async (id: string, updates: Partial<Stack>) => {
    if (!user) return null;
    try {
      const ref = doc(db, `users/${user.uid}/stacks`, id);
      await updateDoc(ref, updates);
      
      const newDoc = await getDoc(ref);
      const data = { id: newDoc.id, ...newDoc.data() } as Stack;
      
      if (data.isPublic) {
        await setDoc(doc(db, 'publicStacks', id), data);
      } else {
        await deleteDoc(doc(db, 'publicStacks', id));
      }
      
      setStacks(stacks.map((s) => (s.id === id ? data : s)));
      return data;
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      return null;
    }
  };

  return { stacks, loading, error, addStack, deleteStack, updateStack, refetch: fetchStacks };
}
