import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UsersIcon, Star, Camera, Mic, ArrowLeft, X } from 'lucide-react';
import { Layout } from './Layout';
import './GroupDetail.css';
import config from '../config';

const Alert = ({ children, onClose }) => (
  <div className="alert">
    <span>{children}</span>
    <span className="close-button" onClick={onClose}>
      <X size={16} />
    </span>
  </div>
);

const GroupDetail = () => {
  const { id } = useParams();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joined, setJoined] = useState(false);
  const [showJoinAlert, setShowJoinAlert] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${config.apiBaseUrl}//api/groups/${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch group: ${response.status} ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => {
        setGroup(data);
        setJoined(data.members.includes(localStorage.getItem('userId'))); // Check if user is already a member
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, [id]);

  const handleJoin = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/api/groups/${id}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // Adjust for your auth method
        },
      });

      if (!response.ok) {
        throw new Error('Failed to join the group');
      }

      const updatedGroup = await response.json();
      setJoined(true);
      setGroup(updatedGroup); // Update the group state to reflect the new members
      setShowJoinAlert(true);
      setTimeout(() => setShowJoinAlert(false), 3000);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleLeave = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/api/groups/${id}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // Adjust for your auth method
        },
      });

      if (!response.ok) {
        throw new Error('Failed to leave the group');
      }

      const updatedGroup = await response.json();
      setJoined(false);
      setGroup(updatedGroup); // Update the group state to reflect the new members
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) return <Layout><p className="loading">Loading group details...</p></Layout>;
  if (error) return <Layout><div className="error-message">Error: {error}</div></Layout>;
  if (!group) return <Layout><div className="error-message">Group not found.</div></Layout>;

  const upcomingMeetings = [
    { id: 1, title: "Weekly Check-in", date: "2024-09-20", time: "14:00" },
    { id: 2, title: "Project Review", date: "2024-09-25", time: "10:00" },
  ];

  return (
    <Layout>
      <div className="group-detail-container">
        <button className="back-button" onClick={() => navigate('/browse-groups')}>
          <ArrowLeft size={20} /> Browse Groups
        </button>
        <h1 className="browse-groups-title">Group information</h1>
        {showJoinAlert && (
          <Alert onClose={() => setShowJoinAlert(false)}>
            You have successfully joined the group!
          </Alert>
        )}
        <div className="group-card">
          <div className="group-header">
            <img
              src={group.icon || '/group-icons/pexels-cottonbro-4861373.jpg'}
              alt={group.name}
              className="group-image"
            />
            <div className="group-info">
              <h2 className="group-name">{group.name}</h2>
              <p className="group-description">{group.description}</p>
            </div>
          </div>
          <div className="group-stats">
            <div className="stat-item">
              <UsersIcon size={16} className="stat-icon users" />
              <span>{group.members.length} members</span>
            </div>
            <div className="stat-item">
              <Star size={16} className="stat-icon heart" />
              <span>{group.likes.length} likes</span>
            </div>
            <div className="stat-item">
              <Star size={16} className="stat-icon star" />
              <span>{group.averageRating ? group.averageRating.toFixed(1) : 'N/A'} rating</span>
            </div>
          </div>

          {!joined ? (
            <button onClick={handleJoin} className="button join-button">
              Join Group
            </button>
          ) : (
            <button onClick={handleLeave} className="button leave-button">
              Leave Group
            </button>
          )}
        </div>

        {joined && (
          <>
            <div className="session-buttons">
              <button className="button video-button">
                <Camera size={20} className="button-icon" />
                <span>Join Video Session</span>
              </button>
              <button className="button voice-button">
                <Mic size={20} className="button-icon" />
                <span>Join Voice Session</span>
              </button>
            </div>

            <div className="section upcoming-meetings-section">
              <h2 className="section-title">Upcoming Discussions</h2>
              <ul className="meetings-list">
                {upcomingMeetings.map((meeting) => (
                  <li key={meeting.id} className="meeting-item">
                    <h3>{meeting.title}</h3>
                    <p>{meeting.date} at {meeting.time}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="section forum-section">
              <h2 className="section-title">Discussion Forum</h2>
              <textarea
                className="forum-textarea"
                rows="3"
                placeholder="Ask a question or start a discussion..."
              ></textarea>
              <button className="button post-button">Post</button>
            </div>
            <div className="section resources-section">
              <h2 className="section-title">Resources</h2>
              <ul className="resources-list">
                <li><a href="#" className="resource-link">Group Guidelines</a></li>
                <li><a href="#" className="resource-link">Shared Documents</a></li>
                <li><a href="#" className="resource-link">Meeting Schedule</a></li>
              </ul>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default GroupDetail;
