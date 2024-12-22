import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Home, Users, Plus, BarChart, Lock } from 'lucide-react';
import './Layout.css';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { text: "Home", icon: Home, path: "/" },
    { text: "Join a group", icon: Users, path: "/browse-groups" },
    { text: "Dashboard and Insights", icon: BarChart, path: "/user-dashboard" },
    { text: "Create a group", icon: Plus, path: "/create-group" },
    { text: "Login/Signup", icon: Lock, path: "/profile" },
  ];

  return (
    <nav className="navbar">
      <div className="nav-content">
        <div className="nav-left">
          <h1 className="nav-brand" onClick={() => navigate('/')} style={{cursor: 'pointer'}}>StudyHive</h1>
          <div className={`nav-links ${isOpen ? 'active' : ''}`}>
            {navItems.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => setIsOpen(false)}
              >
                <item.icon />
                <span>{item.text}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="nav-right">
          <div className="user-profile" onClick={() => navigate('/profile')}>
            {isLoggedIn && user?.profileImage ? (
              <img src={user.profileImage} alt="User" />
            ) : (
              <div className="user-initial">
                {isLoggedIn ? user?.username?.charAt(0).toUpperCase() : '?'}
              </div>
            )}
          </div>
          <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; 2024 StudyHive. All rights reserved.</p>
        <nav className="footer-links">
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
        </nav>
      </div>
    </footer>
  );
};

export const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Navbar />
      <main className="main-content">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;