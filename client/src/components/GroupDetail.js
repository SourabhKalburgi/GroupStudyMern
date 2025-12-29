import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UsersIcon, Star, Camera, Mic, ArrowLeft, X, Share2, Copy } from 'lucide-react';
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
  // Video session state variables
  const [showVideoSession, setShowVideoSession] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [hasActiveSession, setHasActiveSession] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const jitsiApiRef = useRef(null);
  
  const handleJitsiError = useCallback((error) => {
    console.error('Jitsi Error:', error);
    setError('Failed to join video session. Please check your permissions and try again.');
    setShowVideoSession(false);
  }, []);

  const handleEndSession = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
        jitsiApiRef.current = null;
      }
      
      if (id && token) {
        await fetch(`${config.apiBaseUrl}/api/groups/${id}/video-session`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
      }

      setShowVideoSession(false);
      setRoomName('');
      setHasActiveSession(false);
      setShowInviteModal(false);
    } catch (error) {
      console.error('Error ending session:', error);
      setShowVideoSession(false);
      setRoomName('');
      setHasActiveSession(false);
    }
  }, [id]);

  const handleJitsiReady = useCallback((api) => {
    jitsiApiRef.current = api;
    const displayName = localStorage.getItem('username') || 'User';
    api.executeCommand('displayName', displayName);
    
    // Function to ensure video is enabled using correct API methods
    const ensureVideoEnabled = () => {
      try {
        // Check if video is muted using the correct API method
        api.isVideoMuted().then(isMuted => {
          console.log('Video muted status:', isMuted);
          if (isMuted) {
            console.log('Video is muted, enabling...');
            api.executeCommand('toggleVideo');
          } else {
            console.log('Video is already enabled');
          }
        }).catch(err => {
          console.log('Error checking video mute status:', err);
          // If check fails, try to enable video anyway
          api.executeCommand('toggleVideo');
        });
      } catch (e) {
        console.log('Error in ensureVideoEnabled:', e);
        // Fallback: try to toggle video
        try {
          api.executeCommand('toggleVideo');
        } catch (toggleErr) {
          console.log('Error toggling video:', toggleErr);
        }
      }
    };

    // Handle prejoin page events
    api.on('prejoinVideoMuted', (isMuted) => {
      console.log('Prejoin video muted status:', isMuted);
      if (isMuted) {
        // Unmute video on prejoin page
        setTimeout(() => {
          api.executeCommand('toggleVideo');
        }, 300);
      }
    });

    // When prejoin page is ready, ensure video is visible
    api.on('prejoinPageReady', () => {
      console.log('Prejoin page ready');
      setTimeout(() => {
        api.isVideoMuted().then(muted => {
          if (muted) {
            console.log('Video is muted on prejoin, unmuting...');
            api.executeCommand('toggleVideo');
          }
        });
      }, 500);
    });

    api.on('videoConferenceJoined', () => {
      console.log('Local user joined the conference');
      
      // Get local participant ID to pin/show local video
      const localParticipant = api.getLocalParticipant();
      console.log('Local participant:', localParticipant);
      
      // Ensure video is enabled after joining - try multiple times with delays
      setTimeout(() => {
        ensureVideoEnabled();
        // Try to pin local video to ensure it's visible
        if (localParticipant && localParticipant.id) {
          try {
            api.executeCommand('pinParticipant', localParticipant.id);
          } catch (err) {
            console.log('Error pinning participant:', err);
          }
        }
      }, 500);
      
      setTimeout(() => {
        ensureVideoEnabled();
      }, 1500);
      
      setTimeout(() => {
        ensureVideoEnabled();
        // Try to set local video as large video
        if (localParticipant && localParticipant.id) {
          try {
            api.executeCommand('setLargeVideoParticipant', localParticipant.id);
          } catch (err) {
            console.log('Error setting large video participant:', err);
          }
        }
      }, 3000);
      
      // Try multiple approaches to ensure video is visible
      setTimeout(() => {
        // Method 1: Check if video is muted and unmute if needed
        api.isVideoMuted().then(muted => {
          console.log('Video muted after join:', muted);
          if (muted) {
            api.executeCommand('toggleVideo');
          }
        });
        
        // Method 2: Try to set video device explicitly
        try {
          api.getVideoInputDevices().then(devices => {
            console.log('Available video devices:', devices);
            if (devices && devices.length > 0) {
              // Use the first available camera
              api.setVideoInputDevice(devices[0].deviceId).catch(err => {
                console.log('Error setting video device:', err);
              });
            }
          }).catch(err => {
            console.log('Error getting video devices:', err);
          });
        } catch (err) {
          console.log('Error in video device setup:', err);
        }
      }, 2000);
    });

    api.on('participantJoined', (participant) => {
      console.log('Participant joined:', participant);
    });

    api.on('videoConferenceLeft', () => {
      console.log('User left the conference');
      handleEndSession();
    });

    api.on('readyToClose', () => {
      console.log('Ready to close');
      handleEndSession();
    });

    // Handle video mute/unmute events - the event format is different
    api.on('videoMuteStatusChanged', (data) => {
      console.log('Video mute status changed:', data);
      // The data object contains muted status and participant info
      // Handle both object format {muted: true} and direct boolean format
      const isMuted = typeof data === 'object' ? data.muted : data;
      const participantId = typeof data === 'object' ? data.participantId : undefined;
      
      // Only react if it's the local user's video that got muted
      // If participantId is undefined, it's likely the local user
      if (isMuted && !participantId) {
        // Wait a bit longer before unmuting to ensure the track is ready
        setTimeout(() => {
          api.isVideoMuted().then(muted => {
            if (muted) {
              console.log('Unmuting local video...');
              api.executeCommand('toggleVideo');
            }
          }).catch(() => {
            console.log('Trying to unmute video...');
            api.executeCommand('toggleVideo');
          });
        }, 1000);
      }
    });

    // Handle local video track added - ensure it's visible
    api.on('localVideoTrackAdded', (track) => {
      console.log('Local video track added:', track);
      if (track && track.track) {
        const videoElement = track.track;
        console.log('Video element:', videoElement);
        
        // Ensure video element is playing
        if (videoElement && videoElement.play) {
          videoElement.play().catch(err => {
            console.log('Error playing video:', err);
          });
        }
        
        // Ensure video is not muted
        setTimeout(() => {
          api.isVideoMuted().then(muted => {
            console.log('Local video muted status:', muted);
            if (muted) {
              console.log('Unmuting local video track...');
              api.executeCommand('toggleVideo');
            }
          }).catch(() => {
            api.executeCommand('toggleVideo');
          });
        }, 500);
      }
    });

    // Handle participant video track added - ensure it's visible
    api.on('participantVideoTrackAdded', (track) => {
      console.log('Participant video track added:', track);
      // If it's the local participant's track, ensure video is enabled
      if (track && track.isLocal && track.isLocal()) {
        setTimeout(() => {
          api.isVideoMuted().then(muted => {
            if (muted) {
              api.executeCommand('toggleVideo');
            }
          });
        }, 500);
      }
    });

    // Handle track ready events
    api.on('trackReady', (track) => {
      console.log('Track ready:', track);
      if (track && track.isLocal && track.isLocal()) {
        setTimeout(() => {
          api.isVideoMuted().then(muted => {
            if (muted) {
              api.executeCommand('toggleVideo');
            }
          });
        }, 500);
      }
    });
  }, [handleEndSession]);

  // Check for active session on component load
  useEffect(() => {
    if (joined && id) {
      checkActiveSession();
    }
  }, [joined, id]);

  const checkActiveSession = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${config.apiBaseUrl}/api/groups/${id}/video-session`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.exists && data.roomName) {
          setHasActiveSession(true);
          setRoomName(data.roomName);
          // Set invite link
          const currentUrl = window.location.origin;
          const inviteUrl = `${currentUrl}/group/${id}`;
          setInviteLink(inviteUrl);
        } else {
          setHasActiveSession(false);
        }
      }
    } catch (error) {
      console.error('Error checking active session:', error);
    }
  };

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

  const startOrJoinVideoSession = async () => {
    try {
      setSessionLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.apiBaseUrl}/api/groups/${id}/video-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to start/join video session');
      }

      const data = await response.json();
      setRoomName(data.roomName);
      setHasActiveSession(true);
      setShowVideoSession(true);
      
      // Generate invite link
      const currentUrl = window.location.origin;
      const inviteUrl = `${currentUrl}/group/${id}`;
      setInviteLink(inviteUrl);
    } catch (error) {
      console.error('Error starting/joining video session:', error);
      setError('Failed to start/join video session. Please try again.');
    } finally {
      setSessionLoading(false);
    }
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink).then(() => {
      alert('Invite link copied to clipboard!');
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = inviteLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Invite link copied to clipboard!');
    });
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
        <button className="back-button" onClick={() => navigate('/browse-groups')}>
          <ArrowLeft size={20} /> Browse Groups
        </button>
        {joined && (
          <>
            <div className="session-buttons">
              <button 
                className="button video-button" 
                onClick={startOrJoinVideoSession}
                disabled={sessionLoading}
              >
                <Camera size={20} className="button-icon" />
                <span>{hasActiveSession ? 'Join Video Session' : 'Start Video Session'}</span>
              </button>
              {hasActiveSession && (
                <button 
                  className="button invite-button" 
                  onClick={() => setShowInviteModal(true)}
                >
                  <Share2 size={20} className="button-icon" />
                  <span>Invite Others</span>
                </button>
              )}
            </div>
            
            {showInviteModal && (
              <div className="invite-modal-overlay" onClick={() => setShowInviteModal(false)}>
                <div className="invite-modal" onClick={(e) => e.stopPropagation()}>
                  <div className="invite-modal-header">
                    <h3>Invite Others to Video Session</h3>
                    <button className="close-modal-btn" onClick={() => setShowInviteModal(false)}>
                      <X size={20} />
                    </button>
                  </div>
                  <div className="invite-modal-content">
                    <p>Share this link with group members to join the video session:</p>
                    <div className="invite-link-container">
                      <input 
                        type="text" 
                        value={inviteLink} 
                        readOnly 
                        className="invite-link-input"
                      />
                      <button className="copy-button" onClick={copyInviteLink}>
                        <Copy size={16} />
                        Copy
                      </button>
                    </div>
                    <p className="invite-note">
                      Group members can join by clicking "Join Video Session" on this page.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {showVideoSession && roomName && (
              <div className="video-session-container">
                <div className="video-session-header">
                  <h3>Video Session - {group.name}</h3>
                  <div className="video-session-actions">
                    <button 
                      className="invite-in-session-button" 
                      onClick={() => setShowInviteModal(true)}
                    >
                      <Share2 size={16} />
                      Invite
                    </button>
                    <button 
                      className="close-video-button" 
                      onClick={handleEndSession}
                    >
                      <X size={16} />
                      End Session
                    </button>
                  </div>
                </div>
                <div className="jitsi-container">
                  <Jitsi
                    roomName={roomName}
                    displayName={localStorage.getItem('username') || 'User'}
                    onAPILoad={handleJitsiReady}
                    onError={handleJitsiError}
                    containerStyle={{ width: '100%', height: '600px', minHeight: '500px' }}
                    config={{
                      startWithAudioMuted: false,
                      startWithVideoMuted: false, // Start with video ON
                      prejoinPageEnabled: true, // Enable prejoin to show local video preview
                      disableDeepLinking: true,
                      enableWelcomePage: false,
                      enableClosePage: false,
                      defaultLanguage: 'en',
                      enableLayerSuspension: true,
                      enableNoAudioDetection: true,
                      enableNoisyMicDetection: true,
                      enableTalkWhileMuted: false,
                      enableRemb: true,
                      enableTcc: true,
                      useStunTurn: true,
                      // Video constraints - ensure camera is requested
                      constraints: {
                        video: {
                          height: { ideal: 720, max: 1080, min: 240 },
                          width: { ideal: 1280, max: 1920, min: 320 },
                          facingMode: 'user' // Use front-facing camera
                        }
                      },
                      resolution: 720,
                      disableThirdPartyRequests: false,
                      // Prejoin config - ensure video is visible
                      prejoinConfig: {
                        enabled: true,
                        hideDisplayName: false,
                        hideExtraJoinButtons: false,
                        // Ensure video is enabled on prejoin page
                        startWithVideoMuted: false,
                        startWithAudioMuted: false
                      },
                      // Ensure local video is always shown
                      localVideo: {
                        enabled: true
                      },
                      // Additional settings to ensure video is visible
                      enableLocalVideoFlip: true,
                      disableRemoteVideoFlip: false
                    }}
                    interfaceConfig={{
                      SHOW_JITSI_WATERMARK: false,
                      SHOW_WATERMARK_FOR_GUESTS: false,
                      MOBILE_APP_PROMO: false,
                      HIDE_INVITE_MORE_HEADER: false,
                      DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
                      TOOLBAR_BUTTONS: [
                        'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                        'fodeviceselection', 'hangup', 'profile', 'chat', 'settings',
                        'videoquality', 'filmstrip', 'feedback', 'stats', 'shortcuts',
                        'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone', 'security'
                      ],
                      SETTINGS_SECTIONS: ['devices', 'language', 'moderator', 'profile'],
                      VIDEO_QUALITY_LABEL_DISABLED: false,
                      VIDEO_QUALITY_LABEL_ENABLED: true,
                    }}
                  />
                </div>
              </div>
            )}

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
                  <div className="forum-post">
                    <div className="post-header">
                      <div className="user-icon">
                        {post.author?.username ? post.author.username[0].toUpperCase() : '?'}
                      </div>
                      <h3>{post.author?.username || 'Anonymous'}</h3>
                    </div>
                    <p className="post-content">{post.content}</p>

                    <div className="answers-section">
                      <h4 className="answers-title">Answers:</h4>
                      {post.answers && post.answers.length > 0 ? (
                        post.answers.map(answer => (
                          <div key={answer._id} className="answer-item">
                            <div className="answer-author">
                              {answer.author?.username || 'Anonymous'}
                            </div>
                            <div className="answer-content">{answer.content}</div>
                          </div>
                        ))
                      ) : (
                        <p>No answers yet.</p>
                      )}
                    </div>

                    <form onSubmit={(e) => {
                      e.preventDefault();
                      handleAnswerSubmit(post._id);
                    }} className="answer-form">
                      <textarea
                        className="answer-textarea"
                        rows="3"
                        placeholder="Add an answer (max 400 words)..."
                        value={newAnswers[post._id] || ''}
                        onChange={(e) => setNewAnswers(prev => ({ ...prev, [post._id]: e.target.value }))}
                        maxLength={400 * 5}
                      ></textarea>
                      <button type="submit" className="answer-button">Answer</button>
                    </form>
                  </div>
                ))}
              </div>
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
