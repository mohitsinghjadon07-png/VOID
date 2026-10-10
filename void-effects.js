(() => {
  const aura = document.getElementById('cursorAura');
  if (!aura || window.matchMedia('(pointer: coarse)').matches) return;
  let raf = 0;
  window.addEventListener('pointermove', (event) => {
    aura.style.left = `${event.clientX}px`;
    aura.style.top = `${event.clientY}px`;
    aura.style.opacity = '0.62';
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      document.documentElement.style.setProperty('--cursor-x', `${event.clientX}px`);
      document.documentElement.style.setProperty('--cursor-y', `${event.clientY}px`);
    });
  }, { passive: true });
  document.addEventListener('pointerleave', () => { aura.style.opacity = '0'; });
  document.addEventListener('pointerenter', () => { aura.style.opacity = '0.45'; });
})();
