import { supabase } from '@/infrastructure/supabase';

export const authService = {
  async signIn(email: string, password: string) {
    return supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
  },
  async getUser() {
    return supabase.auth.getUser();
  },

  async signUp(email: string, password: string, name: string) {
    return supabase.auth.signUp({
      email: email.trim().toLowerCase(),
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

  async resetPassword(email: string) {
    return supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/actualizar-password`,
    });
  },

  async updatePassword(newPassword: string) {
    return supabase.auth.updateUser({
      password: newPassword
    });
  },

  async updateProfile(avatarFile: File) {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) throw new Error("No autenticado");
    
    const fileExt = avatarFile.name.split('.').pop();
    const filePath = `profesionales/${authData.user.id}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('pacientes_archivos')
      .upload(filePath, avatarFile, { upsert: true });

    if (uploadError) throw new Error(uploadError.message);

    const { data } = await supabase.storage
      .from('pacientes_archivos')
      .createSignedUrl(filePath, 31536000); // 1 año
      
    if (!data?.signedUrl) throw new Error("Error obteniendo URL.");

    // Update metadata
    const { error: updateError } = await supabase.auth.updateUser({
      data: { avatar_url: data.signedUrl }
    });

    if (updateError) throw new Error(updateError.message);
    
    return data.signedUrl;
  },

  // --- ADMIN RPC FUNCIONES ---
  async adminGetAllUsers() {
    return supabase.rpc('admin_get_users_stats');
  },

  async adminUpgradePlan(userId: string, nuevoPlan: string) {
    return supabase.rpc('admin_mejorar_plan', {
      user_id: userId,
      nuevo_plan: nuevoPlan
    });
  },

  async adminBanUser(userId: string) {
    return supabase.rpc('admin_eliminar_usuario', {
      target_user_id: userId
    });
  },

  async getSystemConfig() {
    return supabase.from('configuraciones_sistema').select('*').eq('id', 1).single();
  },

  async updateSystemConfig(soporte_telefono: string, soporte_email: string) {
    return supabase.from('configuraciones_sistema').update({
      soporte_telefono,
      soporte_email
    }).eq('id', 1);
  }
};
