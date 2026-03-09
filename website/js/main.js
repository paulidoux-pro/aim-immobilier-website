/* ==========================================================================
   AIM Immobilier — Main JavaScript
   Scroll animations, navigation, form handling
   ========================================================================== */

(function () {
  'use strict';

  // ---------- Remove loading class ----------
  document.body.classList.add('loading');
  window.addEventListener('load', () => {
    document.body.classList.remove('loading');
    // Trigger hero animations after a short delay
    setTimeout(revealHeroElements, 100);
  });

  // ---------- Navbar scroll effect ----------
  const navbar = document.getElementById('navbar');
  let lastScroll = 0;

  function handleNavScroll() {
    const scrollY = window.scrollY;
    if (scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    lastScroll = scrollY;
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });

  // ---------- Mobile menu toggle ----------
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.contains('open');
      navMenu.classList.toggle('open');
      navToggle.classList.toggle('active');
      navToggle.setAttribute('aria-expanded', !isOpen);
      document.body.classList.toggle('menu-open');
    });

    // Close menu on link click
    navMenu.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('menu-open');
      });
    });

    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('open')) {
        navMenu.classList.remove('open');
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('menu-open');
      }
    });
  }

  // ---------- Scroll Reveal (IntersectionObserver) ----------
  function revealHeroElements() {
    const heroReveals = document.querySelectorAll('.hero .reveal');
    heroReveals.forEach((el) => {
      const delay = parseInt(el.dataset.delay || '0', 10);
      setTimeout(() => {
        el.classList.add('active');
      }, delay);
    });
  }

  function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal:not(.hero .reveal)');

    if (!('IntersectionObserver' in window)) {
      // Fallback: show all immediately
      reveals.forEach((el) => el.classList.add('active'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const delay = parseInt(el.dataset.delay || '0', 10);
            setTimeout(() => {
              el.classList.add('active');
            }, delay);
            observer.unobserve(el);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    reveals.forEach((el) => observer.observe(el));
  }

  initScrollReveal();

  // ---------- Active nav link on scroll ----------
  function initActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

    if (!sections.length || !navLinks.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navLinks.forEach((link) => {
              link.classList.toggle(
                'active',
                link.getAttribute('href') === `#${id}`
              );
            });
          }
        });
      },
      {
        threshold: 0.3,
        rootMargin: `-${parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 72}px 0px -40% 0px`,
      }
    );

    sections.forEach((section) => observer.observe(section));
  }

  initActiveNav();

  // ---------- Smooth scroll for anchor links ----------
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // ---------- Contact form handling ----------
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const btn = contactForm.querySelector('button[type="submit"]');
      const originalHTML = btn.innerHTML;

      // Simple visual feedback
      btn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        Message envoyé !
      `;
      btn.style.backgroundColor = '#4a9b55';
      btn.disabled = true;

      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.style.backgroundColor = '';
        btn.disabled = false;
        contactForm.reset();
      }, 3000);
    });
  }

  // ---------- Leaflet Map Initialization ----------
  function initMap() {
    const mapEl = document.getElementById('map');
    if (!mapEl || typeof L === 'undefined') return;

    // Pessac coordinates
    const pessac = [44.8066, -0.6311];

    const map = L.map('map', {
      center: pessac,
      zoom: 13,
      scrollWheelZoom: false,
      zoomControl: true,
    });

    // OpenStreetMap tiles with warm-toned attribution
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // Custom marker icon matching brand colors
    const aimIcon = L.divIcon({
      className: 'aim-map-marker',
      html: '<div class="aim-marker-pin"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div>',
      iconSize: [44, 44],
      iconAnchor: [22, 44],
      popupAnchor: [0, -40],
    });

    // Main marker on Pessac
    L.marker(pessac, { icon: aimIcon })
      .addTo(map)
      .bindPopup('<strong>AIM Immobilier</strong>Pessac, France<br>Votre agence de proximite')
      .openPopup();

    // Notable nearby areas with subtle circle markers
    const zones = [
      { coords: [44.8378, -0.5792], name: 'Bordeaux Centre' },
      { coords: [44.7906, -0.5957], name: 'Talence' },
      { coords: [44.7726, -0.6141], name: 'Gradignan' },
      { coords: [44.8297, -0.6834], name: 'Merignac' },
      { coords: [44.7456, -0.5738], name: 'Villenave-d\'Ornon' },
    ];

    zones.forEach(function (zone) {
      L.circleMarker(zone.coords, {
        radius: 6,
        fillColor: '#D4987E',
        color: '#B8654A',
        weight: 2,
        opacity: 0.8,
        fillOpacity: 0.5,
      })
        .addTo(map)
        .bindPopup('<strong>' + zone.name + '</strong>Zone d\'intervention');
    });

    // Enable scroll zoom on click/focus
    map.on('click', function () {
      map.scrollWheelZoom.enable();
    });

    mapEl.addEventListener('mouseleave', function () {
      map.scrollWheelZoom.disable();
    });

    // Invalidate size when map becomes visible (for reveal animations)
    const mapObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          map.invalidateSize();
          mapObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    mapObserver.observe(mapEl);
  }

  // Init map when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMap);
  } else {
    initMap();
  }

  // ---------- Parallax-like subtle float for hero ----------
  let ticking = false;
  function handleHeroParallax() {
    if (ticking) return;
    ticking = true;

    requestAnimationFrame(() => {
      const scrollY = window.scrollY;
      const heroContent = document.querySelector('.hero-content');
      if (heroContent && scrollY < window.innerHeight) {
        const opacity = 1 - scrollY / (window.innerHeight * 0.8);
        const translateY = scrollY * 0.3;
        heroContent.style.opacity = Math.max(0, opacity);
        heroContent.style.transform = `translateY(${translateY}px)`;
      }
      ticking = false;
    });
  }

  window.addEventListener('scroll', handleHeroParallax, { passive: true });
})();
