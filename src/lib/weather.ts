import type { City, Weather } from '../types';

const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

/** 城市搜索（Open-Meteo Geocoding，免费无 Key，支持中文） */
export async function searchCity(name: string, signal?: AbortSignal): Promise<City[]> {
  const url = `${GEO_URL}?name=${encodeURIComponent(name)}&count=5&language=zh&format=json`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`城市搜索失败（HTTP ${res.status}）`);
  const data = await res.json();
  // 可能无 results 字段 → 调用方提示"没找到这个城市"
  return (data.results ?? []) as City[];
}

/** 拉取当前天气实况 */
export async function fetchWeather(
  latitude: number,
  longitude: number,
  signal?: AbortSignal,
): Promise<Weather> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current:
      'temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m',
    timezone: 'auto',
  });
  const res = await fetch(`${FORECAST_URL}?${params}`, { signal });
  if (!res.ok) throw new Error(`天气请求失败（HTTP ${res.status}）`);
  const data = await res.json();
  const c = data.current;
  return {
    date: String(c.time).slice(0, 10),
    temperature: c.temperature_2m,
    apparentTemperature: c.apparent_temperature,
    humidity: c.relative_humidity_2m,
    weatherCode: c.weather_code,
    windSpeed: c.wind_speed_10m,
  };
}

/** WMO 天气码 → 中文天气词 */
export function weatherCodeToText(code: number): string {
  if (code === 0) return '晴';
  if (code >= 1 && code <= 3) return '多云';
  if (code === 45 || code === 48) return '雾';
  if (code >= 51 && code <= 57) return '毛毛雨';
  if (code >= 61 && code <= 65) return '雨';
  if (code === 66 || code === 67) return '冻雨';
  if (code >= 71 && code <= 77) return '雪';
  if (code >= 80 && code <= 82) return '阵雨';
  if (code === 85 || code === 86) return '阵雪';
  if (code === 95 || code === 96 || code === 99) return '雷暴';
  return '未知';
}

/** 降雨/降雪/雷暴类天气码（用于加层 + 盖章） */
const PRECIP_RANGES: Array<[number, number]> = [
  [51, 57],
  [61, 67],
  [71, 77],
  [80, 82],
  [85, 86],
  [95, 99],
];

export function isPrecipitation(code: number): boolean {
  return PRECIP_RANGES.some(([lo, hi]) => code >= lo && code <= hi);
}

/** "2026-08-29" → "8 月 29 日" */
export function formatDateCn(iso: string): string {
  const [, m, d] = iso.split('-');
  return `${Number(m)} 月 ${Number(d)} 日`;
}
