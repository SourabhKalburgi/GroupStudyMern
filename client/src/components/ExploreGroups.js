import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Users as UsersIcon, Star } from 'lucide-react';
import './ExploreGroups.css';

const ExploreGroups = ({ limit = 3 }) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/groups');
        if (!response.ok) {
          throw new Error('Failed to fetch groups');
        }
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

  if (loading) return <div className="explore-groups-loading">Loading popular groups...</div>;
  if (error) return <div className="explore-groups-error">{error}</div>;

  return (
    <section className="explore-groups">
      <h2 className="explore-groups-title">Explore Popular Groups</h2>
      <div className="explore-groups-grid">
        {groups.map((group) => (
          <div key={group._id} className="explore-group-card">
            <img src={group.icon || `/group-icons/pexels-cottonbro-4861373.jpg`} alt={group.name} className="explore-group-image" />
            <div className="explore-group-content">
              <h3 className="explore-group-name">{group.name}</h3>
              <p className="explore-group-description">{group.description || 'No description available'}</p>
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
              <Link to={`/group/${group._id}`} className="explore-view-group-button">View Group</Link>
            </div>
          </div>
        ))}
      </div>
      <Link to="/browse-groups" className="explore-see-more-link">See More Groups</Link>
    </section>
  );
};

export default ExploreGroups;