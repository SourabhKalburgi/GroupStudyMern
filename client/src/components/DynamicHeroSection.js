  import React, { useState, useEffect } from 'react';
  import { Link } from 'react-router-dom';
  import { Video, Calendar, Book, Lightbulb, Users, Calculator, Atom, Rocket, PenTool } from 'lucide-react';
  import { motion, AnimatePresence } from 'framer-motion';
  import './DynamicHeroSection.css';

  const features = [
    { text: "Live Video Chat", color: "#513B56", icon: Video },
    { text: "Smart Scheduling", color: "#525174", icon: Calendar },
    { text: "Interactive Whiteboard", color: "#348AA7", icon: Book },
    { text: "AI Tutor Assist", color: "#4E598C", icon: Lightbulb },
    { text: "Find Study Buddies", color: "#341C1C", icon: Users }
  ];

  const studyIcons = [Calculator, Atom, Rocket, PenTool, Book];

  const DynamicHeroSection = () => {
    const [currentFeature, setCurrentFeature] = useState(0);
    const [backgroundColor, setBackgroundColor] = useState(features[0].color);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentFeature((prev) => (prev + 1) % features.length);
      }, 5000);

      return () => clearInterval(interval);
    }, []);

    useEffect(() => {
      setBackgroundColor(features[currentFeature].color);
    }, [currentFeature]);

    return (
      <motion.div 
        className="hero-section" 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, backgroundColor }}
        transition={{ duration: 1.5 }}
      >
        
        
        <motion.div 
          className={`sidebar ${sidebarOpen ? 'open' : ''}`}
          initial={{ x: "-100%" }}
          animate={{ x: sidebarOpen ? 0 : "-100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {features.map((feature, index) => (
            <motion.div 
              key={index} 
              className="sidebar-item"
              whileHover={{ scale: 1.05, x: 10 }}
            >
              <feature.icon size={20} />
              <span>{feature.text}</span>
            </motion.div>
          ))}
        </motion.div>
        <div className="content">
          <motion.h1 
            className="title"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            StudyHive
          </motion.h1>
          <motion.p 
            className="description"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Connect, collaborate, and achieve more.
          </motion.p>
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentFeature}
              className="feature-highlight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {React.createElement(features[currentFeature].icon, { size: 40, className: 'feature-icon' })}
              <span className="feature-text">{features[currentFeature].text}</span>
            </motion.div>
          </AnimatePresence>
          <div className="button-group">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/browse-groups" className="action-button primary">Join a Group</Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/create-group" className="action-button secondary">Create a Group</Link>
            </motion.div>
          </div>
        </div>
        <div className="background-icons">
          {studyIcons.map((IconComponent, index) => (
            <motion.div 
              key={index} 
              className="icon-wrapper"
              animate={{
                x: [0, 10, 0],
                y: [0, 10, 0],
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
                delay: index * 0.5,
              }}
            >
              <IconComponent size={50} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  };

  export default DynamicHeroSection;