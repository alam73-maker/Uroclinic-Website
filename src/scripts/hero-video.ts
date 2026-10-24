const setup = () => {
  const v = document.querySelector<HTMLVideoElement>('[data-hero-video]');
  if (!v) return;
  const small = window.matchMedia('(max-width: 700px)').matches;
  if (small) v.poster = '/video/hero-m-poster.jpg';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    v.removeAttribute('autoplay');
    v.pause();
    return;
  }
  v.muted = true;
  v.play().catch(() => {});
};
setup();
document.addEventListener('astro:page-load', setup);
