import PptxGenJS from 'pptxgenjs';

const p = new PptxGenJS();
p.layout = 'LAYOUT_16x9';
p.author = '李黎凤';
p.title = '智能健康饮食系统的设计与实现';

// Colors
const C = {
  primary: '1a5276', // dark blue
  accent: '2ecc71',  // green
  white: 'FFFFFF',
  black: '1e272e',
  gray: '636e72',
  lightGray: 'b2bec3',
  bg: 'f5f6fa',
  border: 'dcdde1',
};

function slideNum(s, n) {
  s.addText(String(n), { x: 9.2, y: 5.1, w: 0.5, h: 0.3, fontSize: 8, color: C.lightGray, fontFace: 'Arial', align: 'right' });
}

// Helper: add a title bar
function titleBar(s, title, subtitle) {
  s.addShape(p.ShapeType.rect, { x: 0, y: 0, w: 10, h: 1.0, fill: { color: C.primary } });
  s.addText(title, { x: 0.6, y: 0.12, w: 8.5, h: 0.5, fontSize: 20, bold: true, color: C.white, fontFace: 'Arial' });
  if (subtitle) s.addText(subtitle, { x: 0.6, y: 0.58, w: 8.5, h: 0.3, fontSize: 10, color: C.lightGray, fontFace: 'Arial' });
}

let i = 0;

// ====== 1. 封面 ======
{
  const s = p.addSlide();
  s.addShape(p.ShapeType.rect, { x: 0, y: 0, w: 10, h: 5.63, fill: { color: C.primary } });
  s.addShape(p.ShapeType.rect, { x: 0, y: 0, w: 10, h: 5.63, fill: { color: '000000', transparency: 70 } });
  s.addText('毕 设 答 辩', { x: 0, y: 1.0, w: 10, h: 0.5, fontSize: 14, color: C.accent, fontFace: 'Arial', align: 'center' });
  s.addText('智能健康饮食系统的\n设计与实现', { x: 0.8, y: 1.5, w: 8.4, h: 1.5, fontSize: 30, bold: true, color: C.white, fontFace: 'Arial', align: 'center', lineSpacing: 48 });
  s.addShape(p.ShapeType.rect, { x: 4, y: 3.1, w: 2, h: 0.03, fill: { color: C.accent } });
  s.addText('基于 Vue + Spring Boot + DeepSeek AI', { x: 0, y: 3.3, w: 10, h: 0.4, fontSize: 12, color: C.lightGray, fontFace: 'Arial', align: 'center' });
  s.addText([
    { text: '计算机学院 · 软件工程专业 · 23软件本科5班\n', options: { fontSize: 11 } },
    { text: '李黎凤  ·  2023103040013\n', options: { fontSize: 11 } },
    { text: '2026年5月', options: { fontSize: 10, color: C.gray } },
  ], { x: 0, y: 3.9, w: 10, h: 1.0, color: C.white, fontFace: 'Arial', align: 'center' });
}

// ====== 2. 目录 ======
{
  const s = p.addSlide();
  titleBar(s, '目  录', 'CONTENTS');
  const toc = [
    ['01', '项目背景与意义'],
    ['02', '技术栈与开发环境'],
    ['03', '需求分析'],
    ['04', '系统设计'],
    ['05', '核心功能实现'],
    ['06', 'AI智能分析（亮点）'],
    ['07', '系统测试'],
    ['08', '总结与展望'],
  ];
  toc.forEach(([n, t], j) => {
    const y = 1.3 + j * 0.48;
    s.addShape(p.ShapeType.rect, { x: 1.5, y, w: 0.5, h: 0.36, fill: { color: C.primary }, rectRadius: 0.04 });
    s.addText(n, { x: 1.5, y, w: 0.5, h: 0.36, fontSize: 12, bold: true, color: C.white, fontFace: 'Arial', align: 'center' });
    s.addText(t, { x: 2.2, y: y + 0.03, w: 6, h: 0.3, fontSize: 14, color: C.black, fontFace: 'Arial' });
  });
}

