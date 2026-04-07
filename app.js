import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { setSanitizedContent } from './content-utils.js';

const SUPABASE_URL = 'https://zefzcmrsdvtbliguqedi.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_vGfAuyo4h18I-Pqmt25N0Q_OkEtlazb';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Sidebar\'da gösterilecek maksimum yazı sayısı
const TOP_N = 9;

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
  "Osman Esad'in yazı, kod, arşiv ve hakkında bölümlerine açılan karşılama sayfası.";

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
  return id;
}

// Theme + font size
const THEMES = {
  white: {
    bg: '#ffffff',
    text: '#111111',
    muted: '#5d2424',
    line: '#e7e7e7',
    chip: '#f4f4f4',
    chipText: '#111',
    shadow: 'rgba(0,0,0,0.04)'
  },
  sepia: {
    bg: '#f6f1e5',
    text: '#1a1a1a',
    muted: '#6b5f55',
    line: '#e7ddcf',
    chip: '#efe6d7',
    chipText: '#1a1a1a',
    shadow: 'rgba(0,0,0,0.04)'
  },
  gray: {
    bg: '#f1f1f1',
    text: '#111111',
    muted: '#6b6b6b',
    line: '#dedede',
    chip: '#e9e9e9',
    chipText: '#111',
    shadow: 'rgba(0,0,0,0.04)'
  },
  dark: {
    bg: '#0e0f12',
    text: '#f3f4f6',
    muted: '#a1a1aa',
    line: '#22242a',
    chip: '#17181d',
    chipText: '#f3f4f6',
    shadow: 'rgba(0,0,0,0.25)'
  }
};
const root = document.documentElement;

function applyTheme(name) {
  const t = THEMES[name] || THEMES.white;
  root.style.setProperty('--bg', t.bg);
  root.style.setProperty('--text', t.text);
  root.style.setProperty('--muted', t.muted);
  root.style.setProperty('--line', t.line);
  root.style.setProperty('--chip', t.chip);
  root.style.setProperty('--chipText', t.chipText);
  root.style.setProperty('--shadow', t.shadow);

  document
    .querySelectorAll('.dot')
    .forEach((d) => d.setAttribute('aria-pressed', 'false'));
  const idMap = { white: 't-white', sepia: 't-sepia', gray: 't-gray', dark: 't-dark' };
  const btn = document.getElementById(idMap[name]);
  if (btn) btn.setAttribute('aria-pressed', 'true');

  localStorage.setItem('read_theme', name);
}

const MIN = 16,
  MAX = 22;
function setFontSize(px) {
  const clamped = Math.max(MIN, Math.min(MAX, px));
  root.style.setProperty('--fontSize', clamped + 'px');
  localStorage.setItem('read_font', String(clamped));
}

document.getElementById('decrease').addEventListener('click', () => {
  const current = parseInt(getComputedStyle(root).getPropertyValue('--fontSize')) || 18;
  setFontSize(current - 1);
});
document.getElementById('increase').addEventListener('click', () => {
  const current = parseInt(getComputedStyle(root).getPropertyValue('--fontSize')) || 18;
  setFontSize(current + 1);
});

document.getElementById('t-white').addEventListener('click', () => applyTheme('white'));
document.getElementById('t-sepia').addEventListener('click', () => applyTheme('sepia'));
document.getElementById('t-gray').addEventListener('click', () => applyTheme('gray'));
document.getElementById('t-dark').addEventListener('click', () => applyTheme('dark'));

applyTheme(localStorage.getItem('read_theme') || 'white');
setFontSize(parseInt(localStorage.getItem('read_font') || '18', 10));

// DOM
const postListEl = document.getElementById('postList');
const titleEl = document.getElementById('title');
const dateEl = document.getElementById('dateLine');
const contentEl = document.getElementById('content');
const welcomeArchiveMetaEl = document.getElementById('welcomeArchiveMeta');
const welcomeProjectsMetaEl = document.getElementById('welcomeProjectsMeta');

function fmtDate(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return iso;
  }
}

function updateWelcomeMeta(posts) {
  if (welcomeArchiveMetaEl && posts[0]) {
    welcomeArchiveMetaEl.textContent = `En son: ${posts[0].title} · ${fmtDate(posts[0].date)}`;
  }

  if (!welcomeProjectsMetaEl) return;

  fetch('https://api.github.com/users/osmanesad/repos?per_page=1&sort=pushed', {
    headers: { Accept: 'application/vnd.github+json' }
  })
    .then((res) => {
      if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
      return res.json();
    })
    .then((repos) => {
      const repo = (repos || []).find((item) => !item.fork && !item.archived) || repos?.[0];
      if (!repo) return;
      const lang = repo.language ? ` · ${repo.language}` : '';
      welcomeProjectsMetaEl.textContent = `Son çalışma: ${repo.name}${lang}`;
    })
    .catch(() => {});
}

