/* Evrak Asistanı – yorum listesi ve formu (yalnız onaylı yorumlar gösterilir) */
(function () {
  var URUN_AD = {
    evrak: 'Evrak Asistanı EBYS',
    dys: 'Evrak Asistanı DYS',
    belgenet: 'Evrak Asistanı Belgenet',
    eokul: 'Okul Pro',
    'not-girisi': 'Not Girişi Asistanı',
    'ogretmen-yardimcisi': 'Öğretmen Yardımcısı',
    'mudur-yardimcisi': 'Müdür Yardımcısı',
    'form-toplayici': 'Form Toplayıcı',
    'mudur-paketi': 'Müdür Paketi',
    rehberlik: 'Rehberlik Yardımcısı',
    muhasebe: 'Okul Muhasebe Asistanı',
    veli: 'Veli Asistanı'
  };
  function el(tag, attrs) {
    var n = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === 'text') n.textContent = attrs[k];
        else if (k === 'class') n.className = attrs[k];
        else n.setAttribute(k, attrs[k]);
      });
    }
    return n;
  }
  function yildiz(n) {
    n = Math.max(1, Math.min(5, +n || 0));
    var s = '';
    for (var i = 1; i <= 5; i++) s += i <= n ? '★' : '☆';
    return s;
  }
  function tarih(ms) {
    try {
      return new Date(ms).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) { return ''; }
  }
  function kart(y, urunGoster) {
    var art = el('article', { class: 'yorum-kart' });
    var kim = ((y.ad || '') + '').trim() || 'Anonim';
    var unvan = ((y.unvan || '') + '').trim();
    art.appendChild(el('p', { class: 'yorum-kim', text: unvan ? kim + ' · ' + unvan : kim }));
    var meta = el('p', { class: 'yorum-meta' });
    var puan = el('span', { class: 'yorum-puan', text: yildiz(y.puan) });
    puan.setAttribute('aria-label', (y.puan || '') + ' / 5');
    meta.appendChild(puan);
    if (urunGoster && y.urun && URUN_AD[y.urun]) {
      meta.appendChild(document.createTextNode(' · ' + URUN_AD[y.urun]));
    }
    if (y.created) meta.appendChild(document.createTextNode(' · ' + tarih(y.created)));
    art.appendChild(meta);
    art.appendChild(el('p', { class: 'yorum-metin-goster', text: String(y.yorum || '') }));
    return art;
  }
  function yukle(sec) {
    var liste = sec.querySelector('[data-yorum-liste]');
    if (!liste) return;
    var urun = (sec.getAttribute('data-urun') || '').trim();
    var url = '/api/yorumlar' + (urun ? ('?urun=' + encodeURIComponent(urun)) : '');
    fetch(url, { headers: { accept: 'application/json' } })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var arr = (data && data.yorumlar) || [];
        liste.textContent = '';
        if (!arr.length) {
          liste.appendChild(el('p', { class: 'yorum-bos', text: 'Henüz yorum yok — ilk yorumu siz yazın' }));
          return;
        }
        arr.forEach(function (y) { liste.appendChild(kart(y, !urun)); });
      })
      .catch(function () {
        /* Ağ hatasında mevcut boş metni bırak */
      });
  }
  function formKur(sec) {
    var form = sec.querySelector('.yorum-formu');
    if (!form) return;
    var durum = sec.querySelector('[data-yorum-durum]');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var fd = new FormData(form);
      if (durum) { durum.hidden = true; durum.removeAttribute('data-ok'); durum.textContent = ''; }
      var body = {
        ad: (fd.get('ad') || '').toString(),
        unvan: (fd.get('unvan') || '').toString(),
        urun: (fd.get('urun') || '').toString(),
        puan: parseInt(fd.get('puan'), 10),
        yorum: (fd.get('yorum') || '').toString(),
        kvkk: fd.get('kvkk') ? 1 : 0,
        website: (fd.get('website') || '').toString()
      };
      var btn = form.querySelector('button[type=submit]');
      if (btn) btn.disabled = true;
      fetch('/api/yorumlar', {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify(body)
      }).then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (x) {
          if (durum) {
            durum.hidden = false;
            durum.setAttribute('data-ok', x.ok && x.j && x.j.ok ? '1' : '0');
            durum.textContent = (x.j && (x.j.mesaj || x.j.error)) || (x.ok ? 'Yorumunuz alındı. Onaylandıktan sonra yayımlanır.' : 'Gönderilemedi.');
          }
          if (x.ok && x.j && x.j.ok) form.reset();
        })
        .catch(function () {
          if (durum) { durum.hidden = false; durum.setAttribute('data-ok', '0'); durum.textContent = 'Gönderilemedi. Bağlantınızı kontrol edip tekrar deneyin.'; }
        })
        .then(function () { if (btn) btn.disabled = false; });
    });
  }
  document.querySelectorAll('.yorumlar-sec').forEach(function (sec) {
    yukle(sec);
    formKur(sec);
  });
})();
