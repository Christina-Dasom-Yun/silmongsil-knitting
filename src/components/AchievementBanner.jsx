import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { getRankingData } from '../utils/badgeUtils';

const AchievementBanner = ({ members }) => {
  const [showModal, setShowModal] = useState(false);
  const ranking = getRankingData(members);

  // 동적 문구 결정 로직
  const getBannerMessage = () => {
    if (ranking.length === 0) {
      return {
        text: '오늘도 몽글몽글, 새로운 뜨개질을 시작해보세요 ✨',
        icon: '🧶',
        type: 'default'
      };
    }

    const totalMembers = ranking.length;
    const topScore = ranking[0].completedCount;
    const topMembers = ranking.filter(m => m.completedCount === topScore);
    const hasCompletedProjects = topScore > 0;

    // 완성작이 없는 경우
    if (!hasCompletedProjects) {
      return {
        text: `오늘도 몽글몽글, ${totalMembers}명의 뜨개질이 진행 중이에요 ✨`,
        icon: '🧶',
        type: 'progress'
      };
    }

    // 동점자가 3명 이상인 경우
    if (topMembers.length >= 3) {
      return {
        text: `지금 실몽실은 뜨개 열풍! 🧶 총 ${totalMembers}명이 달리고 있어요`,
        icon: '🔥',
        type: 'competitive'
      };
    }

    // 1위가 독보적인 경우 (2위와 차이가 2개 이상)
    const secondScore = ranking[1]?.completedCount || 0;
    if (topMembers.length === 1 && (topScore - secondScore) >= 2) {
      return {
        text: `🏆 ${ranking[0].name}님이 ${topScore}개로 선두를 달리고 있어요!`,
        icon: '👑',
        type: 'leader'
      };
    }

    // 그 외의 경우 - 일반적인 진행 상황
    const totalCompleted = ranking.reduce((sum, m) => sum + m.completedCount, 0);
    return {
      text: `실몽실 멤버들이 총 ${totalCompleted}개의 작품을 완성했어요 🎉`,
      icon: '✨',
      type: 'achievement'
    };
  };

  const message = getBannerMessage();

  return (
    <>
      <motion.button
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowModal(true)}
        className="bg-gradient-to-r from-indie-pink/10 via-soft-coral/10 to-light-beige/50 backdrop-blur-md px-5 py-3 rounded-full shadow-md hover:shadow-lg transition-all cursor-pointer border border-indie-pink/20"
      >
        <div className="flex items-center gap-2.5">
          <motion.span
            initial={{ rotate: 0 }}
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="text-xl"
          >
            {message.icon}
          </motion.span>
          <motion.p
            key={message.text}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-sm md:text-base font-medium text-gray-700"
          >
            {message.text}
          </motion.p>
        </div>
      </motion.button>

      {/* 현황판 모달 */}
      <AnimatePresence>
        {showModal && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden"
            >
              {/* 헤더 */}
              <div className="bg-gradient-to-r from-indie-pink to-soft-coral p-6 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-bold font-gowun mb-1">🏆 실몽실 현황판</h3>
                    <p className="text-sm text-white/80">모두의 뜨개 여정</p>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* 통계 요약 */}
              <div className="grid grid-cols-2 gap-4 p-6 bg-gradient-to-br from-light-beige/30 to-warm-cream/30">
                <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
                  <p className="text-2xl font-bold text-indie-pink">
                    {ranking.reduce((sum, m) => sum + m.completedCount, 0)}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">총 완성작</p>
                </div>
                <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
                  <p className="text-2xl font-bold text-soft-coral">
                    {ranking.filter(m => m.completedCount > 0).length}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">완성한 멤버</p>
                </div>
              </div>

              {/* 멤버 리스트 */}
              <div className="p-6 overflow-y-auto max-h-[50vh]">
                <h4 className="text-sm font-semibold text-gray-600 mb-4">멤버별 달성 현황</h4>
                <div className="space-y-2">
                  {ranking.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex items-center justify-between p-4 rounded-2xl transition-all ${
                        index < 3
                          ? 'bg-gradient-to-r from-indie-pink/10 to-soft-coral/10'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* 순위 */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          index === 0
                            ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white'
                            : index === 1
                            ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white'
                            : index === 2
                            ? 'bg-gradient-to-br from-orange-300 to-orange-500 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {index + 1}
                        </div>

                        {/* 이름 & 배지 */}
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-semibold text-gray-800">{item.name}</p>
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-xs">{item.badge.icon}</span>
                            <span className={`text-xs font-medium ${item.badge.color}`}>
                              {item.badge.label}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 완성 개수 */}
                      <div className="text-right">
                        <p className="text-2xl font-bold text-indie-pink">{item.completedCount}</p>
                        <p className="text-xs text-gray-500">완성작</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* 빈 상태 */}
                {ranking.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-5xl mb-4">🧶</div>
                    <p className="text-gray-500">아직 등록된 멤버가 없습니다</p>
                  </div>
                )}
              </div>

              {/* 푸터 */}
              <div className="p-6 bg-gradient-to-r from-light-beige/50 to-warm-cream/50 border-t border-gray-200">
                <p className="text-center text-xs text-gray-600">
                  모두 화이팅! 함께 뜨는 우리 실몽실 💕
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AchievementBanner;
