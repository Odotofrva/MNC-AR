const experiences = [
  {
    id: 'signal-01',
    title: 'Signal 01',
    subtitle: 'Dimensional object reveal',
    description: 'Scan the matching artwork to reveal the first MENOCLONE dimensional object experience.',
    artwork: './assets/images/signal-01.svg',
    model: './assets/models/signal-01.glb',
    target: 'https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.2.5/examples/image-tracking/assets/card-example/card.mind',
    demoTargetImage: 'https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.2.5/examples/image-tracking/assets/card-example/card.png',
    modelScale: 0.55,
    modelY: 0.05,
    modelZ: 0.05
  },
  {
    id: 'signal-02',
    title: 'Signal 02',
    subtitle: 'Floating artifact',
    description: 'A second GLB experience with a rotating floating object anchored directly over the recognized artwork.',
    artwork: './assets/images/signal-02.svg',
    model: './assets/models/signal-02.glb',
    target: 'https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.2.5/examples/image-tracking/assets/card-example/card.mind',
    demoTargetImage: 'https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.2.5/examples/image-tracking/assets/card-example/card.png',
    modelScale: 0.45,
    modelY: 0.06,
    modelZ: 0.08
  },
  {
    id: 'signal-03',
    title: 'Signal 03',
    subtitle: 'Portal prototype',
    description: 'A third marker-driven experience demonstrating how the system can scale to a larger library of artworks.',
    artwork: './assets/images/signal-03.svg',
    model: './assets/models/signal-03.glb',
    target: 'https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.2.5/examples/image-tracking/assets/card-example/card.mind',
    demoTargetImage: 'https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.2.5/examples/image-tracking/assets/card-example/card.png',
    modelScale: 0.5,
    modelY: 0.05,
    modelZ: 0.06
  }
];

const $ = (s) => document.querySelector(s);
const gallery = $('#gallery');
const detailModal = $('#detailModal');
const aboutModal = $('#aboutModal');
let selected = null;

$('#experienceCount').textContent = `${experiences.length} EXPERIENCES`;

gallery.innerHTML = experiences.map((exp, i) => `
  <article class="art-card" data-index="${i}" tabindex="0" role="button" aria-label="Open ${exp.title}">
    <img src="${exp.artwork}" alt="${exp.title} artwork preview" />
    <footer>
      <div><h4>${exp.title}</h4><p>${exp.subtitle}</p></div>
      <div class="card-arrow">↗</div>
    </footer>
  </article>`).join('');

function openDetail(index) {
  selected = experiences[index];
  $('#detailImage').src = selected.artwork;
  $('#detailTitle').textContent = selected.title;
  $('#detailCode').textContent = selected.id.toUpperCase();
  $('#detailDescription').textContent = selected.description;
  detailModal.classList.add('open');
  detailModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}
function closeDetail() {
  detailModal.classList.remove('open');
  detailModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

gallery.addEventListener('click', e => {
  const card = e.target.closest('.art-card');
  if (card) openDetail(Number(card.dataset.index));
});
gallery.addEventListener('keydown', e => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('.art-card')) {
    e.preventDefault();
    openDetail(Number(e.target.closest('.art-card').dataset.index));
  }
});

document.querySelectorAll('[data-close-modal]').forEach(el => el.addEventListener('click', closeDetail));
$('#aboutBtn').addEventListener('click', () => {
  aboutModal.classList.add('open');
  aboutModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
});
document.querySelectorAll('[data-close-about]').forEach(el => el.addEventListener('click', () => {
  aboutModal.classList.remove('open');
  aboutModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}));

$('#scanBtn').addEventListener('click', () => {
  if (!selected) return;
  const payload = encodeURIComponent(JSON.stringify(selected));
  window.location.href = `ar.html?experience=${payload}`;
});

window.addEventListener('load', () => setTimeout(() => $('#splash').classList.add('hidden'), 1350));
