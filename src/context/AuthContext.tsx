import React, { createContext, useContext, useState } from 'react';

export type UserData = {
  learnedWords?: number[];
  assetProgress?: Record<string, 'in-progress' | 'completed'>;
  studyDays?: string[];
  pomodoroMinutes?: number;
  studyLog?: Record<string, { minutes?: number; words?: number; arenaPlays?: number }>;
};

export type User = {
  id: number;
  username: string;
  email: string;
  high_score: number;
  longest_streak: number;
  user_data?: UserData;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (userData: User, token: string) => void;
  logout: () => void;
  updateUserData: (newData: Partial<UserData>) => Promise<void>;
  markStudyDay: () => void;
  logDailyActivity: (activity: { minutes?: number; words?: number; arenaPlays?: number }) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('gre_user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token');
  });

  const login = (userData: User, newToken: string) => {
    // Ensure user_data exists
    userData.user_data = userData.user_data || {};
    setUser(userData);
    setToken(newToken);
    localStorage.setItem('gre_user', JSON.stringify(userData));
    localStorage.setItem('token', newToken);

    // Sync localStorage learned words on login if local has them but server doesn't
    try {
      const localLearned = localStorage.getItem("gre_learned_words");
      if (localLearned) {
        const localArray = JSON.parse(localLearned);
        if (localArray.length > 0 && (!userData.user_data.learnedWords || userData.user_data.learnedWords.length === 0)) {
           // We'll update the server after state sets
           setTimeout(() => {
             updateUserData({ learnedWords: localArray });
           }, 1000);
        }
      }
    } catch (e) {}
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('gre_user');
    localStorage.removeItem('token');
  };

  const updateUserData = async (newData: Partial<UserData>) => {
    if (!user || !token) return;
    
    setUser(prev => {
        if (!prev) return prev;
        const currentData = prev.user_data || {};
        const updatedData = { ...currentData, ...newData };
        const updatedUser = { ...prev, user_data: updatedData };
        localStorage.setItem('gre_user', JSON.stringify(updatedUser));
        
        // Background sync to server
        const apiBaseUrl = (import.meta.env.VITE_API_URL || '').trim();
        const endpoint = '/api/user/data';
        const requestUrl = apiBaseUrl ? `${apiBaseUrl.replace(/\/$/, '')}${endpoint}` : endpoint;
        
        fetch(requestUrl, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ user_data: updatedData })
        })
          .then(async (res) => {
            if (!res.ok) {
              const text = await res.text();
              throw new Error(text || 'Failed to sync user data');
            }
          })
          .catch(err => console.error('Failed to sync:', err));

        return updatedUser;
    });
  };

  const logDailyActivity = (activity: { minutes?: number; words?: number; arenaPlays?: number }) => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    
    // Also mark study day if not already
    const days = user.user_data?.studyDays || [];
    const newDays = days.includes(today) ? days : [...days, today];

    const currentLog = user.user_data?.studyLog || {};
    const todayLog = currentLog[today] || {};

    const updatedLog = {
      ...currentLog,
      [today]: {
        minutes: (todayLog.minutes || 0) + (activity.minutes || 0),
        words: (todayLog.words || 0) + (activity.words || 0),
        arenaPlays: (todayLog.arenaPlays || 0) + (activity.arenaPlays || 0)
      }
    };

    updateUserData({ studyDays: newDays, studyLog: updatedLog });
  };

  const markStudyDay = () => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    const days = user.user_data?.studyDays || [];
    if (!days.includes(today)) {
      updateUserData({ studyDays: [...days, today] });
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUserData, markStudyDay, logDailyActivity }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
