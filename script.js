/* ============================================================
   CUSTOM CURSOR
   ============================================================ */
const dot = document.getElementById('cursor-dot');
const ring = document.getElementById('cursor-ring');
let mx = window.innerWidth / 2, my = window.innerHeight / 2;
let rx = mx, ry = my;

window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

function animateCursor() {
  dot.style.left = mx + 'px';
  dot.style.top = my + 'px';
  rx += (mx - rx) * 0.12;
  ry += (my - ry) * 0.12;
  ring.style.left = rx + 'px';
  ring.style.top = ry + 'px';
  requestAnimationFrame(animateCursor);
}
animateCursor();

/* ============================================================
   NAV SCROLL
   ============================================================ */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
});

/* ============================================================
   TYPING EFFECT
   ============================================================ */
const phrases = ['build · test · improve', 'ship AI · ship fast', 'gen-ai · infra · scale'];
let pi = 0, ci = 0, deleting = false;
const typedEl = document.getElementById('typed-text');

function type() {
  const phrase = phrases[pi];
  if (!deleting) {
    typedEl.textContent = phrase.slice(0, ++ci);
    if (ci === phrase.length) { deleting = true; setTimeout(type, 2000); return; }
  } else {
    typedEl.textContent = phrase.slice(0, --ci);
    if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; }
  }
  setTimeout(type, deleting ? 40 : 80);
}
setTimeout(type, 800);

/* ============================================================
   SCROLL REVEAL
   ============================================================ */
// Mark body as JS-ready so reveal CSS kicks in
document.body.classList.add('js-ready');

const observer = new IntersectionObserver(entries => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), e.target.dataset.delay || 0);
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach((el, i) => {
  el.dataset.delay = (i % 4) * 80;
  observer.observe(el);
});

/* ============================================================
   PHYSICS SKILL TAGS
   ============================================================ */
const arena = document.getElementById('skills-arena');
const tags = Array.from(arena.querySelectorAll('.skill-tag'));

function initTags() {
  const W = arena.offsetWidth;
  const H = arena.offsetHeight;
  const cols = Math.ceil(Math.sqrt(tags.length * (W / H)));
  const rows = Math.ceil(tags.length / cols);
  const cellW = W / cols;
  const cellH = H / rows;

  tags.forEach((tag, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    tag.style.left = (col * cellW + cellW / 2 - tag.offsetWidth / 2) + 'px';
    tag.style.top = (row * cellH + cellH / 2 - tag.offsetHeight / 2) + 'px';
  });
}

const states = tags.map(tag => ({
  el: tag,
  x: 0, y: 0,
  vx: parseFloat(tag.dataset.vx) || 1,
  vy: parseFloat(tag.dataset.vy) || 1,
  dragging: false,
  ox: 0, oy: 0, omx: 0, omy: 0,
}));

function initPositions() {
  const W = arena.offsetWidth;
  const H = arena.offsetHeight;
  states.forEach((s, i) => {
    const cols = Math.ceil(Math.sqrt(states.length * (W / H)));
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cellW = W / cols;
    const cellH = H / Math.ceil(states.length / cols);
    s.x = col * cellW + cellW / 2 - s.el.offsetWidth / 2;
    s.y = row * cellH + cellH / 2 - s.el.offsetHeight / 2;
    s.el.style.left = s.x + 'px';
    s.el.style.top = s.y + 'px';
  });
}

setTimeout(initPositions, 100);

let animRunning = true;
function physicsLoop() {
  if (!animRunning) return;
  const W = arena.offsetWidth;
  const H = arena.offsetHeight;
  states.forEach(s => {
    if (s.dragging) return;
    s.x += s.vx;
    s.y += s.vy;
    const tw = s.el.offsetWidth;
    const th = s.el.offsetHeight;
    if (s.x <= 0) { s.x = 0; s.vx = Math.abs(s.vx); }
    if (s.x + tw >= W) { s.x = W - tw; s.vx = -Math.abs(s.vx); }
    if (s.y <= 0) { s.y = 0; s.vy = Math.abs(s.vy); }
    if (s.y + th >= H) { s.y = H - th; s.vy = -Math.abs(s.vy); }
    s.el.style.left = s.x + 'px';
    s.el.style.top = s.y + 'px';
  });
  requestAnimationFrame(physicsLoop);
}

// start physics when arena is visible
const arenaObserver = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting) { physicsLoop(); arenaObserver.disconnect(); }
}, { threshold: 0.1 });
arenaObserver.observe(arena);

// drag
states.forEach(s => {
  s.el.addEventListener('mousedown', e => {
    e.preventDefault();
    s.dragging = true;
    s.el.classList.add('dragging');
    s.omx = e.clientX; s.omy = e.clientY;
    s.ox = s.x; s.oy = s.y;
    const arenaRect = arena.getBoundingClientRect();

    const onMove = e => {
      const dx = e.clientX - s.omx;
      const dy = e.clientY - s.omy;
      const W = arena.offsetWidth, H = arena.offsetHeight;
      const tw = s.el.offsetWidth, th = s.el.offsetHeight;
      s.x = Math.max(0, Math.min(W - tw, s.ox + dx));
      s.y = Math.max(0, Math.min(H - th, s.oy + dy));
      s.el.style.left = s.x + 'px';
      s.el.style.top = s.y + 'px';
    };

    const onUp = e => {
      s.dragging = false;
      s.el.classList.remove('dragging');
      const dx = e.clientX - s.omx;
      const dy = e.clientY - s.omy;
      s.vx = Math.max(-4, Math.min(4, dx * 0.15)) || 1;
      s.vy = Math.max(-4, Math.min(4, dy * 0.15)) || 1;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  });
});

/* ============================================================
   NAV ACTIVE HIGHLIGHT
   ============================================================ */
const sections = document.querySelectorAll('section[id]');
const navAs = document.querySelectorAll('.nav-links a');
const sectionObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navAs.forEach(a => {
        const active = a.getAttribute('href') === '#' + e.target.id;
        a.style.color = active ? 'var(--text)' : '';
      });
    }
  });
}, { threshold: 0.4 });
sections.forEach(s => sectionObs.observe(s));
