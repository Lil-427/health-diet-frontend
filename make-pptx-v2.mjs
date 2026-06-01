import PptxGenJS from 'pptxgenjs';

const p = new PptxGenJS();
p.layout = 'LAYOUT_16x9';
p.author = '李黎凤';
p.title = '智能健康饮食系统的设计与实现';

const C = {
  primary: '1B4F72', dark: '1e272e', gray: '5D6D7E', light: 'AAB7B8',
  accent: '27AE60', accent2: '3498DB', accent3: 'E67E22', accent4: '8E44AD',
  white: 'FFFFFF', bg: 'F4F6F7', border: 'D5D8DC',
};
const F = { title: 'Arial', body: 'Arial', mono: 'Courier New' };

function footer(s, n) { s.addText(String(n), { x: 9.3, y: 5.2, w: 0.4, h: 0.25, fontSize: 7, color: C.light, fontFace: F.body, align: 'right' }); }

function titleBar(s, t, sub) {
  s.addShape(p.ShapeType.rect, { x: 0, y: 0, w: 10, h: 0.92, fill: { color: C.primary } });
  s.addText(t, { x: 0.5, y: 0.1, w: 8.5, h: 0.48, fontSize: 19, bold: true, color: C.white, fontFace: F.title });
  if (sub) s.addText(sub, { x: 0.5, y: 0.55, w: 8.5, h: 0.28, fontSize: 9, color: C.light, fontFace: F.body });
}

// Create an image placeholder box with label
function imgPlace(s, x, y, w, h, label, sublabel) {
  s.addShape(p.ShapeType.rect, { x, y, w, h, fill: { color: C.bg }, line: { color: C.border, width: 1, dashType: 'dash' }, rectRadius: 0.04 });
  s.addText(label, { x, y, w, h, fontSize: 10, color: C.light, fontFace: F.body, align: 'center', valign: 'middle' });
  if (sublabel) s.addText(sublabel, { x, y: y + h * 0.45, w, h: h * 0.4, fontSize: 7, color: C.light, fontFace: F.mono, align: 'center' });
}

// Card with icon/emoji
function card(s, x, y, w, h, icon, title, desc, color) {
  s.addShape(p.ShapeType.rect, { x, y, w, h, fill: { color: C.white }, shadow: { type: 'outer', blur: 3, offset: 1, color: '000000', opacity: 0.06 }, rectRadius: 0.06 });
  s.addShape(p.ShapeType.rect, { x, y, w, h: 0.05, fill: { color: color || C.accent } });
  if (icon) {
    s.addShape(p.ShapeType.roundRect, { x: x + 0.1, y: y + 0.1, w: 0.38, h: 0.38, fill: { color: color || C.accent, transparency: 85 }, rectRadius: 0.05 });
    s.addText(icon, { x: x + 0.1, y: y + 0.1, w: 0.38, h: 0.38, fontSize: 14, fontFace: F.body, align: 'center', valign: 'middle' });
  }
  s.addText(title, { x: x + 0.55, y: y + 0.08, w: w - 0.7, h: 0.22, fontSize: 11, bold: true, color: C.dark, fontFace: F.title });
  s.addText(desc, { x: x + 0.15, y: y + 0.5, w: w - 0.3, h: h - 0.55, fontSize: 8.5, color: C.gray, fontFace: F.body, lineSpacing: 14 });
}

// Big number stat
function stat(s, x, y, num, label, color) {
  s.addText(num, { x, y, w: 1.8, h: 0.5, fontSize: 26, bold: true, color: color || C.primary, fontFace: F.title });
  s.addText(label, { x, y: y + 0.48, w: 1.8, h: 0.22, fontSize: 8, color: C.gray, fontFace: F.body });
}

let n = 0;

// ========== 1. 封面 ==========
{
  const s = p.addSlide();
  s.addShape(p.ShapeType.rect, { x: 0, y: 0, w: 10, h: 5.63, fill: { color: C.primary } });
  // Decorative circles
  s.addShape(p.ShapeType.ellipse, { x: 7.5, y: -2, w: 6, h: 6, fill: { color: C.white, transparency: 95 } });
  s.addShape(p.ShapeType.ellipse, { x: -2, y: 3, w: 5, h: 5, fill: { color: C.white, transparency: 96 } });
  s.addText('毕 设 答 辩', { x: 0, y: 0.9, w: 10, h: 0.4, fontSize: 13, color: C.accent, fontFace: F.title, align: 'center', charSpacing: 8 });
  s.addText('智能健康饮食系统的\n设计与实现', { x: 0.6, y: 1.4, w: 8.8, h: 1.4, fontSize: 30, bold: true, color: C.white, fontFace: F.title, align: 'center', lineSpacing: 50 });
  s.addShape(p.ShapeType.rect, { x: 3.5, y: 2.95, w: 3, h: 0.025, fill: { color: C.accent } });
  s.addText('基于 Vue + Spring Boot + DeepSeek AI 的全栈健康管理平台', { x: 0, y: 3.15, w: 10, h: 0.35, fontSize: 11, color: C.light, fontFace: F.body, align: 'center' });
  s.addText([
    { text: '计算机学院 · 软件工程 · 23软件本科5班\n', options: { fontSize: 10 } },
    { text: '李黎凤  ·  2023103040013\n', options: { fontSize: 10 } },
    { text: '2026年5月', options: { fontSize: 9, color: C.light } },
  ], { x: 0, y: 3.7, w: 10, h: 1.2, color: C.white, fontFace: F.body, align: 'center' });
}

