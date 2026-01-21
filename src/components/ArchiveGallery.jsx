import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';

// 스켈레톤 카드 컴포넌트
const SkeletonCard = ({ index }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: index * 0.05 }}
    className="bg-white p-4 rounded-3xl shadow-md"
  >
    <div className="aspect-square bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded-2xl mb-4 animate-pulse"></div>
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded-full w-3/4 mx-auto animate-pulse"></div>
      <div className="h-3 bg-gray-200 rounded-full w-1/2 mx-auto animate-pulse"></div>
    </div>
  </motion.div>
);

const ArchiveGallery = ({ photos, onDeletePhoto, onUpdatePhoto, currentUserId }) => {
  const [filterMode, setFilterMode] = useState(() => {
    // localStorage에서 저장된 필터 모드 복원
    return localStorage.getItem('silmongsil_gallery_filter') || 'all';
  }); // 'all' or 'mine'
  const [displayCount, setDisplayCount] = useState(12); // 처음 표시할 사진 개수
  const [selectedPhoto, setSelectedPhoto] = useState(null); // 상세보기 모달용
  const [isEditingPhoto, setIsEditingPhoto] = useState(false); // 사진 편집 모드
  const [editedPhotoData, setEditedPhotoData] = useState({ yarn: '', pattern: '', caption: '' }); // 편집 중인 데이터

  // 필터 모드 변경 시 localStorage에 저장
  useEffect(() => {
    localStorage.setItem('silmongsil_gallery_filter', filterMode);
  }, [filterMode]);

  // 필터링된 사진 목록 (이미 최신순으로 정렬되어 옴)
  const filteredPhotos = filterMode === 'mine'
    ? photos?.filter(photo => photo.authorId === currentUserId) || []
    : photos || [];

  // 표시할 사진 목록 (페이지네이션 적용)
  const displayedPhotos = filteredPhotos.slice(0, displayCount);
  const hasMore = filteredPhotos.length > displayCount;

  // 실제 로딩 상태 (사진 데이터가 아직 로드되지 않았을 때만)
  const isLoading = photos === undefined || photos === null;

  // 더보기 버튼 클릭 핸들러
  const handleLoadMore = () => {
    setDisplayCount(prev => prev + 12);
  };

  // 필터 변경 시 displayCount 초기화
  useEffect(() => {
    setDisplayCount(12);
  }, [filterMode]);

  // 수정 모드 진입
  const handleEditPhoto = () => {
    setEditedPhotoData({
      yarn: selectedPhoto.yarn || '',
      pattern: selectedPhoto.pattern || '',
      caption: selectedPhoto.caption || ''
    });
    setIsEditingPhoto(true);
  };

  // 수정 취소
  const handleCancelEdit = () => {
    setIsEditingPhoto(false);
    setEditedPhotoData({ yarn: '', pattern: '', caption: '' });
  };

  // 수정 저장
  const handleSaveEdit = async () => {
    if (onUpdatePhoto && selectedPhoto) {
      try {
        await onUpdatePhoto(selectedPhoto.id, editedPhotoData);
        // 로컬 상태 업데이트
        setSelectedPhoto({
          ...selectedPhoto,
          ...editedPhotoData
        });
        setIsEditingPhoto(false);
      } catch (error) {
        console.error('Failed to update photo:', error);
        alert('사진 정보 수정에 실패했습니다.');
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="w-full py-12 px-6 md:px-12 bg-gradient-to-b from-warm-cream to-light-beige"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3 font-gowun">
            F/O 했어요 📸
          </h2>


          {/* Toggle Switch */}
          <div className="inline-flex items-center bg-white p-1.5 rounded-full shadow-md">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                filterMode === 'all'
                  ? 'bg-gradient-to-r from-indie-pink to-soft-coral text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              🧶 전체 작품 구경하기
            </button>
            <button
              onClick={() => setFilterMode('mine')}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                filterMode === 'mine'
                  ? 'bg-gradient-to-r from-indie-pink to-soft-coral text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              ✨ 내 작품만 보기
            </button>
          </div>

          {/* Filtered Count */}
          {filterMode === 'mine' && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-indie-pink mt-3"
            >
              내 작품 {filteredPhotos.length}개
            </motion.p>
          )}
        </div>

        {/* Loading Skeleton */}
        {isLoading ? (
          <ResponsiveMasonry
            columnsCountBreakPoints={{ 350: 2, 768: 3, 1024: 4 }}
          >
            <Masonry gutter="1.5rem">
              {[...Array(8)].map((_, index) => (
                <SkeletonCard key={index} index={index} />
              ))}
            </Masonry>
          </ResponsiveMasonry>
        ) : filteredPhotos.length === 0 && filterMode === 'all' ? (
          /* Empty State - No photos at all */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">📸</div>
            <p className="text-gray-600 text-lg font-medium mb-6">
              아직 업로드된 작품이 없습니다
            </p>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={filterMode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ResponsiveMasonry
                columnsCountBreakPoints={{ 350: 2, 768: 3, 1024: 4 }}
              >
                <Masonry gutter="1.5rem">
                  {/* Existing Photos */}
                  {displayedPhotos.map((photo, index) => {
                    const isOwnPhoto = photo.authorId === currentUserId;
                    return (
                      <motion.div
                        key={photo.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          duration: 0.4,
                          delay: index * 0.05,
                          type: "spring",
                          stiffness: 100
                        }}
                        whileHover={{
                          scale: 1.05,
                          zIndex: 10,
                          transition: { duration: 0.2 }
                        }}
                        className="group relative cursor-pointer"
                        onClick={() => setSelectedPhoto(photo)}
                      >
                        <div className={`bg-white p-4 rounded-3xl shadow-lg transition-all duration-300 hover:shadow-2xl ${
                          isOwnPhoto ? 'ring-2 ring-indie-pink ring-offset-2' : ''
                        }`}>
                          {/* Delete Button - Only for own photos */}
                          {isOwnPhoto && onDeletePhoto && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeletePhoto(photo.id, photo.storagePath);
                              }}
                              className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-lg"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}

                          {/* Photo */}
                          <div className="relative overflow-hidden rounded-2xl bg-gray-100 mb-4">
                            <img
                              src={photo.imageUrl || photo.image}
                              alt={photo.projectTitle || photo.title}
                              loading="lazy"
                              className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          </div>

                          {/* Caption */}
                          <div className="text-center px-2">
                            <h4 className="font-semibold text-gray-800 mb-1 line-clamp-2">
                              {photo.projectTitle || photo.title}
                            </h4>
                            {photo.caption && (
                              <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                                {photo.caption}
                              </p>
                            )}
                            <div className="flex items-center justify-center gap-2 mt-2">
                              <span className="px-3 py-1 bg-gradient-to-r from-indie-pink/10 to-soft-coral/10 text-indie-pink text-xs font-medium rounded-full">
                                {photo.authorName || photo.author}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-2">{photo.date}</p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </Masonry>
              </ResponsiveMasonry>

              {/* 더보기 버튼 */}
              {hasMore && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-center mt-12"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLoadMore}
                    className="bg-gradient-to-r from-indie-pink/20 to-soft-coral/20 hover:from-indie-pink/30 hover:to-soft-coral/30 text-indie-pink font-semibold py-4 px-8 rounded-full transition-all shadow-sm hover:shadow-md inline-flex items-center gap-2"
                  >
                    <span className="text-lg">🧶</span>
                    <span>이전 작품 더 구경하기</span>
                    <span className="text-sm opacity-70">({filteredPhotos.length - displayCount}개 남음)</span>
                  </motion.button>
                </motion.div>
              )}

              {/* 모든 작품 구경 완료 메시지 */}
              {!hasMore && filteredPhotos.length > 0 && displayCount >= filteredPhotos.length && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center mt-12 py-8"
                >
                  <p className="text-gray-500 text-sm">✨ 모든 작품을 다 구경했어요! ✨</p>
                </motion.div>
              )}

              {/* Empty State */}
              {filterMode === 'mine' && filteredPhotos.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-20"
                >
                  <div className="text-6xl mb-4">📸</div>
                  <p className="text-gray-600 text-lg font-medium mb-2">
                    아직 업로드한 작품이 없습니다
                  </p>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Photo Detail Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPhoto(null)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-600 hover:text-gray-800 p-2 rounded-full shadow-lg transition-all z-10"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Photo */}
              <div className="relative w-full bg-gray-100">
                <img
                  src={selectedPhoto.imageUrl || selectedPhoto.image}
                  alt={selectedPhoto.projectTitle || selectedPhoto.title}
                  className="w-full h-auto max-h-[60vh] object-contain"
                />
              </div>

              {/* Details */}
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  {selectedPhoto.projectTitle || selectedPhoto.title}
                </h3>

                {/* 사용한 실, 도안 정보 */}
                {(selectedPhoto.yarn || selectedPhoto.pattern) && (
                  <div className="mb-4 space-y-2">
                    {selectedPhoto.yarn && (
                      <div className="flex items-start gap-2">
                        <span className="text-lg flex-shrink-0">🧶</span>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 mb-0.5">사용한 실</p>
                          <p className="text-sm text-gray-700">{selectedPhoto.yarn}</p>
                        </div>
                      </div>
                    )}
                    {selectedPhoto.pattern && (
                      <div className="flex items-start gap-2">
                        <span className="text-lg flex-shrink-0">📝</span>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 mb-0.5">도안</p>
                          <p className="text-sm text-gray-700">{selectedPhoto.pattern}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 소감 */}
                {selectedPhoto.caption && (
                  <div className="mb-4 bg-gradient-to-br from-light-beige/30 to-warm-cream/30 rounded-2xl p-4">
                    <p className="text-xs font-semibold text-gray-500 mb-1">💬 소감</p>
                    <p className="text-gray-700 leading-relaxed">
                      {selectedPhoto.caption}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <span className="px-4 py-2 bg-gradient-to-r from-indie-pink/20 to-soft-coral/20 text-indie-pink font-medium rounded-full">
                      {selectedPhoto.authorName || selectedPhoto.author}
                    </span>
                  </div>
                  <span className="text-gray-400 text-sm">
                    {selectedPhoto.date}
                  </span>
                </div>

                {/* Delete Button for Own Photos */}
                {selectedPhoto.authorId === currentUserId && onDeletePhoto && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => {
                        if (window.confirm('정말 이 사진을 삭제하시겠습니까?')) {
                          onDeletePhoto(selectedPhoto.id, selectedPhoto.storagePath);
                          setSelectedPhoto(null);
                        }
                      }}
                      className="w-full bg-red-50 hover:bg-red-100 text-red-600 py-3 rounded-2xl font-medium transition-all"
                    >
                      사진 삭제하기
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ArchiveGallery;
