export const SUPABASE_URL = (import.meta.env.PUBLIC_SUPABASE_URL as string | undefined) || 'https://whswnxgpmucdqxbhwnuz.supabase.co';
export const SUPABASE_KEY = (import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string | undefined) || 'sb_publishable_NbUT3PGarPMr1J56I6rkNQ_RA2JTdi_';
export const CLINIC_WHATSAPP = ((import.meta.env.PUBLIC_CLINIC_WHATSAPP as string | undefined) ?? '').replace(/[^0-9]/g, '');