// ========== 2. 目录 ==========
{
  const s = p.addSlide();
  titleBar(s, '目  录', 'CONTENTS');
  const toc = [
    ['01', '项目背景与意义', '为什么要做这个系统'],
    ['02', '技术栈与需求分析', '用什么技术 · 做什么功能'],
    ['03', '系统设计', '架构 · 数据库 · API · 安全'],
    ['04', '系统实现', '用户 · 饮食 · 统计 · AI 核心模块'],
    ['05', 'AI 智能分析（亮点）', 'DeepSeek 集成 · Prompt 工程 · 个性化方案'],
    ['06', '系统测试与总结', '测试结果 · 项目总结 · 展望'],
  ];
  toc.forEach(([num, t, sub], i) => {
    const y = 1.3 + i * 0.6;
    s.addShape(p.ShapeType.rect, { x: 1.2, y, w: 0.45, h: 0.4, fill: { color: C.primary }, rectRadius: 0.05 });
    s.addText(num, { x: 1.2, y, w: 0.45, h: 0.4, fontSize: 13, bold: true, color: C.white, fontFace: F.title, align: 'center' });
    s.addText(t, { x: 1.85, y: y + 0.02, w: 5, h: 0.24, fontSize: 13, bold: true, color: C.dark, fontFace: F.title });
    s.addText(sub, { x: 1.85, y: y + 0.25, w: 5, h: 0.2, fontSize: 9, color: C.gray, fontFace: F.body });
  });
  // Right: decorative image placeholder
  imgPlace(s, 7.3, 1.3, 2.2, 2.8, '插图: 系统首页截图', '可插入系统主界面截图');
}

// ========== 3. 项目背景 ==========
{
  const s = p.addSlide();
  titleBar(s, '项目背景', 'BACKGROUND');
  // Left column: text
  s.addText('社会现状', { x: 0.4, y: 1.15, w: 5, h: 0.25, fontSize: 12, bold: true, color: C.primary, fontFace: F.title });
  const bullets = [
    '我国居民膳食结构不合理，超重肥胖率持续上升',
    '大多数人缺乏专业营养学知识，难以科学管理饮食',
    '现有健康App依赖静态数据库，缺乏AI实时分析',
    '面向中国饮食习惯的专业AI饮食工具几乎为零',
  ];
  bullets.forEach((b, i) => {
    s.addShape(p.ShapeType.ellipse, { x: 0.5, y: 1.55 + i * 0.35, w: 0.12, h: 0.12, fill: { color: C.accent } });
    s.addText(b, { x: 0.75, y: 1.45 + i * 0.35, w: 4.5, h: 0.3, fontSize: 10, color: C.dark, fontFace: F.body });
  });

  s.addText('技术机遇', { x: 0.4, y: 2.9, w: 5, h: 0.25, fontSize: 12, bold: true, color: C.primary, fontFace: F.title });
  s.addText([
    { text: '大语言模型（LLM）已具备理解和分析复杂营养数据的能力。\n', options: { fontSize: 10 } },
    { text: 'DeepSeek 等国产大模型崛起，为 AI + 健康管理带来新机遇。', options: { fontSize: 10 } },
  ], { x: 0.5, y: 3.2, w: 4.8, h: 0.6, color: C.dark, fontFace: F.body, lineSpacing: 20 });

  // Right column: 4 KPI stats + image space
  const kpis = [
    { v: '50%+', l: '超重肥胖率', c: C.accent3 },
    { v: '1.4亿+', l: '健康App全球用户', c: C.accent2 },
    { v: '95%+', l: '无AI分析', c: C.accent4 },
    { v: '0', l: '中国AI饮食工具', c: C.primary },
  ];
  kpis.forEach((k, i) => {
    stat(s, 5.8 + (i % 2) * 1.9, 1.15 + Math.floor(i / 2) * 1.0, k.v, k.l, k.c);
  });
  imgPlace(s, 5.8, 3.2, 3.7, 1.5, '图: 居民膳食结构 / 市场数据', '可插入数据图表或信息图');
  footer(s, ++n);
}

// ========== 4. 技术栈 ==========
{
  const s = p.addSlide();
  titleBar(s, '技术栈与开发环境', 'TECH STACK');
  const cols = [
    { title: '前端技术', color: C.accent2, items: ['Vue 3 + Composition API', 'Vite 5.4 构建工具', 'Element Plus UI库', 'Tailwind CSS 原子化CSS', 'ECharts 5.5 可视化', 'Axios + Pinia + Vue Router'] },
    { title: '后端技术', color: C.accent, items: ['Spring Boot 2.7.18', 'MyBatis-Plus 3.5.7', 'Spring Security + JWT', 'BCrypt 密码加密', 'DeepSeek API 集成', 'RestTemplate HTTP调用'] },
    { title: '基础设施', color: C.accent3, items: ['MySQL 5.7.44 数据库', 'OpenJDK 17 / Maven 3.8', 'Node.js 24 / pnpm', 'IntelliJ IDEA / VS Code', 'Navicat / Postman', 'Windows 11 环境'] },
  ];
  cols.forEach((col, i) => {
    const x = 0.3 + i * 3.2;
    s.addShape(p.ShapeType.rect, { x, y: 1.1, w: 3.0, h: 0.42, fill: { color: col.color }, rectRadius: 0.04 });
    s.addText(col.title, { x, y: 1.1, w: 3.0, h: 0.42, fontSize: 12, bold: true, color: C.white, fontFace: F.title, align: 'center' });
    col.items.forEach((item, j) => {
      s.addShape(p.ShapeType.ellipse, { x: x + 0.15, y: 1.7 + j * 0.38, w: 0.08, h: 0.08, fill: { color: col.color } });
      s.addText(item, { x: x + 0.3, y: 1.6 + j * 0.38, w: 2.5, h: 0.28, fontSize: 9, color: C.dark, fontFace: F.body });
    });
  });
  // Bottom bar + image placeholder
  s.addShape(p.ShapeType.rect, { x: 0.3, y: 4.1, w: 9.4, h: 0.35, fill: { color: C.bg }, rectRadius: 0.04 });
  s.addText('架构: B/S 前后端分离  |  API: RESTful · 17个端点  |  认证: JWT Bearer Token (HS256 · 7天)  |  数据: JSON', {
    x: 0.5, y: 4.1, w: 9.0, h: 0.35, fontSize: 8.5, color: C.gray, fontFace: F.mono
  });
  imgPlace(s, 0.3, 4.55, 9.4, 0.7, '图: 开发环境 / IDE 截图 / 技术架构总览', '可省略或插入开发工具截图拼贴');
  footer(s, ++n);
}

