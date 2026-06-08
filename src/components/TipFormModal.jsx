import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { TIP_CATEGORIES } from './TipBoard';

const TipFormModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('yarn');

  const isEdit = !!initialData;

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setContent(initialData.content || '');
      setCategory(initialData.category || 'yarn');
    } else {
      setTitle('');
      setContent('');
      setCategory('yarn');
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (!content.trim()) return;
    onSave({
      title: title.trim(),
      content: content.trim(),
      category,
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold text-gray-800 font-gowun">
                {isEdit ? '정보 수정' : '정보 등록'}
              </h3>
              <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 제목 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  제목 <span className="text-indie-pink">*</span>
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="예: 바늘 호수 ↔ mm 변환표"
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indie-pink transition-colors"
                  autoFocus
                />
              </div>

              {/* 카테고리 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">카테고리</label>
                <div className="flex flex-wrap gap-2">
                  {TIP_CATEGORIES.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCategory(c.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all inline-flex items-center gap-1 ${
                        category === c.id
                          ? 'border-transparent text-white'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                      style={category === c.id ? { background: c.dot } : {}}
                    >
                      <span>{c.emoji}</span>{c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 내용 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  내용 <span className="text-indie-pink">*</span>
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={7}
                  placeholder="알아두면 좋은 정보를 적어주세요. 줄바꿈으로 목록처럼 정리해도 좋아요."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indie-pink transition-colors resize-none text-sm leading-relaxed"
                />
              </div>

              {/* 버튼 */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={!title.trim() || !content.trim()}
                  className={`flex-1 py-2.5 rounded-xl font-semibold transition-all ${
                    title.trim() && content.trim()
                      ? 'bg-gradient-to-r from-indie-pink to-soft-coral text-white shadow-lg shadow-indie-pink/30 hover:shadow-xl'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isEdit ? '저장' : '등록'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TipFormModal;
