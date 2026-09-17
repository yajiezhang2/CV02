import { portfolioData } from './data.js';

const { profile, projects } = portfolioData;
const $ = (selector) => document.querySelector(selector);
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[char]);

function projectVisual(project, compact = false) {
  return `<div class="project-visual ${compact ? 'compact' : ''}" style="--accent: ${project.accent}"><span class="visual-number">${project.number}</span><div class="visual-art art-${project.type}"><i></i><b></b><em></em></div><span class="visual-caption">${escapeHtml(project.category)}</span></div>`;
}

function renderPage() {
  $('#availability').textContent = profile.availability;
  $('#location').textContent = profile.location;
  $('#current-focus').textContent = profile.currentFocus;
  $('#hero-title').innerHTML = escapeHtml(profile.title).replace(/\n/g, '<br />');
  $('#hero-intro').textContent = profile.intro;
  $('#about-statement').textContent = profile.statement;
  $('#capability-list').innerHTML = profile.capabilities.map((item) => `<span>${escapeHtml(item)}</span>`).join('');
  $('#experience-list').innerHTML = profile.experience.map((item, index) => `<article class="accordion-item ${index === 0 ? 'is-open' : ''}"><button type="button" aria-expanded="${index === 0}" class="accordion-trigger"><span>${escapeHtml(item.period)}</span><strong>${escapeHtml(item.role)}</strong><b>+</b></button><div class="accordion-content"><p>${index === 0 ? '从策略、研究到体验设计，持续把问题转化为清晰、可被使用的产品与品牌系统。' : '在不同团队与文化场景中积累研究、视觉、交互与协作经验。'}</p></div></article>`).join('');
  $('#project-grid').innerHTML = projects.map((project, index) => `<article class="project-card reveal-card" style="--delay: ${index * 80}ms" data-project-id="${project.id}">${projectVisual(project)}<div class="project-info"><span class="project-year">${project.year} / ${escapeHtml(project.category)}</span><h3>${escapeHtml(project.title).replace(/\n/g, '<br />')}</h3><p>${escapeHtml(project.summary)}</p><span class="project-arrow">↗</span></div></article>`).join('');
}

function setupAccordion() {
  document.querySelectorAll('.accordion-trigger').forEach((trigger) => trigger.addEventListener('click', () => {
    const item = trigger.closest('.accordion-item');
    const willOpen = !item.classList.contains('is-open');
    document.querySelectorAll('.accordion-item').forEach((other) => { other.classList.remove('is-open'); other.querySelector('.accordion-trigger').setAttribute('aria-expanded', 'false'); });
    if (willOpen) { item.classList.add('is-open'); trigger.setAttribute('aria-expanded', 'true'); }
  }));
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

function closeModal() { $('#project-modal').hidden = true; document.body.classList.remove('modal-open'); }

function setupReveal() {
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }), { threshold: .12 });
  document.querySelectorAll('.reveal-section, .reveal-card').forEach((element) => observer.observe(element));
}

function setupBubbleTrail() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const layer = document.createElement('div');
  const colors = ['#d7bd82', '#c5a871', '#e0c994', '#b99a68', '#cfb88e'];
  let lastBubbleTime = 0;
  layer.className = 'bubble-trail'; layer.setAttribute('aria-hidden', 'true'); document.body.appendChild(layer);
  document.addEventListener('mousemove', (event) => {
    const now = performance.now(); if (now - lastBubbleTime < 55) return; lastBubbleTime = now;
    const bubble = document.createElement('span'); const size = 8 + Math.random() * 16;
    bubble.className = 'trail-bubble'; bubble.style.left = `${event.clientX - size / 2}px`; bubble.style.top = `${event.clientY - size / 2}px`; bubble.style.width = `${size}px`; bubble.style.height = `${size}px`; bubble.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]; bubble.style.setProperty('--drift-x', `${(Math.random() - .5) * 46}px`); bubble.style.setProperty('--drift-y', `${-34 - Math.random() * 48}px`); bubble.style.animationDuration = `${2600 + Math.random() * 700}ms`; layer.appendChild(bubble);
    if (layer.childElementCount > 22) layer.firstElementChild.remove(); bubble.addEventListener('animationend', () => bubble.remove(), { once: true });
  }, { passive: true });
}

document.addEventListener('DOMContentLoaded', () => {
  renderPage(); setupAccordion(); setupReveal(); setupBubbleTrail(); $('#year').textContent = new Date().getFullYear();
  document.querySelectorAll('[data-project-id]').forEach((card) => card.addEventListener('click', () => openModal(card.dataset.projectId)));
  document.querySelectorAll('[data-close-modal]').forEach((element) => element.addEventListener('click', closeModal));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeModal(); });
});
