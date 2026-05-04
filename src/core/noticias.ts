import { supabase } from '@/infrastructure/supabase';

export interface Noticia {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  content: string;
  image_url: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export const noticiasService = {
  async getPublicNoticias() {
    return supabase
      .from('noticias')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });
  },

  async getNoticiaBySlug(slug: string) {
    return supabase
      .from('noticias')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();
  },

  // Admin methods
  async adminGetAllNoticias() {
    return supabase
      .from('noticias')
      .select('*')
      .order('created_at', { ascending: false });
  },

  async adminCreateNoticia(data: Partial<Noticia>) {
    return supabase.from('noticias').insert(data).select().single();
  },

  async adminUpdateNoticia(id: string, data: Partial<Noticia>) {
    return supabase.from('noticias').update(data).eq('id', id).select().single();
  },

  async adminDeleteNoticia(id: string) {
    return supabase.from('noticias').delete().eq('id', id);
  },

  async uploadNoticiaImage(file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `noticias/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('blog_images')
      .upload(fileName, file, { upsert: true });

    if (uploadError) throw new Error(uploadError.message);

    const { data } = await supabase.storage
      .from('blog_images')
      .getPublicUrl(fileName);

    return data.publicUrl;
  }
};