// ====== 3. 项目背景 ======
{
  const s = p.addSlide();
  titleBar(s, '项目背景', 'BACKGROUND');
  s.addText('社会现状', { x: 0.6, y: 1.2, w: 3, h: 0.3, fontSize: 13, bold: true, color: C.primary, fontFace: 'Arial' });
  s.addText([
    { text: '• 我国居民膳食结构不合理，超重肥胖率持续上升\n' },
    { text: '• 大多数人缺乏专业营养学知识，难以科学管理饮食\n' },
    { text: '• 现有健康App依赖静态数据库，缺乏AI实时分析能力' },
  ], { x: 0.6, y: 1.5, w: 8.8, h: 1.1, fontSize: 11, color: C.black, fontFace: 'Arial', lineSpacing: 24 });

  s.addText('技术机遇', { x: 0.6, y: 2.7, w: 3, h: 0.3, fontSize: 13, bold: true, color: C.primary, fontFace: 'Arial' });
  s.addText([
    { text: '• 大语言模型已能理解和分析复杂营养数据\n' },
    { text: '• DeepSeek等国产大模型崛起，AI+健康管理成为热门方向\n' },
    { text: '• 面向中国人饮食习惯的专业AI饮食分析工具几乎空白' },
  ], { x: 0.6, y: 3.0, w: 8.8, h: 1.1, fontSize: 11, color: C.black, fontFace: 'Arial', lineSpacing: 24 });

  s.addText('核心数据', { x: 0.6, y: 4.0, w: 3, h: 0.3, fontSize: 13, bold: true, color: C.primary, fontFace: 'Arial' });
  const kpis = [
    { v: '50%+', l: '超重肥胖率' },
    { v: '1.4亿+', l: '健康App全球用户' },
    { v: '95%+', l: '无AI分析能力' },
    { v: '0', l: '中国AI饮食工具' },
  ];
  kpis.forEach((k, j) => {
    const x = 0.6 + j * 2.3;
    s.addShape(p.ShapeType.rect, { x, y: 4.35, w: 2.0, h: 0.8, fill: { color: C.bg }, rectRadius: 0.06 });
    s.addText(k.v, { x, y: 4.35, w: 2.0, h: 0.5, fontSize: 20, bold: true, color: C.primary, fontFace: 'Arial', align: 'center' });
    s.addText(k.l, { x, y: 4.8, w: 2.0, h: 0.3, fontSize: 9, color: C.gray, fontFace: 'Arial', align: 'center' });
  });
  slideNum(s, ++i);
}

// ====== 4. 项目意义 ======
{
  const s = p.addSlide();
  titleBar(s, '项目研究意义', 'SIGNIFICANCE');
  const points = [
    ['健康管理', '帮助用户记录和分析每日饮食，通过可视化数据直观了解自身营养状况'],
    ['技术应用', '将DeepSeek大语言模型应用于营养分析场景，探索AI+医疗健康的实践路径'],
    ['技术实践', '采用业界主流Vue+SpringBoot前后端分离架构，涵盖完整企业级开发流程'],
    ['社会效益', '响应"健康中国2030"国家战略，为大众提供便捷的饮食健康管理工具'],
  ];
  points.forEach(([t, d], j) => {
    const y = 1.3 + j * 0.95;
    s.addShape(p.ShapeType.rect, { x: 0.6, y, w: 8.8, h: 0.78, fill: { color: C.bg }, rectRadius: 0.06 });
    s.addShape(p.ShapeType.rect, { x: 0.6, y, w: 0.05, h: 0.78, fill: { color: C.accent } });
    s.addText(t, { x: 0.85, y: y + 0.05, w: 1.8, h: 0.28, fontSize: 12, bold: true, color: C.primary, fontFace: 'Arial' });
    s.addText(d, { x: 0.85, y: y + 0.35, w: 8.3, h: 0.38, fontSize: 10, color: C.gray, fontFace: 'Arial' });
  });
  slideNum(s, ++i);
}

// ====== 5. 技术栈 ======
{
  const s = p.addSlide();
  titleBar(s, '技术栈与开发环境', 'TECH STACK');
  const cols = [
    ['前端', 'Vue 3 · Vite 5 · Element Plus · Tailwind CSS · ECharts · Axios · Pinia · Vue Router'],
    ['后端', 'Spring Boot 2.7 · MyBatis-Plus 3.5 · Spring Security · JWT (HS256/7天) · BCrypt'],
    ['基础设施', 'MySQL 5.7 · JDK 17 · Maven 3.8 · pnpm · DeepSeek API · IntelliJ IDEA · VS Code'],
  ];
  s.addShape(p.ShapeType.rect, { x: 0.6, y: 1.2, w: 0.05, h: 5.2, fill: { color: C.border } }); // Vertical timeline style
  cols.forEach((c, j) => {
    const y = 1.3 + j * 1.25;
    s.addShape(p.ShapeType.ellipse, { x: 0.43, y: y + 0.1, w: 0.4, h: 0.4, fill: { color: C.primary } });
    s.addText(String(j + 1), { x: 0.43, y: y + 0.1, w: 0.4, h: 0.4, fontSize: 12, bold: true, color: C.white, fontFace: 'Arial', align: 'center' });
    s.addText(c[0], { x: 1.1, y: y, w: 2, h: 0.3, fontSize: 14, bold: true, color: C.primary, fontFace: 'Arial' });
    s.addText(c[1], { x: 1.1, y: y + 0.35, w: 8.3, h: 0.5, fontSize: 10, color: C.gray, fontFace: 'Arial', lineSpacing: 16 });
  });
  // Architecture note
  s.addShape(p.ShapeType.rect, { x: 0.6, y: 4.85, w: 8.8, h: 0.4, fill: { color: C.bg }, rectRadius: 0.04 });
  s.addText('架构: B/S 前后端分离  |  API: RESTful (17个端点)  |  认证: JWT Bearer Token  |  数据交换: JSON', {
    x: 0.8, y: 4.85, w: 8.4, h: 0.4, fontSize: 9, color: C.gray, fontFace: 'Arial'
  });
  slideNum(s, ++i);
}

