import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://zefzcmrsdvtbliguqedi.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_vGfAuyo4h18I-Pqmt25N0Q_OkEtlazb';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const listEl = document.getElementById('list');
const qEl = document.getElementById('q');
const countEl = document.getElementById('countLine');
const timelineEl = document.getElementById('timeline');
const clearBtn = document.getElementById('clear');
const themeToggle = document.getElementById('themeToggle');
const toTopBtn = document.getElementById('toTop');

let POSTS = [];

function setTheme(name) {
  document.body.classList.toggle('theme-dark', name === 'dark');
  try {
    localStorage.setItem('site_theme', name);
  } catch (_) {}
}

function fmtDate(iso) {
  if (!iso) return '';
  try {
    return new Date(`${iso}T00:00:00`).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: '2-digit'
    });
  } catch {
    return iso;
  }
}

function stripHtml(html) {
  const div = document.createElement('div');
  div.innerHTML = html || '';
  return (div.textContent || div.innerText || '').replace(/\s+/g, ' ').trim();
}

function buildTimeline(posts) {
  if (!timelineEl) return;
  const years = [...new Set(posts.map((post) => (post.date || '').slice(0, 4)).filter(Boolean))];
  timelineEl.innerHTML = '';

  years.forEach((year) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = year;
    button.addEventListener('click', () => {
      document.querySelector(`[data-year-anchor="${year}"]`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    });
    timelineEl.appendChild(button);
  });
}

function render(items) {
  listEl.innerHTML = '';
  const anchoredYears = new Set();

  items.forEach((post) => {
    const year = (post.date || '').slice(0, 4);
    const li = document.createElement('li');
    li.className = 'archiveItem';
    if (year && !anchoredYears.has(year)) {
      li.setAttribute('data-year-anchor', year);
      anchoredYears.add(year);
    }

    const date = document.createElement('div');
    date.className = 'd';
    date.textContent = fmtDate(post.date);

    const content = document.createElement('div');
    const link = document.createElement('a');
    link.href = `index.html#${post.id}`;

    const title = document.createElement('div');
    title.className = 't';
    title.textContent = post.title;

    const excerpt = document.createElement('div');
    excerpt.className = 'e';
    excerpt.textContent = post.excerpt || '';

    link.appendChild(title);
    content.append(link, excerpt);
    li.append(date, content);
    listEl.appendChild(li);
  });

  countEl.textContent = `${items.length} yazı · yeni -> eski`;
}

function applyFilter() {
  const query = (qEl.value || '').trim().toLowerCase();
  if (!query) {
    render(POSTS);
    return;
  }
  render(POSTS.filter((post) => (post.title || '').toLowerCase().includes(query)));
}

async function loadArchive() {
  try {
    countEl.textContent = 'Yükleniyor...';
    const { data, error } = await supabase
      .from('posts')
      .select('id,title,date,content_html,status')
      .eq('status', 'published')
      .order('date', { ascending: false });

    if (error) throw error;

    POSTS = (data || []).map((post) => ({
      id: post.id,
      title: post.title,
      date: post.date,
      excerpt: stripHtml(post.content_html).slice(0, 170)
    }));

    buildTimeline(POSTS);
    render(POSTS);
  } catch (error) {
    console.error(error);
    countEl.textContent = 'Arşiv yüklenemedi.';
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

loadArchive();
