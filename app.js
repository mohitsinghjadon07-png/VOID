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
  const resetOverlay = $('#resetOverlay');
  const resetPasswordForm = $('#resetPasswordForm');
  const resetMessage = $('#resetMessage');
  const languageSelect = $('#languageSelect');
  const themeToggle = $('#themeToggle');
  const settingsToggle = $('#settingsToggle');
  const settingsPanel = $('#settingsPanel');
  const settingsClose = $('#settingsClose');
  const motionIntensity = $('#motionIntensity');
  const soundToggle = $('#soundToggle');
  const reducedMotionToggle = $('#reducedMotionToggle');
  const signupPasswordInput = $('#signupPassword');
  const strengthLabel = $('#strengthLabel');
  const strengthScore = $('#strengthScore');
  const strengthFill = $('#strengthFill');
  let toastTimer;
  let currentLanguage = 'en';
  let soundEnabled = false;
  let reducedMotionEnabled = false;
  let motionLevel = 'balanced';
  let verifying = false;
  let audioContext = null;
  let enteringDashboard = false;
  let dashboardRedirectTimer = null;

  const copy = {
    en: {
      securePortal: 'PERSONAL ACCESS PORTAL', privateSpace: 'PRIVATE SPACE', authGateway: 'AUTHENTICATION GATEWAY', systemReady: 'SYSTEM READY',
      welcomeBack: 'WELCOME BACK', signIn: 'Sign in', enterCredentials: 'Enter your credentials to continue.', userId: 'USER ID', enterId: 'Enter your ID', emailAddress: 'EMAIL ADDRESS', enterEmail: 'Enter an email you can access', cloudAuth: 'CLOUD AUTHENTICATION', cloudLineOne: 'YOUR ID + PASSWORD', cloudLineTwo: 'SYNCED ACROSS DEVICES', password: 'PASSWORD', forgotPassword: 'Forgot?', enterPassword: 'Enter your password',
      signInButton: 'Sign in', demoAccess: 'DEMO ACCESS', idLabel: 'ID', passLabel: 'PASS', noAccount: 'New around here?', createAccount: 'Create an account', encryptedSession: 'PRIVATE SESSION',
      newIdentity: 'NEW IDENTITY', createSecureProfile: 'CREATE YOUR SECURE PROFILE', registrationReady: 'REGISTRATION READY', membershipSetup: 'MEMBERSHIP SETUP', createAccountTitle: 'Create account', startYourSpace: 'Set up your personal access.', chooseId: 'CHOOSE A USER ID', createId: '3–32 letters, numbers, _ or -', invalidUsername: 'Use 3–32 letters, numbers, underscores or hyphens for your ID.', emailRequired: 'Enter a valid email address you can access.', passwordRecovery: 'ACCOUNT RECOVERY', chooseNewPassword: 'Choose a new password', resetIntro: 'Set a new password for your VOID account.', newPassword: 'NEW PASSWORD', confirmNewPassword: 'CONFIRM NEW PASSWORD', saveNewPassword: 'Save new password', enterIdForReset: 'Enter your account ID first, then select Forgot.', resetSent: 'If that ID is registered, recovery instructions have been sent to its email address.', resetError: 'Could not start recovery. Check the setup and try again.', resetShort: 'Use at least 8 characters for the new password.', resetMismatch: 'The new passwords do not match.', resetSaved: 'Your password has been updated. Please sign in again.', cloudNotConfigured: 'Cloud authentication is not configured yet. Follow the setup guide in the ZIP.', createPassword: 'CREATE PASSWORD', minPassword: 'At least 8 characters', confirmPassword: 'CONFIRM PASSWORD', repeatPassword: 'Repeat your password', createAccountButton: 'Create account', alreadyRegistered: 'Already registered?', returnToSignIn: 'Return to sign in', localDemoProfile: 'CLOUD ACCOUNT PROFILE', allSystemsNominal: 'ALL SYSTEMS NOMINAL', madeForYou: 'A SPACE OF YOUR OWN',
      identityVerified: 'IDENTITY VERIFIED', accessGranted: 'Access granted', interiorComingNext: 'Your sign-in worked. Your personal home interface is the next stage.', backToPortal: 'Back to portal',
      emptyLogin: 'Enter both your ID and password.', invalidLogin: 'That ID or password does not match. Check your ID, password, and email confirmation.', loginOk: 'Access verified. Opening your next step…',
      emptySignup: 'Fill in every field to continue.', shortId: 'Your ID must be at least 3 characters.', shortPassword: 'Use a password with at least 8 characters.', passwordMismatch: 'Those passwords do not match.', duplicateId: 'That ID is already in use. Choose another.', signupOk: 'Account created. You can now sign in with your ID and password.', checkEmail: 'Account created. Check your email and confirm the address before signing in.', copied: 'Demo credentials filled in.', forgotInfo: 'This demo has no password reset service. Use the demo credentials or create a new account.',
      themeToLight: 'Switch to light theme', themeToDark: 'Switch to dark theme', showPassword: 'Show password', hidePassword: 'Hide password', copyDemo: 'Demo credentials filled in', modalClose: 'Back to portal',
      customizeVoid: 'PERSONALIZE VOID', settingsTitle: 'Interface settings', animationIntensity: 'Animation intensity', animationHint: 'Tune the movement around the portal.', calm: 'Calm', balanced: 'Balanced', immersive: 'Immersive', interfaceSound: 'Interface sounds', soundHint: 'Subtle click, flip, and access sounds.', reducedMotion: 'Reduced motion', reducedMotionHint: 'Keep movement minimal and comfortable.', settingsSavedLocally: 'Preferences stay on this browser.', strengthEmpty: 'Password strength', strengthWeak: 'Weak password', strengthFair: 'Fair password', strengthGood: 'Good password', strengthStrong: 'Strong password', strengthLength: '8+ characters', strengthMixed: 'Mixed case', strengthNumber: 'Number', strengthSymbol: 'Symbol', yourVoidIdentity: 'YOUR VOID IDENTITY', lastAccess: 'LAST ACCESS', verifiedStatus: 'VERIFIED', closeSettings: 'Close settings', verifying: 'VERIFYING ACCESS…'
    },
    hi: {
      securePortal: 'आपका निजी एक्सेस पोर्टल', privateSpace: 'निजी स्पेस', authGateway: 'प्रमाणीकरण गेटवे', systemReady: 'सिस्टम तैयार',
      welcomeBack: 'वापसी पर स्वागत है', signIn: 'साइन इन करें', enterCredentials: 'जारी रखने के लिए अपनी जानकारी दर्ज करें।', userId: 'यूज़र आईडी', enterId: 'अपनी आईडी दर्ज करें', emailAddress: 'ईमेल पता', enterEmail: 'ऐसा ईमेल दर्ज करें जिसे आप खोल सकते हैं', cloudAuth: 'क्लाउड प्रमाणीकरण', cloudLineOne: 'आपकी आईडी + पासवर्ड', cloudLineTwo: 'सभी डिवाइस पर सिंक', password: 'पासवर्ड', forgotPassword: 'भूल गए?', enterPassword: 'अपना पासवर्ड दर्ज करें',
      signInButton: 'साइन इन करें', demoAccess: 'डेमो एक्सेस', idLabel: 'आईडी', passLabel: 'पास', noAccount: 'यहाँ नए हैं?', createAccount: 'अकाउंट बनाएँ', encryptedSession: 'निजी सेशन',
      newIdentity: 'नई पहचान', createSecureProfile: 'अपनी प्रोफ़ाइल बनाएँ', registrationReady: 'रजिस्ट्रेशन तैयार', membershipSetup: 'अकाउंट सेटअप', createAccountTitle: 'अकाउंट बनाएँ', startYourSpace: 'अपना निजी एक्सेस सेट करें।', chooseId: 'यूज़र आईडी चुनें', createId: '3–32 अक्षर, नंबर, _ या -', invalidUsername: 'आईडी में 3–32 अक्षर, नंबर, अंडरस्कोर या हाइफ़न रखें।', emailRequired: 'ऐसा सही ईमेल दर्ज करें जिसे आप खोल सकते हैं।', passwordRecovery: 'अकाउंट रिकवरी', chooseNewPassword: 'नया पासवर्ड चुनें', resetIntro: 'अपने VOID अकाउंट के लिए नया पासवर्ड सेट करें।', newPassword: 'नया पासवर्ड', confirmNewPassword: 'नए पासवर्ड की पुष्टि करें', saveNewPassword: 'नया पासवर्ड सेव करें', enterIdForReset: 'पहले अपनी अकाउंट आईडी दर्ज करें, फिर Forgot चुनें।', resetSent: 'यदि यह आईडी पंजीकृत है, तो उसके ईमेल पर रिकवरी निर्देश भेज दिए गए हैं।', resetError: 'रिकवरी शुरू नहीं हो सकी। सेटअप जाँचकर दोबारा प्रयास करें।', resetShort: 'नए पासवर्ड में कम से कम 8 अक्षर रखें।', resetMismatch: 'नए पासवर्ड मेल नहीं खाते।', resetSaved: 'पासवर्ड अपडेट हो गया। कृपया फिर से साइन इन करें।', cloudNotConfigured: 'क्लाउड प्रमाणीकरण अभी सेट नहीं है। ZIP की सेटअप गाइड देखें।', createPassword: 'पासवर्ड बनाएँ', minPassword: 'कम से कम 8 अक्षर', confirmPassword: 'पासवर्ड की पुष्टि करें', repeatPassword: 'पासवर्ड दोबारा दर्ज करें', createAccountButton: 'अकाउंट बनाएँ', alreadyRegistered: 'पहले से अकाउंट है?', returnToSignIn: 'साइन इन पर लौटें', localDemoProfile: 'क्लाउड अकाउंट प्रोफ़ाइल', allSystemsNominal: 'सभी सिस्टम सामान्य हैं', madeForYou: 'आपकी अपनी जगह',
      identityVerified: 'पहचान सत्यापित', accessGranted: 'एक्सेस मिल गया', interiorComingNext: 'साइन इन सफल रहा। आपका निजी होम इंटरफ़ेस अगला चरण है।', backToPortal: 'पोर्टल पर लौटें',
      emptyLogin: 'अपनी आईडी और पासवर्ड दोनों दर्ज करें।', invalidLogin: 'आईडी या पासवर्ड सही नहीं है। आईडी, पासवर्ड और ईमेल पुष्टि जाँचें।', loginOk: 'एक्सेस सत्यापित। अगला चरण खुल रहा है…',
      emptySignup: 'जारी रखने के लिए सभी फ़ील्ड भरें।', shortId: 'आईडी कम से कम 3 अक्षरों की होनी चाहिए।', shortPassword: 'कम से कम 8 अक्षरों का पासवर्ड रखें।', passwordMismatch: 'दोनों पासवर्ड मेल नहीं खाते।', duplicateId: 'यह आईडी पहले से उपयोग में है। दूसरी आईडी चुनें।', signupOk: 'अकाउंट बन गया। अब आईडी और पासवर्ड से साइन इन करें।', checkEmail: 'अकाउंट बन गया। साइन इन से पहले अपना ईमेल खोलकर पुष्टि करें।', copied: 'डेमो लॉगिन जानकारी भर दी गई है।', forgotInfo: 'इस डेमो में पासवर्ड रीसेट सुविधा नहीं है। डेमो लॉगिन करें या नया अकाउंट बनाएँ।',
      themeToLight: 'लाइट थीम पर जाएँ', themeToDark: 'डार्क थीम पर जाएँ', showPassword: 'पासवर्ड दिखाएँ', hidePassword: 'पासवर्ड छिपाएँ', copyDemo: 'डेमो लॉगिन जानकारी भर दी गई है', modalClose: 'पोर्टल पर लौटें',
      customizeVoid: 'VOID को अपने अनुसार बनाएँ', settingsTitle: 'इंटरफ़ेस सेटिंग्स', animationIntensity: 'एनिमेशन की तीव्रता', animationHint: 'पोर्टल के आसपास की मूवमेंट बदलें।', calm: 'शांत', balanced: 'संतुलित', immersive: 'इमर्सिव', interfaceSound: 'इंटरफ़ेस साउंड', soundHint: 'क्लिक, फ्लिप और एक्सेस की हल्की आवाज़ें।', reducedMotion: 'कम एनिमेशन', reducedMotionHint: 'मूवमेंट को सीमित और सहज रखें।', settingsSavedLocally: 'सेटिंग्स इसी ब्राउज़र में सेव रहेंगी।', strengthEmpty: 'पासवर्ड की मज़बूती', strengthWeak: 'कमज़ोर पासवर्ड', strengthFair: 'ठीक-ठाक पासवर्ड', strengthGood: 'अच्छा पासवर्ड', strengthStrong: 'मज़बूत पासवर्ड', strengthLength: '8+ अक्षर', strengthMixed: 'बड़े और छोटे अक्षर', strengthNumber: 'नंबर', strengthSymbol: 'सिंबल', yourVoidIdentity: 'आपकी VOID पहचान', lastAccess: 'पिछला एक्सेस', verifiedStatus: 'सत्यापित', closeSettings: 'सेटिंग्स बंद करें', verifying: 'एक्सेस सत्यापित हो रहा है…'
    }
  };

  const cloudConfig = window.VOID_CONFIG || {};
  const cloudConfigured = Boolean(cloudConfig.supabaseUrl && cloudConfig.supabasePublishableKey && !cloudConfig.supabaseUrl.includes('PASTE_') && !cloudConfig.supabasePublishableKey.includes('PASTE_') && window.supabase && typeof window.supabase.createClient === 'function');
  const supabaseClient = cloudConfigured ? window.supabase.createClient(cloudConfig.supabaseUrl, cloudConfig.supabasePublishableKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }) : null;
  if (supabaseClient) {
    supabaseClient.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        resetOverlay.classList.add('show');
        resetOverlay.setAttribute('aria-hidden', 'false');
        setTimeout(() => $('#resetPassword').focus(), 100);
      }
    });

    // A returning user with a saved cloud session goes straight to the workspace.
    // Password recovery stays on this page so its reset form can open.
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const recoveryFlow = urlParams.has('reset') || hashParams.get('type') === 'recovery';
    if (!recoveryFlow) {
      supabaseClient.auth.getSession().then(({ data }) => {
        if (data && data.session && !window.location.pathname.endsWith('/dashboard.html')) {
          window.location.replace(new URL('dashboard.html', window.location.href).href);
        }
      }).catch(() => { /* Keep the portal available if session lookup fails. */ });
    }
  }

  const STORAGE_THEME = 'void-theme-v1';
  const STORAGE_LANG = 'void-language-v1';
  const STORAGE_MOTION = 'void-motion-v1';
  const STORAGE_SOUND = 'void-sound-v1';
  const STORAGE_REDUCED = 'void-reduced-motion-v1';

  function t(key) { return copy[currentLanguage][key] || copy.en[key] || key; }

  function setLanguage(language) {
    currentLanguage = language === 'hi' ? 'hi' : 'en';
    document.documentElement.lang = currentLanguage;
    languageSelect.value = currentLanguage;
    document.querySelectorAll('[data-i18n]').forEach((element) => {
      const key = element.dataset.i18n;
      if (copy[currentLanguage][key]) {
        const accent = element.querySelector('.accent-period');
        if (accent && element.firstChild && element.firstChild.nodeType === Node.TEXT_NODE) element.firstChild.nodeValue = copy[currentLanguage][key];
        else element.textContent = copy[currentLanguage][key];
      }
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
      const key = element.dataset.i18nPlaceholder;
      if (copy[currentLanguage][key]) element.placeholder = copy[currentLanguage][key];
    });
    $('#forgotButton').setAttribute('aria-label', t('forgotPassword'));
    themeToggle.setAttribute('aria-label', document.body.dataset.theme === 'dark' ? t('themeToLight') : t('themeToDark'));
    settingsToggle.setAttribute('aria-label', currentLanguage === 'hi' ? 'इंटरफ़ेस सेटिंग्स खोलें' : 'Open interface settings');
    settingsClose.setAttribute('aria-label', t('closeSettings'));
    $$('.eye-button').forEach(button => button.setAttribute('aria-label', $( '#' + button.dataset.target).type === 'password' ? t('showPassword') : t('hidePassword')));
    try { localStorage.setItem(STORAGE_LANG, currentLanguage); } catch (_) { /* local storage can be disabled */ }
    if (signupPasswordInput) updatePasswordStrength();
  }

  function setTheme(theme) {
    const next = theme === 'light' ? 'light' : 'dark';
    document.body.dataset.theme = next;
    themeToggle.setAttribute('aria-label', next === 'dark' ? t('themeToLight') : t('themeToDark'));
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', next === 'dark' ? '#09070f' : '#f4f0fb');
    try { localStorage.setItem(STORAGE_THEME, next); } catch (_) { /* local storage can be disabled */ }
  }

  function safeStore(key, value) {
    try { localStorage.setItem(key, value); } catch (_) { /* browser storage may be unavailable */ }
  }

  function setMotion(level) {
    motionLevel = ['calm', 'balanced', 'immersive'].includes(level) ? level : 'balanced';
    document.body.dataset.motion = motionLevel;
    if (motionIntensity) motionIntensity.value = motionLevel;
    safeStore(STORAGE_MOTION, motionLevel);
    if (typeof createParticles === 'function') createParticles();
    document.dispatchEvent(new CustomEvent('void:motionchange', { detail: { level: motionLevel, reduced: reducedMotionEnabled } }));
  }

  function setReducedMotion(enabled) {
    reducedMotionEnabled = Boolean(enabled);
    document.body.dataset.reducedMotion = reducedMotionEnabled ? 'true' : 'false';
    if (reducedMotionToggle) reducedMotionToggle.checked = reducedMotionEnabled;
    safeStore(STORAGE_REDUCED, reducedMotionEnabled ? 'true' : 'false');
    document.dispatchEvent(new CustomEvent('void:motionchange', { detail: { level: motionLevel, reduced: reducedMotionEnabled } }));
  }

  function setSound(enabled) {
    soundEnabled = Boolean(enabled);
    if (soundToggle) soundToggle.checked = soundEnabled;
    safeStore(STORAGE_SOUND, soundEnabled ? 'true' : 'false');
    if (soundEnabled) playSound('click');
  }

  function playSound(kind = 'click') {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioContext) audioContext = new AudioCtx();
      if (audioContext.state === 'suspended') audioContext.resume();
      const now = audioContext.currentTime;
      const tones = kind === 'success' ? [660, 880] : kind === 'flip' ? [410, 560] : kind === 'verify' ? [330, 495] : [520];
      tones.forEach((frequency, index) => {
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        const start = now + index * 0.075;
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, start);
        oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.04, start + 0.06);
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.022, start + 0.018);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.13);
        oscillator.connect(gain);
        gain.connect(audioContext.destination);
        oscillator.start(start);
        oscillator.stop(start + 0.14);
      });
    } catch (_) { /* sound is an optional enhancement; fail silently */ }
  }

  function closeSettings() {
    settingsPanel.hidden = true;
    settingsToggle.setAttribute('aria-expanded', 'false');
  }

  function toggleSettings() {
    const willOpen = settingsPanel.hidden;
    settingsPanel.hidden = !willOpen;
    settingsToggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    if (willOpen) settingsClose.focus();
    playSound('click');
  }

  function updatePasswordStrength() {
    const password = signupPasswordInput.value;
    const checks = {
      length: password.length >= 8,
      mixed: /[a-z]/.test(password) && /[A-Z]/.test(password),
      number: /\d/.test(password),
      symbol: /[^A-Za-z0-9]/.test(password)
    };
    const score = Object.values(checks).filter(Boolean).length;
    Object.entries(checks).forEach(([key, passed]) => {
      const rule = $(`[data-rule="${key}"]`);
      if (rule) rule.classList.toggle('passed', passed);
    });
    strengthScore.textContent = `${score} / 4`;
    strengthFill.style.width = `${(score / 4) * 100}%`;
    strengthFill.dataset.score = String(score);
    const labelKey = !password ? 'strengthEmpty' : score <= 1 ? 'strengthWeak' : score === 2 ? 'strengthFair' : score === 3 ? 'strengthGood' : 'strengthStrong';
    strengthLabel.textContent = t(labelKey);
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
    $('.auth-front').inert = Boolean(isSignup);
    $('.auth-back').inert = !isSignup;
    scene.setAttribute('aria-label', isSignup ? 'Create account' : 'Sign in');
    window.setTimeout(() => {
      const target = isSignup ? $('#signupId') : $('#loginId');
      if (target) target.focus({ preventScroll: true });
    }, 450);
    setMessage(loginMessage, '');
    setMessage(signupMessage, '');
  }

  function showSuccess(profile = {}) {
    const id = profile.id || 'VOID USER';
    const initials = id.replace(/[^a-z0-9]/gi, '').slice(0, 2).toUpperCase() || 'VO';
    $('#profileAvatar').textContent = initials;
    $('#profileId').textContent = id;
    const time = new Date(profile.lastLoginAt || Date.now());
    $('#profileLastAccess').textContent = time.toLocaleString(currentLanguage === 'hi' ? 'hi-IN' : 'en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    successOverlay.classList.add('show');
    successOverlay.setAttribute('aria-hidden', 'false');
    playSound('success');
    setTimeout(() => $('#closeSuccess').focus(), 100);
  }

  function closeSuccess() {
    if (enteringDashboard) {
      if (dashboardRedirectTimer) window.clearTimeout(dashboardRedirectTimer);
      window.location.assign(new URL('dashboard.html', window.location.href).href);
      return;
    }
    successOverlay.classList.remove('show');
    successOverlay.setAttribute('aria-hidden', 'true');
  }

  $$('.flip-link, [data-flip]').forEach(button => button.addEventListener('click', () => {
    playSound('flip');
    setFlipped(button.dataset.flip === 'signup');
  }));

  $$('.eye-button').forEach(button => button.addEventListener('click', () => {
    const input = $('#' + button.dataset.target);
    input.type = input.type === 'password' ? 'text' : 'password';
    button.setAttribute('aria-label', input.type === 'password' ? t('showPassword') : t('hidePassword'));
  }));


  $('#forgotButton').addEventListener('click', async () => {
    const username = $('#loginId').value.trim();
    if (!username) return setMessage(loginMessage, t('enterIdForReset'));
    if (!supabaseClient) return setMessage(loginMessage, t('cloudNotConfigured'));
    setMessage(loginMessage, currentLanguage === 'hi' ? 'रिकवरी अनुरोध भेजा जा रहा है…' : 'Sending recovery request…', true);
    const redirectTo = `${window.location.origin}${window.location.pathname}?reset=1`;
    try {
      const { error } = await supabaseClient.functions.invoke('void-login', { body: { action: 'reset', username, redirectTo } });
      if (error) return setMessage(loginMessage, t('resetError'));
      setMessage(loginMessage, t('resetSent'), true);
    } catch (_) {
      setMessage(loginMessage, t('resetError'));
    }
  });

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (verifying) return;
    const id = $('#loginId').value.trim();
    const password = $('#loginPassword').value;
    if (!id || !password) return setMessage(loginMessage, t('emptyLogin'));
    if (!supabaseClient) return setMessage(loginMessage, t('cloudNotConfigured'));

    verifying = true;
    const submitButton = loginForm.querySelector('.primary-button');
    submitButton.disabled = true;
    submitButton.classList.add('is-loading');
    scene.classList.add('is-verifying');
    card.classList.add('is-verifying');
    setMessage(loginMessage, t('verifying'), true);
    playSound('verify');

    try {
      const { data, error } = await supabaseClient.functions.invoke('void-login', {
        body: { action: 'login', username: id, password }
      });
      if (error || !data || !data.session) {
        setMessage(loginMessage, t('invalidLogin'));
        return;
      }
      const { error: sessionError } = await supabaseClient.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token
      });
      if (sessionError) {
        setMessage(loginMessage, currentLanguage === 'hi' ? 'सेशन सेव नहीं हो सका। दोबारा प्रयास करें।' : 'Could not save the session. Please try again.');
        return;
      }
      const profileId = data.user?.user_metadata?.username || id;
      const lastLoginAt = new Date().toISOString();
      window.setTimeout(() => {
        enteringDashboard = true;
        $('#successDescription').textContent = currentLanguage === 'hi'
          ? 'पहचान सत्यापित। आपका वर्कस्पेस खुल रहा है…'
          : 'Identity verified. Your workspace is opening…';
        showSuccess({ id: profileId, lastLoginAt });
        dashboardRedirectTimer = window.setTimeout(() => {
          window.location.assign(new URL('dashboard.html', window.location.href).href);
        }, reducedMotionEnabled ? 160 : 1150);
      }, reducedMotionEnabled ? 130 : 460);
    } catch (_) {
      setMessage(loginMessage, currentLanguage === 'hi' ? 'कनेक्शन उपलब्ध नहीं है। इंटरनेट और Supabase सेटअप जाँचें।' : 'Connection unavailable. Check your internet and Supabase setup.');
    } finally {
      scene.classList.remove('is-verifying');
      card.classList.remove('is-verifying');
      submitButton.disabled = false;
      submitButton.classList.remove('is-loading');
      verifying = false;
    }
  });

  signupForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (verifying) return;
    const id = $('#signupId').value.trim();
    const email = $('#signupEmail').value.trim();
    const password = $('#signupPassword').value;
    const confirm = $('#signupConfirm').value;
    if (!id || !email || !password || !confirm) return setMessage(signupMessage, t('emptySignup'));
    if (!/^[A-Za-z0-9_-]{3,32}$/.test(id)) return setMessage(signupMessage, t('invalidUsername'));
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setMessage(signupMessage, t('emailRequired'));
    if (password.length < 8) return setMessage(signupMessage, t('shortPassword'));
    if (password !== confirm) return setMessage(signupMessage, t('passwordMismatch'));
    if (!supabaseClient) return setMessage(signupMessage, t('cloudNotConfigured'));

    verifying = true;
    const submitButton = signupForm.querySelector('.primary-button');
    submitButton.disabled = true;
    submitButton.classList.add('is-loading');
    try {
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: { username: id },
          emailRedirectTo: `${window.location.origin}${window.location.pathname}`
        }
      });
      if (error) {
        const duplicate = /VOID_USERNAME_EXISTS|void_profiles_username_ci|duplicate key|username/i.test(error.message || '');
        setMessage(signupMessage, duplicate || /database error saving new user/i.test(error.message || '')
          ? (currentLanguage === 'hi' ? 'यह यूज़र आईडी पहले से उपयोग में हो सकती है या ईमेल पहले से पंजीकृत है। दूसरी आईडी/ईमेल आज़माएँ।' : 'That user ID may already be taken, or the email is already registered. Try a different ID or email.')
          : (currentLanguage === 'hi' ? 'अकाउंट नहीं बन सका। ईमेल और Supabase सेटअप जाँचें।' : 'Account could not be created. Check the email address and Supabase setup.'));
        return;
      }
      signupForm.reset();
      updatePasswordStrength();
      setFlipped(false);
      $('#loginId').value = id;
      if (data.session) {
        setMessage(loginMessage, t('signupOk'), true);
        showToast(t('signupOk'));
      } else {
        setMessage(loginMessage, t('checkEmail'), true);
        showToast(t('checkEmail'));
      }
      playSound('success');
    } catch (_) {
      setMessage(signupMessage, currentLanguage === 'hi' ? 'कनेक्शन उपलब्ध नहीं है। इंटरनेट और Supabase सेटअप जाँचें।' : 'Connection unavailable. Check your internet and Supabase setup.');
    } finally {
      submitButton.disabled = false;
      submitButton.classList.remove('is-loading');
      verifying = false;
    }
  });

  resetPasswordForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!supabaseClient) return setMessage(resetMessage, t('cloudNotConfigured'));
    const password = $('#resetPassword').value;
    const confirm = $('#resetConfirm').value;
    if (password.length < 8) return setMessage(resetMessage, t('resetShort'));
    if (password !== confirm) return setMessage(resetMessage, t('resetMismatch'));
    const button = resetPasswordForm.querySelector('.primary-button');
    button.disabled = true;
    try {
      const { error } = await supabaseClient.auth.updateUser({ password });
      if (error) return setMessage(resetMessage, error.message || t('resetError'));
      await supabaseClient.auth.signOut();
      resetPasswordForm.reset();
      resetOverlay.classList.remove('show');
      resetOverlay.setAttribute('aria-hidden', 'true');
      history.replaceState({}, document.title, window.location.pathname);
      setMessage(loginMessage, t('resetSaved'), true);
      showToast(t('resetSaved'));
    } catch (_) {
      setMessage(resetMessage, t('resetError'));
    } finally {
      button.disabled = false;
    }
  });

  themeToggle.addEventListener('click', () => {
    setTheme(document.body.dataset.theme === 'dark' ? 'light' : 'dark');
    playSound('click');
  });
  languageSelect.addEventListener('change', () => { setLanguage(languageSelect.value); playSound('click'); });
  settingsToggle.addEventListener('click', toggleSettings);
  settingsClose.addEventListener('click', closeSettings);
  motionIntensity.addEventListener('change', () => { setMotion(motionIntensity.value); playSound('click'); });
  soundToggle.addEventListener('change', () => setSound(soundToggle.checked));
  reducedMotionToggle.addEventListener('change', () => { setReducedMotion(reducedMotionToggle.checked); playSound('click'); });
  signupPasswordInput.addEventListener('input', updatePasswordStrength);
  $('#closeSuccess').addEventListener('click', closeSuccess);
  successOverlay.addEventListener('click', (event) => { if (event.target === successOverlay) closeSuccess(); });
  document.addEventListener('click', (event) => {
    if (!settingsPanel.hidden && !settingsPanel.contains(event.target) && !settingsToggle.contains(event.target)) closeSettings();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (successOverlay.classList.contains('show')) closeSuccess();
      if (!settingsPanel.hidden) closeSettings();
    }
  });

  function createParticles() {
    const container = $('#particles');
    if (!container) return;
    container.replaceChildren();
    const small = window.matchMedia('(max-width: 620px)').matches;
    const systemReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotionEnabled || systemReduced) return;
    const baseCount = motionLevel === 'calm' ? 8 : motionLevel === 'immersive' ? 32 : 20;
    const count = small ? Math.max(7, Math.round(baseCount * .55)) : baseCount;
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
    setMotion(localStorage.getItem(STORAGE_MOTION) || 'balanced');
    soundEnabled = localStorage.getItem(STORAGE_SOUND) === 'true';
    soundToggle.checked = soundEnabled;
    const storedReduced = localStorage.getItem(STORAGE_REDUCED);
    setReducedMotion(storedReduced === null ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : storedReduced === 'true');
  } catch (_) {
    setTheme('dark');
    setLanguage('en');
    setMotion('balanced');
    soundEnabled = false;
    soundToggle.checked = false;
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }
  updatePasswordStrength();
  createParticles();
})();
