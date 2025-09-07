# 管理员账户设置指南

## 默认管理员账户

由于本地环境权限问题，您可以直接在部署的应用中注册管理员账户：

### 方法1：使用API直接创建管理员

在您的Vercel部署URL中，使用以下API调用：

```bash
curl -X POST https://your-app.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@yourblog.com", 
    "password": "admin123",
    "role": "admin"
  }'
```

### 方法2：通过前端界面注册

1. 访问您的Vercel部署URL
2. 点击"注册"按钮
3. 填写管理员信息：
   - 用户名: admin
   - 邮箱: admin@yourblog.com
   - 密码: admin123
4. 注册后，您需要在数据库中手动将角色改为"admin"

### 方法3：使用MongoDB Atlas手动创建

1. 登录您的MongoDB Atlas控制台
2. 进入blog-cluster数据库
3. 在users集合中插入以下文档：

```json
{
  "username": "admin",
  "email": "admin@yourblog.com",
  "password": "$2a$10$YourHashedPasswordHere",
  "role": "admin",
  "avatar": "",
  "bio": "",
  "createdAt": {
    "$date": "2025-01-01T00:00:00Z"
  }
}
```

### 密码哈希说明

如果您需要手动创建管理员账户，密码"admin123"的bcrypt哈希值为：
```
$2a$10$N9qo8uLOickgx2ZMRZoMy.MrqK3a7GJKd6HhTm5fF6V8tF5W8fF9K
```

## 验证部署功能

### 1. 检查API连接
```bash
curl https://your-app.vercel.app/api/health
```

### 2. 测试用户注册/登录
```bash
# 注册用户
curl -X POST https://your-app.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "email": "test@example.com", "password": "password123"}'

# 登录用户
curl -X POST https://your-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

### 3. 测试文章功能（需要管理员权限）
```bash
# 创建文章（需要token）
curl -X POST https://your-app.vercel.app/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"title": "测试文章", "content": "这是一篇测试文章的内容", "category": "测试"}'
```

## 常见问题检查

1. **环境变量**: 确保Vercel中设置了正确的环境变量
2. **数据库连接**: 检查MongoDB Atlas连接字符串
3. **JWT密钥**: 确保JWT_SECRET已设置
4. **CORS配置**: 检查前端是否能正确访问API

## 前端路由检查

- 首页: `/`
- 登录: `/login`
- 注册: `/register`
- 文章列表: `/posts`
- 文章详情: `/posts/:id`
- 管理面板: `/admin`（需要管理员权限）