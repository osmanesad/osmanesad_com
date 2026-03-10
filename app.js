import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://zefzcmrsdvtbliguqedi.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_vGfAuyo4h18I-Pqmt25N0Q_OkEtlazb';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const MAX_POSTS = 6;

const homeHero = document.querySelector('.homeHero');
const quickGrid = document.querySelector('.quickGrid');
const homeContent = document.querySelector('.homeContent');
const readerShell = document.getElementById('readerShell');
const readerTitle = document.getElementById('readerTitle');
const readerDate = document.getElementById('readerDate');
const readerContent = document.getElementById('readerContent');
const readerPostList = document.getElementById('readerPostList');
const readerFontDown = document.getElementById('readerFontDown');
const readerFontUp = document.getElementById('readerFontUp');
const readerFontReset = document.getElementById('readerFontReset');
const featuredEntry = document.getElementById('featuredEntry');
const featuredDate = document.getElementById('featuredDate');
const featuredTitle = document.getElementById('featuredTitle');
const featuredExcerpt = document.getElementById('featuredExcerpt');
const latestPosts = document.getElementById('latestPosts');
const randomEntryBtn = document.getElementById('randomEntry');
const buildBadge = document.getElementById('buildBadge');
const toTopBtn = document.getElementById('toTop');

let posts = [];
const root = document.documentElement;
const READER_FONT_KEY = 'reader_font_size';
const READER_FONT_MIN = 17;
const READER_FONT_MAX = 23;

function setReaderFontSize(size) {
  const clamped = Math.max(READER_FONT_MIN, Math.min(READER_FONT_MAX, size));
  root.style.setProperty('--readerFontSize', `${clamped}px`);
  try {
    localStorage.setItem(READER_FONT_KEY, String(clamped));
  } catch (_) {}
}

function initReaderFontSize() {
  try {
    const saved = parseInt(localStorage.getItem(READER_FONT_KEY) || '19', 10);
    setReaderFontSize(Number.isNaN(saved) ? 19 : saved);
  } catch (_) {
    setReaderFontSize(19);
  }
}

function currentPostId() {
  return window.location.hash.replace('#', '').trim();
}

function fmtDate(iso) {
  if (!iso) return '';

  try {
    const date = new Date(`${iso}T00:00:00`);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return iso;
  }
}

function stripHtml(html) {
  if (!html) return '';
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return (tmp.textContent || tmp.innerText || '').replace(/\s+/g, ' ').trim();
}

function excerptFrom(html) {
  const plain = stripHtml(html);
  if (!plain) return 'Detaylı okumak için arşive geç.';
  return plain.length > 150 ? `${plain.slice(0, 147)}...` : plain;
}

function entryHref(post) {
  return `index.html#${post.id}`;
}

function scrollReaderIntoView(behavior = 'smooth') {
  if (!readerShell) return;
  readerShell.scrollIntoView({ behavior, block: 'start' });
}

function renderFeatured(post) {
  if (!post) {
    featuredTitle.textContent = 'Henüz yazı yok';
    featuredDate.textContent = '';
    featuredExcerpt.textContent = 'Yeni içerikler eklendiğinde burada gösterilecek.';
    featuredEntry.href = 'archive.html';
    return;
  }

  featuredEntry.href = entryHref(post);
  featuredDate.textContent = fmtDate(post.date);
  featuredTitle.textContent = post.title;
  featuredExcerpt.textContent = excerptFrom(post.content_html);
}

function renderList(items) {
  latestPosts.innerHTML = '';

  if (!items.length) {
    const empty = document.createElement('p');
    empty.className = 'homeEmpty';
    empty.textContent = 'Gösterilecek yazı bulunamadı.';
    latestPosts.appendChild(empty);
    return;
  }

  items.forEach((post) => {
    const li = document.createElement('li');
    li.className = 'homeListItem';

    const a = document.createElement('a');
    a.href = entryHref(post);
    a.innerHTML = `
      <span class="homeListTitle">${post.title}</span>
      <span class="homeListDate">${fmtDate(post.date)}</span>
    `;

    li.appendChild(a);
    latestPosts.appendChild(li);
  });
}

