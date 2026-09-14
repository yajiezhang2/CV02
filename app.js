import { portfolioData } from './data.js';

const { profile, projects, notes } = portfolioData;
const $ = (selector) => document.querySelector(selector);
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[char]);

function renderProfile() {
  $('#availability').textContent = profile.availability;
  $('#location').textContent = profile.location;
  $('#current-focus').textContent = profile.currentFocus;
  $('#hero-title').innerHTML = escapeHtml(profile.title).replace(/\n/g, '<br />');
  $('#hero-intro').textContent = profile.intro;
  $('#about-statement').textContent = profile.statement;
  $('#experience-list').innerHTML = profile.experience.map((item) => `<div class="experience-item"><span>${escapeHtml(item.period)}</span><strong>${escapeHtml(item.role)}</strong></div>`).join('');
  $('#capability-list').innerHTML = profile.capabilities.map((item) => `<span>${escapeHtml(item)}</span>`).join('');
}

function projectVisual(project, compact = false) {
  return `<div class="project-visual ${compact ? 'compact' : ''}" style="--accent: ${project.accent}"><span class="visual-number">${project.number}</span><div class="visual-art art-${project.type}"><i></i><b></b><em></em></div><span class="visual-caption">${escapeHtml(project.category)}</span></div>`;
}

function renderFilters(active = '全部') {
  const categories = ['全部', ...new Set(projects.map((project) => project.category))];
  $('#work-filters').innerHTML = categories.map((category) => `<button class="filter-button ${category === active ? 'active' : ''}" data-filter="${escapeHtml(category)}" type="button">${escapeHtml(category)}</button>`).join('');
  document.querySelectorAll('[data-filter]').forEach((button) => button.addEventListener('click', () => {
    renderFilters(button.dataset.filter);
    renderProjects(button.dataset.filter);
  }));
}

function renderProjects(filter = '全部') {
  const visibleProjects = filter === '全部' ? projects : projects.filter((project) => project.category === filter);
  $('#project-grid').innerHTML = visibleProjects.map((project, index) => `<article class="project-card reveal" style="--delay: ${index * 70}ms" data-project-id="${project.id}">${projectVisual(project)}<div class="project-info"><div><span class="project-year">${project.year}</span><h3>${escapeHtml(project.title).replace(/\n/g, '<br />')}</h3></div><span class="project-arrow">↗</span><p>${escapeHtml(project.summary)}</p><div class="project-tags">${project.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}</div></div></article>`).join('');
  document.querySelectorAll('[data-project-id]').forEach((card) => card.addEventListener('click', () => openModal(card.dataset.projectId)));
}

function renderNotes() {
  $('#notes-list').innerHTML = notes.map((note) => `<article class="note-item ${note.link ? 'is-linked' : ''}" ${note.link ? `data-link="${escapeHtml(note.link)}" tabindex="0"` : ''}><span class="note-date">${escapeHtml(note.date)}</span><span class="note-type">${escapeHtml(note.type)}</span><h3>${escapeHtml(note.title)}</h3><span class="note-arrow">↗</span></article>`).join('');
  document.querySelectorAll('.note-item[data-link]').forEach((note) => {
    note.addEventListener('click', () => { window.location.href = note.dataset.link; });
    note.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') window.location.href = note.dataset.link; });
  });
}

function openModal(projectId) {
  const project = projects.find((item) => item.id === projectId);
  if (!project) return;
  $('#modal-visual').innerHTML = projectVisual(project, true);
  $('#modal-category').textContent = `${project.year} / ${project.category}`;
  $('#modal-title').innerHTML = escapeHtml(project.title).replace(/\n/g, '<br />');
  $('#modal-description').textContent = project.description;
  $('#modal-facts').innerHTML = project.facts.map((fact) => `<div><span>${escapeHtml(fact.label)}</span><strong>${escapeHtml(fact.value)}</strong></div>`).join('');
  $('#project-modal').hidden = false;
  document.body.classList.add('modal-open');
}

function closeModal() {
  $('#project-modal').hidden = true;
  document.body.classList.remove('modal-open');
}

function setupBubbleTrail() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const layer = document.createElement('div');
  const colors = ['#f7b7c8', '#b9d9f2', '#f8d58c', '#c8e6c9', '#d8c7f1'];
  let lastBubbleTime = 0;

  layer.className = 'bubble-trail';
  layer.setAttribute('aria-hidden', 'true');
  document.body.appendChild(layer);

  document.addEventListener('mousemove', (event) => {
    const now = performance.now();
    if (now - lastBubbleTime < 55) return;
    lastBubbleTime = now;

    const bubble = document.createElement('span');
    const size = 8 + Math.random() * 16;
    bubble.className = 'trail-bubble';
    bubble.style.left = `${event.clientX - size / 2}px`;
    bubble.style.top = `${event.clientY - size / 2}px`;
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    bubble.style.setProperty('--drift-x', `${(Math.random() - .5) * 46}px`);
    bubble.style.setProperty('--drift-y', `${-34 - Math.random() * 48}px`);
    bubble.style.animationDuration = `${2600 + Math.random() * 700}ms`;
    layer.appendChild(bubble);

    if (layer.childElementCount > 22) layer.firstElementChild.remove();
    bubble.addEventListener('animationend', () => bubble.remove(), { once: true });
  }, { passive: true });
}

document.addEventListener('DOMContentLoaded', () => {
  renderProfile();
  renderFilters();
  renderProjects();
  renderNotes();
  $('#year').textContent = new Date().getFullYear();
  document.querySelectorAll('[data-close-modal]').forEach((element) => element.addEventListener('click', closeModal));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeModal(); });
  document.addEventListener('mousemove', (event) => { document.documentElement.style.setProperty('--mouse-x', `${event.clientX}px`); document.documentElement.style.setProperty('--mouse-y', `${event.clientY}px`); });
  setupBubbleTrail();
});
