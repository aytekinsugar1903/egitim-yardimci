/* Öğretmen Yardımcısı · Sınıf İçi Ölçme ve Değerlendirme Kütüphanesi
   v1.0.2 — ODSGM kılavuz metinleri hazır indeksle yüklenir; arama çevrimdışı çalışır.
   Özetler kitabın kendi metninden (etkinlik adı, tema/ünite, öğrenme çıktısı, sayfa) çıkarılır; üretilmez. */
(function () {
  'use strict';
  if (window.OY_OLCME_KUTUPHANE) return;
  var APP_CODE = (window.OY_PAKET && window.OY_PAKET.tur === 'sinif') ? 'srh'
    : (window.OY_PAKET ? 'rh'
    : ((typeof MD !== 'undefined' && typeof NAV !== 'undefined') ? 'myp' : 'oy'));
  var DB_NAME = (APP_CODE === 'oy' ? 'oy' : APP_CODE) + '_olcme_kutuphanesi_v1', DB_VER = 2;
  var STORE_BOOKS = 'books', STORE_PAGES = 'pages', STORE_META = 'meta';
  var BUNDLE_URL = 'olcme-kitaplar.json.gz';
  var TARGET = 36;
  var style = document.createElement('style');
  style.id = 'oy-olcme-kutuphane-css';
  style.textContent = [
    '.ok-wrap{max-width:1100px;margin:auto;color:#29231e}.ok-hero{background:#fff;border:1px solid #f0d2c0;border-radius:18px;padding:18px;margin:10px 0 16px}.ok-hero h2{margin:0 0 8px}.ok-muted{color:#665b51;font-size:14px}.ok-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:12px}.ok-card{background:#fff;border:1px solid #f0d2c0;border-radius:15px;padding:14px;margin:10px 0}.ok-card h3{margin:0 0 8px}.ok-wrap label{display:block;font-weight:700;margin:10px 0 5px}.ok-wrap input,.ok-wrap select,.ok-wrap textarea{box-sizing:border-box;width:100%;padding:11px;border:1px solid #cfc2b8;border-radius:10px;background:#fff;color:#241f1b;font:inherit;min-height:44px}.ok-wrap textarea{min-height:100px}.ok-actions{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0}.ok-btn{border:0;border-radius:10px;background:#c2410c;color:white;padding:11px 15px;font-weight:800;min-height:44px;cursor:pointer}.ok-btn.alt{background:white;color:#0f766e;border:2px solid #0f766e}.ok-list{padding:0;list-style:none}.ok-list li{padding:11px;border-bottom:1px solid #eee4dc}.ok-result{border:1px solid #ead9cc;border-radius:12px;padding:12px;margin:10px 0;background:#fff}.ok-tag{display:inline-block;background:#fff0e6;color:#8a3410;border-radius:20px;padding:3px 9px;font-size:12px;font-weight:800;margin:2px}.ok-status{font-weight:800;color:#0f766e}.ok-danger{color:#9f2d20}.ok-output{white-space:pre-wrap;background:#fff;border:1px solid #ddd;border-radius:12px;padding:14px;line-height:1.55}.ok-tabs{display:flex;flex-wrap:wrap;gap:8px}.ok-tabs button[aria-pressed=true]{outline:3px solid #fed7aa}.ok-progress{height:9px;background:#eee;border-radius:10px;overflow:hidden}.ok-progress span{display:block;height:100%;background:#0f766e;width:0}.ok-small{font-size:13px;color:#6b625a}.ok-ozet{list-style:none;padding:0;margin:0;max-height:460px;overflow:auto}.ok-ozet li{padding:10px 0;border-bottom:1px solid #eee4dc}@media(max-width:600px){.ok-hero,.ok-card{padding:12px}.ok-actions .ok-btn{flex:1 1 100%}}'
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
        if (!db.objectStoreNames.contains(STORE_META)) db.createObjectStore(STORE_META, { keyPath: 'id' });
      };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error || new Error('Yerel kütüphane açılamadı.')); };
    });
  }
  function txStore(db, store, mode) { return db.transaction(store, mode).objectStore(store); }
  function reqP(req) { return new Promise(function (resolve, reject) { req.onsuccess = function () { resolve(req.result); }; req.onerror = function () { reject(req.error); }; }); }
  function all(store) { return openDB().then(function (db) { return reqP(txStore(db, store, 'readonly').getAll()).finally(function () { db.close(); }); }); }
  function getMeta(id) { return openDB().then(function (db) { return reqP(txStore(db, STORE_META, 'readonly').get(id)).finally(function () { db.close(); }); }); }
  function putMeta(val) { return putMany(STORE_META, [val]); }
  function putMany(store, values) {
    if (!values.length) return Promise.resolve();
    return openDB().then(function (db) { return new Promise(function (resolve, reject) {
      var tr = db.transaction(store, 'readwrite'), os = tr.objectStore(store);
      values.forEach(function (v) { os.put(v); });
      tr.oncomplete = function () { db.close(); resolve(); };
      tr.onerror = tr.onabort = function () { db.close(); reject(tr.error || new Error('Kayıt başarısız.')); };
    }); });
  }
  function putManyChunked(store, values, size) {
    size = size || 250;
    var chain = Promise.resolve(), i = 0;
    function next() {
      if (i >= values.length) return Promise.resolve();
      var part = values.slice(i, i + size); i += size;
      return putMany(store, part).then(next);
    }
    return next();
  }
  function delBook(id) {
    return openDB().then(function (db) { return new Promise(function (resolve, reject) {
      var tr = db.transaction([STORE_BOOKS, STORE_PAGES], 'readwrite');
      tr.objectStore(STORE_BOOKS).delete(id);
      var ix = tr.objectStore(STORE_PAGES).index('bookId'), cur = ix.openCursor(IDBKeyRange.only(id));
      cur.onsuccess = function () { var c = cur.result; if (c) { c.delete(); c.continue(); } };
      tr.oncomplete = function () { db.close(); resolve(); };
      tr.onerror = tr.onabort = function () { db.close(); reject(tr.error); };
    }); }).then(function () {
      if (String(id).indexOf('odsgm_') !== 0) return;
      return getMeta('seed').then(function (meta) {
        meta = meta || { id: 'seed', version: '', removed: [] };
        if (!meta.removed) meta.removed = [];
        if (meta.removed.indexOf(id) < 0) meta.removed.push(id);
        return putMeta(meta);
      });
    });
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

  function gunzipText(buf) {
    if (typeof DecompressionStream !== 'function') return Promise.reject(new Error('Bu tarayıcı hazır indeksi açamıyor (gzip).'));
    return new Response(new Blob([buf]).stream().pipeThrough(new DecompressionStream('gzip'))).text();
  }
  function loadBundle() {
    return fetch(BUNDLE_URL).then(function (r) {
      if (!r.ok) throw new Error('Hazır kılavuz indeksi bulunamadı.');
      return r.arrayBuffer();
    }).then(gunzipText).then(function (t) { return JSON.parse(t); });
  }
  var seedPromise = null;
  function ensureSeed(onProg) {
    if (seedPromise) return seedPromise;
    seedPromise = getMeta('seed').catch(function () { return null; }).then(function (meta) {
      return loadBundle().then(function (bundle) {
        TARGET = bundle.bookCount || TARGET;
        var ver = bundle.seedVersion || 'odsgm-2026-11-v1';
        if (meta && meta.version === ver) return { already: true, bundle: bundle, meta: meta };
        var removed = (meta && meta.removed) || [];
        return all(STORE_BOOKS).then(function (existing) {
          var have = {};
          (existing || []).forEach(function (b) { have[b.id] = true; });
          var books = [], pages = [];
          (bundle.books || []).forEach(function (b) {
            if (removed.indexOf(b.id) >= 0) return;
            if (have[b.id] && meta && meta.version === ver) return;
            books.push({
              id: b.id,
              title: b.title,
              fileName: b.fileName,
              grade: b.grade,
              course: b.course,
              pageCount: b.pageCount,
              indexedPages: b.indexedPages,
              addedAt: '2026-11-24T00:00:00.000Z',
              status: b.status || 'indexed',
              url: b.url,
              source: 'odsgm-preload',
              seedVersion: ver,
              preload: true,
              summary: b.summary || null
            });
            (b.pages || []).forEach(function (p) {
              var page = p.p, text = p.t;
              if (page == null || !text) return;
              pages.push({ id: b.id + ':' + page, bookId: b.id, page: page, text: text });
            });
          });
          if (onProg) onProg('ODSGM kılavuzları kaydediliyor…');
          return putMany(STORE_BOOKS, books).then(function () {
            return putManyChunked(STORE_PAGES, pages, 250);
          }).then(function () {
            return putMeta({ id: 'seed', version: ver, removed: removed, bookCount: bundle.bookCount, pageCount: bundle.pageCount, activityCount: bundle.activityCount, sourceList: bundle.sourceList });
          }).then(function () { return { already: false, added: books.length, pages: pages.length, bundle: bundle }; });
        });
      });
    }).catch(function (e) {
      seedPromise = null;
      throw e;
    });
    return seedPromise;
  }

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
  function statusLine(books) {
    var official = books.filter(function (b) { return b.preload || String(b.id).indexOf('odsgm_') === 0; });
    var extra = books.length - official.length;
    var t = TARGET || 36;
    var msg = official.length + ' / ' + t + ' ODSGM kılavuzu hazır yüklü';
    if (extra > 0) msg = books.length + ' kitap kayıtlı: ' + official.length + ' / ' + t + ' ODSGM kılavuzu + ' + extra + ' ek yükleme';
    else if (official.length < t) msg += ' (' + (t - official.length) + ' eksik veya silindi). Ek PDF isteğe bağlı.';
    else msg += '. Ek PDF isteğe bağlı.';
    return msg;
  }
  function makeUI(root) {
    root.innerHTML = '';
    var wrap = el('div', { className: 'ok-wrap' }); root.appendChild(wrap);
    var hero = el('div', { className: 'ok-hero' }, [
      el('h2', { text: 'Sınıf İçi Ölçme ve Değerlendirme Kütüphanesi' }),
      el('p', { text: 'ODSGM sınıf içi ölçme ve değerlendirme kılavuzları ilk açılışta hazır yüklenir. Kitap ve sayfa metinleriyle çevrimdışı arama yapabilir; etkinlik ve değerlendirme taslağı hazırlayabilirsiniz.' }),
      el('p', { className: 'ok-muted', text: 'Yerel çalışma: metinler bu tarayıcının IndexedDB alanında tutulur. Harici yapay zekâ API’si kullanılmaz. Kitap özetleri kılavuzun kendi metninden (etkinlik adı, tema/ünite, öğrenme çıktısı ve sayfa) çıkarılmıştır; üretilmiş içerik değildir. Resmî PDF bağlantısı ODSGM/EBA adresine gider.' })
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

    function uploadForm() {
      var card = el('div', { className: 'ok-card' }, [el('h3', { text: 'Ek kılavuz PDF’si ekle (isteğe bağlı)' }), el('p', { className: 'ok-muted', text: 'Hazır ODSGM kılavuzlarının yanı sıra kendi PDF’inizi de ekleyebilirsiniz. Metin sayfa sayfa çıkarılır; PDF sunucuya gönderilmez.' })]);
      var files = el('input', { type: 'file', accept: 'application/pdf,.pdf', multiple: 'multiple' });
      var title = el('input', { type: 'text', placeholder: 'Kitap adı (dosya adından otomatik doldurulur)' });
      var grade = el('select'); ['Sınıf seçin'].concat(SINIFLAR).forEach(function (x, i) { grade.appendChild(el('option', { value: i ? x : '', text: x })); });
      var course = el('input', { type: 'text', placeholder: 'Ders adı (örn. Fen Bilimleri)' });
      var form = el('div');
      [['Kitap adı', title ], ['Sınıf', grade], ['Ders', course], ['PDF dosyaları', files]].forEach(function (x) { form.appendChild(el('div', {}, [el('label', { text: x[0] }), x[1]])); });
      var prog = el('div', { className: 'ok-progress' }, [el('span')]); form.appendChild(prog);
      form.appendChild(el('div', { className: 'ok-actions' }, [btn('PDF’leri aktar', function () {
        var selected = files.files ? [].slice.call(files.files) : [];
        if (!selected.length) { say(wrap, 'En az bir PDF seçin.', true); return; }
        var done = 0, failed = [];
        function one(file) {
          var bookId = id(), bookTitle = selected.length === 1 && title.value.trim() ? title.value.trim() : fileStem(file.name);
          return pdfText(file, function (n, tot) { prog.firstChild.style.width = Math.round((done + n / tot) / selected.length * 100) + '%'; }).then(function (result) {
            var nonEmpty = result.pages.filter(function (p) { return p.text.length > 12; });
            var b = { id: bookId, title: bookTitle, fileName: file.name, grade: grade.value, course: course.value.trim(), pageCount: result.pageCount, indexedPages: nonEmpty.length, addedAt: new Date().toISOString(), status: nonEmpty.length ? 'indexed' : 'image_only', preload: false };
            return putMany(STORE_BOOKS, [b]).then(function () {
              var records = nonEmpty.map(function (p) { return { id: bookId + ':' + p.page, bookId: bookId, page: p.page, text: p.text }; });
              return putMany(STORE_PAGES, records).then(function () { done++; prog.firstChild.style.width = Math.round(done / selected.length * 100) + '%'; });
            });
          }).catch(function (e) { failed.push(file.name + ': ' + (e && e.message ? e.message : e)); });
        }
        var chain = Promise.resolve();
        selected.forEach(function (f) { chain = chain.then(function () { return one(f); }); });
        chain.then(function () {
          say(wrap, done + ' kitap aktarıldı.' + (failed.length ? ' Aktarılamayan: ' + failed.join('; ') : ''), !!failed.length && !done);
          libraryUI();
        });
      })]));
      card.appendChild(form);
      return card;
    }

    function libraryUI(openId) {
      panel.innerHTML = '';
      panel.appendChild(uploadForm());
      all(STORE_BOOKS).then(function (books) {
        books = books || [];
        var summary = el('div', { className: 'ok-card' }, [el('h3', { text: 'Kütüphane durumu' }), el('p', { text: statusLine(books) })]);
        var official = books.filter(function (b) { return b.preload || String(b.id).indexOf('odsgm_') === 0; }).length;
        var pct = el('div', { className: 'ok-progress' }, [el('span')]); pct.firstChild.style.width = Math.min(100, official / (TARGET || 36) * 100) + '%'; summary.appendChild(pct);
        panel.appendChild(summary);
        if (openId) {
          var found = books.filter(function (b) { return b.id === openId; })[0];
          if (found) return bookDetail(found, books);
        }
        if (!books.length) { panel.appendChild(el('div', { className: 'ok-card' }, [el('p', { text: 'Henüz kitap yok. Hazır indeks yüklenemediyse ODSGM PDF’lerini aşağıdan ekleyebilirsiniz.' })])); return; }
        var list = el('div', { className: 'ok-card' }, [el('h3', { text: 'Kitaplar' })]);
        var ul = el('ul', { className: 'ok-list' });
        books.sort(function (a, b) { return (a.grade || '').localeCompare(b.grade || '', 'tr', { numeric: true }) || (a.course || '').localeCompare(b.course || '', 'tr') || a.title.localeCompare(b.title, 'tr'); }).forEach(function (b) {
          var line = el('li', {}, [
            el('strong', { text: b.title }),
            el('div', { className: 'ok-small', text: (b.grade ? b.grade + '. sınıf · ' : '') + (b.course || 'Ders belirtilmedi') + ' · ' + b.pageCount + ' sayfa · ' + b.indexedPages + ' metin sayfası' }),
            el('span', { className: 'ok-tag', text: b.preload ? 'Hazır yüklü' : 'Ek yükleme' }),
            el('span', { className: 'ok-tag', text: b.status === 'indexed' ? 'Metin indekslendi' : 'Metin çıkarılamadı / tarama olabilir' }),
            el('div', { className: 'ok-actions' }, [
              btn('Özet', function () { libraryUI(b.id); }, true),
              b.url ? btn('PDF’yi aç', function () { window.open(b.url, '_blank', 'noopener'); }, true) : null,
              btn('Sil', function () { if (!confirm('Bu kitabı ve indeksini silmek istiyor musunuz?')) return; delBook(b.id).then(function () { libraryUI(); }); }, true)
            ])
          ]);
          ul.appendChild(line);
        });
        list.appendChild(ul);
        panel.appendChild(list);
        say(wrap, statusLine(books));
      }).catch(function (e) { say(wrap, e.message, true); });
    }

    function bookDetail(b) {
      panel.innerHTML = '';
      panel.appendChild(el('div', { className: 'ok-actions' }, [btn('← Kitaplar', function () { libraryUI(); }, true)]));
      var head = el('div', { className: 'ok-card' }, [
        el('h3', { text: b.title }),
        el('div', { className: 'ok-small', text: (b.grade ? b.grade + '. sınıf · ' : '') + (b.course || 'Ders belirtilmedi') + ' · ' + b.pageCount + ' sayfa · ' + b.indexedPages + ' metin sayfası' }),
        el('span', { className: 'ok-tag', text: b.preload ? 'Hazır yüklü · ODSGM' : 'Ek yükleme' }),
        el('div', { className: 'ok-actions' }, [
          b.url ? btn('PDF’yi aç', function () { window.open(b.url, '_blank', 'noopener'); }) : null,
          btn('Sil', function () { if (!confirm('Bu kitabı ve indeksini silmek istiyor musunuz?')) return; delBook(b.id).then(function () { libraryUI(); }); }, true)
        ])
      ]);
      panel.appendChild(head);
      var card = el('div', { className: 'ok-card' }, [el('h3', { text: 'Özet' })]);
      var items = b.summary && b.summary.items ? b.summary.items : [];
      if (!items.length) {
        card.appendChild(el('p', { className: 'ok-muted', text: b.preload ? 'Bu kılavuz için çıkarılmış etkinlik özeti yok.' : 'Elle yüklenen kitaplarda özet çıkarılmadı. Arama sekmesinden sayfa metinlerinde arama yapabilirsiniz.' }));
      } else {
        card.appendChild(el('p', { className: 'ok-muted', text: 'Bu özet kitabın kendi metninden alınmıştır (etkinlik adı, tema/ünite, öğrenme çıktısı ve sayfa). Üretilmiş veya yorumlanmış içerik değildir. ' + items.length + ' etkinlik.' }));
        var ul = el('ol', { className: 'ok-ozet' });
        items.forEach(function (it) {
          var li = el('li', {});
          li.appendChild(el('strong', { text: (it.n ? it.n + '. ' : '') + it.name }));
          li.appendChild(el('div', {}, [
            el('span', { className: 'ok-tag', text: 'Sayfa ' + it.page }),
            it.theme ? el('span', { className: 'ok-tag', text: it.theme }) : null
          ]));
          (it.outcomes || []).forEach(function (o) { li.appendChild(el('p', { className: 'ok-small', text: o })); });
          ul.appendChild(li);
        });
        card.appendChild(ul);
      }
      panel.appendChild(card);
    }

    function searchUI() {
      var card = el('div', { className: 'ok-card' }, [el('h3', { text: 'Kılavuzlarda ara' }), el('p', { className: 'ok-muted', text: 'Kelime, konu, öğrenme çıktısı veya etkinlik adı yazın. Sonuçlar kitap ve sayfa numarasıyla gösterilir. Arama çevrimdışı, hazır indeksteki sayfa metinlerinde yapılır.' })]);
      var q = el('input', { type: 'text', placeholder: 'Örn. biçimlendirici değerlendirme, ışık ve gölge' });
      var filter = el('select'); [['', 'Tüm sınıflar']].concat(SINIFLAR.map(function (x) { return [x, x + '. sınıf']; })).forEach(function (x) { filter.appendChild(el('option', { value: x[0], text: x[1] })); });
      var results = el('div');
      card.appendChild(el('label', { text: 'Arama' })); card.appendChild(q);
      card.appendChild(el('label', { text: 'Sınıf süzgeci' })); card.appendChild(filter);
      card.appendChild(el('div', { className: 'ok-actions' }, [btn('Ara', run)]));
      card.appendChild(results);
      panel.appendChild(card);
      q.addEventListener('keydown', function (e) { if (e.key === 'Enter') run(); });
      function run() {
        var words = anahtar(q.value);
        if (!words.length) { say(wrap, 'Aramak için bir sözcük yazın.', true); return; }
        Promise.all([all(STORE_BOOKS), all(STORE_PAGES)]).then(function (data) {
          var books = data[0], pages = data[1], byId = {}; books.forEach(function (b) { byId[b.id] = b; });
          var found = [];
          pages.forEach(function (p) { var b = byId[p.bookId]; if (!b || (filter.value && b.grade !== filter.value)) return; var hay = norm(p.text); var score = words.reduce(function (n, word) { return n + (hay.indexOf(word) >= 0 ? 1 : 0); }, 0); if (score) found.push({ page: p, book: b, score: score }); });
          found.sort(function (a, b) { return b.score - a.score || a.book.title.localeCompare(b.book.title, 'tr') || a.page.page - b.page.page; });
          results.innerHTML = '';
          if (!found.length) { results.appendChild(el('p', { text: 'Eşleşme bulunamadı.' })); return; }
          say(wrap, found.length + ' sayfada eşleşme bulundu.');
          found.slice(0, 40).forEach(function (x) {
            var hay = x.page.text, low = norm(hay), pos = -1, w0 = words[0];
            pos = low.indexOf(w0);
            var excerpt = hay;
            if (pos >= 0) { var a = Math.max(0, pos - 80), bpos = Math.min(hay.length, pos + w0.length + 160); excerpt = (a ? '…' : '') + hay.slice(a, bpos) + (bpos < hay.length ? '…' : ''); }
            else excerpt = hay.slice(0, 280) + (hay.length > 280 ? '…' : '');
            results.appendChild(el('div', { className: 'ok-result' }, [el('strong', { text: x.book.title }), el('div', {}, [el('span', { className: 'ok-tag', text: (x.book.grade ? x.book.grade + '. sınıf' : 'Sınıf belirtilmedi') }), el('span', { className: 'ok-tag', text: x.book.course || 'Ders belirtilmedi' }), el('span', { className: 'ok-tag', text: 'Sayfa ' + x.page.page })]), el('p', { text: excerpt }), el('p', { className: 'ok-small', text: 'Kaynak: ' + x.book.title + ', s. ' + x.page.page })]));
          });
        }).catch(function (e) { say(wrap, e.message, true); });
      }
    }

    function createUI() {
      var card = el('div', { className: 'ok-card' }, [el('h3', { text: 'Etkinlik / ölçme aracı taslağı' }), el('p', { className: 'ok-muted', text: 'Sınıf, ders ve konuya göre genel bir öğretmen taslağı üretir; eşleşen kılavuz sayfalarını kaynak olarak listeler.' })]);
      var grade = el('select'); [['', 'Sınıf seçin']].concat(SINIFLAR.map(function (x) { return [x, x]; })).forEach(function (x) { grade.appendChild(el('option', { value: x[0], text: x[1] })); });
      var course = el('input', { placeholder: 'Ders (örn. Türkçe)' }), topic = el('input', { placeholder: 'Konu / öğrenme çıktısı' });
      var type = el('select'); ['Etkinlik', 'Açık uçlu ölçme aracı', 'Dereceli puanlama anahtarı', 'Öz değerlendirme formu', 'Akran değerlendirme formu', 'Geri bildirim örneği', 'Destekleme ve zenginleştirme'].forEach(function (x) { type.appendChild(el('option', { value: x, text: x })); });
      var output = el('pre', { className: 'ok-output' });
      [['Sınıf', grade], ['Ders', course], ['Konu / öğrenme çıktısı', topic], ['Hazırlanacak içerik', type]].forEach(function (x) { card.appendChild(el('label', { text: x[0] })); card.appendChild(x[1]); });
      card.appendChild(el('div', { className: 'ok-actions' }, [btn('Taslak oluştur', build)]));
      card.appendChild(output);
      panel.appendChild(card);
      function build() {
        if (!grade.value || !course.value.trim() || !topic.value.trim()) { say(wrap, 'Sınıf, ders ve konu alanlarını doldurun.', true); return; }
        Promise.all([all(STORE_BOOKS), all(STORE_PAGES)]).then(function (data) {
          var books = data[0], pages = data[1], byId = {}; books.forEach(function (b) { byId[b.id] = b; });
          var cw = norm(course.value), kw = anahtar(topic.value), scored = [];
          pages.forEach(function (p) { var b = byId[p.bookId]; if (!b || b.grade !== grade.value) return; if (b.course && !(norm(b.course).indexOf(cw) >= 0 || cw.indexOf(norm(b.course)) >= 0)) return; var hay = norm(p.text), s = kw.reduce(function (n, w) { return n + (hay.indexOf(w) >= 0 ? 1 : 0); }, 0); if (s && s >= Math.min(2, kw.length)) scored.push({ p: p, s: s }); });
          scored.sort(function (a, b) { return b.s - a.s; });
          var matches = scored.slice(0, 8).map(function (x) { return x.p; });
          var lines = ['ÖĞRETMEN TASLAĞI · ' + type.value, grade.value + '. sınıf · ' + course.value.trim(), 'Konu / öğrenme çıktısı: ' + topic.value.trim(), ''].concat(govde(type.value, topic.value.trim()), ['', 'KAYNAK DURUMU']);
          if (matches.length) {
            lines.push('Kılavuzlarda eşleşen sayfalar:');
            matches.forEach(function (p) { var b = byId[p.bookId]; lines.push('- ' + b.title + ' (' + b.grade + '. sınıf, ' + (b.course || 'ders belirtilmedi') + '), s. ' + p.page + ': ' + p.text.slice(0, 360) + (p.text.length > 360 ? '…' : '')); });
          } else lines.push('Bu sınıf/ders/konu için kılavuzlarda doğrudan eşleşme bulunamadı. Yukarıdaki metin genel bir öğretmen taslağıdır; ODSGM kılavuzundan alınmış içerik değildir.');
          lines.push('', 'Not: Taslak öğretmen tarafından kontrol edilmeli; resmî öğrenme çıktısı, ölçüt ve puanlama dersin güncel öğretim programıyla doğrulanmalıdır.');
          output.textContent = lines.join('\n');
        }).catch(function (e) { output.textContent = 'Taslak oluşturulamadı: ' + e.message; });
      }
    }

    say(wrap, 'ODSGM kılavuzları yükleniyor…');
    ensureSeed(function (m) { say(wrap, m); }).then(function () {
      switchTab(current);
      all(STORE_BOOKS).then(function (books) { say(wrap, statusLine(books || [])); }).catch(function (e) { say(wrap, e.message, true); });
    }).catch(function (e) {
      say(wrap, 'Hazır kılavuzlar yüklenemedi: ' + e.message + ' Elle PDF ekleyebilirsiniz.', true);
      switchTab('library');
    });
  }

  function hookMyp() {
    if (typeof NAV === 'undefined' || !Array.isArray(NAV)) return;
    var varMi = NAV.some(function (g) {
      return g && g[1] && g[1].some(function (m) { return m[0] === 'olcme_kutuphane'; });
    });
    if (!varMi) NAV.push(['Ölçme ve Değerlendirme', [['olcme_kutuphane', 'Sınıf İçi Ölçme ve Değerlendirme Kütüphanesi']]]);
    if (typeof V === 'object' && V) V.olcme_kutuphane = function () { open(); };
    try { if (typeof nav === 'function') nav(); } catch (e) {}
  }
  function open() {
    try { if (typeof land === 'function') land(false); } catch (e) {}
    try {
      if (typeof cur !== 'undefined') {
        if (typeof cur === 'string') cur = 'olcme_kutuphane';
        else cur = { id: 'oy_olcme_kutuphanesi', baslik: 'Ölçme ve Değerlendirme Kütüphanesi' };
      }
    } catch (e) {}
    try { if (typeof cats === 'function') cats(); } catch (e) {}
    var root = document.getElementById('work'); if (!root) return;
    makeUI(root);
  }
  window.OY_OLCME_KUTUPHANE = { open: open, version: '1.0.2', dbName: DB_NAME, ensureSeed: ensureSeed };

  if (window.OY && Array.isArray(OY.T) && !OY.get('oy_olcme_kutuphanesi')) {
    OY.T.push({ id: 'oy_olcme_kutuphanesi', kat: 'Ölçme ve Değerlendirme', baslik: 'Sınıf İçi Ölçme ve Değerlendirme Kütüphanesi', kaynak: 'ODSGM sınıf içi ölçme kılavuzları hazır yüklü · ek PDF isteğe bağlı', alan: [], olcmeKutuphane: true });
  }
  if (typeof window.sel === 'function' && !window.sel.__olcmeKutuphane) {
    var oldSel = window.sel;
    var wrapped = function (key) { if (key === 'oy_olcme_kutuphanesi') return open(); return oldSel.apply(this, arguments); };
    wrapped.__olcmeKutuphane = true; window.sel = wrapped;
    try { sel = wrapped; } catch (e) {}
  }
  hookMyp();
  try { if (typeof cats === 'function') cats(); } catch (e) {}
  try { ensureSeed(); } catch (e) {}
})();
