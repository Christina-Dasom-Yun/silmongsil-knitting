import { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase/config';

export const useTips = () => {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'tips'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const tipsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTips(tipsData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching tips:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const addTip = async (tipData, currentUserId, authorName) => {
    try {
      const docRef = await addDoc(collection(db, 'tips'), {
        ...tipData,
        authorId: currentUserId,
        authorName: authorName,
        pinned: false,
        likes: [],
        createdAt: new Date().toISOString()
      });
      return docRef.id;
    } catch (err) {
      console.error('Error adding tip:', err);
      throw err;
    }
  };

  const updateTip = async (id, updates) => {
    try {
      await updateDoc(doc(db, 'tips', id), {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error updating tip:', err);
      throw err;
    }
  };

  const deleteTip = async (id) => {
    try {
      await deleteDoc(doc(db, 'tips', id));
    } catch (err) {
      console.error('Error deleting tip:', err);
      throw err;
    }
  };

  return {
    tips,
    loading,
    error,
    addTip,
    updateTip,
    deleteTip
  };
};
