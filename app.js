(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const card = $('#authCard');
  const scene = $('#cardScene');
  const loginForm = $('#loginForm');
  const signupForm = $('#signupForm');
  const loginMessage = $('#loginMessage');
  const signupMessage = $('#signupMessage');
  const toast = $('#toast');
  const toastText = $('#toastText');
  const successOverlay = $('#successOverlay');
  const languageSelect = $('#languageSelect');
  const themeToggle = $('#themeToggle');
  let toastTimer;
  let currentLanguage = 'en';

  const copy = {
    en: {
      securePortal: 'PERSONAL ACCESS PORTAL', privateSpace: 'PRIVATE SPACE', authGateway: 'AUTHENTICATION GATEWAY', systemReady: 'SYSTEM READY',
      welcomeBack: 'WELCOME BACK', signIn: 'Sign in', enterCredentials: 'Enter your credentials to continue.', userId: 'USER ID', enterId: 'Enter your ID', password: 'PASSWORD', forgotPassword: 'Forgot?', enterPassword: 'Enter your password',
      signInButton: 'Sign in', demoAccess: 'DEMO ACCESS', idLabel: 'ID', passLabel: 'PASS', noAccount: 'New around here?', createAccount: 'Create an account', encryptedSession: 'PRIVATE SESSION',
      newIdentity: 'NEW IDENTITY', createSecureProfile: 'CREATE YOUR SECURE PROFILE', registrationReady: 'REGISTRATION READY', membershipSetup: 'MEMBERSHIP SETUP', createAccountTitle: 'Create account', startYourSpace: 'Set up your personal access.', chooseId: 'CHOOSE A USER ID', createId: 'Create a unique ID', createPassword: 'CREATE PASSWORD', minPassword: 'At least 6 characters', confirmPassword: 'CONFIRM PASSWORD', repeatPassword: 'Repeat your password', createAccountButton: 'Create account', alreadyRegistered: 'Already registered?', returnToSignIn: 'Return to sign in', localDemoProfile: 'LOCAL DEMO PROFILE', allSystemsNominal: 'ALL SYSTEMS NOMINAL', madeForYou: 'A SPACE OF YOUR OWN',
      identityVerified: 'IDENTITY VERIFIED', accessGranted: 'Access granted', interiorComingNext: 'Your sign-in worked. Your personal home interface is the next stage.', backToPortal: 'Back to portal',
      emptyLogin: 'Enter both your ID and password.', invalidLogin: 'That ID or password does not match. Try the demo credentials below.', loginOk: 'Access verified. Opening your next step…',
      emptySignup: 'Fill in all three fields to continue.', shortId: 'Your ID must be at least 3 characters.', shortPassword: 'Use a password with at least 6 characters.', passwordMismatch: 'Those passwords do not match.', duplicateId: 'That ID is already in use. Choose another.', signupOk: 'Account created. You can now sign in.', copied: 'Demo credentials filled in.', forgotInfo: 'This demo has no password reset service. Use the demo credentials or create a new account.',
      themeToLight: 'Switch to light theme', themeToDark: 'Switch to dark theme', showPassword: 'Show password', hidePassword: 'Hide password', copyDemo: 'Demo credentials filled in', modalClose: 'Back to portal'
    },
    hi: {
      securePortal: 'आपका निजी एक्सेस पोर्टल', privateSpace: 'निजी स्पेस', authGateway: 'प्रमाणीकरण गेटवे', systemReady: 'सिस्टम तैयार',
      welcomeBack: 'वापसी पर स्वागत है', signIn: 'साइन इन करें', enterCredentials: 'जारी रखने के लिए अपनी जानकारी दर्ज करें।', userId: 'यूज़र आईडी', enterId: 'अपनी आईडी दर्ज करें', password: 'पासवर्ड', forgotPassword: 'भूल गए?', enterPassword: 'अपना पासवर्ड दर्ज करें',
      signInButton: 'साइन इन करें', demoAccess: 'डेमो एक्सेस', idLabel: 'आईडी', passLabel: 'पास', noAccount: 'यहाँ नए हैं?', createAccount: 'अकाउंट बनाएँ', encryptedSession: 'निजी सेशन',
      newIdentity: 'नई पहचान', createSecureProfile: 'अपनी प्रोफ़ाइल बनाएँ', registrationReady: 'रजिस्ट्रेशन तैयार', membershipSetup: 'अकाउंट सेटअप', createAccountTitle: 'अकाउंट बनाएँ', startYourSpace: 'अपना निजी एक्सेस सेट करें।', chooseId: 'यूज़र आईडी चुनें', createId: 'एक यूनिक आईडी बनाएँ', createPassword: 'पासवर्ड बनाएँ', minPassword: 'कम से कम 6 अक्षर', confirmPassword: 'पासवर्ड की पुष्टि करें', repeatPassword: 'पासवर्ड दोबारा दर्ज करें', createAccountButton: 'अकाउंट बनाएँ', alreadyRegistered: 'पहले से अकाउंट है?', returnToSignIn: 'साइन इन पर लौटें', localDemoProfile: 'लोकल डेमो प्रोफ़ाइल', allSystemsNominal: 'सभी सिस्टम सामान्य हैं', madeForYou: 'आपकी अपनी जगह',
      identityVerified: 'पहचान सत्यापित', accessGranted: 'एक्सेस मिल गया', interiorComingNext: 'साइन इन सफल रहा। आपका निजी होम इंटरफ़ेस अगला चरण है।', backToPortal: 'पोर्टल पर लौटें',
      emptyLogin: 'अपनी आईडी और पासवर्ड दोनों दर्ज करें।', invalidLogin: 'आईडी या पासवर्ड सही नहीं है। नीचे दिए डेमो लॉगिन का उपयोग करें।', loginOk: 'एक्सेस सत्यापित। अगला चरण खुल रहा है…',
      emptySignup: 'जारी रखने के लिए तीनों फ़ील्ड भरें।', shortId: 'आईडी कम से कम 3 अक्षरों की होनी चाहिए।', shortPassword: 'कम से कम 6 अक्षरों का पासवर्ड रखें।', passwordMismatch: 'दोनों पासवर्ड मेल नहीं खाते।', duplicateId: 'यह आईडी पहले से उपयोग में है। दूसरी आईडी चुनें।', signupOk: 'अकाउंट बन गया। अब आप साइन इन कर सकते हैं।', copied: 'डेमो लॉगिन जानकारी भर दी गई है।', forgotInfo: 'इस डेमो में पासवर्ड रीसेट सुविधा नहीं है। डेमो लॉगिन करें या नया अकाउंट बनाएँ।',
      themeToLight: 'लाइट थीम पर जाएँ', themeToDark: 'डार्क थीम पर जाएँ', showPassword: 'पासवर्ड दिखाएँ', hidePassword: 'पासवर्ड छिपाएँ', copyDemo: 'डेमो लॉगिन जानकारी भर दी गई है', modalClose: 'पोर्टल पर लौटें'
    }
  };

  const DEMO = { id: 'DEMO-001', password: 'Void@2026' };
  const STORAGE_USERS = 'void-demo-users-v1';
  const STORAGE_THEME = 'void-theme-v1';
  const STORAGE_LANG = 'void-language-v1';

  function t(key) { return copy[currentLanguage][key] || copy.en[key] || key; }

  function setLanguage(language) {
    currentLanguage = language === 'hi' ? 'hi' : 'en';
    document.documentElement.lang = currentLanguage;
    languageSelect.value = currentLanguage;
    document.querySelectorAll('[data-i18n]').forEach((element) => {
      const key = element.dataset.i18n;
      if (copy[currentLanguage][key]) element.textContent = copy[currentLanguage][key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
      const key = element.dataset.i18nPlaceholder;
      if (copy[currentLanguage][key]) element.placeholder = copy[currentLanguage][key];
    });
    $('#forgotButton').setAttribute('aria-label', t('forgotPassword'));
    themeToggle.setAttribute('aria-label', document.body.dataset.theme === 'dark' ? t('themeToLight') : t('themeToDark'));
    $$('.eye-button').forEach(button => button.setAttribute('aria-label', $( '#' + button.dataset.target).type === 'password' ? t('showPassword') : t('hidePassword')));
    try { localStorage.setItem(STORAGE_LANG, currentLanguage); } catch (_) { /* local storage can be disabled */ }
  }

  function setTheme(theme) {
    const next = theme === 'light' ? 'light' : 'dark';
    document.body.dataset.theme = next;
    themeToggle.setAttribute('aria-label', next === 'dark' ? t('themeToLight') : t('themeToDark'));
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', next === 'dark' ? '#09070f' : '#f4f0fb');
    try { localStorage.setItem(STORAGE_THEME, next); } catch (_) { /* local storage can be disabled */ }
  }

  function showToast(message) {
    toastText.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2700);
  }

  function setMessage(element, message, success = false) {
    element.textContent = message;
    element.classList.toggle('success', Boolean(success));
  }

  function setFlipped(isSignup) {
    card.classList.toggle('is-flipped', isSignup);
    $('.auth-front').setAttribute('aria-hidden', isSignup ? 'true' : 'false');
    $('.auth-back').setAttribute('aria-hidden', isSignup ? 'false' : 'true');
    scene.setAttribute('aria-label', isSignup ? 'Create account' : 'Sign in');
    window.setTimeout(() => {
      const target = isSignup ? $('#signupId') : $('#loginId');
      if (target) target.focus({ preventScroll: true });
    }, 450);
    setMessage(loginMessage, '');
    setMessage(signupMessage, '');
  }

  function getUsers() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_USERS) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) { return []; }
  }

  function saveUsers(users) {
    try {
      localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
      return true;
    } catch (_) { return false; }
  }

  function showSuccess() {
    successOverlay.classList.add('show');
    successOverlay.setAttribute('aria-hidden', 'false');
    setTimeout(() => $('#closeSuccess').focus(), 100);
  }

  function closeSuccess() {
    successOverlay.classList.remove('show');
    successOverlay.setAttribute('aria-hidden', 'true');
  }

  $$('.flip-link, [data-flip]').forEach(button => button.addEventListener('click', () => {
    setFlipped(button.dataset.flip === 'signup');
  }));

  $$('.eye-button').forEach(button => button.addEventListener('click', () => {
    const input = $('#' + button.dataset.target);
    input.type = input.type === 'password' ? 'text' : 'password';
    button.setAttribute('aria-label', input.type === 'password' ? t('showPassword') : t('hidePassword'));
  }));

  $('#copyDemo').addEventListener('click', () => {
    $('#loginId').value = DEMO.id;
    $('#loginPassword').value = DEMO.password;
    setMessage(loginMessage, '');
    $('#loginId').focus();
    showToast(t('copied'));
  });

  $('#forgotButton').addEventListener('click', () => showToast(t('forgotInfo')));

  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const id = $('#loginId').value.trim();
    const password = $('#loginPassword').value;
    if (!id || !password) return setMessage(loginMessage, t('emptyLogin'));
    const demoMatch = id.toLowerCase() === DEMO.id.toLowerCase() && password === DEMO.password;
    const userMatch = getUsers().some(user => user.id.toLowerCase() === id.toLowerCase() && user.password === password);
    if (!demoMatch && !userMatch) return setMessage(loginMessage, t('invalidLogin'));
    setMessage(loginMessage, t('loginOk'), true);
    setTimeout(showSuccess, 250);
  });

  signupForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const id = $('#signupId').value.trim();
    const password = $('#signupPassword').value;
    const confirm = $('#signupConfirm').value;
    if (!id || !password || !confirm) return setMessage(signupMessage, t('emptySignup'));
    if (id.length < 3) return setMessage(signupMessage, t('shortId'));
    if (password.length < 6) return setMessage(signupMessage, t('shortPassword'));
    if (password !== confirm) return setMessage(signupMessage, t('passwordMismatch'));
    if (id.toLowerCase() === DEMO.id.toLowerCase() || getUsers().some(user => user.id.toLowerCase() === id.toLowerCase())) return setMessage(signupMessage, t('duplicateId'));
    const users = getUsers();
    users.push({ id, password, createdAt: new Date().toISOString() });
    if (!saveUsers(users)) return setMessage(signupMessage, currentLanguage === 'hi' ? 'ब्राउज़र स्टोरेज उपलब्ध नहीं है। इस डेमो के लिए स्टोरेज चालू करें।' : 'Browser storage is unavailable. Enable storage to use demo sign-up.');
    signupForm.reset();
    setFlipped(false);
    $('#loginId').value = id;
    setMessage(loginMessage, t('signupOk'), true);
    showToast(t('signupOk'));
  });

  themeToggle.addEventListener('click', () => setTheme(document.body.dataset.theme === 'dark' ? 'light' : 'dark'));
  languageSelect.addEventListener('change', () => setLanguage(languageSelect.value));
  $('#closeSuccess').addEventListener('click', closeSuccess);
  successOverlay.addEventListener('click', (event) => { if (event.target === successOverlay) closeSuccess(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && successOverlay.classList.contains('show')) closeSuccess(); });

  function createParticles() {
    const container = $('#particles');
    const count = window.matchMedia('(max-width: 620px)').matches ? 13 : 24;
    for (let i = 0; i < count; i += 1) {
      const particle = document.createElement('span');
      particle.className = 'particle';
      particle.style.setProperty('--x', `${Math.random() * 100}%`);
      particle.style.setProperty('--delay', `${-(Math.random() * 22)}s`);
      particle.style.setProperty('--duration', `${15 + Math.random() * 19}s`);
      particle.style.setProperty('--drift', `${Math.round((Math.random() - .5) * 150)}px`);
      particle.style.width = particle.style.height = `${1 + Math.random() * 2}px`;
      container.appendChild(particle);
    }
  }

  try {
    setTheme(localStorage.getItem(STORAGE_THEME) || 'dark');
    setLanguage(localStorage.getItem(STORAGE_LANG) || 'en');
  } catch (_) {
    setTheme('dark');
    setLanguage('en');
  }
  createParticles();
})();
