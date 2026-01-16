import { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase/config';

export const useMembers = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Don't use orderBy to avoid issues with manually added documents
    const membersRef = collection(db, 'members');

    const unsubscribe = onSnapshot(membersRef,
      (snapshot) => {
        const membersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log('Fetched members:', membersData); // Debug log
        setMembers(membersData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching members:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const addMember = async (memberData) => {
    try {
      const docRef = await addDoc(collection(db, 'members'), {
        ...memberData,
        createdAt: new Date().toISOString()
      });
      return docRef.id;
    } catch (err) {
      console.error('Error adding member:', err);
      throw err;
    }
  };

  const updateMember = async (id, memberData) => {
    try {
      const memberRef = doc(db, 'members', id);
      await updateDoc(memberRef, {
        ...memberData,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error updating member:', err);
      throw err;
    }
  };

  const deleteMember = async (id) => {
    try {
      await deleteDoc(doc(db, 'members', id));
    } catch (err) {
      console.error('Error deleting member:', err);
      throw err;
    }
  };

  return {
    members,
    loading,
    error,
    addMember,
    updateMember,
    deleteMember
  };
};