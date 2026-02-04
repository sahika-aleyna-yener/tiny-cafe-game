import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const checkAuth = useCallback(async () => {
    // Don't check if we already have a user
    if (user) {
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch(`${API}/auth/me`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        // Store in localStorage as backup
        localStorage.setItem('poncik_user', JSON.stringify(userData));
      } else {
        // Check localStorage for cached user
        const cachedUser = localStorage.getItem('poncik_user');
        if (cachedUser) {
          // Try to validate cached user
          try {
            const parsed = JSON.parse(cachedUser);
            // If we have cached user but API failed, clear it
            localStorage.removeItem('poncik_user');
          } catch (e) {
            localStorage.removeItem('poncik_user');
          }
        }
        setUser(null);
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      setUser(null);
    } finally {
      setLoading(false);
      setAuthChecked(true);
    }
  }, [user]);

  useEffect(() => {
    // Only check auth once on mount
    if (!authChecked) {
      checkAuth();
    }
  }, [checkAuth, authChecked]);

  const login = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + '/dashboard';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const exchangeSession = async (sessionId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API}/auth/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ session_id: sessionId }),
      });
      
      if (!response.ok) {
        throw new Error('Session exchange failed');
      }
      
      const userData = await response.json();
      setUser(userData);
      // Store in localStorage
      localStorage.setItem('poncik_user', JSON.stringify(userData));
      setAuthChecked(true);
      return userData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      localStorage.removeItem('poncik_user');
    }
  };

  const refreshUser = async () => {
    try {
      const response = await fetch(`${API}/auth/me`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        localStorage.setItem('poncik_user', JSON.stringify(userData));
        return userData;
      }
    } catch (err) {
      console.error('Refresh user failed:', err);
    }
    return null;
  };

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      loading,
      error,
      login,
      logout,
      exchangeSession,
      refreshUser,
      checkAuth,
      isAuthenticated: !!user,
      authChecked,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
