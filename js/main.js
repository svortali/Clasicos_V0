/* ============================================================
   TODO CLÁSICOS — Main JS
   ============================================================ */

const WA_NUMBER  = '1139475311';
const WA_MESSAGE = 'Hola, me gustaría consultar sobre el alquiler de un auto clásico.';
const WA_LINK    = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(WA_MESSAGE)}`;

/* ─── WhatsApp links ─────────────────────────────────────── */

function initWhatsApp() {
  document.querySelectorAll('[data-wa]').forEach(el => {
    const msg = el.dataset.waMsg || WA_MESSAGE;
    const link = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
    if (el.tagName === 'A') {
      el.href = link;
      el.target = '_blank';
      el.rel = 'noopener noreferrer';
    }
    el.addEventListener('click', () => {
      if (window.fbq) fbq('track', 'Lead');
    });
  });
}

/* ─── Navigation scroll behaviour ───────────────────────── */

function initNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;

  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile toggle
  const toggle = nav.querySelector('.nav-toggle');
  const mobileMenu = document.getElementById('nav-mobile');
  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('open');
      document.body.style.overflow = open ? 'hidden' : '';
      const spans = toggle.querySelectorAll('span');
      if (open) {
        spans[0].style.transform = 'translateY(6px) rotate(45deg)';
        spans[1].style.opacity   = '0';
        spans[2].style.transform = 'translateY(-6px) rotate(-45deg)';
      } else {
        spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
      }
    });
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
        const spans = toggle.querySelectorAll('span');
        spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
      });
    });
  }
}

/* ─── Smooth anchor scroll ──────────────────────────────── */

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ─── Scroll reveal (IntersectionObserver) ───────────────── */

function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
}

/* ─── Hero entrance (GSAP) — opacity-safe version ───────── */

function initHeroGSAP() {
  if (typeof gsap === 'undefined') return;

  // Only animate transform (no opacity) so button is never invisible
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.from('.hero-eyebrow',  { y: 18, duration: 0.8, delay: 0.2 })
    .from('.hero-title',    { y: 50, duration: 1.0 }, '-=0.5')
    .from('.hero-lead',     { y: 24, duration: 0.8 }, '-=0.55')
    .from('.hero-actions',  { y: 20, duration: 0.6 }, '-=0.4')
    .from('.hero-scroll-hint', { opacity: 0, duration: 0.8 }, '-=0.2');

  // Subtle hero media scale-in
  const media = document.querySelector('.hero-media');
  if (media) {
    setTimeout(() => media.classList.add('loaded'), 100);
  }
}

/* ─── Marquee – duplicate content for seamless loop ─────── */

function initMarquee() {
  const track = document.querySelector('.marquee-track');
  if (!track) return;
  // Clone items so the loop is seamless
  track.innerHTML += track.innerHTML;
}

/* ─── Dropdown navigation ───────────────────────────────── */

function initDropdowns() {
  const items = document.querySelectorAll('.nav-item--dropdown');
  items.forEach(item => {
    let closeTimer;

    const open  = () => { clearTimeout(closeTimer); item.classList.add('open'); };
    const close = () => { closeTimer = setTimeout(() => item.classList.remove('open'), 120); };

    item.addEventListener('mouseenter', open);
    item.addEventListener('mouseleave', close);

    // Touch / click toggle
    item.querySelector('.nav-trigger')?.addEventListener('click', e => {
      e.stopPropagation();
      item.classList.toggle('open');
    });
  });

  document.addEventListener('click', () => {
    items.forEach(i => i.classList.remove('open'));
  });
}

/* ─── Testimonials rotator ───────────────────────────────── */

function initTestimonials() {
  const cards = document.querySelectorAll('.tst-card');
  const dots  = document.querySelectorAll('.tst-dot');
  if (!cards.length) return;

  let current = 0;
  let timer;

  function goTo(index) {
    cards[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = index;
    cards[current].classList.add('active');
    dots[current].classList.add('active');
  }

  function startTimer() {
    clearInterval(timer);
    timer = setInterval(() => goTo((current + 1) % cards.length), 6000);
  }

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      goTo(parseInt(dot.dataset.index));
      startTimer();
    });
  });

  startTimer();
}

/* ─── Carousel ───────────────────────────────────────────── */

function initCarousels() {
  document.querySelectorAll('[data-carousel]').forEach(carousel => {
    const track  = carousel.querySelector('.carousel-track');
    const slides = track.querySelectorAll('img');
    const dots   = carousel.querySelectorAll('.carousel-dot');
    const prev   = carousel.querySelector('.carousel-btn--prev');
    const next   = carousel.querySelector('.carousel-btn--next');
    let current  = 0;
    let timer;
    let touchStartX = 0;

    function go(n) {
      current = (n + slides.length) % slides.length;
      track.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('active', i === current));
    }

    function startTimer() {
      clearInterval(timer);
      timer = setInterval(() => go(current + 1), 4500);
    }

    prev.addEventListener('click', () => { go(current - 1); startTimer(); });
    next.addEventListener('click', () => { go(current + 1); startTimer(); });
    dots.forEach((d, i) => d.addEventListener('click', () => { go(i); startTimer(); }));

    carousel.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    carousel.addEventListener('touchend', e => {
      const delta = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(delta) > 40) { go(delta > 0 ? current + 1 : current - 1); startTimer(); }
    });

    startTimer();
  });
}

/* ─── INIT ───────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  initWhatsApp();
  initNav();
  initSmoothScroll();
  initReveal();
  initMarquee();
  initHeroGSAP();
  initDropdowns();
  initTestimonials();
  initCarousels();
});

window.TodoClasicos = { WA_LINK };
