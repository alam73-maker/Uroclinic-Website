const btn = document.querySelector<HTMLButtonElement>('[data-tm-more]');
const wall = document.querySelector<HTMLElement>('.tm-wall');
btn?.addEventListener('click', () => {
  wall?.classList.add('is-open');
  btn.parentElement?.remove();
});
export {};
