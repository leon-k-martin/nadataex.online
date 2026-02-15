/* ── NADAtäx Admin CMS ──────────────────────── */
/* Static CMS using GitHub API — no server needed */

const REPO_OWNER = 'leon-k-martin';
const REPO_NAME  = 'nadataex.online';
const BRANCH     = 'main';
const API_BASE   = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`;

let token = '';

// Tracked file state (sha needed for updates)
let aboutFile   = null;   // { sha, content }
let faqFile     = null;   // { sha, content }
let reviewsFile = null;   // { sha, content (parsed array) }
let copyrightsFile = null; // { sha, content (parsed array) }
let manifestFile   = null; // { sha, content (parsed array) }

let editingReviewIdx = null;  // index or null for new
let editingCopyIdx   = null;  // index or null for new

/* ── Init ──────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const stored = localStorage.getItem('nadataex_token');
  if (stored) { token = stored; tryLogin(); }

  document.getElementById('login-btn').addEventListener('click', () => {
    token = document.getElementById('token-input').value.trim();
    if (!token) return;
    tryLogin();
  });
  document.getElementById('token-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('login-btn').click();
  });
  document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('nadataex_token');
    token = '';
    showScreen('login');
  });

  // Tabs
  document.querySelectorAll('.admin-nav .tab').forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  // About
  document.getElementById('save-about-btn').addEventListener('click', saveAbout);

  // FAQ
  document.getElementById('save-faq-btn').addEventListener('click', saveFaq);
  document.getElementById('faq-image-upload').addEventListener('change', uploadFaqImage);

  // Reviews
  document.getElementById('add-review-btn').addEventListener('click', () => openReviewForm(null));
  document.getElementById('save-review-btn').addEventListener('click', saveReview);
  document.getElementById('cancel-review-btn').addEventListener('click', closeReviewForm);

  // Designs
  document.getElementById('design-image-upload').addEventListener('change', uploadDesignImage);
  document.getElementById('add-copyright-btn').addEventListener('click', () => openCopyrightForm(null));
  document.getElementById('save-copyright-btn').addEventListener('click', saveCopyright);
  document.getElementById('cancel-copyright-btn').addEventListener('click', closeCopyrightForm);
});

/* ── Auth ──────────────────────────────────── */
async function tryLogin() {
  const errorEl = document.getElementById('login-error');
  errorEl.classList.add('hidden');
  try {
    const res = await ghFetch('');
    if (!res.ok) throw new Error('Falsches Passwort. Bitte nochmal versuchen.');
    await res.json();
    localStorage.setItem('nadataex_token', token);
    showScreen('admin');
    loadAll();
  } catch (e) {
    errorEl.textContent = e.message;
    errorEl.classList.remove('hidden');
  }
}

/* ── GitHub API helpers ────────────────────── */
function ghFetch(endpoint, options = {}) {
  return fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      ...(options.headers || {}),
    },
  });
}

async function getFile(path) {
  const res = await ghFetch(`/contents/${path}?ref=${BRANCH}`);
  if (!res.ok) throw new Error(`Datei nicht gefunden: ${path}`);
  const data = await res.json();
  const bytes = Uint8Array.from(atob(data.content.replace(/\n/g, '')), c => c.charCodeAt(0));
  const decoded = new TextDecoder().decode(bytes);
  return { path: data.path, sha: data.sha, content: decoded };
}

async function putFile(path, content, sha, message) {
  const bytes = new TextEncoder().encode(content);
  const base64 = btoa(String.fromCharCode(...bytes));
  const body = { message, content: base64, branch: BRANCH };
  if (sha) body.sha = sha;
  const res = await ghFetch(`/contents/${path}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Speichern fehlgeschlagen');
  }
  return await res.json();
}