// ========== 5. 需求分析 — 功能模块 ==========
{
  const s = p.addSlide();
  titleBar(s, '需求分析 — 功能模块', 'REQUIREMENTS');
  const mods = [
    { t: '用户管理', icon: '👤', items: '注册 · 登录\nJWT Token认证\n个人资料编辑\n头像上传 · 密码修改', c: C.accent2 },
    { t: '饮食记录', icon: '🍽', items: '增删改查记录\n早餐/午餐/晚餐/加餐\nAI自动填充营养\n当日营养汇总', c: C.accent },
    { t: '数据统计', icon: '📊', items: '热量趋势(7/30/90天)\n营养素占比饼图\n饮食日历热力图\n日均摄入分析', c: C.accent3 },
    { t: 'AI 智能分析', icon: '🤖', items: '手动食物AI分析\n每日饮食评估\n个性化饮食建议\n分析历史管理', c: C.accent4 },
    { t: '个人中心', icon: '⚙', items: '信息查看与编辑\n密码修改\nAI营养师建议\n健康目标管理', c: C.primary },
  ];
  mods.forEach((m, i) => {
    const x = 0.25 + i * 1.92;
    s.addShape(p.ShapeType.rect, { x, y: 1.1, w: 1.78, h: 2.7, fill: { color: C.white }, shadow: { type: 'outer', blur: 3, offset: 1, color: '000000', opacity: 0.05 }, rectRadius: 0.06 });
    s.addShape(p.ShapeType.rect, { x, y: 1.1, w: 1.78, h: 0.5, fill: { color: m.c }, rectRadius: 0.04 });
    s.addText(m.icon, { x, y: 1.1, w: 0.6, h: 0.5, fontSize: 16, fontFace: F.body, align: 'center', valign: 'middle' });
    s.addText(m.t, { x: 0.6, y: 1.1, w: 1.1, h: 0.5, fontSize: 11, bold: true, color: C.white, fontFace: F.title });
    m.items.split('\n').forEach((item, j) => {
      s.addText(item, { x: x + 0.1, y: 1.75 + j * 0.38, w: 1.58, h: 0.32, fontSize: 8, color: C.gray, fontFace: F.body });
    });
  });
  // Permission note
  s.addShape(p.ShapeType.rect, { x: 0.3, y: 3.95, w: 9.4, h: 0.35, fill: { color: C.bg }, rectRadius: 0.04 });
  s.addText('权限: 未登录→注册/登录  |  已登录→全部功能 (JWT)  |  数据隔离: 用户只能操作自己的记录', {
    x: 0.5, y: 3.95, w: 9.0, h: 0.35, fontSize: 8.5, color: C.gray, fontFace: F.mono
  });
  // Image: use case diagram
  imgPlace(s, 0.3, 4.4, 9.4, 0.9, '图 3.1 系统用例图', '可插入用例图 / 功能结构图');
  footer(s, ++n);
}

// ========== 6. 系统架构 ==========
{
  const s = p.addSlide();
  titleBar(s, '系统架构设计', 'ARCHITECTURE');
  const layers = [
    { n: '表示层', tech: 'Vue 3 + Element Plus + Tailwind CSS + ECharts', sub: 'Vite · Pinia · Vue Router · Axios', c: C.accent2 },
    { n: '控制层', tech: 'AuthController · UserController · FoodRecordController · StatsController · AiController', sub: '5个Controller · 请求路由 · 参数校验 · JSON响应', c: C.accent },
    { n: '业务逻辑层', tech: 'UserService · FoodRecordService · StatsService · AiNutritionService', sub: '核心业务逻辑 · BCrypt · 营养计算 · AI调用 · 数据校验', c: C.accent3 },
    { n: '数据访问层', tech: 'UserMapper · FoodRecordMapper · AiAnalysisLogMapper', sub: 'MyBatis-Plus · Lambda查询 · 分页 · 聚合SQL', c: C.accent4 },
    { n: '数据层', tech: 'MySQL 5.7 (health_db)  +  DeepSeek API (外部AI)', sub: '3表+1视图 · InnoDB · utf8mb4 · AI双模式(Mock降级)', c: C.primary },
  ];
  layers.forEach((l, i) => {
    const y = 1.1 + i * 0.65;
    const x = 0.5 + i * 0.22;
    const w = 7.8 - i * 0.44;
    s.addShape(p.ShapeType.rect, { x, y, w, h: 0.52, fill: { color: l.c }, rectRadius: 0.04 });
    s.addText(`${i + 1}. ${l.n}`, { x: x + 0.1, y: y + 0.02, w: 2.0, h: 0.22, fontSize: 10, bold: true, color: C.white, fontFace: F.title });
    s.addText(l.tech, { x: x + 0.1, y: y + 0.26, w: w - 0.3, h: 0.22, fontSize: 7.5, color: C.white, fontFace: F.body, transparency: 15 });
  });
  // Right: image placeholder for architecture diagram
  imgPlace(s, 8.5, 1.1, 1.2, 3.1, '图 4.2\n系统\n架构图', '竖版');
  // Bottom: architecture note
  s.addShape(p.ShapeType.rect, { x: 0.5, y: 4.45, w: 9.0, h: 0.35, fill: { color: C.bg }, rectRadius: 0.04 });
  s.addText('特点: 前后端完全解耦 · RESTful标准接口 · JSON数据交互 · JWT无状态认证 · 分层职责清晰 · 高内聚低耦合', {
    x: 0.7, y: 4.45, w: 8.6, h: 0.35, fontSize: 8.5, color: C.gray, fontFace: F.mono
  });
  imgPlace(s, 0.5, 4.85, 9.0, 0.45, '图 4.1 系统功能结构图 (可选)', '');
  footer(s, ++n);
}

