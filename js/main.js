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
    // 단어 단위 분리(강조 <em>/<strong> 태그는 유지)
    let idx = 0;
    const wrapWords = node => {
      Array.from(node.childNodes).forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span'); w.className = 'w';
            const wi = document.createElement('span'); wi.className = 'wi'; wi.textContent = part; wi.style.setProperty('--i', idx++);
            w.appendChild(wi); frag.appendChild(w);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1) {
          // 태그 안의 글자도 같은 방식으로 감싸되 태그는 그대로 둠
          if (n.classList && (n.classList.contains('pt') || n.classList.contains('mk'))) {
            const w = document.createElement('span'); w.className = 'w';
            const wi = document.createElement('span'); wi.className = 'wi'; wi.style.setProperty('--i', idx++);
            n.parentNode.insertBefore(w, n); w.appendChild(wi); wi.appendChild(n);
          } else wrapWords(n);
        }
      });
    };
    $$('.line > span', tit).forEach(wrapWords);
    tit.classList.add('split');
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

    // 헤더는 항상 상단 고정: 첫 화면 위에서는 투명(흰 글자), 60% 이상 내려가면 흰 배경
    header.classList.add('btm-fix');
    if (y > window.innerHeight * 0.6) { header.classList.add('solid'); header.classList.remove('wht'); }
    else { header.classList.remove('solid'); header.classList.add('wht'); }

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
  const DUR = 4.5;
  const visualSwiper = new Swiper('.sec-visual .swiper', {
    parallax: true, speed: 700, allowTouchMove: false, loop: true, observer: true, observeParents: true,
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
      .to('.sec-visual .ctr-box', { bottom: '250rem', opacity: 1, duration: 1, ease: 'power2.inOut' }, '<')
      .to('.quick-menu', { right: 0, opacity: 1, duration: 1, ease: 'power2.inOut' }, '-=1.8');
  });
  mm.add('(max-width: 1024px)', () => {
    introTl
      .to('header', { opacity: 1, duration: 0.6, ease: 'power2.inOut' }, '<0.5')
      .to('.sec-visual .ctr-box', { bottom: '120rem', opacity: 1, duration: 0.6, ease: 'power2.inOut' }, '<0.5')
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
    const words = $$('.tit .wi', target);
    const tl = gsap.timeline({ scrollTrigger: { trigger: target, start: 'top 80%' }, onComplete: () => target.classList.add('in') });
    if (words.length) {
      tl.fromTo(words, { yPercent: 115, rotate: 8, filter: 'blur(8px)', opacity: 0 }, { yPercent: 0, rotate: 0, filter: 'blur(0px)', opacity: 1, stagger: 0.07, duration: 1.1, ease: 'expo.out', onComplete: () => target.classList.add('in') });
    } else {
      tl.fromTo(ls, { yPercent: 100 }, { yPercent: 0, stagger: 0.2, duration: 1.1, ease: 'power2.inOut' });
    }
    tl.fromTo(sub, { yPercent: 60, opacity: 0, filter: 'blur(6px)' }, { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 1, ease: 'power2.out' }, '-=0.7');
    if (btn) tl.fromTo(btn, { y: 100, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power2.inOut' }, '-=0.7');
  });

  /* ---------- why healing point ---------- */
  gsap.fromTo('.sec-points .cert-box', { clipPath: 'inset(0% 0% 100% 0%)', y: 60 }, { clipPath: 'inset(0% 0% 0% 0%)', y: 0, duration: 1.3, ease: 'power2.inOut', scrollTrigger: { trigger: '.sec-points .cert-box', start: 'top 80%' } });
  if ($('.sec-points .point-list')) gsap.fromTo('.sec-points .point-list li', { y: 80, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.12, duration: 1, ease: 'power2.out', scrollTrigger: { trigger: '.sec-points .point-list', start: 'top 80%' } });

  /* ---------- program ---------- */
  mm.add('(min-width: 1025px)', () => {
    gsap.timeline({ scrollTrigger: { trigger: '.sec-service .cont-1', start: 'top 10%', end: 'bottom top', scrub: 1 } })
      .to('.sec-service .cont-1', { y: -120 })
      .to('.sec-service .cont-3', { y: -220 }, '<');
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

  /* ---------- membership (섹션 삭제됨, 있을 때만 실행) ---------- */
  if ($('.sec-membership')) {
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

  }

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
  if ($('.sec-ownthe100 .spec-list')) gsap.fromTo('.sec-ownthe100 .spec-list li', { y: 60, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, duration: 0.9, ease: 'power2.out', scrollTrigger: { trigger: '.sec-ownthe100 .spec-list', start: 'top 80%' } });

  /* ---------- facility more ---------- */
  const facGrid = $('#facGrid'), facMore = $('#facGrid .more-btn');
  if (facGrid && facMore) {
    facMore.addEventListener('click', () => {
      facGrid.classList.add('open');
      facMore.setAttribute('aria-expanded', 'true');
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    });
  }

  /* ---------- review ---------- */
  // 후기 슬라이드는 CSS 마키(.review-track)로 동작
  (function () {
    const track = $('#reviewTrack'), source = $('#reviewSource'), marquee = $('.sec-now .review-marquee');
    if (!track || !source || !marquee) return;
    const base = Array.from(source.children).map(el => el.cloneNode(true));
    function build(filter) {
      const items = base.filter(el => filter === 'all' || el.dataset.type === filter);
      if (!items.length) return;
      track.innerHTML = '';
      const makeGroup = () => {
        const g = document.createElement('div'); g.className = 'review-group';
        items.forEach(el => g.appendChild(el.cloneNode(true)));
        return g;
      };
      // 그룹 하나가 화면 폭 이상이 되도록 반복한 뒤, 같은 그룹을 한 번 더 붙여 -50% 루프
      const g1 = makeGroup(); track.appendChild(g1);
      let guard = 0;
      while (g1.scrollWidth < marquee.clientWidth * 1.2 && guard < 6) { items.forEach(el => g1.appendChild(el.cloneNode(true))); guard++; }
      track.appendChild(g1.cloneNode(true));
      const perItem = 9; // 아이템당 초(속도 일정 유지)
      track.style.animation = 'none'; void track.offsetWidth; track.style.animation = '';
      track.style.animationDuration = Math.max(24, g1.children.length * perItem) + 's';
    }
    build('all');
    $$('.sec-now .review-tabs button').forEach(btn => btn.addEventListener('click', () => {
      $$('.sec-now .review-tabs button').forEach(b => { b.classList.toggle('on', b === btn); b.setAttribute('aria-selected', b === btn ? 'true' : 'false'); });
      build(btn.dataset.filter);
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    }));
    let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => build(($('.sec-now .review-tabs button.on') || {}).dataset?.filter || 'all'), 250); });
  })();
  if ($('.sec-now .review-stats')) gsap.fromTo('.sec-now .review-stats .stat', { y: 80, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1, duration: 1, ease: 'power2.inOut', scrollTrigger: { trigger: '.sec-now .review-stats', start: 'top 80%' } });
  gsap.fromTo('.sec-now .review-marquee', { y: isPc() ? 120 : 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, ease: 'power2.inOut', scrollTrigger: { trigger: '.sec-now .review-marquee', start: 'top 85%' } });

  /* ---------- info ---------- */
  gsap.fromTo('.sec-info .info-list > div', { y: 60, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1, duration: 0.9, ease: 'power2.out', scrollTrigger: { trigger: '.sec-info .info-list', start: 'top 80%' } });
  gsap.fromTo('.sec-info .map-box', { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'power2.inOut', scrollTrigger: { trigger: '.sec-info .map-box', start: 'top 80%' } });

  onScroll();
})();
