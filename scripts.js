document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

const navToggle = document.querySelector('.nav-toggle');
const navBar = navToggle?.closest('.topbar');
const navLinks = document.querySelectorAll('.nav-links a');

if (navToggle) {
  navToggle.setAttribute('aria-expanded', 'false');

  navToggle.addEventListener('click', () => {
    const isOpen = navBar?.classList.toggle('nav-open');
    navToggle.setAttribute('aria-expanded', String(!!isOpen));
  });
}

navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    if (navBar?.classList.contains('nav-open')) {
      navBar.classList.remove('nav-open');
      navToggle?.setAttribute('aria-expanded', 'false');
    }
  });
});

const revealTargets = document.querySelectorAll('section, .card, .case-card, .cta-box, .hero h1, .hero-text, .hero-actions, label');
revealTargets.forEach((el) => el.classList.add('reveal'));

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-active');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18 });

  revealTargets.forEach((el) => revealObserver.observe(el));
} else {
  revealTargets.forEach((el) => el.classList.add('reveal-active'));
}

const topbar = document.querySelector('.topbar');
const topbarScrollThreshold = 28;

if (topbar) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > topbarScrollThreshold) {
      topbar.classList.add('scrolled');
    } else {
      topbar.classList.remove('scrolled');
    }
  });
}

