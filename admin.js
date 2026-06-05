import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import { sanitizeHtml } from "./content-utils.js";

const SUPABASE_URL = "https://zefzcmrsdvtbliguqedi.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_vGfAuyo4h18I-Pqmt25N0Q_OkEtlazb";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const $ = (id) => document.getElementById(id);

const elEmail = $("email");
const elPass = $("password");
const loginBtn = $("loginBtn");
const logoutBtn = $("logoutBtn");
const authStatus = $("authStatus");
const elId = $("id");
const elTitle = $("title");
const elDate = $("date");
const elType = $("type");
const saveDraftBtn = $("saveDraftBtn");
const publishBtn = $("publishBtn");
const unpublishBtn = $("unpublishBtn");
const deleteBtn = $("deleteBtn");
const newBtn = $("newBtn");
const previewBtn = $("previewBtn");
const msg = $("msg");
const counter = $("counter");
const preview = $("preview");
const postsList = $("postsList");

const Block = Quill.import("blots/block");
Block.tagName = "p";
Quill.register(Block, true);

const quill = new Quill("#editor", {
  theme: "snow",
  placeholder: "Yazını buraya yaz. Enter yeni paragraf, Shift+Enter satır kırar.",
  modules: {
    toolbar: "#toolbar",
    clipboard: { matchVisual: false }
  }
});

function setMsg(text = "") {
  msg.textContent = text;
}

function isValidId(value) {
  return /^[a-z0-9-]{2,80}$/i.test(value);
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replaceAll("ı", "i")
    .replaceAll("ğ", "g")
    .replaceAll("ü", "u")
    .replaceAll("ş", "s")
    .replaceAll("ö", "o")
    .replaceAll("ç", "c")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function cleanEditorHtml(html) {
  const doc = document.implementation.createHTMLDocument("");
  doc.body.innerHTML = html;

  doc.body.querySelectorAll("script, style, iframe, object, embed, form, input, button").forEach((node) => node.remove());

  doc.body.querySelectorAll("span").forEach((span) => {
    if (!span.getAttribute("style") && !span.getAttribute("class")) {
      span.replaceWith(...span.childNodes);
    }
  });

  doc.body.querySelectorAll("p, h1, h2, h3, blockquote, li").forEach((node) => {
    node.innerHTML = node.innerHTML
      .replace(/(&nbsp;|\u00a0)+/g, " ")
      .replace(/<br\s*\/?>(\s*<br\s*\/?>)+/gi, "<br>");
  });

  doc.body.querySelectorAll("p").forEach((p) => {
    const onlyBreak = p.innerHTML.replace(/\s|&nbsp;|<br\s*\/?>/gi, "");
    if (!onlyBreak) p.remove();
  });

  doc.body.querySelectorAll("a").forEach((a) => {
    const href = a.getAttribute("href") || "";
    if (!/^https?:\/\//i.test(href) && !/^mailto:/i.test(href)) {
      a.removeAttribute("href");
    } else {
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener noreferrer");
    }
  });

  return sanitizeHtml(doc.body.innerHTML.trim());
}

function getContentHtml() {
  return cleanEditorHtml(quill.root.innerHTML);
}

function updateCounter() {
  const words = quill.getText().trim().split(/\s+/).filter(Boolean).length;
  counter.textContent = `${words} kelime`;
}

function showPreview() {
  const html = getContentHtml();
  preview.innerHTML = html || "<p>Önizleme için içerik yok.</p>";
  preview.classList.toggle("show");
  previewBtn.textContent = preview.classList.contains("show") ? "Önizlemeyi Gizle" : "Önizleme";
}

async function refreshAuthUI() {
  const { data } = await supabase.auth.getSession();
  const user = data?.session?.user;
  authStatus.textContent = user ? `Giriş: ${user.email}` : "Giriş yapılmadı";
  loginBtn.style.display = user ? "none" : "inline-block";
  logoutBtn.style.display = user ? "inline-block" : "none";
}

async function login() {
  setMsg("");
  const email = elEmail.value.trim();
  const password = elPass.value;
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return setMsg("Giriş hatası: " + error.message);
  elPass.value = "";
  await refreshAuthUI();
  await loadPosts();
  setMsg("Giriş başarılı.");
}

async function logout() {
  await supabase.auth.signOut();
  await refreshAuthUI();
  await loadPosts();
  setMsg("Çıkış yapıldı.");
}

function currentFormPost(statusOverride) {
  const id = elId.value.trim();
  const title = elTitle.value.trim();
  const date = elDate.value;
  const type = elType.value;
  const content_html = getContentHtml();
  const plainText = quill.getText().trim();

  if (!isValidId(id)) throw new Error("id/slug sadece harf, sayı ve - içermeli. En az 2 karakter olmalı.");
  if (!title) throw new Error("Başlık boş olamaz.");
  if (!date) throw new Error("Tarih seç.");
  if (!plainText || !content_html) throw new Error("İçerik boş olamaz.");

  return {
    id,
    title,
    date,
    type,
    content_html,
    status: statusOverride ?? "draft",
    updated_at: new Date().toISOString()
  };
}

async function upsertPost(statusOverride) {
  setMsg("");
  try {
    const post = currentFormPost(statusOverride);
    const { error } = await supabase.from("posts").upsert(post, { onConflict: "id" });
    if (error) throw error;
    setMsg(statusOverride === "published" ? "Yayınlandı." : "Taslak kaydedildi.");
    await loadPosts();
  } catch (error) {
    setMsg("Hata: " + (error?.message || error));
  }
}

async function setStatus(status) {
  setMsg("");
  try {
    const id = elId.value.trim();
    if (!isValidId(id)) throw new Error("Geçerli id/slug gir.");
    const { error } = await supabase
      .from("posts")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
    setMsg(status === "published" ? "Yayınlandı." : "Taslağa alındı.");
    await loadPosts();
  } catch (error) {
    setMsg("Hata: " + (error?.message || error));
  }
}

async function deletePost() {
  setMsg("");
  try {
    const id = elId.value.trim();
    if (!isValidId(id)) throw new Error("Geçerli id/slug gir.");
    if (!confirm(`Silinsin mi? (${id})`)) return;
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) throw error;
    clearForm();
    setMsg("Silindi.");
    await loadPosts();
  } catch (error) {
    setMsg("Hata: " + (error?.message || error));
  }
}

