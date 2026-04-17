import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const availableTags = [
  { id: 'cafe', label: '카페', emoji: '☕' },
  { id: 'yarn', label: '실가게', emoji: '🧶' },
  { id: 'restaurant', label: '맛집', emoji: '🍽️' },
  { id: 'etc', label: '기타', emoji: '📍' },
];

const getTagInfo = (tagId) => {
  return availableTags.find(t => t.id === tagId) || { id: tagId, label: tagId, emoji: '📍' };
};

const tagColors = {
  cafe: 'bg-amber-50 border-amber-200 text-amber-700',
  yarn: 'bg-pink-50 border-pink-200 text-pink-700',
  restaurant: 'bg-green-50 border-green-200 text-green-700',
  etc: 'bg-gray-50 border-gray-200 text-gray-600',
};

const cardColors = [
  'from-amber-50 to-orange-50',
  'from-pink-50 to-rose-50',
  'from-blue-50 to-indigo-50',
  'from-purple-50 to-violet-50',
  'from-green-50 to-emerald-50',
  'from-yellow-50 to-amber-50',
];

const PlaceList = ({ locations, onAddLocation, onDeleteLocation, onUpdateLocation, currentUserId, members }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newPlace, setNewPlace] = useState({ name: '', description: '', tags: [] });
  const [filterTag, setFilterTag] = useState(null);

  const currentUser = members?.find(m => m.id === currentUserId);
  const currentUserName = currentUser?.name || '익명';

  // Toggle like
  const handleLike = async (location) => {
    if (!currentUserId || !onUpdateLocation) return;
    const likes = location.likes || [];
    const isLiked = likes.includes(currentUserId);
    const newLikes = isLiked
      ? likes.filter(id => id !== currentUserId)
      : [...likes, currentUserId];
    await onUpdateLocation(location.id, { likes: newLikes });
  };

  // Add place
  const handleAdd = async () => {
    if (!newPlace.name.trim()) return;
    await onAddLocation(
      {
        name: newPlace.name.trim(),
        description: newPlace.description.trim(),
        tags: newPlace.tags.length > 0 ? newPlace.tags : ['etc'],
      },
      currentUserId,
      currentUserName
    );
    setNewPlace({ name: '', description: '', tags: [] });
    setIsAdding(false);
  };

  const toggleTag = (tagId) => {
    setNewPlace(prev => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter(t => t !== tagId)
        : [...prev.tags, tagId]
    }));
  };

  // Filter locations
  const filtered = filterTag
    ? locations.filter(loc => (loc.tags || []).includes(filterTag))
    : locations;

  // Sort by likes count
  const sorted = [...filtered].sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));

  return (
    <div>
      {/* Add button + Filter tags */}
      {!isAdding && (
        <div className="text-center mb-6">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 hover:bg-white text-gray-600 hover:text-indie-pink rounded-2xl card-shadow transition-all font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            장소 추가하기
          </motion.button>
        </div>
      )}

      {/* Add form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mb-6 bg-white/90 backdrop-blur-sm rounded-2xl p-6 card-shadow max-w-lg mx-auto"
          >
            <h4 className="font-bold text-gray-800 mb-4">새 장소 추가</h4>

            <input
              type="text"
              value={newPlace.name}
              onChange={(e) => setNewPlace({ ...newPlace, name: e.target.value })}
              placeholder="장소 이름"
              className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indie-pink/40 mb-3"
              autoFocus
            />

            <textarea
              value={newPlace.description}
              onChange={(e) => setNewPlace({ ...newPlace, description: e.target.value })}
              placeholder="설명 (선택)"
              rows={2}
              className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indie-pink/40 mb-3 resize-none"
            />

            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2">카테고리</p>
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      newPlace.tags.includes(tag.id)
                        ? 'bg-indie-pink text-white border-indie-pink'
                        : 'bg-white text-gray-500 border-gray-200 hover:border-indie-pink/50'
                    }`}
                  >
                    {tag.emoji} {tag.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                disabled={!newPlace.name.trim()}
                className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  newPlace.name.trim()
                    ? 'bg-indie-pink text-white hover:bg-indie-pink/90'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                추가
              </button>
              <button
                onClick={() => { setIsAdding(false); setNewPlace({ name: '', description: '', tags: [] }); }}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
              >
                취소
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        <button
          onClick={() => setFilterTag(null)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            !filterTag
              ? 'bg-indie-pink text-white shadow-md'
              : 'bg-white/80 text-gray-500 hover:bg-white'
          }`}
        >
          전체
        </button>
        {availableTags.map(tag => (
          <button
            key={tag.id}
            onClick={() => setFilterTag(filterTag === tag.id ? null : tag.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              filterTag === tag.id
                ? 'bg-indie-pink text-white shadow-md'
                : 'bg-white/80 text-gray-500 hover:bg-white'
            }`}
          >
            {tag.emoji} {tag.label}
          </button>
        ))}
      </div>

      {/* Place cards grid */}
      {sorted.length > 0 ? (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
          {sorted.map((location, idx) => {
            const tag = getTagInfo((location.tags || [])[0] || 'etc');
            const likes = location.likes || [];
            const isLiked = likes.includes(currentUserId);
            const isOwner = location.authorId === currentUserId;
            const gradient = cardColors[idx % cardColors.length];

            return (
              <motion.div
                key={location.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.04 }}
                className={`break-inside-avoid bg-gradient-to-br ${gradient} rounded-2xl p-5 card-shadow hover:shadow-lg transition-shadow`}
              >
                {/* Tag badge */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex gap-1.5">
                    {(location.tags || ['etc']).map(tagId => {
                      const t = getTagInfo(tagId);
                      return (
                        <span
                          key={tagId}
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${tagColors[tagId] || tagColors.etc}`}
                        >
                          {t.emoji} {t.label}
                        </span>
                      );
                    })}
                  </div>
                  {isOwner && (
                    <button
                      onClick={() => {
                        if (confirm('이 장소를 삭제할까요?')) {
                          onDeleteLocation(location.id);
                        }
                      }}
                      className="text-gray-300 hover:text-red-400 transition-colors p-1"
                      title="삭제"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Place name */}
                <h3 className="text-lg font-bold text-gray-800 mb-1">{location.name}</h3>

                {/* Description */}
                {location.description && (
                  <p className="text-sm text-gray-600 mb-3 leading-relaxed">{location.description}</p>
                )}

                {/* Author + Like */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-black/5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indie-pink to-soft-coral text-white text-[10px] font-bold flex items-center justify-center">
                      {location.authorName?.charAt(0) || '?'}
                    </div>
                    <span className="text-xs text-gray-500">{location.authorName}</span>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={() => handleLike(location)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      isLiked
                        ? 'bg-indie-pink/15 text-indie-pink'
                        : 'bg-white/60 text-gray-400 hover:text-indie-pink hover:bg-indie-pink/10'
                    }`}
                  >
                    <motion.span
                      animate={isLiked ? { scale: [1, 1.3, 1] } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      {isLiked ? '♥' : '♡'}
                    </motion.span>
                    {likes.length > 0 && <span>{likes.length}</span>}
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <span className="text-5xl mb-4 block">🗺️</span>
          <p className="text-gray-500 mb-1">아직 등록된 장소가 없어요</p>
          <p className="text-sm text-gray-400">가고 싶은 곳을 추가해보세요!</p>
        </div>
      )}

    </div>
  );
};

export default PlaceList;
