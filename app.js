import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { setSanitizedContent } from './content-utils.js';

const SUPABASE_URL = 'https://zefzcmrsdvtbliguqedi.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_vGfAuyo4h18I-Pqmt25N0Q_OkEtlazb';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const latestPostsEl = document.getElementById('latestPosts');
const readerShell = document.getElementById('okuma');
const readerTitle = document.getElementById('readerTitle');
const readerDate = document.getElementById('readerDate');
const readerContent = document.getElementById('readerContent');
const readerFontDown = document.getElementById('readerFontDown');
const readerFontUp = document.getElementById('readerFontUp');
const readerFontReset = document.getElementById('readerFontReset');
const likeBtn = document.getElementById('likeBtn');
const likeCountEl = document.getElementById('likeCount');
const shareBtn = document.getElementById('shareBtn');
const toTopBtn = document.getElementById('toTop');
const themeToggle = document.getElementById('themeToggle');

let POSTS = [];
const READER_FONT_KEY = 'reader_font_size';
const THEME_KEY = 'site_theme';

function stripHtml(html) {
  const div = document.createElement('div');
  div.innerHTML = html || '';
  return (div.textContent || div.innerText || '').replace(/\s+/g, ' ').trim();
}

function fmtDate(iso) {
  if (!iso) return '';
  try {
    return new Date(`${iso}T00:00:00`).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  } catch {
    return iso;
  }
}

function setTheme(name) {
  document.body.classList.toggle('theme-dark', name === 'dark');
  try {
    localStorage.setItem(THEME_KEY, name);
  } catch (_) {}
}

function initTheme() {
  let saved = 'light';
  try {
    saved = localStorage.getItem(THEME_KEY) || 'light';
  } catch (_) {}
  setTheme(saved);
}

function setReaderFontSize(size) {
  const clamped = Math.max(17, Math.min(23, size));
  document.documentElement.style.setProperty('--readerFontSize', `${clamped}px`);
  try {
    localStorage.setItem(READER_FONT_KEY, String(clamped));
  } catch (_) {}
}

function getReaderFontSize() {
  const current = getComputedStyle(document.documentElement).getPropertyValue('--readerFontSize');
  return parseInt(current, 10) || 19;
}

function initReaderFontSize() {
  try {
    setReaderFontSize(parseInt(localStorage.getItem(READER_FONT_KEY) || '19', 10));
  } catch (_) {
    setReaderFontSize(19);
  }
}

function renderLatest(posts) {
  if (!latestPostsEl) return;
  latestPostsEl.innerHTML = '';

  posts.slice(0, 3).forEach((post) => {
    const item = document.createElement('li');
    item.className = 'latestItem';

    const time = document.createElement('time');
    time.dateTime = post.date || '';
    time.textContent = fmtDate(post.date).toLocaleUpperCase('tr-TR');

    const rule = document.createElement('span');
    rule.className = 'latestRule';
    rule.setAttribute('aria-hidden', 'true');

    const body = document.createElement('div');
    const link = document.createElement('a');
    link.href = `#${post.id}`;

    const title = document.createElement('h3');
    title.textContent = post.title;

    const excerpt = document.createElement('p');
    excerpt.textContent = `${stripHtml(post.content).slice(0, 130)}...`;

    const read = document.createElement('a');
    read.className = 'textArrow';
    read.href = `#${post.id}`;
    read.textContent = 'Devamını oku';

    link.appendChild(title);
    body.append(link, excerpt, read);
    item.append(time, rule, body);
    latestPostsEl.appendChild(item);
  });
}

function showReader(post) {
  if (!post || !readerShell) return;
  readerShell.hidden = false;
  readerTitle.textContent = post.title;
  readerDate.textContent = fmtDate(post.date);
  setSanitizedContent(readerContent, post.content, '<p>İçerik bulunamadı.</p>');
  Like.setPost(post.id);
  document.title = `${post.title} - Osman Esad`;
  readerShell.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function handleHash() {
  const id = decodeURIComponent(location.hash.replace('#', '').trim());
  if (!id) {
    if (readerShell) readerShell.hidden = true;
    document.title = 'Osman Esad - Yazılar, projeler, notlar';
    return;
  }

  const post = POSTS.find((item) => item.id === id);
  if (post) showReader(post);
}

function getVisitorId() {
  const key = 'visitor_id_v1';
  try {
    let id = localStorage.getItem(key);
    if (!id) {
      id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random());
      localStorage.setItem(key, id);
    }
    return id;
  } catch (_) {
    return 'anonymous';
  }
}

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
    if (!likeBtn || !likeCountEl || !this.postId) return;
    const liked = localStorage.getItem(this.keyLiked()) === '1';
    likeBtn.classList.toggle('liked', liked);
    try {
      likeCountEl.textContent = String(await this.fetchCount());
    } catch (_) {
      likeCountEl.textContent = likeCountEl.textContent || '0';
    }
  },
  setPost(id) {
    this.postId = id;
    this.render();
  },
  async likeOnce() {
    if (!this.postId || localStorage.getItem(this.keyLiked()) === '1') return;
    try {
      const { data, error } = await supabase.rpc('like_once', {
        p_slug: this.postId,
        p_visitor_id: getVisitorId()
      });
      if (error) throw error;
      likeCountEl.textContent = String(data);
      localStorage.setItem(this.keyLiked(), '1');
      likeBtn.classList.add('liked');
    } catch (error) {
      console.warn('Like failed:', error);
    }
  }
};

async function loadPosts() {
  const { data, error } = await supabase
    .from('posts')
    .select('id,title,date,type,content_html,status')
    .eq('status', 'published')
    .order('date', { ascending: false });

  if (error) throw error;

  POSTS = (data || []).map((post) => ({
    id: post.id,
    title: post.title,
    date: post.date,
    type: post.type,
    content: post.content_html
  }));

  renderLatest(POSTS);
  handleHash();
}

initTheme();
initReaderFontSize();

themeToggle?.addEventListener('click', () => {
  const isDark = document.body.classList.contains('theme-dark');
  setTheme(isDark ? 'light' : 'dark');
});

readerFontDown?.addEventListener('click', () => setReaderFontSize(getReaderFontSize() - 1));
readerFontUp?.addEventListener('click', () => setReaderFontSize(getReaderFontSize() + 1));
readerFontReset?.addEventListener('click', () => setReaderFontSize(19));
likeBtn?.addEventListener('click', () => Like.likeOnce());

shareBtn?.addEventListener('click', async () => {
  try {
    if (navigator.share) {
      await navigator.share({ title: document.title, url: location.href });
    } else {
      await navigator.clipboard.writeText(location.href);
      const original = shareBtn.textContent;
      shareBtn.textContent = 'Kopyalandı';
      window.setTimeout(() => {
        shareBtn.textContent = original;
      }, 900);
    }
  } catch (_) {}
});

window.addEventListener('hashchange', handleHash);

if (toTopBtn) {
  const toggle = () => toTopBtn.classList.toggle('show', window.scrollY > 500);
  window.addEventListener('scroll', toggle, { passive: true });
  toggle();
  toTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

fetch('/version.txt')
  .then((response) => response.text())
  .then((text) => {
    const badge = document.getElementById('betaBadge');
    if (badge) badge.textContent = text.trim();
  })
  .catch(() => {});

loadPosts().catch((error) => {
  console.error(error);
  if (latestPostsEl) {
    latestPostsEl.innerHTML = '<li class="latestItem"><div>Yazılar yüklenemedi. Lütfen tekrar deneyin.</div></li>';
  }
});
