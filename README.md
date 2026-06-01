# 智能健康饮食系统 — 前端

基于 Vue 3 的智能健康饮食管理前端界面，提供饮食记录、AI 营养分析、数据统计和个人中心等功能。

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue | 3.5 | 前端框架（Composition API + `<script setup>`） |
| Vite | 5.4 | 构建工具 |
| Element Plus | 2.9 | UI 组件库（自动导入） |
| Element Plus Icons | 2.3 | 图标库 |
| Pinia | 2.3 | 状态管理 |
| Vue Router | 4.5 | 路由（hash 模式） |
| Axios | 1.7 | HTTP 请求 |
| ECharts | 5.5 | 图表（数据统计页） |
| Tailwind CSS | 3.4 | 原子化 CSS |
| SCSS/Sass | 1.86 | CSS 预处理 |
| lucide-vue-next | 1.0 | 补充图标库 |

## 项目结构

```
src/
├── main.js                     # 应用入口（注册 Pinia/Router/ElementPlus）
├── App.vue                     # 根组件
├── api/
│   ├── request.js              # Axios 实例（拦截器/Token/统一错误处理）
│   ├── auth.js                 # 登录/注册
│   ├── user.js                 # 用户信息/头像/注销
│   ├── food.js                 # 饮食记录 CRUD
│   ├── stats.js                # 数据统计
│   └── ai.js                   # AI 分析/历史/建议
├── assets/
│   ├── images/                 # 图片资源（logo、机器人）
│   └── styles/
│       ├── global.scss         # 全局 SCSS 变量
│       └── tailwind.scss       # Tailwind 指令
├── components/
│   ├── AppSidebar.vue          # 侧边导航栏
│   ├── WeatherCard.vue         # 日期时间卡片
│   ├── IntakeOverview.vue      # 今日摄入总览（环形图 + 进度条）
│   └── AppPageBg.vue           # 页面背景装饰
├── config/
│   └── menus.js                # 侧边栏菜单配置
├── layout/
│   └── MainLayout.vue          # 主布局（侧边栏 + 内容区）
├── router/
│   └── index.js                # 路由配置 + 导航守卫
├── stores/
│   └── user.js                 # 用户状态（Token/用户信息/登录登出）
├── utils/
│   ├── format.js               # 格式化工具
│   ├── foodEmoji.js            # 食物 emoji 映射
│   └── nutrition.js            # 营养计算（BMR/TDEE/推荐摄入）
└── views/
    ├── home/
    │   └── Home.vue            # 首页（欢迎页）
    ├── login/
    │   ├── Login.vue            # 登录页
    │   ├── Register.vue         # 注册页
    │   └── AuthPromo.vue        # 认证页推广侧栏
    ├── dashboard/
    │   └── Dashboard.vue        # 数据统计（ECharts 图表 + 饮食日历）
    ├── food/
    │   └── FoodRecord.vue       # 饮食记录（日期切换/餐次筛选/增删改）
    ├── profile/
    │   └── Profile.vue          # 个人中心（查看/编辑/密码/注销）
    └── ai/
        ├── AiAnalyze.vue        # AI 分析主页（双模型切换）
        ├── ManualInput.vue      # 手动输入食物分析
        ├── DietRecordAnalysis.vue  # 饮食记录分析
        └── AnalysisHistory.vue  # 分析历史侧边栏
```

## 快速开始

```bash
cd health-diet-frontend
pnpm install
pnpm dev
```

浏览器访问 `http://localhost:5173`。

> 前置条件：后端 Spring Boot 已启动在 `http://localhost:8080`。

## 路由

| 路径 | 页面 | 说明 | 认证 |
|------|------|------|------|
| `/` | Home | 首页 | 需要 |
| `/login` | Login | 登录 | 游客 |
| `/register` | Register | 注册 | 游客 |
| `/app/dashboard` | Dashboard | 数据统计 | 需要 |
| `/app/food` | FoodRecord | 饮食记录 | 需要 |
| `/app/analyze` | AiAnalyze | AI 分析 | 需要 |
| `/app/profile` | Profile | 个人中心 | 需要 |

路由使用 **hash 模式**，通过 `beforeEach` 守卫拦截未登录访问。

## 页面功能

### 首页
- 欢迎语 + 快捷入口
- 今日摄入总览

### 饮食记录
- 日期导航（左右箭头 + 日期选择器）
- 餐次筛选（全部/早餐/午餐/晚餐/加餐）
- 食物卡片（emoji + 营养信息）
- 添加/编辑弹窗（支持 AI 自动填充营养数据）
- **仅当天可增删改**，历史记录只读
- 右侧面板：今日摄入环形图 + AI 分析入口

### AI 分析
- 模型切换（DeepSeek-V3 / DeepSeek-R1）
- 手动输入分析：输入食物名称，AI 返回营养数据
- 饮食记录分析：分析某天所有饮食，给出评分和建议
- 右侧历史面板：分页浏览、删除、清空

### 数据统计
- 4 个汇总卡片（日均热量/蛋白质/碳水/脂肪）
- 热量趋势柱状图（7/30/90 天切换）
- 营养素占比饼图（单日/范围切换）
- 饮食日历（月视图，标记有记录/未记录）

### 个人中心
- 个人信息展示（头像、账号、身体数据、健康目标）
- AI 营养师个性化建议
- 编辑信息（头像上传、身高/体重/目标/年龄/性别）
- 账号安全（修改密码）
- 注销账号（二次确认）

## 请求处理

Axios 拦截器逻辑：

1. **请求拦截**：自动附带 `Authorization: Bearer <token>`
2. **响应拦截**：
   - `code === 200` → 返回 `data.data`
   - `code === 401` → 清除 Token，跳转登录页
   - 其他错误 → `Promise.reject`，由各组件 `catch` 显示具体错误信息

## Vite 配置

- `@` 别名 → `src/`
- SCSS 自动注入全局变量
- 开发代理：`/api` → `http://localhost:8080`，`/uploads` → `http://localhost:8080`
- Element Plus 自动导入（组件 + API）

## 样式规范

- **优先 Tailwind**，复杂样式用 scoped SCSS
- 主色调：`#3BB371`（绿色系）
- AI 按钮：`#8b5cf6`（紫色渐变）
- 标题图标统一 `#00b96b`，size 22
- 圆角卡片风格，玻璃拟态背景
