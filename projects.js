const USERNAME = 'osmanesad';
const MAX_REPOS = 60;
const HIDE_FORKS = true;
const HIDE_ARCHIVED = true;

const listEl = document.getElementById('list');
const qEl = document.getElementById('q');
const countEl = document.getElementById('countLine');

let WORK = [];

function safe(t) {
  return (t || '').toString();
}

function repoUrl(full) {
  return `https://github.com/${full}`;
}

function render(items) {
  listEl.innerHTML = '';

  items.forEach((r) => {
    const li = document.createElement('li');
    const link = document.createElement('a');
    const title = document.createElement('div');
    const desc = document.createElement('div');
    const meta = document.createElement('div');
    const metaBits = [];

    li.className = 'archiveItem';
    title.className = 't';
    desc.className = 'e';
    meta.className = 'd';

    if (r.language) metaBits.push(safe(r.language));
    if (r.stargazers_count) metaBits.push(`★ ${r.stargazers_count}`);
    if (r.forks_count) metaBits.push(`⑂ ${r.forks_count}`);

    link.href = repoUrl(r.full_name);
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    title.textContent = safe(r.name);
    desc.textContent = safe(r.description || '');
    meta.textContent = metaBits.join(' · ');

    link.appendChild(title);
    li.append(link, desc, meta);
    listEl.appendChild(li);
  });

  countEl.textContent = `${items.length} repo · yeni → eski`;
}

function applyFilter() {
  const q = (qEl.value || '').trim().toLowerCase();
  if (!q) return render(WORK);

  const filtered = WORK.filter((r) => {
    const hay = [r.name, r.full_name, r.description, r.language]
      .map(safe)
      .join(' ')
      .toLowerCase();
    return hay.includes(q);
  });

  render(filtered);
}

document.getElementById('clear').addEventListener('click', () => {
  qEl.value = '';
  applyFilter();
  qEl.focus();
});

qEl.addEventListener('input', applyFilter);

async function fetchAllRepos(username) {
  const all = [];
  let page = 1;

  while (true) {
    const url = `https://api.github.com/users/${username}/repos?per_page=100&page=${page}&sort=pushed`;
    const res = await fetch(url, {
      headers: { Accept: 'application/vnd.github+json' }
    });

    if (!res.ok) {
      throw new Error(`GitHub API error: ${res.status}`);
    }

    const data = await res.json();
    all.push(...(data || []));

    if ((data || []).length < 100) break;
    page++;
  }

  return all;
}

async function load() {
  try {
    countEl.textContent = 'Yükleniyor...';

    const repos = await fetchAllRepos(USERNAME);

    WORK = repos
      .filter((r) => !HIDE_FORKS || !r.fork)
      .filter((r) => !HIDE_ARCHIVED || !r.archived)
      .sort((a, b) => (b.pushed_at || '').localeCompare(a.pushed_at || ''))
      .slice(0, MAX_REPOS);

    render(WORK);
  } catch (e) {
    console.error(e);
    countEl.textContent = 'Repo listesi yüklenemedi.';
  }
}

load();

const toTopBtn = document.getElementById('toTop');
if (toTopBtn) {
  const toggle = () => toTopBtn.classList.toggle('show', window.scrollY > 500);
  window.addEventListener('scroll', toggle, { passive: true });
  toggle();
  toTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}
