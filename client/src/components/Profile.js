import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Layout } from './Layout';
import './Profile.css';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };
  const handleDashboardNavigation = () => {
    navigate('/user-dashboard');
  };
  return (
    <Layout>
      <div className="profile-container">
        <h1 className="page-title">Profile</h1>
        <div className="profile-details">
          <h2>User Details</h2>
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </div>
        <button className="dashboard-button" onClick={handleDashboardNavigation}>
          Dashboard
        </button>

        <div className="logout-section">
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;