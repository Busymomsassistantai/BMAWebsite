import { saveFormData } from './db.js'
import { requestDeletion } from './deletion.js'

// ===================================
// Top Announcement Bar
// ===================================
function initTopbar() {
  const topbar = document.getElementById('topbar');
  const closeBtn = document.getElementById('topbarClose');

  if (!topbar || !closeBtn) return;

  closeBtn.addEventListener('click', () => {
    topbar.classList.add('is-hidden');
  });
}

// ===================================
// Header Scroll Effect
// ===================================
function initHeaderScroll() {
  const header = document.getElementById('siteHeader');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }, { passive: true });
}

// ===================================
// Mobile Menu
// ===================================
function initMobileMenu() {
  const toggle = document.getElementById('menuToggle');
  const menu = document.getElementById('mobileMenu');

  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('is-active');
    menu.classList.toggle('is-open');
    document.body.style.overflow = menu.classList.contains('is-open') ? 'hidden' : '';
  });

  // Close on link click
  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('is-active');
      menu.classList.remove('is-open');
      document.body.style.overflow = '';
    });
  });
}

// ===================================
// Feature Slider
// ===================================
function initSlider() {
  const track = document.getElementById('sliderTrack');
  const prevBtn = document.getElementById('sliderPrev');
  const nextBtn = document.getElementById('sliderNext');
  const counter = document.getElementById('sliderCounter');

  if (!track || !prevBtn || !nextBtn) return;

  const slides = track.querySelectorAll('.slide');
  const total = slides.length;
  let current = 0;

  function goTo(index) {
    if (index < 0) index = total - 1;
    if (index >= total) index = 0;
    current = index;
    track.style.transform = `translateX(-${current * 100}%)`;
    if (counter) counter.textContent = `${current + 1} / ${total}`;
  }

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    const slider = document.getElementById('featureSlider');
    if (!slider) return;
    const rect = slider.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;
    if (!inView) return;

    if (e.key === 'ArrowLeft') goTo(current - 1);
    if (e.key === 'ArrowRight') goTo(current + 1);
  });

  goTo(0);
}

// ===================================
// Scroll Reveal for Sections
// ===================================
function initScrollReveal() {
  const sections = document.querySelectorAll('.section');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '-40px 0px -40px 0px'
  });

  sections.forEach(section => observer.observe(section));
}

// ===================================
// Scroll Progress Bar
// ===================================
function initScrollProgress() {
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  document.body.appendChild(bar);

  window.addEventListener('scroll', () => {
    const total = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progress = (window.scrollY / total) * 100;
    bar.style.width = progress + '%';
  }, { passive: true });
}

// ===================================
// Smooth Scroll for Anchor Links
// ===================================
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// ===================================
// Contact Form Handling
// ===================================
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    const formData = new FormData(this);
    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');

    if (!name || !email) {
      showNotification('Please fill in all required fields.', 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showNotification('Please enter a valid email address.', 'error');
      return;
    }

    const success = await saveFormData({ name, email, message });
    if (!success) {
      showNotification('Failed to save your message. Please try again.', 'error');
      return;
    }
    showNotification('Thank you for your message! We\'ll get back to you soon.', 'success');
    this.reset();
  });
}

// ===================================
// Newsletter Form Handling
// ===================================
function initNewsletterForm() {
  const form = document.getElementById('newsletterForm');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    const emailInput = this.querySelector('input[type="email"]');
    const email = emailInput.value.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showNotification('Please enter a valid email address.', 'error');
      return;
    }

    console.log('Newsletter Subscription:', email);
    showNotification('Thank you for subscribing!', 'success');
    this.reset();
  });
}

// ===================================
// Notification System
// ===================================
function showNotification(message, type = 'success') {
  const existing = document.querySelector('.notification');
  if (existing) existing.remove();

  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;

  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 24px;
    background: ${type === 'success' ? '#1a1a1a' : '#d32f2f'};
    color: #fff;
    border: 2px solid #1a1a1a;
    border-radius: 0;
    box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    z-index: 10000;
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-weight: 600;
    font-size: 14px;
    animation: notifSlideIn 0.3s ease-out;
  `;

  if (!document.querySelector('#notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
      @keyframes notifSlideIn {
        from { transform: translateX(120%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes notifSlideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(120%); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'notifSlideOut 0.3s ease-out forwards';
    setTimeout(() => notification.remove(), 300);
  }, 4000);
}

// ===================================
// Account Deletion Form
// ===================================
function initDeletionForm() {
  const form = document.getElementById('deletionForm');
  if (!form) return;

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = this.querySelector('input[type="email"]').value.trim();
    if (!email) return;
    await requestDeletion(email);
    this.innerHTML = '<p class="deletion-confirm">If an account exists for this email, we\'ve sent a confirmation link. Please check your inbox.</p>';
  });
}

// ===================================
// Initialize Everything
// ===================================
document.addEventListener('DOMContentLoaded', function() {
  initTopbar();
  initHeaderScroll();
  initMobileMenu();
  initSlider();
  initScrollReveal();
  initScrollProgress();
  initSmoothScroll();
  initContactForm();
  initNewsletterForm();
  initDeletionForm();
});
