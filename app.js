const experiences = [
  {
    id: 'menoclone-wordmark',
    title: 'MENOCLONE Wordmark',
    subtitle: 'Scan the MENOCLONE design',
    description: 'Point your camera at the MENOCLONE wordmark to unlock its augmented-reality experience.',
    artwork: './assets/images/menoclone-wordmark.png',
    model: './assets/models/signal-01.glb',
    targetMode: 'runtime',
    targetSourceImage: './assets/images/menoclone-wordmark.png',
    demoTargetImage: './assets/images/menoclone-wordmark.png',
    modelScale: 0.55,
    modelY: 0.05,
    modelZ: 0.05
  },
  {
    id: 'mnc-ufo',
    title: 'MNC UFO',
    subtitle: 'Scan the UFO design',
    description: 'Point your camera at the MNC UFO artwork to unlock its augmented-reality experience.',
    artwork: './assets/images/mnc-ufo.png',
    model: './assets/models/signal-03.glb',
    targetMode: 'runtime',
    targetSourceImage: './assets/images/mnc-ufo.png',
    demoTargetImage: './assets/images/mnc-ufo.png',
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
