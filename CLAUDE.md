# 智能健康饮食 — 前端 (Health Diet Frontend)

Vue 3 智能饮食管理前端，支持 AI 营养分析、饮食记录、数据统计、个人中心。

## 技术栈

- **框架**: Vue 3 (Composition API + `<script setup>`)
- **构建**: Vite 5.4
- **UI 库**: Element Plus (auto-import 组件/API)
- **图标**: Element Plus Icons + lucide-vue-next (饮食记录页)
- **状态**: Pinia
- **路由**: Vue Router (hash 模式)
- **样式**: Tailwind CSS + SCSS
- **图表**: ECharts (数据统计页)
- **HTTP**: Axios（统一拦截器）
- **语言**: 纯 JavaScript，无 TypeScript

## 启动方式

```bash
cd health-diet-frontend
pnpm install
pnpm dev
```

默认运行在 `http://localhost:5173`，API 请求代理到 `http://localhost:8080`。

> **前置条件**: 后端 Spring Boot 必须先启动在 8080 端口，且 MySQL57 服务运行中。

## 目录结构

```
src/
├── api/                    # API 请求层
│   ├── request.js          # Axios 实例(拦截器/基地址/Token)
│   ├── auth.js             # 登录/注册
│   ├── user.js             # 用户信息(获取/更新/头像)
│   ├── food.js             # 饮食记录(增删改查)
│   ├── stats.js            # 数据统计(趋势/比例)
│   └── ai.js               # AI 分析(手动/饮食/历史)
├── assets/
│   ├── images/             # logo.png, robot1.png, robot2.png
│   └── styles/             # global.scss (变量), tailwind.scss
├── components/             # 可复用组件
│   ├── AppSidebar.vue      # 侧边导航栏
│   ├── WeatherCard.vue     # 天气日期卡片
│   ├── IntakeOverview.vue  # 今日摄入总览(环形图+营养条)
│   ├── AppPageBg.vue       # 页面背景
│   └── Loading.vue
├── config/
│   └── menus.js            # 侧边栏菜单配置
├── layout/
│   └── MainLayout.vue      # 主布局(侧边栏+内容区)
├── router/
│   └── index.js            # 路由配置 + 导航守卫
├── stores/
│   └── user.js             # 用户状态(token/userInfo/login)
├── utils/
│   ├── format.js           # 格式化工具
│   ├── foodEmoji.js        # 食物 emoji 映射
│   └── nutrition.js        # 营养计算工具
└── views/
    ├── home/Home.vue       # 首页(Landing)
    ├── login/              # 登录/注册
    │   ├── Login.vue
    │   └── Register.vue
    ├── dashboard/Dashboard.vue    # 数据统计(ECharts)
    ├── food/FoodRecord.vue        # 饮食记录
    ├── profile/Profile.vue        # 个人中心(查看+编辑)
    └── ai/                         # AI 营养分析
        ├── AiAnalyze.vue           # 主页面(三标签切换)
        ├── ManualInput.vue         # 手动输入分析
        ├── DietRecordAnalysis.vue  # 饮食记录分析
        └── AnalysisHistory.vue     # 右侧分析历史
```

## 路由

| 路径 | 页面 | 说明 | 需登录 |
|------|------|------|--------|
| `/` | Home | 首页 Landing | ✗ |
| `/login` | Login | 登录 | ✗ |
| `/register` | Register | 注册 | ✗ |
| `/app/dashboard` | Dashboard | 数据统计 | ✓ |
| `/app/food` | FoodRecord | 饮食记录 | ✓ |
| `/app/analyze` | AiAnalyze | AI 营养分析 | ✓ |
| `/app/profile` | Profile | 个人中心 | ✓ |

路由使用 hash 模式（`#`），通过 `beforeEach` 守卫拦截未登录访问。

## Vite 配置

- `@` 别名 → `src/`
- SCSS 自动注入 `@/assets/styles/global.scss`
- API 代理 `/api` → `http://localhost:8080`
- API 代理 `/uploads` → `http://localhost:8080`
- Element Plus auto-import（组件 + API）

## 全局 SCSS 变量

```scss
$primary-color: #409eff;
$spacing-base: 16px;
```

Tailwind 类名优先，复杂样式用 scoped SCSS。

## Axios 拦截器

- **请求拦截**: 自动附带 `Authorization: Bearer <token>`（从 Pinia store 读取）
- **响应拦截**: 统一处理 401（Token 过期自动跳转登录页）、网络错误等
- **基地址**: `/api`（通过 Vite 代理到 `localhost:8080`）

## 页面标题标准

所有页面使用统一的标题样式（以 Dashboard 为基准）:

```html
<header class="flex justify-between items-start mb-6">
  <div>
    <h1 class="text-[24px] font-bold text-[#1f2937] flex items-center gap-2">
      页面标题 <el-icon size="22" color="#00b96b"><Icon /></el-icon>
    </h1>
    <p class="text-[#9ca3af] text-[13px] mt-1">页面描述</p>
  </div>
  <WeatherCard />
</header>
```

## 图标规范

- 标题图标颜色统一 `#00b96b`，size 22
- 侧边栏图标与对应页面标题图标保持一致
- AI 相关图标使用 Gemini 星芒 SVG (`#icon-gemini-spark`)

## 用户 Store

```js
import { useUserStore } from '@/stores/user'

// userStore.userInfo 字段:
//   id, username, height, weight, goal, gender, age, avatar
//   gender: 0=未知, 1=男, 2=女 (注册时不选择，默认0)
// userStore.token, userStore.isLoggedIn
// userStore.setUserInfo(data), userStore.logout()
```

## 后端依赖

| 服务 | 地址 | 状态 |
|---|---|---|
| Spring Boot | `localhost:8080` | `mvn spring-boot:run` |
| MySQL 5.7 | `localhost:3306` | Windows 服务 `MySQL57`，开机自启 |
| DeepSeek API | `api.deepseek.com` | 需要有效 API Key |

### 环境变量（后端需设置）

```bash
export DB_PASSWORD=<你的数据库密码>
export JWT_SECRET=<你的JWT密钥>
export DEEPSEEK_API_KEY=<你的DeepSeek API Key>
```
