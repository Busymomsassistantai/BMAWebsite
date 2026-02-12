// ===================================
// Text Splitting for Character/Word Animations
// ===================================
class TextSplitter {
  constructor(element, splitBy = 'chars') {
    this.element = element;
    this.splitBy = splitBy;
    this.originalText = element.textContent.trim();
  }

  split() {
    const text = this.originalText;
    if (this.splitBy === 'chars') {
      const chars = text.split('');
      this.element.innerHTML = chars.map((char, i) =>
        `<span class="char" style="--char-index: ${i}">${char === ' ' ? '&nbsp;' : char}</span>`
      ).join('');
    } else if (this.splitBy === 'words') {
      const words = text.split(' ');
      this.element.innerHTML = words.map((word, i) =>
        `<span class="word" style="--word-index: ${i}">${word}</span>`
      ).join(' ');
    }
  }
}

// ===================================
// Parallax Scroll Effect
// ===================================
function initParallax() {
  const parallaxElements = document.querySelectorAll('[data-scroll-speed]');

  if (parallaxElements.length === 0) return;

  let ticking = false;

  function updateParallax() {
    parallaxElements.forEach(el => {
      const speed = parseFloat(el.dataset.scrollSpeed) || 0.5;
      const rect = el.getBoundingClientRect();
      const scrollProgress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
      const yPos = -(scrollProgress - 0.5) * 100 * speed;

      el.style.transform = `translateY(${yPos}px)`;
    });

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }, { passive: true });

  updateParallax(); // Initial call
}

// ===================================
// Custom Cursor (Desktop Only)
// ===================================
function initCustomCursor() {
  if (window.innerWidth < 1024) return; // Desktop only

  const cursor = document.createElement('div');
  cursor.className = 'custom-cursor';
  document.body.appendChild(cursor);

  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Smooth cursor follow
  function animateCursor() {
    cursorX += (mouseX - cursorX) * 0.1;
    cursorY += (mouseY - cursorY) * 0.1;

    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';

    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // Expand on interactive elements
  const interactiveElements = 'a, button, .feature-card, input, textarea';
  document.querySelectorAll(interactiveElements).forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('cursor-expand'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-expand'));
  });
}

// ===================================
// Mobile Menu Toggle
// ===================================
document.addEventListener('DOMContentLoaded', function() {
  const menuToggle = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', function() {
      navMenu.classList.toggle('active');

      // Animate hamburger icon
      this.classList.toggle('active');
    });

    // Close menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
      link.addEventListener('click', function() {
        navMenu.classList.remove('active');
        menuToggle.classList.remove('active');
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
      const isClickInsideMenu = navMenu.contains(event.target);
      const isClickOnToggle = menuToggle.contains(event.target);

      if (!isClickInsideMenu && !isClickOnToggle && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        menuToggle.classList.remove('active');
      }
    });
  }
});

// ===================================
// Contact Form Handling
// ===================================
const contactForm = document.getElementById('contactForm');

if (contactForm) {
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();

    // Get form data
    const formData = new FormData(this);
    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');
    const file = formData.get('file');

    // Basic validation
    if (!name || !email) {
      showNotification('Please fill in all required fields.', 'error');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showNotification('Please enter a valid email address.', 'error');
      return;
    }

    // In a real application, you would send this data to a server
    // For now, we'll just simulate a successful submission
    console.log('Contact Form Submitted:', {
      name: name,
      email: email,
      message: message,
      file: file ? file.name : 'No file'
    });

    showNotification('Thank you for your message! We\'ll get back to you soon.', 'success');

    // Reset form
    this.reset();
  });
}

// ===================================
// Newsletter Form Handling
// ===================================
const newsletterForm = document.getElementById('newsletterForm');

if (newsletterForm) {
  newsletterForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const emailInput = this.querySelector('input[type="email"]');
    const email = emailInput.value.trim();

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showNotification('Please enter a valid email address.', 'error');
      return;
    }

    // In a real application, you would send this to a server
    console.log('Newsletter Subscription:', email);

    showNotification('Thank you for subscribing! Check your email for confirmation.', 'success');

    // Reset form
    this.reset();
  });
}

