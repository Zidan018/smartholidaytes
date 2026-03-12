import './style.css'

// ── Fix: Real viewport height for mobile browsers ──────────────
// 100vh on mobile includes the address bar, making hero taller than visible.
// This sets --real-vh to actual window.innerHeight so hero fits perfectly.
const setRealVH = () => {
  document.documentElement.style.setProperty('--real-vh', `${window.innerHeight}px`);
};
setRealVH();
window.addEventListener('resize', setRealVH, { passive: true });

document.addEventListener('DOMContentLoaded', () => {
  // Mobile Menu Toggle
  const navbar = document.getElementById('navbar');
  const menuToggle = document.querySelector('.mobile-menu-toggle');

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      navbar.classList.toggle('menu-open');
    });
  }

  // Navbar Scroll Effect
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Smooth Scrolling for Anchor Links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();

      // Close mobile menu if open
      if (navbar.classList.contains('menu-open')) {
        navbar.classList.remove('menu-open');
      }

      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        // Account for fixed header
        const headerOffset = 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // Intersection Observer for Animations (Scroll Reveal)
  const animationObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // Trigger only once
      }
    });
  }, {
    root: null,
    threshold: 0.15, // Trigger when 15% visible
    rootMargin: '0px 0px -50px 0px'
  });

  // Target elements to animate
  const elementsToAnimate = document.querySelectorAll('.fade-in-up, .slide-in-left, .slide-in-right, .zoom-in, .reveal');

  // Trigger hero animations immediately (CSS handles stagger)
  const heroElements = document.querySelectorAll('.hero .fade-in-up');
  heroElements.forEach((el) => {
    setTimeout(() => {
      el.classList.add('visible');
    }, 50);
  });

  // Observe other elements
  elementsToAnimate.forEach(el => {
    if (!el.closest('.hero')) {
      animationObserver.observe(el);
    }
  });

  // Interactive FAQ
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    item.addEventListener('click', function () {
      // Optional: Close other open FAQs
      faqItems.forEach(otherItem => {
        if (otherItem !== this && otherItem.hasAttribute('open')) {
          otherItem.removeAttribute('open');
        }
      });
    });
  });

  // Hero Slider Logic
  const sliderContainer = document.querySelector('#hero-slider');
  const sliderDotsContainer = document.querySelector('.slider-dots');
  
  if (sliderContainer && sliderDotsContainer) {
    // 1. Get all slides and randomize them
    let slidesArray = Array.from(sliderContainer.querySelectorAll('.slide'));
    
    // Shuffle array (Fisher-Yates)
    for (let i = slidesArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [slidesArray[i], slidesArray[j]] = [slidesArray[j], slidesArray[i]];
    }
    
    // Remove old slides
    slidesArray.forEach(slide => slide.remove());
    
    // Append in new order
    const nextBtnEl = sliderContainer.querySelector('.next-btn');
    slidesArray.forEach(slide => {
      // Insert before the controls
      sliderContainer.insertBefore(slide, sliderContainer.querySelector('.slider-btn'));
    });
    
    // 2. Generate dots
    sliderDotsContainer.innerHTML = '';
    slidesArray.forEach((_, index) => {
      const dot = document.createElement('span');
      dot.className = 'dot';
      sliderDotsContainer.appendChild(dot);
    });

    // 3. Initialize slider
    const slides = document.querySelectorAll('#hero-slider .slide');
    const dots = document.querySelectorAll('.slider-dots .dot');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    let currentSlide = 0;
    let slideInterval;

    if (slides.length > 0) {
      // Set first active
      slides[0].classList.add('active');
      if(dots[0]) dots[0].classList.add('active');

      const nextSlide = () => {
        slides[currentSlide].classList.remove('active');
        if(dots[currentSlide]) dots[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
        if(dots[currentSlide]) dots[currentSlide].classList.add('active');
      };

      const prevSlideFn = () => {
        slides[currentSlide].classList.remove('active');
        if(dots[currentSlide]) dots[currentSlide].classList.remove('active');
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        slides[currentSlide].classList.add('active');
        if(dots[currentSlide]) dots[currentSlide].classList.add('active');
      };

      const resetInterval = () => {
        clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, 5000);
      };

      if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); resetInterval(); });
      if (prevBtn) prevBtn.addEventListener('click', () => { prevSlideFn(); resetInterval(); });

      dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
          slides[currentSlide].classList.remove('active');
          if(dots[currentSlide]) dots[currentSlide].classList.remove('active');
          currentSlide = index;
          slides[currentSlide].classList.add('active');
          if(dots[currentSlide]) dots[currentSlide].classList.add('active');
          resetInterval();
        });
      });

      slideInterval = setInterval(nextSlide, 5000);
    }
  }

  // ── Overview Mini Slider ──────────────────────────────
  const ovSlider = document.getElementById('overviewSlider');
  if (ovSlider) {
    const ovSlides = ovSlider.querySelectorAll('.ov-slide');
    const ovDots = ovSlider.querySelectorAll('.ov-dot');
    const ovPrev = ovSlider.querySelector('.ov-prev');
    const ovNext = ovSlider.querySelector('.ov-next');
    let ovCurrent = 0;

    const goTo = (n) => {
      ovSlides[ovCurrent].classList.remove('active');
      ovDots[ovCurrent].classList.remove('active');
      ovCurrent = (n + ovSlides.length) % ovSlides.length;
      ovSlides[ovCurrent].classList.add('active');
      ovDots[ovCurrent].classList.add('active');
    };

    if (ovPrev) ovPrev.addEventListener('click', () => goTo(ovCurrent - 1));
    if (ovNext) ovNext.addEventListener('click', () => goTo(ovCurrent + 1));
    ovDots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));

    // Auto-advance every 4s
    setInterval(() => goTo(ovCurrent + 1), 4000);
  }
});
