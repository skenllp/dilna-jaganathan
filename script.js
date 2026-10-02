// ---- Opening (letter-unfold) animation ----
const cover = document.getElementById('cover');
const main = document.getElementById('main');
document.documentElement.classList.add('locked');

// ---- Background music setup ----
const audio = document.getElementById('bg-music');
const muteBtn = document.getElementById('mute-btn');
const iconSound = document.getElementById('icon-sound');
const iconMuted = document.getElementById('icon-muted');

let musicStarted = false; // becomes true only once play() actually succeeds
let opened = false;       // guards against openInvite() running more than once

// Single source of truth for starting music. Safe to call repeatedly —
// it only marks success once the promise actually resolves, so an early
// failed attempt (e.g. a gesture that doesn't count on some browsers)
// never blocks a later, better attempt.
function tryPlayMusic() {
  if (musicStarted) return;
  audio.volume = 0.45;
  audio.play().then(() => {
    musicStarted = true;
  }).catch(() => {
    // still blocked — a later user gesture will try again
  });
}

function openInvite() {
  if (opened) return; // prevent double-fire from bubbling touch/click events
  opened = true;

  cover.classList.add('open');
  main.classList.add('show');
  document.documentElement.classList.remove('locked');
  setTimeout(() => {
    cover.classList.add('hidden');
  }, 1250);

  // This tap is a guaranteed trusted gesture — best chance for audio to start
  tryPlayMusic();
}

// Only one listener needed on the outer cover — tapToOpen is inside it,
// so a tap anywhere on the cover (including the seal) already bubbles here.
cover.addEventListener('click', openInvite);
cover.addEventListener('touchend', (e) => {
  if (e.target.closest('#mute-btn')) return; // let the mute button handle its own taps
  e.preventDefault();
  openInvite();
}, { passive: false });

// ---- Countdown timer ----
// Target date: October 11, 2026 at 4:30 PM IST (UTC+5:30)
const target = new Date('2026-10-11T16:30:00+05:30').getTime();

function tick() {
  const now = Date.now();
  let diff = Math.max(0, target - now);

  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  const pad = n => String(n).padStart(2, '0');

  document.getElementById('cd-days').textContent = pad(d);
  document.getElementById('cd-hours').textContent = pad(h);
  document.getElementById('cd-mins').textContent = pad(m);
  document.getElementById('cd-secs').textContent = pad(s);
}

tick();
setInterval(tick, 1000);

// ---- Background music: additional fallback attempts ----
// Covers people who scroll or tap elsewhere before hitting "tap to open"
// (e.g. if opened is somehow already true from a prior state).
document.addEventListener('click', tryPlayMusic, { once: true });
document.addEventListener('scroll', tryPlayMusic, { once: true, passive: true });
document.addEventListener('touchstart', tryPlayMusic, { once: true, passive: true });

// Also try immediate autoplay on load (works on some desktop browsers,
// almost always blocked on mobile — that's fine, the gesture-based
// attempts above are the real path on phones).
window.addEventListener('load', tryPlayMusic);

// ---- Mute / unmute toggle ----
muteBtn.addEventListener('click', (e) => {
  e.stopPropagation(); // don't let this bubble to cover's click/touchend
  tryPlayMusic();
  if (audio.paused) {
    audio.play().catch(() => {});
    iconSound.style.display = '';
    iconMuted.style.display = 'none';
  } else {
    audio.pause();
    iconSound.style.display = 'none';
    iconMuted.style.display = '';
  }
});