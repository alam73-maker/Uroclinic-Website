const norm = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[ً-ٰٟ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').split(/\s+/).map((w) => w.replace(/^(و?ال)(?=..)/, '')).join(' ').trim();
const setupCareSearch = () => {
  document.querySelectorAll<HTMLFormElement>('[data-care-search]:not([data-ready])').forEach((f) => {
    f.dataset.ready = '1';
    const items = JSON.parse(f.dataset.index || '[]') as { label: string; to: string }[];
    const msg = f.querySelector<HTMLElement>('[data-nomatch]');
    const input = f.querySelector<HTMLInputElement>('input');
    input?.addEventListener('input', () => { if (msg) msg.hidden = true; });
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = norm(input?.value || '');
      if (!q) return;
      const words = q.split(/\s+/);
      const hit = items.find((i) => norm(i.label) === q) || items.find((i) => words.every((w) => norm(i.label).includes(w))) || items.find((i) => words.some((w) => w.length > 2 && norm(i.label).includes(w)));
      if (hit) location.href = hit.to;
      else if (msg) { msg.hidden = false; document.getElementById('care-areas')?.scrollIntoView({ behavior: 'smooth' }); }
    });
  });
};
setupCareSearch();
document.addEventListener('astro:page-load', setupCareSearch);
export {};
