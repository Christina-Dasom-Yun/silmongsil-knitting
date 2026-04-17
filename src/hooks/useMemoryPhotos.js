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

export const useMemoryPhotos = () => {
  const [memoryPhotos, setMemoryPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'memoryPhotos'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMemoryPhotos(data);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching memory photos:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const uploadMemoryPhoto = async (file, photoData) => {
    try {
      setUploading(true);
      const storageRef = ref(storage, `memoryPhotos/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      const docRef = await addDoc(collection(db, 'memoryPhotos'), {
        ...photoData,
        imageUrl: downloadURL,
        storagePath: snapshot.ref.fullPath,
        createdAt: new Date().toISOString()
      });

      setUploading(false);
      return docRef.id;
    } catch (err) {
      console.error('Error uploading memory photo:', err);
      setUploading(false);
      throw err;
    }
  };

  const deleteMemoryPhoto = async (id, storagePath) => {
    try {
      if (storagePath) {
        const storageRef = ref(storage, storagePath);
        await deleteObject(storageRef);
      }
      await deleteDoc(doc(db, 'memoryPhotos', id));
    } catch (err) {
      console.error('Error deleting memory photo:', err);
      throw err;
    }
  };

  return {
    memoryPhotos,
    loading,
    uploading,
    uploadMemoryPhoto,
    deleteMemoryPhoto
  };
};
