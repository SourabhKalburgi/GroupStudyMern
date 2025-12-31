import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Video, Calendar, Book, Lightbulb, Users, Calculator, Atom, Rocket, PenTool } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Modal from './Modal';
import './DynamicHeroSection.css';

const features = [
  { text: "Live Video Chat", color: "#8B5CF6", icon: Video, description: "Connect face-to-face with study partners" },
  { text: "AI Tutor Assist", color: "#EC4899", icon: Lightbulb, description: "24/7 intelligent learning support" },
  { text: "Find Study Buddies", color: "#10B981", icon: Users, description: "Match with perfect study partners" }
];

const studyIcons = [Calculator, Atom, Rocket, PenTool, Book];

const DynamicHeroSection = () => {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleCreateGroupClick = (e) => {
    e.preventDefault();
    if (isLoggedIn) {
      navigate('/create-group');
    } else {
      setShowAuthModal(true);
    }
  };

  return (
    <div className="hero-container">
      <div className="gradient-bg"></div>
      <div className="noise-overlay"></div>
      
      <div className="glass-shapes">
        <div className="glass-shape glass-1"></div>
        <div className="glass-shape glass-2"></div>
        <div className="glass-shape glass-3"></div>
      </div>
      
      <div className="hero-main-content">
        <div className="hero-content-wrapper">
          <div className="hero-title-container">
            <div className="badge">
              <span className="badge-icon">🚀</span>
              <span className="badge-text">The Future of Group Study</span>
            </div>
            
            <h1 className="main-title">
              Study<span className="title-accent">Hive</span>
            </h1>
            <div className="title-glow"></div>
            
            <p className="subtitle">
              Transform your learning experience
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`feature-card glass-effect ${currentFeature === index ? 'active' : ''}`}
                style={{
                  '--hover-color': feature.color,
                  '--delay': `${index * 0.1}s`
                }}
              >
                <div className="feature-content">
                  {React.createElement(feature.icon, {
                    size: 20,
                    className: "feature-icon"
                  })}
                  <div className="feature-text">
                    <h3>{feature.text}</h3>
                    <p>{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="action-buttons">
            <Link to="/browse-groups" className="action-button primary glass-effect">
              <span className="button-content">
                Join a Group
                <Users size={18} className="button-icon" />
              </span>
            </Link>
            <button 
              onClick={handleCreateGroupClick}
              className="action-button secondary glass-effect"
            >
              <span className="button-content">
                Create a Group
                <Rocket size={18} className="button-icon" />
              </span>
            </button>
          </div>
        </div>

        <div className="background-icons">
          {studyIcons.map((IconComponent, index) => (
            <div
              key={index}
              className="floating-icon"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                color: features[index % features.length].color,
                animationDelay: `${index * 0.7}s`
              }}
            >
              <IconComponent size={32} />
            </div>
          ))}
        </div>
      </div>

      <Modal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={() => {
          setShowAuthModal(false);
          navigate('/auth');
        }}
      />
    </div>
  );
};

export default DynamicHeroSection;