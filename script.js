// Obtenemos el contenedor que agrupa el panel + botón
const sidebarContainer = document.getElementById('sidebarContainer');
const toggleBtn = document.getElementById('toggleBtn');

function syncMapAfterSidebarToggle() {
  if (!window.map) return;
  window.requestAnimationFrame(() => {
    window.map.invalidateSize({ pan: false });
    window.setTimeout(() => {
      window.map.invalidateSize({ pan: false });
      if (typeof window.adjustMapForSidebar === 'function') {
        window.adjustMapForSidebar();
      }
    }, 220);
  });
}

if (sidebarContainer && toggleBtn) {
  toggleBtn.addEventListener('click', () => {
    sidebarContainer.classList.toggle('oculto');
    const expanded = !sidebarContainer.classList.contains('oculto');
    toggleBtn.setAttribute('aria-expanded', String(expanded));
    syncMapAfterSidebarToggle();
  });

  toggleBtn.setAttribute('aria-expanded', 'true');
}

window.addEventListener('resize', syncMapAfterSidebarToggle);