// ====== 6. 需求分析 ======
{
  const s = p.addSlide();
  titleBar(s, '需求分析 — 功能模块', 'REQUIREMENTS');
  const mods = [
    { t: '用户管理', items: '注册登录\nJWT认证\n资料编辑\n头像上传' },
    { t: '饮食记录', items: '增删改查\n早/午/晚/加餐\n按日期分组\nAI自动填充' },
    { t: '数据统计', items: '热量趋势\n(7/30/90天)\n营养素占比\n饼图+日历' },
    { t: 'AI智能分析', items: '手动食物分析\n每日饮食评估\n个性化建议\n12种方案' },
    { t: '个人中心', items: '信息查看/编辑\n密码修改\nAI营养师建议\n健康目标管理' },
  ];
  mods.forEach((m, j) => {
    const x = 0.4 + j * 1.88;
    s.addShape(p.ShapeType.rect, { x, y: 1.2, w: 1.72, h: 3.2, fill: { color: C.bg }, rectRadius: 0.06 });
    s.addShape(p.ShapeType.rect, { x, y: 1.2, w: 1.72, h: 0.4, fill: { color: C.primary } });
    s.addText(m.t, { x, y: 1.2, w: 1.72, h: 0.4, fontSize: 10, bold: true, color: C.white, fontFace: 'Arial', align: 'center' });
    s.addText(m.items, { x: x + 0.1, y: 1.7, w: 1.52, h: 2.5, fontSize: 9, color: C.gray, fontFace: 'Arial', lineSpacing: 20 });
  });
  s.addShape(p.ShapeType.rect, { x: 0.6, y: 4.6, w: 8.8, h: 0.4, fill: { color: C.bg }, rectRadius: 0.04 });
  s.addText('权限: 未登录用户仅可访问注册/登录  |  已登录用户通过JWT使用全部功能  |  用户数据完全隔离', {
    x: 0.8, y: 4.6, w: 8.4, h: 0.4, fontSize: 9, color: C.gray, fontFace: 'Arial'
  });
  slideNum(s, ++i);
}

// ====== 7. 系统架构 ======
{
  const s = p.addSlide();
  titleBar(s, '系统架构设计', 'ARCHITECTURE');
  const layers = [
    ['表示层', 'Vue 3 + Element Plus + Tailwind CSS + ECharts', '路由管理 · 状态管理(Pinia) · HTTP请求(Axios)'],
    ['控制层', 'AuthController · UserController · FoodRecordController · StatsController · AiController', '5个Controller · 接收请求 · 参数校验 · 返回JSON'],
    ['业务逻辑层', 'UserService · FoodRecordService · StatsService · AiNutritionService', '核心业务 · BCrypt加密 · 营养计算 · AI分析调用 · 数据所有权校验'],
    ['数据访问层', 'UserMapper · FoodRecordMapper · AiAnalysisLogMapper', 'MyBatis-Plus · Lambda查询 · 分页插件 · 聚合SQL'],
    ['数据层', 'MySQL 5.7 (health_db) + DeepSeek API', '3张核心表 + 1聚合视图 · InnoDB · utf8mb4 · AI双模式(Mock降级)'],
  ];
  layers.forEach((l, j) => {
    const y = 1.2 + j * 0.78;
    const colors = ['2c3e50', '34495e', '1a5276', '2471a3', '1abc9c'];
    s.addShape(p.ShapeType.rect, { x: 0.6 + j * 0.2, y, w: 8.8 - j * 0.4, h: 0.65, fill: { color: colors[j] }, rectRadius: 0.04 });
    s.addText(l[0], { x: 0.8 + j * 0.2, y: y + 0.04, w: 1.8, h: 0.26, fontSize: 10, bold: true, color: C.white, fontFace: 'Arial' });
    s.addText(l[1], { x: 0.8 + j * 0.2, y: y + 0.32, w: 5.5, h: 0.28, fontSize: 8, color: C.white, fontFace: 'Arial', transparency: 20 });
  });
  s.addText('HTTP/REST/JSON  ↓', { x: 3.8, y: 1.5, w: 2, h: 0.2, fontSize: 8, color: C.lightGray, fontFace: 'Arial', align: 'center' });
  slideNum(s, ++i);
}

// ====== 8. 数据库设计 ======
{
  const s = p.addSlide();
  titleBar(s, '数据库设计', 'DATABASE');
  const tables = [
    ['user', 'id PK, username, password(BCrypt), height, weight, goal, gender, age, avatar, create_time'],
    ['food_record', 'id PK, user_id FK, food_name, calories, protein, carbs, fat, meal_type, record_date'],
    ['ai_analysis_log', 'id PK, user_id FK, food_name, analysis_type, calories, protein, carbs, fat, advice, details(JSON)'],
  ];
  tables.forEach((t, j) => {
    const y = 1.2 + j * 1.1;
    s.addShape(p.ShapeType.rect, { x: 0.6, y, w: 7.0, h: 0.9, fill: { color: C.bg }, rectRadius: 0.06 });
    s.addShape(p.ShapeType.rect, { x: 0.6, y: y + 0.02, w: 1.3, h: 0.3, fill: { color: C.primary }, rectRadius: 0.03 });
    s.addText(t[0], { x: 0.7, y: y + 0.02, w: 1.1, h: 0.3, fontSize: 10, bold: true, color: C.white, fontFace: 'Courier New' });
    s.addText(t[1], { x: 2.1, y: y + 0.1, w: 5.3, h: 0.7, fontSize: 8.5, color: C.black, fontFace: 'Courier New', lineSpacing: 14 });
  });
  // ER
  s.addShape(p.ShapeType.rect, { x: 7.8, y: 1.2, w: 1.6, h: 3.0, fill: { color: C.bg }, rectRadius: 0.06 });
  s.addText('ER 关系', { x: 7.8, y: 1.3, w: 1.6, h: 0.25, fontSize: 10, bold: true, color: C.primary, fontFace: 'Arial', align: 'center' });
  s.addText('User\n  │ 1:N\n  ├─food_record\n  └─ai_analysis_log', { x: 7.8, y: 1.7, w: 1.6, h: 2.2, fontSize: 9, color: C.gray, fontFace: 'Arial', align: 'center', lineSpacing: 16 });
  // API count
  s.addShape(p.ShapeType.rect, { x: 0.6, y: 4.5, w: 8.8, h: 0.5, fill: { color: C.accent, transparency: 85 }, rectRadius: 0.04 });
  s.addText('17个RESTful API · 涵盖: POST注册登录 / GET查询 / PUT更新 / DELETE删除 · JWT Bearer Token认证', {
    x: 0.8, y: 4.5, w: 8.4, h: 0.5, fontSize: 9, bold: true, color: C.primary, fontFace: 'Arial'
  });
  slideNum(s, ++i);
}

// ====== 9. 用户+饮食实现 ======
{
  const s = p.addSlide();
  titleBar(s, '系统实现 — 用户管理与饮食记录', 'IMPLEMENTATION 1/2');
  // Left
  s.addShape(p.ShapeType.rect, { x: 0.4, y: 1.2, w: 4.4, h: 3.7, fill: { color: C.bg }, rectRadius: 0.06 });
  s.addShape(p.ShapeType.rect, { x: 0.4, y: 1.2, w: 4.4, h: 0.38, fill: { color: C.primary } });
  s.addText('用户管理模块', { x: 0.4, y: 1.2, w: 4.4, h: 0.38, fontSize: 11, bold: true, color: C.white, fontFace: 'Arial', align: 'center' });
  s.addText([
    { text: '注册与登录\n', options: { bold: true, fontSize: 10 } },
    { text: '• BCrypt加密存储密码\n• JWT Token (HS256/7天有效)\n• 登录后Token存Pinia Store\n\n', options: { fontSize: 9 } },
    { text: '认证与安全\n', options: { bold: true, fontSize: 10 } },
    { text: '• JwtAuthFilter拦截所有请求\n• 从Token解析userId注入Request\n• Service层校验数据所有权\n\n', options: { fontSize: 9 } },
    { text: '个人资料与头像\n', options: { bold: true, fontSize: 10 } },
    { text: '• 增删改查个人资料(身高/体重/目标)\n• Multipart + Base64两种头像上传', options: { fontSize: 9 } },
  ], { x: 0.6, y: 1.7, w: 4.0, h: 3.1, color: C.black, fontFace: 'Arial', lineSpacing: 12 });

  // Right
  s.addShape(p.ShapeType.rect, { x: 5.2, y: 1.2, w: 4.4, h: 3.7, fill: { color: C.bg }, rectRadius: 0.06 });
  s.addShape(p.ShapeType.rect, { x: 5.2, y: 1.2, w: 4.4, h: 0.38, fill: { color: C.accent } });
  s.addText('饮食记录模块', { x: 5.2, y: 1.2, w: 4.4, h: 0.38, fontSize: 11, bold: true, color: C.white, fontFace: 'Arial', align: 'center' });
  s.addText([
    { text: '核心CRUD操作\n', options: { bold: true, fontSize: 10 } },
    { text: '• POST/GET/PUT/DELETE /api/food/record\n• 按餐次(早/午/晚/加餐)分组展示\n• 聚合查询计算每日营养汇总\n\n', options: { fontSize: 9 } },
    { text: 'AI 自动填充\n', options: { bold: true, fontSize: 10 } },
    { text: '• 用户仅输入食物名称\n• 系统自动调用AI分析接口\n• 返回填充calories/protein/carbs/fat\n• AI失败不阻塞保存\n\n', options: { fontSize: 9 } },
    { text: '数据隔离\n', options: { bold: true, fontSize: 10 } },
    { text: '• 所有操作校验userId\n• 用户只能操作自己的记录', options: { fontSize: 9 } },
  ], { x: 5.4, y: 1.7, w: 4.0, h: 3.1, color: C.black, fontFace: 'Arial', lineSpacing: 12 });
  slideNum(s, ++i);
}

