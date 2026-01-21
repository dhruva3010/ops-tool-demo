import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requiresPasswordChange, setRequiresPasswordChange] = useState(false);
  const navigate = useNavigate();

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.getMe();
      const userData = response.data.user;
      setUser(userData);
      setRequiresPasswordChange(userData.mustChangePassword || false);
    } catch (error) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    const response = await authAPI.login({ email, password });
    const { user, accessToken, refreshToken } = response.data;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    setUser(user);
    setRequiresPasswordChange(user.mustChangePassword || false);

    return user;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      // Ignore logout errors
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      setRequiresPasswordChange(false);
      navigate('/login');
    }
  };

  const completePasswordChange = async (data) => {
    const response = await authAPI.changePassword(data);
    const { user, accessToken, refreshToken } = response.data;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    setUser(user);
    setRequiresPasswordChange(false);

    return user;
  };

  const handleOAuthCallback = async (accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    await loadUser();
    navigate('/');
  };

  const hasRole = (...roles) => {
    return user && roles.includes(user.role);
  };

  const isAdmin = () => hasRole('admin');
  const isManager = () => hasRole('admin', 'manager');

  const value = {
    user,
    loading,
    requiresPasswordChange,
    login,
    logout,
    completePasswordChange,
    handleOAuthCallback,
    hasRole,
    isAdmin,
    isManager,
    loadUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
