/**
 * AVIVU — slider.js
 * Tác giả: Thành viên A
 * Chức năng: Hero banner auto-play slider
 */

(function () {
  const slides = document.querySelectorAll('.hero-slide');
  const dots   = document.querySelectorAll('.hero-dot');
  const prev   = document.getElementById('heroPrev');
  const next   = document.getElementById('heroNext');
  if (!slides.length) return;

  let current = 0;
  let timer;

  function goTo(index) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  }

  function startAuto() { timer = setInterval(() => goTo(current + 1), 5000); }
  function stopAuto()  { clearInterval(timer); }

  // Controls
  prev?.addEventListener('click', () => { stopAuto(); goTo(current - 1); startAuto(); });
  next?.addEventListener('click', () => { stopAuto(); goTo(current + 1); startAuto(); });
  dots.forEach(dot => {
    dot.addEventListener('click', () => { stopAuto(); goTo(+dot.dataset.index); startAuto(); });
  });

  // Pause on hover
  document.getElementById('hero')?.addEventListener('mouseenter', stopAuto);
  document.getElementById('hero')?.addEventListener('mouseleave', startAuto);

  startAuto();
})();
