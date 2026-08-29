import { describe, expect, it } from 'vitest';
import { isPrecipitation, weatherCodeToText } from './weather';

describe('weatherCodeToText · WMO 码映射', () => {
  it.each([
    [0, '晴'],
    [1, '多云'],
    [2, '多云'],
    [3, '多云'],
    [45, '雾'],
    [48, '雾'],
    [51, '毛毛雨'],
    [57, '毛毛雨'],
    [61, '雨'],
    [65, '雨'],
    [66, '冻雨'],
    [67, '冻雨'],
    [71, '雪'],
    [77, '雪'],
    [80, '阵雨'],
    [82, '阵雨'],
    [85, '阵雪'],
    [86, '阵雪'],
    [95, '雷暴'],
    [99, '雷暴'],
  ])('码 %s → %s', (code, text) => {
    expect(weatherCodeToText(code)).toBe(text);
  });

  it('未知码兜底', () => {
    expect(weatherCodeToText(42)).toBe('未知');
    expect(weatherCodeToText(-1)).toBe('未知');
  });
});

describe('isPrecipitation · 降水判定', () => {
  it('雨雪雷暴类为 true', () => {
    for (const code of [51, 55, 57, 61, 63, 67, 71, 75, 80, 82, 85, 86, 95, 99]) {
      expect(isPrecipitation(code)).toBe(true);
    }
  });

  it('晴/多云/雾为 false', () => {
    for (const code of [0, 1, 2, 3, 45, 48]) {
      expect(isPrecipitation(code)).toBe(false);
    }
  });
});
