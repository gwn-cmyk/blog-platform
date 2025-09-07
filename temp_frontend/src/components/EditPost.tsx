import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Post } from '../types';
import api from '../services/api';

const EditPost: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('published');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchPost();
    }
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await api.getPost(id!);
      const data = await response.json();
      
      if (data.success) {
        setPost(data.data);
        setTitle(data.data.title);
        setContent(data.data.content);
        setExcerpt(data.data.excerpt || '');
        setTags(data.data.tags.join(', '));
        setStatus(data.data.status);
      } else {
        setError('获取文章失败');
      }
    } catch (err) {
      setError('网络错误');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!title.trim() || !content.trim()) {
      setError('标题和内容不能为空');
      setLoading(false);
      return;
    }

    try {
      const postData = {
        title: title.trim(),
        content: content.trim(),
        excerpt: excerpt.trim(),
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        status
      };

      const response = await api.updatePost(token!, id!, postData);
      const data = await response.json();

      if (data.success) {
        navigate(`/post/${id}`);
      } else {
        setError(data.error || '更新文章失败');
      }
    } catch (err) {
      setError('网络错误');
    } finally {
      setLoading(false);
    }
  };

  if (!post) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div className="container">
      <div className="card">
        <h1>编辑文章</h1>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">标题 *</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="excerpt">摘要</label>
            <textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="form-control"
              rows={3}
              maxLength={500}
            />
            <small style={{ color: '#666' }}>
              {excerpt.length}/500 字符
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="content">内容 *</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="form-control"
              rows={10}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="tags">标签</label>
            <input
              type="text"
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="form-control"
              placeholder="用逗号分隔多个标签"
            />
          </div>

          <div className="form-group">
            <label htmlFor="status">状态</label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
              className="form-control"
            >
              <option value="draft">草稿</option>
              <option value="published">发布</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? '更新中...' : '更新文章'}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/post/${id}`)}
              className="btn btn-secondary"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPost;