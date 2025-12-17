import { supabase } from "./supabase";
import { User } from "../types";

export const authService = {
  // Sign in with Google
  signInWithGoogle: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) throw error;
    return data;
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current user
  getCurrentUser: async (): Promise<User | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    return {
      name: user.user_metadata.full_name || user.email?.split('@')[0] || 'Reader',
      email: user.email || '',
      avatar: user.user_metadata.avatar_url,
    };
  },

  // Subscribe to auth changes
  onAuthStateChange: (callback: (user: User | null) => void) => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        callback({
          name: session.user.user_metadata.full_name || session.user.email?.split('@')[0] || 'Reader',
          email: session.user.email || '',
          avatar: session.user.user_metadata.avatar_url,
        });
      } else {
        callback(null);
      }
    });

    return subscription;
  }
};