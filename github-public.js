(() => {
  'use strict';
  const CACHE_PREFIX = 'void-github-public-v2:';
  const CACHE_TTL = 5 * 60 * 1000;
  const API = 'https://api.github.com';
  const normalize = (value) => {
    let raw = String(value || '').trim().replace(/^@/, '');
    if (!raw) return '';
    try {
      if (/^https?:\/\//i.test(raw)) {
        const url = new URL(raw);
        if (!['github.com', 'www.github.com'].includes(url.hostname.toLowerCase())) return null;
        raw = url.pathname.split('/').filter(Boolean)[0] || '';
      } else if (/^(www\.)?github\.com\//i.test(raw)) raw = raw.replace(/^(www\.)?github\.com\//i, '').split('/')[0];
    } catch (_) { return null; }
    if (!/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/.test(raw) || raw.includes('--')) return null;
    return raw.toLowerCase();
  };
  const minimalRepo = (r) => ({
    id:r.id, name:r.name, full_name:r.full_name, html_url:r.html_url, description:r.description,
    language:r.language, stargazers_count:r.stargazers_count, forks_count:r.forks_count,
    topics:Array.isArray(r.topics)?r.topics:[], updated_at:r.updated_at, pushed_at:r.pushed_at,
    created_at:r.created_at, fork:Boolean(r.fork), archived:Boolean(r.archived),
    visibility:r.visibility || (r.private ? 'private':'public'), default_branch:r.default_branch
  });
  function readCache(login) {
    try {
      const raw = localStorage.getItem(CACHE_PREFIX + login);
      if (!raw) return null;
      const cache = JSON.parse(raw);
      return cache && cache.bundle ? { ...cache.bundle, cacheAge: Date.now() - cache.savedAt, fromCache:true } : null;
    } catch (_) { return null; }
  }
  function writeCache(login, bundle) {
    try {
      localStorage.setItem(CACHE_PREFIX + login, JSON.stringify({ savedAt:Date.now(), bundle }));
    } catch (_) { /* browser storage may be disabled or full; live data still works */ }
  }
  async function getJson(url) {
    const response = await fetch(url, { headers: { Accept:'application/vnd.github+json', 'X-GitHub-Api-Version':'2022-11-28' } });
    if (response.status === 404) throw new Error('That GitHub username or profile was not found. Check the spelling.');
    if (response.status === 403 || response.status === 429) throw new Error('GitHub API rate limit reached. Your last cached public repo list may still be available; try again later.');
    if (!response.ok) throw new Error(`GitHub returned an error (${response.status}). Try syncing again later.`);
    return response.json();
  }
  async function getBundle(value, options = {}) {
    const login = normalize(value);
    if (!login) throw new Error('Enter a valid GitHub username or profile URL.');
    const cached = readCache(login);
    const force = Boolean(options.force);
    if (!force && cached && cached.cacheAge < CACHE_TTL) return cached;
    try {
      const profile = await getJson(`${API}/users/${encodeURIComponent(login)}`);
      const total = Number(profile.public_repos || 0);
      const maxPages = Math.min(10, Math.ceil(total / 100));
      const repositories = [];
      for (let page = 1; page <= maxPages; page += 1) {
        const rows = await getJson(`${API}/users/${encodeURIComponent(login)}/repos?per_page=100&sort=updated&direction=desc&type=owner&page=${page}`);
        if (!Array.isArray(rows)) break;
        repositories.push(...rows.map(minimalRepo));
        if (rows.length < 100) break;
      }
      repositories.sort((a,b) => new Date(b.pushed_at || b.updated_at || 0) - new Date(a.pushed_at || a.updated_at || 0));
      const bundle = {
        profile: {
          login:profile.login, name:profile.name, bio:profile.bio, avatar_url:profile.avatar_url,
          html_url:profile.html_url, public_repos:profile.public_repos, followers:profile.followers,
          following:profile.following, created_at:profile.created_at, location:profile.location,
          blog:profile.blog
        },
        repositories,
        fetchedAt:new Date().toISOString(),
        truncated:repositories.length < total
      };
      writeCache(login,bundle);
      return bundle;
    } catch (error) {
      if (cached) return { ...cached, stale:true };
      throw error;
    }
  }
  window.VOIDGitHub = { normalize, getBundle, cacheTtlMs:CACHE_TTL };
})();
