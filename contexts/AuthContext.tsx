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
  followedLeagues: string[];
  toggleFollowLeague: (league: string) => void;
  favorites: string[];
  toggleFavorite: (articleId: string) => void;
  activityLog: { id: string; text: string; time: string }[];
  dreamSquad: Record<number, any>;
  updateDreamSquad: (squad: Record<number, any>) => void;
  profileLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [followedTeams, setFollowedTeams] = useState<string[]>([]);
  const [followedLeagues, setFollowedLeagues] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [activityLog, setActivityLog] = useState<{ id: string; text: string; time: string }[]>([]);
  const [dreamSquad, setDreamSquad] = useState<Record<number, any>>({});

  function logActivity(text: string) {
    setActivityLog((prev) => [{ id: `act-${Date.now()}`, text, time: new Date().toISOString() }, ...prev].slice(0, 50));
  }

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
      setFollowedTeams((prev) => {
        const isFollowing = prev.includes(teamName);
        logActivity(isFollowing ? `ألغيت متابعة ${teamName}` : `تابعت ${teamName}`);
        return isFollowing ? prev.filter((t) => t !== teamName) : [...prev, teamName];
      });
    },
    followedLeagues,
    toggleFollowLeague: (league: string) => {
      setFollowedLeagues((prev) => {
        const isFollowing = prev.includes(league);
        logActivity(isFollowing ? `ألغيت متابعة ${league}` : `تابعت ${league}`);
        return isFollowing ? prev.filter((l) => l !== league) : [...prev, league];
      });
    },
    favorites,
    toggleFavorite: (articleId: string) => {
      setFavorites((prev) => {
        const isFav = prev.includes(articleId);
        logActivity(isFav ? 'أزلت مقالاً من المفضلة' : 'أضفت مقالاً للمفضلة');
        return isFav ? prev.filter((a) => a !== articleId) : [...prev, articleId];
      });
    },
    activityLog,
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
