import React, { useEffect, useState } from 'react';
import { Heart, Users as UsersIcon, Star, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Layout } from './Layout';
import './BrowseGroups.css';
import config from '../config';
import Loader from './Loader';

const BrowseGroups = ({ limit, showFilters = true }) => {
  const [groups, setGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('likes');
  const [filterBy, setFilterBy] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchGroups();
  }, [limit]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${config.apiBaseUrl}/api/groups`);
      if (!response.ok) {
        throw new Error('Failed to fetch groups');
      }
      const data = await response.json();
      setGroups(limit ? data.slice(0, limit) : data);
    } catch (error) {
      setError('Error fetching groups: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  const truncateDescription = (description) => {
    const words = description.split(' ');
    if (words.length > 40) {
      return words.slice(0, 10).join(' ') + '...';
    }
    return description;
  };

  const filteredGroups = groups
    .filter((group) => {
      if (filterBy === 'all') return true;
      if (filterBy === 'popular') return group.members.length > 100;
      if (filterBy === 'new') return new Date(group.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return true;
    })
    .filter((group) => group.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'likes') return b.likes.length - a.likes.length;
      if (sortBy === 'members') return b.members.length - a.members.length;
      if (sortBy === 'rating') return b.averageRating - a.averageRating;
      return 0;
    });

  if (loading) return <div className="explore-groups-loading"><Loader /><p style={{ marginTop: '1rem', color: '#666' }}>Loading all Groups...</p></div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <Layout>
      <div className="browse-groups-container">
        <h1 className="browse-groups-title">Browse Groups</h1>
        {/* <Link to="/create-group" className="create-group-button">
          <Plus size={20} />
          Create New Group
        </Link> */}
        <div className="browse-groups-content">
          {showFilters && (
            <div className="search-filter-section">
              <h2>Search & Filter</h2>
              <div className="filter-group">
                <label htmlFor="search">Search</label>
                <div className="search-input-wrapper">
                  <input
                    type="text"
                    id="search"
                    placeholder="Search groups..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search className="search-icon" />
                </div>
              </div>
              <div className="filter-group">
                <label htmlFor="sort">Sort By</label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="likes">Likes</option>
                  <option value="members">Members</option>
                  <option value="rating">Rating</option>
                </select>
              </div>
            </div>
          )}
          <div className={`groups-grid ${!showFilters ? 'full-width' : ''}`}>
            {filteredGroups.map((group) => (
              <div key={group._id} className="browse-group-card">
                <img src={group.icon || `/group-icons/pexels-cottonbro-4861373.jpg`} alt={group.name} className="browse-group-image" />
                <div className="browse-group-card-content">
                  <h3 className="group-name">{group.name}</h3>
                  <p className="group-description"> {truncateDescription(group.description || 'No description available')}</p>
                  <div className="browse-group-stats">
                    <div className="stat">
                      <Heart size={16} className="stat-icon heart" />
                      <span>{group.likes.length}</span>
                    </div>
                    <div className="stat">
                      <UsersIcon size={16} className="stat-icon users" />
                      <span>{group.members.length}</span>
                    </div>
                    <div className="stat">
                      <Star size={16} className="stat-icon star" />
                      <span>{group.averageRating.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="group-actions">
                    <button className="join-button" onClick={() => navigate(`/group/${group._id}`)}>View Group</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BrowseGroups;