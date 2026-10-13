import { useEffect, useRef, useState } from 'react';
import type { City } from '../types';
import { searchCity } from '../lib/weather';

interface Props {
  onSelect: (city: City) => void;
  disabled?: boolean;
}

type SearchStatus = 'idle' | 'loading' | 'done' | 'error';

/** 城市搜索：300ms 防抖 + 下拉候选（省份/国家消歧义） */
export default function CitySearch({ onSelect, disabled }: Props) {
  const [query, setQuery] = useState('');
  const [selectedQuery, setSelectedQuery] = useState<string | null>(null);
  const [results, setResults] = useState<City[]>([]);
  const [status, setStatus] = useState<SearchStatus>('idle');
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query.trim();
    if (!q || disabled || query === selectedQuery) {
      setResults([]);
      setStatus('idle');
      setOpen(false);
      return;
    }
    const ac = new AbortController();
    setResults([]);
    setOpen(false);
    setStatus('loading');
    const timer = setTimeout(async () => {
      try {
        const list = await searchCity(q, ac.signal);
        if (ac.signal.aborted) return;
        setResults(list);
        setStatus('done');
        setHighlight(0);
        setOpen(true);
      } catch {
        if (ac.signal.aborted) return;
        setResults([]);
        setStatus('error');
        setOpen(true);
      }
    }, 300);
    return () => {
      clearTimeout(timer);
      ac.abort();
    };
  }, [query, selectedQuery, disabled]);

  // 点击外部关闭下拉
  useEffect(() => {
    const onDocDown = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocDown);
    return () => document.removeEventListener('mousedown', onDocDown);
  }, []);

  const choose = (city: City) => {
    setOpen(false);
    setResults([]);
    setSelectedQuery(city.name);
    setQuery(city.name);
    onSelect(city);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || results.length === 0) {
      if (e.key === 'Escape') setOpen(false);
      return;
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlight((h) => (h + 1) % results.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlight((h) => (h - 1 + results.length) % results.length);
        break;
      case 'Enter':
        e.preventDefault();
        choose(results[highlight]);
        break;
      case 'Escape':
        setOpen(false);
        break;
    }
  };

  return (
    <div ref={boxRef} className="relative mx-auto w-full max-w-xl">
      <div className="flex items-center gap-3 border-2 border-ink bg-white/60 px-4 shadow-[4px_4px_0_#2B2B26] focus-within:shadow-[2px_2px_0_#2B2B26] focus-within:translate-x-[2px] focus-within:translate-y-[2px] transition-all">
        <svg
          viewBox="0 0 24 24"
          className="size-5 shrink-0 text-ink/60"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          value={query}
          onChange={(e) => {
            setSelectedQuery(null);
            setQuery(e.target.value);
          }}
          onKeyDown={onKeyDown}
          onFocus={() => results.length > 0 && setOpen(true)}
          disabled={disabled}
          placeholder="输入城市名，如：杭州、Beijing"
          className="w-full bg-transparent py-3.5 text-lg outline-none placeholder:text-ink/40 disabled:opacity-50"
          aria-label="城市搜索"
          autoComplete="off"
        />
        {status === 'loading' && (
          <span className="size-5 shrink-0 animate-spin rounded-full border-2 border-ink/25 border-t-ink" />
        )}
      </div>

      {open && (
        <ul className="absolute inset-x-0 top-full z-20 mt-2 border-2 border-ink bg-paper shadow-[4px_4px_0_#2B2B26]">
          {status === 'error' && (
            <li className="px-4 py-3 text-sm text-brick">搜索服务开小差了，请重试</li>
          )}
          {status === 'done' && results.length === 0 && (
            <li className="px-4 py-3 text-sm text-ink/70">
              没找到这个城市，试试用拼音输入（如 hangzhou）
            </li>
          )}
          {results.map((city, i) => (
            <li key={city.id}>
              <button
                type="button"
                onClick={() => choose(city)}
                onMouseEnter={() => setHighlight(i)}
                className={`flex w-full items-baseline justify-between gap-4 px-4 py-3 text-left ${
                  i === highlight ? 'bg-ink/10' : ''
                }`}
              >
                <span className="text-lg font-semibold">{city.name}</span>
                <span className="text-sm text-ink/55">
                  {[city.admin1, city.country].filter(Boolean).join(' · ')}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
