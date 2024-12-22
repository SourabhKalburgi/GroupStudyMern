import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Video, Calendar, Book, Lightbulb, Users, Calculator, Atom, Rocket, PenTool } from 'lucide-react';
import './DynamicHeroSection.css';

const features = [
  { text: "Live Video Chat", color: "#FF6B6B", icon: Video },
  { text: "Smart Scheduling", color: "#4ECDC4", icon: Calendar },
  { text: "AI Tutor Assist", color: "#FFE66D", icon: Lightbulb },
  { text: "Find Study Buddies", color: "#FF8364", icon: Users }
];

const studyIcons = [Calculator, Atom, Rocket, PenTool, Book];

const DynamicHeroSection = () => {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hero-container">
      {/* Decorative shapes */}
      <div className="shape shape-1"></div>
      <div className="shape shape-2"></div>
      
      {/* Floating elements */}
      <div className="floating-elements">
        {[...Array(20)].map((_, index) => (
          <div
            key={index}
            className="floating-square"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: features[index % features.length].color,
              animationDelay: `${index * 0.3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="hero-main-content">

        <div className="hero-content-wrapper">
          <div className="hero-title-container">
            <h1 className="main-title">
              Study<span className="title-accent">Hive</span>
            </h1>
            <div className="title-decoration-1"></div>
            <div className="title-decoration-2"></div>
          </div>
          
          <p className="subtitle">
            Connect, collaborate, and achieve more.
          </p>

          <div 
            className="feature-showcase"
            style={{ backgroundColor: `${features[currentFeature].color}20` }}
          >
            <div className="feature-content">
              {React.createElement(features[currentFeature].icon, {
                size: 48,
                style: { color: features[currentFeature].color }
              })}
              <span>{features[currentFeature].text}</span>
            </div>
          </div>

          <div className="action-buttons">
            <Link to="/browse-groups" className="action-button primary">
              Join a Group
            </Link>
            <Link to="/create-group" className="action-button secondary">
              Create a Group
            </Link>
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
                animationDelay: `${index * 0.5}s`
              }}
            >
              <IconComponent size={40} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DynamicHeroSection;