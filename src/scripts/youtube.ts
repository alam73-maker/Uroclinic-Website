const init = () => {
  document.querySelectorAll<HTMLElement>('.yt[data-yt]:not([data-ready])').forEach((box) => {
    box.dataset.ready = '1';
    const link = box.querySelector<HTMLAnchorElement>('.yt-facade');
    link?.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      const f = document.createElement('iframe');
      f.src = `https://www.youtube-nocookie.com/embed/${box.dataset.yt}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
      f.title = box.dataset.title || 'YouTube video';
      f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      f.allowFullscreen = true;
      f.referrerPolicy = 'strict-origin-when-cross-origin';
      box.replaceChildren(f);
      box.classList.add('yt--playing');
    });
  });
};
init();
document.addEventListener('astro:page-load', init);
