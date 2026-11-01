import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { UserProfile } from '../types/user';
import { AuthService } from '../services/firebase/authService';
import { isFirebaseConfigured } from '../services/firebase/config';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isFirebaseConfigured: boolean;
  login: (email: string, pass: string) => Promise<UserProfile>;
  signUp: (email: string, pass: string, name: string) => Promise<UserProfile>;
  signInWithGoogle: () => Promise<UserProfile>;
  signInAsDemoUser: () => Promise<UserProfile>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = AuthService.onAuthChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(async (email: string, pass: string) => {
    const loggedUser = await AuthService.login(email, pass);
    setUser(loggedUser);
    return loggedUser;
  }, []);

  const signUp = useCallback(async (email: string, pass: string, name: string) => {
    const newUser = await AuthService.signUp(email, pass, name);
    setUser(newUser);
    return newUser;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const gUser = await AuthService.signInWithGoogle();
    setUser(gUser);
    return gUser;
  }, []);

  const signInAsDemoUser = useCallback(async () => {
    const demoUser = await AuthService.signInAsDemoUser();
    setUser(demoUser);
    return demoUser;
  }, []);

  const logout = useCallback(async () => {
    await AuthService.logout();
    setUser(null);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    await AuthService.resetPassword(email);
  }, []);

  const contextValue = useMemo<AuthContextType>(
    () => ({
      user,
      loading,
      isFirebaseConfigured,
      login,
      signUp,
      signInWithGoogle,
      signInAsDemoUser,
      logout,
      resetPassword,
    }),
    [
      user,
      loading,
      login,
      signUp,
      signInWithGoogle,
      signInAsDemoUser,
      logout,
      resetPassword,
    ]
  );

  return (
    <AuthContext.Provider value={contextValue}>
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

