import { useEffect, useRef, useState } from 'react';
import type { Ref } from 'react';
import type { PosterData } from '../types';
import { formatDateCn, weatherCodeToText } from '../lib/weather';
import { formatLayers } from '../lib/layers';
import { GarmentIcon, garmentsFor } from './Icons';

export const POSTER_W = 1080;
export const POSTER_H = 1440;

/** 公告编号：一年中的第 N 天 */
function issueNumber(dateISO: string): number {
  const d = new Date(`${dateISO}T00:00:00Z`);
  const start = Date.UTC(d.getUTCFullYear(), 0, 0);
  return Math.floor((d.getTime() - start) / 86_400_000);
}

interface Props {
  data: PosterData;
  /** 指向固定尺寸海报节点，供 PNG 导出使用 */
  posterRef: Ref<HTMLDivElement>;
}

export default function PosterCard({ data, posterRef }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  // 海报固定 1080×1440，外层 transform scale 适配屏幕
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => setScale(Math.min(1, el.clientWidth / POSTER_W));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { city, weather, result, copy } = data;
  const icons = garmentsFor(result.layers, result.rainBoost);
  const cityLen = city.name.length;

  return (
    <div ref={wrapRef} className="w-full">
      <div
        className="relative mx-auto"
        style={{ width: POSTER_W * scale, height: POSTER_H * scale }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          <div className="poster" ref={posterRef}>
            <div className="poster-grain" />
            <div className="poster-frame poster-frame--outer" />
            <div className="poster-frame poster-frame--inner" />

            <header className="poster-head">
              <span>穿衣层数研究所</span>
              <span>第 {issueNumber(weather.date)} 号公告</span>
            </header>
            <div className="poster-rule" />

            <section className="poster-city">
              <h1 className={`poster-cityname${cityLen >= 5 ? ' poster-cityname--long' : ''}`}>
                {city.name}
              </h1>
              <p className="poster-citymeta">
                {formatDateCn(weather.date)} · {weatherCodeToText(weather.weatherCode)}
                {result.muggy ? ' · 闷' : ''}
              </p>
            </section>

            <section className="poster-hero">
              <p className="poster-hero-label">今日穿</p>
              <div className="poster-hero-num">
                <span className="num">{formatLayers(result.layers)}</span>
                <span className="unit">层</span>
              </div>

              <div className="poster-icons">
                {icons.map((name) => (
                  <GarmentIcon key={name} name={name} size={92} />
                ))}
              </div>

              <p className="poster-metrics">
                体感 {Math.round(weather.apparentTemperature)}°C · 风{' '}
                {Math.round(weather.windSpeed)} km/h
              </p>
              <p className="poster-suggestion">
                <span className="tag">穿搭</span>
                <span>{result.suggestion}</span>
              </p>
            </section>

            <blockquote className="poster-quote">「{copy}」</blockquote>

            {result.rainBoost && <div className="poster-stamp">有雨</div>}

            <footer>
              <div className="poster-rule" />
              <div className="poster-footrow">
                <span>layers.today</span>
                <span>手工测量 · 仅供娱乐</span>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
