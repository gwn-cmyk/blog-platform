import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Post, Comment } from '../types';
import api from '../services/api';

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, token } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchPost();
      fetchComments();
    }
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await api.getPost(id!);
      const data = await response.json();
      
      if (data.success) {
        setPost(data.data);
      } else {
        setError('获取文章失败');
      }
    } catch (err) {
      setError('网络错误');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await api.getComments(id!);
      const data = await response.json();
      
      if (response.ok) {
        setComments(data);
      }
    } catch (err) {
      console.error('获取评论失败:', err);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newComment.trim()) return;

    try {
      const response = await api.createComment(token, id!, newComment);
      if (response.ok) {
        setNewComment('');
        fetchComments();
      }
    } catch (err) {
      console.error('发表评论失败:', err);
    }
  };

  const handleReplySubmit = async (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    if (!token || !replyContent.trim()) return;

    try {
      const response = await api.createComment(token, id!, replyContent, parentId);
      if (response.ok) {
        setReplyContent('');
        setReplyTo(null);
        fetchComments();
      }
    } catch (err) {
      console.error('回复评论失败:', err);
    }
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  if (error || !post) {
    return (
      <div className="container">
        <div className="error-message">{error || '文章不存在'}</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <h1>{post.title}</h1>
        <div className="post-meta">
          <span>作者: {post.author.username}</span>
          <span>发布时间: {new Date(post.createdAt).toLocaleDateString()}</span>
          <span>阅读量: {post.views}</span>
        </div>
        {post.featuredImage && post.featuredImage !== 'default-post.jpg' && (
          <img 
            src={`/uploads/${post.featuredImage}`} 
            alt={post.title}
            style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px', margin: '1rem 0' }}
          />
        )}
        <div className="post-content">
          {post.content.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
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
      </div>

      <div className="comments-section">
        <h2>评论 ({comments.length})</h2>
        
        {user ? (
          <form onSubmit={handleCommentSubmit} className="card">
            <div className="form-group">
              <label htmlFor="comment">发表评论</label>
              <textarea
                id="comment"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="form-control"
                rows={4}
                placeholder="写下你的评论..."
              />
            </div>
            <button type="submit" className="btn btn-primary">
              发表评论
            </button>
          </form>
        ) : (
          <div className="card">
            <p>请 <Link to="/login">登录</Link> 后发表评论</p>
          </div>
        )}

        <div style={{ marginTop: '2rem' }}>
          {comments.map((comment) => (
            <div key={comment._id}>
              <div className="comment">
                <div className="comment-author">{comment.author.username}</div>
                <div className="comment-content">{comment.content}</div>
                <div className="comment-date">
                  {new Date(comment.createdAt).toLocaleDateString()}
                  {user && (
                    <button
                      onClick={() => setReplyTo(comment._id)}
                      className="btn btn-secondary"
                      style={{ marginLeft: '1rem', fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}
                    >
                      回复
                    </button>
                  )}
                </div>

                {replyTo === comment._id && (
                  <form onSubmit={(e) => handleReplySubmit(e, comment._id)} style={{ marginTop: '1rem' }}>
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      className="form-control"
                      rows={3}
                      placeholder="回复评论..."
                      style={{ marginBottom: '0.5rem' }}
                    />
                    <div>
                      <button type="submit" className="btn btn-primary" style={{ marginRight: '0.5rem' }}>
                        回复
                      </button>
                      <button
                        type="button"
                        onClick={() => setReplyTo(null)}
                        className="btn btn-secondary"
                      >
                        取消
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {comment.replies && comment.replies.map((reply) => (
                <div key={reply._id} className="comment reply">
                  <div className="comment-author">{reply.author.username}</div>
                  <div className="comment-content">{reply.content}</div>
                  <div className="comment-date">
                    {new Date(reply.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PostDetail;