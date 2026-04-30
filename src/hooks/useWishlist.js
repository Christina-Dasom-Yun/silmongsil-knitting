import { useState, useEffect } from 'react';
import {
  collection, addDoc, deleteDoc, updateDoc, doc, onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase/config';

export const useWishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'wishlist'),
      (snapshot) => {
        const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setWishlist(data);
        setLoading(false);
      },
      (err) => {
        console.error('[useWishlist] Error:', err);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const addWish = async (data) => {
    const docRef = await addDoc(collection(db, 'wishlist'), {
      ...data,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  };

  const updateWish = async (id, updates) => {
    await updateDoc(doc(db, 'wishlist', id), {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  };

  const deleteWish = async (id) => {
    await deleteDoc(doc(db, 'wishlist', id));
  };

  const toggleLike = async (wishId, userId) => {
    const wish = wishlist.find(w => w.id === wishId);
    if (!wish) return;
    const likes = wish.likes || [];
    const next = likes.includes(userId)
      ? likes.filter(id => id !== userId)
      : [...likes, userId];
    await updateWish(wishId, { likes: next });
  };

  return { wishlist, loading, addWish, updateWish, deleteWish, toggleLike };
};