// ====== 10. 数据统计 ======
{
  const s = p.addSlide();
  titleBar(s, '系统实现 — 数据统计模块', 'IMPLEMENTATION 2/2');
  // Left
  s.addShape(p.ShapeType.rect, { x: 0.4, y: 1.2, w: 4.4, h: 3.5, fill: { color: C.bg }, rectRadius: 0.06 });
  s.addShape(p.ShapeType.rect, { x: 0.4, y: 1.2, w: 4.4, h: 0.38, fill: { color: 'e67e22' } });
  s.addText('卡路里趋势 (ECharts折线图)', { x: 0.4, y: 1.2, w: 4.4, h: 0.38, fontSize: 10, bold: true, color: C.white, fontFace: 'Arial', align: 'center' });
  s.addText([
    { text: '• food_record 按日期 GROUP BY 聚合\n\n' },
    { text: '• 支持7天 / 30天 / 90天切换\n\n' },
    { text: '• 无记录日期自动补零\n\n' },
    { text: '• 虚线标注目标摄入量参考线\n\n' },
    { text: '• 面积填充 + 渐变色彩\n\n' },
    { text: '• 日均摄入 + 趋势方向(上升/下降/平稳)' },
  ], { x: 0.55, y: 1.7, w: 4.1, h: 2.8, fontSize: 10, color: C.black, fontFace: 'Arial', lineSpacing: 18 });

  // Right
  s.addShape(p.ShapeType.rect, { x: 5.2, y: 1.2, w: 4.4, h: 3.5, fill: { color: C.bg }, rectRadius: 0.06 });
  s.addShape(p.ShapeType.rect, { x: 5.2, y: 1.2, w: 4.4, h: 0.38, fill: { color: '9b59b6' } });
  s.addText('营养素比例 (ECharts饼图)', { x: 5.2, y: 1.2, w: 4.4, h: 0.38, fontSize: 10, bold: true, color: C.white, fontFace: 'Arial', align: 'center' });
  s.addText([
    { text: '• 汇总当日蛋白质/碳水/脂肪克数\n\n' },
    { text: '• 换算: 蛋白4kcal/g, 碳水4kcal/g, 脂肪9kcal/g\n\n' },
    { text: '• 环形饼图三色区分(绿/橙/紫)\n\n' },
    { text: '• 标注百分比 + 对应热量值\n\n' },
    { text: '附加: 饮食日历热力图\n' },
    { text: '• 批量载入近90天数据\n• 四色标记: 良好/偏高/偏低/无记录' },
  ], { x: 5.35, y: 1.7, w: 4.1, h: 2.8, fontSize: 10, color: C.black, fontFace: 'Arial', lineSpacing: 16 });
  slideNum(s, ++i);
}

