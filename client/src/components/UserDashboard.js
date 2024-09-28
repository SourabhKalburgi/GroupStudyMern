import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Layout } from './Layout';
import './UserDashboard.css';

const UserDashboard = () => {
  const { user, loading } = useAuth();
  const [createdGroups, setCreatedGroups] = useState([]);
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      const createdGroupsRes = await fetch(`http://localhost:5000/api/groups?creator=${user._id}`);
      const joinedGroupsRes = await fetch(`http://localhost:5000/api/groups?member=${user._id}`);

      if (!createdGroupsRes.ok || !joinedGroupsRes.ok) {
        throw new Error('Failed to fetch user data');
      }

      const createdGroupsData = await createdGroupsRes.json();
      const joinedGroupsData = await joinedGroupsRes.json();

      setCreatedGroups(createdGroupsData);
      setJoinedGroups(joinedGroupsData);
    } catch (error) {
      setError('Error fetching user data: ' + error.message);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <Layout>
      <div className="dashboard-container">
        <h1>User Dashboard</h1>
        
        <div className="dashboard-section">
          <h2>Groups You've Created</h2>
          {createdGroups.length > 0 ? (
            <ul>
              {createdGroups.map(group => (
                <li key={group._id}>
                  {group.name}
                  <button onClick={() => navigate(`/group/${group._id}`)}>View Group</button>
                </li>
              ))}
            </ul>
          ) : (
            <p>You haven't created any groups yet.</p>
          )}
        </div>

        <div className="dashboard-section">
          <h2>Groups You've Joined</h2>
          {joinedGroups.length > 0 ? (
            <ul>
              {joinedGroups.map(group => (
                <li key={group._id}>
                  {group.name}
                  <button onClick={() => navigate(`/group/${group._id}`)}>View Group</button>
                </li>
              ))}
            </ul>
          ) : (
            <p>You haven't joined any groups yet.</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default UserDashboard;
