const URL_ = process.env.PUBLIC_SUPABASE_URL || 'https://whswnxgpmucdqxbhwnuz.supabase.co';
const KEY = process.env.PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_NbUT3PGarPMr1J56I6rkNQ_RA2JTdi_';

export default async function handler(req, res) {
  try {
    const r = await fetch(`${URL_}/rest/v1/locations?select=id&limit=1`, { headers: { apikey: KEY } });
    res.setHeader('Cache-Control', 'no-store');
    res.status(r.ok ? 200 : 502).json({ ok: r.ok, status: r.status, at: new Date().toISOString() });
  } catch (e) {
    res.status(502).json({ ok: false, error: String(e), at: new Date().toISOString() });
  }
}