// ====== 11. AI分析（核心亮点） ======
{
  const s = p.addSlide();
  titleBar(s, 'AI智能分析模块（核心亮点）', 'AI ANALYSIS · HIGHLIGHT');

  // 6-step flow
  const steps = ['用户输入\n食物名称', '构建Prompt\n注入用户画像', '路由判断\n有Key/无Key?', '调用AI\nDeepSeek/Mock', '解析JSON\n提取营养+建议', '存储展示\n去重写DB'];
  steps.forEach((st, j) => {
    const x = 0.3 + j * 1.58;
    s.addShape(p.ShapeType.rect, { x, y: 1.2, w: 1.42, h: 1.0, fill: { color: C.bg }, rectRadius: 0.05 });
    s.addShape(p.ShapeType.ellipse, { x: x + 0.46, y: 1.1, w: 0.5, h: 0.5, fill: { color: C.primary } });
    s.addText(String(j + 1), { x: x + 0.46, y: 1.1, w: 0.5, h: 0.5, fontSize: 14, bold: true, color: C.white, fontFace: 'Arial', align: 'center' });
    s.addText(st, { x, y: 1.7, w: 1.42, h: 0.5, fontSize: 8, color: C.black, fontFace: 'Arial', align: 'center', lineSpacing: 14 });
    if (j < 5) s.addText('▸', { x: x + 1.42, y: 1.4, w: 0.16, h: 0.3, fontSize: 12, color: C.primary, fontFace: 'Arial', align: 'center' });
  });

  // Three modes
  const modes = [
    ['手动食物分析', '输入食物名 → Prompt注入身高/体重/年龄/目标 → API → 热量+蛋白+碳水+脂肪+微量元素+建议', '支持 DeepSeek-R1 / V3'],
    ['每日饮食评估', '查询当日记录 → 按早/午/晚/加餐分组 → 识别缺失餐次 → 返回评分(优秀~较差)+优点+建议', '未记录餐次自动纳入分析'],
    ['个性化饮食建议', '读取用户画像 → Mifflin-St Jeor公式 → BMR/TDEE → 目标调整 → AI生成个性化方案', '4年龄 × 3目标 = 12种方案'],
  ];
  modes.forEach((m, j) => {
    const y = 2.5 + j * 0.78;
    s.addShape(p.ShapeType.rect, { x: 0.4, y, w: 9.2, h: 0.65, fill: { color: C.bg }, rectRadius: 0.04 });
    s.addShape(p.ShapeType.rect, { x: 0.4, y, w: 0.04, h: 0.65, fill: { color: C.primary } });
    s.addText(m[0], { x: 0.6, y: y + 0.03, w: 2.0, h: 0.24, fontSize: 10, bold: true, color: C.primary, fontFace: 'Arial' });
    s.addText(m[1], { x: 0.6, y: y + 0.3, w: 6.2, h: 0.32, fontSize: 8.5, color: C.black, fontFace: 'Arial' });
    s.addText(m[2], { x: 7.2, y, w: 2.4, h: 0.65, fontSize: 7.5, color: C.gray, fontFace: 'Arial', align: 'center' });
  });

  // Bottom: dual mode
  s.addShape(p.ShapeType.rect, { x: 0.4, y: 4.75, w: 9.2, h: 0.4, fill: { color: C.accent, transparency: 80 }, rectRadius: 0.04 });
  s.addText('★ 双模式架构: 有API Key → 真实DeepSeek AI  |  无API Key → Mock数据自动降级 (鸡胸肉/米饭/苹果/宫保鸡丁)  |  服务永不停', {
    x: 0.6, y: 4.75, w: 8.8, h: 0.4, fontSize: 9, bold: true, color: C.primary, fontFace: 'Arial'
  });
  slideNum(s, ++i);
}

// ====== 12. Prompt 与个性化方案 ======
{
  const s = p.addSlide();
  titleBar(s, 'Prompt 设计与个性化方案', 'PROMPT ENGINEERING');
  // Left: Prompt
  s.addShape(p.ShapeType.rect, { x: 0.4, y: 1.2, w: 4.5, h: 3.8, fill: { color: C.bg }, rectRadius: 0.06 });
  s.addShape(p.ShapeType.rect, { x: 0.4, y: 1.2, w: 4.5, h: 0.36, fill: { color: C.primary } });
  s.addText('Prompt 设计策略', { x: 0.4, y: 1.2, w: 4.5, h: 0.36, fontSize: 11, bold: true, color: C.white, fontFace: 'Arial', align: 'center' });
  s.addText([
    { text: '系统角色设定\n', options: { bold: true, fontSize: 10 } },
    { text: '"熟悉中国人饮食习惯的专业营养师"\n\n', options: { fontSize: 9 } },
    { text: '用户画像注入\n', options: { bold: true, fontSize: 10 } },
    { text: '身高/体重/年龄/性别/健康目标\n年龄阶段推断(成长期~中老年)\n\n', options: { fontSize: 9 } },
    { text: '输出格式约束\n', options: { bold: true, fontSize: 10 } },
    { text: '严格JSON · 预定义字段\nisFood / calories / protein / carbs\nfat / advice / details[]\n\n', options: { fontSize: 9 } },
    { text: '中国化特色\n', options: { bold: true, fontSize: 10 } },
    { text: '推荐家常菜: 豆腐/鸡蛋/青菜/清蒸鱼/杂粮粥\n避免西式健身餐: 鸡胸肉沙拉/蛋白粉', options: { fontSize: 9 } },
  ], { x: 0.6, y: 1.65, w: 4.1, h: 3.2, color: C.black, fontFace: 'Arial', lineSpacing: 12 });

  // Right: Personalization matrix
  s.addShape(p.ShapeType.rect, { x: 5.2, y: 1.2, w: 4.4, h: 3.8, fill: { color: C.bg }, rectRadius: 0.06 });
  s.addShape(p.ShapeType.rect, { x: 5.2, y: 1.2, w: 4.4, h: 0.36, fill: { color: C.accent } });
  s.addText('12种个性化方案矩阵', { x: 5.2, y: 1.2, w: 4.4, h: 0.36, fontSize: 11, bold: true, color: C.white, fontFace: 'Arial', align: 'center' });
  s.addText([
    { text: '营养计算: Mifflin-St Jeor 公式\n', options: { fontSize: 9, bold: true } },
    { text: 'BMR = 10×体重 + 6.25×身高 - 5×年龄 + 性别系数\nTDEE = BMR × 1.375 (轻度活动)\n\n', options: { fontSize: 8, color: C.gray } },
    { text: '年龄维度:\n', options: { fontSize: 9, bold: true } },
    { text: '成长期(≤25) | 青年(26-35)\n壮年(36-45) | 中老年(>45)\n\n', options: { fontSize: 8.5 } },
    { text: '健康目标:\n', options: { fontSize: 9, bold: true } },
    { text: '减脂 ×0.8 | 保持 ×1.0 | 增肌 ×1.15\n\n', options: { fontSize: 8.5 } },
    { text: '示例: 青年+减脂\n', options: { fontSize: 9, bold: true, color: C.primary } },
    { text: '"早餐粥+蛋，午餐米饭减半，\n多吃青菜瘦肉，戒宵夜啤酒，\n每周快走3次"', options: { fontSize: 8, color: C.gray } },
  ], { x: 5.4, y: 1.65, w: 4.0, h: 3.2, color: C.black, fontFace: 'Arial', lineSpacing: 12 });
  slideNum(s, ++i);
}

