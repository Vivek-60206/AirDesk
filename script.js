const toggle = document.querySelector('.menu-toggle');
const links = document.querySelector('.nav-links');

function setMenu(open) {
  if (!toggle || !links) return;
  links.classList.toggle('open', open);
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
}

if (toggle && links) {
  toggle.addEventListener('click', () => {
    setMenu(toggle.getAttribute('aria-expanded') !== 'true');
  });

  links.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => setMenu(false));
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && links.classList.contains('open')) {
      setMenu(false);
      toggle.focus();
    }
  });

  document.addEventListener('click', event => {
    if (links.classList.contains('open') && !links.contains(event.target) && !toggle.contains(event.target)) {
      setMenu(false);
    }
  });
}

const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

const revealItems = document.querySelectorAll('.feature-card, .process-step, .gesture-row, .demo-card, .architecture-card');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if ('IntersectionObserver' in window && !reduceMotion) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealItems.forEach(element => {
    element.classList.add('reveal');
    observer.observe(element);
  });
} else {
  revealItems.forEach(element => element.classList.add('visible'));
}
