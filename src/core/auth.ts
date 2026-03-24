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

  // --- ADMIN RPC FUNCIONES ---
  async adminGetAllUsers() {
    return supabase.rpc('admin_get_all_users');
  },

  async adminUpgradePlan(userId: string, nuevoPlan: string) {
    return supabase.rpc('admin_mejorar_plan', {
      user_id: userId,
      nuevo_plan: nuevoPlan
    });
  },

  async adminBanUser(userId: string) {
    return supabase.rpc('admin_eliminar_usuario', {
      user_id: userId
    });
  }
};
