import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Post } from '../types';
import api from '../services/api';

const Home: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // Initialize search from URL parameters
  useEffect(() => {
    const searchParam = searchParams.get('search');
    if (searchParam) {
      const decodedSearch = decodeURIComponent(searchParam);
      setSearch(decodedSearch);
      setSearchInput(decodedSearch);
    }
  }, [searchParams]);

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
    }
  }, []);

  useEffect(() => {
    fetchPosts(currentPage, search);
  }, [currentPage, search, fetchPosts]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setCurrentPage(1);
    // Update URL parameters
    if (searchInput.trim()) {
      setSearchParams({ search: searchInput.trim() });
    } else {
      setSearchParams({});
    }
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearch('');
    setCurrentPage(1);
    setSearchParams({});
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div className="container">
      <div style={{ marginBottom: '2rem' }}>
        <h1>博客文章</h1>
        <form onSubmit={handleSearchSubmit} className="search-container" style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', position: 'relative' }}>
          <input
            type="text"
            placeholder="搜索文章标题、内容或标签..."
            value={searchInput}
            onChange={handleSearchChange}
            className="form-control search-input"
            style={{ flex: 1, paddingRight: searchInput ? '2.5rem' : '1rem' }}
          />
          {searchInput && (
            <button
              type="button"
              onClick={clearSearch}
              className="search-clear-btn"
              style={{
                position: 'absolute',
                right: '2.5rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#6c757d',
                cursor: 'pointer',
                fontSize: '1.2rem',
                padding: '0.25rem'
              }}
            >
              ×
            </button>
          )}
          <button 
            type="submit" 
            className="btn btn-primary search-btn"
          >
            搜索
          </button>
        </form>
        
        {search && (
          <div className="search-results-info" style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6c757d' }}>
            <span>搜索结果: "{search}"</span>
            <button
              onClick={clearSearch}
              className="search-clear-link"
              style={{
                background: 'none',
                border: 'none',
                color: '#007bff',
                cursor: 'pointer',
                textDecoration: 'underline',
                marginLeft: '0.5rem',
                fontSize: '0.875rem'
              }}
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
          <p>{search ? '没有找到相关文章' : '暂无文章'}</p>
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