// ========== 7. 数据库设计 ==========
{
  const s = p.addSlide();
  titleBar(s, '数据库设计', 'DATABASE DESIGN');
  const tables = [
    { n: 'user (用户表)', c: C.accent2, f: 'id PK · username(VARCHAR10) · password(BCrypt) · height · weight · goal · gender · age · avatar · create_time' },
    { n: 'food_record (饮食记录)', c: C.accent, f: 'id PK · user_id FK · food_name · calories · protein · carbs · fat · meal_type(breakfast/lunch/dinner/snack) · record_date' },
    { n: 'ai_analysis_log (AI日志)', c: C.accent3, f: 'id PK · user_id FK · food_name · analysis_type(manual/diet) · calories · protein · carbs · fat · advice(TEXT) · details(JSON)' },
  ];
  tables.forEach((t, i) => {
    const y = 1.1 + i * 0.85;
    s.addShape(p.ShapeType.rect, { x: 0.3, y, w: 6.5, h: 0.7, fill: { color: C.white }, shadow: { type: 'outer', blur: 2, offset: 1, color: '000000', opacity: 0.04 }, rectRadius: 0.05 });
    s.addShape(p.ShapeType.rect, { x: 0.3, y, w: 0.04, h: 0.7, fill: { color: t.c } });
    s.addShape(p.ShapeType.rect, { x: 0.45, y: y + 0.06, w: 1.5, h: 0.26, fill: { color: t.c }, rectRadius: 0.03 });
    s.addText(t.n, { x: 0.45, y: y + 0.06, w: 1.5, h: 0.26, fontSize: 9, bold: true, color: C.white, fontFace: F.mono, align: 'center' });
    s.addText(t.f, { x: 2.1, y: y + 0.1, w: 4.5, h: 0.5, fontSize: 8, color: C.dark, fontFace: F.mono, lineSpacing: 14 });
  });

  // Right: ER diagram placeholder
  imgPlace(s, 7.1, 1.1, 2.6, 2.5, '图 4.3\n系统 E-R 图', 'User 1:N FoodRecord\nUser 1:N AiAnalysisLog');

  // Bottom: API summary
  s.addShape(p.ShapeType.rect, { x: 0.3, y: 3.8, w: 6.5, h: 0.46, fill: { color: C.bg }, rectRadius: 0.04 });
  s.addText([
    { text: '17个 RESTful API 端点  ·  5大分类\n', options: { bold: true, fontSize: 9 } },
    { text: '认证: POST register/login · 用户: GET/PUT profile · 饮食: CRUD /food/record · 统计: GET calorie-trend/nutrient-ratio · AI: POST analyze + GET history', options: { fontSize: 8 } },
  ], { x: 0.5, y: 3.8, w: 6.1, h: 0.46, color: C.dark, fontFace: F.mono, lineSpacing: 14 });

  // Images: ER + API table
  imgPlace(s, 7.1, 3.8, 2.6, 1.0, '图 4.1 / 表 4.1\nAPI接口表', '可插入API接口表截图');
  imgPlace(s, 0.3, 4.4, 6.5, 0.9, '截图: Navicat 数据表结构', '可插入 user/food_record/ai_analysis_log 表结构截图');
  footer(s, ++n);
}

// ========== 8. 用户管理 + 饮食记录 实现 ==========
{
  const s = p.addSlide();
  titleBar(s, '系统实现 — 用户管理与饮食记录', 'IMPLEMENTATION 1/3');
  // Left card
  card(s, 0.3, 1.1, 4.5, 1.9, '👤', '用户管理模块', '注册: BCrypt加密存储，用户名唯一性校验\n登录: JWT Token生成(HS256/7天)，Pinia Store存储\n认证: JwtAuthFilter拦截，解析userId注入Request\n安全: Service层数据所有权校验，用户A无法访问B的数据\n头像: Multipart文件上传 + Base64两种方式', C.accent2);
  // Right card
  card(s, 5.2, 1.1, 4.5, 1.9, '🍽', '饮食记录模块', 'CRUD: POST/GET/PUT/DELETE /api/food/record\n分组: 早餐/午餐/晚餐/加餐 四餐次展示\n汇总: 聚合SQL实时计算当日营养总量\nAI填充: 未填营养数据时自动调用AI分析补全\n安全: 修改/删除前校验record.userId === token.userId', C.accent);

  // Bottom: image placeholders for UI screenshots
  imgPlace(s, 0.3, 3.2, 2.9, 1.7, '图 5.1 注册/登录界面', '可插入登录页面截图');
  imgPlace(s, 3.4, 3.2, 2.9, 1.7, '图 5.2 饮食记录页面', '可插入饮食记录页面截图');
  imgPlace(s, 6.5, 3.2, 2.9, 1.7, '图 5.3 个人中心页面', '可插入个人中心页面截图');
  footer(s, ++n);
}

