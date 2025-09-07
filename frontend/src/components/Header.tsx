import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery('');
    navigate('/');
  };

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

          <div className="nav-search">
            <form onSubmit={handleSearchSubmit} className="nav-search-form">
              <div className="nav-search-container" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="搜索文章..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  className="nav-search-input"
                  style={{
                    padding: '0.5rem 2rem 0.5rem 1rem',
                    border: '1px solid #ddd',
                    borderRadius: '20px',
                    outline: 'none',
                    fontSize: '0.9rem',
                    width: isSearchFocused ? '250px' : '180px',
                    transition: 'width 0.3s ease',
                    backgroundColor: '#f8f9fa'
                  }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="nav-search-clear"
                    style={{
                      position: 'absolute',
                      right: '2.5rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#6c757d',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      padding: '0.1rem'
                    }}
                  >
                    ×
                  </button>
                )}
                <button
                  type="submit"
                  className="nav-search-btn"
                  style={{
                    position: 'absolute',
                    right: '0.5rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#6c757d',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    padding: '0.2rem'
                  }}
                >
                  🔍
                </button>
              </div>
            </form>
          </div>

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