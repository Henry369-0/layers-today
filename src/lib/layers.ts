import { isPrecipitation } from './weather';
import type { LayerResult } from '../types';

/**
 * 基础换算表：体感温度（左闭右开区间）→ 层数 + 穿搭建议
 * 自上而下第一个命中的档位生效，最后一档兜底一切 < 0 的情况
 */
const TIERS = [
  { min: 32, layers: 0.5, suggestion: '越少越好，出门先找阴影' },
  { min: 27, layers: 1, suggestion: '短袖短裤，防晒霜算第 0.5 层' },
  { min: 22, layers: 1.5, suggestion: '短袖 + 薄外套塞包里' },
  { min: 17, layers: 2, suggestion: '长袖或卫衣' },
  { min: 12, layers: 2.5, suggestion: '卫衣 + 夹克' },
  { min: 6, layers: 3, suggestion: '毛衣 + 厚外套' },
  { min: 0, layers: 3.5, suggestion: '厚外套 + 围巾' },
  { min: -Infinity, layers: 4, suggestion: '羽绒服，秋裤别侥幸' },
] as const;

export const MIN_LAYERS = 0.5;
export const MAX_LAYERS = 5;
export const WIND_THRESHOLD_KMH = 25;

/**
 * 核心算法：体感温度 → 穿衣层数（纯函数）
 * @param apparentTemp 体感温度 °C（唯一主输入）
 * @param windKmh      风速 km/h，> 25 加 0.5 层
 * @param weatherCode  WMO 天气码，降雨/降雪/雷暴类加 0.5 层
 * @param humidity     相对湿度 %，> 85 且体感 > 28 时不加层但标记闷热
 */
export function calcLayers(
  apparentTemp: number,
  windKmh: number,
  weatherCode: number,
  humidity = 0,
): LayerResult {
  const tier = TIERS.find((t) => apparentTemp >= t.min)!;
  let layers: number = tier.layers;

  const windBoost = windKmh > WIND_THRESHOLD_KMH;
  if (windBoost) layers += 0.5;

  const rainBoost = isPrecipitation(weatherCode);
  if (rainBoost) layers += 0.5;

  // 闷热：不加层数，只追加文案
  const muggy = humidity > 85 && apparentTemp > 28;

  layers = Math.min(MAX_LAYERS, Math.max(MIN_LAYERS, layers));

  const extreme = apparentTemp < 0 || apparentTemp >= 37;

  return {
    base: tier.layers,
    layers,
    suggestion: tier.suggestion,
    windBoost,
    rainBoost,
    muggy,
    extreme,
  };
}

/** 层数展示：整数不带小数位（2 而不是 2.0） */
export function formatLayers(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}
