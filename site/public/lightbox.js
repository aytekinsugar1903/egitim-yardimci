/* Site-wide lightbox: content images and small video cards. */
(function () {
  var SKIP = /^(logo|icon|badge|avatar|emoji|pixel|spacer)$/i;
  function isSkipImg(img) {
    if (!img || img.closest('header, nav, footer, .brand, .logo, button, a.btn, .sp-back')) return true;
    if (img.closest('#lb-overlay')) return true;
    if (img.width && img.width < 48 && img.height && img.height < 48) return true;
    var al = (img.getAttribute('alt') || '') + ' ' + (img.className || '');
    if (SKIP.test(al.trim())) return true;
    return false;
  }
  function isMedia(el) {
    if (el.tagName === 'IMG') return !isSkipImg(el);
    if (el.tagName === 'VIDEO') {
      if (el.closest('#lb-overlay, header, nav, footer')) return false;
      return true;
    }
    return false;
  }
  function mediaFromEvent(t) {
    if (!t || !t.closest) return null;
    if (isMedia(t)) return t;
    var fig = t.closest('figure, .adim-galeri figure, .kisa-serit figure, .hero-video');
    if (fig) {
      var m = fig.querySelector('img, video');
      if (m && isMedia(m)) return m;
    }
    return null;
  }

  var ov, box, closeBtn, lastFocus, activeVideo;
  function build() {
    if (ov) return;
    ov = document.createElement('div');
    ov.id = 'lb-overlay';
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-modal', 'true');
    ov.setAttribute('aria-label', 'Büyütülmüş görüntü');
    ov.hidden = true;
    ov.innerHTML = '<button type="button" class="lb-kapat" aria-label="Kapat">×</button><div class="lb-icerik"></div>';
    document.body.appendChild(ov);
    box = ov.querySelector('.lb-icerik');
    closeBtn = ov.querySelector('.lb-kapat');
    closeBtn.addEventListener('click', close);
    ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
  }
  function open(el) {
    build();
    box.innerHTML = '';
    activeVideo = null;
    var cap = '';
    var fig = el.closest('figure');
    if (fig) {
      var fc = fig.querySelector('figcaption');
      if (fc) cap = fc.textContent.trim();
    }
    if (el.tagName === 'VIDEO') {
      var v = document.createElement('video');
      var src = el.currentSrc || (el.querySelector('source') && el.querySelector('source').src) || el.src;
      if (src) {
        var s = document.createElement('source');
        s.src = src;
        s.type = 'video/mp4';
        v.appendChild(s);
      }
      v.controls = true;
      v.playsInline = true;
      v.autoplay = true;
      v.muted = false;
      v.setAttribute('controlslist', 'nodownload');
      if (el.poster) v.poster = el.poster;
      box.appendChild(v);
      activeVideo = v;
      // Tıklama bir kullanıcı hareketi: önce sesli oynat, tarayıcı izin vermezse sessiz oynat.
      var pr = v.play();
      if (pr && pr.catch) pr.catch(function () { v.muted = true; v.play().catch(function () {}); });
    } else {
      var im = document.createElement('img');
      im.src = el.currentSrc || el.src;
      im.alt = el.alt || cap || 'Görüntü';
      box.appendChild(im);
    }
    if (cap) {
      var p = document.createElement('p');
      p.className = 'lb-caption';
      p.textContent = cap;
      box.appendChild(p);
    }
    ov.hidden = false;
    ov.classList.remove('lb-acik'); void ov.offsetWidth; ov.classList.add('lb-acik');
    document.body.classList.add('lb-kilit');
    lastFocus = document.activeElement;
    closeBtn.focus();
    document.addEventListener('keydown', onKey);
  }
  function close() {
    if (!ov || ov.hidden) return;
    if (activeVideo) { try { activeVideo.pause(); } catch (e) {} }
    box.innerHTML = '';
    activeVideo = null;
    ov.hidden = true;
    document.body.classList.remove('lb-kilit');
    document.removeEventListener('keydown', onKey);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function onKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key === 'Tab' && ov && !ov.hidden) {
      e.preventDefault();
      closeBtn.focus();
    }
  }

  function mark() {
    var nodes = document.querySelectorAll('.adim-galeri img, .adim-galeri video, .kisa-serit video, .kisa-serit img, .hero-video video, .prose img, .chrome-yukle img, figure img, figure video');
    for (var i = 0; i < nodes.length; i++) {
      if (!isMedia(nodes[i])) continue;
      nodes[i].classList.add('lb-hedef');
      if (!nodes[i].hasAttribute('tabindex')) nodes[i].setAttribute('tabindex', '0');
      if (!nodes[i].getAttribute('role')) nodes[i].setAttribute('role', 'button');
      if (nodes[i].tagName === 'IMG' && !nodes[i].getAttribute('aria-label')) {
        nodes[i].setAttribute('aria-label', (nodes[i].alt || 'Görüntüyü büyüt') + ' — büyüt');
      }
      if (nodes[i].tagName === 'VIDEO' && !nodes[i].getAttribute('aria-label')) {
        nodes[i].setAttribute('aria-label', 'Videoyu büyüt');
      }
    }
  }

  document.addEventListener('click', function (e) {
    var m = mediaFromEvent(e.target);
    if (!m) return;
    // Always open small gallery/strip media in the overlay.
    // Hero video: only if the click is on the poster/figure chrome, not on native controls.
    if (m.tagName === 'VIDEO' && m.closest('.hero-video')) {
      var r = m.getBoundingClientRect();
      if (e.clientY > r.bottom - 48) return; // controls bar
    }
    if (m.tagName === 'VIDEO' && m.closest('.kisa-serit, .adim-galeri, figure')) {
      e.preventDefault();
    }
    if (!isMedia(m)) return;
    if (!m.classList.contains('lb-hedef') && !m.closest('.adim-galeri, .kisa-serit, .hero-video, figure, .prose')) return;
    e.preventDefault();
    open(m);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var m = mediaFromEvent(e.target);
    if (!m || !isMedia(m)) return;
    e.preventDefault();
    open(m);
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mark);
  else mark();
})();
