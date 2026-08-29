/** Open-Meteo Geocoding 返回的城市（仅取用到的字段） */
export interface City {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
}

/** Open-Meteo 当前天气（已拍平） */
export interface Weather {
  /** ISO 日期，如 2026-08-29 */
  date: string;
  /** 气温 °C */
  temperature: number;
  /** 体感温度 °C —— 算法唯一主输入 */
  apparentTemperature: number;
  /** 相对湿度 % */
  humidity: number;
  /** WMO 天气码 */
  weatherCode: number;
  /** 风速 km/h */
  windSpeed: number;
}

/** calcLayers 的输出，输入输出全部可序列化 */
export interface LayerResult {
  /** 基础层数（查表所得，未加修正） */
  base: number;
  /** 修正后最终层数，clamp 到 [0.5, 5] */
  layers: number;
  /** 穿搭建议 */
  suggestion: string;
  /** 风速 > 25 km/h 触发的加层 */
  windBoost: boolean;
  /** 降雨/降雪/雷暴触发的加层（海报盖"有雨"章） */
  rainBoost: boolean;
  /** 湿度 > 85% 且温度 > 28：不加层，但文案追加 */
  muggy: boolean;
  /** 极端档（体感 < 0 或 ≥ 37）：触发彩蛋文案 */
  extreme: boolean;
}

/** 一次可渲染的完整结果 */
export interface PosterData {
  city: City;
  weather: Weather;
  result: LayerResult;
  copy: string;
}

export interface HistoryEntry extends PosterData {
  savedAt: number;
}
