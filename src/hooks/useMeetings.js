import { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  deleteDoc,
  doc,
  Timestamp
} from 'firebase/firestore';

export const useMeetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'meetings'), orderBy('date', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const meetingsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate() // Convert Firestore Timestamp to JS Date
      }));
      setMeetings(meetingsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching meetings:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addMeeting = async (meetingData) => {
    try {
      await addDoc(collection(db, 'meetings'), {
        ...meetingData,
        date: Timestamp.fromDate(new Date(meetingData.date)),
        createdAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error adding meeting:', error);
      throw error;
    }
  };

  const deleteMeeting = async (meetingId) => {
    try {
      await deleteDoc(doc(db, 'meetings', meetingId));
    } catch (error) {
      console.error('Error deleting meeting:', error);
      throw error;
    }
  };

  return {
    meetings,
    loading,
    addMeeting,
    deleteMeeting
  };
};