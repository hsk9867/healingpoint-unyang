/* HEALING POINT GYM UNYANG — main interactions (modeled on apgujeong-h district2 main) */
(function () {
  'use strict';
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const isPc = () => window.innerWidth > 1024;
  const header = $('header');
  const quick = $('.quick-menu');
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- hero letters ---------- */
  const lines = [['HEALING', 'POINT'], ['GYM']];
  $$('.sec-visual .visual-txt > div.line-1, .sec-visual .visual-txt > div.line-2').forEach((div, i) => {
    const words = lines[i];
    words.forEach((w, wi) => {
      w.split('').forEach(ch => {
        const sp = document.createElement('span');
        const inner = document.createElement('i');
        inner.textContent = ch;
        sp.appendChild(inner);
        div.appendChild(sp);
      });
      if (wi < words.length - 1) {
        const gap = document.createElement('span');
        gap.className = 'sp';
        div.appendChild(gap);
      }
    });
  });

  /* ---------- section titles: split lines ---------- */
  $$('.sec-tit .tit').forEach(tit => {
    const parts = tit.innerHTML.split(/<br\s*\/?>/i);
    tit.innerHTML = parts.map(p => `<span class="line"><span>${p.trim()}</span></span>`).join('');
  });

  /* ---------- header ---------- */
  let lastScroll = 0;
  function onScroll() {
    const y = window.scrollY;
    const down = y > lastScroll;
    if (down && y > (isPc() ? window.innerHeight : 100)) {
      if (!header.classList.contains('hover')) header.classList.add('hide');
    }
    if (!down) header.classList.remove('hide');
    lastScroll = y;

    if (isPc()) {
      if (y > window.innerHeight - 1) header.classList.remove('btm-fix', 'wht');
      else header.classList.add('btm-fix', 'wht');
    } else {
      header.classList.add('btm-fix');
      if (y > window.innerHeight * 0.6) { header.classList.add('solid'); header.classList.remove('wht'); }
      else { header.classList.remove('solid'); header.classList.add('wht'); }
    }

    if (quick) quick.classList.toggle('btm', y > 0);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  // pc gnb hover
  $$('header .gnb > li').forEach(li => {
    li.addEventListener('mouseenter', () => { if (isPc()) { li.classList.add('on'); header.classList.add('hover'); } });
    li.addEventListener('mouseleave', () => { if (isPc()) { li.classList.remove('on'); header.classList.remove('hover'); } });
    const one = $('.one-link', li);
    one.addEventListener('click', e => {
      if (!isPc()) {
        e.preventDefault();
        const open = li.classList.contains('on');
        $$('header .gnb > li').forEach(o => { o.classList.remove('on'); const d = $('.two-depth', o); if (d) d.style.display = ''; });
        if (!open) { li.classList.add('on'); $('.two-depth', li).style.display = 'block'; }
      }
    });
  });

  // mobile nav
  const nav = $('header nav');
  const btnMo = $('.btn-menu-mo');
  function closeMo() { nav.classList.remove('show'); nav.style.display = ''; document.documentElement.classList.remove('scl-lock'); }
  btnMo.addEventListener('click', () => {
    const open = nav.classList.contains('show');
    if (open) closeMo();
    else { nav.style.display = 'block'; requestAnimationFrame(() => nav.classList.add('show')); document.documentElement.classList.add('scl-lock'); }
  });
  $$('header .two-link, header .btn-login').forEach(a => a.addEventListener('click', () => { if (!isPc()) closeMo(); }));

  // sitemap
  const sitemap = $('#sitemap'), dim = $('header .dim');
  function openSitemap() {
    sitemap.style.display = 'block'; dim.style.display = 'block';
    requestAnimationFrame(() => sitemap.classList.add('show'));
    $('.btn-menu-open').setAttribute('aria-expanded', 'true');
    document.documentElement.classList.add('scl-lock');
  }
  function closeSitemap() {
    sitemap.classList.remove('show');
    $('.btn-menu-open').setAttribute('aria-expanded', 'false');
    document.documentElement.classList.remove('scl-lock');
    setTimeout(() => { sitemap.style.display = ''; dim.style.display = ''; }, 500);
  }
  $('.btn-menu-open').addEventListener('click', openSitemap);
  $('.btn-menu-close').addEventListener('click', closeSitemap);
  dim.addEventListener('click', closeSitemap);
  $$('#sitemap a[href^="#"]').forEach(a => a.addEventListener('click', closeSitemap));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && sitemap.classList.contains('show')) closeSitemap(); });

  // anchor offset for fixed header
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
      const t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      const off = isPc() ? 0 : 60;
      window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - off, behavior: 'smooth' });
    });
  });

  /* ---------- footer family site ---------- */
  const fsBtn = $('footer .family-site .btn');
  const fsList = $('footer .family-site .site-list');
  fsBtn.addEventListener('click', () => {
    const on = fsBtn.classList.toggle('on');
    fsList.style.display = on ? 'block' : 'none';
  });

  /* ---------- visual swiper ---------- */
  let isPaused = false, slideTimer = null, progressTween = null, pausedProgress = 0;
  const DUR = 4;
  const visualSwiper = new Swiper('.sec-visual .swiper', {
    parallax: true, speed: 1500, allowTouchMove: false, loop: true, observer: true, observeParents: true,
    on: {
      init() {
        const total = $$('.sec-visual .swiper-slide:not(.swiper-slide-duplicate)').length;
        $('.sec-visual .current').textContent = 1;
        $('.sec-visual .total').textContent = total;
      },
      slideChangeTransitionStart() {
        $('.sec-visual .current').textContent = visualSwiper.realIndex + 1;
        if (progressTween) { progressTween.kill(); progressTween = null; }
        gsap.set('.sec-visual .progress .bar', { width: '0%' });
      },
      slideChangeTransitionEnd() { playSlide(); }
    }
  });
  function playSlide() {
    if (slideTimer) { clearTimeout(slideTimer); slideTimer = null; }
    if (progressTween) progressTween.kill();
    gsap.set('.sec-visual .progress .bar', { width: '0%' });
    if (!isPaused) slideTimer = setTimeout(() => visualSwiper.slideNext(), DUR * 1000);
    progressTween = gsap.to('.sec-visual .progress .bar', { width: '100%', duration: DUR, ease: 'linear' });
  }
  function resumeState() {
    isPaused = false;
    const b = $('.sec-visual .btn-ctr');
    b.setAttribute('aria-pressed', 'false'); b.textContent = '멈춤'; b.classList.remove('btn-play');
  }
  $('.sec-visual .swiper-button-prev').addEventListener('click', () => { visualSwiper.slidePrev(); resumeState(); });
  $('.sec-visual .swiper-button-next').addEventListener('click', () => { visualSwiper.slideNext(); resumeState(); });
  $('.sec-visual .btn-ctr').addEventListener('click', function () {
    if (!isPaused) {
      isPaused = true;
      if (slideTimer) clearTimeout(slideTimer);
      this.setAttribute('aria-pressed', 'true'); this.textContent = '재생'; this.classList.add('btn-play');
      if (progressTween) { pausedProgress = progressTween.progress(); progressTween.pause(); }
    } else {
      isPaused = false;
      const remain = (1 - pausedProgress) * DUR * 1000;
      slideTimer = setTimeout(() => visualSwiper.slideNext(), remain);
      if (progressTween) progressTween.resume();
      this.setAttribute('aria-pressed', 'false'); this.textContent = '멈춤'; this.classList.remove('btn-play');
    }
  });

  /* ---------- intro ---------- */
  const preventScroll = e => e.preventDefault();
  document.body.addEventListener('wheel', preventScroll, { passive: false });
  document.body.addEventListener('touchmove', preventScroll, { passive: false });

  const introTl = gsap.timeline({
    paused: true,
    onComplete() {
      document.body.removeEventListener('wheel', preventScroll);
      document.body.removeEventListener('touchmove', preventScroll);
      playSlide();
      onScroll();
    }
  });
  introTl
    .to('.sec-visual .visual-txt .hero-mark', { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out' })
    .to('.sec-visual .visual-txt span i', { y: 0, duration: 0.8, stagger: 0.05, ease: 'power2.inOut' }, '-=0.5')
    .to('.sec-visual .swiper', { scale: 1, duration: 3, ease: 'power2.inOut' }, '<')
    .to('.sec-visual .visual-sub', { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }, '-=2');

  gsap.set('header', { opacity: 0 });
  const mm = gsap.matchMedia();
  mm.add('(min-width: 1025px)', () => {
    introTl
      .fromTo('.sec-visual .ctr-box', { bottom: '0' }, { bottom: '50rem', opacity: 1, duration: 0.7, ease: 'power2.inOut' }, '<')
      .to('header', { opacity: 1, duration: 1, ease: 'power2.inOut' }, '-=2.1')
      .to('.sec-visual .ctr-box', { bottom: '184rem', opacity: 1, duration: 1, ease: 'power2.inOut' }, '<')
      .to('.quick-menu', { right: 0, opacity: 1, duration: 1, ease: 'power2.inOut' }, '-=1.8');
  });
  mm.add('(max-width: 1024px)', () => {
    introTl
      .to('header', { opacity: 1, duration: 0.6, ease: 'power2.inOut' }, '<0.5')
      .to('.sec-visual .ctr-box', { bottom: '40rem', opacity: 1, duration: 0.6, ease: 'power2.inOut' }, '<0.5')
      .to('.quick-menu', { right: 0, opacity: 1, duration: 1, ease: 'power2.inOut' }, '<0.2');
  });

  let started = false;
  function startIntro() {
    if (started) return; started = true;
    window.scrollTo(0, 0);
    $('.loading').classList.add('off');
    setTimeout(() => introTl.play(), 300);
  }
  const heroImg = $('.sec-visual .swiper-slide img');
  const ready = Promise.all([
    heroImg && heroImg.decode ? heroImg.decode().catch(() => {}) : Promise.resolve(),
    document.fonts && document.fonts.ready ? document.fonts.ready.catch(() => {}) : Promise.resolve()
  ]);
  ready.then(startIntro);
  setTimeout(startIntro, 3000);

  /* ---------- section title reveal ---------- */
  $$('.sec-tit').forEach(target => {
    const ls = $$('.tit .line span', target);
    const sub = $$('.txt', target);
    const btn = target.closest('section') && $('.btn-more', target.closest('section'));
    const tl = gsap.timeline({ scrollTrigger: { trigger: target, start: 'top 80%' } })
      .fromTo(ls, { yPercent: 100 }, { yPercent: 0, stagger: 0.2, duration: 1.1, ease: 'power2.inOut' })
      .fromTo(sub, { yPercent: 90, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1, ease: 'power2.inOut' }, '-=0.7');
    if (btn) tl.fromTo(btn, { y: 100, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power2.inOut' }, '-=0.7');
  });

  /* ---------- why healing point ---------- */
  gsap.fromTo('.sec-points .cert-box', { clipPath: 'inset(0% 0% 100% 0%)', y: 60 }, { clipPath: 'inset(0% 0% 0% 0%)', y: 0, duration: 1.3, ease: 'power2.inOut', scrollTrigger: { trigger: '.sec-points .cert-box', start: 'top 80%' } });
  gsap.fromTo('.sec-points .point-list li', { y: 80, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.12, duration: 1, ease: 'power2.out', scrollTrigger: { trigger: '.sec-points .point-list', start: 'top 80%' } });

  /* ---------- program ---------- */
  mm.add('(min-width: 1025px)', () => {
    gsap.timeline({ scrollTrigger: { trigger: '.sec-service .cont-2', start: 'top 10%', end: 'bottom top', scrub: 1 } })
      .to('.sec-service .cont-1', { y: -150 })
      .to('.sec-service .cont-2', { y: 50 }, '<')
      .to('.sec-service .cont-3', { y: -250 }, '<');
  });
  $$('.sec-service .cont-box').forEach(target => {
    gsap.timeline({ scrollTrigger: { trigger: target, start: 'top 60%' } })
      .fromTo($('.cont', target), { y: 150, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power2.inOut' })
      .fromTo($('.img-box img', target), { scale: 1.2 }, { scale: 1, duration: 1.2, ease: 'power2.inOut' }, '<')
      .fromTo($('.info-box', target), { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'power2.inOut' }, '<');
  });
  ScrollTrigger.create({
    trigger: '.sec-service .btn-area', start: 'top 70%',
    animation: gsap.fromTo('.sec-service .btn-area a', { y: '100rem', opacity: 0 }, { y: '0', opacity: 1, duration: 1.2, ease: 'power2.inOut' })
  });

  /* ---------- membership ---------- */
  new Swiper('.sec-membership .swiper', {
    slidesPerView: 1.2, spaceBetween: 4, freeMode: true,
    scrollbar: { el: '.sec-membership .swiper-scrollbar', hide: true },
    breakpoints: { 1024: { slidesPerView: 3 }, 700: { slidesPerView: 2.5 } }
  });
  ScrollTrigger.create({
    trigger: '.sec-membership', start: 'top 70%',
    animation: gsap.fromTo('.sec-membership .bg', { y: '200rem', opacity: 0 }, { y: '0', opacity: 1, duration: 1.2, ease: 'power2.inOut' })
  });
  ScrollTrigger.create({
    trigger: '.sec-membership', start: 'top bottom', end: 'bottom top', scrub: 1,
    animation: gsap.to('.sec-membership .bg', { top: '-200rem' })
  });
  gsap.timeline({ scrollTrigger: { trigger: '.sec-membership .swiper', start: 'top 70%' } })
    .fromTo('.sec-membership .cont-box', { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', stagger: 0.2, duration: 1.2, ease: 'power2.inOut' });

  /* ---------- facility ---------- */
  mm.add('(min-width: 1025px)', () => {
    $$('.sec-ownthe100 .row').forEach(row => {
      const boxes = $$('.cont-box', row);
      if (!boxes.length) return;
      const delay = row.classList.contains('row-1') ? 0.8 : 0;
      gsap.fromTo(boxes, { y: 250, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.15, delay, duration: 1.2, ease: 'power2.inOut', scrollTrigger: { trigger: row, start: 'top 70%' } });
    });
  });
  mm.add('(max-width: 1024px)', () => {
    $$('.sec-ownthe100 .cont-box').forEach(target => {
      gsap.fromTo(target, { y: 150, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power2.inOut', scrollTrigger: { trigger: target, start: 'top bottom' } });
    });
  });
  gsap.fromTo('.sec-ownthe100 .spec-list li', { y: 60, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, duration: 0.9, ease: 'power2.out', scrollTrigger: { trigger: '.sec-ownthe100 .spec-list', start: 'top 80%' } });

  /* ---------- review ---------- */
  new Swiper('.sec-now .swiper', {
    slidesPerView: 1.2, spaceBetween: 24, freeMode: true,
    scrollbar: { el: '.sec-now .swiper-scrollbar', hide: true },
    breakpoints: { 1024: { slidesPerView: 4, spaceBetween: 58 }, 700: { slidesPerView: 2.5, spaceBetween: 24 } }
  });
  gsap.fromTo('.sec-now .review-stats .stat', { y: 80, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1, duration: 1, ease: 'power2.inOut', scrollTrigger: { trigger: '.sec-now .review-stats', start: 'top 80%' } });
  gsap.fromTo('.sec-now .swiper a', { y: isPc() ? 350 : 150, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1, duration: 1.2, ease: 'power2.inOut', scrollTrigger: { trigger: '.sec-now .swiper', start: 'top 80%' } });

  /* ---------- info ---------- */
  gsap.fromTo('.sec-info .info-list > div', { y: 60, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1, duration: 0.9, ease: 'power2.out', scrollTrigger: { trigger: '.sec-info .info-list', start: 'top 80%' } });
  gsap.fromTo('.sec-info .map-box', { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'power2.inOut', scrollTrigger: { trigger: '.sec-info .map-box', start: 'top 80%' } });

  onScroll();
})();
