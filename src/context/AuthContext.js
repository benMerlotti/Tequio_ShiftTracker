import React, { createContext, useState, useEffect, useContext } from 'react';
import { checkAuthStatus, loginUser, registerUser, logoutUser } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    // Check if user is logged in on app start
    const loadUser = async () => {
      const userData = await checkAuthStatus();
      setAuthState({
        user: userData,
        isLoading: false,
        isAuthenticated: userData !== null,
      });
    };

    loadUser();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const userData = await loginUser(email, password);
      setAuthState({
        user: userData,
        isLoading: false,
        isAuthenticated: true,
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      await registerUser(userData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Logout function
  const logout = async () => {
    await logoutUser();
    setAuthState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);