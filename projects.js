const USERNAME = "osmanesad";
const MAX_REPOS = 60;
const HIDE_FORKS = true;
const HIDE_ARCHIVED = true;

const listEl = document.getElementById("list");
const qEl = document.getElementById("q");
const countEl = document.getElementById("countLine");

let WORK = [];

function safe(value) {
  return (value || "").toString();
}

function repoUrl(fullName) {
  return `https://github.com/${fullName}`;
}

function render(items) {
  listEl.innerHTML = "";

  items.forEach((repo) => {
    const li = document.createElement("li");
    li.className = "archiveItem";

    const metaBits = [];
    if (repo.language) metaBits.push(repo.language);
    if (repo.stargazers_count) metaBits.push(`stars ${repo.stargazers_count}`);
    if (repo.forks_count) metaBits.push(`forks ${repo.forks_count}`);

    const link = document.createElement("a");
    link.href = repoUrl(repo.full_name);
    link.target = "_blank";
    link.rel = "noopener";

    const titleEl = document.createElement("div");
    titleEl.className = "t";
    titleEl.textContent = safe(repo.name);

    const descEl = document.createElement("div");
    descEl.className = "e";
    descEl.textContent = safe(repo.description) || "Kısa açıklama eklenmemiş.";

    const metaEl = document.createElement("div");
    metaEl.className = "d";
    metaEl.textContent = metaBits.join(" / ") || "Detay bilgisi yok.";

    link.appendChild(titleEl);
    li.append(link, descEl, metaEl);
    listEl.appendChild(li);
  });

  countEl.textContent = `${items.length} proje · son güncellenenler`;
}

function applyFilter() {
  const q = (qEl.value || "").trim().toLowerCase();
  if (!q) {
    render(WORK);
    return;
  }

  const filtered = WORK.filter((repo) => {
    const haystack = [repo.name, repo.full_name, repo.description, repo.language].map(safe).join(" ").toLowerCase();
    return haystack.includes(q);
  });

  render(filtered);
}

document.getElementById("clear").addEventListener("click", () => {
  qEl.value = "";
  applyFilter();
  qEl.focus();
});
qEl.addEventListener("input", applyFilter);

async function fetchAllRepos(username) {
  const all = [];
  let page = 1;

  while (true) {
    const url = `https://api.github.com/users/${username}/repos?per_page=100&page=${page}&sort=pushed`;
    const res = await fetch(url, { headers: { Accept: "application/vnd.github+json" } });

    if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);

    const data = await res.json();
    all.push(...(data || []));

    if ((data || []).length < 100) break;
    page++;
  }

  return all;
}

async function load() {
  try {
    countEl.textContent = "Yükleniyor...";

    const repos = await fetchAllRepos(USERNAME);

    WORK = repos
      .filter((repo) => !HIDE_FORKS || !repo.fork)
      .filter((repo) => !HIDE_ARCHIVED || !repo.archived)
      .sort((a, b) => (b.pushed_at || "").localeCompare(a.pushed_at || ""))
      .slice(0, MAX_REPOS);

    render(WORK);
  } catch (e) {
    console.error(e);
    countEl.textContent = "Proje listesi yüklenemedi. GitHub bağlantısını kontrol edip tekrar dene.";
  }
}

load();

const toTopBtn = document.getElementById("toTop");
if (toTopBtn) {
  const toggle = () => toTopBtn.classList.toggle("show", window.scrollY > 500);
  window.addEventListener("scroll", toggle, { passive: true });
  toggle();
  toTopBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}
