/* ============================================================
   Marsella — Animaciones e interacciones
   - Scroll reveal (IntersectionObserver)
   - Contadores animados en la franja de specs
   - Barra de progreso de scroll  (FIX: antes no tenía JS)
   - Botón flotante de Crystal    (FIX: antes nunca aparecía)
   - Parallax suave en la foto del hero
   - Filtro de galería con animación
   - Lightbox con bloqueo de scroll y cierre con Escape
   ============================================================ */
(function(){
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window && !reduceMotion){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, {threshold:.12, rootMargin:'0px 0px -6% 0px'});
    revealEls.forEach(function(el){ io.observe(el); });
  }else{
    revealEls.forEach(function(el){ el.classList.add('in'); });
  }

  /* ---------- Contadores animados (specs) ---------- */
  function animateCounter(el){
    var raw = el.getAttribute('data-count');
    var target = parseFloat(raw);
    if(isNaN(target) || !el.firstChild || el.firstChild.nodeType !== 3) return;
    var decimals = (raw.split('.')[1] || '').length;
    var dur = 1300;
    var start = performance.now();
    function tick(now){
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3); // ease-out cúbico
      el.firstChild.nodeValue = (target * eased).toFixed(decimals);
      if(p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  var counters = document.querySelectorAll('.num[data-count]');
  if(counters.length && !reduceMotion && 'IntersectionObserver' in window){
    var cio = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){
          animateCounter(e.target);
          cio.unobserve(e.target);
        }
      });
    }, {threshold:.5});
    counters.forEach(function(el){ cio.observe(el); });
  }

  /* ---------- Progreso de scroll + botón flotante + parallax ---------- */
  var progress = document.getElementById('scrollProgress');
  var floatBtn = document.getElementById('crystalFloat');
  var hero = document.querySelector('.hero');
  var heroImg = document.querySelector('.hero-img');
  // La propiedad CSS `translate` es independiente de `transform`,
  // así no pelea con la animación heroZoom del CSS base.
  var canParallax = heroImg && ('translate' in heroImg.style) && !reduceMotion;
  var ticking = false;

  function onScroll(){
    if(ticking) return;
    ticking = true;
    requestAnimationFrame(function(){
      var y = window.scrollY || document.documentElement.scrollTop;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      if(progress) progress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
      if(floatBtn){
        var limit = hero ? hero.offsetHeight * .55 : 380;
        floatBtn.classList.toggle('show', y > limit);
      }
      if(canParallax && y <= window.innerHeight){
        heroImg.style.translate = '0 ' + (y * .22).toFixed(1) + 'px';
      }
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  /* ---------- Pestañas de galería con animación de filtrado ---------- */
  var tabs = document.querySelectorAll('.tab');
  var blocks = document.querySelectorAll('.room-block');
  tabs.forEach(function(tab){
    tab.addEventListener('click', function(){
      tabs.forEach(function(t){ t.classList.remove('active'); });
      tab.classList.add('active');
      var f = tab.getAttribute('data-filter');
      blocks.forEach(function(b){
        var show = (f === 'all' || b.getAttribute('data-cat') === f);
        if(show){
          if(b.style.display === 'none'){
            b.style.display = '';
            b.classList.add('filter-in');
            b.addEventListener('animationend', function(){
              b.classList.remove('filter-in');
            }, {once:true});
          }
        }else{
          b.style.display = 'none';
        }
      });
    });
  });

  /* ---------- Lightbox ---------- */
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');

  window.openLightbox = function(src){
    if(!lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    lightbox.classList.add('show');
    document.body.style.overflow = 'hidden'; // bloquea el scroll de fondo
  };
  window.closeLightbox = function(){
    if(!lightbox) return;
    lightbox.classList.remove('show');
    document.body.style.overflow = '';
  };
  window.addEventListener('keydown', function(e){
    if(e.key === 'Escape') window.closeLightbox();
  });
})();
