import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Post } from '../types';
import api from '../services/api';

const Home: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // 防抖函数
  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  const fetchPosts = useCallback(async (page: number, searchQuery: string = '') => {
    try {
      setLoading(true);
      const response = await api.getPosts(page, 10, searchQuery);
      const data = await response.json();
      
      if (data.success) {
        setPosts(data.data);
        setTotalPages(data.pagination.pages);
        setError('');
      } else {
        setError('获取文章列表失败');
      }
    } catch (err) {
      setError('网络错误');
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  }, []);

  // 创建防抖版本的搜索函数
  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      setSearch(searchQuery);
      setCurrentPage(1);
      setIsSearching(false);
    }, 500),
    []
  );

  useEffect(() => {
    fetchPosts(currentPage, search);
  }, [currentPage, search, fetchPosts]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    setIsSearching(true);
    
    if (value === '') {
      // 如果搜索框为空，立即清除搜索
      setSearch('');
      setCurrentPage(1);
      setIsSearching(false);
    } else {
      // 否则使用防抖搜索
      debouncedSearch(value);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setCurrentPage(1);
    setIsSearching(false);
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearch('');
    setCurrentPage(1);
    setIsSearching(false);
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div className="container">
      <div style={{ marginBottom: '2rem' }}>
        <h1>博客文章</h1>
        <form onSubmit={handleSearchSubmit} className="search-container" style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              placeholder="搜索文章标题、内容或标签..."
              value={searchInput}
              onChange={handleSearchChange}
              className="search-input"
            />
            {searchInput && (
              <button
                type="button"
                onClick={clearSearch}
                className="search-clear-btn"
                title="清除搜索"
              >
                ×
              </button>
            )}
            {isSearching && (
              <div className={`search-indicator ${isSearching ? 'search-loading' : ''}`}>
                搜索中...
              </div>
            )}
          </div>
          <button 
            type="submit" 
            className="search-btn"
            disabled={isSearching}
          >
            {isSearching ? '搜索中...' : '搜索'}
          </button>
        </form>
        {search && (
          <div className="search-results-info">
            <span>搜索结果: "{search}"</span>
            <button
              onClick={clearSearch}
              className="search-clear-link"
            >
              清除搜索
            </button>
          </div>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="posts-grid">
        {posts.map((post) => (
          <div key={post._id} className="card">
            <h2>
              <Link to={`/post/${post._id}`} style={{ textDecoration: 'none', color: '#333' }}>
                {post.title}
              </Link>
            </h2>
            <div className="post-meta">
              <span>作者: {post.author.username}</span>
              <span>发布时间: {new Date(post.createdAt).toLocaleDateString()}</span>
              <span>阅读量: {post.views}</span>
            </div>
            {post.excerpt && (
              <p className="post-content">{post.excerpt}</p>
            )}
            {post.tags.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                {post.tags.map((tag, index) => (
                  <span
                    key={index}
                    style={{
                      backgroundColor: '#e9ecef',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.875rem',
                      marginRight: '0.5rem',
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            <div style={{ marginTop: '1rem' }}>
              <Link to={`/post/${post._id}`} className="btn btn-primary">
                阅读全文
              </Link>
            </div>
          </div>
        ))}
      </div>

      {posts.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>暂无文章</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            上一页
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={currentPage === page ? 'active' : ''}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;