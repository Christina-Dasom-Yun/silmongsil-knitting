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

export const useLocations = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'locations'), orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const locationsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setLocations(locationsData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching locations:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const addLocation = async (locationData, currentUserId, authorName) => {
    try {
      const docRef = await addDoc(collection(db, 'locations'), {
        ...locationData,
        authorId: currentUserId,
        authorName: authorName,
        createdAt: new Date().toISOString()
      });
      return docRef.id;
    } catch (err) {
      console.error('Error adding location:', err);
      throw err;
    }
  };

  const deleteLocation = async (id) => {
    try {
      await deleteDoc(doc(db, 'locations', id));
    } catch (err) {
      console.error('Error deleting location:', err);
      throw err;
    }
  };

  const updateLocation = async (id, updates) => {
    try {
      await updateDoc(doc(db, 'locations', id), {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error updating location:', err);
      throw err;
    }
  };

  return {
    locations,
    loading,
    error,
    addLocation,
    deleteLocation,
    updateLocation
  };
};