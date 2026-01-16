import { motion } from 'framer-motion';
import { useState } from 'react';

const UserSelectionModal = ({ members, onSelectUser }) => {
  const [selectedMemberId, setSelectedMemberId] = useState(null);

  const handleConfirm = () => {
    if (selectedMemberId) {
      onSelectUser(selectedMemberId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-3 font-gowun">
            환영합니다! 🧶
          </h2>
          <p className="text-gray-600">
            본인의 이름을 선택해주세요
          </p>
          <p className="text-sm text-gray-500 mt-2">
            선택하신 카드만 수정할 수 있습니다
          </p>
        </div>

        {/* Member Selection Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {members.map((member) => (
            <motion.button
              key={member.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedMemberId(member.id)}
              className={`p-6 rounded-2xl border-2 transition-all ${
                selectedMemberId === member.id
                  ? 'border-indie-pink bg-indie-pink/10 shadow-lg'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                {/* Avatar placeholder */}
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${
                  selectedMemberId === member.id
                    ? 'bg-indie-pink text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {member.name.charAt(0)}
                </div>

                <span className={`font-semibold ${
                  selectedMemberId === member.id
                    ? 'text-indie-pink'
                    : 'text-gray-800'
                }`}>
                  {member.name}
                </span>

                {selectedMemberId === member.id && (
                  <svg className="w-6 h-6 text-indie-pink" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </motion.button>
          ))}
        </div>

        {/* Confirm Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleConfirm}
          disabled={!selectedMemberId}
          className="w-full bg-indie-pink text-white font-semibold py-4 rounded-2xl hover:bg-indie-pink/80 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {selectedMemberId ? '시작하기' : '멤버를 선택해주세요'}
        </motion.button>

        <p className="text-xs text-gray-400 text-center mt-4">
          다음에 다시 방문하셔도 선택이 기억됩니다
        </p>
      </motion.div>
    </div>
  );
};

export default UserSelectionModal;