import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Profile: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="container">
      <div className="card">
        <h1>个人中心</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem' }}>
          {user.avatar && (
            <img 
              src={user.avatar} 
              alt={user.username}
              style={{ width: '100px', height: '100px', borderRadius: '50%' }}
            />
          )}
          <div>
            <h2>{user.username}</h2>
            <p>邮箱: {user.email}</p>
            <p>角色: {user.role === 'admin' ? '管理员' : '普通用户'}</p>
          </div>
        </div>
        
        {user.bio && (
          <div className="form-group">
            <h3>个人简介</h3>
            <p>{user.bio}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;