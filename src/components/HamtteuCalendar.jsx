import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import * as U from '../utils/calendarUtils';
import WishlistSidebar from './WishlistSidebar';

const TODAY = new Date();

// ── Color tokens ──
const COLOR_TOKENS = {
  pink:     { bar: '#F2889B', barSoft: '#FDE4E9', text: '#9B3D5A', dot: '#F2889B' },
  yellow:   { bar: '#E0C75A', barSoft: '#F8F2D0', text: '#7A6B1A', dot: '#E0C75A' },
  green:    { bar: '#6BC4A0', barSoft: '#D8F0E6', text: '#2E7A56', dot: '#6BC4A0' },
  blue:     { bar: '#6AA3D8', barSoft: '#D6E8F8', text: '#2E5F8C', dot: '#6AA3D8' },
  purple:   { bar: '#A07ED4', barSoft: '#E4DAF5', text: '#5A3D8C', dot: '#A07ED4' },
  coral:    { bar: '#E89478', barSoft: '#FDE4DA', text: '#8C4A30', dot: '#E89478' },
  teal:     { bar: '#5CBCB8', barSoft: '#D4F0EE', text: '#2A7A76', dot: '#5CBCB8' },
};
const DEFAULT_COLOR = COLOR_TOKENS.pink;
const getColorToken = (color) => COLOR_TOKENS[color] || DEFAULT_COLOR;
const STATUS_LABEL = { ongoing: '진행 중', upcoming: '예정', completed: '완료' };

// ── Shared UI ──
function StatusPill({ status }) {
  const styles = { ongoing: 'bg-indie-pink/15 text-[#9B3D5A] border-indie-pink/30', upcoming: 'bg-light-beige text-[#7A5C3A] border-[#D4B896]/40', completed: 'bg-gray-100 text-gray-500 border-gray-200' };
  const dot = { ongoing: 'bg-indie-pink', upcoming: 'bg-[#D4B896]', completed: 'bg-gray-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${styles[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot[status]}`}></span>
      {STATUS_LABEL[status]}
    </span>
  );
}

