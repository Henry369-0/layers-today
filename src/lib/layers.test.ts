import { describe, expect, it } from 'vitest';
import { MAX_LAYERS, MIN_LAYERS, calcLayers, formatLayers } from './layers';

describe('calcLayers · 基础换算表', () => {
  // 每一档的上下边界：左闭右开
  it.each([
    [32, 0.5], // ≥ 32 → 0.5
    [31.9, 1],
    [27, 1], // 27–32 → 1
    [26.9, 1.5],
    [22, 1.5], // 22–27 → 1.5
    [21.9, 2],
    [17, 2], // 17–22 → 2
    [16.9, 2.5],
    [12, 2.5], // 12–17 → 2.5
    [11.9, 3],
    [6, 3], // 6–12 → 3
    [5.9, 3.5],
    [0, 3.5], // 0–6 → 3.5
    [-0.1, 4], // < 0 → 4
    [-19, 4],
  ])('体感 %s°C → %s 层', (temp, expected) => {
    const r = calcLayers(temp, 0, 0);
    expect(r.layers).toBe(expected);
    expect(r.base).toBe(expected);
  });
});

describe('calcLayers · 穿搭建议', () => {
  it('来自换算表对应档位', () => {
    expect(calcLayers(24, 0, 0).suggestion).toBe('短袖 + 薄外套塞包里');
    expect(calcLayers(14, 0, 0).suggestion).toBe('卫衣 + 夹克');
    expect(calcLayers(-5, 0, 0).suggestion).toBe('羽绒服，秋裤别侥幸');
  });
});

describe('calcLayers · 修正项', () => {
  it('风速 > 25 km/h 加 0.5 层（边界 25 不加）', () => {
    expect(calcLayers(20, 25, 0).layers).toBe(2);
    expect(calcLayers(20, 25.1, 0).layers).toBe(2.5);
    expect(calcLayers(20, 25.1, 0).windBoost).toBe(true);
    expect(calcLayers(20, 10, 0).windBoost).toBe(false);
  });

  it('降雨/降雪/雷暴天气码加 0.5 层并标记', () => {
    for (const code of [53, 61, 66, 73, 81, 86, 95]) {
      const r = calcLayers(20, 0, code);
      expect(r.layers).toBe(2.5);
      expect(r.rainBoost).toBe(true);
    }
    expect(calcLayers(20, 0, 0).rainBoost).toBe(false);
    expect(calcLayers(20, 0, 3).rainBoost).toBe(false); // 多云不算
    expect(calcLayers(20, 0, 45).rainBoost).toBe(false); // 雾不算
  });

  it('闷热（湿度 > 85 且体感 > 28）不加层，只标记', () => {
    const r = calcLayers(30, 0, 0, 90);
    expect(r.layers).toBe(1);
    expect(r.muggy).toBe(true);
    expect(calcLayers(30, 0, 0, 85).muggy).toBe(false); // 湿度边界 85 不算
    expect(calcLayers(28, 0, 0, 90).muggy).toBe(false); // 温度边界 28 不算
  });

  it('风 + 雨 + 严寒叠加后 clamp 到上限 5', () => {
    const r = calcLayers(-5, 30, 63);
    expect(r.layers).toBe(MAX_LAYERS);
    expect(r.layers).toBeLessThanOrEqual(MAX_LAYERS);
  });

  it('结果永远不会低于下限 0.5', () => {
    expect(calcLayers(40, 0, 0).layers).toBeGreaterThanOrEqual(MIN_LAYERS);
    expect(calcLayers(40, 0, 0).layers).toBe(0.5);
  });
});

describe('calcLayers · 极端档彩蛋', () => {
  it('体感 < 0 或 ≥ 37 触发', () => {
    expect(calcLayers(-0.5, 0, 0).extreme).toBe(true);
    expect(calcLayers(37, 0, 0).extreme).toBe(true);
    expect(calcLayers(36.9, 0, 0).extreme).toBe(false);
    expect(calcLayers(25, 0, 0).extreme).toBe(false);
  });
});

describe('formatLayers', () => {
  it('整数不带小数位', () => {
    expect(formatLayers(2)).toBe('2');
    expect(formatLayers(2.5)).toBe('2.5');
    expect(formatLayers(0.5)).toBe('0.5');
  });
});