function fillForm(post) {
  elId.value = post.id ?? "";
  elTitle.value = post.title ?? "";
  elDate.value = (post.date ?? "").slice(0, 10);
  elType.value = post.type ?? "note";
  quill.root.innerHTML = post.content_html ?? "";
  updateCounter();
  preview.classList.remove("show");
  previewBtn.textContent = "Önizleme";
  setMsg(`Yüklendi: ${post.id} (${post.status})`);
}

function clearForm() {
  elId.value = "";
  elTitle.value = "";
  elDate.value = new Date().toISOString().slice(0, 10);
  elType.value = "note";
  quill.setText("");
  updateCounter();
  preview.classList.remove("show");
  previewBtn.textContent = "Önizleme";
  setMsg("Yeni yazı hazır.");
}

async function loadPosts() {
  postsList.textContent = "Yükleniyor...";
  const { data, error } = await supabase
    .from("posts")
    .select("id,title,date,status,type,updated_at")
    .order("date", { ascending: false });

  if (error) {
    postsList.textContent = "Yazılar yüklenemedi. Giriş gerekli olabilir.";
    console.warn(error);
    return;
  }

  if (!data?.length) {
    postsList.textContent = "Henüz yazı yok.";
    return;
  }

  postsList.classList.remove("muted");
  postsList.innerHTML = data.map((post) => `
    <div class="item">
      <div>
        <div><strong>${escapeHtml(post.title)}</strong></div>
        <div class="muted">${escapeHtml(post.id)} · ${String(post.date).slice(0, 10)} · ${escapeHtml(post.type)}</div>
        <div class="statusDot ${post.status === "published" ? "published" : ""}">${escapeHtml(post.status)}</div>
      </div>
      <div><button data-edit="${escapeHtml(post.id)}" class="ghost">Düzenle</button></div>
    </div>
  `).join("");

  postsList.querySelectorAll("button[data-edit]").forEach((button) => {
    button.addEventListener("click", async () => {
      const id = button.getAttribute("data-edit");
      const { data: row, error: readError } = await supabase.from("posts").select("*").eq("id", id).single();
      if (readError) return setMsg("Hata: " + readError.message);
      fillForm(row);
    });
  });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

let slugTouched = false;
elId.addEventListener("input", () => { slugTouched = true; });
elTitle.addEventListener("input", () => {
  if (!slugTouched && !elId.value.trim()) elId.value = slugify(elTitle.value);
});
quill.on("text-change", updateCounter);

loginBtn.addEventListener("click", login);
logoutBtn.addEventListener("click", logout);
saveDraftBtn.addEventListener("click", () => upsertPost("draft"));
publishBtn.addEventListener("click", () => upsertPost("published"));
unpublishBtn.addEventListener("click", () => setStatus("draft"));
deleteBtn.addEventListener("click", deletePost);
newBtn.addEventListener("click", clearForm);
previewBtn.addEventListener("click", showPreview);

elDate.value = new Date().toISOString().slice(0, 10);
updateCounter();
await refreshAuthUI();
await loadPosts();
