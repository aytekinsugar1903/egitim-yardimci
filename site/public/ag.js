/* Evrak Asistanı – 3D ahtapot / dünya şeması (2026-11-21)
   Düğümler bir küre üzerinde durur; küre kendi ekseninde dünya gibi döner.
   Perspektif, derinlik sıralaması, 3D dalgalanan kollar, dönen küre çekirdek,
   fareyle / parmakla sürükleyerek döndürme ve atalet. */
(function () {
  var sv = document.querySelector('.agsvg'); if (!sv) return;
  var SATURN = !!(sv.closest && sv.closest('.ag-saturn'));
  if (SATURN) sv.classList.add('saturn-mod');
  var NS = 'http://www.w3.org/2000/svg';
  var K = ['ebys', 'dys', 'belgenet', 'mudur', 'formt', 'eokul', 'oy', 'myp', 'muh', 'veli', 'reh', 'siz'];
  var SHORT = { ebys: 'EBYS', dys: 'DYS', belgenet: 'Belgenet', mudur: 'Müdür Paketi', formt: 'Form Toplayıcı', eokul: 'Okul Pro', oy: 'Öğretmen Yrd.', myp: 'Müdür Yrd.', muh: 'Muhasebe', veli: 'Veli Asistanı', reh: 'Rehberlik', siz: 'Siz (onay)' };
  var FULL = { ebys: 'EBYS', dys: 'DYS', belgenet: 'Belgenet', mudur: 'Müdür Paketi', formt: 'Form Toplayıcı', eokul: 'Okul Pro', oy: 'Öğretmen Yardımcısı', myp: 'Müdür Yardımcısı', muh: 'Muhasebe', veli: 'Veli Asistanı', reh: 'Rehberlik', siz: 'Siz (onay)' };
  var IN = ['ebys', 'dys', 'belgenet', 'mudur', 'formt', 'eokul', 'oy', 'myp', 'muh', 'veli', 'reh'];
  var STEP = 3400, NSEG = 22;
  var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- sahneyi kur ---------- */
  var orbit = sv.querySelector('.orbit');
  var core = sv.querySelector('.core');
  var ctTitle = sv.querySelector('text.ct'); if (ctTitle) ctTitle.style.display = 'none';
  var docs = [].slice.call(sv.querySelectorAll('.doc'));
  var li = document.querySelectorAll('.agsteps li');
  var cn = document.querySelector('.agn'), ct = document.querySelector('.agt');

  // Yörünge halkası: dairenin yerine 3D elips yolu
  var ring = document.createElementNS(NS, 'path'); ring.setAttribute('class', 'orbit3d');
  var ring2 = document.createElementNS(NS, 'path'); ring2.setAttribute('class', 'orbit3d o2');
  if (orbit) { orbit.parentNode.insertBefore(ring, orbit); orbit.parentNode.insertBefore(ring2, orbit); orbit.remove(); }
  else { sv.insertBefore(ring2, sv.firstChild); sv.insertBefore(ring, sv.firstChild); }

  // Kollar: her uygulama için tek grup (kol + vantuzlar + düğüm bağlantısı)
  var arms = {}, stage = document.createElementNS(NS, 'g'); stage.setAttribute('class', 'stage');
  sv.insertBefore(stage, ring2.nextSibling);
  K.forEach(function (k) {
    var g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'arm'); g.setAttribute('data-k', k);
    var tn = sv.querySelector('.tn[data-k="' + k + '"]');
    var cg = sv.querySelector('.cups[data-k="' + k + '"]');
    var nd = sv.querySelector('.nd[data-k="' + k + '"]');
    var a = nd ? nd.closest('a') : null;
    if (tn) g.appendChild(tn); if (cg) g.appendChild(cg); if (a) g.appendChild(a); else if (nd) g.appendChild(nd);
    arms[k] = { g: g, tn: tn, cups: cg ? cg.children : [], nd: nd, a: a, z: 0 };
    stage.appendChild(g);
  });
  if (core) stage.appendChild(core);
  docs.forEach(function (d) { sv.appendChild(d); });

  // Çekirdek: kendi içinde dönen küre (meridyen + paralel çizgileri)
  var globe = document.createElementNS(NS, 'g'); globe.setAttribute('class', 'globe');
  var gBack = document.createElementNS(NS, 'path'); gBack.setAttribute('class', 'gl back');
  var gFront = document.createElementNS(NS, 'path'); gFront.setAttribute('class', 'gl');
  var gShine = document.createElementNS(NS, 'circle'); gShine.setAttribute('class', 'gshine');
  globe.appendChild(gBack); globe.appendChild(gFront); globe.appendChild(gShine);
  var cb = core && core.querySelector('.cb');
  var face = null;
  if (core) {
    face = document.createElementNS(NS, 'g'); face.setAttribute('class', 'face');
    [].slice.call(core.children).forEach(function (n) { if (!n.classList.contains('halo') && !n.classList.contains('cb')) face.appendChild(n); });
    core.appendChild(face);
  }
  var GR = 64;
  if (cb) {
    cb.setAttribute('r', GR);
    var halo = core.querySelector('.halo'); if (halo) halo.setAttribute('r', GR + 24);
    core.insertBefore(globe, face);
    gShine.setAttribute('r', GR);
  }
  // Küre gölgelendirmesi
  var defs = sv.querySelector('defs');
  if (defs && !sv.querySelector('#ag-sph')) {
    defs.insertAdjacentHTML('beforeend',
      '<radialGradient id="ag-sph" cx="38%" cy="32%" r="75%"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#e6fbfd"/><stop offset="1" stop-color="#a7e3ec"/></radialGradient>' +
      '<radialGradient id="ag-shine" cx="34%" cy="28%" r="40%"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="ag-arm" x1="0" x2="1"><stop offset="0" stop-color="#0f766e"/><stop offset="1" stop-color="#14b8a6"/></linearGradient>' +
      '<linearGradient id="ag-arm-on" x1="0" x2="1"><stop offset="0" stop-color="#c2410c"/><stop offset="1" stop-color="#f59e0b"/></linearGradient>');
  }
  if (cb) cb.setAttribute('fill', 'url(#ag-sph)');
  gShine.setAttribute('fill', 'url(#ag-shine)');

  /* ---------- geometri ---------- */
  var C = [450, 350], R = 255, sm = false, D = 900, LATK = 1;
  // Düğümlerin küre üzerindeki yerleri (enlem/boylam). Zikzak "taç" dizilimi.
  var base = K.map(function (k, i) {
    var lon = i * 2 * Math.PI / K.length;
    var lat = (i % 2 ? -1 : 1) * 0.36 + Math.sin(i * 2.3) * 0.06;
    return { lon: lon, lat: lat, ph: i * 1.7 };
  });

  var theta = 0.35, alpha = 0.34, ALPHA0 = 0.34;   // dönüş açısı ve eğim
  var vel = 0, BASEV = 2 * Math.PI / 42;            // rad/sn (42 sn'de bir tur)
  if (SATURN) BASEV = 0;                             // kollar halkayla senkron; küre yalnızca sallanır
  var targetV = BASEV;

  function sph(r, lat, lon) { return [r * Math.cos(lat) * Math.sin(lon), -r * Math.sin(lat), r * Math.cos(lat) * Math.cos(lon)]; }
  var cT, sT, cA, sA;
  function setRot() { cT = Math.cos(theta); sT = Math.sin(theta); cA = Math.cos(alpha); sA = Math.sin(alpha); }
  // Y ekseni çevresinde döndür, sonra X ekseninde eğ (yukarıdan bakış)
  function rot(p) {
    var x = p[0] * cT + p[2] * sT, z = -p[0] * sT + p[2] * cT, y = p[1];
    return [x, y * cA + z * sA, -y * sA + z * cA];
  }
  function tiltOnly(p) { return [p[0], p[1] * cA + p[2] * sA, -p[1] * sA + p[2] * cA]; }
  function proj(q) { var f = D / (D - q[2]); return [C[0] + q[0] * f, C[1] + q[1] * f, f, q[2]]; }
  function cub(a, b, c, d, t) { var u = 1 - t; return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d; }
  function norm(v) { var l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }

  function layout() {
    sm = sv.getBoundingClientRect().width < 640;
    sv.classList.toggle('sm', sm);
    if (SATURN) {
      if (sm) { C = [250, 118]; R = 200; GR = 46; LATK = 1.45; D = R * 4.4; sv.setAttribute('viewBox', '0 0 500 420'); }
      else { C = [450, 118]; R = 280; GR = 64; LATK = 1.05; D = R * 3.6; sv.setAttribute('viewBox', '0 0 900 410'); }
    } else if (sm) { C = [250, 300]; R = 192; GR = 50; LATK = 1.45; D = R * 4.4; sv.setAttribute('viewBox', '0 0 500 600'); }
    else { C = [450, 330]; R = 300; GR = 72; LATK = 1.05; D = R * 3.6; sv.setAttribute('viewBox', '0 0 900 690'); }
    if (cb) { cb.setAttribute('r', GR); gShine.setAttribute('r', GR); var hl = core.querySelector('.halo'); if (hl) hl.setAttribute('r', GR + 24); }
    if (face) face.setAttribute('transform', 'scale(' + (GR / 64).toFixed(3) + ')');
    if (core) core.setAttribute('transform', 'translate(' + C[0] + ' ' + C[1] + ')');
  }

  function setLabels() {
    K.forEach(function (k) {
      var g = arms[k].nd; if (!g) return;
      var t1 = g.querySelector('tspan.l1'), t2 = g.querySelector('tspan.l2'), t = g.querySelector('text');
      var label = sm ? SHORT[k] : FULL[k];
      if (t1) {
        if (label === 'Siz (onay)') { t1.textContent = 'Siz'; if (t2) t2.textContent = '(onay)'; }
        else {
          var parts = label.split(' ');
          if (parts.length >= 2) { t1.textContent = parts[0]; if (t2) t2.textContent = parts.slice(1).join(' '); }
          else { t1.textContent = label; if (t2) t2.textContent = ''; }
        }
      } else if (t) t.textContent = label;
      if (arms[k].a) arms[k].a.setAttribute('aria-label', FULL[k] === 'Siz (onay)' ? 'Onay sizde' : FULL[k] + ' sayfasına git');
    });
  }
  function placeLabel(g, top) {
    if (g._top === top) return; g._top = top;
    var t = g.querySelector('text'); if (!t) return;
    var t1 = g.querySelector('tspan.l1'), t2 = g.querySelector('tspan.l2');
    var two = t2 && t2.textContent;
    var y1 = top ? (two ? -52 : -38) : 46, y2 = top ? -38 : 60;
    if (t1) { t1.setAttribute('y', y1); t1.setAttribute('x', 0); if (t2) { t2.setAttribute('x', 0); t2.setAttribute('y', two ? y2 : y1); } }
    else t.setAttribute('y', top ? -38 : 50);
  }

  /* ---------- çizim ---------- */
  var geo = {}, lastOrder = '', hoverK = null;
  function ellipsePath(r, lat, steps, front) {
    // front: 1 => yalnız ön yarı, -1 => yalnız arka yarı, 0 => tamamı
    var d = '', pen = false;
    for (var i = 0; i <= steps; i++) {
      var s = i / steps * 2 * Math.PI;
      var q = rot(sph(r, lat, s)), p = proj(q);
      var vis = front === 0 || (front > 0 ? q[2] >= 0 : q[2] < 0);
      if (vis) { d += (pen ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); pen = true; } else pen = false;
    }
    return d;
  }
  function drawGlobe() {
    // Meridyenler ve paralellerin ön / arka yarıları (küre kendi içinde döner)
    var fr = '', bk = '', r = GR - 1;
    function seg(pts) {
      var f = '', b = '', pf = false, pb = false;
      for (var i = 0; i < pts.length; i++) {
        var q = pts[i], xy = q[0].toFixed(1) + ' ' + q[1].toFixed(1);
        if (q[2] >= 0) { f += (pf ? 'L' : 'M') + xy; pf = true; pb = false; }
        else { b += (pb ? 'L' : 'M') + xy; pb = true; pf = false; }
      }
      fr += f; bk += b;
    }
    for (var m = 0; m < 6; m++) {
      var lon = m * Math.PI / 6 + theta * 1.6, pts = [];
      for (var j = 0; j <= 24; j++) { var lat = -Math.PI / 2 + j * Math.PI / 24; pts.push(tiltOnly(sph(r, lat, lon))); }
      seg(pts);
    }
    [-0.9, -0.45, 0, 0.45, 0.9].forEach(function (lat) {
      var pts = [];
      for (var j = 0; j <= 36; j++) pts.push(tiltOnly(sph(r, lat, j * Math.PI / 18 + theta * 1.6)));
      seg(pts);
    });
    gFront.setAttribute('d', fr); gBack.setAttribute('d', bk);
  }


  var bobCX = 0, bobCY = 0;
  function applyGlobeBob(tt) {
    bobCX = C[0]; bobCY = C[1];
    if (!core) return;
    if (RM) {
      core.setAttribute('transform', 'translate(' + C[0] + ' ' + C[1] + ')');
      return;
    }
    var bobY = Math.sin(tt * 1.05) * 5;
    var bobX = Math.sin(tt * 0.7) * 2.2;
    var sway = Math.sin(tt * 0.85) * 3.2;
    bobCX = C[0] + bobX;
    bobCY = C[1] + bobY;
    core.setAttribute('transform', 'translate(' + bobCX.toFixed(2) + ' ' + bobCY.toFixed(2) + ') rotate(' + sway.toFixed(2) + ')');
  }

  function drawSaturnArms(tt) {
    /* 2026-11-21 v2 — ahtapot kolları
       • Her uygulamaya bir kol: öndekiler kürenin alt yarısından, arkadakiler üst-yanlarından çıkar.
       • Çıkış açıları uygulamaların soldan sağa sırasını izler; kollar kesişmez.
       • Kollar kalın ve sivrilen, dışa doğru kıvrılan, boyunca dalga ilerleyen organik eğriler.
       • Arkada yörünge çizgisi, önde yumuşak zemin gölgesi: sahne boş görünmez. */
    var wrapEl = sv.closest('.ag-saturn');
    var list = wrapEl && typeof wrapEl._saturnArms === 'function' ? wrapEl._saturnArms() : null;
    var sg = wrapEl && typeof wrapEl._saturnGeo === 'function' ? wrapEl._saturnGeo() : null;
    var byK = {};
    if (list) list.forEach(function (p) { byK[p.k] = p; });
    docs.forEach(function (d) { d.setAttribute('opacity', '0'); d.style.display = 'none'; });
    if (ring) ring.setAttribute('d', '');
    if (ring2) ring2.setAttribute('d', '');
    var wave = RM ? 0 : 1;

    /* sahne: yörünge + zemin (bir kez oluştur) */
    if (!drawSaturnArms.sahne) {
      var defs0 = sv.querySelector('defs');
      if (defs0 && !sv.querySelector('#sat-zemin-g')) {
        defs0.insertAdjacentHTML('beforeend',
          '<radialGradient id="sat-zemin-g"><stop offset="0" stop-color="#7c2d12" stop-opacity=".22"/><stop offset=".55" stop-color="#7c2d12" stop-opacity=".08"/><stop offset="1" stop-color="#7c2d12" stop-opacity="0"/></radialGradient>' +
          '<radialGradient id="sat-isik-g"><stop offset="0" stop-color="#5eead4" stop-opacity=".30"/><stop offset=".5" stop-color="#5eead4" stop-opacity=".10"/><stop offset="1" stop-color="#5eead4" stop-opacity="0"/></radialGradient>' +
          '<linearGradient id="sat-kol-arka" x1="0" x2="1"><stop offset="0" stop-color="#115e59"/><stop offset="1" stop-color="#2dd4bf"/></linearGradient>');
      }
      var zg = document.createElementNS(NS, 'g'); zg.setAttribute('class', 'sat-sahne'); zg.setAttribute('aria-hidden', 'true');
      zg.innerHTML = '<ellipse class="sat-isik"/><ellipse class="sat-zemin"/><path class="sat-yorunge arka"/><path class="sat-yorunge on"/>';
      sv.insertBefore(zg, stage);
      drawSaturnArms.sahne = zg;
    }
    var span = 0;
    if (list) list.forEach(function (p) { span = Math.max(span, Math.abs(p.x - bobCX)); });
    span = span || 300;
    if (sg) {
      var zg2 = drawSaturnArms.sahne;
      var isik = zg2.children[0], zemin = zg2.children[1], yA = zg2.children[2], yO = zg2.children[3];
      isik.setAttribute('cx', bobCX); isik.setAttribute('cy', bobCY); isik.setAttribute('rx', GR * 3.1); isik.setAttribute('ry', GR * 2.4); isik.setAttribute('fill', 'url(#sat-isik-g)');
      zemin.setAttribute('cx', sg.cx); zemin.setAttribute('cy', sg.cy + sg.ry + GR * 0.9); zemin.setAttribute('rx', sg.rx * 1.05); zemin.setAttribute('ry', Math.max(26, sg.ry * 0.42)); zemin.setAttribute('fill', 'url(#sat-zemin-g)');
      var dA = '', dO = '', N = 90, penA = false, penO = false;
      for (var q = 0; q <= N; q++) {
        var th = -Math.PI + q / N * 2 * Math.PI;
        var x = sg.cx + sg.rx * Math.sin(th), y = sg.cy + sg.ry * Math.cos(th), xy = x.toFixed(1) + ' ' + y.toFixed(1);
        if (Math.cos(th) < 0) { dA += (penA ? 'L' : 'M') + xy; penA = true; penO = false; }
        else { dO += (penO ? 'L' : 'M') + xy; penO = true; penA = false; }
      }
      yA.setAttribute('d', dA); yO.setAttribute('d', dO);
      yO.style.strokeDashoffset = (-tt * 18).toFixed(1);
      yA.style.strokeDashoffset = (tt * 18).toFixed(1);
    }

    K.forEach(function (k, idx) {
      var A = arms[k], p = byK[k];
      if (A.a) { A.a.style.display = 'none'; A.a.setAttribute('aria-hidden', 'true'); }
      if (A.nd) A.nd.style.display = 'none';
      var vis = p ? Math.max(0, Math.min(1, (p.fade - 0.02) / 0.5)) : 0;
      if (!p || vis <= 0.01) {
        if (A.tn) A.tn.setAttribute('d', '');
        if (A.g) A.g.style.opacity = '0';
        A.z = -1000;
        if (A.cups) { for (var ci = 0; ci < A.cups.length; ci++) if (A.cups[ci]) A.cups[ci].setAttribute('r', '0'); }
        return;
      }
      var front = p.depth >= -0.05;
      var rel = Math.max(-1, Math.min(1, (p.x - bobCX) / span));
      /* arkada yalnızca sağ ve sol yandaki uygulamalara kol: tam arkadakiler kürenin ardında kalır */
      if (!front) {
        var yan = Math.max(0, Math.min(1, (Math.abs(rel) - 0.42) / 0.3));
        vis *= yan;
        if (vis <= 0.01) {
          if (A.tn) A.tn.setAttribute('d', '');
          if (A.g) A.g.style.opacity = '0';
          A.z = -1000;
          if (A.cups) { for (var cj = 0; cj < A.cups.length; cj++) if (A.cups[cj]) A.cups[cj].setAttribute('r', '0'); }
          return;
        }
      }
      var side = rel >= 0 ? 1 : -1;
      /* çıkış noktası: önde alt yarı (±75°), arkada üst-yan */
      var attachAng = front ? (Math.PI / 2 - rel * 1.3) : (-Math.PI / 2 + rel * 1.5);
      var ox = Math.cos(attachAng), oy = Math.sin(attachAng);
      var s0 = [bobCX + ox * (GR - 4), bobCY + oy * (GR - 4)];
      var pad = p.pad != null ? p.pad : 16;
      /* bağlantı: ortadakilerde rozetin tepesi, yandakilerde küreye bakan yan yüzü */
      var mx0 = front ? 0 : 1;
      var e = [p.x - side * pad * 0.74 * mx0, p.y - pad * (0.9 - 0.75 * mx0)];
      var dx = e[0] - s0[0], dy = e[1] - s0[1];
      var dist = Math.hypot(dx, dy) || 1;
      var k1 = dist * 0.40, k2 = dist * 0.40;
      var c1 = [s0[0] + ox * k1, s0[1] + oy * k1];
      var ax = -side * mx0, ay = -(1 - mx0), al = Math.hypot(ax, ay) || 1;
      var c2 = [e[0] + ax / al * k2, e[1] + ay / al * k2];
      /* temel eğri */
      var base = [], j, t, u;
      for (j = 0; j <= NSEG; j++) {
        t = j / NSEG; u = 1 - t;
        base.push([
          u * u * u * s0[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * e[0],
          u * u * u * s0[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * e[1]
        ]);
      }
      /* organik sapma: dışa doğru kıvrım + kol boyunca ilerleyen dalga (uçlarda sıfır) */
      var curl = (front ? 0.11 : 0.08) * dist * side * (front ? 1 : -1);
      var wAmp = Math.min(16, dist * 0.06) * wave;
      var ph = rel * 1.6 + (front ? 0 : 2.1);
      var mid = [];
      for (j = 0; j <= NSEG; j++) {
        t = j / NSEG;
        var a0 = base[Math.max(0, j - 1)], a1 = base[Math.min(NSEG, j + 1)];
        var tx = a1[0] - a0[0], ty = a1[1] - a0[1], tl = Math.hypot(tx, ty) || 1;
        var nx = -ty / tl, ny = tx / tl;
        var env = Math.sin(Math.PI * t);
        var off = curl * env + wAmp * Math.sin(t * Math.PI * 2.4 - tt * 1.7 + ph) * env;
        mid.push([base[j][0] + nx * off, base[j][1] + ny * off]);
      }
      var lft = [], rgt = [];
      var depthScale = front ? (0.8 + 0.2 * p.depth) : 0.5;
      for (j = 0; j <= NSEG; j++) {
        t = j / NSEG;
        var b0 = mid[Math.max(0, j - 1)], b1 = mid[Math.min(NSEG, j + 1)];
        var ux = b1[0] - b0[0], uy = b1[1] - b0[1], ul = Math.hypot(ux, uy) || 1;
        var mx = -uy / ul, my = ux / ul;
        /* kök kalın, uca doğru sivrilir; uçta küçük bir topuz */
        var wd = (24 * Math.pow(1 - t, 1.15) + 3.2 + (t > 0.94 ? (t - 0.94) * 30 : 0)) * 0.5 * depthScale;
        lft.push((mid[j][0] + mx * wd).toFixed(1) + ' ' + (mid[j][1] + my * wd).toFixed(1));
        rgt.unshift((mid[j][0] - mx * wd).toFixed(1) + ' ' + (mid[j][1] - my * wd).toFixed(1));
        if (j % 3 === 2 && j < 20) {
          var c = A.cups[(j - 2) / 3];
          if (c) {
            var sideSign = -side; /* vantuzlar kolun iç tarafında */
            c.setAttribute('cx', (mid[j][0] + mx * wd * 0.42 * sideSign).toFixed(1));
            c.setAttribute('cy', (mid[j][1] + my * wd * 0.42 * sideSign).toFixed(1));
            c.setAttribute('r', ((2.6 * Math.pow(1 - t, 0.9) + 0.9) * depthScale).toFixed(1));
            c.setAttribute('opacity', front ? '0.85' : '0.45');
          }
        }
      }
      if (A.tn) {
        A.tn.setAttribute('d', 'M' + lft.join(' L') + ' L' + rgt.join(' L') + 'Z');
        A.tn.classList.toggle('arka-kol', !front);
      }
      A.g.style.opacity = (vis * (front ? (0.72 + 0.28 * p.depth) : 0.42)).toFixed(3);
      A.z = p.depth - 3;
      geo[k] = mid.map(function (q) { return [q[0], q[1], 1]; });
    });
    var ord = K.slice().sort(function (a, b) { return arms[a].z - arms[b].z; });
    var key = ord.join(',');
    if (key !== lastOrder) {
      lastOrder = key;
      ord.forEach(function (k) { stage.appendChild(arms[k].g); });
      if (core) stage.appendChild(core);
    }
  }

  function frame(now) {
    setRot();
    var tt = now / 1000;
    if (SATURN) {
      applyGlobeBob(tt);
      drawGlobe();
      drawSaturnArms(tt);
      steps(now);
      return;
    }
    var ord = [];
    K.forEach(function (k, i) {
      var A = arms[k], b = base[i];
      var bob = 1 + Math.sin(tt * 0.9 + b.ph) * 0.025;
      var v = sph(R * bob, b.lat * LATK, b.lon);            // düğüm (model uzayı)
      var u = norm(v);
      var w = norm(cross(u, [0, 1, 0])), q = cross(u, w);
      var s0 = [u[0] * (GR + 2), u[1] * (GR + 2), u[2] * (GR + 2)];
      var e = [v[0] - u[0] * 28, v[1] - u[1] * 28, v[2] - u[2] * 28];
      var a1 = Math.sin(tt * 1.5 + b.ph) * 42, b1 = Math.cos(tt * 1.1 + b.ph) * 30;
      var a2 = Math.sin(tt * 2.0 + b.ph + 2) * 36, b2 = Math.cos(tt * 1.7 + b.ph + 1) * 26;
      var c1 = [], c2 = [];
      for (var x = 0; x < 3; x++) {
        c1[x] = s0[x] + (e[x] - s0[x]) * 0.35 + w[x] * a1 + q[x] * b1;
        c2[x] = s0[x] + (e[x] - s0[x]) * 0.68 + w[x] * a2 + q[x] * b2;
      }
      var pts = [], lft = [], rgt = [];
      for (var j = 0; j <= NSEG; j++) {
        var t = j / NSEG;
        var m = [cub(s0[0], c1[0], c2[0], e[0], t), cub(s0[1], c1[1], c2[1], e[1], t), cub(s0[2], c1[2], c2[2], e[2], t)];
        pts.push(proj(rot(m)));
      }
      for (j = 0; j <= NSEG; j++) {
        var p0 = pts[Math.max(0, j - 1)], p1 = pts[Math.min(NSEG, j + 1)], tx = p1[0] - p0[0], ty = p1[1] - p0[1], tl = Math.hypot(tx, ty) || 1, nx = -ty / tl, ny = tx / tl;
        var wd = (12 * (1 - j / NSEG) + 3) / 2 * pts[j][2];
        lft.push((pts[j][0] + nx * wd).toFixed(1) + ' ' + (pts[j][1] + ny * wd).toFixed(1));
        rgt.unshift((pts[j][0] - nx * wd).toFixed(1) + ' ' + (pts[j][1] - ny * wd).toFixed(1));
        if (j % 3 == 2 && j < 20) {
          var c = A.cups[(j - 2) / 3];
          if (c) { c.setAttribute('cx', (pts[j][0] + nx * wd * .25).toFixed(1)); c.setAttribute('cy', (pts[j][1] + ny * wd * .25).toFixed(1)); c.setAttribute('r', ((2.6 * (1 - j / NSEG) + 1.1) * pts[j][2]).toFixed(1)); }
        }
      }
      if (A.tn) A.tn.setAttribute('d', 'M' + lft.join(' L') + ' L' + rgt.join(' L') + 'Z');
      geo[k] = pts;
      // düğüm
      var nq = rot(v), np = proj(nq);
      var depth = (nq[2] / R + 1) / 2;                 // 0 arka … 1 ön
      var sc = np[2] * (sm ? 0.72 + 0.34 * depth : 0.95) * (hoverK === k ? 1.18 : 1);
      if (SATURN) sc *= sm ? 0.55 : 0.5; /* uçtaki daireler küçük kalsın */
      if (A.nd) {
        A.nd.setAttribute('transform', 'translate(' + np[0].toFixed(1) + ' ' + np[1].toFixed(1) + ') scale(' + sc.toFixed(3) + ')');
        placeLabel(A.nd, np[1] < C[1] - R * 0.18);
        if (SATURN && A.a) {
          var dist = Math.hypot(np[0] - C[0], np[1] - C[1]);
          A.a.classList.toggle('sat-uste', dist < GR + 22 + 26 * sc);
        }
      }
      A.g.style.opacity = ((SATURN ? 0.32 : 0.38) + (SATURN ? 0.54 : 0.62) * Math.pow(depth, 0.8)).toFixed(3);
      A.g.classList.toggle('far', depth < (sm ? 0.5 : 0.3));
      A.z = nq[2];
      ord.push(k);
    });
    // derinliğe göre sırala: arkadakiler önce, çekirdek z=0'da
    ord.sort(function (a, b) { return arms[a].z - arms[b].z; });
    var key = ord.map(function (k) { return arms[k].z < 0 ? k + '-' : k + '+'; }).join(',');
    if (key !== lastOrder) {
      lastOrder = key;
      var coreDone = false;
      ord.forEach(function (k) {
        if (!coreDone && arms[k].z >= 0 && core) { stage.appendChild(core); coreDone = true; }
        stage.appendChild(arms[k].g);
      });
      if (!coreDone && core) stage.appendChild(core);
    }
    // yörünge halkaları
    ring.setAttribute('d', ellipsePath(R * 0.99, 0, 72, 0));
    ring2.setAttribute('d', ellipsePath(R * 0.62, 0.0, 60, 0));
    ring.style.strokeDashoffset = (-theta * 120).toFixed(1);
    drawGlobe();
    if (SATURN && core) {
      if (RM) {
        core.setAttribute('transform', 'translate(' + C[0] + ' ' + C[1] + ')');
      } else {
        var bobY = Math.sin(tt * 1.05) * 5;
        var bobX = Math.sin(tt * 0.7) * 2.2;
        var sway = Math.sin(tt * 0.85) * 3.2;
        core.setAttribute('transform', 'translate(' + (C[0] + bobX).toFixed(2) + ' ' + (C[1] + bobY).toFixed(2) + ') rotate(' + sway.toFixed(2) + ')');
      }
    }
    steps(now);
  }

  /* ---------- adımlar ve evrak akışı ---------- */
  function steps(now) {
    var s = Math.floor(now / STEP) % 4, f = (now % STEP) / STEP;
    if (s !== steps.s) {
      steps.s = s;
      li.forEach(function (e, j) { e.classList.toggle('on', j == s); });
      if (cn && li[s]) cn.textContent = '0' + (s + 1);
      if (ct && li[s]) ct.textContent = li[s].querySelector('b').textContent;
      sv.classList.toggle('think', s == 1); sv.classList.toggle('ok', s == 3);
      K.forEach(function (k) {
        var on = (s == 0 || s == 2) ? IN.indexOf(k) > -1 : (s == 3 ? k == 'siz' : false);
        if (arms[k].tn) arms[k].tn.classList.toggle('on', on);
        if (arms[k].nd) arms[k].nd.classList.toggle('on', on);
      });
    }
    docs.forEach(function (d, i) {
      var k, dir, ok = 1;
      if (s == 0 || s == 2) { k = IN[(i * 3 + s) % IN.length]; dir = s == 0 ? 1 : 0; if (i > 5) ok = 0; }
      else if (s == 3) { k = 'siz'; dir = 0; if (i > 1) ok = 0; } else ok = 0;
      var lag = (i % 6) * .07, t = Math.min(1, Math.max(0, (f - lag) / .72));
      if (!ok || t <= 0 || t >= 1 || !geo[k]) { d.setAttribute('opacity', '0'); return; }
      var pts = geo[k], qv = dir ? 1 - t : t, idx = qv * NSEG, a = Math.floor(idx), b = Math.min(NSEG, a + 1), r = idx - a;
      var x = pts[a][0] + (pts[b][0] - pts[a][0]) * r, y = pts[a][1] + (pts[b][1] - pts[a][1]) * r, zf = pts[a][2];
      var fade = Math.min(1, Math.min(t, 1 - t) * 8) * (arms[k].z < -R * 0.3 ? 0.55 : 1);
      d.setAttribute('opacity', fade.toFixed(2));
      d.setAttribute('transform', 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') scale(' + ((0.75 + 0.35 * Math.sin(t * Math.PI)) * zf).toFixed(2) + ')');
      d.classList.toggle('reply', s >= 2);
    });
  }

  /* ---------- etkileşim: sürükle-döndür, üzerine gelince yavaşla ---------- */
  var drag = null, moved = false, lastT = performance.now(), clock = 0;
  sv.style.touchAction = SATURN ? 'none' : 'pan-y';
  if (SATURN) sv.style.cursor = 'grab';
  sv.addEventListener('pointerdown', function (e) {
    if (SATURN) return;
    if (e.button && e.button !== 0) return;
    drag = { x: e.clientX, y: e.clientY, t: performance.now(), vx: 0, sx: e.clientX, sy: e.clientY, id: e.pointerId };
    moved = false;
  });
  addEventListener('pointermove', function (e) {
    if (!drag || e.pointerId !== drag.id) return;
    var dx = e.clientX - drag.x, dy = e.clientY - drag.y, n = performance.now(), dt = Math.max(1, n - drag.t);
    if (!moved && Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 6) {
      moved = true; sv.classList.add('grab');
      try { sv.setPointerCapture(e.pointerId); } catch (er) {}
    }
    if (!moved) return;
    var k = 2.6 / (sv.getBoundingClientRect().width || 600) * Math.PI;
    theta += dx * k;
    if (e.pointerType === 'mouse') alpha = Math.max(0.08, Math.min(0.8, alpha + dy * k * 0.5));
    drag.vx = drag.vx * 0.6 + (dx * k / dt * 1000) * 0.4;
    drag.x = e.clientX; drag.y = e.clientY; drag.t = n;
    vel = 0;
    if (!run || RM) frame(clock);
  });
  function endDrag(e) {
    if (!drag || (e && e.pointerId !== drag.id)) return;
    if (moved) vel = Math.max(-6, Math.min(6, drag.vx));
    drag = null; sv.classList.remove('grab');
  }
  addEventListener('pointerup', endDrag); addEventListener('pointercancel', endDrag);
  // Sürükleme bir tıklama sayılmasın
  sv.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
  sv.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') targetV = BASEV * 0.2; });
  sv.addEventListener('pointerleave', function () { targetV = BASEV; hoverK = null; });
  K.forEach(function (k) {
    var a = arms[k].a; if (!a) return;
    a.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { hoverK = k; targetV = 0; } });
    a.addEventListener('pointerleave', function () { if (hoverK === k) hoverK = null; targetV = BASEV * 0.2; });
    a.addEventListener('focus', function () { hoverK = k; targetV = 0; });
    a.addEventListener('blur', function () { hoverK = null; targetV = BASEV; });
  });

  /* ---------- döngü ---------- */
  function fit() { layout(); setLabels(); K.forEach(function (k) { if (arms[k].nd) arms[k].nd._top = null; }); lastOrder = ''; }
  fit();
  addEventListener('resize', function () { fit(); frame(clock); });

  var run = false, raf = 0;
  function loop(n) {
    var dt = Math.min(0.05, (n - lastT) / 1000); lastT = n;
    if (!drag) {
      vel += ((targetV) - vel) * Math.min(1, dt * 1.6);
      theta += vel * dt;
      alpha += (ALPHA0 - alpha) * Math.min(1, dt * 0.8);
    }
    clock += dt * 1000;
    frame(clock);
    if (run) raf = requestAnimationFrame(loop);
  }
  if (RM) { frame(0); li.forEach(function (e) { e.classList.add('on'); }); return; }
  function start() { if (!run) { run = true; lastT = performance.now(); raf = requestAnimationFrame(loop); } }
  function stop() { run = false; cancelAnimationFrame(raf); }
  var vis = true;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (e) { vis = e[0].isIntersecting; if (vis && !document.hidden) start(); else stop(); }, { threshold: 0.05 }).observe(sv);
  } else start();
  document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else if (vis) start(); });
  frame(0);
})();
