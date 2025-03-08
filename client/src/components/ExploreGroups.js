import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Users as UsersIcon, Star, ArrowRight } from 'lucide-react';
import './ExploreGroups.css';
import config from '../config';
import Loader from './Loader';

const ExploreGroups = ({ limit = 3 }) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${config.apiBaseUrl}/api/groups`);
        if (!response.ok) throw new Error('Failed to fetch groups');
        const data = await response.json();
        setGroups(data.slice(0, limit));
      } catch (error) {
        setError('Error fetching groups: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [limit]);

  if (loading) return (
    <div className="explore-groups-loading">
      <Loader />
      <p>Discovering amazing study groups...</p>
    </div>
  );

  if (error) return (
    <div className="explore-groups-error">
      <p>{error}</p>
      <button onClick={() => window.location.reload()}>Try Again</button>
    </div>
  );

  return (
    <section className="explore-groups">
      <div className="explore-groups-header">
        <h2 className="explore-groups-title">
          Popular Study Groups
          <span className="title-accent">.</span>
        </h2>
        <p className="explore-groups-subtitle">
          Join active study groups and accelerate your learning journey
        </p>
      </div>

      <div className="explore-groups-grid">
        {groups.map((group) => (
          <div key={group._id} className="explore-group-card glass-effect">
            <div className="explore-group-image-container">
              <img 
                src={group.icon || `/group-icons/pexels-cottonbro-4861373.jpg`} 
                alt={group.name} 
                className="explore-group-image" 
              />
              <div className="explore-group-overlay">
                <div className="explore-group-stats">
                  <div className="explore-group-stat">
                    <Heart size={16} className="explore-stat-icon heart" />
                    <span>{group.likes.length}</span>
                  </div>
                  <div className="explore-group-stat">
                    <UsersIcon size={16} className="explore-stat-icon users" />
                    <span>{group.members.length}</span>
                  </div>
                  <div className="explore-group-stat">
                    <Star size={16} className="explore-stat-icon star" />
                    <span>{group.averageRating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="explore-group-content">
              <h3 className="explore-group-name">{group.name}</h3>
              <p className="explore-group-description">
                {group.description || 'No description available'}
              </p>
              <Link to={`/group/${group._id}`} className="explore-view-group-button">
                <span>View Group</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        ))}
      </div>

      <Link to="/browse-groups" className="explore-see-more-link">
        <span>Explore All Groups</span>
        <ArrowRight size={20} />
      </Link>
    </section>
  );
};

export default ExploreGroups;