'use strict';
/* V8 Kinetic Atelier — mouse & scroll parallax, one frame scheduler, no dependencies. */
(() => {
  const root = document.documentElement;
  const $ = (q, context=document) => context.querySelector(q);
  const $$ = (q, context=document) => [...context.querySelectorAll(q)];
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover:hover) and (pointer:fine)');
  const hero = $('#home');
  const about = $('#about');
  const kinetic = $('#kinetic-interlude');
  const kineticRows = kinetic ? $('.kinetic-row', kinetic) : [];
  const scene = $('#portfolio-motion');
  const motionButton = $('#motion-control');
  const label = $('.motion-control-label', motionButton || document);
  const cards = $$('.world-card');
  const visuals = $$('.story-visuals');
  let stored = '';
  try { stored = localStorage.getItem('at-portfolio-motion') || ''; } catch (e) {}
  let enabled = !reduced.matches && stored !== 'off';
  function updateMode() {
    const on = enabled && !reduced.matches;
    root.classList.toggle('motion-paused', !on);
    if (motionButton) {
      motionButton.setAttribute('aria-pressed', String(on));
      motionButton.setAttribute('aria-label', on ? 'Turn off decorative motion' : 'Turn on decorative motion');
      motionButton.setAttribute('title', reduced.matches ? 'Reduced motion is enabled on this device' : (on ? 'Turn off animations' : 'Turn on animations'));
      motionButton.disabled = reduced.matches;
    }
    if (label) label.textContent = on ? 'MOTION ON' : 'MOTION OFF';
  }
  updateMode();
  motionButton?.addEventListener('click', () => {
    if (reduced.matches) return;
    enabled = !enabled;
    try { localStorage.setItem('at-portfolio-motion', enabled ? 'on' : 'off'); } catch (e) {}
    updateMode();
    requestTick();
  });
  reduced.addEventListener?.('change', () => { updateMode(); requestTick(); });

  const motionField = { mx:0, my:0, tx:0, ty:0, scroll:window.scrollY, targetScroll:window.scrollY };
  let raf = 0;
  let visible = !document.hidden;
  const set = (el, name, value) => el?.style.setProperty(name, value);
  const npx = n => `${n.toFixed(2)}px`;
  function requestTick(){ if (!raf && visible) raf=requestAnimationFrame(tick); }
  function nearViewport(el, margin=160){
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return r.bottom > -margin && r.top < innerHeight + margin ? r : null;
  }
  function tick(){
    raf = 0;
    if (!enabled || reduced.matches || !visible) return;
    const s = motionField;
    s.mx += (s.tx - s.mx) * .115;
    s.my += (s.ty - s.my) * .115;
    s.scroll += (s.targetScroll - s.scroll) * .16;
    const mx = fine.matches ? s.mx : 0;
    const my = fine.matches ? s.my : 0;
    const vw = innerWidth;
    const vh = innerHeight;
    const mobileScale = clamp(vw / 1380, .45, 1);

    if (hero) {
      const r=nearViewport(hero,80);
      if (r) {
        const p=clamp(s.scroll / Math.max(1,hero.offsetHeight),0,1);
        set(hero,'--hero-grid-x',npx(mx * -6));
        set(hero,'--hero-grid-y',npx(my * -6 + p*13));
        set(hero,'--hero-fog-x',npx(mx * 52));
        set(hero,'--hero-fog-y',npx(my * 36 + p*26));
        set(hero,'--hero-beam-x',npx(mx * 34));
        set(hero,'--hero-beam-y',npx(my * 21 + p*25));
        set(hero,'--hero-glint-x',npx(mx * -29));
        set(hero,'--hero-glint-y',npx(my * -15 + p*19));
        set(hero,'--hero-orbit-mx',npx(mx * -18));
        set(hero,'--hero-orbit-my',npx(my * -11));
        set(hero,'--hero-ghost-mx',npx(mx * 14));
        set(hero,'--hero-ghost-my',npx(my * 7 + p * 16));
        set(hero,'--hero-stage-mx',npx(mx * -12 * mobileScale));
        set(hero,'--hero-stage-my',npx(my * -9 + p * 24));
      }
    }
    if (about) {
      const r=nearViewport(about,120);
      if (r) {
        set(about,'--about-layer-x',npx(mx * -7));
        set(about,'--about-layer-y',npx(my * -6));
      }
    }
    if (kinetic) {
      const r=nearViewport(kinetic,80);
      if (r) {
        const p=clamp((vh-r.top)/(vh+r.height),0,1);
        const travel=(p-.5)*mobileScale;
        set(kinetic,'--kinetic-a',npx(travel*310));
        set(kinetic,'--kinetic-b',npx(-travel*390));
        set(kinetic,'--kinetic-c',npx(travel*260));
        set(kinetic,'--kinetic-amx',npx(mx*-12));
        set(kinetic,'--kinetic-amy',npx(my*-5));
        set(kinetic,'--kinetic-bmx',npx(mx*16));
        set(kinetic,'--kinetic-bmy',npx(my*8));
        set(kinetic,'--kinetic-cmx',npx(mx*-9));
        set(kinetic,'--kinetic-cmy',npx(my*-7));
        set(kinetic,'--torus-ax',npx((p-.5)*58 + mx*30));
        set(kinetic,'--torus-ay',npx((.5-p)*52 + my*24));
        set(kinetic,'--torus-bx',npx((.5-p)*45 - mx*22));
        set(kinetic,'--torus-by',npx((p-.5)*30 - my*15));
        // Touch devices have no mouse parallax; these lines move in response to scrolling.
        if (vw <= 600) {
          const sweep = (p - .5) * 2;
          const amplitude = clamp(vw * .065, 16, 27);
          const shifts = [amplitude * sweep, -amplitude * .85 * sweep, amplitude * .9 * sweep];
          const focus = [.26,.5,.74];
          kineticRows.forEach((row, i) => {
            set(row,'--mobile-kinetic-x',npx(shifts[i] || 0));
            set(row,'--mobile-kinetic-y',npx((p - focus[i]) * (i === 1 ? -3 : 3)));
            set(row,'--mobile-kinetic-opacity',clamp(1 - Math.abs(p - focus[i]) * .28, .82, 1).toFixed(3));
          });
        }
      }
    }
    if (scene) {
      const r=nearViewport(scene,120);
      if (r) {
        const p=vw <= 600
          ? clamp((vh-r.top)/(vh+r.height),0,1)
          : clamp(-r.top/Math.max(1,r.height-vh),0,1);
        set(scene,'--v8-scene-progress',p.toFixed(3));
        set(scene,'--scene-halo-x',npx(mx*46+(p-.5)*24));
        set(scene,'--scene-halo-y',npx(my*36));
        set(scene,'--scene-type-mx',npx(mx*10));
        set(scene,'--scene-type-my',npx(my*4));
        const offsets=[[-13,-10],[21,14],[-28,18],[34,-21]];
        $$('.scene-photo',scene).forEach((el,i) => {
          const [dx,dy]=offsets[i]||[10,12];
          set(el,'--scene-mouse-x',npx(mx*dx));
          set(el,'--scene-mouse-y',npx(my*dy));
          if (vw <= 600) {
            const lift = [11,-9,8,-10][i] || 6;
            set(el,'--mobile-card-y',npx((p-.5) * lift));
          }
        });
      }
    }
    const epsilon=Math.max(Math.abs(s.mx-s.tx),Math.abs(s.my-s.ty),Math.abs(s.scroll-s.targetScroll));
    if (epsilon>.05) requestTick();
  }
  addEventListener('scroll', () => {motionField.targetScroll=scrollY;requestTick();},{passive:true});
  addEventListener('resize', requestTick,{passive:true});
  addEventListener('pointermove', e => {
    if (!fine.matches || !enabled || reduced.matches) return;
    motionField.tx=clamp((e.clientX/innerWidth-.5)*2,-1,1);
    motionField.ty=clamp((e.clientY/innerHeight-.5)*2,-1,1);
    requestTick();
  },{passive:true});
  document.addEventListener('visibilitychange',() => {visible=!document.hidden;if (visible) requestTick();});

  // Cards have two independent 3D layers: image goes away from the pointer, title advances.
  if (fine.matches) {
    for (const card of cards) {
      card.addEventListener('pointermove',e => {
        if (!enabled || reduced.matches) return;
        const b=card.getBoundingClientRect();
        const x=clamp((e.clientX-b.left)/b.width-.5,-.5,.5);
        const y=clamp((e.clientY-b.top)/b.height-.5,-.5,.5);
        set(card,'--world-image-mx',npx(-x*17));
        set(card,'--world-image-my',npx(-y*16));
        set(card,'--world-copy-x',npx(x*7));
        set(card,'--world-copy-y',npx(y*7));
      },{passive:true});
      card.addEventListener('pointerleave',() => {
        for (const property of ['--world-image-mx','--world-image-my','--world-copy-x','--world-copy-y']) set(card,property,'0px');
      });
    }
    for (const visual of visuals) {
      visual.addEventListener('pointermove',e => {
        if (!enabled || reduced.matches) return;
        const b=visual.getBoundingClientRect();
        const x=clamp((e.clientX-b.left)/b.width-.5,-.5,.5);
        const y=clamp((e.clientY-b.top)/b.height-.5,-.5,.5);
        set(visual,'--story-layer-x',npx(x*-8));
        set(visual,'--story-layer-y',npx(y*-6));
        set(visual,'--story-floating-x',npx(x*14));
        set(visual,'--story-floating-y',npx(y*12));
      },{passive:true});
      visual.addEventListener('pointerleave',() => {
        for (const property of ['--story-layer-x','--story-layer-y','--story-floating-x','--story-floating-y']) set(visual,property,'0px');
      });
    }
  }
  requestTick();
})();
