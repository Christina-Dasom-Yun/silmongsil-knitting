import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { getRankingData } from '../utils/badgeUtils';

const RankingBoard = ({ members }) => {
  const [ranking, setRanking] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (members && members.length > 0) {
      const rankingData = getRankingData(members);
      // 완성작이 1개 이상인 사람만 필터링
      const filteredRanking = rankingData.filter(item => item.completedCount > 0);

      // 실제 순위 계산 (동점자 처리)
      let currentRank = 1;
      const rankedData = filteredRanking.map((item, idx) => {
        // 이전 사람과 완성작 개수가 다르면 순위 업데이트
        if (idx > 0 && filteredRanking[idx - 1].completedCount !== item.completedCount) {
          currentRank = idx + 1;
        }
        return {
          ...item,
          rank: currentRank
        };
      });

      setRanking(rankedData);
    }
  }, [members]);

  // 상위 3명만 표시 (접혀있을 때)
  const displayRanking = isExpanded ? ranking : ranking.slice(0, 3);

  // 완성작이 하나도 없으면 빈 상태 표시
  if (ranking.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="bg-gradient-to-br from-indie-pink/10 via-soft-coral/5 to-light-beige p-6 rounded-3xl shadow-md"
      >
        <h3 className="text-xl font-bold text-gray-800 font-gowun flex items-center gap-2 mb-4">
          🏆 완성작 랭킹
        </h3>
        <div className="bg-white/50 backdrop-blur-sm p-8 rounded-2xl text-center">
          <div className="text-5xl mb-3">🧶</div>
          <p className="text-gray-600 font-medium">아직 완성한 작품이 없습니다</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
      className="bg-gradient-to-br from-indie-pink/10 via-soft-coral/5 to-light-beige p-6 rounded-3xl shadow-md"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800 font-gowun flex items-center gap-2">
          🏆 완성작 랭킹
        </h3>
        {ranking.length > 3 && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-indie-pink font-semibold hover:text-indie-pink/80 transition-colors"
          >
            {isExpanded ? '접기 ▲' : '전체보기 ▼'}
          </motion.button>
        )}
      </div>

      <div className="space-y-3">
        {displayRanking.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`bg-white/70 backdrop-blur-sm p-4 rounded-2xl flex items-center justify-between ${
              item.rank === 1 ? 'ring-2 ring-indie-pink/30' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              {/* 순위 */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  item.rank === 1
                    ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white shadow-lg'
                    : item.rank === 2
                    ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white shadow-md'
                    : item.rank === 3
                    ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {item.rank}
              </div>

              {/* 이름 */}
              <span className="font-semibold text-gray-800">{item.name}</span>
            </div>

            <div className="flex items-center gap-3">
              {/* 완성작 개수 */}
              <span className="text-sm font-medium text-gray-600">
                {item.completedCount}개
              </span>

              {/* 배지 */}
              <div className="bg-white px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5">
                <span className="text-sm">{item.badge.icon}</span>
                <span className={`text-xs font-semibold ${item.badge.color}`}>
                  {item.badge.label}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default RankingBoard;
