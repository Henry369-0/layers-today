import type { LayerResult } from '../types';

/** 每档毒舌文案，随机抽取 */
const COPY_BY_TIER: Record<string, string[]> = {
  '0.5': [
    '今天的衣服纯属礼貌。',
    '穿多了是给自己的考验。',
    '防晒衣是你的全部尊严。',
    '出门前，请先和空调郑重告别。',
  ],
  '1': [
    '一件短袖，是夏天最后的倔强。',
    '这个温度，布料只是装饰。',
    '短袖短裤，走遍天下都不怕。',
  ],
  '1.5': [
    '薄外套在包里，安全感在心上。',
    '那半层外套，防的是空调不是天气。',
    '早晚温差，靠一件薄外套体面收场。',
  ],
  '2': [
    '卫衣是这个温度的人类文明巅峰。',
    '长袖正好，风度和温度握手言和。',
    '一件长袖，是秋天的开场白。',
  ],
  '2.5': [
    '卫衣加夹克，是换季的标准答案。',
    '这个温度，穿搭全靠叠。',
    '穿 2.5 层的人，最懂什么叫体面。',
  ],
  '3': [
    '毛衣和厚外套，分工明确互不打扰。',
    '三层上身，冬天先礼后兵。',
    '秋裤可以出场了，别再装没事。',
  ],
  '3.5': [
    '出门前请和家人交代一声。',
    '围巾不是配饰，是承重结构。',
    '厚外套加围巾，风再大也稳如老狗。',
  ],
  '4': [
    '羽绒服是今天的工装。',
    '秋裤别侥幸，这是科学。',
    '衣服的重量，快赶上一半的家当了。',
    '出门这件事，今天值得三思。',
  ],
};

/** 极端档彩蛋文案 */
const EXTREME_HOT = [
  '这不是天气，是烤箱预热。',
  '今天出门，属于户外徒步活动。',
  '路面可以煎蛋，请自备勇气。',
];
const EXTREME_COLD = [
  '这不是穿搭问题，是生存问题。',
  '出门五分钟，冻僵两小时。',
  '被窝以外的地方，都是远方。',
];

const WIND_SUFFIX = '风很大';
const MUGGY_SUFFIX = '闷到怀疑人生';

function pick<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

/** 层数 → 文案库 key，超出 4 层并入 "4"（4 层+） */
function tierKey(layers: number): string {
  const t = Math.min(4, Math.max(0.5, Math.round(layers * 2) / 2));
  return Number.isInteger(t) ? String(t) : t.toFixed(1);
}

/**
 * 根据算法结果抽取毒舌文案：
 * 极端档优先彩蛋；随后按最终层数抽档位文案；风大/闷热追加后缀
 */
export function pickCopy(result: LayerResult): string {
  let line: string;
  if (result.extreme) {
    line = pick(result.base <= 1 ? EXTREME_HOT : EXTREME_COLD);
  } else {
    line = pick(COPY_BY_TIER[tierKey(result.layers)] ?? COPY_BY_TIER['2']);
  }

  // 追加后缀时去掉主句句号，避免"。，"连用
  const parts = [line.replace(/。+$/, '')];
  if (result.windBoost) parts.push(WIND_SUFFIX);
  if (result.muggy) parts.push(MUGGY_SUFFIX);
  const joined = parts.join('，');
  return `${joined}。`;
}