function toggleView(isReader) {
  if (homeHero) homeHero.hidden = isReader;
  if (quickGrid) quickGrid.hidden = isReader;
  if (homeContent) homeContent.hidden = isReader;
  if (readerShell) readerShell.hidden = !isReader;
}

function renderReaderList(activeId) {
  readerPostList.innerHTML = '';

  posts
    .filter((post) => post.id !== activeId)
    .slice(0, MAX_POSTS)
    .forEach((post) => {
      const li = document.createElement('li');
      li.className = 'homeListItem';

      const a = document.createElement('a');
      a.href = entryHref(post);
      a.innerHTML = `
        <span class="homeListTitle">${post.title}</span>
        <span class="homeListDate">${fmtDate(post.date)}</span>
      `;

      li.appendChild(a);
      readerPostList.appendChild(li);
    });
}

function renderReader(postId, options = {}) {
  const { scrollBehavior = 'auto' } = options;
  const post = posts.find((item) => item.id === postId);

  if (!post) {
    readerTitle.textContent = 'Yazı bulunamadı';
    readerDate.textContent = '';
    readerContent.innerHTML = '<p>İstenen yazı bulunamadı. Arşivden başka bir yazı açabilirsin.</p>';
    readerPostList.innerHTML = '';
    toggleView(true);
    scrollReaderIntoView(scrollBehavior);
    return;
  }

  readerTitle.textContent = post.title;
  readerDate.textContent = fmtDate(post.date);
  readerContent.innerHTML = post.content_html || '<p>Bu yazı için içerik bulunamadı.</p>';
  renderReaderList(post.id);
  toggleView(true);
  scrollReaderIntoView(scrollBehavior);
}

function renderHome() {
  renderFeatured(posts[0]);
  renderList(posts.slice(1, MAX_POSTS + 1));
  toggleView(false);
}

function syncView() {
  const postId = currentPostId();
  if (postId) {
    renderReader(postId, { scrollBehavior: 'auto' });
    return;
  }

  renderHome();
}

async function loadPosts() {
  const { data, error } = await supabase
    .from('posts')
    .select('id,title,date,content_html,status')
    .eq('status', 'published')
    .order('date', { ascending: false });

  if (error) throw error;

  posts = data || [];
  syncView();
}

if (randomEntryBtn) {
  randomEntryBtn.addEventListener('click', () => {
    if (!posts.length) {
      window.location.href = 'archive.html';
      return;
    }

    const pick = posts[Math.floor(Math.random() * posts.length)];
    window.location.href = entryHref(pick);
  });
}

if (readerFontDown) {
  readerFontDown.addEventListener('click', () => {
    const current = parseInt(getComputedStyle(root).getPropertyValue('--readerFontSize'), 10) || 19;
    setReaderFontSize(current - 1);
  });
}

if (readerFontUp) {
  readerFontUp.addEventListener('click', () => {
    const current = parseInt(getComputedStyle(root).getPropertyValue('--readerFontSize'), 10) || 19;
    setReaderFontSize(current + 1);
  });
}

if (readerFontReset) {
  readerFontReset.addEventListener('click', () => {
    setReaderFontSize(19);
  });
}

window.addEventListener('hashchange', () => {
  const postId = currentPostId();
  if (postId) {
    renderReader(postId, { scrollBehavior: 'smooth' });
    return;
  }

  renderHome();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

if (toTopBtn) {
  const toggleToTop = () => {
    toTopBtn.classList.toggle('show', window.scrollY > 500);
  };

  window.addEventListener('scroll', toggleToTop, { passive: true });
  toggleToTop();

  toTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

fetch('/version.txt')
  .then((response) => response.text())
  .then((text) => {
    buildBadge.hidden = false;
    buildBadge.textContent = text.trim();
  })
  .catch(() => {});

initReaderFontSize();

loadPosts().catch((error) => {
  renderFeatured(null);
  renderList([]);
  toggleView(false);
  console.error(error);
});