// ========== 9. 数据统计 实现 ==========
{
  const s = p.addSlide();
  titleBar(s, '系统实现 — 数据统计模块', 'IMPLEMENTATION 2/3');
  // Left
  s.addShape(p.ShapeType.rect, { x: 0.3, y: 1.1, w: 4.5, h: 2.3, fill: { color: C.white }, shadow: { type: 'outer', blur: 3, offset: 1, color: '000000', opacity: 0.05 }, rectRadius: 0.06 });
  s.addShape(p.ShapeType.rect, { x: 0.3, y: 1.1, w: 4.5, h: 0.4, fill: { color: C.accent3 } });
  s.addText('卡路里趋势 · ECharts 折线图', { x: 0.3, y: 1.1, w: 4.5, h: 0.4, fontSize: 10, bold: true, color: C.white, fontFace: F.title, align: 'center' });
  s.addText([
    '• food_record 按日期 GROUP BY 聚合每日总热量\n',
    '• 支持 7天 / 30天 / 90天 三种时间范围切换\n',
    '• 无记录日期自动补零\n',
    '• 虚线标注目标摄入量参考线\n',
    '• 面积填充 + 渐变色彩渲染\n',
    '• 计算日均摄入 + 趋势方向 (上升/下降/平稳)',
  ].join(''), { x: 0.45, y: 1.6, w: 4.2, h: 1.7, fontSize: 9, color: C.dark, fontFace: F.body, lineSpacing: 19 });

  // Right
  s.addShape(p.ShapeType.rect, { x: 5.2, y: 1.1, w: 4.5, h: 2.3, fill: { color: C.white }, shadow: { type: 'outer', blur: 3, offset: 1, color: '000000', opacity: 0.05 }, rectRadius: 0.06 });
  s.addShape(p.ShapeType.rect, { x: 5.2, y: 1.1, w: 4.5, h: 0.4, fill: { color: C.accent4 } });
  s.addText('营养素比例 · ECharts 饼图', { x: 5.2, y: 1.1, w: 4.5, h: 0.4, fontSize: 10, bold: true, color: C.white, fontFace: F.title, align: 'center' });
  s.addText([
    '• 汇总当日蛋白质 / 碳水 / 脂肪克数\n',
    '• 换算: 蛋白质 4kcal/g · 碳水 4kcal/g · 脂肪 9kcal/g\n',
    '• 环形饼图 · 三色区分 (绿/橙/紫)\n',
    '• 标注百分比 + 对应热量值\n',
    '• 附加: 饮食日历热力图 — 批量载入近90天数据\n',
    '  四色标记: 🟢良好 / 🟠偏高 / 🟣偏低 / ⚪无记录',
  ].join(''), { x: 5.35, y: 1.6, w: 4.2, h: 1.7, fontSize: 9, color: C.dark, fontFace: F.body, lineSpacing: 17 });

  // Image placeholders
  imgPlace(s, 0.3, 3.6, 4.5, 1.5, '图 5.4 数据统计页面 — 卡路里趋势折线图', '可插入 Dashboard 页面截图 (趋势图部分)');
  imgPlace(s, 5.2, 3.6, 4.5, 1.5, '图 5.5 数据统计页面 — 营养素比例饼图 + 饮食日历', '可插入 Dashboard 页面截图 (饼图+日历部分)');
  footer(s, ++n);
}

