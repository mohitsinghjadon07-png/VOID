/*
 * VOID / CINEMATIC SYSTEM v3
 * Progressive enhancement only. Auth, Supabase, GitHub sync and profile logic
 * remain in the original application files and are not modified here.
 */
(() => {
  'use strict';

  if (window.__VOID_CINEMATIC_V3__) return;
  window.__VOID_CINEMATIC_V3__ = true;

  const body = document.body;
  const root = document.documentElement;
  const hero = document.querySelector('.hero-section');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(pointer: fine) and (min-width: 901px)');
  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  let scrollFrame = 0;
  let pointerFrame = 0;
  let pendingPointer = null;
  let lastY = window.scrollY || 0;
  let gallery = null;
  let galleryGrid = null;
  let galleryMeasureFrame = 0;

  body.classList.add('void-cinematic-ready');

  function createDepthField() {
    if (!hero || hero.querySelector('.void-depth-field')) return;
    const field = document.createElement('div');
    field.className = 'void-depth-field';
    field.setAttribute('aria-hidden', 'true');
    field.innerHTML = `
      <div class="void-depth-sky"></div>
      <div class="void-depth-far"></div>
      <div class="void-depth-mid"></div>
      <div class="void-depth-grid"></div>
      <div class="void-depth-stars"></div>
      <span class="void-depth-halo void-depth-halo-a"></span>
      <span class="void-depth-halo void-depth-halo-b"></span>
      <span class="void-depth-halo void-depth-halo-c"></span>
      <span class="void-depth-orbit void-depth-orbit-a"></span>
      <span class="void-depth-orbit void-depth-orbit-b"></span>
      <span class="void-depth-orbit void-depth-orbit-c"></span>
      <span class="void-depth-beam"></span>
      <div class="void-depth-foreground"></div>`;

    // Deterministic star positions: no canvas loop, random flicker, or external imagery.
    const stars = field.querySelector('.void-depth-stars');
    const points = [
      [7,16,2,.62,3.8],[16,31,1,.42,4.9],[23,12,2,.58,5.2],[31,25,1,.37,4.1],
      [41,10,1,.49,6.1],[56,19,2,.47,4.2],[67,9,1,.66,5.7],[78,27,2,.38,4.8],
      [89,13,1,.52,5.1],[94,38,2,.40,4.5],[11,51,1,.38,6.3],[27,45,2,.52,5.3],
      [72,47,1,.53,3.9],[84,58,1,.38,5.8],[5,73,1,.35,4.7],[35,66,1,.41,5.5],
      [61,70,2,.48,4.3],[92,77,1,.36,5.1],[48,33,1,.32,6.4],[19,84,2,.37,4.9],
      [75,86,1,.42,5.6],[58,55,1,.32,4.4],[38,83,1,.29,5.9],[97,21,1,.31,4.6]
    ];
    points.forEach(([x, y, size, opacity, duration], index) => {
      const star = document.createElement('span');
      star.className = 'void-depth-star';
      star.style.setProperty('--star-x', `${x}%`);
      star.style.setProperty('--star-y', `${y}%`);
      star.style.setProperty('--star-size', `${size}px`);
      star.style.setProperty('--star-opacity', opacity);
      star.style.setProperty('--star-duration', `${duration}s`);
      star.style.setProperty('--star-delay', `${-(index % 7) * .6}s`);
      stars.appendChild(star);
    });
    hero.prepend(field);
  }

  function createBackToTop() {
    let button = document.querySelector('.void-top-button');
    if (button) return button;
    button = document.createElement('button');
    button.type = 'button';
    button.className = 'void-top-button';
    button.setAttribute('aria-label', 'Back to top');
    button.innerHTML = '<span>BACK TO TOP</span><span class="void-top-arrow" aria-hidden="true">↑</span>';
    body.appendChild(button);
    button.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    });
    return button;
  }

  const topButton = createBackToTop();

  function attachMagneticMotion() {
    if (!finePointer.matches || reduceMotion.matches) return;
    document.querySelectorAll('.hero-cta .button-primary, .hero-cta .button-quiet, .all-work-link, .repo-archive')
      .forEach((element) => {
        if (element.dataset.voidMagneticBound) return;
        element.dataset.voidMagneticBound = 'true';
        element.style.transition = `${element.style.transition ? `${element.style.transition}, ` : ''}translate .2s cubic-bezier(.2,.8,.2,1)`;
        element.addEventListener('pointermove', (event) => {
          const rect = element.getBoundingClientRect();
          const x = (event.clientX - rect.left) / Math.max(rect.width, 1) - .5;
          const y = (event.clientY - rect.top) / Math.max(rect.height, 1) - .5;
          element.style.setProperty('--void-magnet-x', `${(x * 5).toFixed(1)}px`);
          element.style.setProperty('--void-magnet-y', `${(y * 4).toFixed(1)}px`);
        }, { passive: true });
        element.addEventListener('pointerleave', () => {
          element.style.setProperty('--void-magnet-x', '0px');
          element.style.setProperty('--void-magnet-y', '0px');
        });
        element.classList.add('void-magnetic');
      });
  }

  function setupSectionReveals() {
    if (!('IntersectionObserver' in window)) return;
    const sections = document.querySelectorAll('.intro-section, .identity-section, .work-section, .lab-section, .closing-section');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('void-in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .12, rootMargin: '0px 0px -7% 0px' });
    sections.forEach(section => observer.observe(section));
  }

  /*
   * Upgrade the actual projectGrid after dashboard.js has rendered live GitHub
   * repositories. The existing #projectGrid element is preserved so existing
   * rendering, reveals, links, tilt listeners and later replaceChildren() calls
   * keep working. On mobile it becomes a touch-scrollable row instead of pinning.
   */
  function buildHorizontalGallery() {
    const grid = document.getElementById('projectGrid');
    if (!grid) return;
    const cards = grid.querySelectorAll('.project-card');
    const existing = grid.closest('.void-gallery-viewport');

    if (cards.length < 2) {
      if (existing) {
        // Restore the original grid layout if a profile has fewer than two cards.
        existing.parentElement?.insertBefore(grid, existing);
        existing.remove();
      }
      if (gallery === existing) gallery = null;
      if (galleryGrid === grid) galleryGrid = null;
      grid.classList.remove('void-gallery-track');
      grid.style.removeProperty('--void-gallery-x');
      return;
    }

    if (!existing) {
      const parent = grid.parentElement;
      if (!parent) return;
      const viewport = document.createElement('div');
      viewport.className = 'void-gallery-viewport';
      viewport.setAttribute('aria-label', 'Horizontal gallery of public GitHub projects');
      const pin = document.createElement('div');
      pin.className = 'void-gallery-pin';
      const hud = document.createElement('div');
      hud.className = 'void-gallery-hud';
      hud.innerHTML = '<span>VOID / <strong>SELECTED SIGNALS</strong></span><span class="void-gallery-counter">01 / 01</span><span class="void-gallery-meter" aria-hidden="true"><span></span></span>';
      const caption = document.createElement('div');
      caption.className = 'void-gallery-caption';
      caption.textContent = 'SCROLL TO MOVE HORIZONTALLY  →';
      parent.insertBefore(viewport, grid);
      viewport.appendChild(pin);
      pin.appendChild(hud);
      pin.appendChild(grid);
      pin.appendChild(caption);
      grid.classList.add('void-gallery-track');
      grid.dataset.voidGalleryTrack = 'true';
      gallery = viewport;
      galleryGrid = grid;
    } else {
      gallery = existing;
      galleryGrid = grid;
      grid.classList.add('void-gallery-track');
    }
    measureGallery();
  }

  function galleryIsPinned() {
    return !!gallery && window.matchMedia('(min-width: 901px) and (pointer: fine)').matches && !reduceMotion.matches;
  }

  function measureGallery() {
    if (!gallery || !galleryGrid) return;
    if (galleryMeasureFrame) window.cancelAnimationFrame(galleryMeasureFrame);
    galleryMeasureFrame = window.requestAnimationFrame(() => {
      galleryMeasureFrame = 0;
      const pin = gallery.querySelector('.void-gallery-pin');
      if (!pin) return;
      const cards = galleryGrid.querySelectorAll('.project-card');
      const pinned = galleryIsPinned() && cards.length > 1;
      gallery.classList.toggle('is-mobile', !pinned);
      gallery.classList.toggle('is-pinned', pinned);
      const hudCounter = gallery.querySelector('.void-gallery-counter');
      if (hudCounter) hudCounter.textContent = `01 / ${String(Math.max(1, cards.length)).padStart(2, '0')}`;

      if (!pinned) {
        gallery.style.height = 'auto';
        gallery.style.removeProperty('--void-gallery-distance');
        gallery.style.removeProperty('--void-gallery-progress');
        galleryGrid.style.removeProperty('--void-gallery-x');
        return;
      }

      // Wait one frame after layout so the flex track's full scrollWidth is accurate.
      const pinHeight = Math.max(470, Math.min(window.innerHeight * .70, 650));
      const horizontalTravel = Math.max(0, galleryGrid.scrollWidth - pin.clientWidth);
      const verticalTravel = Math.max(220, horizontalTravel * .86);
      gallery.style.height = `${Math.ceil(pinHeight + verticalTravel)}px`;
      gallery.style.setProperty('--void-gallery-distance', `${horizontalTravel}px`);
      gallery.dataset.horizontalTravel = String(horizontalTravel);
    });
  }

  function updateGallery(y) {
    if (!gallery || !galleryGrid || !gallery.classList.contains('is-pinned')) return;
    const pin = gallery.querySelector('.void-gallery-pin');
    if (!pin) return;
    const rect = gallery.getBoundingClientRect();
    const pinTop = Math.max(0, parseFloat(getComputedStyle(pin).top) || 88);
    const scrollDistance = Math.max(1, gallery.offsetHeight - pin.offsetHeight);
    const progress = clamp((pinTop - rect.top) / scrollDistance);
    const travel = Math.max(0, galleryGrid.scrollWidth - pin.clientWidth);
    gallery.style.setProperty('--void-gallery-progress', progress.toFixed(4));
    galleryGrid.style.setProperty('--void-gallery-x', `${(-travel * progress).toFixed(1)}px`);
    const cards = galleryGrid.querySelectorAll('.project-card');
    const activeIndex = Math.min(Math.max(cards.length - 1, 0), Math.floor(progress * cards.length));
    const counter = gallery.querySelector('.void-gallery-counter');
    if (counter) counter.textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${String(Math.max(cards.length, 1)).padStart(2, '0')}`;
  }

  function updateScroll() {
    scrollFrame = 0;
    const y = window.scrollY || root.scrollTop || 0;
    topButton.classList.toggle('is-visible', y > Math.max(520, window.innerHeight * .72));

    // Hide the nav only after the first screen; reveal immediately on upward travel.
    const nav = document.getElementById('siteNav');
    const delta = y - lastY;
    if (nav && y > 280 && delta > 5) nav.classList.add('void-nav-hidden');
    else if (nav && (delta < -3 || y < 90)) nav.classList.remove('void-nav-hidden');
    lastY = y;

    if (hero && !reduceMotion.matches) {
      const rect = hero.getBoundingClientRect();
      const progress = clamp((-rect.top) / Math.max(1, rect.height));
      hero.style.setProperty('--void-grid-y', `${(progress * 125).toFixed(1)}px`);
      hero.style.setProperty('--void-sky-y', `${(progress * 15).toFixed(1)}px`);
      hero.style.setProperty('--void-far-y', `${(progress * -24).toFixed(1)}px`);
      hero.style.setProperty('--void-mid-y', `${(progress * -54).toFixed(1)}px`);
      hero.style.setProperty('--void-orbit-y', `${(progress * -78).toFixed(1)}px`);
      hero.style.setProperty('--void-orbit-rotation', `${(progress * 18).toFixed(2)}deg`);
      hero.style.setProperty('--void-front-y', `${(progress * -105).toFixed(1)}px`);
      hero.style.setProperty('--void-beam-y', `${(progress * 110).toFixed(1)}px`);
      hero.style.setProperty('--void-star-y', `${(progress * -22).toFixed(1)}px`);
    }
    const closing = document.getElementById('closing');
    if (closing && !reduceMotion.matches) {
      const closingRect = closing.getBoundingClientRect();
      const closeProgress = clamp((window.innerHeight - closingRect.top) / Math.max(1, window.innerHeight + closingRect.height));
      closing.style.setProperty('--void-closing-zoom', (1.04 + closeProgress * .12).toFixed(3));
    }
    updateGallery(y);
  }

  function requestScroll() {
    if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateScroll);
  }

  function setupPointerDepth() {
    if (!hero || !finePointer.matches || reduceMotion.matches) return;
    hero.addEventListener('pointermove', (event) => {
      pendingPointer = { x: event.clientX, y: event.clientY };
      if (!pointerFrame) pointerFrame = window.requestAnimationFrame(applyPointerDepth);
    }, { passive: true });
    hero.addEventListener('pointerleave', () => {
      pendingPointer = null;
      ['--void-halo-a-x','--void-halo-a-y','--void-halo-b-x','--void-halo-b-y','--void-halo-c-x','--void-halo-c-y','--void-beam-x','--void-far-x','--void-mid-x','--void-star-x']
        .forEach(name => hero.style.setProperty(name, '0px'));
    });
  }

  function applyPointerDepth() {
    pointerFrame = 0;
    if (!hero || !pendingPointer || reduceMotion.matches) return;
    const rect = hero.getBoundingClientRect();
    const nx = clamp((pendingPointer.x - rect.left) / Math.max(rect.width, 1), 0, 1) - .5;
    const ny = clamp((pendingPointer.y - rect.top) / Math.max(rect.height, 1), 0, 1) - .5;
    hero.style.setProperty('--void-halo-a-x', `${(-nx * 36).toFixed(1)}px`);
    hero.style.setProperty('--void-halo-a-y', `${(-ny * 24).toFixed(1)}px`);
    hero.style.setProperty('--void-halo-b-x', `${(nx * 32).toFixed(1)}px`);
    hero.style.setProperty('--void-halo-b-y', `${(ny * 28).toFixed(1)}px`);
    hero.style.setProperty('--void-halo-c-x', `${(nx * 22).toFixed(1)}px`);
    hero.style.setProperty('--void-halo-c-y', `${(-ny * 18).toFixed(1)}px`);
    hero.style.setProperty('--void-far-x', `${(-nx * 12).toFixed(1)}px`);
    hero.style.setProperty('--void-mid-x', `${(nx * 30).toFixed(1)}px`);
    hero.style.setProperty('--void-star-x', `${(nx * -14).toFixed(1)}px`);
    hero.style.setProperty('--void-beam-x', `${(nx * 26).toFixed(1)}px`);
  }

  // GSAP + ScrollTrigger are optional enhancements. Pin their versions and keep
  // the existing native scroll engine as the source of truth for the page.
  function loadPinnedScript(src) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[data-void-cdn="${src}"]`);
      if (existing) {
        if (existing.dataset.loaded === 'true') resolve();
        else { existing.addEventListener('load', resolve, { once: true }); existing.addEventListener('error', reject, { once: true }); }
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.dataset.voidCdn = src;
      script.addEventListener('load', () => { script.dataset.loaded = 'true'; resolve(); }, { once: true });
      script.addEventListener('error', reject, { once: true });
      document.head.appendChild(script);
    });
  }

  async function optionalGsapEnhancement() {
    if (reduceMotion.matches) return;
    try {
      await loadPinnedScript('https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js');
      await loadPinnedScript('https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js');
      if (!window.gsap || !window.ScrollTrigger) return;
      window.gsap.registerPlugin(window.ScrollTrigger);
      // Animate only decorative elements; core UI visibility and auth stay native.
      window.gsap.fromTo('.void-depth-orbit-c', { rotation: -12, scale: .94 }, {
        rotation: 12, scale: 1.04, ease: 'none',
        scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 1 }
      });
      window.gsap.fromTo('.closing-orbit', { scale: .86, rotation: -10 }, {
        scale: 1.08, rotation: 10, ease: 'none',
        scrollTrigger: { trigger: '#closing', start: 'top bottom', end: 'bottom top', scrub: 1 }
      });
      window.gsap.fromTo('.site-footer .footer-brand', { y: 16, autoAlpha: .5 }, {
        y: 0, autoAlpha: 1, duration: .7,
        scrollTrigger: { trigger: '.site-footer', start: 'top 95%', once: true }
      });
      window.ScrollTrigger.refresh();
    } catch (error) {
      // CDN is a bonus, not a requirement. CSS and native parallax remain functional.
      console.info('VOID cinematic extras are using the native fallback.');
    }
  }

  function start() {
    createDepthField();
    attachMagneticMotion();
    setupPointerDepth();
    setupSectionReveals();

    const grid = document.getElementById('projectGrid');
    if (grid) {
      // dashboard.js fetches/render repositories asynchronously; wait for real cards.
      const observer = new MutationObserver(() => {
        buildHorizontalGallery();
        requestScroll();
      });
      observer.observe(grid, { childList: true, subtree: false });
      buildHorizontalGallery();
    }

    window.addEventListener('scroll', requestScroll, { passive: true });
    window.addEventListener('resize', () => { measureGallery(); requestScroll(); }, { passive: true });
    requestScroll();
    optionalGsapEnhancement();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
