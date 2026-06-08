import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef, useMemo } from 'react';
import TipFormModal from './TipFormModal';
import { isAdmin, canModifyResource } from '../utils/adminUtils';

// 카테고리 정의 (커스텀 색상)
const TIP_CATEGORIES = [
  { id: 'yarn',      label: '실',   emoji: '🧶', bg: '#FFE4E1', dot: '#FFB6C1', text: '#9B3D5A' },
  { id: 'needle',    label: '바늘', emoji: '🪡', bg: '#E6E8F2', dot: '#9BA8C4', text: '#445278' },
  { id: 'technique', label: '기법', emoji: '✨', bg: '#EDE4F2', dot: '#B79BD0', text: '#5E4178' },
  { id: 'pattern',   label: '패턴', emoji: '📐', bg: '#E2EFE0', dot: '#92BE86', text: '#3F6B36' },
  { id: 'care',      label: '관리', emoji: '🧴', bg: '#FCEFD6', dot: '#E0B86B', text: '#7A5A2C' },
  { id: 'etc',       label: '기타', emoji: '💡', bg: '#ECECEC', dot: '#AEAEAE', text: '#555555' },
];

const catById = Object.fromEntries(TIP_CATEGORIES.map(c => [c.id, c]));

const TIP_PAGE_SIZE = 10;

// 유틸
const fmtDate = (iso) => {
  if (!iso) return '';
  const parts = iso.split('T')[0].split('-');
  return `${Number(parts[1])}월 ${Number(parts[2])}일`;
};

const preview = (text, n = 70) => {
  const flat = text.replace(/\n+/g, ' ').trim();
  return flat.length > n ? flat.slice(0, n) + '…' : flat;
};

