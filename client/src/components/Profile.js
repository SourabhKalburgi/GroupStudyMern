import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Layout } from './Layout';
import Modal from './Modal';
import './Profile.css';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(!user);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const handleDashboardNavigation = () => {
    navigate('/user-dashboard');
  };

  const handleModalClose = () => {
    navigate('/'); // Redirect to the home page or any desired route
    setIsModalOpen(false);
  };

  const handleLogin = () => {
    navigate('/auth'); // Redirect to login/signup page
  };

  return (
    <Layout>
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onLogin={handleLogin}
      />
      {!isModalOpen && (
        <div className="profile-container">
          <h1 className="page-title">Profile</h1>
          <div className="profile-details">
            <h2>User Details</h2>
            <p><strong>Username:</strong> {user?.username}</p>
            <p><strong>Email:</strong> {user?.email}</p>
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
      )}
    </Layout>
  );
};

export default Profile;
