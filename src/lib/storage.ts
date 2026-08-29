import type { HistoryEntry, PosterData } from '../types';

const HISTORY_KEY = 'layers.today.history.v1';
const LAST_RESULT_KEY = 'layers.today.last-result.v1';
const MAX_HISTORY = 20;

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 存储满了/被禁用：静默降级，历史记录只是锦上添花
  }
}

export function loadHistory(): HistoryEntry[] {
  const list = read<HistoryEntry[]>(HISTORY_KEY);
  return Array.isArray(list) ? list : [];
}

/** 写入一条历史（同城市同一天只留最新），返回新列表，上限 20 条 */
export function addHistory(entry: PosterData): HistoryEntry[] {
  const next: HistoryEntry[] = [
    { ...entry, savedAt: Date.now() },
    ...loadHistory().filter(
      (h) => !(h.city.id === entry.city.id && h.weather.date === entry.weather.date),
    ),
  ].slice(0, MAX_HISTORY);
  write(HISTORY_KEY, next);
  return next;
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {
    /* 忽略 */
  }
}

/** 缓存"上次成功结果"，供请求失败时回落展示 */
export function saveLastResult(data: PosterData): void {
  write(LAST_RESULT_KEY, data);
}

export function loadLastResult(): PosterData | null {
  return read<PosterData>(LAST_RESULT_KEY);
}
