import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as U from '../utils/calendarUtils';

const TODAY = new Date();

// ── Add Modal ──
function WishAddModal({ onSave, onClose }) {
  const [form, setForm] = useState({ patternName: '', description: '', recommendedYarn: '' });
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    if (!form.patternName.trim()) { alert('도안이름을 입력해주세요'); return; }
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-3xl p-6 md:p-7 max-w-md w-full shadow-2xl"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-bold text-gray-800 font-gowun">하고 싶은 함뜨 추가</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">도안이름 <span className="text-indie-pink">*</span></label>
            <input value={form.patternName} onChange={set('patternName')} placeholder="예: 봄빛 가디건" className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indie-pink transition-colors" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">함뜨설명 <span className="text-gray-400 font-normal">(선택)</span></label>
            <textarea value={form.description} onChange={set('description')} rows="2" placeholder="어떤 함뜨인지 간단히 설명해주세요" className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indie-pink resize-none transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">추천실 <span className="text-gray-400 font-normal">(선택)</span></label>
            <input value={form.recommendedYarn} onChange={set('recommendedYarn')} placeholder="예: Isager Spinni" className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indie-pink transition-colors" />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl font-semibold hover:bg-gray-200 transition-colors">취소</button>
            <button type="submit" className="flex-1 bg-gradient-to-r from-indie-pink to-soft-coral text-white py-2.5 rounded-xl font-semibold shadow-lg shadow-indie-pink/30 hover:shadow-xl transition-all">추가</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ── Detail Modal ──
function WishDetailModal({ wish, members, currentUserId, onToggleLike, onDelete, onStartHamtteu, onClose }) {
  const [showStartForm, setShowStartForm] = useState(false);
  const [startDate, setStartDate] = useState(U.fmtDate(TODAY));
  const [endDate, setEndDate] = useState(U.fmtDate(TODAY));

  const likes = wish.likes || [];
  const isLiked = likes.includes(currentUserId);
  const author = members?.find(m => m.id === wish.authorId)?.name || '알 수 없음';
  const likerNames = likes.map(uid => members?.find(m => m.id === uid)?.name || '?');

  const handleStart = () => {
    if (endDate < startDate) { alert('종료일이 시작일보다 빠를 수 없어요'); return; }
    onStartHamtteu({
      title: wish.patternName,
      pattern: wish.patternName,
      startDate,
      endDate,
      color: 'pink',
      coverColor: '#F2889B',
      yarn: wish.recommendedYarn || '',
      needle: '',
      difficulty: '초급',
      participants: likerNames.filter(n => n !== '?'),
      description: wish.description || '',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-indie-pink/20 to-soft-coral/10 p-6 rounded-t-3xl">
          <div className="flex items-start justify-between">
            <h3 className="text-xl font-bold text-gray-800 font-gowun flex-1">{wish.patternName}</h3>
            <button onClick={onClose} className="p-1.5 hover:bg-white/50 rounded-full ml-2">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">{author} 님이 등록</p>
        </div>

        <div className="p-6 space-y-4">
          {/* Description */}
          {wish.description && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">설명</p>
              <p className="text-sm text-gray-600 leading-relaxed">{wish.description}</p>
            </div>
          )}

          {/* Recommended Yarn */}
          {wish.recommendedYarn && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">추천실</p>
              <p className="text-sm text-gray-600">{wish.recommendedYarn}</p>
            </div>
          )}

          {/* Likes Section */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => onToggleLike(wish.id, currentUserId)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                  isLiked
                    ? 'bg-indie-pink/10 text-indie-pink border-indie-pink/30'
                    : 'bg-white text-gray-400 border-gray-200 hover:border-indie-pink/30 hover:text-indie-pink'
                }`}
              >
                <span>{isLiked ? '♥' : '♡'}</span>
                <span>{likes.length}</span>
              </motion.button>
              <span className="text-xs text-gray-400">
                {likes.length >= 2 ? '함뜨 시작 가능!' : '2명 이상이면 함뜨를 시작할 수 있어요'}
              </span>
            </div>
            {likerNames.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {likerNames.map((name, i) => (
                  <span key={i} className="px-2.5 py-1 bg-indie-pink/10 text-indie-pink rounded-full text-xs font-medium">
                    {name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Start Hamtteu */}
          {likes.length >= 2 && (
            <div>
              {!showStartForm ? (
                <button
                  onClick={() => setShowStartForm(true)}
                  className="w-full bg-gradient-to-r from-indie-pink to-soft-coral text-white py-3 rounded-xl font-semibold shadow-lg shadow-indie-pink/30 hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  함뜨 시작하기
                </button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  className="bg-warm-cream/50 rounded-2xl p-4 border border-indie-pink/20 space-y-3"
                >
                  <p className="text-sm font-semibold text-gray-700">날짜를 선택해주세요</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">시작일</label>
                      <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indie-pink text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">종료일</label>
                      <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indie-pink text-sm" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setShowStartForm(false)} className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">취소</button>
                    <button onClick={handleStart} className="flex-1 bg-gradient-to-r from-indie-pink to-soft-coral text-white py-2 rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all">캘린더에 등록</button>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* Delete */}
          {wish.authorId === currentUserId && (
            <button
              onClick={() => { if (confirm('이 위시를 삭제할까요?')) { onDelete(wish.id); onClose(); } }}
              className="w-full py-2 text-sm text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            >
              삭제
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ── Main WishlistSidebar ──
export default function WishlistSidebar({ wishlist, members, currentUserId, onAddWish, onDeleteWish, onToggleLike, onAddHamtteu }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [detailId, setDetailId] = useState(null);

  const sorted = [...(wishlist || [])].sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
  const detailWish = detailId ? sorted.find(w => w.id === detailId) : null;

  const handleAdd = async (form) => {
    await onAddWish({ ...form, likes: [], authorId: currentUserId });
    setShowAddModal(false);
  };

  const handleStartHamtteu = async (hamtteuData) => {
    await onAddHamtteu({ ...hamtteuData, authorId: currentUserId });
  };

  return (
    <>
      {/* Add button */}
      <button
        onClick={() => setShowAddModal(true)}
        className="w-full py-2.5 mb-3 border-2 border-dashed border-indie-pink/40 text-indie-pink rounded-2xl text-sm font-semibold hover:bg-indie-pink/5 hover:border-indie-pink/60 transition-all"
      >
        + 하고 싶은 함뜨 추가
      </button>

      {/* Card list */}
      {sorted.length === 0 ? (
        <div className="py-12 text-center">
          <div className="text-3xl mb-3">💭</div>
          <p className="text-sm text-gray-400">아직 위시가 없어요</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map(wish => {
            const likes = wish.likes || [];
            const isLiked = likes.includes(currentUserId);
            const author = members?.find(m => m.id === wish.authorId)?.name;
            const likerNames = likes.map(uid => members?.find(m => m.id === uid)?.name).filter(Boolean);
            return (
              <div key={wish.id} className="group relative">
                <button
                  onClick={() => setDetailId(wish.id)}
                  className="w-full text-left p-3 rounded-2xl border border-gray-100 hover:border-indie-pink/40 hover:bg-warm-cream/60 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-1.5 self-stretch rounded-full flex-shrink-0 mt-0.5 bg-indie-pink/60"></span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="font-bold text-gray-800 truncate text-sm">{wish.patternName}</p>
                        <motion.button
                          whileTap={{ scale: 0.85 }}
                          onClick={(e) => { e.stopPropagation(); onToggleLike(wish.id, currentUserId); }}
                          className={`flex items-center gap-1 text-xs flex-shrink-0 ${isLiked ? 'text-indie-pink' : 'text-gray-300 hover:text-indie-pink'}`}
                        >
                          <span>{isLiked ? '♥' : '♡'}</span>
                          <span className="font-semibold">{likes.length}</span>
                        </motion.button>
                      </div>
                      {wish.recommendedYarn && (
                        <p className="text-[11px] text-gray-500 truncate">{wish.recommendedYarn}</p>
                      )}
                      {author && (
                        <p className="text-[11px] text-gray-400 mt-0.5">{author}</p>
                      )}
                      {likerNames.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {likerNames.map((name, i) => (
                            <span key={i} className="px-2 py-0.5 bg-indie-pink/10 text-gray-800 rounded-full text-[10px] font-medium">{name}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals — portal to body to escape aside overflow/backdrop-blur */}
      {createPortal(
        <>
          <AnimatePresence>
            {showAddModal && <WishAddModal onSave={handleAdd} onClose={() => setShowAddModal(false)} />}
          </AnimatePresence>
          <AnimatePresence>
            {detailWish && (
              <WishDetailModal
                wish={detailWish}
                members={members}
                currentUserId={currentUserId}
                onToggleLike={onToggleLike}
                onDelete={onDeleteWish}
                onStartHamtteu={handleStartHamtteu}
                onClose={() => setDetailId(null)}
              />
            )}
          </AnimatePresence>
        </>,
        document.body
      )}
    </>
  );
}
