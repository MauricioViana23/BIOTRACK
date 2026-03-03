import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { dataService } from '../services/dataService';
import { Patient } from '../types';

interface AuthContextType {
  user: Patient | null;
  loading: boolean;
  signInWithPassword: (email: string, password: string) => Promise<{ error: any }>;
  signUpWithPassword: (
    email: string,
    password: string,
    name: string,
    age: number,
    weightGoal: number
  ) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  mockLogin: (role: 'patient' | 'doctor') => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithPassword: async () => ({ error: null }),
  signUpWithPassword: async () => ({ error: null }),
  signOut: async () => {},
  mockLogin: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initSession = async () => {
      if (isSupabaseConfigured && supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const profile = await dataService.getPatientByUserId(session.user.id)
            ?? await dataService.getPatientByEmail(session.user.email ?? '');
          if (profile) setUser(profile);
        }
      } else {
        const stored = localStorage.getItem('medtrack_mock_user');
        if (stored) {
          setUser(JSON.parse(stored));
        }
      }
      setLoading(false);
    };
    initSession();

    if (isSupabaseConfigured && supabase) {
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await dataService.getPatientByUserId(session.user.id)
            ?? await dataService.getPatientByEmail(session.user.email ?? '');
          if (profile) setUser(profile);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      });
      return () => authListener.subscription.unsubscribe();
    }
  }, []);

  const signInWithPassword = async (email: string, password: string) => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: { message: 'Supabase não configurado. Use o modo demo.' } };
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error && data.user) {
      const profile = await dataService.getPatientByUserId(data.user.id)
        ?? await dataService.getPatientByEmail(email);
      if (profile) setUser(profile);
    }
    return { error };
  };

  const signUpWithPassword = async (
    email: string,
    password: string,
    name: string,
    age: number,
    weightGoal: number
  ) => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: { message: 'Supabase não configurado. Use o modo demo.' } };
    }

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error };

    if (data.user) {
      const newPatient = await dataService.createPatient({
        user_id: data.user.id,
        name,
        email,
        age,
        weight_goal_kg: weightGoal,
        role: 'patient',
      });
      if (newPatient) setUser(newPatient);
    }

    return { error: null };
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
    <AuthContext.Provider value={{ user, loading, signInWithPassword, signUpWithPassword, signOut, mockLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
