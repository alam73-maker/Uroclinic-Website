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
  '.hx-topic', '.hx-split > *', '.hx-band__in > *', '.hx-video__head > *', '.hx-video__player', '.hx-cards > *',
  '.tm-home h2', '.tm-home .tm-q', '.tm-wall .tm-q',
  '.pf-sec', '.pf-rows li', '.pf-tiles li', '.pf-badges li', '.pf-timeline li', '.pf-research', '.pub-year', '.meetings li', '.topic-row', '.prose > *', '.video-card', '.closing .container > *',
].join(',');

if (!reduce && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('rv-in'); io.unobserve(e.target); }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  const vh = window.innerHeight;
  document.querySelectorAll<HTMLElement>(SEL).forEach((el) => {
    if (el.getBoundingClientRect().top < vh * 0.92) return;
    const sibs = el.parentElement ? Array.from(el.parentElement.children).filter((c) => c.matches(SEL)) : [];
    el.style.setProperty('--rv-d', `${Math.min(sibs.indexOf(el), 5) * 70}ms`);
    el.classList.add('rv');
    io.observe(el);
  });
}