// ========== 10. AI 分析 — 核心亮点 ==========
{
  const s = p.addSlide();
  titleBar(s, 'AI 智能分析模块 — 核心亮点', 'IMPLEMENTATION 3/3 · AI ANALYSIS');
  // 6-step flow
  const steps = [
    ['① 用户输入', '食物名称\n或选择日期'],
    ['② 构建Prompt', '注入用户画像\n(身高/体重/目标)'],
    ['③ 路由判断', 'API Key\n是否已配置?'],
    ['④ 调用AI', 'DeepSeek Chat\n/ Mock降级'],
    ['⑤ 解析结果', 'JSON提取\n营养数据+建议'],
    ['⑥ 存储展示', '去重写入DB\n前端渲染'],
  ];
  steps.forEach((st, i) => {
    const x = 0.15 + i * 1.62;
    s.addShape(p.ShapeType.rect, { x, y: 1.1, w: 1.48, h: 1.05, fill: { color: C.white }, shadow: { type: 'outer', blur: 2, offset: 1, color: '000000', opacity: 0.04 }, rectRadius: 0.05 });
    s.addShape(p.ShapeType.ellipse, { x: x + 0.44, y: 1.0, w: 0.6, h: 0.6, fill: { color: C.primary } });
    s.addText(String(i + 1), { x: x + 0.44, y: 1.0, w: 0.6, h: 0.6, fontSize: 16, bold: true, color: C.white, fontFace: F.title, align: 'center', valign: 'middle' });
    s.addText(st[0], { x, y: 1.7, w: 1.48, h: 0.22, fontSize: 8, bold: true, color: C.dark, fontFace: F.title, align: 'center' });
    s.addText(st[1], { x, y: 1.92, w: 1.48, h: 0.28, fontSize: 7, color: C.gray, fontFace: F.body, align: 'center', lineSpacing: 12 });
    if (i < 5) s.addText('▸', { x: x + 1.48, y: 1.3, w: 0.14, h: 0.3, fontSize: 11, color: C.primary, fontFace: F.body, align: 'center' });
  });

  // Three modes
  const modes = [
    { t: '手动食物分析', d: '输入食物名 → Prompt注入用户画像 → API分析 → 热量+蛋白+碳水+脂肪+微量元素+建议 → 去重存储', m: 'DSeek-R1/V3' },
    { t: '每日饮食评估', d: '查询当日记录 → 按早/午/晚/加餐分组 → 识别缺失餐次 → API返回评分(优秀~较差)+优点+建议', m: '缺失餐次分析' },
    { t: '个性化饮食建议', d: '用户画像 → Mifflin-St Jeor公式 → BMR/TDEE → 目标调整(减脂×0.8/增肌×1.15) → AI生成方案', m: '12种方案' },
  ];
  modes.forEach((m, i) => {
    const y = 2.4 + i * 0.7;
    s.addShape(p.ShapeType.rect, { x: 0.2, y, w: 6.3, h: 0.58, fill: { color: C.white }, shadow: { type: 'outer', blur: 2, offset: 1, color: '000000', opacity: 0.03 }, rectRadius: 0.04 });
    s.addShape(p.ShapeType.rect, { x: 0.2, y, w: 0.03, h: 0.58, fill: { color: C.primary } });
    s.addText(m.t, { x: 0.35, y: y + 0.03, w: 2.0, h: 0.2, fontSize: 10, bold: true, color: C.primary, fontFace: F.title });
    s.addText(m.d, { x: 0.35, y: y + 0.24, w: 4.8, h: 0.3, fontSize: 7.5, color: C.dark, fontFace: F.body });
    s.addShape(p.ShapeType.rect, { x: 5.5, y: y + 0.1, w: 0.9, h: 0.38, fill: { color: C.bg }, rectRadius: 0.03 });
    s.addText(m.m, { x: 5.5, y: y + 0.1, w: 0.9, h: 0.38, fontSize: 7, bold: true, color: C.gray, fontFace: F.mono, align: 'center', valign: 'middle' });
  });

  // Right: image placeholder
  imgPlace(s, 6.7, 2.4, 3.0, 2.5, '图 5.6 / 5.7\nAI 分析页面截图', '可插入 AiAnalyze 页面截图\n(手动分析 + 饮食分析 + 历史)');

  // Bottom dual mode note
  s.addShape(p.ShapeType.rect, { x: 0.2, y: 4.6, w: 9.6, h: 0.35, fill: { color: C.accent, transparency: 88 }, rectRadius: 0.04 });
  s.addText('★ 双模式架构: 有 API Key → DeepSeek 真实 AI  |  无 API Key → Mock 数据自动降级 (鸡胸肉165/米饭200/苹果95/宫保鸡丁650 kcal)', {
    x: 0.4, y: 4.6, w: 9.2, h: 0.35, fontSize: 9, bold: true, color: C.primary, fontFace: F.mono
  });
  footer(s, ++n);
}

