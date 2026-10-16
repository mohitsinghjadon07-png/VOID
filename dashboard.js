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
    loadOwnProfile();
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


  // ── Multi-user profile + live public GitHub projects ─────────────────────
  let ownProfile = null;
  let ownGithubBundle = null;

  function setFormStatus(element, message, kind = '') {
    if (!element) return;
    element.textContent = message || '';
    element.classList.toggle('is-error', kind === 'error');
    element.classList.toggle('is-success', kind === 'success');
  }

  function normalizedGithubInput(value) {
    let raw = String(value || '').trim();
    if (!raw) return '';
    raw = raw.replace(/^@/, '');
    try {
      if (/^https?:\/\//i.test(raw)) {
        const url = new URL(raw);
        if (url.hostname.toLowerCase() !== 'github.com' && url.hostname.toLowerCase() !== 'www.github.com') return null;
        raw = url.pathname.split('/').filter(Boolean)[0] || '';
      } else if (/^(www\.)?github\.com\//i.test(raw)) {
        raw = raw.replace(/^(www\.)?github\.com\//i, '').split('/')[0];
      }
    } catch (_) { return null; }
    if (!/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/.test(raw) || raw.includes('--')) return null;
    return raw.toLowerCase();
  }

  function safeExternalUrl(url, fallback = 'https://github.com') {
    try { const parsed = new URL(url); return parsed.protocol === 'https:' && parsed.hostname === 'github.com' ? parsed.href : fallback; }
    catch (_) { return fallback; }
  }

  function addText(parent, tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    el.textContent = text == null ? '' : String(text);
    parent.appendChild(el);
    return el;
  }

  function formatCount(value) {
    const number = Number(value || 0);
    return number >= 1000 ? `${(number / 1000).toFixed(number >= 10000 ? 0 : 1).replace(/\.0$/, '')}k` : String(number);
  }

  function formatUpdated(dateString) {
    const date = new Date(dateString || 0);
    if (!Number.isFinite(date.getTime()) || !dateString) return 'DATE UNKNOWN';
    return `UPDATED ${date.toLocaleDateString(activeLang === 'hi' ? 'hi-IN' : 'en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}`;
  }

  function linkToOwnGithub(profile) {
    const login = profile?.github_username || '';
    const link = login ? `https://github.com/${encodeURIComponent(login)}` : 'https://github.com';
    ['navGithubLink', 'heroGithubLink', 'allRepositoriesLink', 'repoArchiveLink', 'footerGithubLink', 'ownGithubProfileLink'].forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.href = link; el.target = '_blank'; el.rel = 'noopener noreferrer'; }
    });
    const share = document.getElementById('ownPublicProfileLink');
    if (share) {
      share.href = `profile.html?id=${encodeURIComponent(profile?.username || '')}`;
      share.hidden = !profile?.username || profile.public_profile_enabled === false;
    }
  }

  function updateHeroIdentity(profile) {
    const displayName = String(profile?.display_name || profile?.username || activeUser?.user_metadata?.username || 'VOID USER').trim().slice(0, 60) || 'VOID USER';
    const words = displayName.split(/\s+/).filter(Boolean);
    const first = document.querySelector('.name-first');
    const last = document.querySelector('.name-last');
    if (first && last) {
      first.replaceChildren(); last.replaceChildren();
      if (words.length > 1) {
        first.textContent = words.shift().toUpperCase();
        first.hidden = false;
        last.append(document.createTextNode(words.join(' ').toUpperCase()));
      } else {
        first.hidden = true;
        last.append(document.createTextNode((words[0] || 'VOID').toUpperCase()));
      }
      const period = document.createElement('span'); period.className = 'name-period'; period.textContent = '.'; last.appendChild(period);
      const hero = document.getElementById('heroName'); if (hero) hero.setAttribute('aria-label', displayName);
    }
    const account = document.getElementById('accountLabel'); if (account) account.textContent = String(profile?.username || displayName).toUpperCase().slice(0, 20);
    const edge = document.getElementById('heroEdgeLabel'); if (edge) edge.textContent = `${displayName.toUpperCase()} / PUBLIC INDEX`;
    const introSignature = document.getElementById('introSignature'); if (introSignature) introSignature.textContent = `— ${displayName.toUpperCase()}`;
    const introBio = document.getElementById('introBioText');
    if (introBio) introBio.textContent = profile?.bio?.trim() || 'Your projects, learning notes, and public repositories — gathered into one space that stays yours.';
    const footer = document.getElementById('footerSignature'); if (footer) footer.textContent = `A WORKSPACE BY ${displayName.toUpperCase()}`;
    document.title = `VOID / ${displayName}`;
    return displayName;
  }

  function setRepositoryMessage(message, kind = '') {
    const bar = document.querySelector('.github-sync-strip');
    const status = document.getElementById('githubSyncText');
    if (status) status.textContent = message;
    if (bar) bar.classList.toggle('is-live', kind === 'success');
  }

  function makeDynamicArt(repo, index) {
    const art = document.createElement('div');
    art.className = `project-art art-dynamic art-tone-${index % 4}`;
    art.setAttribute('aria-hidden', 'true');
    const label = addText(art, 'span', 'dynamic-art-label', String(repo.language || (repo.fork ? 'FORKED BUILD' : 'PUBLIC REPOSITORY')).toUpperCase());
    const orbit = document.createElement('div'); orbit.className = 'dynamic-orbit'; art.appendChild(orbit);
    const symbol = document.createElement('div'); symbol.className = 'dynamic-symbol'; const symText = document.createElement('span');
    const initials = String(repo.name || 'GH').split(/[-_\s.]+/).filter(Boolean).slice(0, 2).map(s => s[0]).join('').toUpperCase() || 'GH';
    symText.textContent = initials; symbol.appendChild(symText); art.appendChild(symbol);
    const metrics = document.createElement('div'); metrics.className = 'dynamic-metrics';
    addText(metrics, 'span', '', `★ ${formatCount(repo.stargazers_count)}`);
    addText(metrics, 'span', '', `⑂ ${formatCount(repo.forks_count)}`);
    art.appendChild(metrics);
    addText(art, 'span', 'dynamic-art-index', `REPO / ${String(index + 1).padStart(2, '0')}`);
    const scan = document.createElement('div'); scan.className = 'dynamic-scan'; art.appendChild(scan);
    return art;
  }

  function makeRepoCard(repo, index, featured = false) {
    const anchor = document.createElement('a');
    anchor.className = `project-card${featured ? ' project-featured' : ''}`;
    anchor.href = safeExternalUrl(repo.html_url);
    anchor.target = '_blank'; anchor.rel = 'noopener noreferrer';
    anchor.setAttribute('data-reveal', 'project-card');
    anchor.dataset.repoId = String(repo.id || `${repo.full_name || repo.name}`);
    const top = document.createElement('div'); top.className = 'project-card-top';
    addText(top, 'span', 'project-number', `${String(index + 1).padStart(2, '0')} / ${(repo.language || 'REPOSITORY').toUpperCase()}`);
    const state = addText(top, 'span', `project-state${repo.archived ? ' project-state-muted' : ''}`, repo.archived ? 'ARCHIVED' : repo.fork ? 'FORK' : 'PUBLIC BUILD');
    if (!repo.archived && !repo.fork) { const dot = document.createElement('i'); state.prepend(dot); }
    anchor.appendChild(top);
    anchor.appendChild(makeDynamicArt(repo, index));
    const info = document.createElement('div'); info.className = 'project-info';
    const copy = document.createElement('div');
    addText(copy, 'span', 'project-type', (repo.language || 'PUBLIC REPOSITORY').toUpperCase());
    addText(copy, 'h3', '', repo.name || 'Untitled repository');
    addText(copy, 'p', '', repo.description || 'No description added yet. Open the repository to explore the code and project history.');
    const tags = document.createElement('div'); tags.className = 'tag-row';
    if (repo.language) addText(tags, 'span', '', repo.language);
    (Array.isArray(repo.topics) ? repo.topics : []).slice(0, 3).forEach(topic => addText(tags, 'span', '', topic));
    if (!repo.language && !(repo.topics || []).length) addText(tags, 'span', '', repo.fork ? 'Fork' : 'GitHub');
    copy.appendChild(tags);
    const meta = document.createElement('div'); meta.className = 'repo-meta-row';
    addText(meta, 'span', '', `★ ${formatCount(repo.stargazers_count)}`);
    addText(meta, 'span', '', `⑂ ${formatCount(repo.forks_count)}`);
    addText(meta, 'span', '', formatUpdated(repo.updated_at));
    copy.appendChild(meta);
    info.appendChild(copy);
    addText(info, 'span', 'project-open', '↗');
    anchor.appendChild(info);
    return anchor;
  }

  function makeArchiveRow(repo, index) {
    const anchor = document.createElement('a');
    anchor.href = safeExternalUrl(repo.html_url); anchor.target = '_blank'; anchor.rel = 'noopener noreferrer';
    anchor.className = 'repo-row'; anchor.setAttribute('data-reveal', 'archive-row');
    addText(anchor, 'span', 'repo-index', String(index + 1).padStart(2, '0'));
    addText(anchor, 'span', 'repo-name', repo.name || 'Untitled repository');
    addText(anchor, 'span', 'repo-description', repo.description || `${repo.language || 'Public repository'} · ${formatUpdated(repo.updated_at)}`);
    addText(anchor, 'span', 'repo-arrow', '↗');
    return anchor;
  }

  function renderOwnRepositories(bundle, note = '') {
    ownGithubBundle = bundle;
    const profile = bundle.profile;
    const repos = [...bundle.repositories].sort((a, b) => new Date(b.pushed_at || b.updated_at || 0) - new Date(a.pushed_at || a.updated_at || 0));
    const grid = document.getElementById('projectGrid');
    const repoList = document.getElementById('repoList');
    const emptyArchive = document.getElementById('repoArchiveEmpty');
    if (!grid || !repoList) return;
    grid.replaceChildren(); repoList.replaceChildren();
    const count = document.getElementById('heroRepoCount'); if (count) count.textContent = String(profile.public_repos ?? repos.length).padStart(2, '0');
    const countChip = document.getElementById('githubCount'); if (countChip) countChip.textContent = `${repos.length}${bundle.truncated ? '+' : ''} REPOS`;
    const refreshed = new Date(bundle.fetchedAt || Date.now()).toLocaleTimeString(activeLang === 'hi' ? 'hi-IN' : 'en-IN', { hour: '2-digit', minute: '2-digit' });
    let message = `${repos.length} public repositories · sorted by latest push · synced ${refreshed}`;
    if (bundle.truncated) message = `Showing the latest ${repos.length} of ${profile.public_repos} public repositories · synced ${refreshed}`;
    if (bundle.fromCache) message += ' · cached snapshot';
    if (note) message = note;
    setRepositoryMessage(message, 'success');
    if (repos.length === 0) {
      const empty = document.createElement('div'); empty.className = 'empty-state';
      addText(empty, 'div', 'empty-state-symbol', '⌘');
      addText(empty, 'h3', '', 'No public repositories yet');
      addText(empty, 'p', '', 'Your GitHub account is connected, but it has no public repositories to show. Create a public repository or check the profile link.');
      grid.appendChild(empty);
    } else {
      repos.slice(0, 6).forEach((repo, index) => grid.appendChild(makeRepoCard(repo, index, index === 0)));
      repos.slice(6).forEach((repo, index) => repoList.appendChild(makeArchiveRow(repo, index + 7)));
    }
    if (emptyArchive) {
      if (repos.length > 6) emptyArchive.remove();
      else { emptyArchive.textContent = repos.length ? 'All of this profile’s public repositories are shown above.' : 'No additional repositories to archive yet.'; repoList.appendChild(emptyArchive); }
    }
    document.querySelectorAll('.project-card').forEach((card, index) => card.style.setProperty('--reveal-delay', `${Math.min(index, 7) * 75}ms`));
    document.querySelectorAll('.repo-row').forEach((row, index) => row.style.setProperty('--reveal-delay', `${Math.min(index, 7) * 48}ms`));
    observeRevealElements();
    setupTilt();
    prepareScrollExperience();
    updateScroll();
  }

  async function loadOwnProfile() {
    if (!client || !activeUser) return;
    const formStatus = document.getElementById('profileSaveStatus');
    setFormStatus(formStatus, 'Loading your profile…');
    try {
      const { data, error } = await client.from('void_profiles')
        .select('id,username,display_name,github_username,bio,public_profile_enabled')
        .eq('id', activeUser.id).maybeSingle();
      if (error) throw error;
      if (!data) throw new Error('No VOID profile record was found for this login. Recheck the original cloud-auth SQL setup before saving this profile.');
      ownProfile = {
        ...data,
        display_name: data.display_name || activeUser.user_metadata?.display_name || data.username,
        github_username: data.github_username || '',
        bio: data.bio || '',
        public_profile_enabled: data.public_profile_enabled !== false
      };
      document.getElementById('profileDisplayName').value = ownProfile.display_name;
      document.getElementById('profileGithubUsername').value = ownProfile.github_username;
      document.getElementById('profileBio').value = ownProfile.bio;
      document.getElementById('profilePublicToggle').checked = ownProfile.public_profile_enabled;
      updateHeroIdentity(ownProfile);
      linkToOwnGithub(ownProfile);
      const publicLink = document.getElementById('ownPublicProfileLink');
      if (publicLink) publicLink.hidden = !ownProfile.public_profile_enabled;
      const status = ownProfile.github_username ? 'Profile loaded. Checking public GitHub repositories…' : 'Profile loaded. Add your GitHub username to discover your projects.';
      setFormStatus(formStatus, status, 'success');
      if (ownProfile.github_username) await syncOwnRepositories(false);
      else {
        const grid = document.getElementById('projectGrid');
        if (grid) {
          grid.replaceChildren(); const empty = document.createElement('div'); empty.className = 'empty-state';
          addText(empty, 'div', 'empty-state-symbol', '⌘'); addText(empty, 'h3', '', 'Your projects start with GitHub');
          addText(empty, 'p', '', 'Save your GitHub username above. VOID will import public repositories and sort them automatically by recent activity.'); grid.appendChild(empty);
        }
        setRepositoryMessage('Connect a GitHub username to load public repositories.');
        const heroCount = document.getElementById('heroRepoCount'); if (heroCount) heroCount.textContent = '00';
        const githubCount = document.getElementById('githubCount'); if (githubCount) githubCount.textContent = '0 REPOS';
      }
    } catch (error) {
      const detail = error?.message || 'Unknown profile setup issue.';
      setFormStatus(formStatus, `Multi-user profile setup needs the SQL upgrade: ${detail}`, 'error');
      setRepositoryMessage('Run supabase-setup/void-multiuser-upgrade.sql in Supabase, then refresh this page.');
    }
  }

  async function saveOwnProfile(event) {
    event.preventDefault();
    if (!client || !activeUser) return;
    const form = document.getElementById('profileForm');
    const button = document.getElementById('saveProfileButton');
    const status = document.getElementById('profileSaveStatus');
    const displayName = document.getElementById('profileDisplayName').value.trim();
    const githubRaw = document.getElementById('profileGithubUsername').value.trim();
    const bio = document.getElementById('profileBio').value.trim();
    const publicEnabled = document.getElementById('profilePublicToggle').checked;
    if (!displayName || displayName.length > 60) return setFormStatus(status, 'Enter a display name between 1 and 60 characters.', 'error');
    const githubUsername = normalizedGithubInput(githubRaw);
    if (githubRaw && !githubUsername) return setFormStatus(status, 'Enter a valid GitHub username or a link such as https://github.com/octocat.', 'error');
    if (bio.length > 240) return setFormStatus(status, 'Keep the bio under 240 characters.', 'error');
    button.disabled = true;
    setFormStatus(status, 'Saving your profile…');
    try {
      const payload = { display_name: displayName, github_username: githubUsername || null, bio: bio || null, public_profile_enabled: publicEnabled };
      const { data, error } = await client.from('void_profiles').update(payload).eq('id', activeUser.id)
        .select('id,username,display_name,github_username,bio,public_profile_enabled').single();
      if (error) throw error;
      ownProfile = { ...data, display_name: data.display_name || data.username, github_username: data.github_username || '', bio: data.bio || '', public_profile_enabled: data.public_profile_enabled !== false };
      updateHeroIdentity(ownProfile);
      linkToOwnGithub(ownProfile);
      const publicLink = document.getElementById('ownPublicProfileLink');
      if (publicLink) { publicLink.href = `profile.html?id=${encodeURIComponent(ownProfile.username)}`; publicLink.hidden = !ownProfile.public_profile_enabled; }
      setFormStatus(status, 'Profile saved. Your VOID ID and GitHub link are up to date.', 'success');
      if (ownProfile.github_username) await syncOwnRepositories(true);
      else {
        ownGithubBundle = null;
        document.getElementById('projectGrid')?.replaceChildren();
        const grid = document.getElementById('projectGrid');
        if (grid) { const empty = document.createElement('div'); empty.className = 'empty-state'; addText(empty, 'div', 'empty-state-symbol', '⌘'); addText(empty, 'h3', '', 'Add a GitHub username to sync projects'); addText(empty, 'p', '', 'Your public project list appears here automatically once a public GitHub account is connected.'); grid.appendChild(empty); }
        document.getElementById('repoList')?.replaceChildren();
        setRepositoryMessage('GitHub connection removed. Add a username to sync again.');
      }
    } catch (error) {
      setFormStatus(status, `Could not save profile. Confirm the multi-user SQL migration has run. ${error?.message || ''}`, 'error');
    } finally {
      button.disabled = false;
    }
  }

  async function syncOwnRepositories(force = false) {
    if (!ownProfile?.github_username) return;
    const button = document.getElementById('refreshReposButton');
    if (button) { button.disabled = true; button.textContent = 'SYNCING…'; }
    setRepositoryMessage('Contacting GitHub for public repositories…');
    try {
      const bundle = await window.VOIDGitHub.getBundle(ownProfile.github_username, { force });
      renderOwnRepositories(bundle);
      const mini = document.getElementById('ownGithubMini');
      if (mini) mini.hidden = false;
      const avatar = document.getElementById('ownGithubAvatar'); if (avatar) { avatar.src = bundle.profile.avatar_url || ''; avatar.alt = `${bundle.profile.login} GitHub avatar`; }
      const ghName = document.getElementById('ownGithubName'); if (ghName) ghName.textContent = bundle.profile.name || bundle.profile.login;
      const ghDetails = document.getElementById('ownGithubDetails'); if (ghDetails) ghDetails.textContent = `${bundle.profile.public_repos} public repos · ${bundle.profile.followers} followers`;
      const ghLink = document.getElementById('ownGithubProfileLink'); if (ghLink) ghLink.href = safeExternalUrl(bundle.profile.html_url);
    } catch (error) {
      setRepositoryMessage(error?.message || 'GitHub could not be reached. Try syncing again.', 'error');
      const grid = document.getElementById('projectGrid');
      if (grid && !grid.querySelector('.project-card')) {
        grid.replaceChildren(); const empty = document.createElement('div'); empty.className = 'empty-state';
        addText(empty, 'div', 'empty-state-symbol', '↻'); addText(empty, 'h3', '', 'Could not sync GitHub right now');
        addText(empty, 'p', '', `${error?.message || 'Try again later.'} Your saved profile is safe; use SYNC GITHUB to retry.`); grid.appendChild(empty);
      }
    } finally {
      if (button) { button.disabled = false; button.textContent = 'SYNC GITHUB ↻'; }
    }
  }

  async function searchVoidProfile(event) {
    event.preventDefault();
    const input = document.getElementById('profileSearchInput');
    const button = document.getElementById('profileSearchButton');
    const status = document.getElementById('profileSearchStatus');
    const result = document.getElementById('profileSearchResult');
    const voidId = input.value.trim();
    result.hidden = true; result.replaceChildren();
    if (!/^[A-Za-z0-9_-]{3,32}$/.test(voidId)) return setFormStatus(status, 'Enter a valid VOID ID (3–32 letters, numbers, underscores or hyphens).', 'error');
    button.disabled = true; setFormStatus(status, 'Searching public VOID profiles…');
    try {
      const { data, error } = await client.rpc('void_public_profile_by_username', { input_username: voidId });
      if (error) throw error;
      const profile = Array.isArray(data) ? data[0] : data;
      if (!profile) {
        setFormStatus(status, 'No public profile was found for that VOID ID. They may not have enabled profile discovery.', 'error');
        return;
      }
      result.replaceChildren();
      const top = document.createElement('div'); top.className = 'search-person-top';
      const avatar = document.createElement('img'); avatar.className = 'search-person-avatar'; avatar.alt = 'GitHub avatar'; avatar.src = 'https://github.com/ghost.png'; top.appendChild(avatar);
      const copy = document.createElement('div'); copy.className = 'search-person-copy';
      addText(copy, 'strong', '', profile.display_name || profile.void_id);
      addText(copy, 'span', '', `VOID ID / ${profile.void_id}`);
      top.appendChild(copy); result.appendChild(top);
      if (profile.bio) addText(result, 'p', 'search-person-bio', profile.bio);
      const stats = document.createElement('div'); stats.className = 'search-person-stats';
      addText(stats, 'span', '', profile.github_username ? `GITHUB / @${profile.github_username}` : 'GITHUB / NOT LINKED'); result.appendChild(stats);
      const actions = document.createElement('div'); actions.className = 'search-person-actions';
      if (profile.github_username) {
        const github = document.createElement('a'); github.href = `https://github.com/${encodeURIComponent(profile.github_username)}`; github.target = '_blank'; github.rel = 'noopener noreferrer'; github.textContent = 'OPEN GITHUB ↗'; actions.appendChild(github);
      }
      const publicLink = document.createElement('a'); publicLink.href = `profile.html?id=${encodeURIComponent(profile.void_id)}`; publicLink.textContent = 'OPEN VOID PROFILE ↗'; actions.appendChild(publicLink);
      result.appendChild(actions);
      if (profile.github_username) {
        try {
          const bundle = await window.VOIDGitHub.getBundle(profile.github_username);
          avatar.src = bundle.profile.avatar_url || avatar.src;
          addText(stats, 'span', '', `${formatCount(bundle.profile.public_repos)} PUBLIC REPOS`);
          addText(stats, 'span', '', `${formatCount(bundle.profile.followers)} FOLLOWERS`);
          const repos = document.createElement('div'); repos.className = 'search-repos';
          bundle.repositories.slice(0, 4).forEach(repo => {
            const link = document.createElement('a'); link.className = 'search-repo-link'; link.href = safeExternalUrl(repo.html_url); link.target = '_blank'; link.rel = 'noopener noreferrer';
            addText(link, 'span', '', repo.name); addText(link, 'small', '', `${repo.language || 'REPO'} · ★ ${formatCount(repo.stargazers_count)}`); repos.appendChild(link);
          });
          if (bundle.repositories.length) result.appendChild(repos);
        } catch (_) { /* profile lookup remains useful even while GitHub is unavailable */ }
      }
      result.hidden = false;
      setFormStatus(status, `Public profile found for ${profile.void_id}.`, 'success');
    } catch (error) {
      setFormStatus(status, 'Profile search could not run. If this is the first setup, run supabase-setup/void-multiuser-upgrade.sql in Supabase. ' + (error?.message || ''), 'error');
    } finally { button.disabled = false; }
  }

  function setupMultiUserFeatures() {
    const profileForm = document.getElementById('profileForm');
    const searchForm = document.getElementById('profileSearchForm');
    const refresh = document.getElementById('refreshReposButton');
    if (profileForm) profileForm.addEventListener('submit', saveOwnProfile);
    if (searchForm) searchForm.addEventListener('submit', searchVoidProfile);
    if (refresh) refresh.addEventListener('click', () => syncOwnRepositories(true));
    const publicLink = document.createElement('a'); publicLink.id = 'ownPublicProfileLink'; publicLink.className = 'small-external';
    publicLink.textContent = 'SHARE PROFILE ↗'; publicLink.href = 'profile.html'; publicLink.target = '_blank'; publicLink.rel = 'noopener noreferrer'; publicLink.hidden = true;
    const mini = document.getElementById('ownGithubMini');
    if (mini) mini.appendChild(publicLink);
  }


  function observeRevealElements() {
    const revealElements = document.querySelectorAll('[data-reveal]:not([data-reveal-bound])');
    revealElements.forEach(el => { el.dataset.revealBound = 'true'; });
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
  setupMultiUserFeatures();
  startCanvas();
  setupPointer();
  setupTilt();
  updateScroll();
  bootWorkspace();
})();
