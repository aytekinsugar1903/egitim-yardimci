/* Öğretmen Yardımcısı · Sınıf İçi Ölçme ve Değerlendirme Kütüphanesi
   Ücretsiz/yerel çalışma: PDF.js ile metin çıkarır, IndexedDB'de saklar, kaynak sayfasıyla arar.
   Kaynak PDF'ler kullanıcı tarafından eklenir; kitap içeriği uydurulmaz. */
(function () {
  'use strict';
  if (window.OY_OLCME_KUTUPHANE) return;
  var DB_NAME = 'oy_olcme_kutuphanesi_v1', DB_VER = 1;
  var STORE_BOOKS = 'books', STORE_PAGES = 'pages';
  var style = document.createElement('style');
  style.id = 'oy-olcme-kutuphane-css';
  style.textContent = [
    '.ok-wrap{max-width:1100px;margin:auto;color:#29231e}.ok-hero{background:#fff;border:1px solid #f0d2c0;border-radius:18px;padding:18px;margin:10px 0 16px}.ok-hero h2{margin:0 0 8px}.ok-muted{color:#665b51;font-size:14px}.ok-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:12px}.ok-card{background:#fff;border:1px solid #f0d2c0;border-radius:15px;padding:14px;margin:10px 0}.ok-card h3{margin:0 0 8px}.ok-wrap label{display:block;font-weight:700;margin:10px 0 5px}.ok-wrap input,.ok-wrap select,.ok-wrap textarea{box-sizing:border-box;width:100%;padding:11px;border:1px solid #cfc2b8;border-radius:10px;background:#fff;color:#241f1b;font:inherit;min-height:44px}.ok-wrap textarea{min-height:100px}.ok-actions{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0}.ok-btn{border:0;border-radius:10px;background:#c2410c;color:white;padding:11px 15px;font-weight:800;min-height:44px;cursor:pointer}.ok-btn.alt{background:white;color:#0f766e;border:2px solid #0f766e}.ok-list{padding:0;list-style:none}.ok-list li{padding:11px;border-bottom:1px solid #eee4dc}.ok-result{border:1px solid #ead9cc;border-radius:12px;padding:12px;margin:10px 0;background:#fff}.ok-tag{display:inline-block;background:#fff0e6;color:#8a3410;border-radius:20px;padding:3px 9px;font-size:12px;font-weight:800;margin:2px}.ok-status{font-weight:800;color:#0f766e}.ok-danger{color:#9f2d20}.ok-output{white-space:pre-wrap;background:#fff;border:1px solid #ddd;border-radius:12px;padding:14px;line-height:1.55}.ok-tabs{display:flex;flex-wrap:wrap;gap:8px}.ok-tabs button[aria-pressed=true]{outline:3px solid #fed7aa}.ok-progress{height:9px;background:#eee;border-radius:10px;overflow:hidden}.ok-progress span{display:block;height:100%;background:#0f766e;width:0}.ok-small{font-size:13px;color:#6b625a}@media(max-width:600px){.ok-hero,.ok-card{padding:12px}.ok-actions .ok-btn{flex:1 1 100%}}'
  ].join('');
  document.head.appendChild(style);

  function openDB() {
    return new Promise(function (resolve, reject) {
      if (!window.indexedDB) return reject(new Error('Bu tarayıcı IndexedDB desteklemiyor.'));
      var req = indexedDB.open(DB_NAME, DB_VER);
      req.onupgradeneeded = function () {
        var db = req.result;
        if (!db.objectStoreNames.contains(STORE_BOOKS)) db.createObjectStore(STORE_BOOKS, { keyPath: 'id' });
        if (!db.objectStoreNames.contains(STORE_PAGES)) {
          var p = db.createObjectStore(STORE_PAGES, { keyPath: 'id' });
          p.createIndex('bookId', 'bookId', { unique: false });
        }
      };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error || new Error('Yerel kütüphane açılamadı.')); };
    });
  }
  function txStore(db, store, mode) { return db.transaction(store, mode).objectStore(store); }
  function reqP(req) { return new Promise(function (resolve, reject) { req.onsuccess = function () { resolve(req.result); }; req.onerror = function () { reject(req.error); }; }); }
  function all(store) { return openDB().then(function (db) { return reqP(txStore(db, store, 'readonly').getAll()).finally(function () { db.close(); }); }); }
  function putMany(store, values) {
    return openDB().then(function (db) { return new Promise(function (resolve, reject) {
      var tr = db.transaction(store, 'readwrite'), os = tr.objectStore(store);
      values.forEach(function (v) { os.put(v); });
      tr.oncomplete = function () { db.close(); resolve(); };
      tr.onerror = tr.onabort = function () { db.close(); reject(tr.error || new Error('Kayıt başarısız.')); };
    }); });
  }
  function delBook(id) {
    return openDB().then(function (db) { return new Promise(function (resolve, reject) {
      var tr = db.transaction([STORE_BOOKS, STORE_PAGES], 'readwrite');
      tr.objectStore(STORE_BOOKS).delete(id);
      var ix = tr.objectStore(STORE_PAGES).index('bookId'), cur = ix.openCursor(IDBKeyRange.only(id));
      cur.onsuccess = function () { var c = cur.result; if (c) { c.delete(); c.continue(); } };
      tr.oncomplete = function () { db.close(); resolve(); };
      tr.onerror = tr.onabort = function () { db.close(); reject(tr.error); };
    }); });
  }
  function id() { return 'kitap_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8); }
  function el(tag, attrs, children) {
    var e = document.createElement(tag); attrs = attrs || {};
    Object.keys(attrs).forEach(function (k) {
      if (k === 'text') e.textContent = attrs[k];
      else if (k === 'className') e.className = attrs[k];
      else if (k === 'value') e.value = attrs[k];
      else if (k.slice(0, 2) === 'on' && typeof attrs[k] === 'function') e.addEventListener(k.slice(2), attrs[k]);
      else e.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { if (c != null) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return e;
  }
  function btn(text, fn, alt) { return el('button', { type: 'button', className: 'ok-btn' + (alt ? ' alt' : ''), text: text, onclick: fn }); }
  function norm(s) { return String(s || '').toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ı/g, 'i'); }
  function say(w, text, bad) { var n = w.querySelector('[data-ok-msg]'); if (n) { n.textContent = text; n.className = bad ? 'ok-danger' : 'ok-status'; } }
  var DUR = { 've': 1, 'ile': 1, 'bir': 1, 'bu': 1, 'da': 1, 'de': 1, 'icin': 1, 'olan': 1, 'gibi': 1, 'ya': 1, 'veya': 1, 'ki': 1 };
  function anahtar(s) { return norm(s).split(/[^a-z0-9]+/).filter(function (w) { return w.length > 1 && !DUR[w]; }); }
  var SINIFLAR = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  // İçerik türüne göre ayrı taslak gövdesi (genel öğretmen taslağı; kılavuz içeriği değildir)
  function govde(tur, konu) {
    var k = '“' + konu + '”';
    var D = ['Başlangıç (1)', 'Gelişmekte (2)', 'Yeterli (3)', 'İleri (4)'];
    if (tur === 'Etkinlik') return ['1. Amaç', 'Öğrencilerin ' + k + ' konusundaki öğrenmelerini görünür kılmak ve süreçle ilgili kanıt toplamak.', '', '2. Süre ve materyal', 'Süre: … ders saati  ·  Materyal: …', '', '3. Uygulama adımları', 'a) Giriş: Öğrencinin ön bilgisini yoklayan kısa bir soru veya durum sunun.', 'b) Keşif: Öğrenciler bireysel ya da grup olarak konuya ilişkin bir görevi yürütür.', 'c) Açıklama: Öğrenciler buldukları sonucu ve gerekçesini sınıfla paylaşır.', 'ç) Transfer: Öğrenilen, farklı bir günlük yaşam durumuna uygulanır.', '', '4. Değerlendirme', 'Gözlem, kısa çıkış kartı veya öz değerlendirme ile kanıt toplayın; ölçütleri önceden açıklayın.', '', '5. Uyarlama', 'Desteğe ihtiyacı olanlar için yönergeyi adımlara bölün; ileri düzeydekilerden çözümü yeni bir durumla ilişkilendirmesini isteyin.'];
    if (tur === 'Açık uçlu ölçme aracı') return ['Yönerge: Soruları gerekçeleriyle yanıtlayınız. Puanlar soruların yanında verilmiştir.', '', 'Soru 1 (… puan) – Bilgiyi açıklama: ' + k + ' ile ilgili temel kavramı kendi cümlelerinizle açıklayınız.', 'Soru 2 (… puan) – Uygulama: Verilen durumda ' + k + ' bilgisini kullanarak çözüm üretiniz ve adımlarınızı yazınız.', 'Soru 3 (… puan) – Gerekçelendirme / değerlendirme: Bir iddiayı değerlendiriniz; katılıp katılmadığınızı kanıtla açıklayınız.', '', 'CEVAP ANAHTARI ÖLÇÜTLERİ', '- Tam puan: Kavram doğru, gerekçe ve örnek eksiksiz.', '- Kısmi puan: Kavram doğru, gerekçe veya örnek eksik.', '- Puan yok: Yanıt yok ya da kavram yanlış.', '', 'Not: Her soruya ilgili öğrenme çıktısını yazın; puan dağılımı soru kâğıdında gösterilmelidir.'];
    if (tur === 'Dereceli puanlama anahtarı') {
      var r = ['Konu / görev: ' + konu, 'Düzeyler: ' + D.join(' · '), ''];
      [['Kavramsal doğruluk', 'Kavramlar hatalı', 'Kısmen doğru, eksikler var', 'Doğru ve yeterli', 'Doğru, ilişkilendirilmiş ve örneklendirilmiş'], ['Süreç / yöntem', 'Adımlar izlenmemiş', 'Bazı adımlar eksik', 'Adımlar doğru sırada', 'Adımlar gerekçeli ve özgün'], ['Gerekçelendirme / kanıt', 'Gerekçe yok', 'Gerekçe zayıf', 'Gerekçe uygun', 'Birden çok kanıtla güçlü gerekçe'], ['İletişim / sunum', 'Anlaşılmıyor', 'Kısmen düzenli', 'Açık ve düzenli', 'Açık, düzenli ve hedef kitleye uygun']].forEach(function (x) { r.push(x[0] + ':'); for (var i = 0; i < 4; i++) r.push('   ' + D[i] + ' – ' + x[i + 1]); r.push(''); });
      r.push('Toplam: … / 16  (100 üzerinden puana çevirmek için ×6,25)'); return r;
    }
    if (tur === 'Öz değerlendirme formu' || tur === 'Akran değerlendirme formu') {
      var oz = tur === 'Öz değerlendirme formu', o = oz ? 'Ben' : 'Arkadaşım';
      return [(oz ? 'Öğrencinin adı: …' : 'Değerlendiren: …   Değerlendirilen: …'), 'Her ifade için birini işaretleyiniz: Evet / Kısmen / Henüz değil', '', '1. ' + o + ' ' + k + ' konusundaki temel kavramı açıklayabiliyor' + (oz ? 'um.' : '.'), '2. ' + o + ' bu bilgiyi yeni bir duruma uygulayabiliyor' + (oz ? 'um.' : '.'), '3. ' + o + ' fikirlerini gerekçe ve örnekle destekliyor' + (oz ? 'um.' : '.'), '4. ' + o + ' çalışma sürecinde görevini zamanında tamamlıyor' + (oz ? 'um.' : '.'), '5. ' + o + ' geri bildirimleri dikkate alıyor' + (oz ? 'um.' : '.'), '', oz ? 'En iyi yaptığım şey: …' : 'Arkadaşımın güçlü yanı: …', oz ? 'Geliştirmek istediğim şey ve ilk adımım: …' : 'Arkadaşıma önerim (nazik ve somut): …'];
    }
    if (tur === 'Geri bildirim örneği') return ['Geri bildirim üç adımda verilir: ne iyi gitti, neyi geliştirmeli, sonraki adım ne.', '', 'Örnek 1 (yeterli düzey): “' + konu + ' konusundaki açıklaman doğru ve düzenli. Gerekçeni bir örnekle desteklersen daha güçlü olur. Bir sonraki çalışmada kendi örneğini eklemeyi dene.”', '', 'Örnek 2 (gelişmekte): “Konuya doğru yerden başlamışsın. Şu adımda kavram karıştı: … Önce … üzerine kısa bir alıştırma yapalım, sonra soruyu yeniden dene.”', '', 'Örnek 3 (ileri düzey): “Çözümün doğru ve gerekçeli. Bu bilgiyi farklı bir duruma nasıl uygularsın? Bir örnek tasarlayıp sınıfla paylaşabilirsin.”', '', 'İpucu: Not veya puan yerine davranışa ve ürüne odaklanın; geri bildirimi öğrenci uygulayabileceği kadar somut tutun.'];
    if (tur === 'Destekleme ve zenginleştirme') return ['DESTEKLEME (öğrenme çıktısına henüz ulaşamayanlar)', '- Ön bilgi eksiğini belirleyin; ' + k + ' için kısa, adım adım bir örnek gösterin.', '- Görevi küçük parçalara bölün; her parçadan sonra kısa kontrol sorusu sorun.', '- Görsel, somut materyal veya akran desteği kullanın.', '- Ek süre verin; tekrar uygulamada yalnız eksik ölçütü değerlendirin.', '', 'ZENGİNLEŞTİRME (öğrenme çıktısına ulaşanlar)', '- Konuyu farklı bir disiplin veya günlük yaşam problemiyle ilişkilendiren açık uçlu bir görev verin.', '- Öğrenciden kendi sorusunu ve puanlama ölçütünü hazırlamasını isteyin.', '- Küçük bir araştırma veya ürün (poster, model, sunum) ile sınıfa aktarım yapmasını sağlayın.', '', 'İzleme: Her iki grup için de kısa bir çıkış kartıyla ilerlemeyi kaydedin.'];
    return ['Öğrencilerin ' + k + ' konusundaki öğrenmelerini görünür kılacak bir çalışma planlayın.'];
  }
  function fileStem(s) { return String(s || '').replace(/\.pdf$/i, '').replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim(); }
  function pdfText(file, progress) {
    if (typeof window.EA_PDF !== 'function') return Promise.reject(new Error('PDF.js bulunamadı.'));
    return file.arrayBuffer().then(function (buf) { return window.EA_PDF().then(function (pdfjs) { return pdfjs.getDocument({ data: buf }).promise; }); }).then(function (pdf) {
      var pages = [], chain = Promise.resolve();
      for (var n = 1; n <= pdf.numPages; n++) (function (pageNo) {
        chain = chain.then(function () { return pdf.getPage(pageNo).then(function (page) { return page.getTextContent().then(function (content) {
          var text = (content.items || []).map(function (x) { return x.str || ''; }).join(' ').replace(/\s+/g, ' ').trim();
          pages.push({ page: pageNo, text: text });
          if (progress) progress(pageNo, pdf.numPages);
        }); }); });
      })(n);
      return chain.then(function () { return { pages: pages, pageCount: pdf.numPages }; });
    });
  }
  function makeUI(root) {
    root.innerHTML = '';
    var wrap = el('div', { className: 'ok-wrap' }); root.appendChild(wrap);
    var hero = el('div', { className: 'ok-hero' }, [
      el('h2', { text: 'Sınıf İçi Ölçme ve Değerlendirme Kütüphanesi' }),
      el('p', { text: 'ODSGM’nin sınıf içi ölçme ve değerlendirme kılavuzlarını bu uygulamanın içinde saklayın, ders ve konuya göre arayın; etkinlik ve değerlendirme taslakları hazırlayın.' }),
      el('p', { className: 'ok-muted', text: 'Yerel çalışma: PDF metinleri bu tarayıcının IndexedDB alanında tutulur. Harici yapay zekâ API’si kullanılmaz. Kaynak kitap ve sayfa bilgisi arama sonuçlarında korunur.' })
    ]); wrap.appendChild(hero);
    var status = el('p', { 'data-ok-msg': '', className: 'ok-status', text: 'Kütüphane hazırlanıyor…' }); wrap.appendChild(status);
    var tabs = el('div', { className: 'ok-tabs' }); wrap.appendChild(tabs);
    var panel = el('div'); wrap.appendChild(panel);
    var current = 'library';
    function switchTab(tab) {
      current = tab;
      [].forEach.call(tabs.querySelectorAll('button'), function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-tab') === tab ? 'true' : 'false'); });
      panel.innerHTML = '';
      if (tab === 'library') libraryUI(); else if (tab === 'search') searchUI(); else createUI();
    }
    [['library', 'Kitaplarım'], ['search', 'Kaynaklarda Ara'], ['create', 'Etkinlik / Ölçme Aracı']].forEach(function (x) { var b = btn(x[1], function () { switchTab(x[0]); }, true); b.setAttribute('data-tab', x[0]); b.setAttribute('aria-pressed', 'false'); tabs.appendChild(b); });

    function libraryUI() {
      var card = el('div', { className: 'ok-card' }, [el('h3', { text: 'Kılavuz PDF’lerini ekle' }), el('p', { className: 'ok-muted', text: 'PDF dosyalarını seçin. Her kitap için sınıf ve ders bilgisini girin. Dosya metni sayfa sayfa çıkarılır; PDF’nin kendisi sunucuya gönderilmez.' })]);
      var form = el('div', { className: 'ok-grid' });
      var title = el('input', { type: 'text', placeholder: 'Kitap adı (dosya adından otomatik doldurulur)' });
      var grade = el('select'); ['Sınıf seçin'].concat(SINIFLAR).forEach(function (x, i) { grade.appendChild(el('option', { value: i ? x : '', text: x })); });
      var course = el('input', { type: 'text', placeholder: 'Ders adı (örn. Fen Bilimleri)' });
      var files = el('input', { type: 'file', accept: 'application/pdf,.pdf', multiple: 'multiple' });
      [[ 'Kitap adı', title ], ['Sınıf', grade], ['Ders', course], ['PDF dosyaları', files]].forEach(function (x) { form.appendChild(el('div', {}, [el('label', { text: x[0] }), x[1]])); });
      card.appendChild(form);
      var prog = el('div', { className: 'ok-progress' }, [el('span')]); card.appendChild(prog);
      var progText = el('p', { className: 'ok-small', text: '' }); card.appendChild(progText);
      card.appendChild(btn('PDF’leri kütüphaneye aktar', function () {
        var selected = [].slice.call(files.files || []);
        if (!selected.length) return say(wrap, 'Önce PDF dosyası seçin.', true);
        var seq = Promise.resolve(), done = 0, hatali = [];
        selected.forEach(function (file, ix) { seq = seq.then(function () {
          var bookId = id(), bookTitle = selected.length === 1 && title.value.trim() ? title.value.trim() : fileStem(file.name);
          say(wrap, 'Aktarılıyor: ' + file.name + ' …');
          return pdfText(file, function (p, total) { progText.textContent = file.name + ' · ' + p + '/' + total + ' sayfa'; prog.firstChild.style.width = Math.round(p / total * 100) + '%'; }).then(function (result) {
            var nonEmpty = result.pages.filter(function (p) { return p.text.length > 12; });
            var b = { id: bookId, title: bookTitle, fileName: file.name, grade: grade.value, course: course.value.trim(), pageCount: result.pageCount, indexedPages: nonEmpty.length, addedAt: new Date().toISOString(), status: nonEmpty.length ? 'indexed' : 'image_only' };
            return putMany(STORE_BOOKS, [b]).then(function () {
              var records = nonEmpty.map(function (p) { return { id: bookId + '_p' + p.page, bookId: bookId, page: p.page, text: p.text }; });
              return putMany(STORE_PAGES, records).then(function () { done++; prog.firstChild.style.width = Math.round(done / selected.length * 100) + '%'; });
            });
          }).catch(function (err) { hatali.push(file.name + ' (' + (err && err.message || err) + ')'); return delBook(bookId).catch(function () {}); });
        }); });
        seq.then(function () { say(wrap, done + ' PDF aktarıldı.' + (hatali.length ? ' Aktarılamayan: ' + hatali.join(', ') : ' Sayfa metinleri yerel kütüphaneye kaydedildi.'), !!hatali.length); libraryUI(); }).catch(function (err) { say(wrap, 'Aktarım tamamlanamadı: ' + (err.message || err), true); });
      }));
      panel.appendChild(card);
      all(STORE_BOOKS).then(function (books) {
        var summary = el('div', { className: 'ok-card' }, [el('h3', { text: 'Kütüphane durumu' }), el('p', { text: books.length + ' / 36 kitap eklendi' }), el('p', { className: 'ok-muted', text: '36 kitaplık hedef koleksiyon. Henüz eklenmeyen kitaplar tamamlanmış sayılmaz.' })]);
        var pct = el('div', { className: 'ok-progress' }, [el('span')]); pct.firstChild.style.width = Math.min(100, books.length / 36 * 100) + '%'; summary.appendChild(pct); panel.appendChild(summary);
        if (!books.length) { panel.appendChild(el('div', { className: 'ok-card' }, [el('p', { text: 'Henüz kitap eklenmedi. ODSGM’den indirdiğiniz PDF dosyalarını yukarıdan yükleyebilirsiniz.' })])); return; }
        var list = el('div', { className: 'ok-card' }, [el('h3', { text: 'Eklenen kitaplar' })]);
        books.sort(function (a, b) { return (a.grade || '').localeCompare(b.grade || '') || a.title.localeCompare(b.title, 'tr'); }).forEach(function (b) {
          var line = el('li', {}, [el('strong', { text: b.title }), el('div', { className: 'ok-small', text: (b.grade ? b.grade + '. sınıf · ' : '') + (b.course || 'Ders belirtilmedi') + ' · ' + b.pageCount + ' sayfa · ' + b.indexedPages + ' metin sayfası' }), el('span', { className: 'ok-tag', text: b.status === 'indexed' ? 'Metin indekslendi' : 'Metin çıkarılamadı / tarama olabilir' }), btn('Sil', function () { if (!confirm('Bu kitabı ve indeksini silmek istiyor musunuz?')) return; delBook(b.id).then(libraryUI); }, true)]);
          list.appendChild(el('ul', { className: 'ok-list' }, [line]));
        }); panel.appendChild(list);
      }).catch(function (e) { say(wrap, e.message, true); });
    }
    function searchUI() {
      var card = el('div', { className: 'ok-card' }, [el('h3', { text: 'Kılavuzlarda ara' }), el('p', { className: 'ok-muted', text: 'Kelime, konu, öğrenme çıktısı veya etkinlik adı yazın. Sonuçlar kitap ve sayfa numarasıyla gösterilir.' })]);
      var q = el('input', { type: 'search', placeholder: 'Örn. öz değerlendirme, açık uçlu soru, geri bildirim…' });
      var filter = el('select'); [['', 'Tüm sınıflar']].concat(SINIFLAR.map(function (x) { return [x, x + '. sınıf']; })).forEach(function (x) { filter.appendChild(el('option', { value: x[0], text: x[1] })); });
      var run = btn('Ara', doSearch); card.appendChild(el('label', { text: 'Arama ifadesi' })); card.appendChild(q); card.appendChild(el('label', { text: 'Sınıf filtresi' })); card.appendChild(filter); card.appendChild(el('div', { className: 'ok-actions' }, [run])); panel.appendChild(card);
      var results = el('div'); panel.appendChild(results);
      function doSearch() {
        results.innerHTML = ''; var query = norm(q.value).trim(); if (query.length < 2) { results.textContent = 'Aramak için en az iki karakter girin.'; return; }
        Promise.all([all(STORE_BOOKS), all(STORE_PAGES)]).then(function (data) {
          var books = data[0], pages = data[1], byId = {}; books.forEach(function (b) { byId[b.id] = b; });
          var words = anahtar(q.value), found = []; if (!words.length) words = query.split(/\s+/).filter(Boolean);
          pages.forEach(function (p) { var b = byId[p.bookId]; if (!b || (filter.value && b.grade !== filter.value)) return; var hay = norm(p.text); var score = words.reduce(function (n, word) { return n + (hay.indexOf(word) >= 0 ? 1 : 0); }, 0); if (score) found.push({ page: p, book: b, score: score }); });
          found.sort(function (a, b) { return b.score - a.score; });
          if (!found.length) { results.textContent = 'Eşleşme bulunamadı. PDF metin olarak taranmış olabilir veya farklı kelimeler deneyebilirsiniz.'; return; }
          results.appendChild(el('p', { className: 'ok-muted', text: found.length + ' sayfa eşleşmesi bulundu. İlk 40 sonuç gösteriliyor.' }));
          found.slice(0, 40).forEach(function (x) {
            var excerpt = x.page.text, at = norm(excerpt).indexOf(words[0]); if (at > 100) excerpt = '…' + excerpt.slice(at - 100); excerpt = excerpt.slice(0, 520) + (excerpt.length > 520 ? '…' : '');
            results.appendChild(el('div', { className: 'ok-result' }, [el('strong', { text: x.book.title }), el('div', {}, [el('span', { className: 'ok-tag', text: (x.book.grade ? x.book.grade + '. sınıf' : 'Sınıf belirtilmedi') }), el('span', { className: 'ok-tag', text: x.book.course || 'Ders belirtilmedi' }), el('span', { className: 'ok-tag', text: 'Sayfa ' + x.page.page })]), el('p', { text: excerpt }), el('p', { className: 'ok-small', text: 'Kaynak: ' + x.book.title + ', s. ' + x.page.page })]));
          });
        }).catch(function (e) { results.textContent = e.message; });
      }
      q.addEventListener('keydown', function (e) { if (e.key === 'Enter') doSearch(); });
    }
    function createUI() {
      var card = el('div', { className: 'ok-card' }, [el('h3', { text: 'Kaynağa dayalı etkinlik / ölçme aracı taslağı' }), el('p', { className: 'ok-muted', text: 'Bu alan yüklediğiniz kılavuz sayfalarından alıntı/kanıt bulur ve öğretmenin düzenleyebileceği taslak oluşturur. Kaynakta bulunmayan içerik resmî kılavuz bilgisi gibi sunulmaz.' })]);
      var grade = el('select'); [['', 'Sınıf seçin']].concat(SINIFLAR.map(function (x) { return [x, x]; })).forEach(function (x) { grade.appendChild(el('option', { value: x[0], text: x[1] })); });
      var course = el('input', { placeholder: 'Ders (örn. Türkçe)' }), topic = el('input', { placeholder: 'Konu / öğrenme çıktısı' });
      var type = el('select'); ['Etkinlik', 'Açık uçlu ölçme aracı', 'Dereceli puanlama anahtarı', 'Öz değerlendirme formu', 'Akran değerlendirme formu', 'Geri bildirim örneği', 'Destekleme ve zenginleştirme'].forEach(function (x) { type.appendChild(el('option', { value: x, text: x })); });
      [['Sınıf', grade], ['Ders', course], ['Konu / öğrenme çıktısı', topic], ['Hazırlanacak içerik', type]].forEach(function (x) { card.appendChild(el('label', { text: x[0] })); card.appendChild(x[1]); });
      var output = el('div', { className: 'ok-output', text: 'Bilgileri girip taslak oluşturun.' });
      card.appendChild(el('div', { className: 'ok-actions' }, [btn('Taslak oluştur', build), btn('Metni kopyala', function () { var t = output.textContent; if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(function () { say(wrap, 'Taslak kopyalandı.'); }).catch(function () { say(wrap, 'Kopyalama engellendi; metni seçip kopyalayın.', true); }); else say(wrap, 'Metni seçip kopyalayın.', true); }, true)]));
      card.appendChild(output); panel.appendChild(card);
      function build() {
        if (!grade.value || !course.value.trim() || !topic.value.trim()) { say(wrap, 'Sınıf, ders ve konu alanlarını doldurun.', true); return; }
        Promise.all([all(STORE_BOOKS), all(STORE_PAGES)]).then(function (data) {
          var books = data[0], pages = data[1], byId = {}; books.forEach(function (b) { byId[b.id] = b; });
          var cw = norm(course.value), kw = anahtar(topic.value), scored = [];
          pages.forEach(function (p) { var b = byId[p.bookId]; if (!b || b.grade !== grade.value) return; if (b.course && !(norm(b.course).indexOf(cw) >= 0 || cw.indexOf(norm(b.course)) >= 0)) return; var hay = norm(p.text), s = kw.reduce(function (n, w) { return n + (hay.indexOf(w) >= 0 ? 1 : 0); }, 0); if (s && s >= Math.min(2, kw.length)) scored.push({ p: p, s: s }); });
          scored.sort(function (a, b) { return b.s - a.s; });
          var matches = scored.slice(0, 5).map(function (x) { return x.p; });
          var lines = ['ÖĞRETMEN TASLAĞI · ' + type.value, grade.value + '. sınıf · ' + course.value.trim(), 'Konu / öğrenme çıktısı: ' + topic.value.trim(), ''].concat(govde(type.value, topic.value.trim()), ['', 'KAYNAK DURUMU']);
          if (matches.length) {
            lines.push('Yüklenen kılavuzlarda eşleşen sayfalar:');
            matches.forEach(function (p) { var b = byId[p.bookId]; lines.push('- ' + b.title + ' (' + b.grade + '. sınıf, ' + (b.course || 'ders belirtilmedi') + '), s. ' + p.page + ': ' + p.text.slice(0, 360) + (p.text.length > 360 ? '…' : '')); });
          } else lines.push('Bu sınıf/ders/konu için yüklenen kılavuzlarda doğrudan eşleşme bulunamadı. Yukarıdaki metin genel bir öğretmen taslağıdır; ODSGM kılavuzundan alınmış içerik değildir.');
          lines.push('', 'Not: Taslak öğretmen tarafından kontrol edilmeli; resmî öğrenme çıktısı, ölçüt ve puanlama dersin güncel öğretim programıyla doğrulanmalıdır.');
          output.textContent = lines.join('\n');
        }).catch(function (e) { output.textContent = 'Taslak oluşturulamadı: ' + e.message; });
      }
    }
    switchTab(current);
    all(STORE_BOOKS).then(function (books) { say(wrap, books.length + ' kitap kayıtlı. ' + Math.max(0, 36 - books.length) + ' kitap daha eklenebilir.'); }).catch(function (e) { say(wrap, e.message, true); });
  }

  function open() {
    try { if (typeof land === 'function') land(false); } catch (e) {}
    try { if (typeof cur !== 'undefined') cur = { id: 'oy_olcme_kutuphanesi', baslik: 'Ölçme ve Değerlendirme Kütüphanesi' }; } catch (e) {}
    try { if (typeof cats === 'function') cats(); } catch (e) {}
    var root = document.getElementById('work'); if (!root) return;
    makeUI(root);
  }
  window.OY_OLCME_KUTUPHANE = { open: open, version: '1.0.1', dbName: DB_NAME };

  if (window.OY && Array.isArray(OY.T) && !OY.get('oy_olcme_kutuphanesi')) {
    OY.T.push({ id: 'oy_olcme_kutuphanesi', kat: 'Ölçme ve Değerlendirme', baslik: 'Sınıf İçi Ölçme ve Değerlendirme Kütüphanesi', kaynak: 'ODSGM sınıf içi ölçme ve değerlendirme kılavuzları · PDF’ler öğretmen tarafından eklenir', alan: [], olcmeKutuphane: true });
  }
  if (typeof window.sel === 'function' && !window.sel.__olcmeKutuphane) {
    var oldSel = window.sel;
    var wrapped = function (key) { if (key === 'oy_olcme_kutuphanesi') return open(); return oldSel.apply(this, arguments); };
    wrapped.__olcmeKutuphane = true; window.sel = wrapped;
    try { sel = wrapped; } catch (e) {}
  }
  try { if (typeof cats === 'function') cats(); } catch (e) {}
})();
