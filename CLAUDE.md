# 智能健康饮食 (Health Diet Frontend)

Vue 3 智能饮食管理前端，支持 AI 营养分析、饮食记录、数据统计、个人中心。

## 技术栈

- **框架**: Vue 3 (Composition API + `<script setup>`)
- **构建**: Vite
- **UI 库**: Element Plus (auto-import 组件/API)
- **图标**: Element Plus Icons + lucide-vue-next (饮食记录页)
- **状态**: Pinia
- **路由**: Vue Router (hash 模式)
- **样式**: Tailwind CSS + SCSS
- **图表**: ECharts (数据统计页)
- **语言**: 纯 JavaScript，无 TypeScript

## 目录结构

```
src/
├── api/
│   ├── request.js       # Axios 实例(拦截器/基地址)
│   ├── auth.js          # 登录/注册
│   ├── user.js          # 用户信息(获取/更新)
│   ├── food.js          # 饮食记录
│   ├── stats.js         # 数据统计
│   └── ai.js            # AI 分析
├── assets/
│   ├── images/          # logo.png, robot1.png, robot2.png
│   └── styles/          # global.scss (变量), tailwind.scss
├── components/          # 可复用组件
│   ├── AppSidebar.vue   # 侧边导航栏
│   ├── WeatherCard.vue  # 天气日期卡片
│   ├── IntakeOverview.vue # 今日摄入总览(环形图+营养条)
│   └── Loading.vue
├── config/
│   └── menus.js         # 侧边栏菜单配置
├── layout/
│   └── MainLayout.vue   # 主布局(侧边栏+内容区)
├── router/
│   └── index.js         # 路由配置
├── stores/
│   └── user.js          # 用户状态(token/userInfo)
└── views/
    ├── home/Home.vue     # 首页(Landing)
    ├── login/            # 登录/注册
    ├── dashboard/Dashboard.vue  # 数据统计(ECharts)
    ├── food/FoodRecord.vue      # 饮食记录
    ├── profile/Profile.vue      # 个人中心(查看+编辑)
    └── ai/               # AI 营养分析
        ├── AiAnalyze.vue          # 主页面(三标签切换)
        ├── ManualInput.vue        # 手动输入分析
        ├── DietRecordAnalysis.vue # 饮食记录分析
        └── AnalysisHistory.vue    # 右侧分析历史
```

## 路由

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | Home | 首页 |
| `/login` | Login | 登录 |
| `/register` | Register | 注册 |
| `/app/dashboard` | Dashboard | 数据统计 |
| `/app/food` | FoodRecord | 饮食记录 |
| `/app/analyze` | AiAnalyze | AI 营养分析 |
| `/app/profile` | Profile | 个人中心 |

## 全局 SCSS 变量

```scss
$primary-color: #409eff;
$spacing-base: 16px;
```

Tailwind 类名优先，复杂样式用 scoped SCSS。

## Vite 配置

- `@` 别名 → `src/`
- SCSS 自动注入 `@/assets/styles/global.scss`
- API 代理 `/api` → `http://localhost:8080`
- Element Plus auto-import

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
//   id, username, height, weight, goal, gender
//   gender: 0=未知, 1=男, 2=女 (注册时不选择，默认0)
// userStore.token, userStore.isLoggedIn
// userStore.setUserInfo(data), userStore.logout()
```