function FilterChip({ active, onClick, children }) {
  return (
    <button onClick={onClick} className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${active ? 'bg-indie-pink text-white border-indie-pink shadow-sm shadow-indie-pink/30' : 'bg-white/80 text-gray-600 border-gray-200 hover:border-indie-pink/50 hover:text-indie-pink'}`}>
      {children}
    </button>
  );
}

function IconBtn({ onClick, title, children }) {
  return (
    <button onClick={onClick} title={title} className="w-9 h-9 inline-flex items-center justify-center rounded-full bg-white/80 hover:bg-white text-gray-600 hover:text-indie-pink border border-gray-200 transition-colors">
      {children}
    </button>
  );
}

function StatTile({ label, value, accent }) {
  const colors = { pink: { bg: 'from-indie-pink/15 to-soft-coral/10', text: '#9B3D5A', dot: '#F2889B' }, beige: { bg: 'from-light-beige to-warm-cream', text: '#7A6530', dot: '#D4B06A' }, rose: { bg: 'from-dusty-rose/30 to-soft-coral/10', text: '#5E4372', dot: '#B08FC7' } }[accent];
  return (
    <div className={`bg-gradient-to-br ${colors.bg} px-4 py-2.5 rounded-2xl border border-white/60 backdrop-blur min-w-[88px]`}>
      <div className="flex items-center gap-1.5 mb-0.5">
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: colors.dot }}></span>
        <span className="text-[10px] font-bold tracking-wider text-gray-500">{label}</span>
      </div>
      <p className="text-xl font-bold font-gowun" style={{ color: colors.text }}>{value}</p>
    </div>
  );
}

// ── Modals ──
function RegisterModal({ initial, onSave, onClose, onDelete, members }) {
  const [form, setForm] = useState(initial || {
    title: '', pattern: '', startDate: U.fmtDate(TODAY), endDate: U.fmtDate(TODAY),
    color: 'pink', yarn: '', needle: '', difficulty: '초급', participants: [], description: '',
  });
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const toggleParticipant = (name) => {
    setForm(f => ({
      ...f,
      participants: f.participants.includes(name)
        ? f.participants.filter(p => p !== name)
        : [...f.participants, name]
    }));
  };

  const submit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) { alert('작품명을 입력해주세요'); return; }
    if (form.endDate < form.startDate) { alert('종료일이 시작일보다 빠를 수 없어요'); return; }
    onSave({ ...form, coverColor: getColorToken(form.color).bar });
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="bg-white rounded-3xl p-6 md:p-7 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-2xl font-bold text-gray-800 font-gowun">{initial ? '함뜨 수정' : '새 함뜨 등록'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">작품명 <span className="text-indie-pink">*</span></label>
            <input value={form.title} onChange={set('title')} placeholder="예: 봄빛 가디건" className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indie-pink transition-colors" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">패턴 <span className="text-gray-400 font-normal">(선택)</span></label>
            <input value={form.pattern} onChange={set('pattern')} placeholder="예: PetiteKnit · No Frills Cardigan" className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indie-pink transition-colors" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">시작일 <span className="text-indie-pink">*</span></label>
              <input type="date" value={form.startDate} onChange={set('startDate')} className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indie-pink" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">종료일 <span className="text-indie-pink">*</span></label>
              <input type="date" value={form.endDate} onChange={set('endDate')} className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indie-pink" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">대표 색상</label>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(COLOR_TOKENS).map(([key, tok]) => (
                <button key={key} type="button" onClick={() => setForm(f => ({ ...f, color: key }))}
                  className={`w-9 h-9 rounded-full border-2 transition-all ${form.color === key ? 'border-gray-800 scale-110' : 'border-white shadow'}`}
                  style={{ background: tok.bar }} title={key}></button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">참여 멤버</label>
            <div className="flex flex-wrap gap-1.5">
              {members.map(m => (
                <button key={m.id} type="button" onClick={() => toggleParticipant(m.name)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${form.participants.includes(m.name) ? 'bg-indie-pink text-white border-indie-pink' : 'bg-white text-gray-600 border-gray-200 hover:border-indie-pink/50'}`}>
                  {m.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">설명 <span className="text-gray-400 font-normal">(선택)</span></label>
            <textarea value={form.description} onChange={set('description')} rows="2" placeholder="함뜨 진행 방식, 미팅 일정 등" className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indie-pink resize-none" />
          </div>
          <div className="flex gap-2 pt-2">
            {initial && onDelete && (
              <button type="button" onClick={() => { if (confirm('이 함뜨를 삭제할까요?')) { onDelete(initial.id); onClose(); } }}
                className="px-4 py-2.5 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition-colors text-sm">삭제</button>
            )}
            <button type="button" onClick={onClose} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl font-semibold hover:bg-gray-200 transition-colors">취소</button>
            <button type="submit" className="flex-1 bg-gradient-to-r from-indie-pink to-soft-coral text-white py-2.5 rounded-xl font-semibold shadow-lg shadow-indie-pink/30 hover:shadow-xl transition-all">
              {initial ? '저장' : '등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DetailModal({ hamtteu, onClose, onEdit, onDelete }) {
  if (!hamtteu) return null;
  const tok = getColorToken(hamtteu.color);
  const status = U.getStatus(hamtteu, TODAY);
  const start = U.parseDate(hamtteu.startDate), end = U.parseDate(hamtteu.endDate);
  const total = U.daysBetween(start, end) + 1;
  const elapsed = Math.max(0, Math.min(total, U.daysBetween(start, TODAY) + 1));
  const pct = Math.round((elapsed / total) * 100);
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="h-24 relative" style={{ background: `linear-gradient(135deg, ${tok.bar}, ${tok.barSoft})` }}>
          <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 inline-flex items-center justify-center bg-white/80 hover:bg-white rounded-full">
            <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-6">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="text-2xl font-bold text-gray-800 font-gowun leading-tight">{hamtteu.title}</h3>
            <StatusPill status={status} />
          </div>
          {hamtteu.pattern && <p className="text-sm text-gray-500 mb-4">{hamtteu.pattern}</p>}
          <div className="bg-warm-cream/60 rounded-2xl p-4 mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">{U.fmtKor(start)}</span>
              <span className="text-gray-400">→</span>
              <span className="text-gray-600">{U.fmtKor(end)}</span>
            </div>
            <div className="bg-white/70 h-2 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: pct + '%', background: tok.bar }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              {status === 'completed' ? `${total}일 동안 진행됨` : status === 'upcoming' ? `${U.daysBetween(TODAY, start)}일 후 시작` : `${total}일 중 ${elapsed}일째 (${pct}%)`}
            </p>
          </div>
          {hamtteu.description && <p className="text-sm text-gray-700 leading-relaxed mb-4 bg-white/50 p-3 rounded-xl border border-gray-100">{hamtteu.description}</p>}
          <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
            {hamtteu.difficulty && <div><p className="text-xs text-gray-500 mb-0.5">난이도</p><p className="text-gray-800 font-medium">{hamtteu.difficulty}</p></div>}
            <div><p className="text-xs text-gray-500 mb-0.5">참여</p><p className="text-gray-800 font-medium">{hamtteu.participants?.length || 0}명</p></div>
          </div>
          <div className="mb-5">
            <p className="text-xs text-gray-500 mb-2">함뜨 친구들</p>
            <div className="flex flex-wrap gap-1.5">
              {(hamtteu.participants || []).map(p => (
                <span key={p} className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs text-gray-700 font-medium">{p}</span>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => onEdit(hamtteu.id)} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl font-semibold hover:bg-gray-200 transition-colors">수정하기</button>
            <button onClick={() => { if (confirm('이 함뜨를 삭제할까요?')) { onDelete(hamtteu.id); onClose(); } }}
              className="px-4 py-2.5 bg-red-50 text-red-500 rounded-xl font-semibold hover:bg-red-100 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DayListModal({ date, items, onClose, onPick }) {
  if (!date) return null;
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-gray-500">이 날 진행 중</p>
            <h3 className="text-xl font-bold text-gray-800 font-gowun">{U.fmtKor(date)}</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        {items.length === 0 ? (
          <div className="py-10 text-center text-gray-400 text-sm">진행 중인 함뜨가 없어요</div>
        ) : (
          <div className="space-y-2">
            {items.map(h => {
              const tok = getColorToken(h.color);
              return (
                <button key={h.id} onClick={() => onPick(h.id)} className="w-full text-left p-3 rounded-2xl border-2 border-gray-100 hover:border-indie-pink/50 hover:bg-warm-cream/50 transition-all flex items-center gap-3">
                  <span className="w-1.5 h-10 rounded-full flex-shrink-0" style={{ background: tok.bar }}></span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{h.title}</p>
                    <p className="text-xs text-gray-500 truncate">{h.startDate.slice(5)} → {h.endDate.slice(5)} · {h.participants?.length || 0}명</p>
                  </div>
                  <StatusPill status={U.getStatus(h, TODAY)} />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Calendar ──
const HamtteuCalendar = ({ hamtteus, onAdd, onUpdate, onDelete, currentUserId, members, wishlist, onAddWish, onUpdateWish, onDeleteWish, onToggleLike }) => {
  const list = hamtteus || [];
  console.log('[HamtteuCalendar] list:', list.length, list);
  const [cursor, setCursor] = useState(new Date(TODAY.getFullYear(), TODAY.getMonth(), 1));
  const [statusFilter, setStatusFilter] = useState('all');
  const [onlyMine, setOnlyMine] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [detailId, setDetailId] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [sidebarTab, setSidebarTab] = useState('monthly');

  const me = members?.find(m => m.id === currentUserId)?.name || '';

  const filtered = useMemo(() => {
    return list.filter(h => {
      if (onlyMine && !(h.participants || []).includes(me)) return false;
      if (statusFilter !== 'all' && U.getStatus(h, TODAY) !== statusFilter) return false;
      return true;
    });
  }, [list, onlyMine, statusFilter, me]);

  const goPrev = () => setCursor(c => new Date(c.getFullYear(), c.getMonth() - 1, 1));
  const goNext = () => setCursor(c => new Date(c.getFullYear(), c.getMonth() + 1, 1));
  const goToday = () => setCursor(new Date(TODAY.getFullYear(), TODAY.getMonth(), 1));

  const handleSave = async (formData) => {
    if (formData.id && list.find(h => h.id === formData.id)) {
      const { id, ...updates } = formData;
      await onUpdate(id, updates);
    } else {
      const { id, ...data } = formData;
      await onAdd({ ...data, authorId: currentUserId });
    }
    setShowRegister(false);
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    await onDelete(id);
    setShowRegister(false);
    setEditingId(null);
  };

  const grid = useMemo(() => U.buildMonthGrid(cursor.getFullYear(), cursor.getMonth()), [cursor]);
  const dayLabels = U.DAYS_KO;
  const headerLabel = `${cursor.getFullYear()}년 ${U.MONTHS_KO[cursor.getMonth()]}`;

  // Lane layout for bars
  const weekLanes = useMemo(() => {
    const lanes = Array.from({ length: 6 }, () => []);
    const sorted = [...filtered].sort((a, b) => {
      const sa = U.parseDate(a.startDate), sb = U.parseDate(b.startDate);
      if (+sa !== +sb) return sa - sb;
      return U.daysBetween(sb, U.parseDate(b.endDate)) - U.daysBetween(sa, U.parseDate(a.endDate));
    });
    for (let w = 0; w < 6; w++) {
      const taken = [];
      for (const h of sorted) {
        const segs = U.sliceIntoWeeks(h, grid);
        const seg = segs.find(g => g.weekIndex === w);
        if (!seg) continue;
        let lane = 0;
        while (true) {
          const conflicts = (taken[lane] || []).some(t => !(seg.endCol < t.startCol || seg.startCol > t.endCol));
          if (!conflicts) break;
          lane++;
        }
        if (!taken[lane]) taken[lane] = [];
        taken[lane].push({ startCol: seg.startCol, endCol: seg.endCol });
        lanes[w].push({ hamtteu: h, seg, lane });
      }
    }
    return lanes;
  }, [filtered, grid]);

  const maxLanes = 4;

  const monthList = useMemo(() => {
    const ms = grid[0].date, me = grid[41].date;
    return filtered.filter(h => {
      const a = U.parseDate(h.startDate), b = U.parseDate(h.endDate);
      return !(b < ms || a > me);
    }).sort((a, b) => U.parseDate(a.startDate) - U.parseDate(b.startDate));
  }, [filtered, grid]);

  const detailItem = detailId ? list.find(h => h.id === detailId) : null;
  const editingItem = editingId ? list.find(h => h.id === editingId) : null;
  const dayItems = selectedDate ? U.getOnDate(filtered, selectedDate) : [];

  const stats = useMemo(() => ({
    ongoing: list.filter(h => U.getStatus(h, TODAY) === 'ongoing').length,
    upcoming: list.filter(h => U.getStatus(h, TODAY) === 'upcoming').length,
    mine: list.filter(h => (h.participants || []).includes(me)).length,
  }), [list, me]);

  const cellSize = 'min-h-[64px] md:min-h-[76px]';
  const todayCellClass = 'bg-indie-pink/15';

  return (
    <div className="pb-8">
      {/* Header stats */}
      <div className="max-w-7xl mx-auto px-4 md:px-12 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 font-gowun">함뜨 달력</h2>
            <p className="text-sm text-gray-600 mt-1"> 🧶</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <StatTile label="진행 중" value={stats.ongoing} accent="pink" />
            <StatTile label="예정" value={stats.upcoming} accent="beige" />
            <StatTile label="내 함뜨" value={stats.mine} accent="rose" />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-7xl mx-auto px-4 md:px-12 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-white/80 backdrop-blur rounded-2xl border border-white p-1 card-shadow">
            <IconBtn onClick={goPrev} title="이전 달">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
            </IconBtn>
            <h2 className="text-base md:text-lg font-bold text-gray-800 font-gowun min-w-[130px] md:min-w-[150px] text-center">{headerLabel}</h2>
            <IconBtn onClick={goNext} title="다음 달">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
            </IconBtn>
            <button onClick={goToday} className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-indie-pink transition-colors">오늘</button>
          </div>
          <FilterChip active={statusFilter === 'all'} onClick={() => setStatusFilter('all')}>전체</FilterChip>
          <FilterChip active={statusFilter === 'ongoing'} onClick={() => setStatusFilter('ongoing')}>진행 중</FilterChip>
          <FilterChip active={statusFilter === 'upcoming'} onClick={() => setStatusFilter('upcoming')}>예정</FilterChip>
          <FilterChip active={statusFilter === 'completed'} onClick={() => setStatusFilter('completed')}>완료</FilterChip>
          <label className="ml-1 inline-flex items-center gap-2 text-xs font-semibold text-gray-600 cursor-pointer select-none px-2 py-1.5 bg-white/60 rounded-full border border-white">
            <input type="checkbox" checked={onlyMine} onChange={(e) => setOnlyMine(e.target.checked)} className="w-3.5 h-3.5 accent-[#FFB6C1] rounded" />
            내 함뜨만
          </label>
          <button onClick={() => { setEditingId(null); setShowRegister(true); }}
            className="ml-auto inline-flex items-center gap-2 bg-gradient-to-r from-indie-pink to-soft-coral text-white px-4 md:px-5 py-2.5 rounded-2xl font-semibold shadow-lg shadow-indie-pink/30 hover:shadow-xl transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
            <span className="hidden sm:inline">함뜨 등록</span>
            <span className="sm:hidden">등록</span>
          </button>
        </div>
      </div>

      {/* Calendar + sidebar */}
      <div className="max-w-7xl mx-auto px-4 md:px-12 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">
        {/* Calendar grid */}
        <div className="bg-white/80 backdrop-blur rounded-3xl p-3 md:p-5 border border-white card-shadow">
          <div className="grid grid-cols-7 text-xs font-semibold text-gray-500 mb-2">
            {dayLabels.map((d, idx) => (
              <div key={d} className={`px-2 py-2 text-center ${idx === 0 ? 'text-[#C44569]' : idx === 6 ? 'text-[#5E7CB5]' : ''}`}>{d}</div>
            ))}
          </div>
          <div className="grid grid-rows-6 gap-1 md:gap-1.5">
            {Array.from({ length: 6 }).map((_, w) => {
              const lanes = weekLanes[w];
              const visible = lanes.filter(x => x.lane < maxLanes);
              const hidden = lanes.filter(x => x.lane >= maxLanes);
              const hiddenByDate = {};
              hidden.forEach(({ seg }) => { for (let c = seg.startCol; c <= seg.endCol; c++) hiddenByDate[c] = (hiddenByDate[c] || 0) + 1; });
              return (
                <div key={w} className="relative">
                  <div className="grid grid-cols-7 gap-1 md:gap-1.5">
                    {grid.slice(w * 7, w * 7 + 7).map((cell, i) => {
                      const isToday = U.sameDay(cell.date, TODAY);
                      const isSelected = selectedDate && U.sameDay(cell.date, selectedDate);
                      const dow = cell.date.getDay();
                      return (
                        <button key={i} onClick={() => setSelectedDate(cell.date)}
                          className={`relative rounded-xl flex flex-col items-center pt-2 ${cellSize} transition-all ${cell.inMonth ? 'hover:bg-warm-cream' : 'opacity-40'} ${isToday ? todayCellClass : ''} ${isSelected && !isToday ? 'bg-warm-cream ring-2 ring-indie-pink/60' : ''}`}>
                          <span className={`inline-flex items-center justify-center text-sm font-semibold ${!cell.inMonth ? 'text-gray-300' : isToday ? 'text-indie-pink' : dow === 0 ? 'text-[#C44569]' : dow === 6 ? 'text-[#5E7CB5]' : 'text-gray-700'}`}>{cell.date.getDate()}</span>
                          {hiddenByDate[i] && <div className="absolute bottom-0.5 left-1 right-1 text-[9px] text-gray-400 font-semibold pointer-events-none">+{hiddenByDate[i]}</div>}
                        </button>
                      );
                    })}
                  </div>
                  <div className="absolute inset-0 pointer-events-none">
                    {visible.map(({ hamtteu: h, seg, lane }) => {
                      const tok = getColorToken(h.color);
                      const gap = 6;
                      const colW = `calc((100% - ${6 * gap}px) / 7)`;
                      const left = `calc(${seg.startCol} * (${colW} + ${gap}px))`;
                      const width = `calc(${seg.endCol - seg.startCol + 1} * ${colW} + ${(seg.endCol - seg.startCol) * gap}px)`;
                      const top = `${28 + lane * 8}px`;
                      return (
                        <button key={h.id + '-' + w} onClick={(e) => { e.stopPropagation(); setDetailId(h.id); }}
                          className="absolute pointer-events-auto hover:brightness-105 transition-all" title={h.title}
                          style={{ left, width, top, height: 5, background: tok.bar, borderTopLeftRadius: seg.startsHere ? 2 : 1, borderBottomLeftRadius: seg.startsHere ? 2 : 1, borderTopRightRadius: seg.endsHere ? 2 : 1, borderBottomRightRadius: seg.endsHere ? 2 : 1 }}>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          {/* Legend */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="text-[10px] font-bold tracking-widest text-gray-400">함뜨</span>
            {monthList.slice(0, 6).map(h => (
              <div key={h.id} className="inline-flex items-center gap-1.5 text-xs text-gray-600">
                <span className="w-2 h-2 rounded-full" style={{ background: getColorToken(h.color).dot }}></span>
                <span className="font-medium">{h.title}</span>
              </div>
            ))}
            {monthList.length > 6 && <span className="text-xs text-gray-400">외 {monthList.length - 6}개</span>}
          </div>
        </div>

        {/* Side timeline */}
        <aside className="bg-white/80 backdrop-blur rounded-3xl p-5 border border-white card-shadow self-start hidden lg:block max-h-[calc(100vh-120px)] overflow-y-auto">
          {/* Tab toggle */}
          <div className="relative flex items-center bg-gray-100 rounded-full p-1 mb-4">
            <motion.div
              layoutId="sidebarToggle"
              className="absolute top-1 bottom-1 rounded-full bg-gradient-to-r from-indie-pink to-soft-coral shadow-sm"
              style={{ width: 'calc(50% - 4px)', left: sidebarTab === 'monthly' ? 4 : 'calc(50% + 0px)' }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
            <button
              onClick={() => setSidebarTab('monthly')}
              className={`relative z-10 flex-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                sidebarTab === 'monthly' ? 'text-gray-800' : 'text-gray-500'
              }`}
            >
              이 달의 함뜨
            </button>
            <button
              onClick={() => setSidebarTab('wishlist')}
              className={`relative z-10 flex-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                sidebarTab === 'wishlist' ? 'text-gray-800' : 'text-gray-500'
              }`}
            >
              위시리스트
            </button>
          </div>

          {/* Tab content */}
          {sidebarTab === 'monthly' ? (
            <>
              {monthList.length === 0 ? (
                <div className="py-12 text-center"><div className="text-3xl mb-3">🧶</div><p className="text-sm text-gray-400">표시할 함뜨가 없어요</p></div>
              ) : (
                <div className="space-y-2">
                  {monthList.map(h => {
                    const tok = getColorToken(h.color);
                    const status = U.getStatus(h, TODAY);
                    const start = U.parseDate(h.startDate), end = U.parseDate(h.endDate);
                    const total = U.daysBetween(start, end) + 1;
                    const elapsed = Math.max(0, Math.min(total, U.daysBetween(start, TODAY) + 1));
                    const pct = status === 'completed' ? 100 : status === 'upcoming' ? 0 : Math.round((elapsed / total) * 100);
                    return (
                      <div key={h.id} className="group relative">
                      <button onClick={() => setDetailId(h.id)} className="w-full text-left p-3 rounded-2xl border border-gray-100 hover:border-indie-pink/40 hover:bg-warm-cream/60 transition-all">
                        <div className="flex items-start gap-3">
                          <span className="w-1.5 self-stretch rounded-full flex-shrink-0 mt-0.5" style={{ background: tok.bar }}></span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-bold text-gray-800 truncate text-sm">{h.title}</p>
                              <StatusPill status={status} />
                            </div>
                            <p className="text-[11px] text-gray-500 mb-2">{h.startDate.slice(5).replace('-', '/')} → {h.endDate.slice(5).replace('-', '/')} · {h.participants?.length || 0}명</p>
                            <div className="bg-gray-100 h-1 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: pct + '%', background: tok.bar }}></div>
                            </div>
                          </div>
                        </div>
                      </button>
                      <button
                        onClick={() => { if (confirm('이 함뜨를 삭제할까요?')) handleDelete(h.id); }}
                        className="absolute top-2 right-2 p-1.5 rounded-full text-gray-300 hover:text-red-400 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                        title="삭제"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <WishlistSidebar
              wishlist={wishlist}
              members={members}
              currentUserId={currentUserId}
              onAddWish={onAddWish}
              onUpdateWish={onUpdateWish}
              onDeleteWish={onDeleteWish}
              onToggleLike={onToggleLike}
              onAddHamtteu={onAdd}
            />
          )}
        </aside>
      </div>

      {/* Modals */}
      {selectedDate && <DayListModal date={selectedDate} items={dayItems} onClose={() => setSelectedDate(null)} onPick={(id) => { setSelectedDate(null); setDetailId(id); }} />}
      {detailItem && <DetailModal hamtteu={detailItem} onClose={() => setDetailId(null)} onEdit={(id) => { setDetailId(null); setEditingId(id); setShowRegister(true); }} onDelete={handleDelete} />}
      {showRegister && <RegisterModal initial={editingItem} members={members || []} onSave={handleSave} onClose={() => { setShowRegister(false); setEditingId(null); }} onDelete={handleDelete} />}
    </div>
  );
};

export default HamtteuCalendar;
