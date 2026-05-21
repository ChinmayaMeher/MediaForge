// Mobile nav toggle
document.getElementById('navToggle')?.addEventListener('click', () => {
  document.querySelector('.nav__links').classList.toggle('open');
});

// Active link highlight
document.querySelectorAll('.nav__links a').forEach(link => {
  if (link.href === window.location.href) link.classList.add('active');
});
