const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const h1 = document.querySelector<HTMLElement>('.hx-hero h1');
if (h1 && !reduce) {
  const words = (h1.textContent || '').trim().split(/\s+/);
  h1.setAttribute('aria-label', words.join(' '));
  h1.textContent = '';
  words.forEach((w, i) => {
    const span = document.createElement('span');
    span.className = 'w';
    span.setAttribute('aria-hidden', 'true');
    const inner = document.createElement('i');
    inner.textContent = w;
    inner.style.setProperty('--i', String(i));
    span.appendChild(inner);
    h1.appendChild(span);
    if (i < words.length - 1) h1.appendChild(document.createTextNode(' '));
  });
  h1.classList.add('is-split');
}

if (!reduce) {
  document.querySelectorAll<HTMLElement>('.hx-stats dt').forEach((dt, k) => {
    const m = dt.textContent?.match(/^(\d+)(.*)$/s);
    if (!m) return;
    const end = Number(m[1]);
    const rest = m[2];
    dt.textContent = `0${rest}`;
    const start = performance.now() + 700 + k * 100;
    const dur = 1200;
    const tick = (now: number) => {
      const t = Math.min(1, Math.max(0, (now - start) / dur));
      const e = 1 - Math.pow(1 - t, 3);
      dt.textContent = `${Math.round(end * e)}${rest}`;
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  const hero = document.querySelector<HTMLElement>('.hx-hero');
  const video = document.querySelector<HTMLElement>('.hx-hero__v');
  const copy = document.querySelector<HTMLElement>('.hx-hero__in');
  const band = document.querySelector<HTMLElement>('.hx-band');
  const bandImg = band?.querySelector<HTMLElement>('img');
  const medias = [...document.querySelectorAll<HTMLElement>('.hx-media img')];
  let ticking = false;
  const update = () => {
    ticking = false;
    const vh = window.innerHeight;
    const y = window.scrollY;
    if (hero && video && copy) {
      const h = hero.offsetHeight;
      if (y < h) {
        video.style.translate = `0 ${y * 0.25}px`;
        copy.style.translate = `0 ${y * 0.12}px`;
        copy.style.opacity = String(Math.max(0, 1 - y / (h * 0.75)));
      }
    }
    if (band && bandImg) {
      const r = band.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) {
        const p = (r.top + r.height / 2 - vh / 2) / vh;
        bandImg.style.translate = `0 ${p * -60}px`;
      }
    }
    medias.forEach((img) => {
      const r = img.parentElement!.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) {
        const p = (r.top + r.height / 2 - vh / 2) / vh;
        img.style.translate = `0 ${p * -30}px`;
      }
    });
  };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  update();
}

const track = document.querySelector<HTMLElement>('[data-tq-track]');
if (track && window.matchMedia('(pointer: fine)').matches) {
  let down = false, sx = 0, sl = 0, moved = false;
  track.addEventListener('pointerdown', (e) => { down = true; moved = false; sx = e.clientX; sl = track.scrollLeft; track.classList.add('is-drag'); });
  window.addEventListener('pointermove', (e) => { if (!down) return; const dx = e.clientX - sx; if (Math.abs(dx) > 4) moved = true; track.scrollLeft = sl - dx; });
  window.addEventListener('pointerup', () => { if (!down) return; down = false; track.classList.remove('is-drag'); });
  track.addEventListener('click', (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
}
export {};
