import { useState } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '../contexts/UserContext';
import { useMembers } from '../hooks/useMembers';
import AchievementBanner from './AchievementBanner';

const Header = () => {
  const [groupName, setGroupName] = useState('실몽실 뜨개모임');
  const [isEditing, setIsEditing] = useState(false);
  const { currentUserId, clearUser } = useUser();
  const { members } = useMembers();

  // Find current user's member info
  const currentMember = members.find(m => m.id === currentUserId);

  const handleChangeUser = () => {
    if (confirm('다른 멤버로 변경하시겠습니까?')) {
      clearUser();
    }
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full py-8 px-6 md:px-12"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
          {/* 왼쪽: 타이틀 */}
          <div className="text-center md:text-left">
            {isEditing ? (
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                onBlur={() => setIsEditing(false)}
                className="text-3xl md:text-4xl font-bold bg-white/70 backdrop-blur-sm px-6 py-3 rounded-2xl border-0 focus:outline-none focus:ring-2 focus:ring-indie-pink/50 shadow-lg text-gray-800 transition-all font-gowun"
                autoFocus
              />
            ) : (
              <h1
                onClick={() => setIsEditing(true)}
                className="text-3xl md:text-4xl font-bold cursor-pointer hover:text-indie-pink transition-colors font-gowun"
              >
                {groupName}
              </h1>
            )}
            <p className="text-sm text-gray-600 mt-2">뜨친자들 안녕?</p>
          </div>

          {/* 중앙: Achievement Banner (모바일에서는 아래, PC에서는 우측) */}
          <div className="w-full md:w-auto flex justify-center md:justify-end md:flex-1">
            {members.length > 0 && (
              <AchievementBanner members={members} />
            )}
          </div>

          {/* 우측: Current User Info */}
          {currentMember && (
            <div className="bg-white/80 backdrop-blur-sm px-6 py-4 rounded-3xl card-shadow">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">현재 사용자</p>
                  <p className="text-lg font-bold text-indie-black">{currentMember.name}</p>
                </div>
                <button
                  onClick={handleChangeUser}
                  className="text-xs text-gray-600 hover:text-indie-pink transition-colors underline"
                >
                  변경
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
