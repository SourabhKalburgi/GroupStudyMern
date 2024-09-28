import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './components/Home';
import Auth from './components/Auth';
import BrowseGroups from './components/BrowseGroups';
import GroupDetail from './components/GroupDetail';
import CreateGroup from './components/CreateGroup';
import Profile from './components/Profile';
import UserDashboard from './components/UserDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/browse-groups" element={<BrowseGroups />} />
          <Route path="/group/:id" element={<GroupDetail />} />
          <Route path="/create-group" element={<CreateGroup />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/user-dashboard" element={<UserDashboard />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;