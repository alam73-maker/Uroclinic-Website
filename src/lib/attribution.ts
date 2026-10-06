const KEY = 'uc_attr';

export interface Attribution {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  landing_path: string | null;
  referrer: string | null;
}

function read(): Attribution | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Attribution) : null;
  } catch {
    return null;
  }
}

function capture() {
  const params = new URLSearchParams(location.search);
  const hasUtm = ['utm_source', 'utm_medium', 'utm_campaign', 'gclid', 'fbclid', 'ttclid'].some((k) => params.has(k));
  if (read() && !hasUtm) return;
  let ref: string | null = null;
  try {
    if (document.referrer) {
      const r = new URL(document.referrer);
      if (r.host !== location.host) ref = r.host;
    }
  } catch {}
  const source = params.get('utm_source') ?? (params.has('gclid') ? 'google' : params.has('fbclid') ? 'meta' : params.has('ttclid') ? 'tiktok' : null);
  const data: Attribution = {
    utm_source: source?.slice(0, 100) ?? null,
    utm_medium: params.get('utm_medium')?.slice(0, 100) ?? (params.has('gclid') || params.has('fbclid') || params.has('ttclid') ? 'paid' : null),
    utm_campaign: params.get('utm_campaign')?.slice(0, 150) ?? null,
    landing_path: location.pathname.slice(0, 300),
    referrer: ref?.slice(0, 300) ?? null,
  };
  try { sessionStorage.setItem(KEY, JSON.stringify(data)); } catch {}
}

capture();

export function getAttribution(): Attribution {
  return read() ?? { utm_source: null, utm_medium: null, utm_campaign: null, landing_path: location.pathname, referrer: null };
}