// ====== 13. 系统测试 ======
{
  const s = p.addSlide();
  titleBar(s, '系统测试', 'TESTING');
  s.addText('测试方法: 黑盒测试    测试用户: testuser / 12345678    测试环境: Windows 11 + Chrome + MySQL 5.7', {
    x: 0.6, y: 1.2, w: 8.8, h: 0.3, fontSize: 10, color: C.gray, fontFace: 'Arial'
  });

  const data = [
    ['用户注册与登录', '6', '✓ 通过', '注册·登录·错误密码·Token过期401'],
    ['饮食记录管理', '6', '✓ 通过', 'CRUD·AI填充·日期查询·空记录·日期切换'],
    ['数据统计分析', '4', '✓ 通过', '7/30/90天切换·营养素饼图·空数据状态'],
    ['AI智能分析', '5', '✓ 通过', '手动分析·非食物输入·每日评估·Mock降级'],
  ];
  // Header
  s.addShape(p.ShapeType.rect, { x: 0.5, y: 1.6, w: 9.0, h: 0.35, fill: { color: C.primary } });
  ['测试模块', '用例数', '结果', '关键验证场景'].forEach((h, j) => {
    s.addText(h, { x: 0.5 + j * [3.2, 1.0, 1.2, 3.6][j], y: 1.6, w: [3.2, 1.0, 1.2, 3.6][j], h: 0.35, fontSize: 9, bold: true, color: C.white, fontFace: 'Arial', align: 'center' });
  });
  data.forEach((r, j) => {
    const y = 1.95 + j * 0.6;
    s.addShape(p.ShapeType.rect, { x: 0.5, y, w: 9.0, h: 0.5, fill: { color: j % 2 === 0 ? C.bg : C.white }, rectRadius: 0.03 });
    r.forEach((c, k) => {
      s.addText(c, { x: 0.5 + k * [3.2, 1.0, 1.2, 3.6][k], y, w: [3.2, 1.0, 1.2, 3.6][k], h: 0.5, fontSize: k === 2 ? 10 : 9, bold: k === 2, color: k === 2 ? C.accent : C.black, fontFace: 'Arial', align: 'center' });
    });
  });

  // Summary
  s.addShape(p.ShapeType.rect, { x: 0.5, y: 4.45, w: 9.0, h: 0.5, fill: { color: C.accent, transparency: 85 }, rectRadius: 0.05 });
  s.addText('21个测试用例全部通过  ·  无严重Bug  ·  系统稳定可靠  ·  满足验收标准', {
    x: 0.5, y: 4.45, w: 9.0, h: 0.5, fontSize: 12, bold: true, color: C.primary, fontFace: 'Arial', align: 'center'
  });
  slideNum(s, ++i);
}

