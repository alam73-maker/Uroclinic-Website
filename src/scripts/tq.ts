const track = document.querySelector<HTMLElement>('[data-tq-track]');
document.querySelectorAll<HTMLButtonElement>('[data-tq]').forEach((b) => {
  b.addEventListener('click', () => {
    if (!track) return;
    const card = track.querySelector<HTMLElement>('.tq-card');
    const step = (card?.offsetWidth || 320) + 16;
    const dir = Number(b.dataset.tq) * (document.dir === 'rtl' ? -1 : 1);
    track.scrollBy({ left: dir * step, behavior: 'smooth' });
  });
});

const page = document.querySelector<HTMLElement>('[data-tq-grid]');
if (page) {
  const bar = document.querySelector<HTMLElement>('[data-tq-filter]');
  const more = document.querySelector<HTMLButtonElement>('[data-tq-more]');
  const cards = [...page.querySelectorAll<HTMLElement>('.tq-card')];
  bar?.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest('button');
    if (!b) return;
    const k = b.dataset.theme;
    bar.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    cards.forEach((c) => { c.hidden = k !== 'all' && c.dataset.theme !== k; });
    page.classList.toggle('is-open', k !== 'all');
    if (more) more.parentElement!.hidden = k !== 'all' || page.classList.contains('was-opened');
  });
  more?.addEventListener('click', () => {
    page.classList.add('is-open', 'was-opened');
    more.parentElement!.hidden = true;
  });
}
export {};
