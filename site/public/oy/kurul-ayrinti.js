/* Kurul ve zümre: ayrıntılı gündem, okul türü, imza listesi, isteğe bağlı Gemini. Anahtar yalnız cihazda. */
(function () {
  'use strict';
  if (!window.EA_GUNDEM || !window.OY || !OY.T) return;
  var ANAHTAR = 'ea_gemini_anahtar';
  var KADEME = [['ilkokul', 'İlkokul', 'i'], ['ortaokul', 'Ortaokul', 'o'], ['lise', 'Lise', 'l'], ['mtal', 'MTAL', 'm']];
  var BRANS = [['', 'Branş seçin'], ['turkce', 'Türkçe / TDE'], ['mat', 'Matematik'], ['fen', 'Fen / Fizik / Kimya / Biyoloji'], ['sosyal', 'Sosyal / Tarih / Coğrafya'], ['dil', 'Yabancı dil'], ['beden', 'Beden eğitimi'], ['muzik', 'Müzik'], ['gorsel', 'Görsel sanatlar'], ['dkab', 'DKAB'], ['meslek', 'Meslek alanı']];
  var BRANS_AD = { turkce: 'Türkçe', mat: 'Matematik', fen: 'Fen bilimleri', sosyal: 'Sosyal bilgiler', dil: 'Yabancı dil', beden: 'Beden eğitimi', muzik: 'Müzik', gorsel: 'Görsel sanatlar', dkab: 'Din kültürü ve ahlak bilgisi', meslek: 'Meslek alanı' };
  function unvanMi(s) {
    var x = String(s || '').trim().toLocaleLowerCase('tr-TR');
    return /müdür/.test(x);
  }
  function bransSec(p, f, ka) {
    var a = String((f && f.zumre_adi) || '').trim();
    if (a && !unvanMi(a)) return a;
    if (ka && ka.brans && BRANS_AD[ka.brans]) return BRANS_AD[ka.brans];
    var b = String((p && p.brans) || '').trim();
    if (b && !unvanMi(b)) return b;
    return '';
  }
  function zumreBaslik(p, f, ka, yil) {
    var br = bransSec(p, f, ka);
    var okul = String((p && p.okul) || '').trim() || '……';
    var tur = String((ka && ka.tur) || (f && f.tur) || 'Sene başı').replace(/\s*\([^)]*\)\s*$/, '');
    return okul.toLocaleUpperCase('tr-TR') + ' ' + yil + ' EĞİTİM-ÖĞRETİM YILI ' + (br ? br.toLocaleUpperCase('tr-TR') : '……') + ' ZÜMRE ÖĞRETMENLERİ ' + tur.toLocaleUpperCase('tr-TR') + ' TOPLANTI TUTANAĞI';
  }

  function kopya(m) {
    return { b: m.b, g: m.g || '', k: m.k || '', a: (m.a || []).map(function (x) { return { b: x.b, g: x.g || '', k: x.k || '' }; }), d: m.d || '', r: m.r || '' };
  }
  function uygun(m, ka) {
    var kad = (ka && ka.kademe) || 'ortaokul';
    var harf = { ilkokul: 'i', ortaokul: 'o', lise: 'l', mtal: 'm' }[kad] || 'o';
    if (m.d && m.d.indexOf(harf) < 0) return false;
    if (m.r && ka && ka.brans && m.r !== ka.brans) return false;
    if (m.r && (!ka || !ka.brans)) return false;
    return true;
  }
  function turBul(f, grup) {
    var harita = EA_GUNDEM[grup] || {};
    var ad = f.tur || f.donem || '';
    if (harita[ad]) return ad;
    var es = { '1. Dönem': 'Sene başı', '2. Dönem': '2. dönem başı' };
    if (es[ad] && harita[es[ad]]) return es[ad];
    return Object.keys(harita)[0] || '';
  }
  function liste(grup, tur) {
    var harita = EA_GUNDEM[grup] || {};
    var taban = (harita[tur] || []).map(kopya);
    if (grup === 'zumre' && EA_GUNDEM.brans) {
      Object.keys(EA_GUNDEM.brans).forEach(function (k) {
        taban = taban.concat(EA_GUNDEM.brans[k].map(kopya));
      });
    }
    return taban;
  }
  function okuKa(f) {
    if (!f || !f.ka) return null;
    try { var o = JSON.parse(f.ka); if (o && o.maddeler) return o; } catch (e) {}
    return null;
  }
  function say(maddeler) {
    var n = 0;
    (maddeler || []).forEach(function (m) { n += 1 + ((m.a && m.a.length) || 0); });
    return n;
  }
  function imza(out, p, f, ka, zumre) {
    var og = ((ka && ka.ogretmenler) || []).map(function (s) { return String(s || '').trim(); }).filter(Boolean);
    if (!og.length) og = String(f.katilimcilar || '').split(/\n/).map(function (s) { return s.trim(); }).filter(Boolean);
    out.push({ t: 'h2', x: 'ONAY VE İMZA' });
    out.push({ t: 'onay', x: 'UYGUNDUR', tarih: OY.trDate(f.tarih), ad: p.mudur || '……………………', unvan: 'Okul Müdürü' });
    var baskan = (f.zumre_baskani || p.zumre_baskani || p.mudur || '……………………');
    out.push({ t: 'sign', names: [baskan + '\n' + (zumre ? 'Zümre Başkanı' : 'Kurul Başkanı')] });
    out.push({ t: 'h2', x: 'KATILAN ÖĞRETMENLER' });
    var hucre = og.length ? og : ['……………………'];
    var cols = hucre.length >= 6 ? 3 : 2;
    var cells = hucre.map(function (n) { return n + '\n........................'; });
    while (cells.length % cols) cells.push('');
    var rows = [];
    for (var i = 0; i < cells.length; i += cols) rows.push(cells.slice(i, i + cols));
    out.push({ t: 'table', small: true, head: cols === 3 ? ['Öğretmen', 'Öğretmen', 'Öğretmen'] : ['Öğretmen', 'Öğretmen'], rows: rows });
  }
  function belge(p, f, grup, baslik, zumre) {
    var ka = okuKa(f) || { kademe: 'ortaokul', brans: '', maddeler: null, ogretmenler: [] };
    var tur = ka.tur || turBul(f, grup);
    var maddeler = (ka.maddeler && ka.maddeler.length ? ka.maddeler : liste(grup, tur)).filter(function (m) { return uygun(m, ka); });
    var out = (OY.resmiUst ? OY.resmiUst(p) : []).concat([
      { t: 'h1', x: baslik },
      { t: 'kv', rows: [['Toplantı', tur], ['Tarih', OY.trDate(f.tarih)], ['Saat', f.saat || '……'], ['Yer', f.yer || '……'], ['Okul türü', ka.kademe || '']] }
    ]);
    var ol = [], karar = [];
    out.push({ t: 'h2', x: 'GÜNDEM' });
    maddeler.forEach(function (m, i) {
      var n = i + 1;
      ol.push(n + '. ' + m.b);
      (m.a || []).forEach(function (a, j) { ol.push(n + '.' + (j + 1) + '. ' + a.b); });
    });
    out.push({ t: 'ul', items: ol });
    out.push({ t: 'h2', x: 'GÜNDEM MADDELERİNİN GÖRÜŞÜLMESİ' });
    maddeler.forEach(function (m, i) {
      var n = i + 1;
      if ((m.g || '').trim()) out.push({ t: 'p', x: n + '. ' + m.b + ': ' + m.g.trim() });
      if ((m.k || '').trim()) karar.push(m.k.trim());
      (m.a || []).forEach(function (a, j) {
        if ((a.g || '').trim()) out.push({ t: 'p', x: n + '.' + (j + 1) + '. ' + a.b + ': ' + a.g.trim() });
        else if ((a.k || '').trim()) out.push({ t: 'p', x: n + '.' + (j + 1) + '. ' + a.b + ' görüşüldü.' });
        if ((a.k || '').trim()) karar.push(a.k.trim());
      });
    });
    out.push({ t: 'h2', x: 'ALINAN KARARLAR' });
    out.push({ t: 'ul', items: karar.length ? karar : ['…………………………………………'] });
    imza(out, p, f, ka, zumre);
    return out;
  }
  function kurulMu(t) {
    return /zümre|şube öğretmen|öğretmenler kurulu|komisyon|sosyal etkinlikler kurulu/i.test((t.kat || '') + ' ' + (t.baslik || ''));
  }
  OY.T.forEach(function (t) {
    if (t._ka) return;
    if (t.id === 'ok' || t.id === 'sok' || t.id === 'zumre') {
      t._ka = 1;
      t.build = function (p, f) {
        var yil = f.egitim_yili || (OY.egitimYili ? OY.egitimYili() : '');
        if (t.id === 'ok') return belge(p, f, 'ok', yil + ' EĞİTİM-ÖĞRETİM YILI ÖĞRETMENLER KURULU TUTANAĞI', false);
        if (t.id === 'sok') return belge(p, f, 'sok', (f.sinif || p.sinif || '……') + ' ŞUBE ÖĞRETMENLER KURULU TUTANAĞI', false);
        var ka0 = okuKa(f) || {};
        return belge(p, f, 'zumre', zumreBaslik(p, f, ka0, yil), true);
      };
    } else if (kurulMu(t) && t.build) {
      t._ka = 1;
      var eski = t.build;
      t.build = function (p, f) {
        var out = eski(p, f);
        var ka = okuKa(f);
        if (ka && ka.ogretmenler && ka.ogretmenler.length) {
          imza(out, p, f, ka, /zümre/i.test(t.baslik || ''));
        }
        return out;
      };
    }
  });

  function secenek(sel, degerler) {
    if (!sel) return;
    degerler.forEach(function (ad) {
      var varMi = [].some.call(sel.options, function (o) { return o.value === ad; });
      if (!varMi) {
        var o = document.createElement('option');
        o.value = ad; o.textContent = ad;
        sel.appendChild(o);
      }
    });
  }
  function pii(metin) {
    var s = String(metin || '');
    if (/\b[1-9]\d{10}\b/.test(s)) return '11 haneli kimlik numarası gönderilmez.';
    if (/t\.?\s*c\.?\s*kimlik|okul\s*no|öğrenci\s*no/i.test(s)) return 'Öğrenci veya kimlik bilgisi gönderilmez.';
    return '';
  }
  function gemini(metin, bitti) {
    var key = '';
    try { key = localStorage.getItem(ANAHTAR) || ''; } catch (e) {}
    if (!key) { bitti(new Error('Anahtar yok. Profilim > Yapay zekâ bölümünden ücretsiz anahtarınızı kaydedin. Anahtar olmadan tutanak çalışır.')); return; }
    var uyari = pii(metin);
    if (uyari) { bitti(new Error(uyari)); return; }
    var modeller = ['gemini-2.5-flash', 'gemini-2.0-flash'];
    function dene(i) {
      fetch('https://generativelanguage.googleapis.com/v1beta/models/' + modeller[i] + ':generateContent?key=' + encodeURIComponent(key), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: metin }] }], generationConfig: { temperature: 0.4, maxOutputTokens: 700 } })
      }).then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error((j.error && j.error.message) || ('HTTP ' + r.status)); return j; }); })
        .then(function (j) {
          var t = j.candidates && j.candidates[0] && j.candidates[0].content && j.candidates[0].content.parts && j.candidates[0].content.parts[0].text;
          if (!t) throw new Error('Yanıt boş.');
          bitti(null, t);
        }).catch(function (e) {
          if (i + 1 < modeller.length) dene(i + 1);
          else bitti(e);
        });
    }
    dene(0);
  }
  function onerKutu(hedef, metin) {
    var kutu = document.createElement('div');
    kutu.className = 'ka-oner noprint';
    kutu.textContent = 'Öneri hazırlanıyor…';
    hedef.appendChild(kutu);
    gemini(metin, function (err, yazi) {
      kutu.textContent = '';
      if (err) { kutu.textContent = err.message || 'Öneri alınamadı.'; return; }
      var pre = document.createElement('p');
      pre.textContent = yazi;
      var ekle = document.createElement('button');
      ekle.type = 'button'; ekle.className = 'sec'; ekle.textContent = 'Ekle';
      var vaz = document.createElement('button');
      vaz.type = 'button'; vaz.className = 'sec'; vaz.textContent = 'Vazgeç';
      vaz.addEventListener('click', function () { kutu.remove(); });
      kutu.appendChild(pre); kutu.appendChild(ekle); kutu.appendChild(vaz);
      kutu._yazi = yazi;
      kutu._ekle = ekle;
    });
    return kutu;
  }

  var durum = null;
  var zaman = 0;
  function yaz(my) {
    if (!durum) return;
    var json = JSON.stringify(durum);
    if (my && window.curDoc) {
      curDoc.f.ka = json;
      if (typeof render === 'function') render();
      return;
    }
    var hid = document.querySelector('#dform [name=ka]');
    if (!hid) return;
    hid.value = json;
    hid.dispatchEvent(new Event('input', { bubbles: true }));
  }
  function planla(my) {
    clearTimeout(zaman);
    zaman = setTimeout(function () { yaz(my); }, 200);
  }
  function ogretmenSatir(ad, my) {
    var li = document.createElement('div');
    li.className = 'ka-og';
    var inp = document.createElement('input');
    inp.value = ad || '';
    inp.placeholder = 'Ad Soyad';
    inp.setAttribute('aria-label', 'Öğretmen');
    function idx() { return durum.ogretmenler.indexOf(inp.value) < 0 ? [].indexOf.call(li.parentNode.children, li) : [].indexOf.call(li.parentNode.children, li); }
    function yer() {
      var i = [].indexOf.call(li.parentNode.children, li);
      durum.ogretmenler[i] = inp.value.trim();
      planla(my);
    }
    inp.addEventListener('input', yer);
    function dugme(yazi, fn, et) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'sec'; b.textContent = yazi; b.setAttribute('aria-label', et);
      b.addEventListener('click', fn);
      return b;
    }
    li.appendChild(inp);
    li.appendChild(dugme('↑', function () {
      var i = [].indexOf.call(li.parentNode.children, li);
      if (!i) return;
      var t = durum.ogretmenler[i - 1]; durum.ogretmenler[i - 1] = durum.ogretmenler[i]; durum.ogretmenler[i] = t;
      cizOg(li.parentNode, my);
    }, 'Yukarı'));
    li.appendChild(dugme('↓', function () {
      var i = [].indexOf.call(li.parentNode.children, li);
      if (i >= durum.ogretmenler.length - 1) return;
      var t = durum.ogretmenler[i + 1]; durum.ogretmenler[i + 1] = durum.ogretmenler[i]; durum.ogretmenler[i] = t;
      cizOg(li.parentNode, my);
    }, 'Aşağı'));
    li.appendChild(dugme('−', function () {
      var i = [].indexOf.call(li.parentNode.children, li);
      durum.ogretmenler.splice(i, 1);
      cizOg(li.parentNode, my);
    }, 'Sil'));
    return li;
  }
  function cizOg(kutu, my) {
    kutu.innerHTML = '';
    if (!durum.ogretmenler.length) durum.ogretmenler.push('');
    durum.ogretmenler.forEach(function (ad) { kutu.appendChild(ogretmenSatir(ad, my)); });
    planla(my);
  }
  function maddeKutu(m, i, kok, my) {
    var d = document.createElement('details');
    d.className = 'ka-m';
    if (!uygun(m, durum)) d.hidden = true;
    var s = document.createElement('summary');
    s.textContent = (i + 1) + '. ' + (m.b || 'Yeni madde');
    d.appendChild(s);
    var bar = document.createElement('span');
    bar.className = 'ka-bar';
    function mini(yazi, fn, et) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'sec'; b.textContent = yazi; b.setAttribute('aria-label', et);
      b.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); fn(); });
      return b;
    }
    bar.appendChild(mini('↑', function () { if (!i) return; var t = durum.maddeler[i - 1]; durum.maddeler[i - 1] = durum.maddeler[i]; durum.maddeler[i] = t; cizMaddeler(kok, my); }, 'Yukarı'));
    bar.appendChild(mini('↓', function () { if (i >= durum.maddeler.length - 1) return; var t = durum.maddeler[i + 1]; durum.maddeler[i + 1] = durum.maddeler[i]; durum.maddeler[i] = t; cizMaddeler(kok, my); }, 'Aşağı'));
    bar.appendChild(mini('−', function () { durum.maddeler.splice(i, 1); cizMaddeler(kok, my); }, 'Maddeyi sil'));
    s.appendChild(bar);
    d.addEventListener('toggle', function () {
      if (!d.open || d.dataset.dolu) return;
      d.dataset.dolu = '1';
      var govde = document.createElement('div');
      govde.className = 'ka-govde';
      function alan(etiket, deger, cok, yaz) {
        var lab = document.createElement('label');
        lab.textContent = etiket;
        var el = document.createElement(cok ? 'textarea' : 'input');
        el.value = deger || '';
        el.addEventListener('input', function () { yaz(el.value); s.firstChild.nodeValue = (i + 1) + '. ' + (m.b || 'Yeni madde'); planla(my); });
        lab.appendChild(el);
        govde.appendChild(lab);
        return el;
      }
      alan('Madde', m.b, false, function (v) { m.b = v; });
      alan('Görüşme', m.g, true, function (v) { m.g = v; });
      alan('Karar', m.k, true, function (v) { m.k = v; });
      var alt = document.createElement('div');
      function cizAlt() {
        alt.innerHTML = '';
        (m.a || []).forEach(function (a, j) {
          var r = document.createElement('div');
          r.className = 'ka-alt';
          var ib = document.createElement('input');
          ib.value = a.b || ''; ib.placeholder = 'Alt madde';
          ib.addEventListener('input', function () { a.b = ib.value; planla(my); });
          var ik = document.createElement('textarea');
          ik.value = a.k || ''; ik.placeholder = 'Bu alt maddeye özel karar';
          ik.addEventListener('input', function () { a.k = ik.value; planla(my); });
          var sil = document.createElement('button');
          sil.type = 'button'; sil.className = 'sec'; sil.textContent = '−'; sil.setAttribute('aria-label', 'Alt maddeyi sil');
          sil.addEventListener('click', function () { m.a.splice(j, 1); cizAlt(); planla(my); });
          r.appendChild(ib); r.appendChild(ik); r.appendChild(sil);
          alt.appendChild(r);
        });
      }
      cizAlt();
      var ek = document.createElement('button');
      ek.type = 'button'; ek.className = 'sec'; ek.textContent = '+ Alt madde';
      ek.addEventListener('click', function () { m.a = m.a || []; m.a.push({ b: '', g: '', k: '' }); cizAlt(); });
      var yz = document.createElement('button');
      yz.type = 'button'; yz.className = 'sec'; yz.textContent = 'Yapay zekâ ile öner';
      yz.addEventListener('click', function () {
        var istem = 'Türkçe, resmi tutanak dili. Yalnızca şu gündem maddesi için 4-6 cümlelik görüşme paragrafı ve ayrı bir karar cümlesi yaz. Karar "karar verilmiştir" ile bitsin. Öğrenci adı, numara, T.C. kimlik yazma. Madde: ' + m.b + '. Okul türü: ' + durum.kademe + '. Toplantı: ' + durum.tur + '.';
        var kutu = onerKutu(govde, istem);
        var deneme = 0;
        var bekle = setInterval(function () {
          if (!kutu._ekle) { if (++deneme > 40) clearInterval(bekle); return; }
          clearInterval(bekle);
          kutu._ekle.addEventListener('click', function () {
            var y = kutu._yazi || '';
            var parca = y.split(/\n+/).filter(Boolean);
            m.g = parca[0] || y;
            m.k = parca.slice(1).join(' ') || m.k;
            d.dataset.dolu = '';
            d.open = false; d.open = true;
            kutu.remove();
            planla(my);
          });
        }, 200);
      });
      govde.appendChild(alt); govde.appendChild(ek); govde.appendChild(yz);
      d.appendChild(govde);
    });
    return d;
  }
  function cizMaddeler(kok, my) {
    kok.innerHTML = '';
    durum.maddeler.forEach(function (m, i) { kok.appendChild(maddeKutu(m, i, kok, my)); });
    var bilgi = document.createElement('p');
    bilgi.textContent = say(durum.maddeler) + ' madde / alt madde';
    kok.appendChild(bilgi);
  }
  function panel(id, my) {
    var tam = id === 'ok' || id === 'sok' || id === 'zumre';
    var t = OY.get(id);
    if (!t || (!tam && !kurulMu(t))) return;
    if (document.getElementById('kaPanel')) return;
    var f = my && window.curDoc ? curDoc.f : (window.F || {});
    var grup = id === 'sok' ? 'sok' : id === 'zumre' ? 'zumre' : 'ok';
    var ka = okuKa(f);
    if (!ka) {
      var tur0 = turBul(f, tam ? grup : 'ok');
      ka = { tur: tur0, kademe: 'ortaokul', brans: '', ogretmenler: String(f.katilimcilar || '').split(/\n/).map(function (s) { return s.trim(); }).filter(Boolean), maddeler: tam ? liste(grup, tur0) : [] };
    }
    durum = ka;
    var kok = document.createElement('section');
    kok.id = 'kaPanel';
    kok.className = 'ka noprint';
    kok.innerHTML = '<h2>Ayrıntılı gündem ve imza</h2><p>Metinler taslaktır; kurulda konuşulanla değiştirin. Resmi çıktı siyah-beyaz kalır. Kişisel veri yazmayın.</p>';
    if (tam) {
      var form = document.getElementById('dform') || document.querySelector('.form');
      if (form && !my) {
        var hid = document.createElement('input');
        hid.type = 'hidden'; hid.name = 'ka';
        form.appendChild(hid);
      }
      var turler = Object.keys(EA_GUNDEM[grup] || {});
      var turSel = document.querySelector('[name=tur],[name=donem],[data-df=tur],[data-df=donem]');
      secenek(turSel, turler);
      function secim(etiket, deger, secenekler, ata) {
        var lab = document.createElement('label');
        lab.textContent = etiket;
        var s = document.createElement('select');
        secenekler.forEach(function (x) {
          var o = document.createElement('option');
          o.value = x[0]; o.textContent = x[1];
          if (x[0] === deger) o.selected = true;
          s.appendChild(o);
        });
        s.addEventListener('change', ata);
        lab.appendChild(s);
        kok.appendChild(lab);
        return s;
      }
      secim('Okul türü', durum.kademe, KADEME, function (e) {
        durum.kademe = e.target.value;
        cizMaddeler(maddeKok, my); planla(my);
      });
      if (id === 'zumre') {
        var uyari = document.createElement('p');
        uyari.className = 'ka-uyari';
        function uyar() {
          var f0 = my && window.curDoc ? curDoc.f : (window.F || {});
          var p0 = my && window.curDoc ? { brans: '' } : (window.P || {});
          uyari.textContent = bransSec(p0, f0, durum) ? '' : 'Branş boş. Zümre adını yazın veya branş grubunu seçin. Müdür ve müdür yardımcısı unvanı branş yerine yazılmaz.';
        }
        secim('Branş grubu', durum.brans || '', BRANS, function (e) {
          durum.brans = e.target.value;
          uyar();
          cizMaddeler(maddeKok, my); planla(my);
        });
        kok.appendChild(uyari);
        uyar();
      }
      var turLab = document.createElement('label');
      turLab.textContent = 'Toplantı türü';
      var ts = document.createElement('select');
      turler.forEach(function (ad) {
        var o = document.createElement('option'); o.value = ad; o.textContent = ad;
        if (ad === durum.tur) o.selected = true;
        ts.appendChild(o);
      });
      ts.addEventListener('change', function () {
        durum.tur = ts.value;
        durum.maddeler = liste(grup, durum.tur);
        if (turSel) { turSel.value = ts.value; turSel.dispatchEvent(new Event('input', { bubbles: true })); turSel.dispatchEvent(new Event('change', { bubbles: true })); }
        cizMaddeler(maddeKok, my); planla(my);
      });
      turLab.appendChild(ts);
      kok.appendChild(turLab);
      var yukle = document.createElement('button');
      yukle.type = 'button'; yukle.className = 'sec'; yukle.textContent = 'Hazır gündemi yeniden yükle';
      yukle.addEventListener('click', function () {
        if (!confirm('Bu toplantı türünün hazır gündemi geri gelsin mi? Yazdıklarınız silinir.')) return;
        durum.maddeler = liste(grup, durum.tur);
        cizMaddeler(maddeKok, my); planla(my);
      });
      kok.appendChild(yukle);
      var maddeKok = document.createElement('div');
      kok.appendChild(maddeKok);
      cizMaddeler(maddeKok, my);
      var ekM = document.createElement('button');
      ekM.type = 'button'; ekM.textContent = '+ Madde ekle';
      ekM.addEventListener('click', function () {
        durum._elle = true;
        durum.maddeler.push({ b: 'Yeni madde', g: '', k: '', a: [] });
        cizMaddeler(maddeKok, my); planla(my);
      });
      var eksik = document.createElement('button');
      eksik.type = 'button'; eksik.className = 'sec'; eksik.textContent = 'Eksik madde öner';
      eksik.addEventListener('click', function () {
        var basliklar = durum.maddeler.map(function (m) { return m.b; }).join('; ').slice(0, 1500);
        var kutu = onerKutu(kok, 'Mevcut gündeme eklenebilecek 3 kısa madde başlığı öner. Her satır bir başlık olsun. Kişi adı yazma. Toplantı: ' + durum.tur + '. Var olanlar: ' + basliklar);
        var deneme2 = 0;
        var bekle = setInterval(function () {
          if (!kutu._ekle) { if (++deneme2 > 40) clearInterval(bekle); return; }
          clearInterval(bekle);
          kutu._ekle.addEventListener('click', function () {
            String(kutu._yazi || '').split(/\n+/).forEach(function (sat) {
              sat = sat.replace(/^\d+[\).\s]+/, '').trim();
              if (sat) durum.maddeler.push({ b: sat, g: '', k: '', a: [] });
            });
            durum._elle = true;
            cizMaddeler(maddeKok, my); planla(my); kutu.remove();
          });
        }, 200);
      });
      kok.appendChild(ekM); kok.appendChild(eksik);
    }
    var h3 = document.createElement('h3');
    h3.textContent = 'Katılan öğretmenler';
    kok.appendChild(h3);
    var acik = document.createElement('p');
    acik.textContent = 'Müdür onayı ve başkan imzası çıktının altındadır. Öğretmenler 2 veya 3 sütunda sıralanır.';
    kok.appendChild(acik);
    var ogKok = document.createElement('div');
    kok.appendChild(ogKok);
    cizOg(ogKok, my);
    var ekO = document.createElement('button');
    ekO.type = 'button'; ekO.textContent = '+ Öğretmen ekle';
    ekO.addEventListener('click', function () { durum.ogretmenler.push(''); cizOg(ogKok, my); });
    var ortak = document.createElement('button');
    ortak.type = 'button'; ortak.className = 'sec'; ortak.textContent = 'Ortak listeden doldur';
    ortak.addEventListener('click', function () {
      var depo = window.EA_LISTE && EA_LISTE.oku ? EA_LISTE.oku() : { ogretmen: [] };
      if (!depo.ogretmen.length) { if (typeof msg === 'function') msg('Ortak öğretmen listesi boş.', 1); return; }
      durum.ogretmenler = depo.ogretmen.map(function (o) { return o.ad; }).filter(Boolean);
      cizOg(ogKok, my);
    });
    var dosya = document.createElement('button');
    dosya.type = 'button'; dosya.className = 'sec'; dosya.textContent = "Excel / Word'den ekle";
    dosya.addEventListener('click', function () {
      var inp = document.createElement('input');
      inp.type = 'file'; inp.accept = '.xlsx,.xls,.csv,.txt,.docx';
      inp.addEventListener('change', function () {
        var file = inp.files && inp.files[0];
        if (!file || !window.EK20 || !EK20.dosyaOku) { if (typeof msg === 'function') msg('Dosya okuyucu yok.', 1); return; }
        EK20.dosyaOku(file).then(function (son) {
          var tablo = son.tablo && son.tablo.length ? son.tablo : (son.satirlar || []).map(function (s) { return [s]; });
          var ay = EA_LISTE.ayikla(tablo);
          var depo = EA_LISTE.oku();
          ay.satir.forEach(function (o) {
            if (!o.ad) return;
            durum.ogretmenler.push(o.ad);
            if (!depo.ogretmen.some(function (x) { return x.ad === o.ad; })) depo.ogretmen.push(o);
          });
          EA_LISTE.yaz(depo);
          cizOg(ogKok, my);
          if (typeof msg === 'function') msg(ay.satir.length + ' satır okundu.');
        }).catch(function (e) { if (typeof msg === 'function') msg(e.message || 'Dosya okunamadı', 1); });
      });
      inp.click();
    });
    kok.appendChild(ekO); kok.appendChild(ortak); kok.appendChild(dosya);
    var stil = document.getElementById('kaCss');
    if (!stil) {
      stil = document.createElement('style');
      stil.id = 'kaCss';
      stil.textContent = '.ka{background:#fff;border:1px solid #f0d2c0;border-radius:16px;padding:12px;margin:12px 0}.ka label{display:flex;flex-direction:column;font-weight:800;margin:8px 0}.ka textarea,.ka input,.ka select{font:inherit;min-height:44px;border:1px solid #f0d2c0;border-radius:12px;padding:8px}.ka-m{background:#fff7ef;border-radius:12px;margin:6px 0;padding:6px 8px}.ka-bar{float:right}.ka-og,.ka-alt{display:flex;gap:4px;margin:4px 0}.ka-og input,.ka-alt input{flex:1}.ka-oner{background:#fff4d6;border-radius:12px;padding:8px;margin:8px 0}@media print{.ka{display:none!important}}';
      document.head.appendChild(stil);
    }
    var yer = document.getElementById('doc');
    if (yer && yer.parentNode) yer.parentNode.insertBefore(kok, yer);
    else document.getElementById('work').appendChild(kok);
    planla(my);
  }
  if (typeof window.sel === 'function') {
    var eskiSel = window.sel;
    window.sel = function (id) {
      var r = eskiSel.apply(this, arguments);
      setTimeout(function () { panel(id, false); }, 0);
      return r;
    };
  }
  if (typeof window.openDoc === 'function') {
    var eskiDoc = window.openDoc;
    window.openDoc = function (id, f) {
      var r = eskiDoc.apply(this, arguments);
      var temiz = String(id || '').replace(/^oy:/, '');
      setTimeout(function () { panel(temiz, true); }, 0);
      return r;
    };
  }
  function yapayKutu() {
    if (document.getElementById('kaYz')) return;
    var k = document.createElement('section');
    k.id = 'kaYz';
    k.className = 'noprint';
    k.innerHTML = '<h3>Yapay zekâ (isteğe bağlı)</h3><p>Gündem taslağı için kendi ücretsiz Gemini anahtarınızı kullanabilirsiniz. Anahtar yalnız bu cihazda saklanır. Anahtar yokken tutanaklar aynen çalışır. Anahtar: aistudio.google.com/apikey</p>';
    var inp = document.createElement('input');
    inp.type = 'password'; inp.autocomplete = 'off'; inp.placeholder = 'Gemini API anahtarı';
    inp.setAttribute('aria-label', 'Gemini API anahtarı');
    try { inp.value = localStorage.getItem(ANAHTAR) || ''; } catch (e) {}
    var kay = document.createElement('button');
    kay.type = 'button'; kay.textContent = 'Anahtarı bu cihaza kaydet';
    kay.addEventListener('click', function () {
      try { if (inp.value.trim()) localStorage.setItem(ANAHTAR, inp.value.trim()); else localStorage.removeItem(ANAHTAR); } catch (e) {}
      if (typeof msg === 'function') msg('Anahtar yalnız bu cihazda güncellendi.');
    });
    k.appendChild(inp); k.appendChild(kay);
    var form = document.getElementById('pform') || document.querySelector('.form');
    if (form && form.parentNode) form.parentNode.insertBefore(k, form.nextSibling);
  }
  if (typeof window.profil === 'function') {
    var ep = window.profil;
    window.profil = function () { var r = ep.apply(this, arguments); setTimeout(yapayKutu, 0); return r; };
  }
  if (window.V && V.profil) {
    var vp = V.profil;
    V.profil = function () { var r = vp.apply(this, arguments); setTimeout(yapayKutu, 0); return r; };
  }
  window.EA_KURUL_SAY = function () {
    var o = {};
    ['ok', 'sok', 'zumre'].forEach(function (g) {
      o[g] = {};
      Object.keys(EA_GUNDEM[g] || {}).forEach(function (tur) {
        o[g][tur] = say(liste(g, tur).filter(function (m) { return uygun(m, { kademe: 'lise', brans: 'mat' }); }));
      });
    });
    return o;
  };
})();