// ====== 14. 项目总结 ======
{
  const s = p.addSlide();
  titleBar(s, '项目总结与展望', 'SUMMARY & OUTLOOK');

  s.addText('项目亮点', { x: 0.6, y: 1.15, w: 3, h: 0.3, fontSize: 13, bold: true, color: C.primary, fontFace: 'Arial' });
  const highlights = [
    '1. AI深度集成 — DeepSeek大模型 · 双模式架构 · 服务永不停',
    '2. 中国特色Prompt — 中国营养师角色 · 家常菜推荐',
    '3. 12种个性化方案 — Mifflin-St Jeor公式 · 4年龄×3目标',
    '4. 多维数据可视化 — ECharts趋势图+饼图+饮食日历',
    '5. 完善安全体系 — JWT+BCrypt+SpringSecurity+数据隔离',
    '6. 前后端分离 — 17个RESTful API · 标准JSON交互',
    '7. 工程完整性 — 需求→设计→开发→测试→交付全生命周期',
  ];
  s.addText(highlights.join('\n'), { x: 0.6, y: 1.5, w: 8.8, h: 2.1, fontSize: 10, color: C.black, fontFace: 'Arial', lineSpacing: 20 });

  s.addText('未来展望', { x: 0.6, y: 3.55, w: 3, h: 0.3, fontSize: 13, bold: true, color: C.primary, fontFace: 'Arial' });
  const futures = [
    ['图像识别', '拍照自动识别食物成分\n减少手动输入成本'],
    ['微信小程序', 'uni-app跨端技术\n拓展至小程序生态'],
    ['社交功能', '饮食分享 · 好友互动\n健康打卡社区'],
    ['可穿戴设备', '对接手表/手环\n运动数据动态调整'],
  ];
  futures.forEach((f, j) => {
    const x = 0.5 + j * 2.35;
    s.addShape(p.ShapeType.rect, { x, y: 3.9, w: 2.15, h: 1.1, fill: { color: C.bg }, rectRadius: 0.06 });
    s.addText(f[0], { x: x + 0.05, y: 3.95, w: 2.05, h: 0.28, fontSize: 11, bold: true, color: C.primary, fontFace: 'Arial' });
    s.addText(f[1], { x: x + 0.05, y: 4.25, w: 2.05, h: 0.6, fontSize: 8.5, color: C.gray, fontFace: 'Arial', lineSpacing: 14 });
  });
  slideNum(s, ++i);
}

// ====== 15. 项目规模一览 ======
{
  const s = p.addSlide();
  titleBar(s, '项目规模一览', 'PROJECT SCALE');
  const rows = [
    ['开发周期', '3周 / 72学时', '需求→设计→开发→测试→交付'],
    ['技术栈', '12+框架/库', 'Vue3 · SpringBoot · MyBatisPlus · DeepSeek · ECharts · JWT'],
    ['代码规模', '5000+ 行', 'Java后端 + Vue前端 + 配置文件 + SQL脚本'],
    ['API端点', '17个', '5个Controller · RESTful · JSON · JWT认证'],
    ['数据库', '3表 + 1视图', 'user · food_record · ai_analysis_log + 聚合视图'],
    ['测试用例', '21个 · 100%通过', '用户模块6 · 饮食记录6 · 数据统计4 · AI分析5'],
    ['AI分析', '3种模式', '手动分析 · 饮食评估 · 个性化建议 · 12种方案'],
  ];
  // Header
  s.addShape(p.ShapeType.rect, { x: 0.5, y: 1.2, w: 9.0, h: 0.35, fill: { color: C.primary } });
  ['指标', '数据', '说明'].forEach((h, j) => {
    s.addText(h, { x: 0.5 + j * [2.0, 2.0, 5.0][j], y: 1.2, w: [2.0, 2.0, 5.0][j], h: 0.35, fontSize: 10, bold: true, color: C.white, fontFace: 'Arial', align: 'center' });
  });
  rows.forEach((r, j) => {
    const y = 1.55 + j * 0.5;
    s.addShape(p.ShapeType.rect, { x: 0.5, y, w: 9.0, h: 0.42, fill: { color: j % 2 === 0 ? C.bg : C.white } });
    r.forEach((c, k) => {
      s.addText(c, { x: 0.5 + k * [2.0, 2.0, 5.0][k], y, w: [2.0, 2.0, 5.0][k], h: 0.42, fontSize: k === 1 ? 11 : 9, bold: k === 1, color: k === 1 ? C.primary : C.black, fontFace: 'Arial', align: 'center' });
    });
  });
  slideNum(s, ++i);
}

// ====== 16. 致谢 ======
{
  const s = p.addSlide();
  s.addShape(p.ShapeType.rect, { x: 0, y: 0, w: 10, h: 5.63, fill: { color: C.primary } });
  s.addText('致  谢', { x: 0, y: 1.6, w: 10, h: 0.8, fontSize: 36, bold: true, color: C.white, fontFace: 'Arial', align: 'center' });
  s.addShape(p.ShapeType.rect, { x: 3.5, y: 2.5, w: 3, h: 0.02, fill: { color: C.accent } });
  s.addText([
    { text: '感谢指导老师在项目开发过程中的悉心指导\n\n', options: { color: C.white } },
    { text: '感谢各位评审老师的宝贵时间和建议\n\n', options: { color: C.white } },
    { text: '恳请各位老师批评指正', options: { color: C.lightGray } },
  ], { x: 1, y: 2.8, w: 8, h: 2.0, fontSize: 14, fontFace: 'Arial', align: 'center', lineSpacing: 28 });
  s.addText('智能健康饮食系统的设计与实现  |  李黎凤  |  软件工程  |  2026年5月', {
    x: 0, y: 4.8, w: 10, h: 0.3, fontSize: 9, color: C.lightGray, fontFace: 'Arial', align: 'center'
  });
}

// ===== Save =====
const out = 'D:/javaEE实训+毕设/智能健康饮食/毕设答辩-智能健康饮食系统.pptx';
await p.writeFile({ fileName: out });
console.log('Done: ' + out);
