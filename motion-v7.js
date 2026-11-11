'use strict';
/* V7 motion choreography — framework-free, passive and reduced-motion aware. */
(() => {
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const fine = window.matchMedia('(hover:hover) and (pointer:fine)');
  const $ = (selector, context=document) => context.querySelector(selector);
  const $$ = (selector, context=document) => [...context.querySelectorAll(selector)];
  const clamp = (num,min,max) => Math.min(max,Math.max(min,num));
  // Intro is under one second. Content remains immediately accessible and visible with JS disabled.
  if (reduce.matches) root.classList.add('v7-motion-ready');
  else window.setTimeout(() => root.classList.add('v7-motion-ready'), 120);

  const worldCards = $$('.world-card');
  const cursor = $('.reel-cursor');
  let lastX = -150, lastY = -150;
  let cursorRAF = 0;
  function moveCursor(){
    cursorRAF = 0;
    if (cursor) cursor.style.transform = `translate3d(${lastX}px,${lastY}px,0)`;
  }
  if (fine.matches && !reduce.matches) {
    worldCards.forEach(card => {
      card.addEventListener('pointerenter', () => cursor?.classList.add('is-visible'));
      card.addEventListener('pointermove', event => {
        const b = card.getBoundingClientRect();
        const x = clamp((event.clientX-b.left)/b.width,0,1);
        const y = clamp((event.clientY-b.top)/b.height,0,1);
        card.style.setProperty('--card-ry',`${((x-.5)*8).toFixed(1)}deg`);
        card.style.setProperty('--card-rx',`${((.5-y)*7).toFixed(1)}deg`);
        card.style.setProperty('--spot-x',`${(x*100).toFixed(1)}%`);
        card.style.setProperty('--spot-y',`${(y*100).toFixed(1)}%`);
        lastX=event.clientX;
        lastY=event.clientY;
        if (!cursorRAF) cursorRAF=requestAnimationFrame(moveCursor);
      },{passive:true});
      card.addEventListener('pointerleave', () => {
        cursor?.classList.remove('is-visible');
        card.style.setProperty('--card-ry','0deg');
        card.style.setProperty('--card-rx','0deg');
      });
      card.addEventListener('focus', () => card.classList.add('key-focused'));
      card.addEventListener('blur', () => card.classList.remove('key-focused'));
    });
  }

  // Scroll-linked motion is constrained to the active viewport. No animation libraries or layout reads per frame.
  const hero = $('#home');
  const readSections = $$('.story');
  let scheduled = false;
  function animateOnScroll(){
    scheduled=false;
    if (reduce.matches || root.classList.contains('motion-paused')) return;
    if (hero) {
      const p=clamp(window.scrollY/Math.max(1,hero.offsetHeight),0,1);
      hero.style.setProperty('--orbit-scroll',String(Math.round(p*42)));
    }
    const h=innerHeight;
    for (const card of worldCards) {
      const b=card.getBoundingClientRect();
      if (b.bottom<0 || b.top>h) continue;
      const p=clamp((h/2-(b.top+b.height/2))/h,-.7,.7);
      card.style.setProperty('--image-parallax',`${(p*18).toFixed(1)}px`);
    }
    for (const section of readSections){
      const b=section.getBoundingClientRect();
      if (b.bottom<0 || b.top>h) continue;
      const p=clamp((h*.68-b.top)/(b.height+h*.25),0,1);
      section.style.setProperty('--story-read',p.toFixed(3));
    }
  }
  function onScroll(){
    if (!scheduled){scheduled=true;requestAnimationFrame(animateOnScroll)}
  }
  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('resize',onScroll,{passive:true});
  onScroll();

  // If navigated to an internal chapter, let the page settle and update scroll-linked states.
  document.addEventListener('click', e => {
    const anchor=e.target.closest('a[href^="#"]');
    if (anchor) requestAnimationFrame(onScroll);
  });
})();