// Like per post (local)
const likeBtn = document.getElementById('likeBtn');
const likeCountEl = document.getElementById('likeCount');
const Like = {
  postId: null,
  keyLiked() {
    return `liked_once_v1::${this.postId}`;
  },

  async fetchCount() {
    const { data, error } = await supabase
      .from('post_likes')
      .select('likes_count')
      .eq('slug', this.postId)
      .maybeSingle();
    if (error) throw error;
    return data?.likes_count ?? 0;
  },

  async render() {
    const liked = localStorage.getItem(this.keyLiked()) === '1';
    likeBtn.classList.toggle('liked', liked);

    try {
      const count = await this.fetchCount();
      likeCountEl.textContent = String(count);
    } catch (e) {
      console.warn('Like fetch failed:', e);
      // fallback (keeps UI stable if network fails)
      likeCountEl.textContent = likeCountEl.textContent || '0';
    }
  },

  setPost(id) {
    this.postId = id;
    this.render();
  },

  async likeOnce() {
    const liked = localStorage.getItem(this.keyLiked()) === '1';
    if (liked) return;

    try {
      const { data, error } = await supabase.rpc('like_once', {
        p_slug: this.postId,
        p_visitor_id: getVisitorId()
      });
      if (error) throw error;
      likeCountEl.textContent = String(data);
      localStorage.setItem(this.keyLiked(), '1');
      likeBtn.classList.add('liked');
    } catch (e) {
      console.warn('Like failed:', e);
    }
  }
};
likeBtn.addEventListener('click', () => Like.likeOnce());

// Share current hash URL
const shareBtn = document.getElementById('shareBtn');
shareBtn.addEventListener('click', async () => {
  const url = window.location.href;
  const title = document.title + ' — ' + (titleEl.textContent || 'Yazı');
  try {
    if (navigator.share) {
      await navigator.share({ title, url });
    } else {
      await navigator.clipboard.writeText(url);
      const original = shareBtn.innerHTML;
      shareBtn.textContent = 'Kopyalandı';
      setTimeout(() => {
        shareBtn.innerHTML = original;
      }, 900);
    }
  } catch (e) {}
});

// Data
let POSTS = [];

function renderSidebar(activeId) {
  postListEl.innerHTML = '';
  const top = POSTS.slice(0, TOP_N);
  top.forEach((p) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.className = 'postLink';
    a.href = '#' + p.id;
    a.setAttribute('aria-current', p.id === activeId ? 'true' : 'false');
    const title = document.createElement('div');
    title.textContent = p.title;
    const meta = document.createElement('span');
    meta.className = 'postMeta';
    meta.textContent = fmtDate(p.date);
    a.append(title, meta);
    li.appendChild(a);
    postListEl.appendChild(li);
  });

  const li = document.createElement('li');
  const a = document.createElement('a');
  a.className = 'postLink';
  a.href = 'archive.html';
  const label = document.createElement('div');
  label.textContent = '→ Tümü / Arşiv';
  const meta = document.createElement('span');
  meta.className = 'postMeta';
  meta.textContent = `${POSTS.length} yazı`;
  a.append(label, meta);
  li.appendChild(a);
  postListEl.appendChild(li);
}

function setActivePost(id) {
  const p = POSTS.find((x) => x.id === id) || POSTS[0];
  if (!p) {
    titleEl.textContent = 'Yazı bulunamadı';
    contentEl.innerHTML = '';
    return;
  }
  titleEl.textContent = p.title;
  dateEl.textContent = fmtDate(p.date);
  setSanitizedContent(contentEl, p.content, '<p>İçerik bulunamadı.</p>');
  Like.setPost(p.id);
  renderSidebar(p.id);
  window.scrollTo({ top: 0, behavior: 'auto' });
}

async function load() {
  // Supabase'ten sadece yayındaki (published) yazıları çek
  const { data, error } = await supabase
    .from('posts')
    .select('id,title,date,type,content_html,status')
    .eq('status', 'published')
    .order('date', { ascending: false });

  if (error) throw error;

  POSTS = (data || []).map((p) => ({
    id: p.id,
    title: p.title,
    date: p.date,
    type: p.type,
    content: p.content_html
  }));

  const id = location.hash.replace('#', '').trim() || (POSTS[0] && POSTS[0].id);
  updateWelcomeMeta(POSTS);
  renderSidebar(id);
  setActivePost(id);
}

window.addEventListener('hashchange', () =>
  setActivePost(location.hash.replace('#', '').trim())
);

document.getElementById('randomBtn').addEventListener('click', () => {
  if (!POSTS.length) return;
  const pick = POSTS[Math.floor(Math.random() * POSTS.length)];
  location.hash = pick.id;
});

load().catch((err) => {
  titleEl.textContent = 'Yükleme hatası';
  contentEl.innerHTML = '<p>Yazılar yüklenemedi. Lütfen tekrar deneyin.</p>';
  console.error(err);
});

// --- Scroll to top (Index) ---
const toTopBtn = document.getElementById('toTop');
if (toTopBtn) {
  const toggle = () => {
    toTopBtn.classList.toggle('show', window.scrollY > 500);
  };
  window.addEventListener('scroll', toggle, { passive: true });
  toggle();

  toTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

fetch('/version.txt')
  .then((r) => r.text())
  .then((t) => (document.getElementById('betaBadge').textContent = t.trim()))
  .catch(() => {});
