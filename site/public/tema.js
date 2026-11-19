/* Açık tema varsayılan. Koyu görünüm yalnız bu düğmeyle açılır. */
(function () {
  var K = 'ea-tema';
  function koyuMu() { return document.documentElement.getAttribute('data-tema') === 'koyu'; }
  function uygula(v) {
    if (v === 'koyu') document.documentElement.setAttribute('data-tema', 'koyu');
    else document.documentElement.removeAttribute('data-tema');
    var b = document.getElementById('eaTema');
    if (b) {
      b.textContent = v === 'koyu' ? 'Açık renk' : 'Koyu renk';
      b.setAttribute('aria-pressed', v === 'koyu' ? 'true' : 'false');
    }
    document.dispatchEvent(new Event('ea-tema'));
  }
  try { uygula(localStorage.getItem(K) === 'koyu' ? 'koyu' : ''); } catch (e) { uygula(''); }
  function yerlestir() {
    if (document.getElementById('eaTema')) return;
    var b = document.createElement('button');
    b.type = 'button';
    b.id = 'eaTema';
    b.className = 'ea-tema';
    b.addEventListener('click', function () {
      var n = koyuMu() ? '' : 'koyu';
      try { localStorage.setItem(K, n); } catch (e) {}
      uygula(n);
    });
    var nav = document.querySelector('header.top nav, header nav');
    if (nav) nav.appendChild(b);
    else document.body.appendChild(b);
    uygula(koyuMu() ? 'koyu' : '');
  }
  if (document.body) yerlestir();
  else document.addEventListener('DOMContentLoaded', yerlestir);
})();
