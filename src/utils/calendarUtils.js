export const DAYS_KO = ['일', '월', '화', '수', '목', '금', '토'];
export const MONTHS_KO = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];

export const parseDate = (str) => {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const fmtDate = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const fmtKor = (d) => `${d.getMonth() + 1}월 ${d.getDate()}일 (${DAYS_KO[d.getDay()]})`;

export const sameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export const buildMonthGrid = (year, month) => {
  const first = new Date(year, month, 1);
  const startWeekday = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  const prevDays = new Date(year, month, 0).getDate();
  for (let i = startWeekday - 1; i >= 0; i--) {
    cells.push({ date: new Date(year, month - 1, prevDays - i), inMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), inMonth: true });
  }
  while (cells.length < 42) {
    const last = cells[cells.length - 1].date;
    cells.push({ date: new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1), inMonth: false });
  }
  return cells;
};

export const daysBetween = (a, b) => Math.round((b - a) / 86400000);

export const getStatus = (h, today) => {
  const start = parseDate(h.startDate);
  const end = parseDate(h.endDate);
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (t < start) return 'upcoming';
  if (t > end) return 'completed';
  return 'ongoing';
};

export const sliceIntoWeeks = (h, gridCells) => {
  const start = parseDate(h.startDate);
  const end = parseDate(h.endDate);
  const segments = [];
  for (let week = 0; week < 6; week++) {
    const weekStart = gridCells[week * 7].date;
    const weekEnd = gridCells[week * 7 + 6].date;
    const segStart = start > weekStart ? start : weekStart;
    const segEnd = end < weekEnd ? end : weekEnd;
    if (segStart > segEnd) continue;
    const startCol = daysBetween(weekStart, segStart);
    const endCol = daysBetween(weekStart, segEnd);
    segments.push({ weekIndex: week, startCol, endCol, startsHere: sameDay(segStart, start), endsHere: sameDay(segEnd, end) });
  }
  return segments;
};

export const getOnDate = (list, date) => {
  return list.filter(h => {
    const s = parseDate(h.startDate);
    const e = parseDate(h.endDate);
    return date >= s && date <= e;
  });
};
