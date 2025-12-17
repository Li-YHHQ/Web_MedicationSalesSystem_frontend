# 药品销售系统 - 前端

基于 Vue 3 + TypeScript + Vite 构建的现代化药品销售系统前端应用，提供完整的电商功能和后台管理能力。

## 项目简介

这是一个功能完善的药品电商平台前端系统，支持用户浏览药品、在线购买、订单管理等功能，同时为管理员提供了完整的后台管理界面。

### 主要特性

**用户端功能**
- 药品浏览与搜索
- 分类筛选
- 购物车管理
- 订单创建与支付
- 订单追踪（待支付、待发货、待收货、已完成）
- 个人信息管理
- 轮播图展示

**管理端功能**
- 药品管理（增删改查）
- 分类管理
- 轮播图管理
- 订单管理（发货处理）
- 用户管理
- 文件上传（图片）

## 技术栈

### 核心框架
- **Vue 3.4+** - 渐进式 JavaScript 框架
- **TypeScript** - JavaScript 的超集，提供类型安全
- **Vite 5.0+** - 下一代前端构建工具

### 状态与路由
- **Vue Router 4** - 官方路由管理器
- **Pinia 2** - 新一代状态管理库

### HTTP 与工具
- **Axios** - 基于 Promise 的 HTTP 客户端
- **ESLint** - 代码质量检查工具

## 项目结构

```
src/
├── api/                    # API 接口定义
│   ├── banners.ts         # 轮播图接口
│   ├── cart.ts            # 购物车接口
│   ├── categories.ts      # 分类接口
│   ├── files.ts           # 文件上传接口
│   ├── orders.ts          # 订单接口
│   ├── products.ts        # 药品接口
│   └── users.ts           # 用户接口
├── assets/                 # 静态资源
│   └── styles/            # 全局样式
├── components/             # 组件目录
│   ├── common/            # 通用组件（Header, Footer, Sidebar）
│   ├── course/            # 业务组件（待清理）
│   └── ui/                # UI 基础组件（Button, Input, Modal）
├── composables/           # 组合式函数
├── layouts/               # 布局组件
│   ├── DefaultLayout.vue  # 默认布局（含导航）
│   └── EmptyLayout.vue    # 空白布局
├── pages/                 # 页面组件
│   ├── admin/             # 管理端页面
│   │   ├── AdminBanners.vue
│   │   ├── AdminCategories.vue
│   │   ├── AdminOrders.vue
│   │   ├── AdminProducts.vue
│   │   └── AdminUsers.vue
│   ├── auth/              # 认证页面
│   │   ├── Login.vue
│   │   └── Register.vue
│   ├── cart/              # 购物车页面
│   ├── home/              # 首页
│   ├── me/                # 个人中心
│   ├── order/             # 订单页面
│   └── product/           # 药品页面
├── router/                # 路由配置
├── stores/                # Pinia 状态管理
│   ├── user.ts           # 用户状态
│   └── course.ts         # 业务状态
├── types/                 # TypeScript 类型定义
├── utils/                 # 工具函数
│   ├── request.ts        # HTTP 请求封装
│   ├── validation.ts     # 表单验证
│   └── format.ts         # 数据格式化
├── App.vue               # 根组件
└── main.ts               # 应用入口
```

## 功能模块详解

### 用户认证
- 用户注册
- 用户登录
- Token 认证
- 角色权限控制（USER/ADMIN）

### 药品管理
- 药品列表展示（支持分页）
- 药品详情查看
- 按分类筛选
- 按价格范围筛选
- 关键词搜索
- 处方药/非处方药标识

### 购物车
- 添加商品到购物车
- 修改商品数量
- 删除购物车商品
- 清空购物车
- 实时计算总价

### 订单流程
- 从购物车创建订单
- 填写收货信息
- 订单支付
- 查看订单列表
- 订单详情查看
- 确认收货
- 取消订单

### 后台管理
**分类管理**
- 创建/编辑/删除分类
- 分类排序
- 启用/禁用状态

**药品管理**
- 添加新药品（含图片上传）
- 编辑药品信息
- 药品上下架
- 库存管理

**轮播图管理**
- 上传轮播图
- 设置跳转链接
- 排序调整
- 启用/禁用

**订单管理**
- 查看所有订单
- 订单状态筛选
- 订单发货操作

**用户管理**
- 查看用户列表
- 用户信息查询

## 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 7.0.0 或 yarn >= 1.22.0

### 安装

```bash
# 克隆项目
git clone <repository-url>
cd Web_MedicationSalesSystem_frontend

# 安装依赖
npm install
```

### 开发

```bash
# 启动开发服务器
npm run dev

# 访问 http://localhost:5173
```

### 构建

```bash
# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

### 代码检查

```bash
# 运行 ESLint
npm run lint

