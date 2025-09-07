const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const jsonwebtoken = require('jsonwebtoken');

// 加载环境变量
dotenv.config();

const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 数据库连接
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/blog-platform', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB 连接成功');
})
.catch(err => {
  console.error('❌ MongoDB 连接失败:', err.message);
  process.exit(1);
});

// 用户模型
const User = mongoose.model('User', new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
  avatar: { type: String, default: '' },
  bio: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
}));

// 文章模型
const PostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  excerpt: { type: String, maxlength: [500, '摘要不能超过500字符'] },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tags: [{ type: String, trim: true }],
  featuredImage: { type: String, default: 'default-post.jpg' },
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  views: { type: Number, default: 0 },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  slug: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// 评论模型
const Comment = mongoose.model('Comment', new mongoose.Schema({
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
}));

// Post 模型的中间件
PostSchema.pre('save', function(next) {
  if (!this.isModified('title')) {
    return next();
  }
  
  this.slug = this.title
    .toLowerCase()
    .replace(/[^\w\s\u4e00-\u9fff]+/g, '')
    .replace(/\s+/g, '-');
  
  next();
});

PostSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Post = mongoose.model('Post', PostSchema);

// 认证中间件
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: '未提供认证令牌' });
    }
    const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET || 'default-secret');
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: '令牌无效' });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: '令牌无效' });
  }
};

// 管理员中间件
const admin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: '需要管理员权限' });
  }
  next();
};

// 根路由
app.get('/', (req, res) => {
  res.json({
    message: '博客平台 API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      auth: {
        login: 'POST /api/auth/login',
        register: 'POST /api/auth/register',
        me: 'GET /api/auth/me'
      },
      posts: {
        list: 'GET /api/posts',
        detail: 'GET /api/posts/:id',
        create: 'POST /api/posts',
        update: 'PUT /api/posts/:id',
        delete: 'DELETE /api/posts/:id'
      },
      comments: {
        list: 'GET /api/comments/post/:id',
        create: 'POST /api/posts/:id/comments'
      }
    }
  });
});

// 认证路由
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({ message: '用户已存在' });
    }

    user = new User({ username, email, password });
    const salt = await bcryptjs.genSalt(10);
    user.password = await bcryptjs.hash(password, salt);
    await user.save();

    const payload = { id: user.id };
    const token = jsonwebtoken.sign(payload, process.env.JWT_SECRET || 'default-secret', { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', details: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await User.findOne({ 
      $or: [
        { username: username }, 
        { email: username }
      ] 
    });
    
    if (!user) {
      return res.status(400).json({ message: '用户名或密码错误' });
    }

    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: '用户名或密码错误' });
    }

    const payload = { id: user.id };
    const token = jsonwebtoken.sign(payload, process.env.JWT_SECRET || 'default-secret', { expiresIn: '7d' });

    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio
    };

    res.json({
      message: '登录成功',
      token,
      user: userResponse
    });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', details: error.message });
  }
});

app.get('/api/auth/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// 文章路由
app.get('/api/posts', async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const sort = req.query.sort || '-createdAt';
    const search = req.query.search;

    let query = { status: 'published' };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    const posts = await Post.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('author', 'username avatar');

    const total = await Post.countDocuments(query);

    res.status(200).json({
      success: true,
      count: posts.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: posts
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: '服务器错误'
    });
  }
});

app.get('/api/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username avatar bio');

    if (!post) {
      return res.status(404).json({
        success: false,
        error: '文章未找到'
      });
    }

    post.views += 1;
    await post.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      data: post
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: '服务器错误'
    });
  }
});

app.post('/api/posts', auth, admin, async (req, res) => {
  try {
    const { title, content, excerpt, tags, featuredImage, status } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        error: '标题和内容是必需的'
      });
    }

    let slug = title
      .toLowerCase()
      .replace(/[^\w\s\u4e00-\u9fff]+/g, '')
      .replace(/\s+/g, '-');
    
    let existingPost = await Post.findOne({ slug });
    let counter = 1;
    while (existingPost) {
      slug = `${slug}-${counter}`;
      existingPost = await Post.findOne({ slug });
      counter++;
    }

    const post = new Post({
      title,
      content,
      excerpt: excerpt || '',
      author: req.user._id,
      tags: tags || [],
      featuredImage: featuredImage || 'default-post.jpg',
      status: status || 'published',
      slug
    });

    await post.save();

    const populatedPost = await Post.findById(post._id)
      .populate('author', 'username avatar');

    res.status(201).json({
      success: true,
      data: populatedPost
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: '服务器错误'
    });
  }
});

app.put('/api/posts/:id', auth, admin, async (req, res) => {
  try {
    let post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: '文章未找到'
      });
    }

    const { title, content, excerpt, tags, featuredImage, status } = req.body;

    if (title) post.title = title;
    if (content) post.content = content;
    if (excerpt) post.excerpt = excerpt;
    if (tags) post.tags = tags;
    if (featuredImage) post.featuredImage = featuredImage;
    if (status) post.status = status;
    
    post.updatedAt = new Date();

    await post.save();

    post = await Post.findById(req.params.id)
      .populate('author', 'username avatar bio');

    res.status(200).json({
      success: true,
      data: post
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: '服务器错误'
    });
  }
});

app.delete('/api/posts/:id', auth, admin, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: '文章未找到'
      });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: '服务器错误'
    });
  }
});

// 评论路由
app.get('/api/comments/post/:id', async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.id, parent: null })
      .populate('author', 'username avatar')
      .sort('createdAt');
    
    const replies = await Comment.find({ post: req.params.id, parent: { $ne: null } })
      .populate('author', 'username avatar')
      .sort('createdAt');
    
    const commentsWithReplies = comments.map(comment => {
      const commentObj = comment.toObject();
      commentObj.replies = replies.filter(reply => 
        reply.parent && reply.parent.toString() === comment._id.toString()
      );
      return commentObj;
    });
    
    res.json(commentsWithReplies);
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

app.post('/api/posts/:id/comments', auth, async (req, res) => {
  try {
    const { content, parent } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: '评论内容不能为空' });
    }
    
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: '文章未找到' });
    }

    const comment = new Comment({
      content,
      author: req.user.id,
      post: req.params.id,
      parent
    });

    await comment.save();
    await comment.populate('author', 'username avatar');

    post.comments.push(comment.id);
    await post.save();

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'API 运行正常',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? '已连接' : '未连接'
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({ message: '路由未找到' });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('服务器错误:', err.stack);
  res.status(500).json({ message: '服务器内部错误' });
});

// 导出 app
module.exports = app;