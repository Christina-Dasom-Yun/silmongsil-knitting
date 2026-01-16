import { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // localStorage에서 저장된 사용자 ID 불러오기
    const savedUserId = localStorage.getItem('silmongsil_user_id');
    if (savedUserId) {
      setCurrentUserId(savedUserId);
    }
    setIsLoading(false);
  }, []);

  const selectUser = (userId) => {
    setCurrentUserId(userId);
    localStorage.setItem('silmongsil_user_id', userId);
  };

  const clearUser = () => {
    setCurrentUserId(null);
    localStorage.removeItem('silmongsil_user_id');
  };

  return (
    <UserContext.Provider value={{ currentUserId, selectUser, clearUser, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};