# 智能健康饮食 — 前端项目分析

## 项目概述

一个**智能健康饮食管理 SPA**，基于 Vue 3 全家桶构建，提供饮食记录、AI 营养分析、仪表盘统计等功能。目前处于**项目骨架阶段**——路由、状态管理、API 层、布局已搭建完毕，所有页面均为占位组件，待填充业务逻辑。

---

## 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 框架 | Vue 3 (Composition API + `<script setup>`) | ^3.5.13 |
| 构建工具 | Vite | ^5.4.19 |
| UI 组件库 | Element Plus | ^2.9.7 |
| 状态管理 | Pinia | ^2.3.1 |
| 路由 | Vue Router (Hash 模式) | ^4.5.0 |
| HTTP 客户端 | Axios | ^1.7.9 |
| CSS 框架 | Tailwind CSS + SCSS | ^3.4.17 / ^1.86.3 |
| 图表 | ECharts | ^5.5.1 |
| 代码规范 | ESLint + Prettier | ^9.10.0 / ^3.5.3 |
| 包管理 | pnpm | — |

---

## 目录结构

```
health-diet-frontend/
├── index.html                    # 入口 HTML (lang="zh-CN")
├── vite.config.js                # Vite 配置
├── tailwind.config.js            # Tailwind 配置
├── postcss.config.js             # PostCSS (Tailwind + Autoprefixer)
├── eslint.config.js              # ESLint flat config
├── jsconfig.json                 # TS/JS 语言服务配置
├── package.json                  # 依赖声明
├── auto-imports.d.ts             # 自动生成 — unplugin-auto-import 类型声明
├── components.d.ts               # 自动生成 — unplugin-vue-components 类型声明
├── src/
│   ├── main.js                   # 应用入口 (挂载 Vue/Pinia/Router/ElementPlus)
│   ├── App.vue                   # 根组件 (仅 <router-view />)
│   ├── api/                      # API 请求层
│   │   ├── request.js            #   Axios 实例 + 拦截器
│   │   ├── auth.js               #   登录 / 注册
│   │   ├── food.js               #   饮食记录 CRUD
│   │   ├── ai.js                 #   AI 分析 / 历史
│   │   ├── user.js               #   用户信息
│   │   └── stats.js              #   统计 / 健康报告
│   ├── stores/
│   │   └── user.js               # Pinia 用户状态 (token/userInfo/登录态)
│   ├── router/
│   │   └── index.js              # 路由表 + 导航守卫
│   ├── layout/
│   │   └── MainLayout.vue        # 主布局 (侧边栏 + 顶栏 + 内容区)
│   ├── views/                    # 页面组件 (均为占位桩)
│   │   ├── Login.vue             #   登录页
│   │   ├── Register.vue          #   注册页
│   │   ├── Dashboard.vue         #   仪表盘 (需登录)
│   │   ├── FoodRecord.vue        #   饮食记录 (需登录)
│   │   ├── AiAnalyze.vue         #   AI 分析 (需登录)
│   │   └── Profile.vue           #   个人中心 (需登录)
│   ├── components/               # 通用组件
│   │   ├── HelloWorld.vue        #   欢迎组件 (接收 msg prop)
│   │   └── Loading.vue           #   加载中动画 (CSS spin)
│   ├── utils/
│   │   └── format.js             # 日期/数字/卡路里格式化
│   └── assets/styles/
│       ├── global.scss           # SCSS 全局变量 (颜色/布局/字体/间距)
│       └── tailwind.scss         # Tailwind 指令
```

---

## 核心架构分析

### 1. 应用入口 (`main.js`)

按顺序注册插件：**Pinia → Router → Element Plus → Element Plus Icons（全局注册）**

### 2. 路由设计 (`router/index.js`)

- **模式**：`createWebHashHistory`（Hash 路由，`#/dashboard` 形式）
- **访问控制**（`beforeEach` 守卫）：
  - 白名单：`/login`、`/register`，未登录仅可访问这两个
  - 已登录访问 `/login` → 重定向到 `/`
  - 未登录访问需授权页面 → 重定向到 `/login?redirect=原路径`
  - Token 存储在 `localStorage`

