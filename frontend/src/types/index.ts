export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  avatar?: string;
  bio?: string;
}

export interface Post {
  _id: string;
  title: string;
  content: string;
  excerpt: string;
  author: User | null;
  tags: string[];
  featuredImage: string;
  status: 'draft' | 'published';
  views: number;
  likes: string[];
  comments: string[];
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  content: string;
  author: User | null;
  post: string;
  parent?: string;
  likes: string[];
  createdAt: string;
  replies?: Comment[];
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface PostResponse {
  success: boolean;
  count: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  data: Post[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}