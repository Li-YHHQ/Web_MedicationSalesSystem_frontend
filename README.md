# 药店管理系统 — 前端

基于 Vue 3 + TypeScript + Vite 构建的药店管理系统前端，提供药品、库存、供应商、财务的全流程管理能力。

## 功能模块

| 模块 | 路由 | 说明 |
|------|------|------|
| 数据看板 | `/dashboard` | 统计概览、财务趋势折线图（原生 SVG） |
| 药品管理 | `/drugs` | 药品 CRUD、Excel 导入/导出、状态管理（软删除） |
| 供应商管理 | `/supplier` | 供应商 CRUD、启用/停用 |
| 入库管理 | `/stock/in` | 入库记录、预警信息（近效期/库存不足）、库存同步（Excel 对比差异） |
| 出库管理 | `/stock/out` | 出库记录（销售/损耗/退货）、药品批次联动、数量校验 |
| 效期管理 | `/expire` | 效期预警（30/60/90天分级）、库存预警（缺口计算） |
| 财务统计 | `/finance` | 汇总卡片、每日明细、销售额/利润趋势折线图 |

## 技术栈

- **Vue 3.4** — Composition API，`<script setup>` 语法
- **TypeScript** — 严格类型，接口文件按模块拆分
- **Vite 5** — 开发服务器 + 生产构建（terser 压缩）
- **Vue Router 4** — 路由守卫，未登录自动跳转 `/login`
- **Pinia 2** — 用户状态管理
- **Axios** — 请求/响应拦截器（全局 Loading、统一错误提示、401 自动退登）

> 无任何第三方 UI 库，所有组件均自行实现。

## 项目结构

```
src/
├── api/                    # 接口层（按模块拆分）
│   ├── dashboard.ts        # 看板
│   ├── drug.ts             # 药品
│   ├── finance.ts          # 财务
│   ├── stock.ts            # 库存（入库/出库/批次/预警/同步）
│   ├── supplier.ts         # 供应商
│   └── users.ts            # 用户认证
├── components/
│   ├── common/
│   │   ├── ConfirmDialog.vue   # 删除二次确认
│   │   ├── EmptyState.vue      # 空数据占位
│   │   ├── LoadingSpinner.vue  # 全屏加载遮罩
│   │   └── Toast.vue           # 消息提示（Teleport）
│   └── ui/
│       ├── BaseButton.vue      # 按钮（primary/secondary/danger，loading 态）
│       ├── BaseInput.vue       # 输入框
│       └── BaseModal.vue       # 弹窗（flex 布局，footer 不被 body 遮挡）
├── layouts/
│   ├── MainLayout.vue      # 主布局（PC 侧边栏 + 移动端底部 Tab）
│   └── EmptyLayout.vue     # 空白布局（登录页）
├── pages/
│   ├── auth/Login.vue
│   ├── dashboard/Dashboard.vue
│   ├── drug/DrugList.vue
│   ├── expire/ExpireList.vue
│   ├── finance/Finance.vue
│   ├── stock/StockIn.vue
│   ├── stock/StockOut.vue
│   └── supplier/SupplierList.vue
├── router/index.ts         # 路由配置 + 守卫
├── stores/user.ts          # Pinia 用户 store
├── utils/
│   ├── format.ts           # formatMoney / formatDate / formatDateTime / formatNumber
│   ├── loading.ts          # 计数器式全局 Loading（并发请求安全）
│   ├── request.ts          # Axios 封装（自动处理 FormData Content-Type）
│   └── toast.ts            # 响应式 Toast 单例
├── App.vue                 # 根组件（注册 Toast、LoadingSpinner，监听网络状态）
└── main.ts
```

## 快速开始

### 环境要求

- Node.js >= 16
- npm >= 7

### 安装与运行

```bash
npm install
npm run dev        # 开发服务器（默认 http://localhost:5173）
npm run build      # 生产构建（输出到 dist/）
npm run preview    # 预览生产构建
npm run lint       # ESLint 检查
npm run type-check # TypeScript 类型检查
```

### 环境变量

在项目根目录创建 `.env.development` / `.env.production`：

```env
VITE_API_BASE_URL=http://localhost:8080
```

所有 API 请求会自动拼接为 `${VITE_API_BASE_URL}/api/...`。

## API 接口对应关系

### 认证
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/users/login` | 登录，返回 token |

### 药品
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/drugs` | 分页查询（支持 keyword/category/status 过滤） |
| POST | `/api/drugs` | 新增 |
| PUT | `/api/drugs/{id}` | 更新 |
| DELETE | `/api/drugs/{id}` | 软删除（status→0） |
| POST | `/api/drugs/import` | Excel 导入 |
| GET | `/api/drugs/export` | Excel 导出 |

### 供应商
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/suppliers` | 分页查询 |
| GET | `/api/suppliers/all` | 全量列表（下拉用） |
| POST | `/api/suppliers` | 新增 |
| PUT | `/api/suppliers/{id}` | 更新 |
| DELETE | `/api/suppliers/{id}` | 删除 |

### 库存
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/stock/in` | 入库 |
| GET | `/api/stock/in` | 入库记录分页查询 |
| POST | `/api/stock/out` | 出库（销售/损耗/退货） |
| GET | `/api/stock/out` | 出库记录分页查询 |
| GET | `/api/stock/batches/{drugId}` | 药品批次列表 |
| GET | `/api/stock/expire` | 近效期批次 |
| GET | `/api/stock/low` | 库存不足批次 |
| POST | `/api/stock/sync/preview` | 库存同步预览（multipart/form-data） |
| POST | `/api/stock/sync/confirm` | 库存同步确认（multipart/form-data） |

### 财务
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/finance/summary` | 汇总数据（含每日列表） |
| GET | `/api/finance/daily` | 每日明细 |
| POST | `/api/finance/sync` | 同步今日数据 |

## 关键设计说明

### 请求层
- Axios 实例默认 `Content-Type: application/json`，拦截器检测到 `FormData` 时自动删除该头，让浏览器补全 `multipart/form-data; boundary=...`
- 401 响应自动清空 token 并跳转登录页
- 计数器式 Loading：多个并发请求时只在全部完成后才隐藏遮罩

### 布局
- **PC（> 767px）**：220px 固定侧边栏，支持库存子菜单折叠
- **移动端（≤ 767px）**：顶部标题栏 + 底部 5 Tab 导航，库存 Tab 点击弹出底部选单
- 响应式断点统一为 767px

### 软删除兼容
药品列表查询默认携带 `status=1`，过滤后端软删除记录；用户可通过筛选栏手动选择"停用"或"全部"。

## 部署（Nginx）

```nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 浏览器支持

Chrome 87+、Firefox 78+、Safari 14+、Edge 88+

## 相关项目

- 后端：[Web_MedicationSalesSystem_backend](待补充)
