import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="header">
      <div className="container">
        <nav className="nav">
          <div className="nav-brand">
            <Link to="/" style={{ textDecoration: 'none', color: '#333', fontSize: '1.5rem', fontWeight: 'bold' }}>
              博客平台
            </Link>
          </div>
          
          <ul className="nav-links">
            <li><Link to="/">首页</Link></li>
            {user && user.role === 'admin' && (
              <>
                <li><Link to="/admin">管理后台</Link></li>
                <li><Link to="/create-post">写文章</Link></li>
              </>
            )}
            {user && (
              <li><Link to="/profile">个人中心</Link></li>
            )}
          </ul>

          <div className="nav-auth">
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span>欢迎, {user.username}</span>
                <button className="btn btn-secondary" onClick={logout}>
                  退出登录
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Link to="/login" className="btn btn-secondary">
                  登录
                </Link>
                <Link to="/register" className="btn btn-primary">
                  注册
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;