# 博客平台

一个基于 Node.js 和 React 的全栈博客平台，支持 Vercel 部署。

## 功能特性

- ✅ 用户注册登录系统
- ✅ 管理员文章管理（创建、编辑、删除）
- ✅ 用户评论系统（支持回复）
- ✅ 权限控制（管理员 vs 普通用户）
- ✅ MongoDB 数据库支持
- ✅ 响应式设计
- ✅ 本地开发和生产环境分离

## 技术栈

### 后端
- Node.js + Express
- MongoDB + Mongoose
- JWT 认证
- bcryptjs 密码加密

### 前端
- React 18 + TypeScript
- React Router
- Axios
- 自定义 CSS

## 项目结构

```
blog-platform/
├── api/                 # Vercel 部署的 API
│   └── index.js        # 后端 API 代码
├── server/             # 本地开发服务器
│   └── index.js        # 本地服务器代码
├── frontend/           # React 前端应用
│   ├── public/         # 静态文件
│   ├── src/            # 源代码
│   │   ├── components/ # 组件
│   │   ├── contexts/   # React Context
│   │   ├── services/   # API 服务
│   │   ├── types/      # TypeScript 类型
│   │   └── ...
│   └── package.json    # 前端依赖
├── uploads/            # 文件上传目录
├── package.json        # 根目录依赖
├── .env.example        # 环境变量模板
├── .gitignore          # Git 忽略文件
└── vercel.json         # Vercel 配置
```

## 本地开发

### 1. 安装依赖

```bash
# 安装根目录依赖
npm install

# 安装前端依赖
cd frontend
npm install
```

### 2. 环境配置

复制 `.env.example` 为 `.env` 并配置：

```bash
# MongoDB 连接字符串
MONGO_URI=mongodb://localhost:27017/blog-platform

# JWT 密钥
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# 运行环境
NODE_ENV=development

# 服务器端口
PORT=5000
```

### 3. 启动 MongoDB

确保 MongoDB 已安装并运行：

```bash
# macOS
brew services start mongodb-community

# Ubuntu
sudo systemctl start mongod

# Windows
net start MongoDB
```

### 4. 启动开发服务器

```bash
# 在项目根目录
npm run dev
```

这将同时启动：
- 后端服务器：http://localhost:5000
- 前端开发服务器：http://localhost:3000

## Vercel 部署

### 1. 连接 GitHub 仓库

1. 将代码推送到 GitHub
2. 登录 Vercel (vercel.com)
3. 点击 "New Project"
4. 选择你的 GitHub 仓库

### 2. 配置环境变量

在 Vercel 项目设置中添加环境变量：

```
MONGO_URI = 你的 MongoDB 连接字符串
JWT_SECRET = 你的 JWT 密钥
NODE_ENV = production
```

### 3. 部署

Vercel 会自动检测项目配置并部署。部署完成后，你的博客平台就可以通过 Vercel 提供的域名访问了。

## 默认管理员账号

为了设置管理员账号，你需要在 MongoDB 中手动创建一个管理员用户：

```javascript
// 在 MongoDB 中执行
db.users.insertOne({
  username: "admin",
  email: "admin@example.com",
  password: "$2a$10$...", // 使用 bcryptjs 加密的密码
  role: "admin",
  createdAt: new Date()
})
```

或者你也可以在代码中添加一个初始化脚本来创建默认管理员。

## API 接口

### 认证接口
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息

### 文章接口
- `GET /api/posts` - 获取文章列表
- `GET /api/posts/:id` - 获取文章详情
- `POST /api/posts` - 创建文章（管理员）
- `PUT /api/posts/:id` - 更新文章（管理员）
- `DELETE /api/posts/:id` - 删除文章（管理员）

### 评论接口
- `GET /api/comments/post/:id` - 获取文章评论
- `POST /api/posts/:id/comments` - 发表评论

## 许可证

MIT License