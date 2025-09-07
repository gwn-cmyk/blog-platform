const API_BASE_URL = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000');

const api = {
  // Auth
  login: (username: string, password: string) =>
    fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    }),

  register: (username: string, email: string, password: string) =>
    fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    }),

  getMe: (token: string) =>
    fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  // Posts
  getPosts: (page = 1, limit = 10, search = '') =>
    fetch(`${API_BASE_URL}/api/posts?page=${page}&limit=${limit}&search=${search}`),

  getPost: (id: string) =>
    fetch(`${API_BASE_URL}/api/posts/${id}`),

  createPost: (token: string, postData: any) =>
    fetch(`${API_BASE_URL}/api/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(postData),
    }),

  updatePost: (token: string, id: string, postData: any) =>
    fetch(`${API_BASE_URL}/api/posts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(postData),
    }),

  deletePost: (token: string, id: string) =>
    fetch(`${API_BASE_URL}/api/posts/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }),

  // Comments
  getComments: (postId: string) =>
    fetch(`${API_BASE_URL}/api/comments/post/${postId}`),

  createComment: (token: string, postId: string, content: string, parent?: string) =>
    fetch(`${API_BASE_URL}/api/posts/${postId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content, parent }),
    }),
};

export default api;