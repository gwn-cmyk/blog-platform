const mongoose = require('mongoose');

// 数据库连接配置
const mongoURI = 'mongodb+srv://blog-admin:MyDB123456@blog-cluster.gabopne.mongodb.net/?retryWrites=true&w=majority&appName=blog-cluster';

console.log('正在测试MongoDB连接...');
console.log('连接字符串:', mongoURI);

// 连接选项
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

mongoose.connect(mongoURI, options)
  .then(() => {
    console.log('✅ MongoDB 连接成功！');
    console.log('数据库名称:', mongoose.connection.name);
    console.log('连接状态:', mongoose.connection.readyState === 1 ? '已连接' : '未连接');
    
    // 测试创建集合
    const testSchema = new mongoose.Schema({
      name: String,
      createdAt: { type: Date, default: Date.now }
    });
    
    const TestModel = mongoose.model('Test', testSchema);
    
    // 关闭连接
    mongoose.connection.close();
    console.log('✅ 连接测试完成，已关闭连接');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ MongoDB 连接失败:');
    console.error('错误信息:', err.message);
    console.error('错误代码:', err.code);
    console.error('错误名称:', err.name);
    
    if (err.name === 'MongoNetworkError') {
      console.error('网络错误 - 请检查:');
      console.error('1. 连接字符串是否正确');
      console.error('2. 网络是否可以访问MongoDB Atlas');
      console.error('3. IP白名单是否配置正确');
    } else if (err.name === 'MongoServerError' && err.code === 18) {
      console.error('认证失败 - 请检查:');
      console.error('1. 用户名密码是否正确');
      console.error('2. 用户是否有访问权限');
    }
    
    process.exit(1);
  });