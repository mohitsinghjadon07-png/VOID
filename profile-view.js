/* VOID — dedicated public profile option
   Reads the existing ownPublicProfileLink created by dashboard.js.
   Does not access Supabase directly and does not alter authentication. */
(() => {
  'use strict';
  if (window.__VOID_PROFILE_VIEW_ADDON__) return;
  window.__VOID_PROFILE_VIEW_ADDON__ = true;

  const init = () => {
    const identity = document.getElementById('identity');
    const layout = identity?.querySelector('.identity-layout');
    if (!identity || !layout || document.getElementById('profileViewPanel')) return;

    const el = (tag, className, text) => {
      const node = document.createElement(tag);
      if (className) node.className = className;
      if (text !== undefined) node.textContent = text;
      return node;
    };

    const panel = el('section', 'profile-view-panel');
    panel.id = 'profileViewPanel';
    panel.setAttribute('aria-labelledby', 'profileViewHeading');
    panel.dataset.profileState = 'setup';

    const copy = el('div', 'profile-view-copy');
    const eyebrow = el('div', 'profile-view-eyebrow');
    eyebrow.append(el('span', 'profile-view-live-dot'));
    eyebrow.append(document.createTextNode(' YOUR PUBLIC PRESENCE '));
    const index = el('span', '', ' / 03 — PROFILE VIEW');
    eyebrow.append(index);
    copy.append(eyebrow);

    const heading = el('h3', 'profile-view-heading');
    heading.id = 'profileViewHeading';
    heading.append(document.createTextNode('Your identity. '));
    const line = el('em', '', 'Beyond the dashboard.');
    heading.append(line);
    copy.append(heading);

    const description = el('p', 'profile-view-description', 'Your public VOID page lives here. Save your profile above to publish your own page, then open it anytime from this separate shortcut.');
    description.id = 'profileViewDescription';
    copy.append(description);
    const state = el('div', 'profile-view-state', 'PROFILE SETUP / READY WHEN YOU ARE');
    state.id = 'profileViewState';
    state.setAttribute('role', 'status');
    state.setAttribute('aria-live', 'polite');
    copy.append(state);

    const actions = el('div', 'profile-view-actions');
    const button = el('a', 'profile-view-button');
    button.id = 'profileViewButton';
    button.href = '#profileForm';
    button.setAttribute('aria-describedby', 'profileViewDescription profileViewState');
    const buttonText = el('span', '', 'SET UP MY PROFILE');
    buttonText.dataset.profileViewLabel = '';
    const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    arrow.setAttribute('viewBox', '0 0 24 24');
    arrow.setAttribute('fill', 'none');
    arrow.setAttribute('stroke', 'currentColor');
    arrow.setAttribute('stroke-width', '1.7');
    arrow.setAttribute('stroke-linecap', 'round');
    arrow.setAttribute('stroke-linejoin', 'round');
    arrow.setAttribute('aria-hidden', 'true');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M7 17 17 7M7 7h10v10');
    arrow.append(path);
    button.append(buttonText, arrow);
    actions.append(button);

    const edit = el('a', 'profile-view-edit');
    edit.href = '#profileForm';
    edit.append(document.createTextNode('EDIT PROFILE DETAILS '));
    edit.append(el('span', '', '↓'));
    actions.append(edit);

    const art = el('div', 'profile-view-art');
    art.setAttribute('aria-hidden', 'true');
    art.append(el('span', 'profile-view-orbit profile-view-orbit-a'));
    art.append(el('span', 'profile-view-orbit profile-view-orbit-b'));
    art.append(el('span', 'profile-view-orbit profile-view-orbit-c'));
    const core = el('span', 'profile-view-core');
    core.append(el('span', '', 'V'));
    art.append(core);

    panel.append(copy, actions, art);
    layout.insertAdjacentElement('afterend', panel);

    const setState = (kind, statusText, descriptionText, actionText, href, newTab = false) => {
      panel.dataset.profileState = kind;
      state.textContent = statusText;
      description.textContent = descriptionText;
      buttonText.textContent = actionText;
      button.href = href;
      if (newTab) {
        button.target = '_blank';
        button.rel = 'noopener noreferrer';
      } else {
        button.removeAttribute('target');
        button.removeAttribute('rel');
      }
    };

    const sync = () => {
      const publicLink = document.getElementById('ownPublicProfileLink');
      if (!publicLink) {
        setState('setup', 'PROFILE SETUP / READY WHEN YOU ARE', 'New to VOID? Complete the profile form above. Once your profile is saved and public visibility is enabled, your personal page will be available here.', 'SET UP MY PROFILE', '#profileForm');
        return;
      }

      let voidId = '';
      try { voidId = new URL(publicLink.getAttribute('href') || 'profile.html', window.location.href).searchParams.get('id') || ''; }
      catch (_) { /* malformed link falls back to setup */ }

      if (voidId && !publicLink.hidden) {
        setState('published', 'PUBLIC PROFILE / LIVE', 'Your VOID profile is published. Open your personal public page to view your identity and the projects connected to your account.', 'VIEW MY PUBLIC PROFILE', publicLink.href, true);
      } else if (voidId && publicLink.hidden) {
        setState('disabled', 'PROFILE SAVED / VISIBILITY OFF', 'Your VOID ID exists, but public visibility is currently turned off. Enable “Let people find me by VOID ID” in the profile form above to publish your page.', 'REVIEW PROFILE SETTINGS', '#profileForm');
      } else {
        setState('setup', 'NEW HERE / COMPLETE SETUP', 'Your public page will be ready after you save your profile above. Add your display name and choose whether people can find you by VOID ID.', 'SET UP MY PROFILE', '#profileForm');
      }
    };

    // The original dashboard owns the profile link; observe its published state.
    const attachProfileLinkObserver = () => {
      const publicLink = document.getElementById('ownPublicProfileLink');
      if (!publicLink || publicLink.dataset.profileViewObserved) return;
      // Stop watching all page mutations once the existing link is found.
      // This prevents our own status-text updates from triggering an observer loop.
      finder.disconnect();
      publicLink.dataset.profileViewObserved = 'true';
      const linkObserver = new MutationObserver(sync);
      linkObserver.observe(publicLink, { attributes: true, attributeFilter: ['href', 'hidden'] });
      sync();
    };

    const finder = new MutationObserver(() => {
      attachProfileLinkObserver();
      sync();
    });
    finder.observe(document.body, { childList: true, subtree: true });
    attachProfileLinkObserver();
    sync();

    // Keep the new-user CTA useful: bring keyboard/screen-reader focus to the editor.
    button.addEventListener('click', (event) => {
      if (button.getAttribute('href') !== '#profileForm') return;
      const form = document.getElementById('profileForm');
      const firstField = document.getElementById('profileDisplayName');
      if (form && firstField) {
        event.preventDefault();
        form.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
        window.setTimeout(() => firstField.focus({ preventScroll: true }), window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 350);
      }
    });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
