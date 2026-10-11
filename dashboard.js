(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const boot = $('#bootScreen');
  const bootMessage = $('#bootMessage');
  const bootError = $('#bootError');
  const bootErrorText = $('#bootErrorText');
  const workspace = $('#workspace');
  const themeButton = $('#themeToggle');
  const languageButton = $('#languageToggle');
  const logoutButton = $('#logoutButton');
  const canvas = $('#constellation');
  const cursorAura = $('#cursorAura');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const coarsePointer = window.matchMedia('(pointer: coarse)');

  let client = null;
  let activeUser = null;
  let activeLang = 'en';
  let animationFrame = 0;
  let scrollFrame = 0;
  let scrollTargets = [];
  let scrollLinks = [];
  let canvasContext = null;
  let nodes = [];
  let canvasWidth = 0;
  let canvasHeight = 0;
  let canvasDpr = 1;
  let pointer = { x: -1000, y: -1000, active: false };

  const copy = {
    en: {
      navWork: 'Selected work', navLab: 'The lab',
      heroKicker: 'CYBERSECURITY STUDENT · BUILDER · CURIOUS BY DEFAULT',
      heroDescription: 'I learn by building things — then I keep going until they feel right.',
      walkWork: 'Walk through my work', openGithub: 'Open GitHub', keepScrolling: 'KEEP SCROLLING',
      quickIntro: 'A QUICK INTRO', introText: "This is my corner of the internet: prototypes, class projects, hackathon ideas, a few rabbit holes — and the code that came out of them.",
      selectedWork: 'SELECTED WORK', workTitle: "Ideas, in the wild<span class='heading-dot'>.</span>", workIntro: "A few things I've been putting time into. Each one taught me something different.", allRepos: 'EVERY REPOSITORY',
      alsoRepos: 'ALSO IN THE REPOSITORY', labText: "Some projects are smaller, some are still finding their shape. They're part of the trail, too.",
      moreGithub: "There’s more on GitHub", browseRepos: 'Browse every public repo, including new experiments.', backToBuild: 'BACK TO THE BUILD', thanks: 'Thanks for looking around.', backTop: 'BACK TO TOP',
      signOut: 'Sign out', session: 'PRIVATE SESSION', guest: 'VISITOR DEMO', workspaceError: 'The cloud login configuration could not be loaded. Check that supabase-config.js is present and contains your project URL and public key.'
    },
    hi: {
      navWork: 'चुने हुए प्रोजेक्ट', navLab: 'लैब',
      heroKicker: 'साइबर सुरक्षा छात्र · बिल्डर · जिज्ञासु',
      heroDescription: 'मैं चीज़ें बनाकर सीखता हूँ — और तब तक बेहतर करता हूँ जब तक वे सही न लगें।',
      walkWork: 'मेरा काम देखें', openGithub: 'GitHub खोलें', keepScrolling: 'नीचे स्क्रॉल करें',
      quickIntro: 'एक छोटा परिचय', introText: 'यह इंटरनेट पर मेरी जगह है: प्रोटोटाइप, क्लास प्रोजेक्ट, हैकाथॉन आइडिया और उनसे बना कोड।',
      selectedWork: 'चुने हुए प्रोजेक्ट', workTitle: "आइडिया, असल दुनिया में<span class='heading-dot'>.</span>", workIntro: 'कुछ चीज़ें जिन पर मैंने समय लगाया है। हर प्रोजेक्ट ने कुछ अलग सिखाया।', allRepos: 'सभी रिपॉज़िटरी',
      alsoRepos: 'अन्य रिपॉज़िटरी', labText: 'कुछ प्रोजेक्ट छोटे हैं, कुछ अभी आकार ले रहे हैं। वे भी इस सफ़र का हिस्सा हैं।',
      moreGithub: 'GitHub पर और भी है', browseRepos: 'सभी पब्लिक रिपॉज़िटरी और नए प्रयोग देखें।', backToBuild: 'फिर से बिल्ड की ओर', thanks: 'यहाँ तक आने के लिए शुक्रिया।', backTop: 'ऊपर जाएँ',
      signOut: 'लॉग आउट', session: 'निजी सेशन', guest: 'विज़िटर डेमो', workspaceError: 'क्लाउड लॉगिन कॉन्फ़िगरेशन लोड नहीं हो सका। जाँचें कि supabase-config.js मौजूद है और उसमें प्रोजेक्ट URL व पब्लिक की है।'
    }
  };

  function showBootError(message) {
    bootMessage.textContent = 'WORKSPACE NEEDS ATTENTION';
    bootErrorText.textContent = message;
    bootError.hidden = false;
    const meter = $('.boot-meter');
    if (meter) meter.hidden = true;
  }

  function setTheme(theme) {
    const value = theme === 'light' ? 'light' : 'dark';
    document.body.dataset.theme = value;
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', value === 'dark' ? '#09070f' : '#f7f3fc');
    if (themeButton) {
      themeButton.setAttribute('aria-label', value === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
      const glyph = $('.theme-glyph', themeButton);
      if (glyph) glyph.textContent = value === 'dark' ? '◐' : '☼';
    }
    try { localStorage.setItem('void-theme-v1', value); } catch (_) { /* storage is optional */ }
  }

  function setLanguage(lang) {
    activeLang = lang === 'hi' ? 'hi' : 'en';
    document.documentElement.lang = activeLang;
    if (languageButton) {
      languageButton.textContent = activeLang === 'en' ? 'EN' : 'हि';
      languageButton.setAttribute('aria-label', activeLang === 'en' ? 'Switch to Hindi' : 'Switch to English');
      languageButton.title = activeLang === 'en' ? 'Switch to Hindi' : 'Switch to English';
    }
    document.querySelectorAll('[data-en][data-hi]').forEach((element) => {
      const value = element.dataset[activeLang];
      if (value !== undefined) element.innerHTML = value;
    });
    if (logoutButton) {
      const label = $('span[data-en][data-hi]', logoutButton);
      if (label) label.textContent = copy[activeLang].signOut;
    }
    const modeLabel = $('#modeLabel');
    if (modeLabel) modeLabel.textContent = activeLang === 'en' ? 'PRIVATE SESSION' : 'निजी सेशन';
    try { localStorage.setItem('void-language-v1', activeLang); } catch (_) { /* storage is optional */ }
  }

  function revealWorkspace(user) {
    activeUser = user;
    const username = user?.user_metadata?.username || user?.email?.split('@')[0] || 'MOHIT';
    $('#accountLabel').textContent = String(username).toUpperCase().slice(0, 20);
    document.body.dataset.authenticated = 'true';
    workspace.hidden = false;
    document.body.classList.remove('booting');
    boot.classList.add('boot-out');
    window.setTimeout(() => { if (boot.isConnected) boot.remove(); }, reducedMotion.matches ? 0 : 520);
    requestAnimationFrame(() => {
      document.body.classList.add('workspace-ready');
      prepareScrollExperience();
      observeRevealElements();
      updateScroll();
    });
  }

  async function signOut() {
    logoutButton.disabled = true;
    logoutButton.style.opacity = '.65';
    try {
      if (client) {
        // Local sign-out keeps other devices using the shared account from being logged out.
        await client.auth.signOut({ scope: 'local' });
      }
    } catch (_) { /* return to the portal even if a network call fails */ }
    window.location.replace('index.html');
  }

  async function bootWorkspace() {
    const config = window.VOID_CONFIG || {};
    const configured = Boolean(config.supabaseUrl && config.supabasePublishableKey &&
      !config.supabaseUrl.includes('PASTE_') && !config.supabasePublishableKey.includes('PASTE_') &&
      window.supabase && typeof window.supabase.createClient === 'function');

    if (!configured) {
      showBootError(copy.en.workspaceError);
      return;
    }

    try {
      client = window.supabase.createClient(config.supabaseUrl, config.supabasePublishableKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
      });
      const { data, error } = await client.auth.getSession();
      if (error) throw error;
      if (!data?.session?.user) {
        window.location.replace('index.html');
        return;
      }
      revealWorkspace(data.session.user);
      client.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT' || (!session && event === 'USER_DELETED')) {
          window.location.replace('index.html');
        }
      });
    } catch (_) {
      showBootError('VOID could not confirm your login session. Check your connection and Supabase setup, then return to the login portal.');
    }
  }

  function observeRevealElements() {
    const revealElements = document.querySelectorAll('[data-reveal]');
    if (reducedMotion.matches || !('IntersectionObserver' in window)) {
      revealElements.forEach(el => el.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          currentObserver.unobserve(entry.target);
        }
      });
    }, { threshold: .12, rootMargin: '0px 0px -45px 0px' });
    revealElements.forEach(el => observer.observe(el));
  }

  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));

  function prepareScrollExperience() {
    // Repository rows enter in sequence instead of appearing as one flat block.
    document.querySelectorAll('.repo-row').forEach((row, index) => {
      row.setAttribute('data-reveal', 'archive-row');
      row.style.setProperty('--reveal-delay', `${Math.min(index, 5) * 85}ms`);
    });
    document.querySelectorAll('.project-card').forEach((card, index) => {
      card.style.setProperty('--reveal-delay', `${Math.min(index, 7) * 75}ms`);
    });
    scrollLinks = Array.from(document.querySelectorAll('[data-scroll-link]'));
    scrollTargets = scrollLinks.map(link => document.getElementById(link.dataset.section)).filter(Boolean);
    updateScroll();
  }

  function updateScroll() {
    if (scrollFrame) return;
    scrollFrame = window.requestAnimationFrame(() => {
      scrollFrame = 0;
      const root = document.documentElement;
      const max = Math.max(1, root.scrollHeight - window.innerHeight);
      const y = window.scrollY || root.scrollTop || 0;
      const progress = clamp(y / max);
      const progressBar = $('#scrollProgress');
      if (progressBar) progressBar.style.transform = `scaleX(${progress})`;
      root.style.setProperty('--page-progress', progress.toFixed(4));
      const nav = $('#siteNav');
      if (nav) nav.classList.toggle('is-scrolled', y > 20);
      const railFill = $('#railTrackFill');
      if (railFill) railFill.style.transform = `scaleY(${progress})`;
      const railPercent = $('#railPercent');
      if (railPercent) railPercent.textContent = String(Math.round(progress * 100)).padStart(2, '0');

      if (!workspace || workspace.hidden) return;

      const hero = $('#hero');
      if (hero) {
        const rect = hero.getBoundingClientRect();
        const exit = clamp((-rect.top) / Math.max(1, rect.height * .88));
        hero.style.setProperty('--hero-exit', exit.toFixed(4));
        hero.style.setProperty('--hero-copy-opacity', (1 - exit * .62).toFixed(3));
        hero.style.setProperty('--hero-copy-scale', (1 - exit * .055).toFixed(3));
        hero.style.setProperty('--hero-copy-y', `${(-exit * 92).toFixed(1)}px`);
        hero.style.setProperty('--hero-visual-y', `${(exit * 105).toFixed(1)}px`);
        hero.style.setProperty('--hero-visual-rotation', `${(exit * 17).toFixed(2)}deg`);
        hero.style.setProperty('--hero-visual-scale', (1 + exit * .17).toFixed(3));
        hero.style.setProperty('--hero-ring-opacity', (1 - exit * .58).toFixed(3));
        hero.style.setProperty('--hero-ring-y', `${(exit * 90).toFixed(1)}px`);
        hero.style.setProperty('--hero-ring-scale', (1 + exit * .14).toFixed(3));
      }

      const intro = $('#intro');
      if (intro) {
        const rect = intro.getBoundingClientRect();
        const delta = clamp((window.innerHeight * .49 - (rect.top + rect.height * .49)) / Math.max(window.innerHeight, 1), -1, 1);
        intro.style.setProperty('--intro-title-y', `${(-delta * 36).toFixed(1)}px`);
        intro.style.setProperty('--intro-note-y', `${(delta * 24).toFixed(1)}px`);
        intro.style.setProperty('--intro-orbit-y', `${(-delta * 46).toFixed(1)}px`);
        intro.style.setProperty('--intro-orbit-rotation', `${(progress * 18).toFixed(2)}deg`);
      }

      const work = $('#work');
      if (work) {
        const rect = work.getBoundingClientRect();
        const delta = clamp((window.innerHeight * .46 - (rect.top + 110)) / Math.max(window.innerHeight, 1), -1, 1);
        work.style.setProperty('--work-heading-y', `${(-delta * 19).toFixed(1)}px`);
        work.style.setProperty('--work-orbit-y', `${(delta * 32).toFixed(1)}px`);
      }

      // Graphic layers move a little differently from the cards that contain them.
      document.querySelectorAll('.project-art').forEach(art => {
        const rect = art.getBoundingClientRect();
        const delta = clamp(((rect.top + rect.height * .5) - window.innerHeight * .5) / Math.max(window.innerHeight, 1), -1, 1);
        art.style.setProperty('--art-shift', `${(-delta * 22).toFixed(1)}px`);
        art.style.setProperty('--art-scale', (1.035 - Math.abs(delta) * .018).toFixed(3));
      });

      const closing = $('#closing');
      if (closing) {
        const rect = closing.getBoundingClientRect();
        const delta = clamp((window.innerHeight * .48 - (rect.top + rect.height * .44)) / Math.max(window.innerHeight, 1), -1, 1);
        closing.style.setProperty('--closing-title-y', `${(-delta * 26).toFixed(1)}px`);
      }

      root.style.setProperty('--ambient-left-y', `${(-progress * 36).toFixed(1)}px`);
      root.style.setProperty('--ambient-right-y', `${(progress * -64).toFixed(1)}px`);

      document.querySelectorAll('.repo-row').forEach(row => {
        const rect = row.getBoundingClientRect();
        const delta = clamp(((rect.top + rect.height * .5) - window.innerHeight * .5) / Math.max(window.innerHeight, 1), -1, 1);
        row.style.setProperty('--row-shift', `${(-delta * 10).toFixed(1)}px`);
      });

      // Keep the rail's highlighted chapter aligned to the middle of the reading area.
      const focusY = window.innerHeight * .43;
      let activeId = 'hero';
      let smallestDistance = Infinity;
      scrollTargets.forEach(section => {
        const rect = section.getBoundingClientRect();
        const distance = focusY < rect.top ? rect.top - focusY : focusY > rect.bottom ? focusY - rect.bottom : 0;
        if (distance < smallestDistance) {
          smallestDistance = distance;
          activeId = section.id;
        }
      });
      scrollLinks.forEach(link => {
        const active = link.dataset.section === activeId;
        link.classList.toggle('is-active', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
      const activeLink = scrollLinks.find(link => link.dataset.section === activeId);
      const activeNumber = $('#railCurrent');
      if (activeNumber && activeLink) activeNumber.textContent = activeLink.dataset.number || '01';
    });
  }

  function setupTilt() {
    if (coarsePointer.matches || reducedMotion.matches) return;
    document.querySelectorAll('.project-card').forEach(card => {
      card.addEventListener('pointermove', (event) => {
        const rect = card.getBoundingClientRect();
        const px = clamp((event.clientX - rect.left) / rect.width);
        const py = clamp((event.clientY - rect.top) / rect.height);
        card.style.setProperty('--card-x', `${px * 100}%`);
        card.style.setProperty('--card-y', `${py * 100}%`);
        const max = card.classList.contains('project-featured') ? 1.25 : 1.65;
        const rx = (0.5 - py) * max;
        const ry = (px - 0.5) * max;
        card.style.setProperty('--tilt-x', `${rx.toFixed(2)}deg`);
        card.style.setProperty('--tilt-y', `${ry.toFixed(2)}deg`);
        card.style.setProperty('--tilt-lift', '-3px');
      });
      card.addEventListener('pointerleave', () => {
        card.style.removeProperty('--tilt-x');
        card.style.removeProperty('--tilt-y');
        card.style.removeProperty('--tilt-lift');
      });
    });
  }

  function setCanvasSize() {
    if (!canvas || !canvasContext) return;
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    canvasDpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(canvasWidth * canvasDpr);
    canvas.height = Math.round(canvasHeight * canvasDpr);
    canvasContext.setTransform(canvasDpr, 0, 0, canvasDpr, 0, 0);
    const density = window.innerWidth < 680 ? .000018 : .000033;
    const count = Math.max(17, Math.min(53, Math.round(canvasWidth * canvasHeight * density)));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * canvasWidth,
      y: Math.random() * canvasHeight,
      vx: (Math.random() - .5) * .13,
      vy: (Math.random() - .5) * .13,
      phase: Math.random() * Math.PI * 2,
      radius: .55 + Math.random() * 1.1
    }));
    paintCanvas(0, true);
  }

  function paintCanvas(time = 0, oneFrame = false) {
    if (!canvasContext) return;
    const ctx = canvasContext;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    const motion = document.body.dataset.motion || 'balanced';
    const intensity = motion === 'calm' ? .38 : motion === 'immersive' ? .78 : .57;
    const connect = motion === 'immersive' ? 142 : motion === 'calm' ? 88 : 116;
    nodes.forEach((node, index) => {
      if (!oneFrame && !reducedMotion.matches) {
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < -10) node.x = canvasWidth + 10;
        if (node.x > canvasWidth + 10) node.x = -10;
        if (node.y < -10) node.y = canvasHeight + 10;
        if (node.y > canvasHeight + 10) node.y = -10;
      }
      for (let j = index + 1; j < nodes.length; j += 1) {
        const other = nodes[j];
        const distance = Math.hypot(node.x - other.x, node.y - other.y);
        if (distance < connect) {
          const alpha = (1 - distance / connect) * .19 * intensity;
          ctx.strokeStyle = `rgba(177, 126, 255, ${alpha})`;
          ctx.lineWidth = .65;
          ctx.beginPath(); ctx.moveTo(node.x, node.y); ctx.lineTo(other.x, other.y); ctx.stroke();
        }
      }
      if (pointer.active && !coarsePointer.matches) {
        const distance = Math.hypot(node.x - pointer.x, node.y - pointer.y);
        if (distance < 125) {
          ctx.strokeStyle = `rgba(202, 171, 255, ${(1 - distance / 125) * .3})`;
          ctx.beginPath(); ctx.moveTo(node.x, node.y); ctx.lineTo(pointer.x, pointer.y); ctx.stroke();
        }
      }
      const pulse = reducedMotion.matches ? .9 : .76 + Math.sin(time * .001 + node.phase) * .24;
      ctx.beginPath(); ctx.arc(node.x, node.y, node.radius * pulse, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(204, 173, 255, ${.58 * intensity})`;
      ctx.shadowColor = 'rgba(164, 95, 255, .55)'; ctx.shadowBlur = 6; ctx.fill(); ctx.shadowBlur = 0;
    });
    if (!oneFrame && !reducedMotion.matches) animationFrame = requestAnimationFrame(paintCanvas);
  }

  function startCanvas() {
    if (!canvas || !canvas.getContext) return;
    canvasContext = canvas.getContext('2d');
    if (!canvasContext) return;
    setCanvasSize();
    if (!reducedMotion.matches) animationFrame = requestAnimationFrame(paintCanvas);
    window.addEventListener('resize', () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      setCanvasSize();
      if (!reducedMotion.matches) animationFrame = requestAnimationFrame(paintCanvas);
    }, { passive: true });
    if (reducedMotion.addEventListener) reducedMotion.addEventListener('change', () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      setCanvasSize();
      if (!reducedMotion.matches) animationFrame = requestAnimationFrame(paintCanvas);
    });
  }

  function setupPointer() {
    if (coarsePointer.matches) return;
    window.addEventListener('pointermove', (event) => {
      cursorAura.style.left = `${event.clientX}px`;
      cursorAura.style.top = `${event.clientY}px`;
      cursorAura.style.opacity = '.68';
      pointer = { x: event.clientX, y: event.clientY, active: true };
    }, { passive: true });
    document.addEventListener('pointerleave', () => {
      cursorAura.style.opacity = '0';
      pointer.active = false;
    });
  }

  themeButton.addEventListener('click', () => setTheme(document.body.dataset.theme === 'dark' ? 'light' : 'dark'));
  languageButton.addEventListener('click', () => setLanguage(activeLang === 'en' ? 'hi' : 'en'));
  logoutButton.addEventListener('click', signOut);
  window.addEventListener('scroll', updateScroll, { passive: true });
  window.addEventListener('resize', updateScroll, { passive: true });

  try { setTheme(localStorage.getItem('void-theme-v1') || 'dark'); } catch (_) { setTheme('dark'); }
  try { setLanguage(localStorage.getItem('void-language-v1') || 'en'); } catch (_) { setLanguage('en'); }
  try { document.body.dataset.motion = localStorage.getItem('void-motion-v1') || 'balanced'; } catch (_) { document.body.dataset.motion = 'balanced'; }
  startCanvas();
  setupPointer();
  setupTilt();
  updateScroll();
  bootWorkspace();
})();
