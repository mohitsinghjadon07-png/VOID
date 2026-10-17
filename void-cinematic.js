/* VOID / CINEMATIC DEPTH LAYER
   Safe companion script. It does not touch auth, Supabase, or GitHub sync. */
(() => {
  'use strict';

  if (window.__VOID_CINEMATIC_LOADED__) return;
  window.__VOID_CINEMATIC_LOADED__ = true;

  const body = document.body;
  const root = document.documentElement;
  const hero = document.querySelector('.hero-section');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const coarsePointer = window.matchMedia('(pointer: coarse)');
  let scrollFrame = 0;
  let pointerFrame = 0;
  let pendingPointer = null;

  body.classList.add('void-cinematic-ready');

  // Add layered depth artwork without modifying dashboard.html's existing hero markup.
  if (hero && !hero.querySelector('.void-depth-field')) {
    const field = document.createElement('div');
    field.className = 'void-depth-field';
    field.setAttribute('aria-hidden', 'true');
    field.innerHTML = `
      <div class="void-depth-grid"></div>
      <span class="void-depth-halo void-depth-halo-a"></span>
      <span class="void-depth-halo void-depth-halo-b"></span>
      <span class="void-depth-halo void-depth-halo-c"></span>
      <span class="void-depth-orbit void-depth-orbit-a"></span>
      <span class="void-depth-orbit void-depth-orbit-b"></span>
      <span class="void-depth-beam"></span>`;
    hero.prepend(field);
  }

  // A subtle “back to top” control; kept outside the content flow.
  let topButton = document.querySelector('.void-top-button');
  if (!topButton) {
    topButton = document.createElement('button');
    topButton.type = 'button';
    topButton.className = 'void-top-button';
    topButton.setAttribute('aria-label', 'Back to top');
    topButton.innerHTML = '<span>BACK TO TOP</span><span class="void-top-arrow" aria-hidden="true">↑</span>';
    document.body.appendChild(topButton);
    topButton.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    });
  }

  // Tiny magnetic response on only the primary navigation actions, not form controls.
  if (!coarsePointer.matches && !reducedMotion.matches) {
    const magneticTargets = document.querySelectorAll(
      '.hero-cta .button-primary, .hero-cta .button-quiet, .all-work-link, .repo-archive'
    );

    magneticTargets.forEach((element) => {
      element.classList.add('void-magnetic');
      element.addEventListener('pointermove', (event) => {
        const rect = element.getBoundingClientRect();
        const x = (event.clientX - rect.left) / Math.max(rect.width, 1) - 0.5;
        const y = (event.clientY - rect.top) / Math.max(rect.height, 1) - 0.5;
        element.style.setProperty('--void-magnet-x', `${(x * 5).toFixed(1)}px`);
        element.style.setProperty('--void-magnet-y', `${(y * 4).toFixed(1)}px`);
      });
      element.addEventListener('pointerleave', () => {
        element.style.setProperty('--void-magnet-x', '0px');
        element.style.setProperty('--void-magnet-y', '0px');
      });
    });
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  // Use a single animation frame for scroll-linked parallax values.
  function updateScrollDepth() {
    scrollFrame = 0;
    const y = window.scrollY || window.pageYOffset || 0;
    topButton.classList.toggle('is-visible', y > Math.max(550, window.innerHeight * 0.72));

    if (!hero || reducedMotion.matches) return;

    const rect = hero.getBoundingClientRect();
    const shift = clamp(-rect.top * 0.095, -26, 74);
    hero.style.setProperty('--void-grid-y', `${shift.toFixed(1)}px`);
    hero.style.setProperty('--void-orbit-y', `${(shift * 0.42).toFixed(1)}px`);
    hero.style.setProperty('--void-orbit-rotation', `${clamp(y * 0.006, -8, 8).toFixed(2)}deg`);
  }

  function requestScrollDepth() {
    if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateScrollDepth);
  }

  function applyPointerDepth() {
    pointerFrame = 0;
    if (!hero || !pendingPointer || reducedMotion.matches || coarsePointer.matches) return;

    const rect = hero.getBoundingClientRect();
    const nx = clamp((pendingPointer.x - rect.left) / Math.max(rect.width, 1), 0, 1) - 0.5;
    const ny = clamp((pendingPointer.y - rect.top) / Math.max(rect.height, 1), 0, 1) - 0.5;
    hero.style.setProperty('--void-halo-a-x', `${(-nx * 28).toFixed(1)}px`);
    hero.style.setProperty('--void-halo-a-y', `${(-ny * 18).toFixed(1)}px`);
    hero.style.setProperty('--void-halo-b-x', `${(nx * 22).toFixed(1)}px`);
    hero.style.setProperty('--void-halo-b-y', `${(ny * 24).toFixed(1)}px`);
    hero.style.setProperty('--void-halo-c-x', `${(nx * 13).toFixed(1)}px`);
    hero.style.setProperty('--void-halo-c-y', `${(-ny * 11).toFixed(1)}px`);
    hero.style.setProperty('--void-beam-x', `${(nx * 14).toFixed(1)}px`);
  }

  if (hero && !reducedMotion.matches && !coarsePointer.matches) {
    hero.addEventListener('pointermove', (event) => {
      pendingPointer = { x: event.clientX, y: event.clientY };
      if (!pointerFrame) pointerFrame = window.requestAnimationFrame(applyPointerDepth);
    }, { passive: true });

    hero.addEventListener('pointerleave', () => {
      pendingPointer = null;
      [
        '--void-halo-a-x', '--void-halo-a-y', '--void-halo-b-x',
        '--void-halo-b-y', '--void-halo-c-x', '--void-halo-c-y', '--void-beam-x'
      ].forEach((name) => hero.style.setProperty(name, '0px'));
    });
  }

  // Mark sections as they enter view so their existing styling can transition subtly.
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('void-in-view');
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });

    document.querySelectorAll('.intro-section, .identity-section, .work-section, .lab-section, .closing-section')
      .forEach((section) => observer.observe(section));
  }

  window.addEventListener('scroll', requestScrollDepth, { passive: true });
  window.addEventListener('resize', requestScrollDepth, { passive: true });
  requestScrollDepth();
})();
