/* ── NADAtäx Admin CMS ──────────────────────── */
/* Static CMS using GitHub API — no server needed */

const REPO_OWNER = 'leon-k-martin';
const REPO_NAME  = 'nadataex.online';
const BRANCH     = 'main';
const API_BASE   = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`;

let token = '';

// Tracked file state (sha needed for updates)
let aboutFile   = null;   // { sha, content }
let reviewsFile = null;   // { sha, content (parsed array) }
let copyrightsFile = null; // { sha, content (parsed array) }
let manifestFile   = null; // { sha, content (parsed array) }
let groupsFile     = null; // { sha, content (parsed array of { name, images }) }

let editingReviewIdx = null;  // index or null for new

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
  document.getElementById('faq-upload-en').addEventListener('change', e => uploadFaqImage(e, 'static/img/faq', 'faq-upload-en-status', 'faq-images-en'));
  document.getElementById('faq-upload-de').addEventListener('change', e => uploadFaqImage(e, 'faq/de', 'faq-upload-de-status', 'faq-images-de'));

  // Reviews
  document.getElementById('add-review-btn').addEventListener('click', () => openReviewForm(null));
  document.getElementById('save-review-btn').addEventListener('click', saveReview);
  document.getElementById('cancel-review-btn').addEventListener('click', closeReviewForm);

  // Designs
  document.getElementById('design-image-upload').addEventListener('change', uploadDesignImage);
  document.getElementById('add-photographer-btn').addEventListener('click', addPhotographer);
  document.getElementById('new-photographer-name').addEventListener('keydown', e => {
    if (e.key === 'Enter') addPhotographer();
  });
  document.getElementById('add-group-btn').addEventListener('click', addGroup);
  document.getElementById('new-group-name').addEventListener('keydown', e => {
    if (e.key === 'Enter') addGroup();
  });
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
  loadFaqImages('static/img/faq', 'faq-images-en');
  loadFaqImages('faq/de', 'faq-images-de');
  loadReviews();
  // Load copyrights + groups first, then designs (grid needs both)
  Promise.all([loadCopyrights(), loadGroups()]).then(() => loadDesignImages());
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

/* ── FAQ Images (EN + DE) ──────────────────── */
async function loadFaqImages(folder, gridId) {
  const grid = document.getElementById(gridId);
  grid.innerHTML = '<p>Laden...</p>';
  try {
    const res = await ghFetch(`/contents/${folder}?ref=${BRANCH}`);
    if (!res.ok) { grid.innerHTML = '<p>Keine Bilder gefunden.</p>'; return; }
    const files = await res.json();
    const images = files.filter(f => /\.(png|jpe?g|webp|gif)$/i.test(f.name));
    if (images.length === 0) { grid.innerHTML = '<p>Keine Bilder.</p>'; return; }

    // Sort by filename
    images.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

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
        const name = card.querySelector('.image-name').textContent;
        if (!confirm(`"${name}" wirklich löschen?`)) return;
        try {
          await deleteFile(card.dataset.path, card.dataset.sha, `Delete FAQ image ${name}`);
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

async function uploadFaqImage(e, folder, statusId, gridId) {
  const file = e.target.files[0];
  if (!file) return;
  showStatus(statusId, '⏳ Hochladen...', 'success');

  try {
    const base64 = await readFileAsBase64(file);
    const path = `${folder}/${file.name}`;
    await putBinaryFile(path, base64, null, `Add FAQ image ${file.name}`);
    showStatus(statusId, '✅ Hochgeladen!', 'success');
    e.target.value = '';
    loadFaqImages(folder, gridId);
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

/* ── DESIGNS — Groups ──────────────────────── */
async function loadGroups() {
  try {
    const file = await getFile('static/img/products/groups.json');
    groupsFile = { sha: file.sha, content: JSON.parse(file.content) };
  } catch (e) {
    // File doesn't exist yet — start with empty groups
    groupsFile = { sha: null, content: [] };
  }
}

async function saveGroupsData() {
  try {
    const json = JSON.stringify(groupsFile.content, null, 2) + '\n';
    const result = await putFile('static/img/products/groups.json', json, groupsFile.sha, 'Update groups');
    groupsFile.sha = result.content.sha;
  } catch (e) {
    alert(`Fehler beim Speichern der Gruppen: ${e.message}`);
  }
}

function addGroup() {
  const input = document.getElementById('new-group-name');
  const name = input.value.trim();
  if (!name) return;
  if (groupsFile.content.some(g => g.name === name)) {
    showStatus('design-upload-status', 'Gruppe existiert bereits', 'error');
    return;
  }
  groupsFile.content.push({ name, images: [] });
  saveGroupsData();
  input.value = '';
  renderDesignGrid();
}

function renameGroup(oldName) {
  const newName = prompt('Neuer Gruppenname:', oldName);
  if (!newName || newName === oldName) return;
  if (groupsFile.content.some(g => g.name === newName)) {
    alert('Name existiert bereits');
    return;
  }
  const group = groupsFile.content.find(g => g.name === oldName);
  if (group) group.name = newName;
  saveGroupsData();
  renderDesignGrid();
}

function deleteGroup(name) {
  if (!confirm(`Gruppe "${name}" löschen? Die Fotos werden in "Ohne Gruppe" verschoben.`)) return;
  groupsFile.content = groupsFile.content.filter(g => g.name !== name);
  saveGroupsData();
  renderDesignGrid();
}

/* ── DESIGNS — Images ──────────────────────── */
async function loadDesignImages() {
  const container = document.getElementById('designs-groups-container');
  container.innerHTML = '<p>Laden...</p>';
  try {
    const file = await getFile('static/img/products/manifest.json');
    manifestFile = { sha: file.sha, content: JSON.parse(file.content) };
    renderDesignGrid();
  } catch (e) {
    container.innerHTML = `<p class="error">${e.message}</p>`;
  }
}

function renderDesignGrid() {
  const container = document.getElementById('designs-groups-container');
  const allImages = manifestFile.content;

  // Build copyright lookup
  const stemToPhotographer = {};
  if (copyrightsFile) {
    for (const entry of copyrightsFile.content) {
      for (const stem of entry.files) {
        stemToPhotographer[stem] = entry.photographer;
      }
    }
  }
  const photographers = copyrightsFile ? copyrightsFile.content.map(c => c.photographer) : [];

  // Determine which images are in groups
  const groupedImages = new Set();
  for (const g of groupsFile.content) {
    for (const img of g.images) groupedImages.add(img);
  }
  const ungrouped = allImages.filter(img => !groupedImages.has(img));

  // Render each group + ungrouped
  let html = '';

  for (const group of groupsFile.content) {
    // Only show images that are still in the manifest
    const validImages = group.images.filter(img => allImages.includes(img));
    html += renderGroupSection(group.name, validImages, stemToPhotographer, photographers, false);
  }

  // Ungrouped section
  html += renderGroupSection('Ohne Gruppe', ungrouped, stemToPhotographer, photographers, true);

  container.innerHTML = html;

  // Wire up group actions
  container.querySelectorAll('.group-rename-btn').forEach(btn => {
    btn.addEventListener('click', () => renameGroup(btn.dataset.group));
  });
  container.querySelectorAll('.group-delete-btn').forEach(btn => {
    btn.addEventListener('click', () => deleteGroup(btn.dataset.group));
  });

  // Wire up copyright dropdowns
  container.querySelectorAll('.copyright-select').forEach(sel => {
    sel.addEventListener('change', () => scheduleCopyrightSave());
  });

  // Wire up delete buttons
  container.querySelectorAll('.image-delete').forEach(btn => {
    btn.addEventListener('click', async () => {
      const card = btn.closest('.design-card');
      const name = card.dataset.name;
      if (!confirm(`"${name}" wirklich löschen?`)) return;
      try {
        const fileData = await getFile(`static/img/products/webp/${name}`);
        await deleteFile(`static/img/products/webp/${name}`, fileData.sha, `Delete design photo ${name}`);
        manifestFile.content = manifestFile.content.filter(n => n !== name);
        const json = JSON.stringify(manifestFile.content, null, 2) + '\n';
        const result = await putFile('static/img/products/manifest.json', json, manifestFile.sha, 'Update manifest');
        manifestFile.sha = result.content.sha;
        // Remove from groups
        for (const g of groupsFile.content) {
          g.images = g.images.filter(n => n !== name);
        }
        saveGroupsData();
        removeStemFromCopyrights(name.replace(/\.[^.]+$/, ''));
        card.remove();
      } catch (e) {
        alert(`Fehler: ${e.message}`);
      }
    });
  });

  // Wire up drag & drop
  initDragAndDrop();
}

function renderGroupSection(groupName, images, stemToPhotographer, photographers, isUngrouped) {
  const groupId = isUngrouped ? '__ungrouped' : groupName;
  const headerActions = isUngrouped ? '' : `
    <button class="btn-small group-rename-btn" data-group="${escapeHtml(groupName)}" title="Umbenennen">✏️</button>
    <button class="btn-small group-delete-btn" data-group="${escapeHtml(groupName)}" title="Löschen">🗑️</button>
  `;

  const cards = images.map(name => {
    const stem = name.replace(/\.[^.]+$/, '');
    const assigned = stemToPhotographer[stem] || '';
    const options = ['<option value="">—</option>']
      .concat(photographers.map(p =>
        `<option value="${escapeHtml(p)}"${p === assigned ? ' selected' : ''}>${escapeHtml(p)}</option>`
      )).join('');

    return `
      <div class="image-card design-card" data-name="${name}" data-stem="${stem}" draggable="true">
        <img src="../static/img/products/webp/${encodeURIComponent(name)}" alt="${name}" loading="lazy">
        <span class="image-name">${name}</span>
        <select class="copyright-select" title="Fotograf:in">${options}</select>
        <button class="image-delete" title="Löschen">×</button>
      </div>`;
  }).join('');

  return `
    <div class="design-group" data-group="${escapeHtml(groupId)}">
      <div class="group-header">
        <h3>${escapeHtml(groupName)} <span class="group-count">(${images.length})</span></h3>
        <div class="group-actions">${headerActions}</div>
      </div>
      <div class="group-dropzone image-grid" data-group="${escapeHtml(groupId)}">
        ${cards || '<p class="drop-hint">Bilder hierher ziehen</p>'}
      </div>
    </div>`;
}

/* ── Drag & Drop ───────────────────────────── */
let draggedCard = null;

function initDragAndDrop() {
  const container = document.getElementById('designs-groups-container');

  // Drag start
  container.querySelectorAll('.design-card[draggable]').forEach(card => {
    card.addEventListener('dragstart', e => {
      draggedCard = card;
      card.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', card.dataset.name);
    });
    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
      draggedCard = null;
      // Remove all drag-over highlights
      container.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
    });
  });

  // Drop zones
  container.querySelectorAll('.group-dropzone').forEach(zone => {
    zone.addEventListener('dragover', e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      zone.classList.add('drag-over');
    });
    zone.addEventListener('dragleave', e => {
      // Only remove if leaving the zone itself
      if (!zone.contains(e.relatedTarget)) {
        zone.classList.remove('drag-over');
      }
    });
    zone.addEventListener('drop', e => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      if (!draggedCard) return;

      const imageName = draggedCard.dataset.name;
      const targetGroup = zone.dataset.group;

      // Remove from old group
      for (const g of groupsFile.content) {
        g.images = g.images.filter(n => n !== imageName);
      }

      // Add to new group (unless ungrouped)
      if (targetGroup !== '__ungrouped') {
        const group = groupsFile.content.find(g => g.name === targetGroup);
        if (group && !group.images.includes(imageName)) {
          group.images.push(imageName);
        }
      }

      saveGroupsData();
      renderDesignGrid();
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
    const path = `static/img/products/webp/${file.name}`;
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

/* ── DESIGNS — Copyrights (visual) ─────────── */
async function loadCopyrights() {
  try {
    const file = await getFile('content/copyrights.json');
    copyrightsFile = { sha: file.sha, content: JSON.parse(file.content) };
    renderPhotographerPills();
  } catch (e) {
    console.error('Copyright load error:', e);
    copyrightsFile = { sha: null, content: [] };
  }
}

function renderPhotographerPills() {
  const list = document.getElementById('photographer-list');
  const photographers = copyrightsFile.content.map(c => c.photographer);
  if (photographers.length === 0) {
    list.innerHTML = '<p style="color:#888">Noch keine Fotograf:innen.</p>';
    return;
  }
  list.innerHTML = photographers.map(name => `
    <span class="photographer-pill">
      ${escapeHtml(name)}
      <button class="pill-remove" data-name="${escapeHtml(name)}" title="Entfernen">×</button>
    </span>
  `).join('');

  list.querySelectorAll('.pill-remove').forEach(btn => {
    btn.addEventListener('click', () => removePhotographer(btn.dataset.name));
  });
}

async function addPhotographer() {
  const input = document.getElementById('new-photographer-name');
  const name = input.value.trim();
  if (!name) return;

  // Check if already exists
  if (copyrightsFile.content.some(c => c.photographer === name)) {
    showStatus('copyright-status', 'Name existiert bereits', 'error');
    return;
  }

  copyrightsFile.content.push({ photographer: name, files: [] });
  await saveCopyrightData();
  input.value = '';
  renderPhotographerPills();
  renderDesignGrid(); // refresh dropdowns
}

async function removePhotographer(name) {
  if (!confirm(`"${name}" wirklich entfernen? Zuordnungen zu Fotos gehen verloren.`)) return;
  copyrightsFile.content = copyrightsFile.content.filter(c => c.photographer !== name);
  await saveCopyrightData();
  renderPhotographerPills();
  renderDesignGrid();
}

// Collect copyright assignments from all dropdowns and save
let copyrightSaveTimer = null;
function scheduleCopyrightSave() {
  clearTimeout(copyrightSaveTimer);
  copyrightSaveTimer = setTimeout(() => saveCopyrightFromGrid(), 600);
}

async function saveCopyrightFromGrid() {
  // Rebuild copyrights.json from the dropdowns
  const cards = document.querySelectorAll('#designs-groups-container .design-card');
  const photographerMap = {}; // photographer → [stems]

  cards.forEach(card => {
    const stem = card.dataset.stem;
    const sel = card.querySelector('.copyright-select');
    const photographer = sel.value;
    if (photographer) {
      if (!photographerMap[photographer]) photographerMap[photographer] = [];
      photographerMap[photographer].push(stem);
    }
  });

  // Preserve photographer entries even if they have no assignments
  const newData = copyrightsFile.content.map(c => ({
    photographer: c.photographer,
    files: photographerMap[c.photographer] || [],
  }));

  copyrightsFile.content = newData;
  await saveCopyrightData();
}

function removeStemFromCopyrights(stem) {
  for (const entry of copyrightsFile.content) {
    entry.files = entry.files.filter(f => f !== stem);
  }
  saveCopyrightData();
}

async function saveCopyrightData() {
  try {
    const json = JSON.stringify(copyrightsFile.content, null, 2) + '\n';
    const result = await putFile('content/copyrights.json', json, copyrightsFile.sha, 'Update copyrights');
    copyrightsFile.sha = result.content.sha;
    showStatus('copyright-status', '✅ Gespeichert!', 'success');
  } catch (e) {
    showStatus('copyright-status', `❌ ${e.message}`, 'error');
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
