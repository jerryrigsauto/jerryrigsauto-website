const THEME_KEY = 'jerry-rigs-theme';
const root = document.documentElement;
const themeToggle = document.querySelector('[data-theme-toggle]');
const themeLabel = document.querySelector('[data-theme-label]');
const themeColor = document.querySelector('meta[data-theme-color]');

function getStoredTheme() {
  try {
    return localStorage.getItem(THEME_KEY);
  } catch {
    return null;
  }
}

function storeTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Local storage can be unavailable in some privacy modes.
  }
}

function applyTheme(theme, save = false) {
  const normalizedTheme = theme === 'light' ? 'light' : 'dark';
  root.dataset.theme = normalizedTheme;

  if (themeToggle) {
    themeToggle.checked = normalizedTheme === 'light';
    themeToggle.setAttribute(
      'aria-label',
      normalizedTheme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'
    );
  }

  if (themeLabel) {
    themeLabel.textContent = normalizedTheme === 'light' ? 'Light mode' : 'Dark mode';
  }

  document.querySelectorAll('[data-theme-logo]').forEach(logo => {
    const nextSource =
      normalizedTheme === 'light'
        ? logo.dataset.lightSrc
        : logo.dataset.darkSrc;

    if (nextSource && logo.getAttribute('src') !== nextSource) {
      logo.setAttribute('src', nextSource);
    }
  });

  if (themeColor) {
    themeColor.setAttribute('content', normalizedTheme === 'light' ? '#ffffff' : '#0e1215');
  }

  if (save) storeTheme(normalizedTheme);
}

applyTheme(getStoredTheme() || root.dataset.theme || 'dark');

if (themeToggle) {
  themeToggle.addEventListener('change', () => {
    applyTheme(themeToggle.checked ? 'light' : 'dark', true);
  });
}

const menuButton = document.querySelector('[data-menu-button]');
const navLinks = document.querySelector('[data-nav-links]');

if (menuButton && navLinks) {
  menuButton.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
    });
  });
}

const currentPage = window.location.pathname.split('/').pop() || 'index.html';

document.querySelectorAll('[data-nav-link]').forEach(link => {
  if (link.getAttribute('href') === currentPage) {
    link.classList.add('active');
    link.setAttribute('aria-current', 'page');
  }
});

document.querySelectorAll('[data-year]').forEach(year => {
  year.textContent = new Date().getFullYear();
});

const dateInput = document.querySelector('input[type="date"]');
if (dateInput) {
  const today = new Date();
  const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
    .toISOString()
    .split('T')[0];

  dateInput.min = localDate;
}

const appointmentForm = document.querySelector('#appointment-form');

if (appointmentForm) {
  const serviceInputs = appointmentForm.querySelectorAll('input[name="services[]"]');
  const serviceError = appointmentForm.querySelector('#service-error');
  const status = appointmentForm.querySelector('#form-status');

  function validateServices() {
    const hasService = Array.from(serviceInputs).some(input => input.checked);

    if (serviceError) {
      serviceError.textContent = hasService ? '' : 'Select at least one service.';
    }

    return hasService;
  }

  serviceInputs.forEach(input => {
    input.addEventListener('change', validateServices);
  });

  appointmentForm.addEventListener('reset', () => {
    if (serviceError) serviceError.textContent = '';

    if (status) {
      status.textContent = '';
      status.className = 'status';
    }
  });

  appointmentForm.addEventListener('submit', event => {
    event.preventDefault();

    if (!validateServices()) {
      if (status) {
        status.textContent = 'Please select at least one service before submitting your request.';
        status.className = 'status error show';
      }

      const serviceSection = appointmentForm.querySelector('#service-options');
      if (serviceSection) {
        serviceSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      return;
    }

    if (status) {
      status.textContent =
        'Appointment request captured in the page. This request is not confirmed until Jerry-Rigs reviews and accepts it. Connect the form to your email or booking backend before publishing the site.';
      status.className = 'status success show';
    }
  });
}
