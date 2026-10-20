(() => {
  'use strict';

  // Акція діє до 31.10.2026, 23:59:59 за київським часом (UTC+2 на цю дату).
  const PROMO_DEADLINE = new Date('2026-10-31T21:59:59Z').getTime();

  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pad = (n) => String(n).padStart(2, '0');

  /* ---------- Таймер акції ---------- */
  const textTimers = document.querySelectorAll('[data-timer]');
  const segTimers = [...document.querySelectorAll('[data-timer-seg]')].map((el) => ({
    d: el.querySelector('[data-d]'),
    h: el.querySelector('[data-h]'),
    m: el.querySelector('[data-m]'),
    s: el.querySelector('[data-s]'),
  }));

  let promoInterval;
  function updatePromo() {
    const diff = Math.max(0, PROMO_DEADLINE - Date.now());
    const total = Math.floor(diff / 1000);
    const d = Math.floor(total / 86400);
    const h = Math.floor((total % 86400) / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;

    const text = diff > 0 ? `${d}д ${pad(h)}:${pad(m)}:${pad(s)}` : 'акцію завершено';
    textTimers.forEach((el) => { el.textContent = text; });
    segTimers.forEach((t) => {
      t.d.textContent = pad(d);
      t.h.textContent = pad(h);
      t.m.textContent = pad(m);
      t.s.textContent = pad(s);
    });

    if (diff <= 0) {
      root.classList.add('promo-ended');
      clearInterval(promoInterval);
    }
  }
  updatePromo();
  promoInterval = setInterval(updatePromo, 1000);

  /* ---------- REC-таймкод у видошукачі ---------- */
  const timecode = document.querySelector('[data-timecode]');
  const hero = document.querySelector('[data-hero]');
  let heroVisible = true;
  if (timecode) {
    const start = performance.now();
    const fps = 25;
    setInterval(() => {
      if (!heroVisible) return;
      const t = (performance.now() - start) / 1000;
      const frames = Math.floor((t % 1) * fps);
      const sec = Math.floor(t);
      timecode.textContent = `${pad(Math.floor(sec / 3600))}:${pad(Math.floor(sec / 60) % 60)}:${pad(sec % 60)}:${pad(frames)}`;
    }, reduceMotion ? 1000 : 40);
  }

  /* ---------- Хвиля аудіодоріжки в редакторі ---------- */
  const wave = document.querySelector('[data-wave]');
  if (wave) {
    const bars = 72;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < bars; i++) {
      const v = Math.abs(Math.sin(i * 0.62) * Math.cos(i * 0.21)) * 0.75 + 0.18;
      const bar = document.createElement('i');
      bar.style.setProperty('--h', `${Math.round(v * 100)}%`);
      frag.appendChild(bar);
    }
    wave.appendChild(frag);
  }

  /* ---------- Скрол: шапка, прогрес, програма ---------- */
  const header = document.querySelector('[data-header]');
  const editor = document.querySelector('[data-editor]');
  const editorTc = document.querySelector('[data-editor-tc]');
  const clips = editor ? [...editor.querySelectorAll('.clip')] : [];
  const lessons = [...document.querySelectorAll('[data-lesson]')];
  const lessonList = document.querySelector('.lessons');

  let ticking = false;
  function onScroll() {
    const y = window.scrollY;
    const vh = window.innerHeight;
    const max = document.documentElement.scrollHeight - vh;

    root.style.setProperty('--scroll', max > 0 ? (y / max).toFixed(4) : 0);
    header.classList.toggle('is-scrolled', y > 30);

    if (lessonList && editor) {
      const r = lessonList.getBoundingClientRect();
      const focus = vh * 0.55;
      const progress = Math.min(1, Math.max(0, (focus - r.top) / r.height));
      editor.style.setProperty('--play', progress.toFixed(4));

      if (editorTc) {
        const secs = Math.round(progress * 60);
        editorTc.textContent = `${pad(Math.floor(secs / 60))}:${pad(secs % 60)} / 01:00`;
      }

      let active = -1;
      lessons.forEach((el, i) => {
        const lr = el.getBoundingClientRect();
        if (lr.top < focus) active = i;
      });
      lessons.forEach((el, i) => el.classList.toggle('is-active', i === active));
      clips.forEach((el, i) => el.classList.toggle('is-active', i === active));
    }

    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(onScroll);
    }
  }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------- Активний пункт меню ---------- */
  // Спостерігаємо за всіма секціями: для тих, яких немає в меню, підсвітка знімається.
  const navLinks = [...document.querySelectorAll('.nav__links a')];
  const allSections = document.querySelectorAll('main > section');
  if ('IntersectionObserver' in window && navLinks.length) {
    const navIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id ? `#${entry.target.id}` : '';
        navLinks.forEach((a) => a.classList.toggle('is-current', a.getAttribute('href') === id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    allSections.forEach((s) => navIO.observe(s));
  }

  /* ---------- Поява блоків ---------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-in'));
  }

  /* ---------- Мобільна кнопка «Купити» ---------- */
  const sticky = document.querySelector('[data-sticky-cta]');
  const finalSection = document.querySelector('[data-final]');
  const heroActions = document.querySelector('.hero__actions');
  if (hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; }).observe(hero);
  }
  if (sticky && heroActions && 'IntersectionObserver' in window) {
    // Показуємо, коли головна кнопка першого екрана не видна, і ховаємо біля фінального блоку.
    let heroCtaIn = true;
    let finalIn = false;
    const update = () => sticky.classList.toggle('is-visible', !heroCtaIn && !finalIn);
    new IntersectionObserver(([e]) => {
      heroCtaIn = e.isIntersecting;
      update();
    }).observe(heroActions);
    if (finalSection) {
      new IntersectionObserver(([e]) => { finalIn = e.isIntersecting; update(); }, { threshold: 0.15 }).observe(finalSection);
    }
  }

  /* ---------- Мобільне меню ---------- */
  const burger = document.querySelector('[data-burger]');
  const menu = document.querySelector('[data-menu]');
  if (burger && menu) {
    const setMenu = (open) => {
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Закрити меню' : 'Відкрити меню');
      menu.classList.toggle('is-open', open);
      root.style.overflow = open ? 'hidden' : '';
      header.classList.toggle('is-scrolled', open || window.scrollY > 30);
    };
    burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
    menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) {
        setMenu(false);
        burger.focus();
      }
    });
    window.matchMedia('(min-width: 981px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });
  }

  /* ---------- Відео ---------- */
  const video = document.querySelector('[data-video]');
  const playBtn = document.querySelector('[data-play]');
  if (video && playBtn) {
    playBtn.addEventListener('click', () => {
      video.controls = true;
      const p = video.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    });
    video.addEventListener('play', () => playBtn.classList.add('is-hidden'));
    video.addEventListener('ended', () => {
      playBtn.classList.remove('is-hidden');
      video.controls = false;
    });
  }

  /* ---------- До / Після ---------- */
  const ba = document.querySelector('[data-ba]');
  const baRange = document.querySelector('[data-ba-range]');
  if (ba && baRange) {
    const setPos = (v) => {
      ba.style.setProperty('--pos', `${v}%`);
      baRange.value = v;
    };
    baRange.addEventListener('input', () => setPos(baRange.value));
    setPos(50);

    // Підказка: при першій появі повзунок коротко «гойдається» туди-сюди.
    if (!reduceMotion && 'IntersectionObserver' in window) {
      let touched = false;
      baRange.addEventListener('pointerdown', () => { touched = true; }, { once: true });
      const keys = [[0, 50], [700, 74], [1500, 28], [2200, 50]];
      const hintIO = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) return;
        hintIO.disconnect();
        setTimeout(() => {
          const start = performance.now();
          const step = (now) => {
            if (touched) return;
            const t = now - start;
            const i = keys.findIndex(([k]) => k > t);
            if (i === -1) { setPos(50); return; }
            const [t0, v0] = keys[i - 1];
            const [t1, v1] = keys[i];
            const p = (t - t0) / (t1 - t0);
            const eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
            setPos(v0 + (v1 - v0) * eased);
            requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }, 700);
      }, { threshold: 0.5 });
      hintIO.observe(ba);
    }
  }

  /* ---------- Рік у футері ---------- */
  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
})();
