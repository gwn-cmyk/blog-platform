const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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

const User = mongoose.model('User', new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
  avatar: { type: String, default: '' },
  bio: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
}));

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

const Comment = mongoose.model('Comment', new mongoose.Schema({
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
}));

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

const bcryptjs = require('bcryptjs');
const jsonwebtoken = require('jsonwebtoken');

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

const admin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: '需要管理员权限' });
  }
  next();
};

app.get('/', (req, res) => {
  res.json({
    message: '博客平台 API',
    version: '1.0.0',
    status: 'running'
  });
});

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
      .limit(limit);

    const total = await Post.countDocuments(query);

    // 处理文章作者信息
    const allAuthorIds = posts.map(post => post.author.toString());
    const uniqueAuthorIds = [...new Set(allAuthorIds)];
    const existingUsers = await User.find({ _id: { $in: uniqueAuthorIds } });
    const existingUserIds = existingUsers.map(user => user._id.toString());

    // 处理每篇文章的作者信息
    const processedPosts = posts.map(post => {
      const postObj = post.toObject();
      const authorExists = existingUserIds.includes(post.author.toString());
      
      if (!authorExists) {
        postObj.author = {
          _id: null,
          username: '已删除用户',
          avatar: ''
        };
      } else {
        const user = existingUsers.find(u => u._id.toString() === post.author.toString());
        postObj.author = {
          _id: user._id,
          username: user.username,
          avatar: user.avatar || ''
        };
      }
      return postObj;
    });

    res.status(200).json({
      success: true,
      count: processedPosts.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: processedPosts
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
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: '文章未找到'
      });
    }

    // 检查作者是否存在
    let author = null;
    if (post.author) {
      author = await User.findById(post.author);
    }

    // 如果作者不存在，设置为已删除用户
    if (!author) {
      post.author = {
        _id: null,
        username: '已删除用户',
        avatar: '',
        bio: ''
      };
    } else {
      post.author = {
        _id: author._id,
        username: author.username,
        avatar: author.avatar || '',
        bio: author.bio || ''
      };
    }

    post.views += 1;
    await post.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      data: post
    });
  } catch (err) {
    console.error('获取文章失败:', err);
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

app.get('/api/comments/post/:id', async (req, res) => {
  try {
    // 首先获取评论，不使用 populate，避免 populate 失败
    const comments = await Comment.find({ post: req.params.id, parent: null })
      .sort('createdAt');
    
    const replies = await Comment.find({ post: req.params.id, parent: { $ne: null } })
      .sort('createdAt');
    
    // 获取所有用户ID
    const allAuthorIds = [...comments, ...replies].map(comment => comment.author.toString());
    const uniqueAuthorIds = [...new Set(allAuthorIds)];
    
    // 查找存在的用户
    const existingUsers = await User.find({ _id: { $in: uniqueAuthorIds } });
    const existingUserIds = existingUsers.map(user => user._id.toString());
    
    // 处理评论
    const processComment = (comment) => {
      const commentObj = comment.toObject();
      const authorExists = existingUserIds.includes(comment.author.toString());
      
      if (!authorExists) {
        commentObj.author = {
          _id: null,
          username: '已删除用户',
          avatar: ''
        };
      } else {
        // 找到对应的用户信息
        const user = existingUsers.find(u => u._id.toString() === comment.author.toString());
        commentObj.author = {
          _id: user._id,
          username: user.username,
          avatar: user.avatar || ''
        };
      }
      return commentObj;
    };
    
    const commentsWithReplies = comments.map(comment => {
      const commentObj = processComment(comment);
      commentObj.replies = replies
        .filter(reply => 
          reply.parent && reply.parent.toString() === comment._id.toString()
        )
        .map(processComment);
      return commentObj;
    });
    
    res.json(commentsWithReplies);
  } catch (error) {
    console.error('获取评论失败:', error);
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

// 修复孤立评论的端点
app.post('/api/admin/fix-orphaned-comments', auth, admin, async (req, res) => {
  try {
    console.log('🔍 开始查找孤立的评论...');
    
    // 查找所有评论
    const allComments = await Comment.find();
    console.log(`📊 总共找到 ${allComments.length} 条评论`);
    
    // 查找所有存在的用户ID
    const allUsers = await User.find();
    const userIds = allUsers.map(user => user._id.toString());
    console.log(`👥 总共找到 ${allUsers.length} 个用户`);
    
    // 找出孤立的评论（引用不存在的用户）
    const orphanedComments = allComments.filter(comment => 
      !userIds.includes(comment.author.toString())
    );
    
    console.log(`🚨 发现 ${orphanedComments.length} 条孤立评论（引用已删除用户）`);
    
    if (orphanedComments.length === 0) {
      return res.json({
        success: true,
        message: '✅ 没有发现孤立评论，数据库状态良好',
        fixed: 0
      });
    }
    
    // 创建"已删除用户"用户
    let deletedUser = await User.findOne({ username: 'deleted_user' });
    
    if (!deletedUser) {
      deletedUser = new User({
        username: 'deleted_user',
        email: 'deleted@example.com',
        password: 'deleted_user_password',
        role: 'user',
        avatar: '',
        bio: '已删除的用户'
      });
      await deletedUser.save();
      console.log('✅ 已创建"已删除用户"账户');
    }
    
    // 更新孤立评论的作者
    console.log('🔄 正在更新孤立评论的作者...');
    
    for (const comment of orphanedComments) {
      comment.author = deletedUser._id;
      await comment.save();
    }
    
    console.log(`✅ 已更新 ${orphanedComments.length} 条评论的作者为"已删除用户"`);
    
    res.json({
      success: true,
      message: `✅ 已修复 ${orphanedComments.length} 条孤立评论`,
      fixed: orphanedComments.length
    });
    
  } catch (error) {
    console.error('❌ 修复过程中出错:', error);
    res.status(500).json({
      success: false,
      message: '修复过程中出错',
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 服务器运行在端口 ${PORT}`);
  console.log(`📝 API 地址: http://localhost:${PORT}`);
  console.log(`🌐 前端地址: http://localhost:3000`);
});