document.addEventListener('DOMContentLoaded', () => {
  const dateEl = document.getElementById('todayDate');
  if (dateEl) {
    const now = new Date();
    dateEl.textContent = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  const toggle = document.getElementById('menuToggle');
  const shell = document.querySelector('.app-shell');
  if (toggle && shell) {
    toggle.addEventListener('click', () => {
      shell.classList.toggle('sidebar-open');
    });
  }
});
