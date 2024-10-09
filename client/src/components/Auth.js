import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';
import config from '../config';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    if (!email || !password || (!isLogin && !username)) {
      setError('Please fill in all fields.');
      return false;
    }
    if (!isLogin && username.length < 3) {
      setError('Username must be at least 3 characters long.');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
  
    if (!validateForm()) return;
  
    const endpoint = `${config.apiBaseUrl}/api/auth/register`;
    const body = { username, email, password };
  
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include'
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }
  
      const data = await response.json();
      setIsLogin(true);
      setError('Registration successful. Please log in.');
    } catch (error) {
      console.error('Auth error:', error);
      setError(error.message || 'An unexpected error occurred. Please try again later.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <h2 className="auth-title">
          {isLogin ? 'Login to Your Account' : 'Create a New Account'}
        </h2>
        <div className="auth-form-wrapper">
          {error && (
            <div className="auth-error">{error}</div>
          )}
          <form className="auth-form" onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            )}
            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="auth-submit-btn">
              {isLogin ? 'Sign in' : 'Sign up'}
            </button>
          </form>
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="auth-toggle-btn"
          >
            {isLogin ? 'Need to register?' : 'Already have an account?'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;