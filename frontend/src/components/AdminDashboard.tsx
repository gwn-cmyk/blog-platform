import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Post } from '../types';
import api from '../services/api';

const AdminDashboard: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await api.getPosts(1, 100);
      const data = await response.json();
      
      if (data.success) {
        setPosts(data.data);
      } else {
        setError('获取文章列表失败');
      }
    } catch (err) {
      setError('网络错误');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('确定要删除这篇文章吗？')) {
      return;
    }

    try {
      const response = await api.deletePost(token!, postId);
      if (response.ok) {
        setPosts(posts.filter(post => post._id !== postId));
      } else {
        setError('删除文章失败');
      }
    } catch (err) {
      setError('网络错误');
    }
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>管理后台</h1>
        <Link to="/create-post" className="btn btn-primary">
          创建新文章
        </Link>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="card">
        <h2>文章管理</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #ddd' }}>
              <th style={{ padding: '0.5rem', textAlign: 'left' }}>标题</th>
              <th style={{ padding: '0.5rem', textAlign: 'left' }}>作者</th>
              <th style={{ padding: '0.5rem', textAlign: 'left' }}>状态</th>
              <th style={{ padding: '0.5rem', textAlign: 'left' }}>发布时间</th>
              <th style={{ padding: '0.5rem', textAlign: 'left' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post._id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '0.5rem' }}>
                  <Link to={`/post/${post._id}`} style={{ textDecoration: 'none', color: '#333' }}>
                    {post.title}
                  </Link>
                </td>
                <td style={{ padding: '0.5rem' }}>{post.author.username}</td>
                <td style={{ padding: '0.5rem' }}>
                  <span style={{
                    backgroundColor: post.status === 'published' ? '#28a745' : '#ffc107',
                    color: 'white',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.875rem'
                  }}>
                    {post.status === 'published' ? '已发布' : '草稿'}
                  </span>
                </td>
                <td style={{ padding: '0.5rem' }}>
                  {new Date(post.createdAt).toLocaleDateString()}
                </td>
                <td style={{ padding: '0.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Link
                      to={`/edit-post/${post._id}`}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}
                    >
                      编辑
                    </Link>
                    <button
                      onClick={() => handleDeletePost(post._id)}
                      className="btn btn-danger"
                      style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}
                    >
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {posts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>暂无文章</p>
            <Link to="/create-post" className="btn btn-primary">
              创建第一篇文章
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;