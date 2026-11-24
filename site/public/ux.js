/* Evrak Asistanı – site geneli akıcılık katmanı (2026-11-21)
   Kaydırınca beliren bölümler, üst çubuk gölgesi ve ilerleme çizgisi,
   yumuşak açılan SSS, kart ışığı, video iyileştirmeleri, kısa video şeridi okları. */
(function () {
  var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var d = document, root = d.documentElement;
  root.classList.add('ux');

  /* --- Üst çubuk: kaydırınca gölge + ilerleme çizgisi --- */
  var hdr = d.querySelector('header.top');
  var bar = d.createElement('div'); bar.className = 'ux-ilerleme'; bar.setAttribute('aria-hidden', 'true');
  d.body.appendChild(bar);
  var tick = false;
  function onScroll() {
    if (tick) return; tick = true;
    requestAnimationFrame(function () {
      tick = false;
      var y = scrollY, h = root.scrollHeight - innerHeight;
      if (hdr) hdr.classList.toggle('kaydi', y > 8);
      bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, y / h) : 0).toFixed(4) + ')';
    });
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* --- Kaydırınca belirme --- */
  var SEL = 'main h2, main .sub, main .card, .agsteps li, .agwrap, .kisa-serit figure, main details, .trust, .neler, .dl-kart, .adim-galeri figure, .fiyat-kutu, main table.fiyat, main .note, .formcard, .deneme-kutusu, .nasil-oyss figure, .hero-video, .home-video, .ux-rozetler span';
  if (!RM && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('gor'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    var els = d.querySelectorAll(SEL);
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el.closest('header, footer, #lb-overlay')) continue;
      var r = el.getBoundingClientRect();
      if (r.top < innerHeight * 0.92) continue;       // ilk ekranda görünen hemen görünür kalsın
      var sib = 0, p = el.previousElementSibling;
      while (p && sib < 6) { if (p.matches && p.matches(SEL)) sib++; p = p.previousElementSibling; }
      el.style.setProperty('--rv-g', (sib * 70) + 'ms');
      el.classList.add('rv');
      io.observe(el);
    }
  }

  /* --- Kartlarda imleci izleyen hafif ışık --- */
  if (!RM && matchMedia('(hover: hover)').matches) {
    d.addEventListener('pointermove', function (e) {
      var c = e.target.closest && e.target.closest('.card');
      if (!c) return;
      var r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }, { passive: true });
  }

  /* --- SSS: yumuşak açılıp kapanma --- */
  if (!RM) {
    d.querySelectorAll('main details:not(.navdrop)').forEach(function (det) {
      var sum = det.querySelector('summary'); if (!sum) return;
      sum.addEventListener('click', function (e) {
        e.preventDefault();
        if (det._anim) return;
        var start = det.offsetHeight;
        if (det.open) {
          var end = sum.offsetHeight + parseFloat(getComputedStyle(det).paddingTop) + parseFloat(getComputedStyle(det).paddingBottom) + 2;
          det._anim = det.animate({ height: [start + 'px', end + 'px'] }, { duration: 260, easing: 'cubic-bezier(.2,.7,.2,1)' });
          det._anim.onfinish = function () { det.open = false; det._anim = null; };
        } else {
          det.style.height = start + 'px'; det.open = true;
          var full = det.scrollHeight + 2; det.style.height = '';
          det._anim = det.animate({ height: [start + 'px', full + 'px'] }, { duration: 300, easing: 'cubic-bezier(.2,.7,.2,1)' });
          det._anim.onfinish = function () { det._anim = null; };
        }
      });
    });
  }

  /* --- Videolar --- */
  // Ana sayfa / ürün sayfası büyük video: görünmüyorsa durdur, sesi aç düğmesi ekle
  d.querySelectorAll('.home-video video').forEach(function (v) {
    var box = v.parentNode;
    var b = d.createElement('button'); b.type = 'button'; b.className = 'ux-ses';
    function etiket() { b.innerHTML = v.muted ? '<span aria-hidden="true">🔇</span> Sesi aç' : '<span aria-hidden="true">🔊</span> Sesi kapat'; b.setAttribute('aria-pressed', v.muted ? 'false' : 'true'); }
    b.addEventListener('click', function (e) { e.stopPropagation(); v.muted = !v.muted; if (!v.muted) { v.currentTime = 0; v.play().catch(function () {}); } etiket(); });
    etiket(); box.appendChild(b);
    var bb = d.createElement('button'); bb.type = 'button'; bb.className = 'ux-buyut'; bb.textContent = 'Tam ekran';
    bb.addEventListener('click', function (e) {
      e.stopPropagation();
      var f = v.requestFullscreen || v.webkitRequestFullscreen || v.webkitEnterFullscreen;
      if (f) { v.muted = false; etiket(); f.call(v); v.play().catch(function () {}); }
    });
    box.appendChild(bb);
    if (RM) { v.removeAttribute('autoplay'); v.pause(); v.controls = true; return; }
    v.muted = true; v.defaultMuted = true; v.loop = true; v.playsInline = true;
    v.setAttribute('autoplay', ''); v.setAttribute('muted', ''); v.setAttribute('loop', ''); v.setAttribute('playsinline', '');
    if (v.preload === 'none' || !v.preload) v.preload = 'auto';
    function deneOynat() { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
    deneOynat();
    addEventListener('load', deneOynat);
    d.addEventListener('visibilitychange', function () { if (!d.hidden) deneOynat(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        if (es[0].isIntersecting) { if (v.preload === 'none') v.preload = 'auto'; deneOynat(); }
        else v.pause();
      }, { threshold: 0.15 }).observe(v);
    }
    v.addEventListener('playing', function () { box.classList.add('oynuyor'); });
  });

  // Ürün sayfası tanıtım videosu: oynarken çerçeveyi vurgula
  d.querySelectorAll('.hero-video video').forEach(function (v) {
    var box = v.closest('.hero-video');
    v.addEventListener('play', function () { box.classList.add('oynuyor'); });
    v.addEventListener('pause', function () { box.classList.remove('oynuyor'); });
  });

  // Kısa video şeridi: kontrol çubuğunu gizle (tıklayınca büyük oynatıcı açılır), oklar ekle
  d.querySelectorAll('.kisa-serit').forEach(function (s) {
    s.querySelectorAll('video').forEach(function (v) { v.removeAttribute('controls'); v.closest('figure').classList.add('ux-oynat'); });
    var w = d.createElement('div'); w.className = 'ux-serit';
    s.parentNode.insertBefore(w, s); w.appendChild(s);
    function ok(yon, lbl) {
      var b = d.createElement('button'); b.type = 'button'; b.className = 'ux-ok ' + (yon < 0 ? 'sol' : 'sag');
      b.setAttribute('aria-label', lbl); b.innerHTML = yon < 0 ? '‹' : '›';
      b.addEventListener('click', function () {
        var fig = s.querySelector('figure');
        var gap = parseFloat(getComputedStyle(s).columnGap || getComputedStyle(s).gap) || 18;
        var step = fig ? Math.round(fig.getBoundingClientRect().width + gap) : 200;
        s.scrollBy({ left: yon * step, behavior: RM ? 'auto' : 'smooth' });
      });
      w.appendChild(b); return b;
    }
    var L = ok(-1, 'Önceki video'), Rr = ok(1, 'Sonraki video');
    function upd() {
      L.disabled = s.scrollLeft < 8;
      Rr.disabled = s.scrollLeft + s.clientWidth > s.scrollWidth - 8;
      w.classList.toggle('tasma', s.scrollWidth > s.clientWidth + 8);
    }
    s.addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); upd();
  });

  /* --- Ana sayfa: role göre uygulama sekmeleri (akordeon) --- */
  var tl = d.querySelector('.rol-sekme');
  if (tl) {
    var tabs = [].slice.call(tl.querySelectorAll('[role=tab]'));
    var ROLLER = { ogretmen: 1, idare: 1, kamu: 1 };
    root.classList.add('rol-js');
    tabs.forEach(function (b) {
      var p = d.getElementById(b.getAttribute('aria-controls'));
      if (p && !p.querySelector('.rol-panel-ic')) {
        var ic = d.createElement('div');
        ic.className = 'rol-panel-ic';
        while (p.firstChild) ic.appendChild(p.firstChild);
        p.appendChild(ic);
      }
    });
    function hashRol() {
      var h = (location.hash || '').replace('#', '');
      if (h.indexOf('rol-') === 0) h = h.slice(4);
      if (h.indexOf('sekme-') === 0) h = h.slice(6);
      return ROLLER[h] ? h : '';
    }
    function acikRol() {
      var b = tabs.filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0];
      return b ? b.getAttribute('data-rol') : '';
    }
    function uygula(k, odak, kaydir) {
      tabs.forEach(function (b) {
        var on = !!k && b.getAttribute('data-rol') === k;
        b.setAttribute('aria-selected', on ? 'true' : 'false');
        b.setAttribute('aria-expanded', on ? 'true' : 'false');
        b.tabIndex = 0;
        var p = d.getElementById(b.getAttribute('aria-controls'));
        if (p) {
          p.hidden = false;
          p.classList.toggle('acik', on);
          p.setAttribute('aria-hidden', on ? 'false' : 'true');
          if ('inert' in p) p.inert = !on;
          if (on) p.querySelectorAll('.rv').forEach(function (e) { e.classList.add('gor'); });
        }
        if (on && odak) b.focus();
      });
      if (kaydir && k) {
        var u = d.getElementById('uygulamalar');
        if (u) u.scrollIntoView({ behavior: RM ? 'auto' : 'smooth' });
      }
    }
    function sec(k, odak, kaydir, zorla) {
      if (!zorla && acikRol() === k) return;          /* bir sekme hep açık kalır */
      try { localStorage.setItem('ea-rol', k); } catch (e) {}
      uygula(k, odak, kaydir);
    }
    tabs.forEach(function (b, i) {
      b.addEventListener('click', function () { sec(b.getAttribute('data-rol')); });
      b.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault(); sec(b.getAttribute('data-rol'), true); return;
        }
        var j = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : -1;
        if (j < 0) return;
        e.preventDefault();
        j = (j + tabs.length) % tabs.length;
        tabs[j].focus();
      });
    });
    var ilk = hashRol(), kayitli = '';
    try { kayitli = localStorage.getItem('ea-rol') || ''; } catch (e) {}
    uygula(ilk || (ROLLER[kayitli] ? kayitli : 'ogretmen'), false, !!ilk);
    addEventListener('hashchange', function () {
      var k = hashRol();
      if (k) sec(k, false, true, true);
    });
  }

  /* --- Üst menü: sabit "Ücretsiz deneyin" düğmesi --- */
  (function () {
    var nav = d.querySelector('header.top nav');
    if (!nav || d.querySelector('.ux-dene')) return;
    var a = d.createElement('a');
    a.className = 'ux-dene';
    a.href = 'https://wa.me/905531002636?text=' + encodeURIComponent('Merhaba, Evrak Asistanı için 48 saatlik deneme istiyorum. Kurum kodu: ');
    a.target = '_blank'; a.rel = 'noopener';
    a.innerHTML = '<span class="ux-dene-uzun">Ücretsiz </span>deneyin';
    nav.parentNode.insertBefore(a, nav.nextSibling);
  })();

  /* --- Ürün sayfaları: kurulum adımları satın alma öncesi kalabalık yapmasın; açılır bölüm --- */
  d.querySelectorAll('main h2').forEach(function (h) {
    if (!/^\s*Nasıl kurulur\s*$/.test(h.textContent)) return;
    var det = d.createElement('details'); det.className = 'ux-kurulum';
    var sum = d.createElement('summary'); sum.textContent = 'Kurulum nasıl yapılır? (deneme anahtarı ya da satın alma sonrası)';
    det.appendChild(sum);
    var n = h.nextElementSibling;
    while (n && !/^H2$/.test(n.tagName) && !n.querySelector('h2') && !n.classList.contains('deneme-kutusu')) {
      var sonraki = n.nextElementSibling; det.appendChild(n); n = sonraki;
    }
    h.parentNode.replaceChild(det, h);
  });
})();
