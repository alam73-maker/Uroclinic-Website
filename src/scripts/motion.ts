const root = document.documentElement;
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const onScroll = () => {
  const y = window.scrollY;
  root.classList.toggle('is-scrolled', y > 24);
  root.classList.toggle('past-hero', y > Math.min(window.innerHeight * 0.6, 520));
};
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

const SEL = [
  '.hx-topic', '.hx-media', '.hx-band__in > *', '.hx-video__head > *', '.hx-video__player', '.hx-cards > *',
  '.tq-home__head > *', '.tq-grid .tq-card', '.hx-list li', '.hx-actions', '.hx-copy > h2', '.hx-copy > .hx-pill', '.hx-map img',
  '.pf-sec', '.pf-rows li', '.pf-tiles li', '.pf-badges li', '.pf-timeline li', '.pf-research', '.pub-year', '.meetings li', '.topic-row', '.prose > *', '.video-card', '.closing .container > *',
].join(',');

if (!reduce && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('rv-in'); io.unobserve(e.target); }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  const vh = window.innerHeight;
  document.querySelectorAll<HTMLElement>('[data-tq-track]').forEach((track) => {
    if (track.getBoundingClientRect().top < vh * 0.92) return;
    const cards = [...track.children] as HTMLElement[];
    cards.forEach((c, i) => { c.style.setProperty('--rv-d', `${Math.min(i, 4) * 80}ms`); c.classList.add('rv'); });
    const tio = new IntersectionObserver((es) => {
      if (es.some((e) => e.isIntersecting)) { cards.forEach((c) => c.classList.add('rv-in')); tio.disconnect(); }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    tio.observe(track);
  });
  document.querySelectorAll<HTMLElement>(SEL).forEach((el) => {
    if (el.getBoundingClientRect().top < vh * 0.92) return;
    const sibs = el.parentElement ? Array.from(el.parentElement.children).filter((c) => c.matches(SEL)) : [];
    el.style.setProperty('--rv-d', `${Math.min(sibs.indexOf(el), 5) * 70}ms`);
    el.classList.add('rv');
    io.observe(el);
  });
}
