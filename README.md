# 穿衣层数生成器 · layers.today

> 输入城市，输出「今天穿 2.5 层」——复古海报风穿搭建议，一键保存分享。

一个晚上能上线的纯前端趣味小工具：无注册、无登录、无需任何 API Key。

## 特性

- **3 秒出结果**：输入城市名（支持中文/拼音）→ 下拉候选消歧义 → 生成海报
- **体感温度算法**：以 Open-Meteo 体感温度为唯一主输入，8 档换算 + 风速/雨雪/闷热修正，核心是带完整单测的纯函数
- **毒舌文案库**：每档随机抽，支持「换一个说法」重新随机
- **复古海报**：1080×1440（3:4）固定版式，纸色噪点 + 双线边框 + 印刷错位阴影，自绘 12 个服饰 SVG 图标，雨天自动盖「有雨」章
- **PNG 导出**：`pixelRatio: 2` 高清输出（2160×2880），导出前等待字体加载完成
- **查询历史**：localStorage 持久化最近 20 条，点击回看
- **兜底策略**：请求失败显示重试按钮，并回落展示上次成功结果（离线缓存）
- **等待可退出**：城市搜索和天气查询最长等 10 秒；查询天气时可取消，清空或改输入会立即撤销旧搜索，旧结果不会重新弹出

## 算法：体感温度 → 层数

| 体感温度 | 层数 | 穿搭建议 |
|---|---|---|
| ≥ 32°C | 0.5 层 | 越少越好，出门先找阴影 |
| 27–32 | 1 层 | 短袖短裤，防晒霜算第 0.5 层 |
| 22–27 | 1.5 层 | 短袖 + 薄外套塞包里 |
| 17–22 | 2 层 | 长袖或卫衣 |
| 12–17 | 2.5 层 | 卫衣 + 夹克 |
| 6–12 | 3 层 | 毛衣 + 厚外套 |
| 0–6 | 3.5 层 | 厚外套 + 围巾 |
| < 0 | 4 层+ | 羽绒服，秋裤别侥幸 |

修正项：

- 风速 > 25 km/h → 层数 +0.5，文案追加「风很大」
- 降雨/降雪/雷暴类 WMO 天气码 → 层数 +0.5（上限 5），海报盖「有雨」章
- 湿度 > 85% 且体感 > 28°C → 不加层，文案追加「闷到怀疑人生」
- 命中极端档（< 0 或 ≥ 37°C）→ 彩蛋文案

结果 clamp 到 `[0.5, 5]`。核心代码在 [`src/lib/layers.ts`](src/lib/layers.ts)，单测覆盖每一档的边界值。

## 技术栈

| 项 | 选型 |
|---|---|
| 框架 | Vite + React 18 + TypeScript |
| 样式 | Tailwind CSS v4 |
| 天气 / 城市搜索 | [Open-Meteo](https://open-meteo.com/)（免费、无 Key、支持中文） |
| 海报导出 | html-to-image |
| 测试 | Vitest（61 个用例，含请求与组件回归） |
| 存储 | localStorage |

字体：Noto Serif SC（Google Fonts），回退栈 `"Noto Serif SC", "Songti SC", SimSun, serif`。先渲染系统衬线体，字体到位后热替换。

## 本地开发

```bash
npm install
npm run dev       # 开发，http://localhost:5173
npm test          # 运行 61 个回归测试
npm run build     # 类型检查 + 生产构建
npm run preview   # 预览生产构建
```

## 项目结构

```
src/
├── main.tsx
├── App.tsx                 # useReducer 状态编排
├── types.ts                # City / Weather / LayerResult
├── poster.css              # 海报固定 1080×1440 版式
├── components/
│   ├── CitySearch.tsx      # 300ms 防抖搜索 + 键盘导航下拉
│   ├── PosterCard.tsx      # 海报（固定尺寸 + transform scale 适配）
│   ├── HistoryList.tsx
│   └── Icons.tsx           # 12 个自绘服饰 SVG + 按层数取用
└── lib/
    ├── weather.ts          # Open-Meteo 封装 + WMO 码映射
    ├── layers.ts           # 核心算法（纯函数）
    ├── layers.test.ts      # 边界值单测
    ├── copy.ts             # 毒舌文案库
    ├── copy.test.ts
    └── storage.ts          # 历史（上限 20 条）+ 离线缓存
```

## 部署

纯静态站点，`npm run build` 后把 `dist/` 扔到任意静态托管即可（Vercel / Cloudflare Pages / GitHub Pages 免费额度绰绰有余）。

## Roadmap (v2)

- [ ] Geolocation 自动定位 + 常驻城市记忆
- [ ] PWA + 每日早 8 点 Web Push「今天穿几层」
- [ ] 海报模板切换（病历风 / 卷宗风 / 像素风）
- [ ] URL 直达（`?city=hangzhou`）
- [ ] 扩展指数：带伞指数 / 晾衣指数 / 洗车指数

---

天气数据来自 [Open-Meteo](https://open-meteo.com/)（CC BY 4.0）。手工测量，仅供娱乐。
