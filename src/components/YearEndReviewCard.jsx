import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { getBadge, getCompletedCount } from '../utils/badgeUtils';

const YearEndReviewCard = ({ member, index, onUpdate, currentUserId }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isViewingDetail, setIsViewingDetail] = useState(false);
  const [editedReview, setEditedReview] = useState({
    completed: member.review?.completed || '',
    frogged: member.review?.frogged || '',
    favoriteYarn: member.review?.favoriteYarn || '',
    favoritePattern: member.review?.favoritePattern || '',
    favoriteItem: member.review?.favoriteItem || '',
    commonPhrase: member.review?.commonPhrase || ''
  });

  const isOwnCard = currentUserId === member.id;

  // 이름 길이에 따른 폰트 크기 계산
  const getNameFontSize = (name) => {
    const length = name?.length || 0;
    if (length <= 5) return 'text-xl'; // 짧은 이름
    if (length <= 8) return 'text-lg'; // 중간 이름
    if (length <= 12) return 'text-base'; // 긴 이름
    return 'text-sm'; // 매우 긴 이름
  };

  // Firebase 실시간 업데이트 반영 (onSnapshot)
  useEffect(() => {
    setEditedReview({
      completed: member.review?.completed || '',
      frogged: member.review?.frogged || '',
      favoriteYarn: member.review?.favoriteYarn || '',
      favoritePattern: member.review?.favoritePattern || '',
      favoriteItem: member.review?.favoriteItem || '',
      commonPhrase: member.review?.commonPhrase || ''
    });
  }, [member.review]);

  // 배지 계산
  const completedCount = getCompletedCount(member);
  const badge = getBadge(completedCount);

  // 부드러운 파스텔 색상 배열
  const colors = [
    'bg-pink-50',
    'bg-purple-50',
    'bg-blue-50',
    'bg-yellow-50',
    'bg-green-50',
    'bg-orange-50',
  ];

  const bgColor = colors[index % colors.length];

  // 태그 칩에 사용할 파스텔 색상 배열
  const tagColors = [
    'bg-pink-100 text-pink-800',
    'bg-purple-100 text-purple-800',
    'bg-blue-100 text-blue-800',
    'bg-yellow-100 text-yellow-800',
    'bg-green-100 text-green-800',
    'bg-orange-100 text-orange-800',
  ];

  const reviewFields = [
    { key: 'completed', label: '올해의 완성작', icon: '✨' },
    { key: 'frogged', label: '푸르시오', icon: '🐸' },
    { key: 'favoriteYarn', label: '올해의 실', icon: '🧶' },
    { key: 'favoritePattern', label: '올해의 도안', icon: '📝' },
    { key: 'favoriteItem', label: '올해의 뜨개템', icon: '🎁' },
    { key: 'commonPhrase', label: '가장 많이 들은 한마디', icon: '💬' }
  ];

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(member.id, { review: editedReview });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedReview({
      completed: member.review?.completed || '',
      frogged: member.review?.frogged || '',
      favoriteYarn: member.review?.favoriteYarn || '',
      favoritePattern: member.review?.favoritePattern || '',
      favoriteItem: member.review?.favoriteItem || '',
      commonPhrase: member.review?.commonPhrase || ''
    });
    setIsEditing(false);
  };

  // 값이 있는 필드만 필터링
  const filledFields = reviewFields.filter(field => editedReview[field.key]);

  if (isEditing) {
    return (
      <>
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-0 md:p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`${bgColor} p-6 md:p-8 md:rounded-3xl card-shadow w-full md:max-w-2xl h-full md:h-auto md:max-h-[90vh] overflow-y-auto`}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 font-gowun">연말 결산 편집</h2>
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-white/50 rounded-full transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {reviewFields.map((field) => (
              <div key={field.key} className="mb-4">
                <h4 className="text-sm font-semibold text-gray-600 mb-2">
                  {field.icon} {field.label}
                </h4>
                <input
                  type="text"
                  value={editedReview[field.key]}
                  onChange={(e) => setEditedReview({ ...editedReview, [field.key]: e.target.value })}
                  className={`text-sm bg-white/70 backdrop-blur-sm border-0 px-4 py-2.5 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-indie-pink/50 shadow-sm transition-all placeholder:text-gray-400 ${
                    field.key === 'completed' ? 'bg-gray-100/70 cursor-not-allowed' : ''
                  }`}
                  placeholder={field.key === 'completed' ? '자동 업데이트' : `${field.label}을 입력하세요`}
                  readOnly={field.key === 'completed'}
                />
              </div>
            ))}

            <div className="flex gap-3 sticky bottom-0 bg-inherit pt-4 pb-2 -mx-6 px-6 md:mx-0 md:px-0 md:static md:pb-0">
              <button
                onClick={handleSave}
                className="flex-1 bg-indie-pink text-white py-3 rounded-xl hover:bg-indie-pink/80 transition-colors font-semibold shadow-lg"
              >
                저장
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-400 transition-colors font-semibold hidden md:block"
              >
                취소
              </button>
            </div>
          </motion.div>
        </div>

        <div className={`${bgColor} p-6 rounded-3xl card-shadow opacity-50 hidden md:block`}>
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-800 font-gowun">{member.name}</h3>
            <div className="w-12 h-1 bg-indie-pink rounded-full mt-2"></div>
          </div>
          <p className="text-sm text-gray-500 text-center py-8">편집 중...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
        animate={{
          opacity: 1,
          scale: 1,
          rotate: 0,
          y: isOwnCard ? -8 : 0
        }}
        transition={{
          duration: 0.5,
          delay: index * 0.05,
          type: "spring",
          stiffness: 100
        }}
        whileHover={{
          scale: 1.05,
          rotate: isHovered ? 2 : 0,
          zIndex: 10
        }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={() => setIsViewingDetail(true)}
        className={`${bgColor} p-6 rounded-3xl card-shadow transition-all relative cursor-pointer ${
          isOwnCard
            ? 'ring-4 ring-indie-pink shadow-[0_0_30px_rgba(255,182,193,0.4)] ring-offset-2'
            : ''
        }`}
        style={{ maxHeight: '400px' }}
      >
        {/* 배지 - 좌측 상단 */}
        <motion.div
          initial={{ opacity: 0, scale: 0, x: -20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{
            delay: 0.2,
            type: "spring",
            stiffness: 300
          }}
          className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md z-10 flex items-center gap-1.5"
        >
          <span className="text-base">{badge.icon}</span>
          <span className={`text-xs font-semibold ${badge.color}`}>{badge.label}</span>
        </motion.div>

        {/* 편집 버튼 - 본인 카드에만 표시 */}
        {isOwnCard && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className="absolute top-4 right-4 bg-indie-pink text-white hover:bg-indie-pink/80 p-2 rounded-full transition-colors shadow-lg z-10"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        )}

        {/* 카드 내용 - 고정 높이로 제한 */}
        <div className="overflow-hidden" style={{ maxHeight: '340px' }}>
          <div className="mb-4 mt-12">
            <h3 className={`${getNameFontSize(member.name)} font-bold text-gray-800 font-gowun truncate`}>{member.name}님의 뜨개 기록</h3>
            <div className="w-12 h-1 bg-indie-pink rounded-full mt-2"></div>
          </div>

          {/* 요약 표시 */}
          <div className="space-y-3">
            {filledFields.length > 0 ? (
              <>
                {filledFields.slice(0, 3).map((field) => (
                  <div key={field.key} className="bg-white/50 backdrop-blur-sm rounded-xl p-3">
                    <p className="text-xs text-gray-600 font-medium mb-1">
                      {field.icon} {field.label}
                    </p>
                    <p className="text-sm text-gray-800 line-clamp-1">
                      {editedReview[field.key]}
                    </p>
                  </div>
                ))}

              </>
            ) : (
              <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 text-center">
                <p className="text-sm text-gray-400 italic">
                  등록된 뜨개 기록이 없습니다
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 확장 아이콘 */}
        <div className="absolute bottom-3 right-3 p-2 bg-white/80 rounded-full shadow-sm">
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </div>
      </motion.div>

      {isViewingDetail && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setIsViewingDetail(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className={`${bgColor} p-6 md:p-8 rounded-3xl card-shadow w-full max-w-2xl max-h-[90vh] overflow-y-auto`}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 font-gowun">{member.name}님의 뜨개 기록</h2>
              <button
                onClick={() => setIsViewingDetail(false)}
                className="p-2 hover:bg-white/50 rounded-full transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {reviewFields.map((field, idx) => (
              editedReview[field.key] && (
                <div key={field.key} className="mb-4">
                  <div className={`${tagColors[idx % tagColors.length]} px-4 py-3 rounded-2xl shadow-sm`}>
                    <span className="font-semibold">
                      {field.icon} #{field.label}:
                    </span>{' '}
                    {editedReview[field.key]}
                  </div>
                </div>
              )
            ))}

            {filledFields.length === 0 && (
              <p className="text-sm text-gray-400 italic text-center py-8">
                아직 등록된 뜨개 기록이 없습니다
              </p>
            )}

            {isOwnCard && (
              <button
                onClick={() => {
                  setIsViewingDetail(false);
                  setIsEditing(true);
                }}
                className="w-full mt-6 bg-indie-pink text-white py-3 rounded-xl hover:bg-indie-pink/80 transition-colors font-semibold"
              >
                편집하기
              </button>
            )}
          </motion.div>
        </div>
      )}
    </>
  );
};

export default YearEndReviewCard;
