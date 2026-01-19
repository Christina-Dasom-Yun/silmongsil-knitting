import { motion } from 'framer-motion';
import { getRankingData } from '../utils/badgeUtils';

const TopRanking = ({ members, onMemberClick }) => {
  const ranking = getRankingData(members);
  const top3 = ranking.slice(0, 3);

  // 순위별 색상 (진한 핑크 -> 중간 핑크 -> 연한 핑크)
  const rankColors = [
    'bg-gradient-to-br from-indie-pink to-soft-coral', // 1등
    'bg-gradient-to-br from-soft-coral/80 to-indie-pink/60', // 2등
    'bg-gradient-to-br from-indie-pink/40 to-soft-coral/30', // 3등
  ];

  const rankShadows = [
    'shadow-lg shadow-indie-pink/30',
    'shadow-md shadow-soft-coral/20',
    'shadow-sm shadow-indie-pink/10',
  ];

  if (top3.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 md:gap-3">
      <span className="text-xs md:text-sm text-gray-600 font-medium hidden sm:inline">
        🏆 Top 3
      </span>
      <div className="flex items-center gap-1.5 md:gap-2">
        {top3.map((item, index) => (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: index * 0.1,
              type: 'spring',
              stiffness: 300,
              damping: 20
            }}
            whileHover={{ scale: 1.15, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onMemberClick(item.id)}
            className={`
              relative w-10 h-10 md:w-12 md:h-12 rounded-full
              ${rankColors[index]}
              ${rankShadows[index]}
              flex items-center justify-center
              cursor-pointer
              transition-all
              group
            `}
            title={`${index + 1}위: ${item.name} (${item.completedCount}개)`}
          >
            {/* 순위 배지 */}
            <div className="absolute -top-1 -right-1 w-5 h-5 md:w-6 md:h-6 bg-white rounded-full flex items-center justify-center shadow-md">
              <span className="text-xs md:text-sm font-bold text-indie-pink">
                {index + 1}
              </span>
            </div>

            {/* 이름 이니셜 */}
            <span className="text-white font-bold text-sm md:text-base">
              {item.name?.charAt(0) || '?'}
            </span>

            {/* 호버 시 툴팁 */}
            <div className="absolute -bottom-14 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap shadow-xl">
                <p className="font-semibold">{item.name}</p>
                <p className="text-gray-300">{item.badge.icon} {item.completedCount}개 완성</p>
                {/* 말풍선 꼬리 */}
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-gray-900"></div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default TopRanking;
