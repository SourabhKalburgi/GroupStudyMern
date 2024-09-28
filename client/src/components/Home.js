import React from 'react';
import { Link } from 'react-router-dom';
import DynamicHeroSection from './DynamicHeroSection';
import ExploreGroups from './ExploreGroups';
import { Layout } from './Layout';
import { Compass } from 'lucide-react';
import './Home.css';

const Home = () => {
  return (
    <Layout>
      <div className="home">
        <DynamicHeroSection />
        <ExploreGroups limit={3} />
        <section className="explore-dashboard">
          <div className="explore-dashboard-content">
            <h2>Explore Your Dashboard</h2>
            <p>Personalize your learning experience, track your progress, and connect with study buddies.</p>
            <Link to="/dashboard" className="explore-dashboard-button">
              <Compass size={20} />
              Go to Dashboard
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Home;