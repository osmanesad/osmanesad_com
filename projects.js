// Kodlar sayfası: GitHub'dan public repoları çekip listeler.
// Not: GitHub API token kullanmıyoruz (rate limit düşük). Repo sayın ~60 ise sorun yaşamaz.

const USERNAME = "osmanesad";
const MAX_REPOS = 60;            // 60 altına çekmek için
const HIDE_FORKS = true;         // fork'ları gizle
const HIDE_ARCHIVED = true;      // archived repo'ları gizle

const listEl = document.getElementById("list");
const qEl = document.getElementById("q");
const countEl = document.getElementById("countLine");

let WORK = [];

function safe(t){ return (t || "").toString(); }
function repoUrl(full){ return `https://github.com/${full}`; }

function render(items){
  listEl.innerHTML = "";
  items.forEach(r => {
    const li = document.createElement("li");
    li.className = "archiveItem";

    const title = safe(r.name);
    const desc  = safe(r.description || "");
    const lang  = safe(r.language || "");

    // küçük meta satırı
    const metaBits = [];
    if(lang) metaBits.push(lang);
    if(r.stargazers_count) metaBits.push(`★ ${r.stargazers_count}`);
    if(r.forks_count) metaBits.push(`⑂ ${r.forks_count}`);
    const meta = metaBits.join(" · ");

    const link = document.createElement("a");
    link.href = repoUrl(r.full_name);
    link.target = "_blank";
    link.rel = "noopener";

    const titleEl = document.createElement("div");
    titleEl.className = "t";
    titleEl.textContent = title;
    link.appendChild(titleEl);

    const descEl = document.createElement("div");
    descEl.className = "e";
    descEl.textContent = desc || "Açıklama yok.";

    const metaEl = document.createElement("div");
    metaEl.className = "d";
    metaEl.textContent = meta || "Detay yok.";

    li.append(link, descEl, metaEl);
    listEl.appendChild(li);
  });

  countEl.textContent = `${items.length} repo · yeni → eski`;
}

function applyFilter(){
  const q = (qEl.value || "").trim().toLowerCase();
  if(!q) return render(WORK);

  const filtered = WORK.filter(r => {
    const hay = [
      r.name, r.full_name, r.description, r.language
    ].map(safe).join(" ").toLowerCase();
    return hay.includes(q);
  });

  render(filtered);
}

document.getElementById("clear").addEventListener("click", () => {
  qEl.value = "";
  applyFilter();
  qEl.focus();
});
qEl.addEventListener("input", applyFilter);

async function fetchAllRepos(username){
  const all = [];
  let page = 1;

  while(true){
    const url = `https://api.github.com/users/${username}/repos?per_page=100&page=${page}&sort=pushed`;
    const res = await fetch(url, { headers: { "Accept": "application/vnd.github+json" } });

    if(!res.ok){
      throw new Error(`GitHub API error: ${res.status}`);
    }

    const data = await res.json();
    all.push(...(data || []));

    if((data || []).length < 100) break;
    page++;
  }

  return all;
}

async function load(){
  try{
    countEl.textContent = "Yükleniyor…";

    const repos = await fetchAllRepos(USERNAME);

    WORK = repos
      .filter(r => !HIDE_FORKS || !r.fork)
      .filter(r => !HIDE_ARCHIVED || !r.archived)
      .sort((a,b) => (b.pushed_at || "").localeCompare(a.pushed_at || ""))
      .slice(0, MAX_REPOS);

    render(WORK);
  } catch(e){
    console.error(e);
    countEl.textContent = "Repo listesi yüklenemedi.";
  }
}

load();

// --- Scroll to top ---
const toTopBtn = document.getElementById("toTop");
if(toTopBtn){
  const toggle = () => toTopBtn.classList.toggle("show", window.scrollY > 500);
  window.addEventListener("scroll", toggle, { passive: true });
  toggle();
  toTopBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}
