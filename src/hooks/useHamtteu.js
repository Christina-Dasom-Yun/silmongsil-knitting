import { useState, useEffect } from 'react';
import {
  collection, addDoc, deleteDoc, updateDoc, doc, onSnapshot, query, orderBy
} from 'firebase/firestore';
import { db } from '../firebase/config';

export const useHamtteu = () => {
  const [hamtteus, setHamtteus] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'hamtteu'));
    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        console.log('[useHamtteu] snapshot docs:', snapshot.docs.length);
        const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setHamtteus(data);
        setLoading(false);
      },
      (err) => {
        console.error('[useHamtteu] Error:', err);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const addHamtteu = async (data) => {
    const docRef = await addDoc(collection(db, 'hamtteu'), {
      ...data,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  };

  const updateHamtteu = async (id, updates) => {
    await updateDoc(doc(db, 'hamtteu', id), {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  };

  const deleteHamtteu = async (id) => {
    await deleteDoc(doc(db, 'hamtteu', id));
  };

  return { hamtteus, loading, addHamtteu, updateHamtteu, deleteHamtteu };
};
