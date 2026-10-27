/* HEALING POINT GYM — 시안 2 interactions (modeled on aromvicorp.com common.js) */
(function () {
  'use strict';
  let lenis = null;

  document.addEventListener('DOMContentLoaded', () => {
    window.scrollTo(0, 0);
    if (window.gsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
    initLenis();
    initHeaderUI();
    initProductSwipers();
    initCardSwipers();
    initRollingText();
    initScrollTopButton();
    initScrollIndicator();
    initAnchors();
    if (window.ScrollTrigger) ScrollTrigger.refresh();
    if (window.AOS) AOS.init({ duration: 500, easing: 'ease-out-cubic', once: false, offset: 80 });
  });

  /* ---------- Lenis smooth scroll ---------- */
  function initLenis() {
    if (!window.Lenis) return;
    lenis = new Lenis({ smooth: true, duration: 0.6, wheelMultiplier: 1.2, touchMultiplier: 2, lerp: 0.16 });
    function raf(time) { lenis.raf(time); if (window.AOS) AOS.refresh(); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    lenis.on('scroll', () => { if (window.ScrollTrigger) ScrollTrigger.update(); });
    window.addEventListener('resize', () => { lenis.resize(); if (window.ScrollTrigger) ScrollTrigger.refresh(); if (window.AOS) AOS.refresh(); });
  }

  function scrollToTarget(target, offset) {
    if (lenis) lenis.scrollTo(target, { offset: offset || 0, duration: 0.8, easing: t => 1 - Math.pow(1 - t, 3) });
    else {
      const top = typeof target === 'number' ? target : target.getBoundingClientRect().top + window.scrollY + (offset || 0);
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }

  /* ---------- anchors ---------- */
  function initAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const id = a.getAttribute('href');
        if (window.innerWidth <= 1200 && a.matches('.gnb > ul > li > a')) return; // mobile accordion handles it
        const t = id.length > 1 ? document.querySelector(id) : null;
        if (!t && id !== '#top') return;
        e.preventDefault();
        if (id === '#top' || !t) scrollToTarget(0, 0);
        else scrollToTarget(t, -70);
      });
    });
  }

  /* ---------- header / gnb ---------- */
  function initHeaderUI() {
    let lastScrollTop = 0;
    const isMobile = () => window.innerWidth <= 1200;
    const moBtn = document.querySelector('.mo-btn');
    const gnb = document.querySelector('.gnb');

    function closeMenu() {
      document.body.classList.remove('open');
      document.documentElement.classList.remove('open');
      moBtn && moBtn.classList.remove('active');
      gnb && gnb.classList.remove('open');
      if (lenis) lenis.start();
    }

    document.querySelectorAll('.gnb > ul > li').forEach(li => {
      const a = li.querySelector(':scope > a');
      const sub = li.querySelector(':scope > ul');
      if (!a || !sub) return;
      a.addEventListener('click', e => {
        if (!isMobile()) return;
        e.preventDefault();
        li.classList.toggle('active');
        sub.style.display = sub.style.display === 'block' ? 'none' : 'block';
      });
    });
    document.querySelectorAll('.sec-header .gnb > ul > li > ul > li > a').forEach(link => {
      link.addEventListener('click', () => { if (isMobile()) closeMenu(); });
    });
    if (moBtn) {
      const toggle = () => {
        if (!isMobile()) return;
        const isOpen = document.body.classList.toggle('open');
        document.documentElement.classList.toggle('open', isOpen);
        moBtn.classList.toggle('active', isOpen);
        gnb && gnb.classList.toggle('open', isOpen);
        if (lenis) { isOpen ? lenis.stop() : lenis.start(); }
      };
      moBtn.addEventListener('click', toggle);
      moBtn.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
    }

    function onScroll() {
      const st = window.scrollY || document.documentElement.scrollTop;
      if (st <= 0) { document.body.classList.remove('scroll-up', 'scroll-down'); lastScrollTop = 0; return; }
      if (st > lastScrollTop) { document.body.classList.add('scroll-down'); document.body.classList.remove('scroll-up'); }
      else { document.body.classList.add('scroll-up'); document.body.classList.remove('scroll-down'); }
      lastScrollTop = st;
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => {
      if (!isMobile()) {
        document.querySelectorAll('.gnb li').forEach(li => li.classList.remove('active'));
        document.querySelectorAll('.gnb li ul').forEach(ul => ul.removeAttribute('style'));
        closeMenu();
      }
    });
  }

  /* ---------- product swipers + tabs ---------- */
  function initProductSwipers() {
    document.querySelectorAll('.product-cont').forEach(container => {
      const swiperEl = container.querySelector('.product-swiper');
      const tabs = container.querySelectorAll('.tab-menu li');
      if (!swiperEl) return;
      const swiper = new Swiper(swiperEl, {
        slidesPerView: 2, spaceBetween: 10, slidesPerGroup: 1, speed: 400,
        breakpoints: { 1000: { slidesPerView: 2, spaceBetween: 30 }, 1600: { slidesPerView: 3, spaceBetween: 30 } }
      });
      function setActive(index) {
        tabs.forEach(t => t.classList.remove('active'));
        if (tabs[index]) tabs[index].classList.add('active');
        swiper.slides.forEach(s => s.classList.remove('custom-active'));
        if (swiper.slides[index]) swiper.slides[index].classList.add('custom-active');
      }
      tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => {
          const total = swiper.slides.length;
          const perView = swiper.params.slidesPerView;
          let moveIndex = index;
          if (index > total - perView) moveIndex = Math.max(0, total - perView);
          swiper.slideTo(moveIndex);
          setActive(index);
        });
      });
      swiper.on('slideChange', () => setActive(swiper.activeIndex));
    });
  }

  /* ---------- brand / review swipers ---------- */
  function initCardSwipers() {
    const brandEl = document.querySelector('.brand-swiper');
    if (brandEl) new Swiper(brandEl, { slidesPerView: 1, spaceBetween: 20, speed: 400, breakpoints: { 768: { slidesPerView: 2 } } });
    const reviewEl = document.querySelector('.review-swiper');
    if (reviewEl) new Swiper(reviewEl, { slidesPerView: 1, spaceBetween: 20, speed: 400, breakpoints: { 768: { slidesPerView: 2 }, 1200: { slidesPerView: 3 } } });
  }

  /* ---------- rolling text ---------- */
  function initRollingText() {
    document.querySelectorAll('.rolling-wrap').forEach(wrap => {
      const list = wrap.querySelector('.rolling-list');
      if (!list) return;
      const items = list.querySelectorAll('span');
      if (items.length < 2) return;
      list.appendChild(items[0].cloneNode(true));
      const allItems = list.querySelectorAll('span');
      let i = 0;
      const measurer = document.createElement('span');
      Object.assign(measurer.style, { pointerEvents: 'none', top: '0', left: '0', position: 'absolute', visibility: 'hidden', whiteSpace: 'nowrap' });
      measurer.style.font = getComputedStyle(items[0]).font;
      measurer.style.letterSpacing = getComputedStyle(items[0]).letterSpacing;
      document.body.appendChild(measurer);
      const getTextWidth = el => { measurer.textContent = el.textContent; return Math.ceil(measurer.getBoundingClientRect().width) + 4; };
      const setSize = () => { wrap.style.height = items[0].offsetHeight + 'px'; measurer.style.font = getComputedStyle(items[0]).font; measurer.style.letterSpacing = getComputedStyle(items[0]).letterSpacing; wrap.style.width = getTextWidth(allItems[i % items.length]) + 'px'; };
      setSize();
      window.addEventListener('resize', setSize);
      const duration = 600, delay = 2000;
      function roll() {
        const itemHeight = items[0].offsetHeight;
        i++;
        list.style.transition = `transform ${duration}ms ease`;
        list.style.transform = `translateY(-${itemHeight * i}px)`;
        wrap.style.width = getTextWidth(items[i % items.length]) + 'px';
        if (i === allItems.length - 1) {
          setTimeout(() => { list.style.transition = 'none'; list.style.transform = 'translateY(0)'; i = 0; }, duration);
        }
      }
      setInterval(roll, delay);
    });
  }

  /* ---------- top button ---------- */
  function initScrollTopButton() {
    const btn = document.querySelector('.btn-top');
    if (!btn) return;
    btn.addEventListener('click', () => scrollToTarget(0, 0));
    if (window.gsap && window.ScrollTrigger) {
      gsap.set(btn, { autoAlpha: 0 });
      ScrollTrigger.create({ start: 200, onEnter: () => gsap.to(btn, { autoAlpha: 1 }), onLeaveBack: () => gsap.to(btn, { autoAlpha: 0 }) });
    }
  }

  /* ---------- scroll indicator ---------- */
  function initScrollIndicator() {
    const el = document.querySelector('.main-visual .scroll');
    if (!el || !window.gsap || !window.ScrollTrigger) return;
    gsap.set(el, { autoAlpha: 1 });
    ScrollTrigger.create({ start: 1, onEnter: () => gsap.to(el, { autoAlpha: 0, duration: 1 }), onLeaveBack: () => gsap.to(el, { autoAlpha: 1, duration: 1 }) });
  }
})();
