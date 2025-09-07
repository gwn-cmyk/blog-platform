// 在浏览器控制台中运行此脚本
// 首先访问您的博客平台首页，然后按F12打开控制台，粘贴此代码并运行

async function createAdminUser() {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'admin',
        email: 'admin@blog.com',
        password: 'admin123',
        role: 'admin'
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ 管理员账户创建成功！');
      console.log('用户信息:', result.user);
      console.log('Token:', result.token);
      
      // 自动登录
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      
      alert('管理员账户创建成功！用户名: admin, 密码: admin123');
    } else {
      console.error('❌ 创建失败:', result);
      alert('创建失败: ' + (result.message || '未知错误'));
    }
  } catch (error) {
    console.error('❌ 网络错误:', error);
    alert('网络错误，请检查数据库连接');
  }
}

// 运行创建函数
createAdminUser();