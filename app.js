import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { htmlToText, setSanitizedContent } from './content-utils.js';

const SUPABASE_URL = 'https://zefzcmrsdvtbliguqedi.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_vGfAuyo4h18I-Pqmt25N0Q_OkEtlazb';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const SITE_URL = 'https://osmanesad.com';
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
const pageDescription = document.querySelector('meta[name="description"]');
const canonicalLink = document.querySelector('link[rel="canonical"]');
const ogTitle = document.querySelector('meta[property="og:title"]');
const ogDescription = document.querySelector('meta[property="og:description"]');
const ogUrl = document.querySelector('meta[property="og:url"]');
const twitterTitle = document.querySelector('meta[name="twitter:title"]');
const twitterDescription = document.querySelector('meta[name="twitter:description"]');

let posts = [];
const root = document.documentElement;
const READER_FONT_KEY = 'reader_font_size';
const READER_FONT_MIN = 17;
const READER_FONT_MAX = 23;
const DEFAULT_TITLE = 'Osman Esad - Ana Sayfa';
const DEFAULT_DESCRIPTION =
  'Osman Esad’in yazı, kod, arşiv ve hakkında bölümlerine açılan karşılama sayfası.';

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

function excerptFrom(html) {
  const plain = htmlToText(html);
  if (!plain) return 'Detaylı okumak için arşive geç.';
  return plain.length > 150 ? `${plain.slice(0, 147)}...` : plain;
}

function entryHref(post) {
  return `index.html#${post.id}`;
}

function setMetaContent(element, content) {
  if (element && content) {
    element.setAttribute('content', content);
  }
}

function syncPageMeta(post) {
  if (!post) {
    document.title = DEFAULT_TITLE;
    if (pageDescription) pageDescription.setAttribute('content', DEFAULT_DESCRIPTION);
    if (canonicalLink) canonicalLink.setAttribute('href', `${SITE_URL}/`);
    setMetaContent(ogTitle, DEFAULT_TITLE);
    setMetaContent(ogDescription, DEFAULT_DESCRIPTION);
    setMetaContent(ogUrl, `${SITE_URL}/`);
    setMetaContent(twitterTitle, DEFAULT_TITLE);
    setMetaContent(twitterDescription, DEFAULT_DESCRIPTION);
    return;
  }

  const title = `${post.title} | Osman Esad`;
  const description = excerptFrom(post.content_html);
  const url = `${SITE_URL}/index.html#${post.id}`;

  document.title = title;
  if (pageDescription) pageDescription.setAttribute('content', description);
  if (canonicalLink) canonicalLink.setAttribute('href', url);
  setMetaContent(ogTitle, title);
  setMetaContent(ogDescription, description);
  setMetaContent(ogUrl, url);
  setMetaContent(twitterTitle, title);
  setMetaContent(twitterDescription, description);
}

function scrollReaderIntoView(behavior = 'smooth') {
  if (!readerShell) return;
  readerShell.scrollIntoView({ behavior, block: 'start' });
}

function createPostLink(post) {
  const a = document.createElement('a');
  const title = document.createElement('span');
  const date = document.createElement('span');

  a.href = entryHref(post);
  title.className = 'homeListTitle';
  date.className = 'homeListDate';
  title.textContent = post.title;
  date.textContent = fmtDate(post.date);

  a.append(title, date);
  return a;
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
    li.appendChild(createPostLink(post));
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
      li.appendChild(createPostLink(post));
      readerPostList.appendChild(li);
    });
}

function renderReader(postId, options = {}) {
  const { scrollBehavior = 'auto' } = options;
  const post = posts.find((item) => item.id === postId);

  if (!post) {
    readerTitle.textContent = 'Yazı bulunamadı';
    readerDate.textContent = '';
    setSanitizedContent(
      readerContent,
      '',
      '<p>İstenen yazı bulunamadı. Arşivden başka bir yazı açabilirsin.</p>'
    );
    readerPostList.innerHTML = '';
    syncPageMeta(null);
    toggleView(true);
    scrollReaderIntoView(scrollBehavior);
    return;
  }

  readerTitle.textContent = post.title;
  readerDate.textContent = fmtDate(post.date);
  setSanitizedContent(readerContent, post.content_html, '<p>Bu yazı için içerik bulunamadı.</p>');
  renderReaderList(post.id);
  syncPageMeta(post);
  toggleView(true);
  scrollReaderIntoView(scrollBehavior);
}

function renderHome() {
  renderFeatured(posts[0]);
  renderList(posts.slice(1, MAX_POSTS + 1));
  syncPageMeta(null);
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

fetch('./version.txt')
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
  syncPageMeta(null);
  toggleView(false);
  console.error(error);
});
