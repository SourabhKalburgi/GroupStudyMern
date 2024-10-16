import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UsersIcon, Star, Camera, Mic, ArrowLeft, X } from 'lucide-react';
import { Layout } from './Layout';
import './GroupDetail.css';
import config from '../config';
import Modal from './Modal';
import Jitsi from 'react-jitsi';


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
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [forumPosts, setForumPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [newAnswers, setNewAnswers] = useState({});
  const [aiResponse, setAiResponse] = useState('');
  const [aiError, setAiError] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const navigate = useNavigate();
  // New state variables for Jitsi
  const [showVideoSession, setShowVideoSession] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [jitsiApi, setJitsiApi] = useState(null);
  const handleJitsiError = useCallback((error) => {
    console.error('Jitsi Error:', error);
    setError('Failed to join video session. Please check your permissions and try again.');
    setShowVideoSession(false);
  }, []);

  const handleJitsiReady = useCallback((api) => {
    setJitsiApi(api);
    api.executeCommand('displayName', localStorage.getItem('username'));
    api.on('videoConferenceJoined', () => {
      console.log('Local user joined');
    });
  }, []);
  useEffect(() => {
    fetch(`${config.apiBaseUrl}/api/groups/${id}`)
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

    const fetchForumPosts = async () => {
      try {
        const response = await fetch(`${config.apiBaseUrl}/api/forum/group/${id}`);
        const data = await response.json();
        setForumPosts(data);
      } catch (error) {
        console.error('Error fetching forum posts:', error);
      }
    };

    fetchForumPosts();
  }, [id]);

  const handleJoin = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      // Show modal instead of error
      setShowAuthModal(true);
      return;
    }

    // If logged in, proceed to join the group
    fetch(`${config.apiBaseUrl}/api/groups/${id}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((updatedGroup) => {
        setJoined(true);
        setGroup(updatedGroup); // Update group state
        setShowJoinAlert(true);
        setTimeout(() => setShowJoinAlert(false), 3000);
      })
      .catch(() => {
        // Handle error if any
      });
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


  const handlePostSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${config.apiBaseUrl}/api/forum`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ groupId: id, content: newPost }),
      });
      const data = await response.json();
      setForumPosts([data, ...forumPosts]);
      setNewPost('');
    } catch (error) {
      console.error('Error creating forum post:', error);
    }
  };
  const handleAnswerSubmit = async (postId) => {
    try {
      const content = newAnswers[postId]; // Extract content for the specific post ID

      if (!content) {
        console.error("Answer content is empty.");
        return;
      }

      const response = await fetch(`${config.apiBaseUrl}/api/forum/${postId}/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ content }), // Send only the content
      });

      const data = await response.json();
      setForumPosts(forumPosts.map(post =>
        post._id === postId ? data : post
      ));

      setNewAnswers(prev => ({ ...prev, [postId]: '' })); // Reset the answer field
    } catch (error) {
      console.error('Error adding answer:', error);
    }
  };

  const startVideoSession = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.apiBaseUrl}/api/groups/${id}/video-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to start video session');
      }

      const data = await response.json();
      setRoomName(data.roomName);
      setShowVideoSession(true);
    } catch (error) {
      console.error('Error starting video session:', error);
      setError('Failed to start video session. Please try again.');
    }
  };
  const handleAskAI = async () => {
    if (!newPost.trim()) {
      // Don't ask AI if the question is empty
      return;
    }

    setIsAiLoading(true);
    setAiError('');
    setAiResponse('');
    try {
      const response = await fetch(`${config.apiBaseUrl}/api/ai/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ question: newPost }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get AI response');
      }

      setAiResponse(data.answer);
    } catch (error) {
      console.error('Error asking AI:', error);
      setAiError(error.message || 'Sorry, I couldn\'t generate a response at this time.');
    } finally {
      setIsAiLoading(false);
    }
  };

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
              <span>{group.members.length}</span>
            </div>
            <div className="stat-item">
              <Star size={16} className="stat-icon heart" />
              <span>{group.likes.length} </span>
            </div>
            <div className="stat-item">
              <Star size={16} className="stat-icon star" />
              <span>{group.averageRating ? group.averageRating.toFixed(1) : 'N/A'} </span>
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
              <button className="button video-button" onClick={startVideoSession}>
                <Camera size={20} className="button-icon" />
                <span>Start Video Session</span>
              </button>
              {/* <button className="button voice-button">
                <Mic size={20} className="button-icon" />
                <span>Join Voice Session</span>
              </button> */}
            </div>
            {showVideoSession && (
              <div className="video-session-container">
                <button className="close-video-button" onClick={() => {
                  setShowVideoSession(false);
                  localStorage.removeItem(`groupRoom_${id}`); // Clear cached room when closing
                }}>
                  Close Video Session
                </button>
                <Jitsi
                  roomName={roomName}
                  displayName={localStorage.getItem('username')}
                  onAPILoad={handleJitsiReady}
                  onError={handleJitsiError}
                  containerStyle={{ width: '100%', height: '600px' }}
                  config={{
                    startWithAudioMuted: false,
                    startWithVideoMuted: false,
                    prejoinPageEnabled: false,
                    disableDeepLinking: true,
                  }}
                  interfaceConfig={{
                    SHOW_JITSI_WATERMARK: false,
                    SHOW_WATERMARK_FOR_GUESTS: false,
                    MOBILE_APP_PROMO: false,
                    HIDE_INVITE_MORE_HEADER: true,
                    DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
                  }}
                  jwt={localStorage.getItem('token')}
                />
              </div>
            )}

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
              <form onSubmit={handlePostSubmit}>
                <textarea
                  className="forum-textarea"
                  rows="3"
                  placeholder="Ask a question (max 150 words)..."
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  maxLength={150 * 5}
                ></textarea>
                <button type="submit" className="button post-button">Post</button>
                <button type="button" className="button ai-button" onClick={handleAskAI} disabled={isAiLoading}>
                  {isAiLoading ? 'Asking AI...' : 'Ask AI'}
                </button>
              </form>
              {aiResponse && (
                <div className="ai-response">
                  <h4>AI Response:</h4>
                  <p>{aiResponse}</p>
                </div>
              )}
              {aiError && (
                <div className="ai-error">
                  <h4>Error:</h4>
                  <p>{aiError}</p>
                </div>
              )}
              <div className="forum-posts" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {forumPosts.slice(0, 3).map((post) => (
                  <div key={post._id} className="forum-post">
                    <div className="post-header">
                      <div className="user-icon">{post.author.username[0].toUpperCase()}</div>
                      <h3>{post.author.username}</h3>
                    </div>
                    <p>{post.content}</p>
                    <h4>Answers:</h4>
                    {post.answers.map(answer => (
                      <div key={answer._id}>
                        {answer.author?.username ? answer.author.username : 'Unknown User'}: {answer.content}
                      </div>
                    ))}


                    <form onSubmit={(e) => {
                      e.preventDefault();
                      handleAnswerSubmit(post._id);
                    }}>
                      <div className="answer-container">
                        <textarea
                          className="answer-textarea"
                          rows="3"
                          placeholder="Add an answer (max 400 words)..."
                          value={newAnswers[post._id] || ''}
                          onChange={(e) => setNewAnswers(prev => ({ ...prev, [post._id]: e.target.value }))}
                          maxLength={400 * 5}
                        ></textarea>
                        <button type="submit" className="button answer-button">Answer</button>
                      </div>
                    </form>
                  </div>
                ))}
              </div>
            </div>

            <div className="section resources-section">
              <h2 className="section-title">Resources</h2>
              <ul className="resources-list">
                <li><a href={group.guidelinesLink || '#'} className="resource-link">Group Guidelines</a></li>
                <li><a href={group.documentsLink || '#'} className="resource-link">Shared Documents</a></li>
                <li><a href={group.scheduleLink || '#'} className="resource-link">Meeting Schedule</a></li>
              </ul>
            </div>
          </>
        )}
      </div>

      {/* Modal to prompt login/signup */}
      <Modal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={() => navigate('/auth')}
      />
    </Layout>
  );
};

export default GroupDetail;