路由结构：
```
/login          → Login.vue
/register       → Register.vue
/               → MainLayout.vue (父布局)
  /dashboard    →   Dashboard.vue   (仪表盘)
  /food         →   FoodRecord.vue  (饮食记录)
  /analyze      →   AiAnalyze.vue   (AI 分析)
  /profile      →   Profile.vue     (个人中心)
```

### 3. HTTP 请求层 (`api/request.js`)

- `baseURL: '/api'`
- **请求拦截器**：自动从 `localStorage` 读取 token 并附加 `Authorization: Bearer xxx`
- **响应拦截器**：
  - `code === 200` → 自动解包 `data.data` 返回
  - `code === 401` → 清除 token 跳转登录页
  - 其他错误 → `ElMessage` 弹窗提示

### 4. API 模块（5 个业务模块，RESTful 风格）

| 模块 | 端点 | 方法 |
|------|------|------|
| auth | `/auth/login` | POST |
| auth | `/auth/register` | POST |
| food | `/food/records` | GET (分页查询) |
| food | `/food/record` | POST (新增) |
| food | `/food/record/:id` | DELETE (删除) |
| ai | `/ai/analyze` | POST (分析) |
| ai | `/ai/history` | GET (历史) |
| user | `/user/info` | GET / PUT |
| stats | `/stats/diet` | GET (饮食统计) |
| stats | `/stats/report` | GET (健康报告) |

### 5. 状态管理 (`stores/user.js`)

Pinia Composition API 风格，管理 3 个核心数据：
- `token` — JWT，同步持久化到 `localStorage`
- `userInfo` — 用户资料（id/username/height/weight/goal）
- `isLoggedIn` — 计算属性，由 token 是否为空派生

### 6. 布局 (`MainLayout.vue`)

经典**侧边栏 + 顶栏 + 内容区**三部结构：
- **侧边栏**：Element Plus Menu，可折叠（`isCollapse`），4 个菜单项 → 仪表盘/饮食记录/AI分析/个人中心
- **顶栏**：折叠按钮 + 用户名显示 + 退出登录按钮
- **内容区**：`<router-view />` 嵌套路由出口

### 7. Vite 配置要点

- **代理**：`/api` → `http://localhost:8080`（开发环境）
- **自动导入**：Element Plus 组件和 API 均无需手动 import
- **SCSS 全局注入**：`global.scss` 的变量在所有 `.vue` 的 `<style>` 中可直接使用（如 `$primary-color`）
- **路径别名**：`@` → `src/`

### 8. 样式系统

双层架构：
- **Tailwind CSS**：`tailwind.scss` 引入原子类（`text-2xl`、`font-bold` 等）
- **SCSS 变量**：`global.scss` 定义了颜色、布局、字体、间距四大类变量，所有组件 `<style scoped lang="scss">` 中自动可用

---

## 当前进度

| 模块 | 状态 |
|------|------|
| 项目框架搭建 | 已完成 |
| 路由 + 导航守卫 | 已完成 |
| HTTP 请求封装 | 已完成 |
| 用户状态管理 | 已完成 |
| 主布局 | 已完成 |
| 登录/注册页 | 占位桩 |
| 仪表盘页 | 占位桩 |
| 饮食记录页 | 占位桩 |
| AI 分析页 | 占位桩 |
| 个人中心页 | 占位桩 |
| ECharts 图表 | 已安装未使用 |
| 业务逻辑 | 待开发 |

---

## 总结

这是一个**结构清晰、分层合理**的 Vue 3 前端项目骨架。分层遵循 `api → stores → router → views/layout → components` 的标准模式。下一步工作是在六个页面中填充具体的表单、表格、图表和业务交互逻辑。项目使用纯 JavaScript（非 TypeScript），以中文为主要界面语言，后端 API 预期运行在 `localhost:8080`。