// ===================================
// Notification System
// ===================================
function showNotification(message, type = 'success') {
  // Remove any existing notifications
  const existingNotification = document.querySelector('.notification');
  if (existingNotification) {
    existingNotification.remove();
  }

  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;

  // Style the notification
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 24px;
    background-color: ${type === 'success' ? '#E89999' : '#f44336'};
    color: white;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(232, 153, 153, 0.3);
    z-index: 10000;
    font-family: 'Times New Roman', Times, serif;
    font-weight: 700;
    animation: slideInRight 0.3s ease-out;
  `;

  // Add animation keyframes if not already added
  if (!document.querySelector('#notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
      @keyframes slideInRight {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOutRight {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(400px);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Add to page
  document.body.appendChild(notification);

  // Remove after 5 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease-out';
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 5000);
}

// ===================================
// Smooth Scroll Enhancement
// ===================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const targetId = this.getAttribute('href');

    // Skip if it's just "#"
    if (targetId === '#') return;

    const targetElement = document.querySelector(targetId);

    if (targetElement) {
      e.preventDefault();

      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// ===================================
// Enhanced Scroll Animation Observer
// ===================================
const animationObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-inview');

      // Unobserve after animation (optional - allows for one-time animations)
      if (entry.target.dataset.animateOnce !== 'false') {
        animationObserver.unobserve(entry.target);
      }
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '-50px 0px -50px 0px'
});

// ===================================
// Additional Features Fullscreen Overlay
// ===================================
function initAdditionalFeatures() {
  const openBtn = document.getElementById('afOpenBtn');
  const closeBtn = document.getElementById('afCloseBtn');
  const overlay = document.getElementById('afOverlay');
  const slidesContainer = document.getElementById('afSlides');
  const counter = document.getElementById('afCounter');
  const slides = document.querySelectorAll('.af-slide');

  if (!openBtn || !overlay) return;

  const totalSlides = slides.length;

  // Open overlay
  openBtn.addEventListener('click', () => {
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    slidesContainer.scrollTop = 0;
    updateSlideVisibility();
    updateCounter();
  });

  // Close overlay
  closeBtn.addEventListener('click', closeOverlay);

  function closeOverlay() {
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
    // Reset slide animations
    slides.forEach(slide => slide.classList.remove('is-visible'));
  }

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) {
      closeOverlay();
    }
  });

  // Track which slide is in view and animate it
  function updateSlideVisibility() {
    const scrollTop = slidesContainer.scrollTop;
    const viewportHeight = slidesContainer.clientHeight;

    slides.forEach((slide, index) => {
      const slideTop = index * viewportHeight;
      const distance = Math.abs(scrollTop - slideTop);

      if (distance < viewportHeight * 0.5) {
        slide.classList.add('is-visible');
      } else {
        slide.classList.remove('is-visible');
      }
    });
  }

  // Update counter on scroll
  function updateCounter() {
    const scrollTop = slidesContainer.scrollTop;
    const viewportHeight = slidesContainer.clientHeight;
    const currentSlide = Math.round(scrollTop / viewportHeight) + 1;
    counter.textContent = `${currentSlide} / ${totalSlides}`;
  }

  // Listen for scroll inside overlay
  slidesContainer.addEventListener('scroll', () => {
    updateSlideVisibility();
    updateCounter();
  }, { passive: true });
}

// ===================================
// Cloud Parallax on Scroll
// ===================================
function initCloudParallax() {
  const aboutSection = document.getElementById('about');
  const clouds = document.querySelectorAll('.cloud');

  if (!aboutSection || clouds.length === 0) return;

  let ticking = false;

  function updateClouds() {
    const rect = aboutSection.getBoundingClientRect();
    const sectionTop = rect.top;
    const windowHeight = window.innerHeight;

    // Only animate when section is near the viewport
    if (sectionTop < windowHeight && sectionTop > -aboutSection.offsetHeight) {
      const scrollProgress = (windowHeight - sectionTop) / (windowHeight + aboutSection.offsetHeight);

      clouds.forEach(cloud => {
        const speed = parseFloat(cloud.dataset.scrollSpeed) || 0.3;
        const yOffset = (scrollProgress - 0.5) * 200 * speed;
        const xOffset = (scrollProgress - 0.5) * 60 * speed;

        cloud.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
      });
    }

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateClouds);
      ticking = true;
    }
  }, { passive: true });

  updateClouds();
}

// ===================================
// Scroll Progress Bar
// ===================================
function initScrollProgress() {
  // Create progress bar element
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  document.body.appendChild(progressBar);

  // Update progress on scroll
  window.addEventListener('scroll', () => {
    const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (window.scrollY / windowHeight) * 100;
    progressBar.style.width = scrolled + '%';
  }, { passive: true });
}

// ===================================
// Parallax Hero Background
// ===================================
function initHeroParallax() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  let ticking = false;

  function updateHeroParallax() {
    const scrolled = window.scrollY;
    const heroHeight = hero.offsetHeight;

    if (scrolled < heroHeight) {
      hero.style.transform = `translateY(${scrolled * 0.5}px)`;
      hero.style.opacity = 1 - (scrolled / heroHeight) * 0.5;
    }

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateHeroParallax);
      ticking = true;
    }
  }, { passive: true });
}

// ===================================
// Stagger Animation for Sections
// ===================================
function initStaggerAnimations() {
  const sections = document.querySelectorAll('.about-subsection');

  sections.forEach((section, index) => {
    section.style.animationDelay = `${index * 0.2}s`;
    section.style.animationDuration = '1s';
    section.style.animationFillMode = 'both';
  });
}

// ===================================
// Initialize All Animations
// ===================================
document.addEventListener('DOMContentLoaded', function() {
  // Initialize text splitting for split-text animations
  document.querySelectorAll('.split-text').forEach(el => {
    const splitter = new TextSplitter(el, el.dataset.split || 'chars');
    splitter.split();
  });

  // Observe all elements with data-animate attribute
  document.querySelectorAll('[data-animate]').forEach(el => {
    animationObserver.observe(el);
  });

  // Initialize additional features overlay
  initAdditionalFeatures();

  // Initialize scroll progress bar
  initScrollProgress();

  // Initialize hero parallax
  initHeroParallax();

  // Initialize stagger animations
  initStaggerAnimations();

  // Initialize cloud parallax
  initCloudParallax();

  // Initialize parallax scroll effects
  initParallax();

  // Initialize custom cursor (desktop only)
  initCustomCursor();
});

// ===================================
// Console Welcome Message
// ===================================
console.log('%c Busy Moms Assistant AI ', 'background: #E89999; color: #fff; font-size: 20px; padding: 10px; border-radius: 5px;');
console.log('%c Empowering Moms with AI Solutions ', 'color: #633F3A; font-size: 14px; font-weight: 600;');
