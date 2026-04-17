import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const ArchiveGallery = ({
  photos, onDeletePhoto, onUpdatePhoto, onUploadPhoto, uploading,
  memoryPhotos, memoryUploading, onUploadMemoryPhoto, onDeleteMemoryPhoto,
  currentUserId, members
}) => {
  const [galleryTab, setGalleryTab] = useState('works'); // 'works' or 'memories'
  const [filterMode, setFilterMode] = useState(() => {
    return localStorage.getItem('silmongsil_gallery_filter') || 'all';
  });
  const [displayCount, setDisplayCount] = useState(12);
  const [memoryDisplayCount, setMemoryDisplayCount] = useState(12);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isEditingPhoto, setIsEditingPhoto] = useState(false);
  const [editedPhotoData, setEditedPhotoData] = useState({ yarn: '', pattern: '', caption: '' });
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({ file: null, preview: null, projectTitle: '', caption: '', yarn: '', pattern: '' });
  // Memory upload
  const [showMemoryUploadModal, setShowMemoryUploadModal] = useState(false);
  const [memoryUploadData, setMemoryUploadData] = useState({ file: null, preview: null, title: '', caption: '', date: new Date().toISOString().split('T')[0] });

  const currentMember = members?.find(m => m.id === currentUserId);

  // Works upload
  const handleUploadFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setUploadData(prev => ({ ...prev, file, preview: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleUploadSubmit = async () => {
    if (!uploadData.file || !uploadData.projectTitle.trim() || !onUploadPhoto) return;
    try {
      await onUploadPhoto(uploadData.file, {
        authorId: currentUserId,
        authorName: currentMember?.name || '익명',
        projectTitle: uploadData.projectTitle.trim(),
        caption: uploadData.caption,
        yarn: uploadData.yarn,
        pattern: uploadData.pattern,
        date: new Date().toISOString().split('T')[0].replace(/-/g, '.'),
        tags: ['완성작']
      });
      alert('사진이 업로드되었습니다! 🎉');
      setUploadData({ file: null, preview: null, projectTitle: '', caption: '', yarn: '', pattern: '' });
      setShowUploadModal(false);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('업로드에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // Memory upload
  const handleMemoryFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setMemoryUploadData(prev => ({ ...prev, file, preview: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleMemoryUploadSubmit = async () => {
    if (!memoryUploadData.file || !memoryUploadData.title.trim() || !onUploadMemoryPhoto) return;
    try {
      await onUploadMemoryPhoto(memoryUploadData.file, {
        title: memoryUploadData.title.trim(),
        caption: memoryUploadData.caption,
        date: memoryUploadData.date.replace(/-/g, '.'),
        authorId: currentUserId,
        authorName: currentMember?.name || '익명',
      });
      alert('추억 사진이 업로드되었습니다! 🎉');
      setMemoryUploadData({ file: null, preview: null, title: '', caption: '', date: new Date().toISOString().split('T')[0] });
      setShowMemoryUploadModal(false);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('업로드에 실패했습니다. 다시 시도해주세요.');
    }
  };

  useEffect(() => {
    localStorage.setItem('silmongsil_gallery_filter', filterMode);
  }, [filterMode]);

  const filteredPhotos = filterMode === 'mine'
    ? photos?.filter(photo => photo.authorId === currentUserId) || []
    : photos || [];

  const displayedPhotos = filteredPhotos.slice(0, displayCount);
  const hasMore = filteredPhotos.length > displayCount;
  const isLoading = photos === undefined || photos === null;

  // Memory photos
  const filteredMemoryPhotos = filterMode === 'mine'
    ? memoryPhotos?.filter(p => p.authorId === currentUserId) || []
    : memoryPhotos || [];
  const displayedMemoryPhotos = filteredMemoryPhotos.slice(0, memoryDisplayCount);
  const hasMoreMemory = filteredMemoryPhotos.length > memoryDisplayCount;

  const handleLoadMore = () => setDisplayCount(prev => prev + 12);
  const handleLoadMoreMemory = () => setMemoryDisplayCount(prev => prev + 12);

  useEffect(() => {
    setDisplayCount(12);
    setMemoryDisplayCount(12);
  }, [filterMode]);

  // Edit photo
  const handleEditPhoto = () => {
    setEditedPhotoData({
      yarn: selectedPhoto.yarn || '',
      pattern: selectedPhoto.pattern || '',
      caption: selectedPhoto.caption || ''
    });
    setIsEditingPhoto(true);
  };

  const handleCancelEdit = () => {
    setIsEditingPhoto(false);
    setEditedPhotoData({ yarn: '', pattern: '', caption: '' });
  };

  const handleSaveEdit = async () => {
    if (onUpdatePhoto && selectedPhoto) {
      try {
        await onUpdatePhoto(selectedPhoto.id, editedPhotoData);
        setSelectedPhoto({ ...selectedPhoto, ...editedPhotoData });
        setIsEditingPhoto(false);
      } catch (error) {
        console.error('Failed to update photo:', error);
        alert('사진 정보 수정에 실패했습니다.');
      }
    }
  };

  // Shared photo grid renderer
  const renderPhotoGrid = (photoList, isMemory = false) => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1 md:gap-1.5">
      {photoList.map((photo, index) => {
        const isOwnPhoto = photo.authorId === currentUserId;
        return (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: index * 0.03 }}
            onClick={() => setSelectedPhoto({ ...photo, _isMemory: isMemory })}
            className="relative aspect-square cursor-pointer group overflow-hidden bg-gray-100 rounded-sm"
          >
            <img
              src={photo.imageUrl || photo.image}
              alt={photo.projectTitle || photo.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {/* Author - always visible */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent pt-6 pb-2 px-2.5">
              <p className="text-white text-xs font-medium truncate drop-shadow-lg">
                {photo.authorName || photo.author}
              </p>
            </div>
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center">
              <p className="text-white text-sm font-semibold text-center px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 drop-shadow-lg line-clamp-2">
                {photo.projectTitle || photo.title}
              </p>
            </div>
            {isOwnPhoto && (
              <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-indie-pink shadow-sm ring-1 ring-white/50" />
            )}
          </motion.div>
        );
      })}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="w-full py-12 px-6 md:px-12 bg-gradient-to-b from-warm-cream to-light-beige"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 font-gowun">
            갤러리 📸
          </h2>

          {/* Gallery sub-tabs */}
          <div className="inline-flex items-center bg-white p-1 rounded-full shadow-md mb-4">
            <button
              onClick={() => setGalleryTab('works')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                galleryTab === 'works'
                  ? 'bg-gradient-to-r from-indie-pink to-soft-coral text-white shadow-md'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              🧶 작품
            </button>
            <button
              onClick={() => setGalleryTab('memories')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                galleryTab === 'memories'
                  ? 'bg-gradient-to-r from-indie-pink to-soft-coral text-white shadow-md'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              💕 추억
            </button>
          </div>

          {/* Filter (all / mine) */}
          <div className="flex items-center justify-center gap-3">
            <div className="inline-flex items-center bg-white/70 p-1 rounded-full">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                  filterMode === 'all'
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                전체
              </button>
              <button
                onClick={() => setFilterMode('mine')}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                  filterMode === 'mine'
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                내 사진
              </button>
            </div>

            {/* Upload button */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => galleryTab === 'works' ? setShowUploadModal(true) : setShowMemoryUploadModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-white/80 hover:bg-white text-gray-500 hover:text-indie-pink rounded-full text-xs font-medium transition-all shadow-sm"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              올리기
            </motion.button>
          </div>
        </div>

        {/* Works tab */}
        <AnimatePresence mode="wait">
          {galleryTab === 'works' && (
            <motion.div
              key="works"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1 md:gap-1.5">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="aspect-square bg-gray-200 animate-pulse rounded-sm" />
                  ))}
                </div>
              ) : filteredPhotos.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-5xl mb-4">🧶</div>
                  <p className="text-gray-500">{filterMode === 'mine' ? '아직 올린 작품이 없어요' : '아직 작품 사진이 없어요'}</p>
                </div>
              ) : (
                <>
                  {renderPhotoGrid(displayedPhotos, false)}
                  {hasMore && (
                    <div className="text-center mt-8">
                      <button onClick={handleLoadMore} className="bg-white/80 hover:bg-white text-gray-600 hover:text-indie-pink font-medium py-3 px-8 rounded-full transition-all shadow-sm hover:shadow-md text-sm">
                        더 보기 ({filteredPhotos.length - displayCount}개 남음)
                      </button>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}

          {/* Memories tab */}
          {galleryTab === 'memories' && (
            <motion.div
              key="memories"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {filteredMemoryPhotos.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-5xl mb-4">💕</div>
                  <p className="text-gray-500">{filterMode === 'mine' ? '아직 올린 추억이 없어요' : '아직 추억 사진이 없어요'}</p>
                  <p className="text-sm text-gray-400 mt-1">모임 사진을 올려보세요!</p>
                </div>
              ) : (
                <>
                  {renderPhotoGrid(displayedMemoryPhotos, true)}
                  {hasMoreMemory && (
                    <div className="text-center mt-8">
                      <button onClick={handleLoadMoreMemory} className="bg-white/80 hover:bg-white text-gray-600 hover:text-indie-pink font-medium py-3 px-8 rounded-full transition-all shadow-sm hover:shadow-md text-sm">
                        더 보기 ({filteredMemoryPhotos.length - memoryDisplayCount}개 남음)
                      </button>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Photo Detail Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { setSelectedPhoto(null); setIsEditingPhoto(false); }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => { setSelectedPhoto(null); setIsEditingPhoto(false); }}
                className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-600 hover:text-gray-800 p-2 rounded-full shadow-lg transition-all z-10"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="relative w-full bg-gray-100">
                <img
                  src={selectedPhoto.imageUrl || selectedPhoto.image}
                  alt={selectedPhoto.projectTitle || selectedPhoto.title}
                  className="w-full h-auto max-h-[60vh] object-contain"
                />
              </div>

              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  {selectedPhoto.projectTitle || selectedPhoto.title}
                </h3>

                {/* Edit mode (works only) */}
                {isEditingPhoto && !selectedPhoto._isMemory ? (
                  <div className="mb-4 space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1 block">🧶 사용한 실</label>
                      <input type="text" value={editedPhotoData.yarn} onChange={(e) => setEditedPhotoData({ ...editedPhotoData, yarn: e.target.value })} placeholder="예: 람스울 울실..." className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indie-pink focus:outline-none text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1 block">📝 도안</label>
                      <input type="text" value={editedPhotoData.pattern} onChange={(e) => setEditedPhotoData({ ...editedPhotoData, pattern: e.target.value })} placeholder="예: 자체제작..." className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indie-pink focus:outline-none text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1 block">💬 소감</label>
                      <textarea value={editedPhotoData.caption} onChange={(e) => setEditedPhotoData({ ...editedPhotoData, caption: e.target.value })} placeholder="소감..." className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indie-pink focus:outline-none resize-none text-sm" rows={3} />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleSaveEdit} className="flex-1 bg-indie-pink text-white py-2.5 rounded-xl hover:bg-indie-pink/80 transition-colors font-medium text-sm">저장</button>
                      <button onClick={handleCancelEdit} className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-xl hover:bg-gray-300 transition-colors font-medium text-sm">취소</button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Works: yarn & pattern info */}
                    {!selectedPhoto._isMemory && (selectedPhoto.yarn || selectedPhoto.pattern) && (
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
                    {/* Caption */}
                    {selectedPhoto.caption && (
                      <div className="mb-4 bg-gradient-to-br from-light-beige/30 to-warm-cream/30 rounded-2xl p-4">
                        <p className="text-xs font-semibold text-gray-500 mb-1">💬 소감</p>
                        <p className="text-gray-700 leading-relaxed">{selectedPhoto.caption}</p>
                      </div>
                    )}
                  </>
                )}

                <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                  <span className="px-4 py-2 bg-gradient-to-r from-indie-pink/20 to-soft-coral/20 text-indie-pink font-medium rounded-full">
                    {selectedPhoto.authorName || selectedPhoto.author}
                  </span>
                  <span className="text-gray-400 text-sm">{selectedPhoto.date}</span>
                </div>

                {/* Actions for own photos */}
                {selectedPhoto.authorId === currentUserId && !isEditingPhoto && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex gap-2">
                      {!selectedPhoto._isMemory && (
                        <button onClick={handleEditPhoto} className="flex-1 bg-indie-pink/10 hover:bg-indie-pink/20 text-indie-pink py-3 rounded-2xl font-medium transition-all">
                          정보 수정하기
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (window.confirm('정말 이 사진을 삭제하시겠습니까?')) {
                            if (selectedPhoto._isMemory) {
                              onDeleteMemoryPhoto(selectedPhoto.id, selectedPhoto.storagePath);
                            } else {
                              onDeletePhoto(selectedPhoto.id, selectedPhoto.storagePath);
                            }
                            setSelectedPhoto(null);
                          }
                        }}
                        className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-3 rounded-2xl font-medium transition-all"
                      >
                        삭제하기
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Works Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowUploadModal(false)}
            className="fixed inset-0 bg-black/60 flex items-end md:items-center justify-center z-50 p-0 md:p-4"
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full md:max-w-lg md:rounded-3xl rounded-t-3xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800 font-gowun">작품 사진 올리기 🧶</h3>
                  <button onClick={() => setShowUploadModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="mb-4">
                  {!uploadData.preview ? (
                    <label className="block w-full h-48 border-2 border-dashed border-gray-300 rounded-2xl hover:border-indie-pink transition-colors cursor-pointer">
                      <div className="h-full flex flex-col items-center justify-center text-gray-500">
                        <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <p className="text-sm">사진을 선택해주세요</p>
                      </div>
                      <input type="file" accept="image/*" onChange={handleUploadFileChange} className="hidden" />
                    </label>
                  ) : (
                    <div className="relative">
                      <img src={uploadData.preview} alt="Preview" className="w-full h-64 object-cover rounded-2xl" />
                      <button onClick={() => setUploadData(prev => ({ ...prev, file: null, preview: null }))} className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  )}
                </div>
                <input type="text" value={uploadData.projectTitle} onChange={(e) => setUploadData(prev => ({ ...prev, projectTitle: e.target.value }))} placeholder="작품 이름 *" className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indie-pink focus:outline-none text-sm mb-3" />
                <input type="text" value={uploadData.yarn} onChange={(e) => setUploadData(prev => ({ ...prev, yarn: e.target.value }))} placeholder="사용한 실 (선택)" className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indie-pink focus:outline-none text-sm mb-3" />
                <input type="text" value={uploadData.pattern} onChange={(e) => setUploadData(prev => ({ ...prev, pattern: e.target.value }))} placeholder="도안 (선택)" className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indie-pink focus:outline-none text-sm mb-3" />
                <textarea value={uploadData.caption} onChange={(e) => setUploadData(prev => ({ ...prev, caption: e.target.value }))} placeholder="소감 (선택)" className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indie-pink focus:outline-none resize-none text-sm mb-5" rows={2} />
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleUploadSubmit}
                  disabled={!uploadData.file || !uploadData.projectTitle.trim() || uploading}
                  className={`w-full py-3.5 rounded-full font-semibold text-white transition-all ${uploadData.file && uploadData.projectTitle.trim() && !uploading ? 'bg-gradient-to-r from-indie-pink to-soft-coral hover:shadow-lg' : 'bg-gray-300 cursor-not-allowed'}`}
                >
                  {uploading ? '업로드 중...' : '올리기'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Memory Upload Modal */}
      <AnimatePresence>
        {showMemoryUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowMemoryUploadModal(false)}
            className="fixed inset-0 bg-black/60 flex items-end md:items-center justify-center z-50 p-0 md:p-4"
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full md:max-w-lg md:rounded-3xl rounded-t-3xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800 font-gowun">추억 사진 올리기 💕</h3>
                  <button onClick={() => setShowMemoryUploadModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="mb-4">
                  {!memoryUploadData.preview ? (
                    <label className="block w-full h-48 border-2 border-dashed border-gray-300 rounded-2xl hover:border-indie-pink transition-colors cursor-pointer">
                      <div className="h-full flex flex-col items-center justify-center text-gray-500">
                        <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <p className="text-sm">사진을 선택해주세요</p>
                      </div>
                      <input type="file" accept="image/*" onChange={handleMemoryFileChange} className="hidden" />
                    </label>
                  ) : (
                    <div className="relative">
                      <img src={memoryUploadData.preview} alt="Preview" className="w-full h-64 object-cover rounded-2xl" />
                      <button onClick={() => setMemoryUploadData(prev => ({ ...prev, file: null, preview: null }))} className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  )}
                </div>
                <input type="text" value={memoryUploadData.title} onChange={(e) => setMemoryUploadData(prev => ({ ...prev, title: e.target.value }))} placeholder="제목 *" className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indie-pink focus:outline-none text-sm mb-3" />
                <input type="date" value={memoryUploadData.date} onChange={(e) => setMemoryUploadData(prev => ({ ...prev, date: e.target.value }))} className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indie-pink focus:outline-none text-sm mb-3" />
                <textarea value={memoryUploadData.caption} onChange={(e) => setMemoryUploadData(prev => ({ ...prev, caption: e.target.value }))} placeholder="소감 (선택)" className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indie-pink focus:outline-none resize-none text-sm mb-5" rows={2} />
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleMemoryUploadSubmit}
                  disabled={!memoryUploadData.file || !memoryUploadData.title.trim() || memoryUploading}
                  className={`w-full py-3.5 rounded-full font-semibold text-white transition-all ${memoryUploadData.file && memoryUploadData.title.trim() && !memoryUploading ? 'bg-gradient-to-r from-indie-pink to-soft-coral hover:shadow-lg' : 'bg-gray-300 cursor-not-allowed'}`}
                >
                  {memoryUploading ? '업로드 중...' : '올리기'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ArchiveGallery;
