import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Home, Users, Plus, BarChart, Lock, Search, Bell } from 'lucide-react';
import './Layout.css';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  const navItems = [
    { text: "Home", icon: Home, path: "/" },
    { text: "Browse Groups", icon: Users, path: "/browse-groups" },
    { text: "Dashboard", icon: BarChart, path: "/user-dashboard" },
    { text: "Create Group", icon: Plus, path: "/create-group" },
  ];

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-content">
        <div className="nav-left">
          <h1 className="nav-brand" onClick={() => navigate('/')} style={{cursor: 'pointer'}}>
            Study<span className="brand-accent">Hive</span>
          </h1>
        </div>

        <div className={`nav-center ${isOpen ? 'active' : ''}`}>
          <div className={`nav-links`}>
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
          {isLoggedIn ? (
            <>
              <button className="notification-btn">
                <Bell size={18} />
                <span className="notification-badge">3</span>
              </button>
              <div className="user-profile" onClick={() => navigate('/profile')}>
                {user?.profileImage ? (
                  <img src={user.profileImage} alt="User" />
                ) : (
                  <div className="user-initial">
                    {user?.username?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="login-btn">Log in</Link>
              <Link to="/signup" className="signup-btn">Sign up</Link>
            </div>
          )}
          <button 
            className="mobile-toggle" 
            aria-label="Toggle menu" 
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} color="white" /> : <Menu size={24} color="white" />}
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
        <div className="footer-brand">
          <h2>StudyHive</h2>
          <p>Empowering collaborative learning worldwide</p>
        </div>
        <div className="footer-contact">
          <p>Have questions? <a href="mailto:sourabhkalburgi35@gmail.com">Let's connect!</a></p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2024 StudyHive. All rights reserved.</p>
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