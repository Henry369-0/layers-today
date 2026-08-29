import type { HistoryEntry } from '../types';
import { formatLayers } from '../lib/layers';

interface Props {
  items: HistoryEntry[];
  onSelect: (entry: HistoryEntry) => void;
  onClear: () => void;
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** 本次会话查询历史（localStorage 持久化，上限 20 条），可点击回看 */
export default function HistoryList({ items, onSelect, onClear }: Props) {
  if (items.length === 0) return null;
  return (
    <section className="mt-14">
      <div className="mb-3 flex items-baseline justify-between border-b-2 border-ink/70 pb-2">
        <h2 className="text-sm font-semibold tracking-[0.3em] text-ink/70">查询历史</h2>
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-ink/45 underline underline-offset-2 hover:text-brick"
        >
          清空
        </button>
      </div>
      <ul className="flex flex-wrap gap-2">
        {items.map((entry) => (
          <li key={`${entry.city.id}-${entry.savedAt}`}>
            <button
              type="button"
              onClick={() => onSelect(entry)}
              className="border border-ink/50 bg-white/40 px-3 py-1.5 text-sm transition-colors hover:border-ink hover:bg-ink/10"
            >
              <span className="font-semibold">{entry.city.name}</span>
              <span className="mx-1.5 text-brick">{formatLayers(entry.result.layers)} 层</span>
              <span className="text-ink/45">{formatTime(entry.savedAt)}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
