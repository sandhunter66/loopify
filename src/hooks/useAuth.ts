import { useState, useEffect } from 'react';
import { AuthError } from '@supabase/supabase-js';
import type { User, AuthState } from '../types/auth';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setAuthState({ user: null, isLoading: false, error: null });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (data) {
        setAuthState({
          user: data as User,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Error loading user profile',
      }));
    }
  };

  const login = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        let message = 'Invalid email or password';
        if (error.message.includes('Email not confirmed')) {
          message = 'Please verify your email address';
        }
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: message
        }));
        return false;
      }

      if (!data.user) {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Login failed. Please try again.'
        }));
        return false;
      }

      return true;
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: 'An unexpected error occurred. Please try again.'
      }));
      return false;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return {
    user: authState.user,
    isLoading: authState.isLoading,
    error: authState.error,
    login,
    logout,
  };
}