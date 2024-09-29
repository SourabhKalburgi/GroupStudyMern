import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from './Layout';
import './CreateGroup.css';
import config from '../config';

const CreateGroup = () => {
  const [groupData, setGroupData] = useState({
    name: '',
    description: '',
    icon: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setGroupData({ ...groupData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem('token'); // Get token from localStorage
    
    if (!token) {
      setError('No token, authorization denied');
      return;
    }
  
    try {
      const response = await fetch(`${config.apiBaseUrl}//api/groups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Include token in the Authorization header
        },
        body: JSON.stringify(groupData),
      });
  
      if (!response.ok) {
        throw new Error('Failed to create group');
      }
  
      const result = await response.json();
      console.log('Group created:', result);
      navigate('/browse-groups');
    } catch (error) {
      setError('Error creating group: ' + error.message);
    }
  };
  

  return (
    <Layout>
      <div className="create-group-container">
      <h1 className="browse-groups-title">Create Group</h1>
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="create-group-form">
          <div className="form-group">
            <label htmlFor="name">Group Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={groupData.name}
              onChange={handleChange}
              required
              placeholder="Enter group name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={groupData.description}
              onChange={handleChange}
              required
              rows="4"
              placeholder="Describe your group"
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="icon">Icon URL</label>
            <input
              type="text"
              id="icon"
              name="icon"
              value={groupData.icon}
              onChange={handleChange}
              placeholder="Enter icon URL (optional)"
            />
          </div>

          <button type="submit" className="submit-button">
            Create Group
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default CreateGroup;