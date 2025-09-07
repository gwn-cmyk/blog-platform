import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import PostDetail from './components/PostDetail';
import CreatePost from './components/CreatePost';
import EditPost from './components/EditPost';
import Profile from './components/Profile';
import AdminDashboard from './components/AdminDashboard';
import './App.css';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <div className="App">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/post/:id" element={<PostDetail />} />
            <Route path="/create-post" element={<ProtectedRoute component={CreatePost} adminOnly={true} />} />
            <Route path="/edit-post/:id" element={<ProtectedRoute component={EditPost} adminOnly={true} />} />
            <Route path="/profile" element={<ProtectedRoute component={Profile} />} />
            <Route path="/admin" element={<ProtectedRoute component={AdminDashboard} adminOnly={true} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
};

interface ProtectedRouteProps {
  component: React.ComponentType<any>;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ component: Component, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <Component />;
};

export default App;