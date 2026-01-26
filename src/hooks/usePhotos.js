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
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { db, storage } from '../firebase/config';

export const usePhotos = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'photos'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const photosData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPhotos(photosData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching photos:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const uploadPhoto = async (file, photoData) => {
    try {
      setUploading(true);

      // Upload file to Firebase Storage
      const storageRef = ref(storage, `photos/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Add photo metadata to Firestore
      const docRef = await addDoc(collection(db, 'photos'), {
        ...photoData,
        imageUrl: downloadURL,
        storagePath: snapshot.ref.fullPath,
        createdAt: new Date().toISOString()
      });

      setUploading(false);
      return docRef.id;
    } catch (err) {
      console.error('Error uploading photo:', err);
      setUploading(false);
      throw err;
    }
  };

  const deletePhoto = async (id, storagePath) => {
    try {
      // Delete from Storage
      if (storagePath) {
        const storageRef = ref(storage, storagePath);
        await deleteObject(storageRef);
      }

      // Delete from Firestore
      await deleteDoc(doc(db, 'photos', id));
    } catch (err) {
      console.error('Error deleting photo:', err);
      throw err;
    }
  };

  const updatePhoto = async (id, updates) => {
    try {
      await updateDoc(doc(db, 'photos', id), {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error updating photo:', err);
      throw err;
    }
  };

  return {
    photos,
    loading,
    uploading,
    error,
    uploadPhoto,
    deletePhoto,
    updatePhoto
  };
};
