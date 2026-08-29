import { describe, expect, it } from 'vitest';
import { pickCopy } from './copy';
import { calcLayers } from './layers';

function resultOf(temp: number, wind = 0, code = 0, humidity = 0) {
  return calcLayers(temp, wind, code, humidity);
}

describe('pickCopy · 文案抽取', () => {
  it('普通档位返回该档文案（非空、以句号收尾）', () => {
    for (const temp of [30, 25, 20, 15, 10, 4, -2, 38]) {
      const copy = pickCopy(resultOf(temp));
      expect(copy.length).toBeGreaterThan(4);
    }
  });

  it('极端高温走彩蛋文案', () => {
    const copy = pickCopy(resultOf(38));
    expect(copy).toMatch(/烤箱|徒步|煎蛋/);
  });

  it('极端低温走彩蛋文案', () => {
    const copy = pickCopy(resultOf(-8));
    expect(copy).toMatch(/生存|冻僵|远方/);
  });

  it('风大追加后缀', () => {
    expect(pickCopy(resultOf(20, 30))).toContain('风很大');
  });

  it('闷热追加后缀', () => {
    expect(pickCopy(resultOf(30, 0, 0, 90))).toContain('闷到怀疑人生');
  });

  it('风大 + 闷热同时追加', () => {
    const copy = pickCopy(resultOf(30, 30, 0, 90));
    expect(copy).toContain('风很大');
    expect(copy).toContain('闷到怀疑人生');
  });

  it('标点规范：不出现"。，"连用，整体以句号收尾', () => {
    for (const r of [
      resultOf(30, 0, 0, 90),
      resultOf(20, 30),
      resultOf(30, 30, 0, 90),
      resultOf(-8, 30),
    ]) {
      const copy = pickCopy(r);
      expect(copy).not.toContain('。，');
      expect(copy.endsWith('。')).toBe(true);
    }
  });

  it('"换一个说法"重抽后不保证相同（文案库至少 2 条的档位必然可换）', () => {
    const r = resultOf(20); // 2 层档有 3 条文案
    const copies = new Set(Array.from({ length: 30 }, () => pickCopy(r)));
    expect(copies.size).toBeGreaterThan(1);
  });
});
