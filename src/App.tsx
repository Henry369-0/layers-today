import { useCallback, useReducer, useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import type { City, PosterData } from './types';
import { fetchWeather } from './lib/weather';
import { calcLayers, formatLayers } from './lib/layers';
import { pickCopy } from './lib/copy';
import { addHistory, clearHistory, loadHistory, loadLastResult, saveLastResult } from './lib/storage';
import type { HistoryEntry } from './types';
import CitySearch from './components/CitySearch';
import PosterCard from './components/PosterCard';
import HistoryList from './components/HistoryList';

/* ---------------- 状态机 ---------------- */

interface State {
  status: 'idle' | 'loading' | 'done' | 'error';
  data: PosterData | null;
  error: string | null;
  /** error 时是否回落到了缓存结果 */
  stale: boolean;
}

type Action =
  | { type: 'load' }
  | { type: 'success'; data: PosterData }
  | { type: 'failure'; message: string; fallback: PosterData | null }
  | { type: 'show'; data: PosterData; stale?: boolean }
  | { type: 'reroll' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'load':
      return { ...state, status: 'loading', error: null, stale: false };
    case 'success':
      return { status: 'done', data: action.data, error: null, stale: false };
    case 'failure':
      return {
        status: 'error',
        data: action.fallback,
        error: action.message,
        stale: action.fallback != null,
      };
    case 'show':
      return { status: 'done', data: action.data, error: null, stale: action.stale ?? false };
    case 'reroll':
      return state.data
        ? { ...state, data: { ...state.data, copy: pickCopy(state.data.result) } }
        : state;
  }
}

/* ---------------- 页面 ---------------- */

export default function App() {
  const [state, dispatch] = useReducer(reducer, { status: 'idle', data: null, error: null, stale: false });
  const [history, setHistory] = useState<HistoryEntry[]>(() => loadHistory());
  const [exporting, setExporting] = useState(false);
  const posterRef = useRef<HTMLDivElement>(null);
  const lastCityRef = useRef<City | null>(null);

  const selectCity = useCallback(async (city: City) => {
    lastCityRef.current = city;
    dispatch({ type: 'load' });
    try {
      const weather = await fetchWeather(city.latitude, city.longitude);
      const result = calcLayers(
        weather.apparentTemperature,
        weather.windSpeed,
        weather.weatherCode,
        weather.humidity,
      );
      const data: PosterData = { city, weather, result, copy: pickCopy(result) };
      dispatch({ type: 'success', data });
      setHistory(addHistory(data));
      saveLastResult(data);
    } catch (e) {
      dispatch({
        type: 'failure',
        message: e instanceof Error ? e.message : '网络开小差了',
        fallback: loadLastResult(),
      });
    }
  }, []);

  const retry = useCallback(() => {
    if (lastCityRef.current) void selectCity(lastCityRef.current);
  }, [selectCity]);

  const handleDownload = useCallback(async () => {
    const node = posterRef.current;
    const data = state.data;
    if (!node || !data) return;
    setExporting(true);
    try {
      await document.fonts.ready; // 等字体加载完再截图，避免海报空窗
      let dataUrl: string;
      try {
        dataUrl = await toPng(node, { pixelRatio: 2 });
      } catch {
        // 字体嵌入失败时降级为系统衬线体导出
        dataUrl = await toPng(node, { pixelRatio: 2, skipFonts: true });
      }
      const a = document.createElement('a');
      a.download = `layers.today-${data.city.name}-${data.weather.date}.png`;
      a.href = dataUrl;
      a.click();
    } catch {
      alert('导出失败，请重试');
    } finally {
      setExporting(false);
    }
  }, [state.data]);

  // 移动端防误触：导出期间禁止重复点击（按钮已 disabled，这里仅占位语义）

  const loading = state.status === 'loading';

  return (
    <div className="min-h-screen">
      <header className="border-b-2 border-ink/80 bg-mustard/25">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4">
          <span className="flex size-10 items-center justify-center border-2 border-ink bg-paper text-xl font-black text-brick shadow-[2px_2px_0_#2B2B26]">
            层
          </span>
          <div>
            <h1 className="text-lg font-bold leading-tight tracking-widest">穿衣层数生成器</h1>
            <p className="text-xs tracking-[0.2em] text-ink/55">layers.today · 今天穿几层研究所</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-28">
        <section className="py-8 text-center sm:py-10">
          <p className="mb-6 text-sm tracking-[0.35em] text-ink/55">
            输入城市 · 3 秒生成今日穿搭公告
          </p>
          <CitySearch onSelect={selectCity} disabled={loading} />
        </section>

        {state.error && (
          <div className="mx-auto mb-6 max-w-xl border-2 border-brick bg-brick/10 px-4 py-3 text-sm text-brick">
            {state.error}。
            {state.stale && '以下是你上次成功查询的结果（离线缓存）。'}
            {lastCityRef.current && (
              <>
                {' '}
                <button type="button" onClick={retry} className="font-semibold underline underline-offset-2">
                  重试
                </button>
              </>
            )}
          </div>
        )}

        {loading && (
          <div className="mx-auto max-w-[540px] animate-pulse space-y-4" aria-label="加载中">
            <div className="h-[720px] border-2 border-ink/30 bg-ink/5" />
          </div>
        )}

        {!loading && state.data && (
          <section className="mx-auto w-full max-w-[540px]">
            {state.stale && (
              <p className="mb-3 text-center text-xs tracking-widest text-ink/45">
                离线缓存结果 · 未必是此刻天气
              </p>
            )}
            <div className="border-2 border-ink bg-paper p-1.5 shadow-[6px_6px_0_rgba(43,43,38,0.35)]">
              <PosterCard data={state.data} posterRef={posterRef} />
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={handleDownload}
                disabled={exporting}
                className="border-2 border-ink bg-brick px-6 py-3 text-base font-semibold tracking-widest text-paper shadow-[4px_4px_0_#2B2B26] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#2B2B26] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {exporting ? '生成中…' : '下载 PNG'}
              </button>
              <button
                type="button"
                onClick={() => dispatch({ type: 'reroll' })}
                className="border-2 border-ink bg-paper px-6 py-3 text-base font-semibold tracking-widest shadow-[4px_4px_0_#2B2B26] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#2B2B26]"
              >
                换一个说法
              </button>
            </div>

            <p className="mt-4 text-center text-xs tracking-widest text-ink/45">
              {state.data.city.name} · 体感 {Math.round(state.data.weather.apparentTemperature)}°C
              · 建议 {formatLayers(state.data.result.layers)} 层
            </p>
          </section>
        )}

        {!loading && !state.data && state.status !== 'error' && (
          <section className="mx-auto max-w-xl border-2 border-dashed border-ink/40 px-6 py-10 text-center">
            <p className="text-sm leading-7 text-ink/55">
              输入任意城市名，生成一张「今日穿几层」复古海报。
              <br />
              免费无 Key · 无需登录 · 数据来自 Open-Meteo
            </p>
          </section>
        )}

        <HistoryList
          items={history}
          onSelect={(entry) => dispatch({ type: 'show', data: entry })}
          onClear={() => {
            clearHistory();
            setHistory([]);
          }}
        />
      </main>

      <footer className="fixed inset-x-0 bottom-0 border-t border-ink/20 bg-paper/90 backdrop-blur">
        <p className="mx-auto max-w-3xl px-4 py-2 text-center text-[11px] tracking-widest text-ink/40">
          穿衣层数研究所 · 手工测量 · 仅供娱乐 · 天气数据 Open-Meteo（免费无 Key）
        </p>
      </footer>
    </div>
  );
}
