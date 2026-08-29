import type { ReactElement } from 'react';

export type IconKey =
  | 'tshirt'
  | 'longsleeve'
  | 'sweater'
  | 'hoodie'
  | 'jacket'
  | 'coat'
  | 'down'
  | 'scarf'
  | 'raincoat'
  | 'umbrella'
  | 'shorts'
  | 'pants';

/** 12 个自绘服饰图标，64×64 视框，线性风格 */
const GLYPHS: Record<IconKey, ReactElement> = {
  tshirt: (
    <path d="M22 10 L13 14 L6 28 L16 33 L16 54 L48 54 L48 33 L58 28 L51 14 L42 10 C40 16 36 19 32 19 C28 19 24 16 22 10 Z" />
  ),
  longsleeve: (
    <path d="M22 10 L12 15 L7 38 L15 40 L18 28 L18 54 L46 54 L46 28 L49 40 L57 38 L52 15 L42 10 C40 16 36 19 32 19 C28 19 24 16 22 10 Z" />
  ),
  sweater: (
    <>
      <path d="M22 10 L12 15 L7 38 L15 40 L18 28 L18 54 L46 54 L46 28 L49 40 L57 38 L52 15 L42 10 C40 16 36 19 32 19 C28 19 24 16 22 10 Z" />
      <path d="M26 11 L32 20 L38 11" />
      <path d="M24 34 L32 40 L40 34" />
      <path d="M24 41 L32 47 L40 41" />
      <path d="M18 50 L46 50" />
    </>
  ),
  hoodie: (
    <>
      <path d="M24 10 L12 15 L7 38 L15 40 L18 28 L18 54 L46 54 L46 28 L49 40 L57 38 L52 15 L40 10 Z" />
      <path d="M24 10 C24 3 40 3 40 10" />
      <path d="M28 10 C28 6 36 6 36 10" />
      <path d="M29 13 L29 22" />
      <path d="M35 13 L35 22" />
      <path d="M23 46 L41 46 L38 54 L26 54 Z" />
    </>
  ),
  jacket: (
    <>
      <path d="M22 12 L12 16 L8 40 L16 42 L18 30 L18 54 L46 54 L46 30 L48 42 L56 40 L52 16 L42 12 C40 16 36 18 32 18 C28 18 24 16 22 12 Z" />
      <path d="M27 12 L32 18 L37 12" />
      <path d="M32 18 L32 54" />
      <path d="M21 44 L27 44" />
      <path d="M37 44 L43 44" />
    </>
  ),
  coat: (
    <>
      <path d="M21 10 L10 16 L7 56 L25 56 L28 24 L32 20 L36 24 L39 56 L57 56 L54 16 L43 10 C41 15 37 17 32 17 C27 17 23 15 21 10 Z" />
      <circle cx="32" cy="32" r="2" fill="currentColor" stroke="none" />
      <circle cx="32" cy="42" r="2" fill="currentColor" stroke="none" />
    </>
  ),
  down: (
    <>
      <path d="M20 12 L11 15 L8 38 L15 40 L17 30 L17 54 L47 54 L47 30 L49 40 L56 38 L53 15 L44 12 C42 16 37 18 32 18 C27 18 22 16 20 12 Z" />
      <path d="M26 12 L32 16 L38 12" />
      <path d="M17 26 L47 26" />
      <path d="M17 34 L47 34" />
      <path d="M17 42 L47 42" />
      <path d="M17 50 L47 50" />
    </>
  ),
  scarf: (
    <>
      <path d="M17 22 C17 12 47 12 47 22 C47 29 40 31 32 31 C24 31 17 29 17 22 Z" />
      <path d="M22 27 L20 47 L30 47 L28 27" />
      <path d="M36 27 L38 44 L48 44 L46 27" />
      <path d="M22 47 L22 52 M26 47 L26 52 M30 47 L30 52" />
      <path d="M40 44 L40 49 M44 44 L44 49 M48 44 L48 49" />
    </>
  ),
  raincoat: (
    <>
      <path d="M22 10 L11 15 L8 54 L56 54 L53 15 L42 10 C40 15 37 17 32 17 C27 17 24 15 22 10 Z" />
      <path d="M24 10 C24 3 40 3 40 10" />
      <path d="M32 26 C32 26 28 31 28 34 A4 4 0 0 0 36 34 C36 31 32 26 32 26 Z" />
    </>
  ),
  umbrella: (
    <>
      <path d="M32 5 C17 5 6 16 6 30 C10 26 15 26 19.3 30 C23.7 34 27.7 34 32 30 C36.3 34 40.3 34 44.7 30 C49 26 54 26 58 30 C58 16 47 5 32 5 Z" />
      <path d="M32 30 L32 48 C32 54 25 54 25 49" />
    </>
  ),
  shorts: (
    <>
      <path d="M14 10 L50 10 L56 34 L42 38 L34 20 L30 20 L22 38 L8 34 Z" />
      <path d="M14 16 L50 16" />
    </>
  ),
  pants: (
    <>
      <path d="M19 8 L45 8 L52 56 L38 56 L32 26 L26 56 L12 56 Z" />
      <path d="M19 14 L45 14" />
    </>
  ),
};

export function GarmentIcon({
  name,
  size = 64,
  className,
}: {
  name: IconKey;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={3.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {GLYPHS[name]}
    </svg>
  );
}

/** 按最终层数取用服饰组合；雨天追加伞 */
export function garmentsFor(layers: number, rain: boolean): IconKey[] {
  const t = Math.round(layers * 2) / 2;
  let list: IconKey[];
  if (t <= 1) list = ['tshirt', 'shorts'];
  else if (t <= 1.5) list = ['tshirt', 'jacket'];
  else if (t <= 2) list = ['longsleeve', 'pants'];
  else if (t <= 2.5) list = ['hoodie', 'jacket'];
  else if (t <= 3) list = ['sweater', 'coat', 'pants'];
  else if (t <= 3.5) list = ['coat', 'scarf', 'pants'];
  else list = ['down', 'scarf', 'pants'];
  return rain ? [...list, 'umbrella'] : list;
}
