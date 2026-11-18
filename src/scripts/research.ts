const bar = document.querySelector<HTMLElement>('[data-rs-filter]');
if (bar) {
  const btns = [...bar.querySelectorAll<HTMLButtonElement>('button')];
  const items = [...document.querySelectorAll<HTMLElement>('.rs-year li')];
  const groups = [...document.querySelectorAll<HTMLElement>('[data-rs-year]')];
  bar.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest('button');
    if (!b) return;
    const k = b.dataset.area;
    btns.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    items.forEach((li) => { li.hidden = k !== 'all' && li.dataset.area !== k; });
    groups.forEach((g) => { g.hidden = !g.querySelector('li:not([hidden])'); });
  });
}
export {};
