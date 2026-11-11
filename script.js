'use strict';

(() => {
  document.documentElement.classList.add('js');
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)');
  const header = $('#site-header');
  const progressBar = $('#scroll-progress');
  const hero = $('#home');
  const about = $('#about');
  const chapterCurrent = $('#chapter-current');
  const ambient = $('.cursor-ambient');
  const scene = $('#portfolio-motion');
  const navigation = $$('.desktop-nav a');
  const chapterNavigation = $$('.story-navigation a');

  // Navigation: keyboard-friendly mobile panel that never covers the desktop site.
  const toggle = $('#menu-toggle');
  const mobileNav = $('#mobile-navigation');
  function setMenu(open) {
    if (!toggle || !mobileNav) return;
    toggle.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    mobileNav.classList.toggle('is-open', open);
    mobileNav.inert = !open;
    document.body.classList.toggle('menu-open', open);
  }
  toggle?.addEventListener('click', () => setMenu(!mobileNav.classList.contains('is-open')));
  $$('#mobile-navigation a').forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && mobileNav?.classList.contains('is-open')) {
      setMenu(false);
      toggle?.focus();
    }
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1100 && mobileNav?.classList.contains('is-open')) setMenu(false);
  }, {passive:true});

  // Gentle, once-only reveals with a no-JavaScript visual fallback.
  const reveals = $$('[data-reveal]');
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {threshold: 0.09, rootMargin: '0px 0px 30px 0px'});
    reveals.forEach(element => revealObserver.observe(element));
  } else {
    reveals.forEach(element => element.classList.add('in-view'));
  }

  // A single animation frame per scroll keeps both motion and navigation smooth.
  let rafScheduled = false;
  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
  function updateScroll() {
    rafScheduled = false;
    const y = window.scrollY;
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    if (progressBar) progressBar.style.width = `${(y / maxScroll) * 100}%`;
    header?.classList.toggle('scrolled', y > 40);

    if (!reducedMotion.matches && !document.documentElement.classList.contains('motion-paused')) {
      if (hero) {
        const heroProgress = clamp(y / Math.max(1, hero.offsetHeight), 0, 1);
        hero.style.setProperty('--hero-word-x', `${Math.round(heroProgress * Math.min(250, innerWidth * .18))}px`);
        hero.style.setProperty('--hero-portrait-y', `${Math.round(heroProgress * 32)}px`);
      }
      if (about) {
        const r = about.getBoundingClientRect();
        if (r.bottom > -100 && r.top < innerHeight + 100) {
          const p = clamp((innerHeight - r.top) / Math.max(1, innerHeight + r.height), 0, 1);
          about.style.setProperty('--about-portrait-y', `${Math.round((.5 - p) * 24)}px`);
        }
      }
      if (scene) {
        const rect = scene.getBoundingClientRect();
        const length = Math.max(1, rect.height - innerHeight);
        const p = clamp(-rect.top / length, 0, 1);
        const movement = (p - .5) * Math.min(innerWidth * .5, 620);
        scene.style.setProperty('--motion-x', `${movement.toFixed(1)}px`);
        scene.style.setProperty('--scene-ax', `${((p - .5) * 105).toFixed(1)}px`);
        scene.style.setProperty('--scene-ay', `${((.5 - p) * 62).toFixed(1)}px`);
        scene.style.setProperty('--scene-bx', `${((.5 - p) * 72).toFixed(1)}px`);
        scene.style.setProperty('--scene-by', `${((p - .5) * 58).toFixed(1)}px`);
        scene.style.setProperty('--scene-cx', `${((p - .5) * 85).toFixed(1)}px`);
        scene.style.setProperty('--scene-cy', `${((.5 - p) * 55).toFixed(1)}px`);
        scene.style.setProperty('--scene-dx', `${((.5 - p) * 105).toFixed(1)}px`);
        scene.style.setProperty('--scene-dy', `${((p - .5) * 58).toFixed(1)}px`);
      }
      // Slow editorial depth movement, limited to the viewport and a few visual stories.
      $$('.story').forEach(story => {
        const bounds = story.getBoundingClientRect();
        if (bounds.bottom < -150 || bounds.top > innerHeight + 150) return;
        const range = Math.max(1, innerHeight + bounds.height);
        const progress = clamp((innerHeight - bounds.top) / range, 0, 1);
        story.style.setProperty('--story-line-y', `${Math.round(progress * Math.max(0, bounds.height - 245))}px`);
        story.style.setProperty('--story-image-drift', `${Math.round((.5 - progress) * 22)}px`);
      });
    }
    const sectionIds = ['home','about','expertise','portfolio-motion','projects','fitout','interests','contact'];
    let active = 'home';
    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= innerHeight * .4) active = id;
    }
    if (active === 'projects') active = 'portfolio-motion';
    if (chapterCurrent) {
      const visibleSections = ['home','about','expertise','portfolio-motion','fitout','interests','contact'];
      chapterCurrent.textContent = String(Math.max(1, visibleSections.indexOf(active) + 1)).padStart(2, '0');
    }
    navigation.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === `#${active}`));
    if (mobileNav) {
      $$('#mobile-navigation a').forEach(a => {
        if (a.getAttribute('href') === `#${active}`) a.setAttribute('aria-current', 'location');
        else a.removeAttribute('aria-current');
      });
    }
    const chapters = ['story-architecture','story-interior','story-brand','story-experience'];
    let chapterActive = chapters[0];
    for (const id of chapters) {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= innerHeight * .57) chapterActive = id;
    }
    chapterNavigation.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === `#${chapterActive}`));
  }
  function queueScroll() {
    if (rafScheduled) return;
    rafScheduled = true;
    requestAnimationFrame(updateScroll);
  }
  window.addEventListener('scroll', queueScroll, {passive: true});
  window.addEventListener('resize', queueScroll, {passive: true});
  queueScroll();

  // Light follows the cursor on glass cards. Restrict to fine-pointer devices.
  if (!reducedMotion.matches && canHover.matches) {
    // Portrait depth follows the pointer gently; there is no surrounding frame.
    hero?.addEventListener('pointermove', e => {
      const box = hero.getBoundingClientRect();
      const px = clamp((e.clientX - box.left) / Math.max(1, box.width) - .5, -.5, .5);
      hero.style.setProperty('--hero-portrait-x', `${(px * -15).toFixed(1)}px`);
    }, {passive:true});
    hero?.addEventListener('pointerleave', () => {
      hero.style.setProperty('--hero-portrait-x', '0px');
    });
    about?.addEventListener('pointermove', e => {
      const stage = $('.about-portrait-wrap', about);
      if (!stage) return;
      const bounds = stage.getBoundingClientRect();
      const x = clamp((e.clientX - bounds.left) / Math.max(1,bounds.width) - .5,-.5,.5);
      stage.style.setProperty('--about-portrait-x', `${(x * -10).toFixed(1)}px`);
    }, {passive:true});
    about?.addEventListener('pointerleave', () => {
      $('.about-portrait-wrap',about)?.style.setProperty('--about-portrait-x','0px');
    });

    // Editorial ambient spotlight: smoothed by CSS, never captures events.
    if (ambient) {
      let ambientFrame = 0;
      let targetX = -900;
      let targetY = -900;
      document.addEventListener('pointermove', e => {
        targetX = e.clientX;
        targetY = e.clientY;
        if (ambientFrame) return;
        ambientFrame = requestAnimationFrame(() => {
          ambient.style.transform = `translate3d(${targetX}px,${targetY}px,0)`;
          ambientFrame = 0;
        });
      },{passive:true});
    }

    // Refined magnetic micro-interactions on CTA elements.
    $$('.button, .nav-cta').forEach(target => {
      target.addEventListener('pointermove', e => {
        const b = target.getBoundingClientRect();
        const px = clamp((e.clientX - b.left)/Math.max(1,b.width) - .5,-.5,.5);
        const py = clamp((e.clientY - b.top)/Math.max(1,b.height) - .5,-.5,.5);
        target.style.setProperty('--mag-x', `${(px * 9).toFixed(1)}px`);
        target.style.setProperty('--mag-y', `${(py * 7).toFixed(1)}px`);
      },{passive:true});
      target.addEventListener('pointerleave', () => {
        target.style.setProperty('--mag-x','0px');
        target.style.setProperty('--mag-y','0px');
      });
    });
    $$('.glow-card').forEach(card => {
      card.addEventListener('pointermove', e => {
        const bounds = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - bounds.left}px`);
        card.style.setProperty('--my', `${e.clientY - bounds.top}px`);
      }, {passive: true});
    });
    // Lightweight 3D perspective, with a spring-like CSS return on pointer exit.
    $$('.tilt-surface').forEach(surface => {
      surface.addEventListener('pointermove', e => {
        const box = surface.getBoundingClientRect();
        const x = (e.clientX - box.left) / box.width - .5;
        const y = (e.clientY - box.top) / box.height - .5;
        surface.style.setProperty('--ry', `${(x * 7).toFixed(2)}deg`);
        surface.style.setProperty('--rx', `${(-y * 6).toFixed(2)}deg`);
      }, {passive: true});
      surface.addEventListener('pointerleave', () => {
        surface.style.setProperty('--ry', '0deg');
        surface.style.setProperty('--rx', '0deg');
      });
    });
  }

  // The image viewer keeps original portfolio artwork readable, with keyboard controls.
  const dialog = $('#image-dialog');
  const image = $('#dialog-image');
  const title = $('#dialog-title');
  const counter = $('#dialog-count');
  const imageButtons = $$('[data-lightbox]');
  let currentImage = 0;
  let lastFocus = null;
  function showImage(index) {
    currentImage = (index + imageButtons.length) % imageButtons.length;
    const selected = $('img', imageButtons[currentImage]);
    if (!selected) return;
    image.src = selected.getAttribute('src');
    image.alt = selected.getAttribute('alt') || 'Selected portfolio work';
    title.textContent = image.alt;
    counter.textContent = `${String(currentImage + 1).padStart(2,'0')} / ${String(imageButtons.length).padStart(2,'0')}`;
  }
  imageButtons.forEach((button,index) => {
    button.addEventListener('click', () => {
      if (!dialog || !('showModal' in dialog)) return;
      lastFocus = document.activeElement;
      showImage(index);
      dialog.showModal();
      $('#dialog-close')?.focus();
    });
  });
  $('#dialog-close')?.addEventListener('click', () => dialog?.close());
  $('#dialog-prev')?.addEventListener('click', () => showImage(currentImage - 1));
  $('#dialog-next')?.addEventListener('click', () => showImage(currentImage + 1));
  dialog?.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); showImage(currentImage - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); showImage(currentImage + 1); }
  });
  dialog?.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
  dialog?.addEventListener('close', () => { if (lastFocus?.isConnected) lastFocus.focus(); });

  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
})();
