import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { setSanitizedContent } from './content-utils.js';

const SUPABASE_URL = 'https://zefzcmrsdvtbliguqedi.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_vGfAuyo4h18I-Pqmt25N0Q_OkEtlazb';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Sidebar\'da gösterilecek maksimum yazı sayısı
const TOP_N = 9;

function getVisitorId() {
  const key = 'visitor_id_v1';
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

// Theme + font size
const THEMES = {
  white: {
    bg: '#ffffff',
    text: '#121212',
    muted: '#6f6f6f',
    line: '#e9e6e2',
    chip: '#faf9f7',
    chipText: '#121212',
    soft: '#faf9f7',
    orangeSoft: '#fff1e8',
    shadow: 'rgba(0,0,0,0.04)'
  },
  sepia: {
    bg: '#faf7f2',
    text: '#151515',
    muted: '#706861',
    line: '#e9e1d8',
    chip: '#fff1e8',
    chipText: '#1a1a1a',
    soft: '#fffaf5',
    orangeSoft: '#ffeadc',
    shadow: 'rgba(0,0,0,0.04)'
  },
  gray: {
    bg: '#f5f5f5',
    text: '#121212',
    muted: '#6f6f6f',
    line: '#dedede',
    chip: '#ffffff',
    chipText: '#121212',
    soft: '#ffffff',
    orangeSoft: '#fff1e8',
    shadow: 'rgba(0,0,0,0.04)'
  },
  dark: {
    bg: '#0e0f12',
    text: '#f3f4f6',
    muted: '#a1a1aa',
    line: '#22242a',
    chip: '#17181d',
    chipText: '#f3f4f6',
    soft: '#17181d',
    orangeSoft: '#2a1811',
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
  root.style.setProperty('--soft', t.soft);
  root.style.setProperty('--orange-soft', t.orangeSoft);
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

function getEscapedId(id) {
  if (window.CSS && typeof CSS.escape === 'function') {
    return CSS.escape(id);
  }
  return id.replace(/(["'\\#.;?+*~:\[\]=>\|\^\$])/g, "\\$1");
}

function handleInternalScroll(event) {
  if (!(event.target instanceof Element)) return;

  const anchor = event.target.closest('a.internal-scroll[href^="#"]');
  if (!anchor || !contentEl.contains(anchor)) return;

  event.preventDefault();
  event.stopPropagation();

  const href = anchor.getAttribute('href') || '';
  const targetId = href.slice(1);
  if (!targetId) return;

  const selector = '#' + getEscapedId(targetId);
  let attempts = 0;

  function scrollToTarget() {
    const target = contentEl.querySelector(selector);
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
      return;
    }

    if (attempts < 10) {
      attempts++;
      setTimeout(scrollToTarget, 100);
    }
  }

  scrollToTarget();
}

function cleanupContentListeners() {
  contentEl.removeEventListener('click', handleInternalScroll);
  window.removeEventListener('beforeunload', cleanupContentListeners);
}
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
    welcomeArchiveMetaEl.textContent = `Son not: ${posts[0].title} · ${fmtDate(posts[0].date)}`;
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
      welcomeProjectsMetaEl.textContent = `Son güncellenen proje: ${repo.name}${lang}`;
    })
    .catch(() => {});
}

// Like per post (local)
const likeBtn = document.getElementById('likeBtn');
const likeCountEl = document.getElementById('likeCount');
const likeTextEl = likeBtn?.querySelector('.likeText');
const Like = {
  postId: null,
  busy: false,
  keyLiked() {
    return `liked_once_v1::${this.postId}`;
  },

  setBusy(isBusy) {
    this.busy = isBusy;
    likeBtn.classList.toggle('isLoading', isBusy);
    likeBtn.disabled = isBusy;
  },

  updateState({ liked, count, label }) {
    likeBtn.classList.toggle('liked', liked);
    likeBtn.setAttribute('aria-pressed', liked ? 'true' : 'false');
    likeBtn.setAttribute('aria-label', liked ? 'Bu notu beğendin' : 'Bu notu beğen');
    likeBtn.title = liked ? 'Bu notu beğendin' : 'Bu notu beğen';
    if (likeTextEl) likeTextEl.textContent = label || (liked ? 'Beğenildi' : 'Beğen');
    if (count !== undefined) likeCountEl.textContent = String(count);
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
    this.updateState({ liked, label: liked ? 'Beğenildi' : 'Beğen' });

    try {
      const count = await this.fetchCount();
      this.updateState({ liked, count });
    } catch (e) {
      console.warn('Like fetch failed:', e);
      // fallback (keeps UI stable if network fails)
      likeCountEl.textContent = likeCountEl.textContent || '0';
    }
  },

  setPost(id) {
    this.postId = id;
    this.setBusy(false);
    this.render();
  },

  async likeOnce() {
    if (!this.postId || this.busy) return;
    const liked = localStorage.getItem(this.keyLiked()) === '1';
    if (liked) {
      this.updateState({ liked: true, label: 'Beğenildi' });
      return;
    }

    try {
      this.setBusy(true);
      const { data, error } = await supabase.rpc('like_once', {
        p_slug: this.postId,
        p_visitor_id: getVisitorId()
      });
      if (error) throw error;
      localStorage.setItem(this.keyLiked(), '1');
      this.updateState({ liked: true, count: data ?? likeCountEl.textContent, label: 'Beğenildi' });
    } catch (e) {
      console.warn('Like failed:', e);
      if (likeTextEl) {
        const current = likeTextEl.textContent;
        likeTextEl.textContent = 'Tekrar dene';
        setTimeout(() => {
          if (!likeBtn.classList.contains('liked')) likeTextEl.textContent = current || 'Beğen';
        }, 1200);
      }
    } finally {
      this.setBusy(false);
    }
  }
};
likeBtn.addEventListener('click', () => Like.likeOnce());

// Share current hash URL
const shareBtn = document.getElementById('shareBtn');
shareBtn.addEventListener('click', async () => {
  const url = window.location.href;
  const title = document.title + ' — ' + (titleEl.textContent || 'Not');
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
  label.textContent = 'Tüm arşivi aç';
  const meta = document.createElement('span');
  meta.className = 'postMeta';
  meta.textContent = `${POSTS.length} not`;
  a.append(label, meta);
  li.appendChild(a);
  postListEl.appendChild(li);
}

function setActivePost(id) {
  const p = POSTS.find((x) => x.id === id) || POSTS[0];
  if (!p) {
    titleEl.textContent = 'Not bulunamadı';
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
  // Supabase'ten sadece yayındaki notları çek.
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('status', 'published')
    .order('date', { ascending: false });

  if (error) throw error;

  POSTS = (data || []).map((p) => ({
    id: p.id,
    title: p.title,
    date: p.date,
    type: p.type,
    content: p.content_html ?? p.text ?? p.post ?? ""
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
  contentEl.innerHTML = '<p>Notlar yüklenemedi. Lütfen tekrar deneyin.</p>';
  console.error(err);
});

contentEl.addEventListener('pointerup', handleInternalScroll);
window.addEventListener('beforeunload', cleanupContentListeners);

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
