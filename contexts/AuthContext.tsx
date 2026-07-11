'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '@/lib/auth';
import type { AuthUser } from '@/lib/auth/provider';

interface AuthContextValue {
  currentUser: AuthUser | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (name: string, username: string, email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  // TEMP: client-only state, not persisted anywhere yet. Will move to a
  // real "follows" table (Appwrite) in the final phase.
  followedTeams: string[];
  toggleFollow: (teamName: string) => void;
  dreamSquad: Record<number, any>;
  updateDreamSquad: (squad: Record<number, any>) => void;
  profileLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [followedTeams, setFollowedTeams] = useState<string[]>([]);
  const [dreamSquad, setDreamSquad] = useState<Record<number, any>>({});

  useEffect(() => {
    const unsubscribe = auth.onChange((user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value: AuthContextValue = {
    currentUser,
    isAdmin: currentUser?.role === 'admin',
    loading,
    signIn: async (email, password) => {
      const { error } = await auth.signIn(email, password);
      return { error };
    },
    signUp: async (name, username, email, password) => {
      const { error } = await auth.signUp(name, username, email, password);
      return { error };
    },
    signOut: () => auth.signOut(),
    followedTeams,
    toggleFollow: (teamName: string) => {
      setFollowedTeams((prev) => (prev.includes(teamName) ? prev.filter((t) => t !== teamName) : [...prev, teamName]));
    },
    dreamSquad,
    updateDreamSquad: (squad: Record<number, any>) => setDreamSquad(squad),
    profileLoading: loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
