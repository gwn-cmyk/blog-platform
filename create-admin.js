const mongoose = require('mongoose');
require('dotenv').config();

// 连接数据库
mongoose.connect(process.env.MONGO_URI, {
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

// 创建管理员账户
async function createAdmin() {
  try {
    // 检查是否已存在管理员
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('✅ 管理员账户已存在');
      console.log('用户名:', existingAdmin.username);
      console.log('邮箱:', existingAdmin.email);
      process.exit(0);
    }

    // 创建新管理员
    const adminData = {
      username: 'admin',
      email: 'admin@blog.com',
      password: 'admin123',
      role: 'admin'
    };

    const admin = new User(adminData);
    const bcryptjs = require('bcryptjs');
    const salt = await bcryptjs.genSalt(10);
    admin.password = await bcryptjs.hash(admin.password, salt);
    await admin.save();

    console.log('✅ 管理员账户创建成功！');
    console.log('用户名:', admin.username);
    console.log('邮箱:', admin.email);
    console.log('密码:', adminData.password);
    console.log('角色:', admin.role);
    console.log('⚠️  请立即登录并修改密码！');

  } catch (error) {
    console.error('❌ 创建管理员失败:', error.message);
    process.exit(1);
  }
}

createAdmin();