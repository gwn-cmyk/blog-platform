# MongoDB Atlas 数据库查看指南

## 登录和导航
1. 访问 https://cloud.mongodb.com
2. 登录您的 MongoDB 账户
3. 在左侧导航栏选择 "Database"
4. 选择您的 "blog-cluster" 集群

## 查看数据库结构
### 步骤1：选择数据库
- 在集群页面，您会看到数据库名称
- 可能的数据库名称：
  - `blog-platform`
  - `test`
  - 其他自定义名称

### 步骤2：查看集合
- 点击数据库名称展开
- 您应该看到以下集合：
  - `users` - 用户数据
  - `posts` - 文章数据
  - `comments` - 评论数据

## 查看用户数据
### 步骤1：打开users集合
- 点击 `users` 集合
- 您会看到所有注册用户的列表

### 步骤2：理解用户文档结构
```json
{
  "_id": "ObjectId(...)",      // 用户唯一ID
  "username": "admin",          // 用户名
  "email": "admin@blog.com",    // 邮箱
  "password": "hashed_string",  // 加密密码
  "role": "user",              // 用户角色（需要改为admin）
  "avatar": "",                // 头像URL
  "bio": "",                   // 个人简介
  "createdAt": {               // 创建时间
    "$date": "2025-01-07T00:00:00Z"
  },
  "__v": 0                     // 版本号
}
```

## 修改用户角色
### 步骤1：找到目标用户
- 在users集合中找到您的用户
- 可以通过邮箱或用户名搜索

### 步骤2：编辑用户文档
1. 将鼠标悬停在用户文档上
2. 点击右侧的编辑按钮（铅笔图标）
3. 找到 "role" 字段
4. 将值从 "user" 改为 "admin"
5. 点击 "Save" 保存

### 步骤3：验证修改
- 刷新页面
- 确认 role 字段的值已改为 "admin"

## 查看文章数据
### 步骤1：打开posts集合
- 点击 `posts` 集合
- 如果没有数据，说明还没有创建文章

### 步骤2：文章文档结构
```json
{
  "_id": "ObjectId(...)",
  "title": "文章标题",
  "content": "文章内容",
  "excerpt": "文章摘要",
  "author": "ObjectId(...)",    // 作者ID
  "tags": ["标签1", "标签2"],
  "featuredImage": "default-post.jpg",
  "status": "published",         // published 或 draft
  "views": 0,                   // 浏览次数
  "likes": [],                  // 点赞用户ID列表
  "comments": [],               // 评论ID列表
  "createdAt": {
    "$date": "2025-01-07T00:00:00Z"
  },
  "updatedAt": {
    "$date": "2025-01-07T00:00:00Z"
  }
}
```

## 搜索和筛选
### 搜索用户
1. 在集合页面顶部有搜索框
2. 可以按字段搜索，如：`email: admin@blog.com`

### 筛选文档
1. 点击 "Filter" 按钮
2. 设置筛选条件
3. 例如：`{ "role": "user" }`

## 常见操作
### 创建新文档
1. 点击 "Insert Document"
2. 输入JSON数据
3. 点击 "Insert"

### 删除文档
1. 找到要删除的文档
2. 点击删除按钮（垃圾桶图标）
3. 确认删除

### 导出数据
1. 选择要导出的文档
2. 点击 "Export" 按钮
3. 选择导出格式（JSON）

## 故障排除
### 问题1：无法看到集合
- 检查数据库连接
- 确认集合存在
- 尝试刷新页面

### 问题2：无法修改文档
- 检查用户权限
- 确认不是只读模式
- 重新登录 MongoDB Atlas

### 问题3：数据不显示
- 检查网络连接
- 清除浏览器缓存
- 尝试使用其他浏览器