async function putBinaryFile(path, base64Content, sha, message) {
  const body = { message, content: base64Content, branch: BRANCH };
  if (sha) body.sha = sha;
  const res = await ghFetch(`/contents/${path}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Upload fehlgeschlagen');
  }
  return await res.json();
}

async function deleteFile(path, sha, message) {
  const res = await ghFetch(`/contents/${path}`, {
    method: 'DELETE',
    body: JSON.stringify({ message, sha, branch: BRANCH }),
  });
  if (!res.ok) throw new Error('Löschen fehlgeschlagen');
}

/* ── Screen / Tab switching ────────────────── */
function showScreen(screen) {
  document.getElementById('login-screen').classList.toggle('hidden', screen !== 'login');
  document.getElementById('admin-screen').classList.toggle('hidden', screen !== 'admin');
}

function switchTab(tabName) {
  document.querySelectorAll('.admin-nav .tab').forEach(t =>
    t.classList.toggle('active', t.dataset.tab === tabName));
  document.querySelectorAll('.tab-panel').forEach(p => {
    const match = p.id === `tab-${tabName}`;
    p.classList.toggle('hidden', !match);
    p.classList.toggle('active', match);
  });
}

/* ── Load all data ─────────────────────────── */
async function loadAll() {
  loadAbout();
  loadFaq();
  loadFaqImages();
  loadReviews();
  loadDesignImages();
  loadCopyrights();
}

/* ── ABOUT ─────────────────────────────────── */
async function loadAbout() {
  const editor = document.getElementById('about-editor');
  editor.value = 'Laden...';
  try {
    aboutFile = await getFile('content/about.md');
    editor.value = aboutFile.content;
  } catch (e) {
    editor.value = '';
    showStatus('about-status', `❌ ${e.message}`, 'error');
  }
}

async function saveAbout() {
  if (!aboutFile) return;
  const content = document.getElementById('about-editor').value;
  try {
    const result = await putFile('content/about.md', content, aboutFile.sha, 'Update about text');
    aboutFile.sha = result.content.sha;
    aboutFile.content = content;
    showStatus('about-status', '✅ Gespeichert!', 'success');
  } catch (e) {
    showStatus('about-status', `❌ ${e.message}`, 'error');
  }
}

/* ── FAQ ───────────────────────────────────── */
async function loadFaq() {
  const editor = document.getElementById('faq-editor');
  editor.value = 'Laden...';
  try {
    faqFile = await getFile('content/faq.md');
    editor.value = faqFile.content;
  } catch (e) {
    editor.value = '';
    showStatus('faq-status', `❌ ${e.message}`, 'error');
  }
}

async function saveFaq() {
  if (!faqFile) return;
  const content = document.getElementById('faq-editor').value;
  try {
    const result = await putFile('content/faq.md', content, faqFile.sha, 'Update FAQ');
    faqFile.sha = result.content.sha;
    faqFile.content = content;
    showStatus('faq-status', '✅ Gespeichert!', 'success');
  } catch (e) {
    showStatus('faq-status', `❌ ${e.message}`, 'error');
  }
}

/* ── FAQ Images ────────────────────────────── */
async function loadFaqImages() {
  const grid = document.getElementById('faq-images');
  grid.innerHTML = '<p>Laden...</p>';
  try {
    const res = await ghFetch(`/contents/static/img/faq?ref=${BRANCH}`);
    if (!res.ok) { grid.innerHTML = '<p>Keine Bilder gefunden.</p>'; return; }
    const files = await res.json();
    const images = files.filter(f => /\.(png|jpe?g|webp|gif)$/i.test(f.name));
    if (images.length === 0) { grid.innerHTML = '<p>Keine Bilder.</p>'; return; }

    grid.innerHTML = images.map(img => `
      <div class="image-card" data-path="${img.path}" data-sha="${img.sha}">
        <img src="../${img.path}" alt="${img.name}" loading="lazy">
        <span class="image-name">${img.name}</span>
        <button class="image-delete" title="Löschen">×</button>
      </div>
    `).join('');

    grid.querySelectorAll('.image-delete').forEach(btn => {
      btn.addEventListener('click', async () => {
        const card = btn.closest('.image-card');
        if (!confirm(`"${card.querySelector('.image-name').textContent}" wirklich löschen?`)) return;
        try {
          await deleteFile(card.dataset.path, card.dataset.sha, `Delete FAQ image ${card.querySelector('.image-name').textContent}`);
          card.remove();
        } catch (e) {
          alert(`Fehler: ${e.message}`);
        }
      });
    });
  } catch (e) {
    grid.innerHTML = `<p class="error">${e.message}</p>`;
  }
}

async function uploadFaqImage(e) {
  const file = e.target.files[0];
  if (!file) return;
  const statusId = 'faq-upload-status';
  showStatus(statusId, '⏳ Hochladen...', 'success');

  try {
    const base64 = await readFileAsBase64(file);
    const path = `static/img/faq/${file.name}`;
    await putBinaryFile(path, base64, null, `Add FAQ image ${file.name}`);
    showStatus(statusId, '✅ Hochgeladen!', 'success');
    e.target.value = '';
    loadFaqImages();
  } catch (err) {
    showStatus(statusId, `❌ ${err.message}`, 'error');
  }
}

/* ── REVIEWS / TESTIMONIALS ────────────────── */
async function loadReviews() {
  const list = document.getElementById('reviews-list');
  list.innerHTML = '<p>Laden...</p>';
  try {
    const file = await getFile('content/reviews.json');
    reviewsFile = { sha: file.sha, content: JSON.parse(file.content) };
    renderReviews();
  } catch (e) {
    list.innerHTML = `<p class="error">${e.message}</p>`;
  }
}

function renderReviews() {
  const list = document.getElementById('reviews-list');
  const reviews = reviewsFile.content;
  if (reviews.length === 0) {
    list.innerHTML = '<p>Noch keine Zitate.</p>';
    return;
  }

  list.innerHTML = reviews.map((r, i) => `
    <div class="review-card" data-idx="${i}">
      <span class="review-text">"${escapeHtml(r.text)}"</span>
      <div class="review-card-actions">
        <button class="btn-small edit-review-btn">✏️</button>
        <button class="btn-danger delete-review-btn">🗑️</button>
      </div>
    </div>
  `).join('');

  list.querySelectorAll('.edit-review-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = +btn.closest('.review-card').dataset.idx;
      openReviewForm(idx);
    });
  });
  list.querySelectorAll('.delete-review-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = +btn.closest('.review-card').dataset.idx;
      if (confirm('Zitat wirklich löschen?')) deleteReview(idx);
    });
  });
}

function openReviewForm(idx) {
  editingReviewIdx = idx;
  const form = document.getElementById('review-form');
  const title = document.getElementById('review-form-title');
  document.getElementById('review-status').classList.add('hidden');
  form.classList.remove('hidden');

  if (idx !== null) {
    title.textContent = 'Zitat bearbeiten';
    document.getElementById('review-text').value = reviewsFile.content[idx].text;
  } else {
    title.textContent = 'Neues Zitat';
    document.getElementById('review-text').value = '';
  }
}

function closeReviewForm() {
  document.getElementById('review-form').classList.add('hidden');
  editingReviewIdx = null;
}

async function saveReview() {
  const text = document.getElementById('review-text').value.trim();
  if (!text) {
    showStatus('review-status', 'Bitte Text eingeben', 'error');
    return;
  }

  const reviews = reviewsFile.content;
  if (editingReviewIdx !== null) {
    reviews[editingReviewIdx].text = text;
  } else {
    reviews.push({ text });
  }

  try {
    const json = JSON.stringify(reviews, null, 2) + '\n';
    const result = await putFile('content/reviews.json', json, reviewsFile.sha, 'Update reviews');
    reviewsFile.sha = result.content.sha;
    showStatus('review-status', '✅ Gespeichert!', 'success');
    closeReviewForm();
    renderReviews();
  } catch (e) {
    showStatus('review-status', `❌ ${e.message}`, 'error');
  }
}

async function deleteReview(idx) {
  const reviews = reviewsFile.content;
  reviews.splice(idx, 1);
  try {
    const json = JSON.stringify(reviews, null, 2) + '\n';
    const result = await putFile('content/reviews.json', json, reviewsFile.sha, 'Delete review');
    reviewsFile.sha = result.content.sha;
    renderReviews();
  } catch (e) {
    alert(`Fehler: ${e.message}`);
  }
}

/* ── DESIGNS — Images ──────────────────────── */
async function loadDesignImages() {
  const grid = document.getElementById('designs-grid');
  grid.innerHTML = '<p>Laden...</p>';
  try {
    const file = await getFile('static/img/products/manifest.json');
    manifestFile = { sha: file.sha, content: JSON.parse(file.content) };
    renderDesignGrid();
  } catch (e) {
    grid.innerHTML = `<p class="error">${e.message}</p>`;
  }
}

function renderDesignGrid() {
  const grid = document.getElementById('designs-grid');
  const images = manifestFile.content;
  if (images.length === 0) {
    grid.innerHTML = '<p>Keine Design-Fotos.</p>';
    return;
  }

  grid.innerHTML = images.map(name => `
    <div class="image-card" data-name="${name}">
      <img src="../static/img/products/${encodeURIComponent(name)}" alt="${name}" loading="lazy">
      <span class="image-name">${name}</span>
      <button class="image-delete" title="Löschen">×</button>
    </div>
  `).join('');

  grid.querySelectorAll('.image-delete').forEach(btn => {
    btn.addEventListener('click', async () => {
      const card = btn.closest('.image-card');
      const name = card.dataset.name;
      if (!confirm(`"${name}" wirklich löschen?`)) return;
      try {
        // Get the file SHA first
        const fileData = await getFile(`static/img/products/${name}`);
        await deleteFile(`static/img/products/${name}`, fileData.sha, `Delete design photo ${name}`);
        // Remove from manifest
        manifestFile.content = manifestFile.content.filter(n => n !== name);
        const json = JSON.stringify(manifestFile.content, null, 2) + '\n';
        const result = await putFile('static/img/products/manifest.json', json, manifestFile.sha, 'Update manifest');
        manifestFile.sha = result.content.sha;
        card.remove();
      } catch (e) {
        alert(`Fehler: ${e.message}`);
      }
    });
  });
}

async function uploadDesignImage(e) {
  const file = e.target.files[0];
  if (!file) return;
  const statusId = 'design-upload-status';
  showStatus(statusId, '⏳ Hochladen...', 'success');

  try {
    const base64 = await readFileAsBase64(file);
    const path = `static/img/products/${file.name}`;
    await putBinaryFile(path, base64, null, `Add design photo ${file.name}`);

    // Add to manifest if not already there
    if (!manifestFile.content.includes(file.name)) {
      manifestFile.content.push(file.name);
      manifestFile.content.sort();
      const json = JSON.stringify(manifestFile.content, null, 2) + '\n';
      const result = await putFile('static/img/products/manifest.json', json, manifestFile.sha, 'Update manifest');
      manifestFile.sha = result.content.sha;
    }

    showStatus(statusId, '✅ Hochgeladen!', 'success');
    e.target.value = '';
    renderDesignGrid();
  } catch (err) {
    showStatus(statusId, `❌ ${err.message}`, 'error');
  }
}

/* ── DESIGNS — Copyrights ──────────────────── */
async function loadCopyrights() {
  const list = document.getElementById('copyright-list');
  list.innerHTML = '<p>Laden...</p>';
  try {
    const file = await getFile('content/copyrights.json');
    copyrightsFile = { sha: file.sha, content: JSON.parse(file.content) };
    renderCopyrights();
  } catch (e) {
    list.innerHTML = `<p class="error">${e.message}</p>`;
  }
}

function renderCopyrights() {
  const list = document.getElementById('copyright-list');
  const data = copyrightsFile.content;
  if (data.length === 0) {
    list.innerHTML = '<p>Keine Copyright-Zuordnungen.</p>';
    return;
  }

  list.innerHTML = data.map((c, i) => `
    <div class="copyright-card" data-idx="${i}">
      <div>
        <strong>📷 ${escapeHtml(c.photographer)}</strong>
        <div class="copyright-files">${c.files.join(', ')}</div>
      </div>
      <div class="review-card-actions">
        <button class="btn-small edit-copy-btn">✏️</button>
        <button class="btn-danger delete-copy-btn">🗑️</button>
      </div>
    </div>
  `).join('');

  list.querySelectorAll('.edit-copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = +btn.closest('.copyright-card').dataset.idx;
      openCopyrightForm(idx);
    });
  });
  list.querySelectorAll('.delete-copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = +btn.closest('.copyright-card').dataset.idx;
      if (confirm('Zuordnung wirklich löschen?')) deleteCopyright(idx);
    });
  });
}

function openCopyrightForm(idx) {
  editingCopyIdx = idx;
  const form = document.getElementById('copyright-form');
  const title = document.getElementById('copyright-form-title');
  document.getElementById('copyright-status').classList.add('hidden');
  form.classList.remove('hidden');

  if (idx !== null) {
    const c = copyrightsFile.content[idx];
    title.textContent = 'Zuordnung bearbeiten';
    document.getElementById('copyright-photographer').value = c.photographer;
    document.getElementById('copyright-files').value = c.files.join(', ');
  } else {
    title.textContent = 'Neue Zuordnung';
    document.getElementById('copyright-photographer').value = '';
    document.getElementById('copyright-files').value = '';
  }
}

function closeCopyrightForm() {
  document.getElementById('copyright-form').classList.add('hidden');
  editingCopyIdx = null;
}

async function saveCopyright() {
  const photographer = document.getElementById('copyright-photographer').value.trim();
  const filesRaw = document.getElementById('copyright-files').value.trim();

  if (!photographer) {
    showStatus('copyright-status', 'Bitte Fotograf*in eingeben', 'error');
    return;
  }

  const files = filesRaw
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  const data = copyrightsFile.content;
  if (editingCopyIdx !== null) {
    data[editingCopyIdx] = { photographer, files };
  } else {
    data.push({ photographer, files });
  }

  try {
    const json = JSON.stringify(data, null, 2) + '\n';
    const result = await putFile('content/copyrights.json', json, copyrightsFile.sha, 'Update copyrights');
    copyrightsFile.sha = result.content.sha;
    showStatus('copyright-status', '✅ Gespeichert!', 'success');
    closeCopyrightForm();
    renderCopyrights();
  } catch (e) {
    showStatus('copyright-status', `❌ ${e.message}`, 'error');
  }
}

async function deleteCopyright(idx) {
  const data = copyrightsFile.content;
  data.splice(idx, 1);
  try {
    const json = JSON.stringify(data, null, 2) + '\n';
    const result = await putFile('content/copyrights.json', json, copyrightsFile.sha, 'Delete copyright entry');
    copyrightsFile.sha = result.content.sha;
    renderCopyrights();
  } catch (e) {
    alert(`Fehler: ${e.message}`);
  }
}

/* ── Helpers ───────────────────────────────── */
function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // result is "data:image/...;base64,XXXX" — we need just XXXX
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Datei konnte nicht gelesen werden'));
    reader.readAsDataURL(file);
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function showStatus(elementId, message, type) {
  const el = document.getElementById(elementId);
  el.textContent = message;
  el.className = `status ${type}`;
  el.classList.remove('hidden');
  if (type === 'success') {
    setTimeout(() => el.classList.add('hidden'), 3000);
  }
}
