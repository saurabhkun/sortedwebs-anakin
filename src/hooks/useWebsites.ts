import { useEffect, useState } from 'react';
import { collection, query, orderBy, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, getDoc, onSnapshot, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './useAuth';

export interface Website {
  id: string;
  url: string;
  title: string;
  description?: string;
  category?: string;
  faviconUrl?: string;
  is_favorite: boolean;
  is_archived: boolean;
  tags?: string[];
  createdAt?: any;
  updatedAt?: any;
}

export function useWebsites() {
  const { user } = useAuth();
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setWebsites([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(
      collection(db, `users/${user.uid}/links`),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      })) as Website[];
      setWebsites(data);
      setError(null);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setError(err.message);
      setWebsites([]);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const addWebsite = async (website: Omit<Website, 'id' | 'createdAt' | 'user_id'>) => {
    if (user === null) {
      throw new Error("Cannot save link: no authenticated user");
    }
    
    console.log("User:", user);
    console.log("UID:", user?.uid);
    console.log("Website Payload:", website);
    
    try {
      console.log("Writing to Firestore...");
      const docRef = await addDoc(collection(db, "users", user.uid, "links"), {
        ...website,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log("Firestore write success");
      // Local state is updated by onSnapshot automatically
      const newDoc = await getDoc(docRef);
      return { id: newDoc.id, ...newDoc.data() } as Website;
    } catch (err: any) {
      console.error("Firestore write failed:", err);
      setError(err.message);
      return null;
    }
  };

  const deleteWebsite = async (id: string) => {
    if (!user) return false;

    try {
      await deleteDoc(doc(db, `users/${user.uid}/links`, id));
      // Local state is updated by onSnapshot automatically
      return true;
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      return false;
    }
  };

  const updateWebsite = async (id: string, updates: Partial<Website>) => {
    if (!user) return null;

    try {
      const ref = doc(db, `users/${user.uid}/links`, id);
      await updateDoc(ref, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      
      const newDoc = await getDoc(ref);
      const data = { id: newDoc.id, ...newDoc.data() } as Website;
      // Local state is updated by onSnapshot automatically
      return data;
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      return null;
    }
  };

  const seedInitialLinks = async () => {
    if (!user) return;
    
    // Safety check - only seed if completely empty
    if (websites.length > 0) return;
    
    setLoading(true);
    try {
      const batch = writeBatch(db);
      
      const seedData = [
        { title: 'Google Scholar', url: 'https://scholar.google.com', category: 'Research' },
        { title: 'arXiv', url: 'https://arxiv.org', category: 'Research' },
        { title: 'Figma', url: 'https://figma.com', category: 'Design' },
        { title: 'Dribbble', url: 'https://dribbble.com', category: 'Design' },
        { title: 'GitHub', url: 'https://github.com', category: 'Dev Tools' },
        { title: 'Vercel', url: 'https://vercel.com', category: 'Dev Tools' },
        { title: 'YouTube', url: 'https://youtube.com', category: 'Entertainment' },
        { title: 'Spotify', url: 'https://spotify.com', category: 'Entertainment' },
        { title: 'ChatGPT', url: 'https://chatgpt.com', category: 'AI Tools' },
        { title: 'Perplexity', url: 'https://perplexity.ai', category: 'AI Tools' }
      ];

      seedData.forEach(item => {
        const newRef = doc(collection(db, `users/${user.uid}/links`));
        batch.set(newRef, {
          ...item,
          is_favorite: false,
          is_archived: false,
          tags: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      });

      await batch.commit();
      
    } catch (err: any) {
      console.error('Failed to seed data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { websites, loading, error, addWebsite, deleteWebsite, updateWebsite, seedInitialLinks };
}
