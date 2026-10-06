import { SUPABASE_URL, SUPABASE_KEY, CLINIC_WHATSAPP } from './env';

export const hasBackend = Boolean(SUPABASE_URL && SUPABASE_KEY);
export const clinicWhatsApp = CLINIC_WHATSAPP;

export async function publicApi() {
  if (hasBackend) return (await import('./remote-public')).remotePublicApi;
  return (await import('./demo')).demoApi;
}

export async function adminApi() {
  if (hasBackend) return (await import('./remote-admin')).remoteAdminApi;
  return (await import('./demo')).demoApi;
}
