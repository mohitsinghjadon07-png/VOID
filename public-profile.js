function card(repo, index, featured = false) {
  const a = document.createElement('a');

  a.className = `project-card${featured ? ' project-featured' : ''}`;
  a.href = repo.html_url;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';

  // Fix: make repository cards visible on the public profile page
  a.classList.add('is-visible');

  const top = text(a, 'div', 'project-card-top', '');

  text(
    top,
    'span',
    'project-number',
    `${String(index + 1).padStart(2, '0')} / ${(repo.language || 'REPOSITORY').toUpperCase()}`
  );

  const state = text(
    top,
    'span',
    `project-state${repo.archived ? ' project-state-muted' : ''}`,
    repo.archived ? 'ARCHIVED' : repo.fork ? 'FORK' : 'PUBLIC BUILD'
  );

  if (!repo.archived && !repo.fork) {
    const dot = document.createElement('i');
    state.prepend(dot);
  }

  const art = text(
    a,
    'div',
    `project-art art-dynamic art-tone-${index % 4}`,
    ''
  );

  art.setAttribute('aria-hidden', 'true');

  text(
    art,
    'span',
    'dynamic-art-label',
    (repo.language || 'PUBLIC REPOSITORY').toUpperCase()
  );

  const orbit = document.createElement('div');
  orbit.className = 'dynamic-orbit';
  art.appendChild(orbit);

  const symbol = text(art, 'div', 'dynamic-symbol', '');

  text(
    symbol,
    'span',
    '',
    String(repo.name || 'GH')
      .split(/[-_\s.]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(x => x[0])
      .join('')
      .toUpperCase() || 'GH'
  );

  const metrics = text(art, 'div', 'dynamic-metrics', '');

  text(metrics, 'span', '', `★ ${Number(repo.stargazers_count || 0)}`);
  text(metrics, 'span', '', `⑂ ${Number(repo.forks_count || 0)}`);

  text(
    art,
    'span',
    'dynamic-art-index',
    `REPO / ${String(index + 1).padStart(2, '0')}`
  );

  const scan = document.createElement('div');
  scan.className = 'dynamic-scan';
  art.appendChild(scan);

  const info = text(a, 'div', 'project-info', '');
  const copy = text(info, 'div', '', '');

  text(
    copy,
    'span',
    'project-type',
    (repo.language || 'PUBLIC REPOSITORY').toUpperCase()
  );

  text(copy, 'h3', '', repo.name);

  text(
    copy,
    'p',
    '',
    repo.description ||
      'No description added yet. Open this repository to explore the code and project history.'
  );

  const tags = text(copy, 'div', 'tag-row', '');

  if (repo.language) {
    text(tags, 'span', '', repo.language);
  }

  (repo.topics || []).slice(0, 3).forEach(topic => {
    text(tags, 'span', '', topic);
  });

  const meta = text(copy, 'div', 'repo-meta-row', '');

  text(meta, 'span', '', '★ ' + Number(repo.stargazers_count || 0));
  text(meta, 'span', '', '⑂ ' + Number(repo.forks_count || 0));

  text(
    meta,
    'span',
    '',
    `UPDATED ${formatDate(repo.updated_at)}`
  );

  text(info, 'span', 'project-open', '↗');

  return a;
}