const TipBoard = ({ tips, onAddTip, onUpdateTip, onDeleteTip, currentUserId, members }) => {
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');
  const [openId, setOpenId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [visible, setVisible] = useState(TIP_PAGE_SIZE);

  const currentUser = members?.find(m => m.id === currentUserId);
  const currentUserName = currentUser?.name || '익명';
  const userIsAdmin = isAdmin(members, currentUserId);

  // 카테고리별 카운트
  const counts = useMemo(() => {
    const c = { all: tips.length };
    TIP_CATEGORIES.forEach(cat => c[cat.id] = tips.filter(t => t.category === cat.id).length);
    return c;
  }, [tips]);

  // 필터링 + 검색 + 정렬
  const list = useMemo(() => {
    return tips
      .filter(t => filter === 'all' || t.category === filter)
      .filter(t => !q || (t.title + t.content).toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => {
        if (a.pinned !== b.pinned) return b.pinned ? 1 : -1;
        return (a.createdAt < b.createdAt) ? 1 : -1;
      });
  }, [tips, filter, q]);

  // 필터/검색 변경 시 페이지 리셋
  useEffect(() => { setVisible(TIP_PAGE_SIZE); }, [filter, q]);

  const shown = list.slice(0, visible);
  const hasMore = list.length > visible;

  // 모바일 무한 스크롤
  const sentinelRef = useRef(null);
  useEffect(() => {
    if (!hasMore) return;
    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    if (!isMobile) return;
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) setVisible(v => v + TIP_PAGE_SIZE);
    }, { rootMargin: '200px' });
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, shown.length]);

  // 검색어 하이라이트
  const highlight = (text) => {
    if (!q) return text;
    const i = text.toLowerCase().indexOf(q.toLowerCase());
    if (i < 0) return text;
    return (
      <>
        {text.slice(0, i)}
        <mark className="bg-indie-pink/30 rounded px-0.5">{text.slice(i, i + q.length)}</mark>
        {text.slice(i + q.length)}
      </>
    );
  };

  // 핸들러
  const handleSave = async (data) => {
    if (editing) {
      await onUpdateTip(editing.id, data);
    } else {
      await onAddTip(data, currentUserId, currentUserName);
    }
    setShowForm(false);
    setEditing(null);
  };

  const handleTogglePin = async (e, tip) => {
    e.stopPropagation();
    await onUpdateTip(tip.id, { pinned: !tip.pinned });
  };

  const handleEdit = (e, tip) => {
    e.stopPropagation();
    setEditing(tip);
    setShowForm(true);
  };

  const handleDelete = async (e, tip) => {
    e.stopPropagation();
    if (confirm('삭제할까요?')) {
      await onDeleteTip(tip.id);
      if (openId === tip.id) setOpenId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 pt-8 pb-16">
      {/* 헤더 */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 font-gowun">인포메이션 💡</h1>
          <p className="text-sm text-gray-500 mt-1.5">알아두면 쓸모있는 뜨개 정보들</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="inline-flex items-center gap-1.5 bg-gradient-to-r from-indie-pink to-soft-coral text-white px-4 py-2.5 rounded-2xl font-semibold shadow-lg shadow-indie-pink/30 hover:shadow-xl transition-all text-sm flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">정보 등록</span>
          <span className="sm:hidden">등록</span>
        </motion.button>
      </div>

      {/* 검색창 */}
      <div className="relative mb-4">
        <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
        </svg>
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="핑프금지"
          className="w-full pl-12 pr-10 py-3.5 rounded-2xl border border-white bg-white/80 backdrop-blur card-shadow focus:outline-none focus:border-indie-pink/50 text-sm"
        />
        {q && (
          <button
            onClick={() => setQ('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* 카테고리 필터 */}
      <div className="flex items-center gap-1.5 flex-wrap mb-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
            filter === 'all'
              ? 'bg-indie-pink text-white border-indie-pink shadow-sm shadow-indie-pink/30'
              : 'bg-white/80 text-gray-600 border-gray-200 hover:border-indie-pink/50'
          }`}
        >
          전체 <span className="opacity-60">{counts.all}</span>
        </button>
        {TIP_CATEGORIES.map(c => (
          <button
            key={c.id}
            onClick={() => setFilter(filter === c.id ? 'all' : c.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all inline-flex items-center gap-1 ${
              filter === c.id
                ? 'text-white border-transparent shadow-sm'
                : 'bg-white/80 text-gray-600 border-gray-200 hover:border-indie-pink/50'
            }`}
            style={filter === c.id ? { background: c.dot } : {}}
          >
            <span>{c.emoji}</span>{c.label} <span className="opacity-60">{counts[c.id] || 0}</span>
          </button>
        ))}
      </div>

      {/* 검색 결과 카운트 */}
      {q && <p className="text-xs text-gray-400 mb-2 px-1">"{q}" 검색 결과 {list.length}개</p>}

      {/* 리스트 */}
      <div className="bg-white/70 backdrop-blur rounded-2xl border border-white overflow-hidden divide-y divide-gray-100">
        {list.length === 0 && (
          <div className="py-16 text-center text-gray-300">
            <div className="text-3xl mb-2">{q ? '🔍' : '💡'}</div>
            <p className="text-sm">{q ? '검색 결과가 없어요' : '아직 등록된 정보가 없어요'}</p>
          </div>
        )}
        {shown.map(tip => {
          const open = openId === tip.id;
          const cat = catById[tip.category];
          const canModify = canModifyResource(members, currentUserId, tip.authorId);

          return (
            <div key={tip.id} className={open ? 'bg-white' : 'hover:bg-white/80 transition-colors'}>
              {/* 접힌 행 */}
              <button
                onClick={() => setOpenId(open ? null : tip.id)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left"
              >
                {/* 카테고리 색 점 */}
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: cat?.dot || '#AEAEAE' }}
                />
                {/* 제목 */}
                <span className="font-semibold text-gray-800 text-sm flex-shrink-0">
                  {highlight(tip.title)}
                </span>
                {/* 고정 아이콘 */}
                {tip.pinned && <span className="text-[11px] flex-shrink-0" title="고정">📌</span>}
                {/* 미리보기 (접힌 상태만) */}
                {!open && (
                  <span className="text-xs text-gray-400 truncate flex-1 min-w-0">
                    {preview(tip.content)}
                  </span>
                )}
                {/* 펼침 화살표 */}
                <svg
                  className={`w-4 h-4 text-gray-400 ml-auto flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* 펼친 내용 */}
              <AnimatePresence>
                {open && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pl-9">
                      {/* 본문 */}
                      <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-warm-cream/50 rounded-xl p-3.5 mb-2.5">
                        {tip.content}
                      </div>
                      {/* 메타 + 액션 */}
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span className="inline-flex items-center gap-1.5">
                          <span
                            className="inline-flex items-center justify-center rounded-full bg-gradient-to-br from-indie-pink to-soft-coral text-white font-bold flex-shrink-0"
                            style={{ width: 18, height: 18, fontSize: 8 }}
                          >
                            {tip.authorName?.[0] || '?'}
                          </span>
                          <span className="font-semibold text-gray-500">{tip.authorName}</span>
                          <span>·</span>
                          <span>{fmtDate(tip.createdAt)}</span>
                          {tip.updatedAt && <span className="text-gray-300">(수정됨)</span>}
                        </span>
                        <div className="flex items-center gap-3">
                          {userIsAdmin && (
                            <button
                              onClick={(e) => handleTogglePin(e, tip)}
                              className="hover:text-amber-600 transition-colors"
                            >
                              {tip.pinned ? '고정 해제' : '📌 고정'}
                            </button>
                          )}
                          {canModify && (
                            <>
                              <button
                                onClick={(e) => handleEdit(e, tip)}
                                className="hover:text-gray-700 transition-colors"
                              >
                                수정
                              </button>
                              <button
                                onClick={(e) => handleDelete(e, tip)}
                                className="hover:text-red-500 transition-colors"
                              >
                                삭제
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* 더보기 + 모바일 무한스크롤 sentinel */}
      {hasMore && (
        <div ref={sentinelRef} className="mt-4 flex justify-center">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setVisible(v => v + TIP_PAGE_SIZE)}
            className="inline-flex items-center gap-1.5 bg-white/80 backdrop-blur border border-white card-shadow text-gray-600 hover:text-indie-pink px-5 py-2.5 rounded-full text-sm font-semibold transition-colors"
          >
            더보기 <span className="text-gray-400">({list.length - visible})</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </motion.button>
        </div>
      )}

      {/* 등록/수정 모달 */}
      <TipFormModal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditing(null); }}
        onSave={handleSave}
        initialData={editing}
      />
    </div>
  );
};

export { TIP_CATEGORIES, catById };
export default TipBoard;
