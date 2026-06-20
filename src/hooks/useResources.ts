import { useEffect, useState } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Website } from './useWebsites';

export interface PublicResource {
  id: string;
  category: string;
  items: Website[];
  order: number;
}

export function usePublicResources() {
  const [resources, setResources] = useState<PublicResource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPublicResources() {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'publicResources'),
          orderBy('order', 'asc')
        );
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        })) as PublicResource[];
        
        setResources(data);
      } catch (err) {
        console.error('Error fetching public resources', err);
        setResources([]);
      }
      setLoading(false);
    }

    fetchPublicResources();
  }, []);

  return { resources, loading };
}
