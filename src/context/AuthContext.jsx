import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser());
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  const isAuthenticated = Boolean(currentUser);

  // Sync state if another tab modifies storage
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'nivarya_auth_session') {
        setCurrentUser(authService.getCurrentUser());
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const clearAuthError = () => setAuthError(null);

  const login = async (identifier, password) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const user = await authService.login({ identifier, password });
      setCurrentUser(user);
      return user;
    } catch (err) {
      setAuthError(err.message || 'Login failed. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const user = await authService.signup(userData);
      setCurrentUser(user);
      return user;
    } catch (err) {
      setAuthError(err.message || 'Account creation failed. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const user = await authService.loginWithGoogle();
      setCurrentUser(user);
      return user;
    } catch (err) {
      setAuthError(err.message || 'Google sign-in failed. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const quickDemoLogin = async () => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const user = await authService.quickDemoLogin();
      setCurrentUser(user);
      return user;
    } catch (err) {
      setAuthError(err.message || 'Demo login failed.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setCurrentUser(null);
      setAuthError(null);
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email) => {
    setIsLoading(true);
    try {
      const res = await authService.resetPassword(email);
      return res;
    } catch (err) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = async (updates) => {
    if (!currentUser) return null;
    const updated = authService.updateUserProfile(currentUser.id, updates);
    if (updated) {
      setCurrentUser(updated);
    }
    return updated;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        isLoading,
        authError,
        clearAuthError,
        login,
        signup,
        loginWithGoogle,
        quickDemoLogin,
        logout,
        resetPassword,
        updateUserProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
