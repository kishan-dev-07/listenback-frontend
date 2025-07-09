'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { authService } from '../lib/auth';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        setUser(firebaseUser);
        
        // Fetch user profile from Firestore
        const { profile, error } = await authService.getUserProfile(firebaseUser.uid);
        if (profile) {
          setUserProfile(profile);
        } else {
          setError(error);
        }
      } else {
        // User is signed out
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const register = async (email, password, name, role) => {
    setLoading(true);
    setError(null);
    
    const { user, error } = await authService.register(email, password, name, role);
    
    if (error) {
      setError(error);
    }
    
    setLoading(false);
    return { user, error };
  };

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    const { user, error } = await authService.login(email, password);
    
    if (error) {
      setError(error);
    }
    
    setLoading(false);
    return { user, error };
  };

  const logout = async () => {
    setLoading(true);
    const { error } = await authService.logout();
    
    if (error) {
      setError(error);
    }
    
    setLoading(false);
    return { error };
  };

  const value = {
    user,
    userProfile,
    loading,
    error,
    register,
    login,
    logout,
    isAuthenticated: !!user,
    isTeacher: userProfile?.role === 'teacher',
    isStudent: userProfile?.role === 'student'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};