// ========== 11. Prompt 设计 + Mock降级 ==========
{
  const s = p.addSlide();
  titleBar(s, 'Prompt 工程与个性化方案', 'PROMPT ENGINEERING');
  // Left: Prompt
  s.addShape(p.ShapeType.rect, { x: 0.3, y: 1.1, w: 4.5, h: 3.3, fill: { color: C.white }, shadow: { type: 'outer', blur: 3, offset: 1, color: '000000', opacity: 0.04 }, rectRadius: 0.06 });
  s.addShape(p.ShapeType.rect, { x: 0.3, y: 1.1, w: 4.5, h: 0.36, fill: { color: C.primary } });
  s.addText('🎯 Prompt 设计策略', { x: 0.3, y: 1.1, w: 4.5, h: 0.36, fontSize: 10, bold: true, color: C.white, fontFace: F.title, align: 'center' });
  s.addText([
    { text: '系统角色\n', options: { bold: true, fontSize: 10, color: C.primary } },
    { text: '"你是一个熟悉中国人饮食习惯的专业营养师"\n\n', options: { fontSize: 9 } },
    { text: '用户画像注入\n', options: { bold: true, fontSize: 10, color: C.primary } },
    { text: '注入身高/体重/年龄/性别/健康目标\n推断年龄阶段 (成长期/青年/壮年/中老年)\n\n', options: { fontSize: 9 } },
    { text: '输出格式约束\n', options: { bold: true, fontSize: 10, color: C.primary } },
    { text: '严格 JSON · 预定义字段结构\n{isFood, calories, protein, carbs, fat, advice, details[]}\n\n', options: { fontSize: 9 } },
    { text: '中国化特色\n', options: { bold: true, fontSize: 10, color: C.primary } },
    { text: '推荐家常菜: 豆腐 · 鸡蛋 · 青菜 · 清蒸鱼 · 杂粮粥\n避免西式健身餐: 鸡胸肉沙拉 · 蛋白粉', options: { fontSize: 9 } },
  ], { x: 0.5, y: 1.55, w: 4.1, h: 2.8, color: C.dark, fontFace: F.body, lineSpacing: 10 });

  // Right: Personalization matrix
  s.addShape(p.ShapeType.rect, { x: 5.1, y: 1.1, w: 4.6, h: 3.3, fill: { color: C.white }, shadow: { type: 'outer', blur: 3, offset: 1, color: '000000', opacity: 0.04 }, rectRadius: 0.06 });
  s.addShape(p.ShapeType.rect, { x: 5.1, y: 1.1, w: 4.6, h: 0.36, fill: { color: C.accent } });
  s.addText('🧬 12种个性化方案矩阵', { x: 5.1, y: 1.1, w: 4.6, h: 0.36, fontSize: 10, bold: true, color: C.white, fontFace: F.title, align: 'center' });
  s.addText([
    { text: 'Mifflin-St Jeor 公式\n', options: { bold: true, fontSize: 10 } },
    { text: 'BMR = 10×W + 6.25×H − 5×A + G\nTDEE = BMR × 1.375\n\n', options: { fontSize: 8.5, color: C.gray } },
    { text: '4 个年龄阶段\n', options: { bold: true, fontSize: 10 } },
    { text: '成长期(≤25) ｜ 青年(26-35)\n壮年(36-45) ｜ 中老年(>45)\n\n', options: { fontSize: 9 } },
    { text: '3 个健康目标\n', options: { bold: true, fontSize: 10 } },
    { text: '减脂 (×0.8) ｜ 保持 (×1.0) ｜ 增肌 (×1.15)\n\n', options: { fontSize: 9 } },
    { text: '💡 示例: 青年 + 减脂\n', options: { bold: true, fontSize: 9, color: C.primary } },
    { text: '"早餐粥+蛋，午餐米饭减半，多吃青菜瘦肉，\n戒掉宵夜和啤酒，每周快走或跑步3次"', options: { fontSize: 8, color: C.gray } },
  ], { x: 5.3, y: 1.55, w: 4.2, h: 2.8, color: C.dark, fontFace: F.body, lineSpacing: 10 });

  // Bottom images
  imgPlace(s, 0.3, 4.5, 4.5, 0.8, '截图: AI分析"鸡胸肉"返回结果示例', '可插入 AI 手动分析结果截图');
  imgPlace(s, 5.1, 4.5, 4.6, 0.8, '截图: 个人中心 AI 营养师建议', '可插入 Profile 页面 AI建议区截图');
  footer(s, ++n);
}

// ========== 12. 系统测试 ==========
{
  const s = p.addSlide();
  titleBar(s, '系统测试', 'TESTING');
  s.addText('测试方法: 黑盒测试 ｜ 测试用户: testuser / 12345678 ｜ 环境: Windows 11 · Chrome · MySQL 5.7 · SpringBoot:8080 · Vite:5173', {
    x: 0.4, y: 1.1, w: 9.2, h: 0.25, fontSize: 8.5, color: C.gray, fontFace: F.mono
  });

  const data = [
    { m: '用户注册与登录', n: 6, scenes: '注册 · 登录 · 错误密码 · 用户名重复 · Token过期401 · 已登录访问' },
    { m: '饮食记录管理', n: 6, scenes: '新增 · 按日期查询 · AI自动填充 · 修改 · 删除 · 空记录日期' },
    { m: '数据统计分析', n: 4, scenes: '7天趋势 · 30/90天切换 · 营养素饼图 · 空数据状态' },
    { m: 'AI 智能分析', n: 5, scenes: '手动食物分析 · 非食物输入拒绝 · 每日饮食评估 · Mock降级 · 个性建议' },
  ];
  // Header
  s.addShape(p.ShapeType.rect, { x: 0.4, y: 1.5, w: 9.2, h: 0.32, fill: { color: C.primary } });
  ['测试模块', '用例', '结果', '关键验证场景'].forEach((h, i) => {
    s.addText(h, { x: 0.4 + i * [3.2, 0.8, 1.0, 4.2][i], y: 1.5, w: [3.2, 0.8, 1.0, 4.2][i], h: 0.32, fontSize: 9, bold: true, color: C.white, fontFace: F.title, align: 'center' });
  });
  data.forEach((r, i) => {
    const y = 1.82 + i * 0.55;
    const bg = i % 2 === 0 ? C.bg : C.white;
    s.addShape(p.ShapeType.rect, { x: 0.4, y, w: 9.2, h: 0.45, fill: { color: bg }, rectRadius: 0.03 });
    s.addText(r.m, { x: 0.4, y, w: 3.2, h: 0.45, fontSize: 10, bold: true, color: C.dark, fontFace: F.title, align: 'center' });
    s.addText(String(r.n), { x: 3.6, y, w: 0.8, h: 0.45, fontSize: 12, bold: true, color: C.primary, fontFace: F.title, align: 'center' });
    s.addText('✓ 全部通过', { x: 4.4, y, w: 1.0, h: 0.45, fontSize: 10, bold: true, color: C.accent, fontFace: F.title, align: 'center' });
    s.addText(r.scenes, { x: 5.4, y, w: 4.2, h: 0.45, fontSize: 9, color: C.gray, fontFace: F.body });
  });

  // Bottom summary
  s.addShape(p.ShapeType.rect, { x: 0.4, y: 4.3, w: 9.2, h: 0.45, fill: { color: C.accent, transparency: 88 }, rectRadius: 0.05 });
  s.addText('✅  21个测试用例全部通过  ·  无严重Bug  ·  系统功能完整稳定  ·  满足验收标准', {
    x: 0.4, y: 4.3, w: 9.2, h: 0.45, fontSize: 12, bold: true, color: C.primary, fontFace: F.title, align: 'center'
  });
  imgPlace(s, 0.4, 4.85, 9.2, 0.45, '截图: Postman 接口测试结果 / 测试用例执行截图 (可选)', '');
  footer(s, ++n);
}

