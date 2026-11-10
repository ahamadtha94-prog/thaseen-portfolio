(()=>{'use strict';
document.documentElement.classList.add('js');
const $=(s,root=document)=>root.querySelector(s), $$=(s,root=document)=>Array.from(root.querySelectorAll(s));
const body=document.body;
// Fast, deliberately restrained loading curtain. No extra network resources required.
const loader=$('#loader'), num=$('#loader-number'); const start=performance.now();
function revealPage(){ if(loader)loader.classList.add('off'); }
function animateLoader(t){if(!loader||loader.classList.contains('off'))return;let p=Math.min(100,Math.round((t-start)/650*100));num.textContent=String(p).padStart(3,'0');if(p>=100){revealPage()}else requestAnimationFrame(animateLoader)}
if(matchMedia('(prefers-reduced-motion: reduce)').matches)revealPage();else requestAnimationFrame(animateLoader);
setTimeout(revealPage,1100);
// Progressive intersection reveals.
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealObserver=('IntersectionObserver'in window)?new IntersectionObserver((entries,obs)=>{entries.forEach(x=>{if(x.isIntersecting){x.target.classList.add('visible');obs.unobserve(x.target)}})},{threshold:.065,rootMargin:'0px 0px -25px 0px'}):null;
$$('.reveal').forEach((el,i)=>{if(revealObserver)revealObserver.observe(el);else el.classList.add('visible')});
const progress=$('#scroll-progress'), header=$('#site-header'), visual=$('.hero-visual');let ticking=false;
function updateScroll(){const max=document.documentElement.scrollHeight-window.innerHeight;progress.style.width=(max>0?scrollY/max*100:0)+'%';header.classList.toggle('scrolled',scrollY>30);if(visual&&!reduced&&window.innerWidth>850&&scrollY<window.innerHeight*1.6)visual.style.transform=`translate3d(0,${scrollY*.075}px,0)`;ticking=false}
window.addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(updateScroll);ticking=true}},{passive:true});updateScroll();
// Mobile menu with keyboard and click closure.
const toggle=$('#menu-toggle'), menu=$('#mobile-menu');function closeMenu(){toggle.classList.remove('is-open');toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Open menu');menu.classList.remove('open');menu.inert=true;body.classList.remove('no-scroll')};
toggle.addEventListener('click',()=>{if(menu.classList.contains('open'))closeMenu();else{toggle.classList.add('is-open');toggle.setAttribute('aria-expanded','true');toggle.setAttribute('aria-label','Close menu');menu.inert=false;menu.classList.add('open');body.classList.add('no-scroll')}});$$('.mobile-menu a').forEach(a=>a.addEventListener('click',closeMenu));
// Interactive portfolio filtering.
const cards=$$('.project-card');let visibleCards=cards;
$$('.filter').forEach(btn=>btn.addEventListener('click',()=>{const type=btn.dataset.filter;$$('.filter').forEach(b=>{b.classList.remove('active');b.setAttribute('aria-pressed','false')});btn.classList.add('active');btn.setAttribute('aria-pressed','true');visibleCards=cards.filter(card=>type==='all'||card.dataset.category===type);cards.forEach(card=>{const show=visibleCards.includes(card);card.classList.toggle('hidden',!show);card.tabIndex=show?0:-1; if(show)card.classList.add('visible')});}));
// Lightbox — focus restoration, keyboard navigation, accessible labels.
const lightbox=$('#lightbox'), lbImg=$('#lightbox-image'), lbName=$('#lightbox-name'), lbCount=$('#lightbox-counter');let activeCard=0, focusBefore=null;
function showProject(n){if(!visibleCards.length)return;activeCard=(n+visibleCards.length)%visibleCards.length;const card=visibleCards[activeCard],img=$('img',card);lbImg.src=img.src;lbImg.alt=img.alt;lbName.textContent=$('h3',card).textContent;lbCount.textContent=String(activeCard+1).padStart(2,'0')+' / '+String(visibleCards.length).padStart(2,'0')}
function openLightbox(card){focusBefore=document.activeElement;const n=visibleCards.indexOf(card);showProject(Math.max(0,n));lightbox.classList.add('open');lightbox.setAttribute('aria-hidden','false');body.classList.add('no-scroll');$('#lightbox-close').focus()}
function closeLightbox(){lightbox.classList.remove('open');lightbox.setAttribute('aria-hidden','true');body.classList.remove('no-scroll');lbImg.removeAttribute('src');if(focusBefore&&focusBefore.focus)focusBefore.focus()}
cards.forEach(card=>{card.addEventListener('click',()=>openLightbox(card));card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openLightbox(card)}})});
$('#lightbox-close').addEventListener('click',closeLightbox);$('#lightbox-prev').addEventListener('click',()=>showProject(activeCard-1));$('#lightbox-next').addEventListener('click',()=>showProject(activeCard+1));lightbox.addEventListener('click',e=>{if(e.target===lightbox)closeLightbox()});
window.addEventListener('keydown',e=>{if(e.key==='Escape'){if(lightbox.classList.contains('open'))closeLightbox();else if(menu.classList.contains('open'))closeMenu()}if(lightbox.classList.contains('open')){if(e.key==='ArrowRight')showProject(activeCard+1);if(e.key==='ArrowLeft')showProject(activeCard-1);if(e.key==='Tab'){const controls=[$('#lightbox-close'),$('#lightbox-prev'),$('#lightbox-next')],i=controls.indexOf(document.activeElement);if(e.shiftKey&&i<=0){e.preventDefault();controls.at(-1).focus()}else if(!e.shiftKey&&i===controls.length-1){e.preventDefault();controls[0].focus()}}}});
// THINN brand carousel is a real working product image switcher.
const brandSlides=[['assets/thinn-afterlife-collection.webp','THINN Afterlife four-fragrance collection','COLLECTION'],['assets/thinn-first-pour.webp','THINN First Pour golden bottle','FIRST POUR'],['assets/thinn-garnet-hour.webp','THINN Garnet Hour red bottle','GARNET HOUR'],['assets/thinn-oud-trace.webp','THINN Oud Trace amber bottle','OUD TRACE'],['assets/thinn-blue-sound.webp','THINN Blue Sound blue bottle','BLUE SOUND']];let currentBrand=0,brandTimer=0;
function setBrand(n){currentBrand=(n+brandSlides.length)%brandSlides.length;const img=$('#brand-featured-image');img.classList.add('swap');clearTimeout(brandTimer);brandTimer=setTimeout(()=>{img.src=brandSlides[currentBrand][0];img.alt=brandSlides[currentBrand][1];$('#brand-image-label').textContent=String(currentBrand+1).padStart(2,'0')+' / '+brandSlides[currentBrand][2];$('#brand-image-count').textContent=String(currentBrand+1).padStart(2,'0')+' / 05';$$('.brand-choice').forEach((btn,i)=>btn.classList.toggle('active',i===currentBrand));img.classList.remove('swap')},150)}
$$('.brand-choice').forEach(b=>b.addEventListener('click',()=>setBrand(+b.dataset.brand)));$('#brand-prev').addEventListener('click',()=>setBrand(currentBrand-1));$('#brand-next').addEventListener('click',()=>setBrand(currentBrand+1));
// Keep service disclosure simple; opening one collapses another.
$$('.service-item').forEach(d=>d.addEventListener('toggle',()=>{if(d.open)$$('.service-item').forEach(other=>{if(other!==d)other.open=false})}));
// A subtle optional desktop cursor, disabled on touch screens.
if(matchMedia('(hover:hover) and (pointer:fine)').matches&&!reduced){const cursor=$('.cursor');let x=-100,y=-100,cx=-100,cy=-100;window.addEventListener('pointermove',e=>{x=e.clientX;y=e.clientY;cursor.classList.add('on')},{passive:true});window.addEventListener('pointerleave',()=>cursor.classList.remove('on'));function frame(){cx+=(x-cx)*.18;cy+=(y-cy)*.18;cursor.style.left=cx+'px';cursor.style.top=cy+'px';requestAnimationFrame(frame)}requestAnimationFrame(frame);$$('a,button,.project-card').forEach(el=>{el.addEventListener('mouseenter',()=>cursor.classList.add('active'));el.addEventListener('mouseleave',()=>cursor.classList.remove('active'))})}

// Prepare visitor enquiries in their own email client. No fake server submission.
const inquiry=document.querySelector('#inquiry-form');if(inquiry)inquiry.addEventListener('submit',e=>{e.preventDefault();if(!inquiry.reportValidity())return;const v=new FormData(inquiry),subject='Portfolio enquiry — '+v.get('topic'),message='Name: '+v.get('name')+'\nEmail: '+v.get('email')+'\nTopic: '+v.get('topic')+'\n\n'+v.get('message');window.location.href='mailto:hamidibrahim611@gmail.com?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(message)});
})();