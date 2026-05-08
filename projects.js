const USERNAME = 'osmanesad';
const MAX_REPOS = 60;
const HIDE_FORKS = true;
const HIDE_ARCHIVED = true;

const listEl = document.getElementById('list');
const qEl = document.getElementById('q');
const countEl = document.getElementById('countLine');
const clearBtn = document.getElementById('clear');
const themeToggle = document.getElementById('themeToggle');
const toTopBtn = document.getElementById('toTop');

let WORK = [];

function setTheme(name) {
  document.body.classList.toggle('theme-dark', name === 'dark');
  try {
    localStorage.setItem('site_theme', name);
  } catch (_) {}
}

function safe(value) {
  return (value || '').toString();
}

function repoUrl(fullName) {
  return `https://github.com/${fullName}`;
}

function fmtUpdated(value) {
  if (!value) return '';
  try {
    return new Date(value).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  } catch {
    return value;
  }
}

function render(items) {
  listEl.innerHTML = '';

  items.forEach((repo) => {
    const li = document.createElement('li');
    li.className = 'archiveItem';

    const date = document.createElement('div');
    date.className = 'd';
    date.textContent = fmtUpdated(repo.pushed_at) || 'Güncel';

    const content = document.createElement('div');
    const link = document.createElement('a');
    link.href = repoUrl(repo.full_name);
    link.target = '_blank';
    link.rel = 'noopener';

    const title = document.createElement('div');
    title.className = 't';
    title.textContent = safe(repo.name);

    const desc = document.createElement('div');
    desc.className = 'e';
    desc.textContent = safe(repo.description) || 'Açıklama yok.';

    const metaBits = [];
    if (repo.language) metaBits.push(repo.language);
    if (repo.stargazers_count) metaBits.push(`star ${repo.stargazers_count}`);
    if (repo.forks_count) metaBits.push(`fork ${repo.forks_count}`);

    const meta = document.createElement('div');
    meta.className = 'projectMeta';
    meta.textContent = metaBits.join(' · ') || 'Detay yok.';

    link.appendChild(title);
    content.append(link, desc, meta);
    li.append(date, content);
    listEl.appendChild(li);
  });

  countEl.textContent = `${items.length} repo · yeni -> eski`;
}

function applyFilter() {
  const query = (qEl.value || '').trim().toLowerCase();
  if (!query) {
    render(WORK);
    return;
  }

  render(
    WORK.filter((repo) =>
      [repo.name, repo.full_name, repo.description, repo.language]
        .map(safe)
        .join(' ')
        .toLowerCase()
        .includes(query)
    )
  );
}

async function fetchAllRepos(username) {
  const all = [];
  let page = 1;

  while (true) {
    const url = `https://api.github.com/users/${username}/repos?per_page=100&page=${page}&sort=pushed`;
    const response = await fetch(url, { headers: { Accept: 'application/vnd.github+json' } });
    if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);

    const data = await response.json();
    all.push(...(data || []));
    if ((data || []).length < 100) break;
    page += 1;
  }

  return all;
}

async function load() {
  try {
    countEl.textContent = 'Yükleniyor...';
    const repos = await fetchAllRepos(USERNAME);
    WORK = repos
      .filter((repo) => !HIDE_FORKS || !repo.fork)
      .filter((repo) => !HIDE_ARCHIVED || !repo.archived)
      .sort((a, b) => (b.pushed_at || '').localeCompare(a.pushed_at || ''))
      .slice(0, MAX_REPOS);

    render(WORK);
  } catch (error) {
    console.error(error);
    countEl.textContent = 'Repo listesi yüklenemedi.';
  }
}

let savedTheme = 'light';
try {
  savedTheme = localStorage.getItem('site_theme') || 'light';
} catch (_) {}
setTheme(savedTheme);

themeToggle?.addEventListener('click', () => {
  setTheme(document.body.classList.contains('theme-dark') ? 'light' : 'dark');
});

clearBtn?.addEventListener('click', () => {
  qEl.value = '';
  applyFilter();
  qEl.focus();
});
qEl?.addEventListener('input', applyFilter);

if (toTopBtn) {
  const toggle = () => toTopBtn.classList.toggle('show', window.scrollY > 500);
  window.addEventListener('scroll', toggle, { passive: true });
  toggle();
  toTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

load();
