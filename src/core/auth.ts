import { supabase } from '@/infrastructure/supabase';

export const authService = {
  async signIn(email: string, password: string) {
    return supabase.auth.signInWithPassword({
      email,
      password,
    });
  },

  async signUp(email: string, password: string, name: string) {
    return supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });
  },

  async signOut() {
    return supabase.auth.signOut();
  },
};