# 类型检查
npm run type-check
```

## 环境配置

项目使用 Vite 的环境变量机制，支持多环境配置：

### 配置文件

- `.env` - 所有环境的默认配置
- `.env.development` - 开发环境配置
- `.env.production` - 生产环境配置

### 主要配置项

```env
# 应用标题
VITE_APP_TITLE=药品销售系统

# 应用版本
VITE_APP_VERSION=1.0.0

# API 基础地址
VITE_API_BASE_URL=http://localhost:8080

# 文件上传地址
VITE_UPLOAD_URL=http://localhost:8080/upload

# 环境标识
VITE_APP_ENV=development
```

## API 接口

### 用户相关
- `POST /users/register` - 用户注册
- `POST /users/login` - 用户登录
- `GET /users/me` - 获取当前用户信息
- `PUT /users/me` - 更新用户信息

### 药品相关
- `GET /products` - 获取药品列表
- `GET /products/:id` - 获取药品详情
- `GET /products/:id/reviews` - 获取药品评价

### 购物车相关
- `GET /cart` - 获取购物车
- `POST /cart/items` - 添加商品到购物车
- `PATCH /cart/items/:id` - 更新购物车商品数量
- `DELETE /cart/items/:id` - 删除购物车商品
- `DELETE /cart` - 清空购物车

### 订单相关
- `POST /orders` - 从购物车创建订单
- `GET /orders` - 获取我的订单列表
- `GET /orders/:id` - 获取订单详情
- `POST /orders/:id/pay` - 支付订单
- `POST /orders/:id/receive` - 确认收货
- `POST /orders/:id/cancel` - 取消订单

### 管理端接口
- `GET /admin/products` - 管理端药品列表
- `POST /admin/products` - 创建药品
- `PUT /admin/products/:id` - 更新药品
- `DELETE /admin/products/:id` - 删除药品
- `GET /admin/categories` - 分类列表
- `POST /admin/categories` - 创建分类
- `GET /admin/banners` - 轮播图列表
- `POST /admin/banners` - 创建轮播图
- `GET /admin/orders` - 订单列表
- `POST /admin/orders/:id/ship` - 订单发货
- `GET /admin/users` - 用户列表
- `POST /admin/files/images` - 图片上传

## 路由说明

### 公开路由
- `/` - 首页
- `/login` - 登录
- `/register` - 注册
- `/products` - 药品列表
- `/products/:id` - 药品详情

### 需要登录
- `/cart` - 购物车
- `/orders` - 我的订单
- `/orders/:id` - 订单详情
- `/me` - 个人中心

### 管理员专属
- `/admin/categories` - 分类管理
- `/admin/products` - 药品管理
- `/admin/banners` - 轮播图管理
- `/admin/orders` - 订单管理
- `/admin/users` - 用户管理

## 组件说明

### UI 基础组件
- `BaseButton` - 基础按钮组件，支持多种类型和尺寸
- `BaseInput` - 基础输入框组件，支持验证
- `BaseModal` - 基础模态框组件

### 通用组件
- `AppHeader` - 应用顶部导航栏
- `AppSidebar` - 侧边栏导航
- `AppFooter` - 应用底部
- `LoadingSpinner` - 加载指示器

## 开发规范

### 代码风格
- 使用 TypeScript 严格模式
- 遵循 Vue 3 Composition API 风格
- 组件使用 `<script setup>` 语法
- 使用 ESLint 检查代码质量

### 命名规范
- **组件文件**: PascalCase（如 `ProductCard.vue`）
- **工具文件**: camelCase（如 `request.ts`）
- **常量**: UPPER_SNAKE_CASE（如 `API_BASE_URL`）
- **变量/函数**: camelCase（如 `getUserInfo`）

### Git 提交规范
- `feat:` 新功能
- `fix:` 修复 Bug
- `docs:` 文档更新
- `style:` 代码格式调整
- `refactor:` 重构
- `perf:` 性能优化
- `test:` 测试相关
- `chore:` 构建/工具变动

## 部署

### 构建生产版本

```bash
npm run build
```

构建产物将生成在 `dist` 目录下。

### 部署到服务器

将 `dist` 目录下的所有文件部署到 Web 服务器（Nginx、Apache 等）。

### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/medication-sales-frontend/dist;
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

- Chrome >= 87
- Firefox >= 78
- Safari >= 14
- Edge >= 88

## 待优化项

- [ ] 清理遗留的 course 相关代码
- [ ] 完善错误处理机制
- [ ] 添加单元测试
- [ ] 添加 E2E 测试
- [ ] 优化移动端适配
- [ ] 添加药品评价功能
- [ ] 实现支付接口对接
- [ ] 添加搜索历史记录
- [ ] 实现商品收藏功能

## 许可证

MIT License

## 相关项目

- 后端项目: [Web_MedicationSalesSystem_backend](待补充)

## 贡献指南

欢迎提交 Issue 和 Pull Request。

## 技术支持

如有问题，请提交 Issue 或联系开发团队。
