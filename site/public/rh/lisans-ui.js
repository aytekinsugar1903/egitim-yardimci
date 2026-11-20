/* Rehberlik Yardımcısı / Sınıf Rehberlik Yardımcısı lisans ekranı. Evrak Asistanı / Eyüp ŞEKER.
   Uygulamayı izin yoksa kilitler; öğrenci verisi lisans sunucusuna gitmez. */
(function (root) {
  'use strict';
  if (typeof document === 'undefined' || !root.EA_LISANS) return;
  var L = root.EA_LISANS;

  function el(t, a, c) {
    var e = document.createElement(t);
    a = a || {};
    Object.keys(a).forEach(function (k) {
      if (a[k] == null) return;
      if (k === 'text') e.textContent = a[k];
      else if (k === 'html') e.innerHTML = a[k];
      else if (k === 'on') Object.keys(a.on).forEach(function (v) { e.addEventListener(v, a.on[v]); });
      else e.setAttribute(k, a[k]);
    });
    (c || []).forEach(function (x) { if (x != null) e.appendChild(typeof x === 'string' ? document.createTextNode(x) : x); });
    return e;
  }

  function mesaj(d, ekstra) {
    var m = (d && d.mesaj) || '';
    if (ekstra) m = ekstra + (m ? ' — ' + m : '');
    if (d && d.sonHata) m = (m ? m + ' ' : '') + d.sonHata;
    return m;
  }

  function kilit(acik) {
    document.documentElement.classList.toggle('rhb-lisans-kilit', !acik);
    var ov = document.getElementById('rhbLisans');
    if (ov) ov.hidden = !!acik;
    var rozet = document.getElementById('rhbLisansRozet');
    if (rozet) rozet.hidden = !acik;
  }

  function rozetGuncelle(d) {
    var r = document.getElementById('rhbLisansRozet');
    if (!r) return;
    r.hidden = !d || !d.izin;
    r.textContent = d && d.durum === 'deneme' ? 'Deneme' : (d && d.izin ? 'Lisans' : '');
    r.title = (d && d.mesaj) || '';
  }

  async function boya(d, hata) {
    d = d || await L.durum();
    var durumEl = document.getElementById('rhbLisansDurum');
    if (durumEl) {
      durumEl.textContent = mesaj(d, hata);
      durumEl.dataset.durum = d.durum || '';
    }
    var kk = document.getElementById('rhbKurumKodu');
    if (kk && d.kk && !kk.value) kk.value = d.kk;
    kilit(!!d.izin);
    rozetGuncelle(d);
    return d;
  }

  function ekranKur() {
    if (document.getElementById('rhbLisans')) return;
    var st = document.createElement('style');
    st.textContent = 'html.rhb-lisans-kilit body > header, html.rhb-lisans-kilit body > main{visibility:hidden}'
      + '#rhbLisans{position:fixed;inset:0;z-index:9999;background:#fff4ec;color:#1c1915;overflow:auto;font:16px/1.45 system-ui,Segoe UI,sans-serif}'
      + '#rhbLisans .kutu{max-width:420px;margin:8vh auto;padding:24px;background:#fff;border-radius:16px;box-shadow:0 8px 32px rgba(80,40,10,.12)}'
      + '#rhbLisans h1{font-size:22px;margin:0 0 6px;color:#c2410c}'
      + '#rhbLisans .alt{color:#555;font-size:13px;margin:0 0 16px}'
      + '#rhbLisans label{display:block;margin:10px 0 4px;font-weight:600}'
      + '#rhbLisans input[type=text]{width:100%;box-sizing:border-box;padding:10px;font:inherit;border:1px solid #ccc;border-radius:8px}'
      + '#rhbLisans .satir{display:flex;gap:8px;align-items:flex-start;margin:12px 0}'
      + '#rhbLisans button{padding:10px 16px;border:0;border-radius:14px;background:#c2410c;color:#fff;font-weight:800;cursor:pointer;min-height:48px}'
      + '#rhbLisans button.sec{background:#fff;color:#0f766e;border:2px solid #0f766e}'
      + '#rhbLisans .durum{margin-top:14px;padding:10px;border-radius:8px;background:#eef3fb;font-size:14px}'
      + '#rhbLisans .durum[data-durum=bitti],#rhbLisans .durum[data-durum=gecersiz],#rhbLisans .durum[data-durum=cevrimdisi]{background:#fdecea;color:#7a1f16}'
      + '#rhbLisansRozet{margin-left:8px;font-size:12px;padding:2px 8px;border-radius:999px;background:#fff4d6;color:#c2410c;font-weight:700;cursor:pointer;border:0}';
    document.head.appendChild(st);

    var ov = el('div', { id: 'rhbLisans', role: 'dialog', 'aria-labelledby': 'rhbLisansBaslik' }, [
      el('div', { class: 'kutu' }, [
        el('h1', { id: 'rhbLisansBaslik', text: L.AD || 'Rehberlik Yardımcısı' }),
        el('p', { class: 'alt', text: 'Evrak Asistanı · Eyüp ŞEKER · v' + (L.SURUM || '1.1.1') + ' · ayrı lisanslı ürün' }),
        el('label', { 'for': 'rhbKurumKodu', text: 'Kurum kodu (en az 4 rakam)' }),
        el('input', { id: 'rhbKurumKodu', type: 'text', inputmode: 'numeric', autocomplete: 'off', 'aria-label': 'Kurum kodu' }),
        el('div', { class: 'satir' }, [
          el('input', { id: 'rhbSozlesme', type: 'checkbox' }),
          el('label', { 'for': 'rhbSozlesme', html: ' <a href="lisans.html" target="_blank" rel="noopener">Lisans sözleşmesini</a> okudum, kabul ediyorum.' })
        ]),
        el('div', { class: 'satir' }, [
          el('button', { id: 'rhbDeneme', type: 'button', text: '48 saatlik denemeyi başlat' })
        ]),
        el('label', { 'for': 'rhbAnahtar', text: 'Lisans anahtarı (EA-XXXX-XXXX-XXXX-XXXX)' }),
        el('input', { id: 'rhbAnahtar', type: 'text', autocomplete: 'off', spellcheck: 'false', 'aria-label': 'Lisans anahtarı' }),
        el('div', { class: 'satir' }, [
          el('button', { id: 'rhbEtkin', type: 'button', text: 'Etkinleştir' }),
          el('button', { id: 'rhbDogrula', type: 'button', class: 'sec', text: 'Doğrula' })
        ]),
        el('p', { class: 'alt', text: 'Lisans sunucusuna yalnızca anahtar, kurum kodu, kurulum kimliği ve sürüm gider. Öğrenci verisi bu cihazda kalır.' }),
        el('div', { id: 'rhbLisansDurum', class: 'durum' })
      ])
    ]);
    document.body.appendChild(ov);

    var header = document.querySelector('header');
    if (header && !document.getElementById('rhbLisansRozet')) {
      var rozet = el('button', { id: 'rhbLisansRozet', type: 'button', hidden: 'hidden', text: 'Lisans', title: 'Lisans durumu' });
      rozet.addEventListener('click', function () {
        var ov2 = document.getElementById('rhbLisans');
        if (ov2) { ov2.hidden = false; }
      });
      header.appendChild(rozet);
    }

    document.getElementById('rhbDeneme').addEventListener('click', async function () {
      this.disabled = true;
      try {
        var r = await L.denemeBaslat(document.getElementById('rhbKurumKodu').value, document.getElementById('rhbSozlesme').checked);
        await boya(await L.durum(), r.ok ? '' : r.hata);
      } finally { this.disabled = false; }
    });
    document.getElementById('rhbEtkin').addEventListener('click', async function () {
      this.disabled = true;
      try {
        var r = await L.anahtarGir(
          document.getElementById('rhbAnahtar').value,
          document.getElementById('rhbKurumKodu').value,
          document.getElementById('rhbSozlesme').checked
        );
        await boya(await L.durum(), r.ok ? '' : r.hata);
      } finally { this.disabled = false; }
    });
    document.getElementById('rhbDogrula').addEventListener('click', async function () {
      this.disabled = true;
      try { await boya(await L.bakim()); } finally { this.disabled = false; }
    });
  }

  async function baslat() {
    ekranKur();
    var d = await L.bakim();
    await boya(d);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(baslat, 0); });
  else setTimeout(baslat, 0);
})(typeof window !== 'undefined' ? window : this);
