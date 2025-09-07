# 部署验证指南

## 当前状态
您的博客平台已成功部署到Vercel，但需要验证功能是否正常。

## Vercel部署信息
- **项目名称**: blog-platform-gwn-cmyk
- **部署URL**: https://blog-platform-gwn-cmyk.vercel.app
- **GitHub仓库**: https://github.com/gwn-cmyk/blog-platform

## 环境变量配置
请确保在Vercel项目中设置了以下环境变量：

1. **MONGO_URI**: `mongodb+srv://blog-admin:MyDB123456@blog-cluster.gabopne.mongodb.net/?retryWrites=true&w=majority&appName=blog-cluster`
2. **JWT_SECRET**: `my-super-secret-jwt-key-12345`
3. **NODE_ENV**: `production`

## 验证步骤

### 1. 检查网站是否可以访问
访问: https://blog-platform-gwn-cmyk.vercel.app

### 2. 测试API健康检查
```bash
curl https://blog-platform-gwn-cmyk.vercel.app/api/health
```

### 3. 创建管理员账户
```bash
curl -X POST https://blog-platform-gwn-cmyk.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@blog.com", 
    "password": "admin123",
    "role": "admin"
  }'
```

### 4. 登录管理员账户
```bash
curl -X POST https://blog-platform-gwn-cmyk.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@blog.com",
    "password": "admin123"
  }'
```

### 5. 测试文章创建功能
获取登录返回的token后：
```bash
curl -X POST https://blog-platform-gwn-cmyk.vercel.app/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "测试文章",
    "content": "这是一篇测试文章的内容",
    "category": "测试"
  }'
```

## 前端功能验证

### 主要页面路由
- **首页**: `/` - 显示文章列表
- **登录**: `/login` - 用户登录
- **注册**: `/register` - 用户注册
- **文章详情**: `/posts/:id` - 查看文章详情和评论
- **管理面板**: `/admin` - 管理员功能（需要登录）

### 功能测试清单
1. [ ] 用户注册功能
2. [ ] 用户登录功能
3. [ ] 文章列表显示
4. [ ] 文章详情查看
5. [ ] 评论功能
6. [ ] 管理员登录
7. [ ] 管理员创建文章
8. [ ] 管理员编辑文章
9. [ ] 管理员删除文章
10. [ ] 管理员删除评论

## 故障排除

### 常见问题
1. **500错误**: 检查环境变量是否正确设置
2. **数据库连接失败**: 验证MONGO_URI是否正确
3. **JWT认证失败**: 检查JWT_SECRET是否设置
4. **前端无法访问API**: 检查CORS配置

### 检查Vercel日志
1. 访问Vercel控制台
2. 进入项目设置
3. 查看Functions日志
4. 检查错误信息

### 本地测试
如果需要本地测试，可以：
1. 克隆项目到本地
2. 安装依赖: `npm install`
3. 设置本地环境变量
4. 运行开发服务器: `npm run dev`

## 技术支持
如果遇到问题，请检查：
1. Vercel部署状态
2. 环境变量配置
3. MongoDB Atlas连接状态
4. 浏览器控制台错误信息