const sidebar = document.getElementById('sidebar-menu');
const toggleButton = document.getElementById('toggle-sidebar');
const toggleButtonMobile = document.getElementById('toggle-sidebar-mobile');
const closeButtonMobile = document.getElementById('close-sidebar-mobile');
const mainContent = document.getElementById('main-content');
const sidebarTitle = document.getElementById('sidebar-title');
const currentYear = new Date().getFullYear();

const yearElements = document.querySelectorAll('[id^="year-"]');
yearElements.forEach(el => {
    el.textContent = currentYear;
});

function isDesktop() {
    return window.innerWidth >= 768;
}

function initializeSidebar() {
    if (!sidebar || !mainContent) return;

    if (isDesktop()) {
        sidebar.classList.remove('open', 'w-64');
        sidebar.classList.add('md:w-20');
        mainContent.classList.remove('open-margin');

        if (sidebarTitle) sidebarTitle.classList.add('hidden');

        mainContent.classList.remove('opacity-50', 'pointer-events-none');

    } else {
        sidebar.classList.remove('open', 'md:w-20');
        mainContent.classList.remove('open-margin', 'opacity-50', 'pointer-events-none');
        if (sidebarTitle) sidebarTitle.classList.remove('hidden');
    }
}

if (toggleButton) {
    toggleButton.addEventListener('click', () => {
        if (isDesktop()) {
            sidebar.classList.toggle('open');
            mainContent.classList.toggle('open-margin');

            // Logika mengubah lebar sidebar di desktop
            if (sidebar.classList.contains('open')) {
                sidebar.classList.remove('md:w-20');
                sidebar.classList.add('w-64');
            } else {
                sidebar.classList.remove('w-64');
                sidebar.classList.add('md:w-20');
            }

            if (sidebarTitle) {
                if (sidebar.classList.contains('open')) {
                    sidebarTitle.classList.remove('hidden');
                } else {
                    sidebarTitle.classList.add('hidden');
                }
            }
        }
    });
}

if (toggleButtonMobile) {
    toggleButtonMobile.addEventListener('click', () => {
        if (!isDesktop()) {
            sidebar.classList.remove('md:w-20'); // Pastikan lebar kecil desktop dihapus di mobile
            sidebar.classList.add('open');
            mainContent.classList.add('opacity-50', 'pointer-events-none');
        }
    });
}

if (closeButtonMobile) {
    closeButtonMobile.addEventListener('click', () => {
        if (!isDesktop()) {
            sidebar.classList.remove('open');
            mainContent.classList.remove('opacity-50', 'pointer-events-none');
        }
    });
}

if (mainContent) {
    mainContent.addEventListener('click', (e) => {
        if (sidebar.classList.contains('open') && !isDesktop()) {
            // Periksa apakah klik terjadi di luar sidebar tetapi pada mainContent
            if (!sidebar.contains(e.target) && e.target === mainContent) {
                sidebar.classList.remove('open');
                mainContent.classList.remove('opacity-50', 'pointer-events-none');
            }
        }
    });
}

let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(initializeSidebar, 100);
});

initializeSidebar();