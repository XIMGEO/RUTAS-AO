// Obtenemos el contenedor que agrupa el panel + botón
const sidebarContainer = document.getElementById('sidebarContainer');
const toggleBtn = document.getElementById('toggleBtn');

if (sidebarContainer && toggleBtn) {
  toggleBtn.addEventListener('click', () => {
    sidebarContainer.classList.toggle('oculto');
    const expanded = !sidebarContainer.classList.contains('oculto');
    toggleBtn.setAttribute('aria-expanded', String(expanded));
  });

  toggleBtn.setAttribute('aria-expanded', 'true');
}


