/* Evrak Asistanı · Rehberlik PWA: kurulum rehberi (iPhone/iPad, Android, Mac), kalıcı depolama, çevrimdışı önbellek tazeleme,
   iOS ana ekran uygulamasında Word/PDF/yedek indirme (Paylaş sayfası). Yayıncı: Eyüp ŞEKER. Ağa veri göndermez. */
(function () {
  'use strict';
  var ua = navigator.userAgent || '';
  var IOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var MAC_SAFARI = !IOS && /Macintosh/.test(ua) && /Safari\//.test(ua) && !/Chrome|Chromium|Edg\//.test(ua);
  function bagimsiz() { return navigator.standalone === true || (window.matchMedia && matchMedia('(display-mode: standalone)').matches); }
  var AD = (window.OY_PAKET && OY_PAKET.ad) || document.title;
  window.EA_PWA = { IOS: IOS, MAC_SAFARI: MAC_SAFARI, bagimsiz: bagimsiz };

  // 1) Kalıcı depolama (iOS/Safari 7 gün kullanılmayan site verisini silebilir; ana ekrana eklenen uygulamada risk düşer)
  try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(function () {}); } catch (e) {}

  // 2) Çevrimdışı önbellek: aynı alan adındaki başka bir uygulama önbelleği silmişse yeniden doldur
  if ('serviceWorker' in navigator && navigator.onLine !== false) {
    navigator.serviceWorker.ready.then(function (r) { if (r.active) r.active.postMessage('onbellek'); }).catch(function () {});
  }

  // 3) iOS ana ekran uygulamasında blob indirmeleri: Paylaş sayfası (Dosyalar'a kaydet / Word / yazdır)
  var bloblar = {};
  var ou = URL.createObjectURL;
  URL.createObjectURL = function (b) { var u = ou.call(URL, b); try { if (b instanceof Blob) bloblar[u] = b; } catch (e) {} return u; };
  var ru = URL.revokeObjectURL;
  URL.revokeObjectURL = function (u) { setTimeout(function () { delete bloblar[u]; }, 60000); return ru.call(URL, u); };
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[download]') : null;
    if (!a || !IOS || !bagimsiz()) return;
    var b = bloblar[a.href]; if (!b) return;
    var ad = a.getAttribute('download') || 'belge';
    var f; try { f = new File([b], ad, { type: b.type || 'application/octet-stream' }); } catch (x) { return; }
    if (navigator.canShare && navigator.canShare({ files: [f] })) {
      e.preventDefault();
      navigator.share({ files: [f], title: ad }).catch(function (err) { if (!err || err.name !== 'AbortError') window.open(a.href, '_blank'); });
    }
  }, true);

  // 4) Kurulum rehberi çubuğu
  var KAPAT = 'pwa_kur_kapat';
  function kapali() { try { return localStorage.getItem(KAPAT) === '1'; } catch (e) { return false; } }
  function cubuk(html, dugme) {
    if (kapali() || bagimsiz() || document.getElementById('pwaKur')) return;
    var d = document.createElement('div'); d.id = 'pwaKur'; d.setAttribute('role', 'note');
    d.style.cssText = 'position:fixed;left:8px;right:8px;bottom:calc(8px + env(safe-area-inset-bottom));z-index:10000;background:#fff;color:#1a1a1a;border:2px solid #0d47a1;border-radius:12px;box-shadow:0 6px 24px #0003;padding:10px 40px 10px 12px;font:14px/1.4 system-ui,-apple-system,Segoe UI,sans-serif';
    d.innerHTML = html + ' <a href="kurulum.html" style="color:#0d47a1;font-weight:700">Ayrıntılı rehber</a>';
    if (dugme) { var b = document.createElement('button'); b.type = 'button'; b.id = 'pwaKurYukle'; b.textContent = 'Uygulamayı yükle'; b.style.cssText = 'margin:6px 8px 0 0;padding:8px 12px;border:0;border-radius:8px;background:#0d47a1;color:#fff;font-weight:700'; b.onclick = dugme; d.appendChild(document.createElement('br')); d.appendChild(b); }
    var x = document.createElement('button'); x.type = 'button'; x.id = 'pwaKurKapat'; x.setAttribute('aria-label', 'Kapat'); x.textContent = '×';
    x.style.cssText = 'position:absolute;top:4px;right:6px;border:0;background:none;font-size:22px;line-height:1;color:#555;padding:4px 8px';
    x.onclick = function () { try { localStorage.setItem(KAPAT, '1'); } catch (e) {} d.remove(); };
    d.appendChild(x); document.body.appendChild(d);
  }
  function baslat() {
    if (IOS) cubuk('<b>' + AD + '</b> uygulamasını kurmak için Safari\'de <b>Paylaş</b> (□↑) → <b>Ana Ekrana Ekle</b> → <b>Ekle</b>. Veriler yalnız bu cihazda kalır.');
    else if (MAC_SAFARI) cubuk('<b>' + AD + '</b> uygulamasını kurmak için Safari menüsünden <b>Dosya → Dock\'a Ekle</b>.');
  }
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault(); var ist = e;
    cubuk('<b>' + AD + '</b> uygulamasını bu cihaza kurabilirsiniz; internetsiz de açılır.', function () { ist.prompt(); ist.userChoice.finally(function () { var d = document.getElementById('pwaKur'); if (d) d.remove(); }); });
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', baslat); else baslat();
})();
