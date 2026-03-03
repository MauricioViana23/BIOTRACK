import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { dataService } from '../services/dataService';
import { Patient } from '../types';

interface AuthContextType {
  user: Patient | null;
  loading: boolean;
  signInWithEmail: (email: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  mockLogin: (role: 'patient' | 'doctor') => Promise<void>; // For demo without Supabase
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithEmail: async () => ({ error: null }),
  signOut: async () => {},
  mockLogin: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session on load
    const initSession = async () => {
      if (isSupabaseConfigured && supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.email) {
           const profile = await dataService.getPatientByEmail(session.user.email);
           if (profile) setUser(profile);
        }
      } else {
        // Check local storage for mock session
        const stored = localStorage.getItem('medtrack_mock_user');
        if (stored) {
            setUser(JSON.parse(stored));
        }
      }
      setLoading(false);
    };
    initSession();

    // Listen for auth changes
    if (isSupabaseConfigured && supabase) {
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user?.email) {
            const profile = await dataService.getPatientByEmail(session.user.email);
            if (profile) setUser(profile);
        } else if (event === 'SIGNED_OUT') {
            setUser(null);
        }
      });
      return () => authListener.subscription.unsubscribe();
    }
  }, []);

  const signInWithEmail = async (email: string) => {
    if (isSupabaseConfigured && supabase) {
      return await supabase.auth.signInWithOtp({ email });
    } else {
      console.warn("Supabase not configured. Use mock login.");
      return { error: { message: "Supabase not configured" } };
    }
  };

  const mockLogin = async (role: 'patient' | 'doctor') => {
    const email = role === 'doctor' ? 'doctor@medtrack.app' : 'paciente@medtrack.app';
    const profile = await dataService.getPatientByEmail(email);
    if (profile) {
        setUser(profile);
        localStorage.setItem('medtrack_mock_user', JSON.stringify(profile));
    }
  };

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem('medtrack_mock_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithEmail, signOut, mockLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
