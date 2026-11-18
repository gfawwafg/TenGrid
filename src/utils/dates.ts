export interface DayMeta {
  dateKey: string;
  dayShort: string; // M, T, W, T, F, S, S
  dayMed: string;   // Mon, Tue, ...
  dayFull: string;  // Monday, Tuesday, ...
  dayNum: number;
  monthShort: string;
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
}

const SHORT_SINGLE = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const MED_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const FULL_NAMES = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];
const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export function getLocalDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDateKey(dateKey: string): Date {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

export function addDaysToKey(dateKey: string, deltaDays: number): string {
  const date = parseDateKey(dateKey);
  date.setDate(date.getDate() + deltaDays);
  return getLocalDateKey(date);
}

export function getWeekStartMonday(baseDate: Date = new Date()): Date {
  const d = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), 12, 0, 0, 0);
  const jsDay = d.getDay(); // 0 = Sun, 1 = Mon, ...
  const diffToMonday = jsDay === 0 ? -6 : 1 - jsDay;
  d.setDate(d.getDate() + diffToMonday);
  return d;
}

export function getWeekDays(weekOffset: number = 0): DayMeta[] {
  const todayKey = getLocalDateKey(new Date());
  const monday = getWeekStartMonday(new Date());
  monday.setDate(monday.getDate() + weekOffset * 7);

  const days: DayMeta[] = [];
  for (let i = 0; i < 7; i++) {
    const current = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i, 12, 0, 0, 0);
    const key = getLocalDateKey(current);
    days.push({
      dateKey: key,
      dayShort: SHORT_SINGLE[i],
      dayMed: MED_NAMES[i],
      dayFull: FULL_NAMES[i],
      dayNum: current.getDate(),
      monthShort: MONTHS[current.getMonth()],
      isToday: key === todayKey,
      isPast: key < todayKey,
      isFuture: key > todayKey,
    });
  }
  return days;
}

export function formatWeekRange(days: DayMeta[]): string {
  if (days.length === 0) return '';
  const first = days[0];
  const last = days[days.length - 1];
  const year = parseDateKey(last.dateKey).getFullYear();
  if (first.monthShort === last.monthShort) {
    return `${first.monthShort} ${first.dayNum} – ${last.dayNum}, ${year}`;
  }
  return `${first.monthShort} ${first.dayNum} – ${last.monthShort} ${last.dayNum}, ${year}`;
}

export function formatReadableDate(dateKey: string): string {
  const todayKey = getLocalDateKey(new Date());
  const tomorrowKey = addDaysToKey(todayKey, 1);
  const yesterdayKey = addDaysToKey(todayKey, -1);
  if (dateKey === todayKey) return 'Today';
  if (dateKey === tomorrowKey) return 'Tomorrow';
  if (dateKey === yesterdayKey) return 'Yesterday';
  const d = parseDateKey(dateKey);
  const jsDay = d.getDay();
  const monIndex = jsDay === 0 ? 6 : jsDay - 1;
  return `${MED_NAMES[monIndex]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;
}