// ========== 13. 项目亮点 + 展望 ==========
{
  const s = p.addSlide();
  titleBar(s, '项目亮点与展望', 'HIGHLIGHTS & OUTLOOK');

  // Highlights — left side
  s.addText('项目亮点', { x: 0.4, y: 1.15, w: 5, h: 0.28, fontSize: 13, bold: true, color: C.primary, fontFace: F.title });
  const highlights = [
    ['AI 深度集成', 'DeepSeek大模型 · 双模式架构 · 永不中断'],
    ['中国化 Prompt', '中国营养师角色设定 · 家常菜推荐导向'],
    ['12种个性化方案', '4年龄阶段 × 3健康目标 · 精准匹配'],
    ['多维数据可视化', 'ECharts趋势图+饼图+日历 · 直观呈现'],
    ['四层安全体系', 'JWT+BCrypt+SpringSecurity+数据隔离'],
    ['前后端分离', '17个RESTful API · 标准JSON · 松耦合'],
    ['工程完整性', '需求→设计→开发→测试 全生命周期'],
  ];
  highlights.forEach((h, i) => {
    const y = 1.5 + i * 0.42;
    s.addShape(p.ShapeType.rect, { x: 0.4, y, w: 0.22, h: 0.22, fill: { color: C.accent }, rectRadius: 0.03 });
    s.addText(String(i + 1), { x: 0.4, y, w: 0.22, h: 0.22, fontSize: 8, bold: true, color: C.white, fontFace: F.title, align: 'center', valign: 'middle' });
    s.addText(h[0], { x: 0.75, y: y - 0.02, w: 2.0, h: 0.24, fontSize: 10, bold: true, color: C.dark, fontFace: F.title });
    s.addText(h[1], { x: 2.8, y: y - 0.02, w: 3.5, h: 0.24, fontSize: 8.5, color: C.gray, fontFace: F.body });
  });

  // Future — right side
  s.addText('未来展望', { x: 6.5, y: 1.15, w: 3, h: 0.28, fontSize: 13, bold: true, color: C.primary, fontFace: F.title });
  const futures = [
    ['📷 图像识别', '拍照自动识别食物\n估算份量，减少手动输入'],
    ['📱 微信小程序', 'uni-app 跨端技术\n覆盖更广用户群体'],
    ['👥 社交功能', '饮食分享 · 好友互动\n健康打卡社区'],
    ['⌚ 可穿戴联动', '对接手表/手环\n运动数据动态调整建议'],
  ];
  futures.forEach((f, i) => {
    const x = 6.5 + (i % 2) * 1.8;
    const y = 1.5 + Math.floor(i / 2) * 1.25;
    s.addShape(p.ShapeType.rect, { x, y, w: 1.65, h: 1.1, fill: { color: C.white }, shadow: { type: 'outer', blur: 2, offset: 1, color: '000000', opacity: 0.04 }, rectRadius: 0.06 });
    s.addText(f[0], { x: x + 0.05, y: y + 0.05, w: 1.55, h: 0.28, fontSize: 10, bold: true, color: C.primary, fontFace: F.title });
    s.addText(f[1], { x: x + 0.05, y: y + 0.38, w: 1.55, h: 0.6, fontSize: 8, color: C.gray, fontFace: F.body, lineSpacing: 14 });
  });

  // Bottom image
  imgPlace(s, 0.4, 4.5, 9.2, 0.8, '图: 系统首页 / 主界面全景截图', '可插入系统首页 (Home/Dashboard) 完整截图作为收尾展示');
  footer(s, ++n);
}

// ========== 14. 致谢 ==========
{
  const s = p.addSlide();
  s.addShape(p.ShapeType.rect, { x: 0, y: 0, w: 10, h: 5.63, fill: { color: C.primary } });
  s.addShape(p.ShapeType.ellipse, { x: 7, y: -2.5, w: 7, h: 7, fill: { color: C.white, transparency: 96 } });
  s.addShape(p.ShapeType.ellipse, { x: -3, y: 2, w: 6, h: 6, fill: { color: C.white, transparency: 95 } });
  s.addText('致  谢', { x: 0, y: 1.5, w: 10, h: 0.7, fontSize: 34, bold: true, color: C.white, fontFace: F.title, align: 'center' });
  s.addShape(p.ShapeType.rect, { x: 3.5, y: 2.3, w: 3, h: 0.02, fill: { color: C.accent } });
  s.addText([
    { text: '感谢指导老师在项目开发过程中的悉心指导\n\n', options: { color: C.white } },
    { text: '感谢各位评审老师的宝贵时间和建议\n\n', options: { color: C.white } },
    { text: '恳请各位老师批评指正', options: { color: C.light } },
  ], { x: 1, y: 2.6, w: 8, h: 1.8, fontSize: 14, fontFace: F.title, align: 'center', lineSpacing: 28 });
  s.addText('智能健康饮食系统的设计与实现  ·  李黎凤  ·  软件工程  ·  2023103040013  ·  2026年5月', {
    x: 0, y: 4.7, w: 10, h: 0.3, fontSize: 8, color: C.light, fontFace: F.body, align: 'center'
  });
}

// ===== Save =====
const out = 'D:/javaEE实训+毕设/智能健康饮食/毕设答辩-智能健康饮食系统.pptx';
await p.writeFile({ fileName: out });
console.log('Done: ' + out);
