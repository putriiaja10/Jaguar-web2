function checkLoginStatus() {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  const desktopLoginBtn = document.getElementById('desktop-login-btn');
  const desktopProfileBtn = document.getElementById('desktop-profile-btn');
  const desktopProfileMenu = document.getElementById('desktop-profile-menu');

  const mobileLoginBtn = document.getElementById('mobile-login-btn');
  const mobileProfileContainer = document.getElementById('mobile-profile-container');

  if (isLoggedIn) {
    if (desktopLoginBtn) desktopLoginBtn.classList.add('hidden');
    if (desktopProfileBtn) {
      desktopProfileBtn.classList.remove('hidden');
      desktopProfileBtn.classList.add('inline-flex');
    }
    if (mobileLoginBtn) mobileLoginBtn.classList.add('hidden');
    if (mobileProfileContainer) mobileProfileContainer.classList.remove('hidden');
  } else {
    if (desktopLoginBtn) desktopLoginBtn.classList.remove('hidden');
    if (desktopProfileBtn) {
      desktopProfileBtn.classList.add('hidden');
      desktopProfileBtn.classList.remove('inline-flex');
      if (desktopProfileMenu) desktopProfileMenu.classList.add('hidden');
    }
    if (mobileLoginBtn) mobileLoginBtn.classList.remove('hidden');
    if (mobileProfileContainer) mobileProfileContainer.classList.add('hidden');
  }
}

function handleLogout() {
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('userRole');
  window.location.href = 'tampilan/index.html';
}

document.addEventListener('DOMContentLoaded', () => {
  checkLoginStatus();

  const desktopLogoutBtn = document.getElementById('desktop-logout-btn');
  const mobileLogoutBtn = document.getElementById('mobile-logout-btn');

  if (desktopLogoutBtn) {
    desktopLogoutBtn.addEventListener('click', handleLogout);
  }
  if (mobileLogoutBtn) {
    mobileLogoutBtn.addEventListener('click', handleLogout);
  }

  const desktopProfileBtn = document.getElementById('desktop-profile-btn');
  const desktopProfileMenu = document.getElementById('desktop-profile-menu');

  if (desktopProfileBtn && desktopProfileMenu) {
    desktopProfileBtn.addEventListener('click', () => {
      const isExpanded =
        desktopProfileBtn.getAttribute('aria-expanded') === 'true' || false;
      desktopProfileBtn.setAttribute('aria-expanded', !isExpanded);
      desktopProfileMenu.classList.toggle('hidden');
    });

    document.addEventListener('click', (event) => {
      if (
        !desktopProfileBtn.contains(event.target) &&
        !desktopProfileMenu.contains(event.target)
      ) {
        desktopProfileMenu.classList.add('hidden');
        desktopProfileBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }
});
