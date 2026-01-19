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
  updateDoc,
  arrayUnion,
  arrayRemove,
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
        attendees: meetingData.attendees || [],
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

  const toggleAttendance = async (meetingId, userId) => {
    try {
      const meetingRef = doc(db, 'meetings', meetingId);
      const meeting = meetings.find(m => m.id === meetingId);

      if (!meeting) return;

      const isAttending = meeting.attendees?.includes(userId);

      await updateDoc(meetingRef, {
        attendees: isAttending ? arrayRemove(userId) : arrayUnion(userId)
      });
    } catch (error) {
      console.error('Error toggling attendance:', error);
      throw error;
    }
  };

  // Admin statistics functions (hidden from member view)
  const getMeetingStats = (meetingId) => {
    const meeting = meetings.find(m => m.id === meetingId);
    if (!meeting) return null;

    return {
      totalAttendees: meeting.attendees?.length || 0,
      attendeeIds: meeting.attendees || []
    };
  };

  const getAllStats = () => {
    return meetings.map(meeting => ({
      id: meeting.id,
      title: meeting.title,
      date: meeting.date,
      totalAttendees: meeting.attendees?.length || 0
    }));
  };

  return {
    meetings,
    loading,
    addMeeting,
    deleteMeeting,
    toggleAttendance,
    getMeetingStats,
    getAllStats
  };
};