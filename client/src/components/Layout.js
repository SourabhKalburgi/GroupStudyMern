import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Home, Users, Plus, BarChart, Lock} from 'lucide-react';
import './Layout.css';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const features = [
    { text: "Home", icon: Home, path: "/" },
    { text: "Join a group", icon: Users, path: "/browse-groups" },
    { text: "Dashboard and Insights", icon: BarChart, path: "/user-dashboard" },
    { text: "Create a group", icon: Plus, path: "/create-group" },
    { text: "Login/Signup", icon: Lock, path: "/profile" },
  ];

  return (
    <>
      <button className="sidebar-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        {features.map((feature, index) => (
          <Link
            key={index}
            to={feature.path}
            className={`sidebar-item ${location.pathname === feature.path ? 'active' : ''}`}
            onClick={() => setIsOpen(false)}
          >
            <feature.icon size={20} />
            <span>{feature.text}</span>
          </Link>
        ))}
      </div>
    </>
  );
};


const UserCircle = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user, loading } = useAuth();

  const handleClick = () => {
    if (isLoggedIn) {
      navigate('/profile');
    } else {
      navigate('/auth');
    }
  };

  if (loading) {
    return <div className="user-circle">Loading...</div>;
  }

  return (
    <div className="user-circle" onClick={handleClick}>
      {isLoggedIn && user?.profileImage ? (
        <img src={user.profileImage} alt="User" className="user-image" />
      ) : (
        <div className="default-user-icon">
          {isLoggedIn ? user?.username?.charAt(0).toUpperCase() : '?'}
        </div>
      )}
    </div>
  );
};

const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <p>&copy; 2024 Group Study App. All rights reserved.</p>
        <nav>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
        </nav>
      </div>
    </footer>
  );
};

const Layout = ({ children }) => {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <UserCircle />
        {children}
      </div>
      <Footer />
    </div>
  );
};

export { Layout, Sidebar, UserCircle, Footer };