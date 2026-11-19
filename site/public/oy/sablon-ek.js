/* Evrak Asistanı · ek şablonlar. Yayıncı: Eyüp ŞEKER.
   Metinler özgün taslaktır. Öğrenme çıktısı kodu üretilmez; öğretmen tymm.meb.gov.tr metnini kendisi yazar.
   Doldurulan öğrenci bilgisi yalnızca bu cihazda, oy_f_* anahtarında kalır. */
(function () {
  'use strict';
  if (typeof OY === 'undefined' || !OY.T) return;
  function varMi(id) { return OY.T.some(function (t) { return t.id === id; }); }
  function ekle(t) { if (!varMi(t.id)) OY.T.push(t); }
  function satir(s) { return String(s || '').split(/\n/).map(function (x) { return x.trim(); }).filter(Boolean); }
  function yil(f) { return (f && f.egitim_yili) || '2026-2027'; }
  function ust(p, baslik, f) {
    var b = (OY.resmiUst ? OY.resmiUst(p || {}) : [{ t: 'center', x: 'T.C.' }]).slice();
    b.push({ t: 'h1', x: (yil(f) + ' EĞİTİM-ÖĞRETİM YILI ' + baslik).toLocaleUpperCase('tr-TR') });
    return b;
  }
  function imza(adlar) { return { t: 'sign', names: adlar }; }
  function not(x) { return { t: 'note', x: x }; }
  var NOT_CIHAZ = 'Öğrenciye ait bilgi bu cihazda kalır; sunucuya veya yapay zekâya gönderilmez. T.C. kimlik numarası yazılmamalıdır.';
  var NOT_MAARIF = 'Başlıklar Türkiye Yüzyılı Maarif Modeli öğretim programlarının ortak çerçevesine göredir (öğrenme çıktıları ve süreç bileşenleri, alan becerileri, kavramsal beceriler, eğilimler, sosyal-duygusal öğrenme becerileri, değerler, okuryazarlıklar, içerik çerçevesi, öğrenme-öğretme yaşantıları, farklılaştırma, öğrenme kanıtları). Çıktı kodu bu form tarafından üretilmez; güncel metin tymm.meb.gov.tr üzerinden alınmalıdır.';
  var NOT_KULUP = 'Kulüp ve toplum hizmeti çalışmaları danışman öğretmen gözetiminde yürütülür. Kayıtlar okulun sosyal etkinlik dosyasında ve ilgili modülde izlenir. Çıktıyı kullanmadan önce kurumunuzun güncel evrak düzenini kontrol ediniz.';
  var KULUP = (window.OYX && OYX.KULUPLER && OYX.KULUPLER.length) ? OYX.KULUPLER.slice() : ['Diğer (yazınız)'];
  function kulupAd(f) {
    if (!f || !f.kulup || f.kulup === 'Diğer (yazınız)') return (f && f.kulupDiger) || '…………';
    return f.kulup;
  }
  function ogretmen(p, f) { return (f && (f.ogretmen || f.danisman)) || (p && p.ad) || '……………………'; }

  ekle({
    id: 'mm_unite', kat: 'Maarif Modeli', baslik: 'Maarif Modeli Ünite / Tema Planı',
    kaynak: NOT_MAARIF,
    alan: [
      { k: 'ders', l: 'Ders' }, { k: 'sinif', l: 'Sınıf' }, { k: 'unite', l: 'Ünite / tema adı' },
      { k: 'sure', l: 'Öngörülen süre (ders saati)' },
      { k: 'ciktilar', l: 'Öğrenme çıktıları (kodu programdan aynen yazın; boş bırakılabilir)', type: 'area' },
      { k: 'surec', l: 'Süreç bileşenleri', type: 'area' },
      { k: 'alan_beceri', l: 'Alan becerileri', type: 'area' },
      { k: 'kavramsal', l: 'Kavramsal beceriler', type: 'area' },
      { k: 'egilim', l: 'Eğilimler', type: 'area' },
      { k: 'sdo', l: 'Sosyal-duygusal öğrenme becerileri', type: 'area' },
      { k: 'deger', l: 'Değerler', type: 'area' },
      { k: 'okuryazar', l: 'Okuryazarlıklar', type: 'area' },
      { k: 'icerik', l: 'İçerik çerçevesi', type: 'area' },
      { k: 'kabuller', l: 'Temel kabuller', type: 'area' },
      { k: 'on_deger', l: 'Ön değerlendirme', type: 'area' },
      { k: 'kopru', l: 'Köprü kurma', type: 'area' },
      { k: 'uygulama', l: 'Öğrenme-öğretme uygulamaları', type: 'area' },
      { k: 'farkli', l: 'Farklılaştırma (zenginleştirme / destekleme)', type: 'area' },
      { k: 'kanit', l: 'Öğrenme kanıtları', type: 'area' }
    ],
    build: function (p, f) {
      f = f || {};
      var o = ust(p, 'Ünite / Tema Planı', f);
      o.push({ t: 'kv', rows: [
        ['Ders', f.ders || (p && p.brans) || '…………'],
        ['Sınıf', f.sinif || (p && p.sinif) || '…………'],
        ['Ünite / tema', f.unite || '…………'],
        ['Süre', f.sure || '…………'],
        ['Öğretmen', ogretmen(p, f)]
      ]});
      function bolum(ad, metin) {
        o.push({ t: 'h2', x: ad });
        var L = satir(metin);
        o.push(L.length ? { t: 'ul', items: L } : { t: 'p', x: '…………………………………………' });
      }
      bolum('ÖĞRENME ÇIKTILARI', f.ciktilar);
      bolum('SÜREÇ BİLEŞENLERİ', f.surec);
      bolum('ALAN BECERİLERİ', f.alan_beceri);
      bolum('KAVRAMSAL BECERİLER', f.kavramsal);
      bolum('EĞİLİMLER', f.egilim);
      bolum('SOSYAL-DUYGUSAL ÖĞRENME BECERİLERİ', f.sdo);
      bolum('DEĞERLER', f.deger);
      bolum('OKURYAZARLIKLAR', f.okuryazar);
      bolum('İÇERİK ÇERÇEVESİ', f.icerik);
      bolum('TEMEL KABULLER', f.kabuller);
      bolum('ÖN DEĞERLENDİRME', f.on_deger);
      bolum('KÖPRÜ KURMA', f.kopru);
      bolum('ÖĞRENME-ÖĞRETME UYGULAMALARI', f.uygulama);
      bolum('FARKLILAŞTIRMA', f.farkli);
      bolum('ÖĞRENME KANITLARI', f.kanit);
      o.push(not(NOT_MAARIF));
      o.push(imza([ogretmen(p, f) + '\nÖğretmen', (p && p.mudur) || '……………………\nOkul müdürü']));
      return o;
    }
  });

  ekle({
    id: 'mm_cikti', kat: 'Maarif Modeli', baslik: 'Öğrenme Çıktısı İzleme Formu',
    kaynak: NOT_MAARIF,
    alan: [
      { k: 'ders', l: 'Ders' }, { k: 'sinif', l: 'Sınıf / şube' }, { k: 'unite', l: 'Ünite / tema' },
      { k: 'ciktilar', l: 'İzlenecek çıktılar (her satıra bir; kodu varsa programdan kopyalayın)', type: 'area' },
      { k: 'gozlem', l: 'Gözlem / kanıt notu', type: 'area' }
    ],
    build: function (p, f) {
      f = f || {};
      var o = ust(p, 'Öğrenme Çıktısı İzleme Formu', f);
      o.push({ t: 'kv', rows: [['Ders', f.ders || '…………'], ['Sınıf', f.sinif || '…………'], ['Ünite / tema', f.unite || '…………'], ['Öğretmen', ogretmen(p, f)]] });
      var L = satir(f.ciktilar);
      if (!L.length) L = ['', '', ''];
      o.push({ t: 'table', head: ['Öğrenme çıktısı (programdan)', 'Gözlem', 'Kanıt', 'Durum'], rows: L.map(function (c) { return [c, '', '', '']; }) });
      if (f.gozlem) o.push({ t: 'p', x: f.gozlem });
      o.push(not('Durum sütununa öğretmen kendi ifadesini yazar (örneğin gözlendi / gelişiyor). Bu sözcükler resmî kod değildir. ' + NOT_CIHAZ));
      o.push(not(NOT_MAARIF));
      o.push(imza([ogretmen(p, f) + '\nÖğretmen']));
      return o;
    }
  });

  ekle({
    id: 'mm_beceri', kat: 'Maarif Modeli', baslik: 'Beceri Temelli Değerlendirme Formu',
    kaynak: NOT_MAARIF,
    alan: [
      { k: 'ders', l: 'Ders' }, { k: 'sinif', l: 'Sınıf / şube' },
      { k: 'beceri', l: 'İzlenecek beceri (alan becerisi veya kavramsal beceri)' },
      { k: 'cikti', l: 'İlişkili öğrenme çıktısı (programdan; kod uydurmayın)', type: 'area' },
      { k: 'kanit', l: 'Beklenen öğrenme kanıtı', type: 'area' },
      { k: 'duzey', l: 'Düzey adları (virgülle; resmî liste değildir)', ph: 'Gözlenmedi, Gelişiyor, Yeterli' },
      { k: 'ogrenciler', l: 'Öğrenci (ad yerine numara önerilir, her satıra bir)', type: 'area' }
    ],
    build: function (p, f) {
      f = f || {};
      var o = ust(p, 'Beceri Temelli Değerlendirme Formu', f);
      var duz = String(f.duzey || 'Gözlenmedi, Gelişiyor, Yeterli').split(/\s*,\s*/).filter(Boolean);
      o.push({ t: 'kv', rows: [
        ['Ders', f.ders || '…………'], ['Sınıf', f.sinif || '…………'],
        ['Beceri', f.beceri || '…………'], ['Öğretmen', ogretmen(p, f)]
      ]});
      o.push({ t: 'h2', x: 'ÖĞRENME ÇIKTISI' });
      o.push({ t: 'p', x: f.cikti || '…………………………………………' });
      o.push({ t: 'h2', x: 'ÖĞRENME KANITI' });
      o.push({ t: 'p', x: f.kanit || '…………………………………………' });
      var ogr = satir(f.ogrenciler);
      if (!ogr.length) ogr = ['', '', ''];
      o.push({ t: 'table', head: ['Öğrenci (no)'].concat(duz).concat(['Kısa not']), rows: ogr.map(function (a) { return [a].concat(duz.map(function () { return ''; })).concat(['']); }) });
      o.push(not(NOT_CIHAZ + ' ' + NOT_MAARIF));
      o.push(imza([ogretmen(p, f) + '\nÖğretmen']));
      return o;
    }
  });

  ekle({
    id: 'mm_kanit', kat: 'Maarif Modeli', baslik: 'Öğrenme Kanıtı Formu',
    kaynak: NOT_MAARIF,
    alan: [
      { k: 'ders', l: 'Ders' }, { k: 'sinif', l: 'Sınıf' }, { k: 'unite', l: 'Ünite / tema' },
      { k: 'cikti', l: 'Öğrenme çıktısı', type: 'area' },
      { k: 'tur', l: 'Kanıt türü', type: 'select', opts: ['Gözlem', 'Ürün dosyası', 'Performans', 'Öz değerlendirme', 'Akran değerlendirmesi', 'Kısa yoklama', 'Diğer'] },
      { k: 'aciklama', l: 'Kanıtın açıklaması', type: 'area' },
      { k: 'sonuc', l: 'Öğretmen değerlendirmesi', type: 'area' }
    ],
    build: function (p, f) {
      f = f || {};
      var o = ust(p, 'Öğrenme Kanıtı Formu', f);
      o.push({ t: 'kv', rows: [
        ['Ders', f.ders || '…………'], ['Sınıf', f.sinif || '…………'], ['Ünite / tema', f.unite || '…………'],
        ['Kanıt türü', f.tur || '…………'], ['Öğretmen', ogretmen(p, f)]
      ]});
      o.push({ t: 'h2', x: 'ÖĞRENME ÇIKTISI' });
      o.push({ t: 'p', x: f.cikti || '…………………………………………' });
      o.push({ t: 'h2', x: 'KANIT' });
      o.push({ t: 'p', x: f.aciklama || '…………………………………………' });
      o.push({ t: 'h2', x: 'DEĞERLENDİRME' });
      o.push({ t: 'p', x: f.sonuc || '…………………………………………' });
      o.push(not(NOT_MAARIF));
      o.push(imza([ogretmen(p, f) + '\nÖğretmen']));
      return o;
    }
  });

  ekle({
    id: 'mm_surec', kat: 'Maarif Modeli', baslik: 'Süreç Değerlendirme Formu',
    kaynak: NOT_MAARIF,
    alan: [
      { k: 'ders', l: 'Ders' }, { k: 'sinif', l: 'Sınıf' }, { k: 'unite', l: 'Ünite / tema' },
      { k: 'surec', l: 'İzlenen süreç bileşenleri (her satıra bir)', type: 'area' },
      { k: 'gozlem', l: 'Süreç boyunca gözlem', type: 'area' },
      { k: 'destek', l: 'Destekleme / zenginleştirme kararı', type: 'area' }
    ],
    build: function (p, f) {
      f = f || {};
      var o = ust(p, 'Süreç Değerlendirme Formu', f);
      o.push({ t: 'kv', rows: [['Ders', f.ders || '…………'], ['Sınıf', f.sinif || '…………'], ['Ünite / tema', f.unite || '…………'], ['Öğretmen', ogretmen(p, f)]] });
      var L = satir(f.surec); if (!L.length) L = ['', '', ''];
      o.push({ t: 'table', head: ['Süreç bileşeni', 'Gözlendi', 'Not'], rows: L.map(function (x) { return [x, '', '']; }) });
      o.push({ t: 'h2', x: 'GÖZLEM' });
      o.push({ t: 'p', x: f.gozlem || '…………………………………………' });
      o.push({ t: 'h2', x: 'DESTEKLEME / ZENGİNLEŞTİRME' });
      o.push({ t: 'p', x: f.destek || '…………………………………………' });
      o.push(not(NOT_MAARIF));
      o.push(imza([ogretmen(p, f) + '\nÖğretmen']));
      return o;
    }
  });

  ekle({
    id: 'egz_haftalik', kat: 'Kurs ve Egzersiz', baslik: 'Haftalık Egzersiz / DYK Çalışma Planı',
    kaynak: 'Ders dışı eğitim ve destekleme çalışmaları için tek haftalık plan. Konu ve çıktı öğretmen tarafından yazılır; kod üretilmez. Tam dönem planı ayrıca “Egzersiz çalışma planı” ve “DYK ve İYEP” araçlarındadır.',
    alan: [
      { k: 'tur', l: 'Plan türü', type: 'select', opts: ['Egzersiz (ders dışı eğitim)', 'DYK', 'İYEP', 'Haftalık çalışma'] },
      { k: 'ders', l: 'Ders / alan' }, { k: 'sinif', l: 'Sınıf' },
      { k: 'hafta', l: 'Ders yılı haftası' },
      { k: 'baslangic', l: 'Hafta başlangıcı', type: 'date' },
      { k: 'bitis', l: 'Hafta bitişi', type: 'date' },
      { k: 'konu', l: 'Bu haftanın konusu', type: 'area' },
      { k: 'cikti', l: 'Öğrenme çıktısı (programdan kopyalayın)', type: 'area' },
      { k: 'etkinlik', l: 'Çalışma adımları (her satıra bir)', type: 'area' },
      { k: 'sure', l: 'Süre (ders saati)' },
      { k: 'olcme', l: 'Ölçme ve geri bildirim', type: 'area' }
    ],
    build: function (p, f) {
      f = f || {};
      var o = ust(p, (f.tur || 'Haftalık çalışma') + ' Planı', f);
      o.push({ t: 'kv', rows: [
        ['Tür', f.tur || 'Haftalık çalışma'],
        ['Ders / alan', f.ders || '…………'],
        ['Sınıf', f.sinif || '…………'],
        ['Hafta', f.hafta || '…………'],
        ['Tarih', (f.baslangic || '……') + ' – ' + (f.bitis || '……')],
        ['Süre', f.sure || '…………'],
        ['Öğretmen', ogretmen(p, f)]
      ]});
      o.push({ t: 'h2', x: 'KONU' });
      o.push({ t: 'p', x: f.konu || '…………………………………………' });
      o.push({ t: 'h2', x: 'ÖĞRENME ÇIKTISI' });
      o.push({ t: 'p', x: f.cikti || '…………………………………………' });
      var adim = satir(f.etkinlik); if (!adim.length) adim = ['Isınma ve hatırlatma', 'Çalışma', 'Pekiştirme', 'Kısa değerlendirme'];
      o.push({ t: 'h2', x: 'ÇALIŞMA ADIMLARI' });
      o.push({ t: 'ol', items: adim });
      o.push({ t: 'h2', x: 'ÖLÇME' });
      o.push({ t: 'p', x: f.olcme || '…………………………………………' });
      o.push(not('Adımlar örnek iskelettir; dersinize göre değiştirin. Çıktı kodu yazılmamıştır. Ders dışı eğitimde haftalık süre sınırını okulunuzun duyurusundan kontrol ediniz.'));
      o.push(imza([ogretmen(p, f) + '\nÖğretmen']));
      return o;
    }
  });

  function kulupAlan(ek) {
    return [{ k: 'kulup', l: 'Kulüp', type: 'select', opts: KULUP }, { k: 'kulupDiger', l: 'Diğer kulüp adı' }].concat(ek);
  }
  ekle({
    id: 'kulup_toplanti', kat: 'Sosyal Etkinlik ve Kulüp', baslik: 'Kulüp Toplantı Tutanağı',
    kaynak: NOT_KULUP,
    alan: kulupAlan([
      { k: 'tarih', l: 'Tarih', type: 'date' }, { k: 'saat', l: 'Saat' }, { k: 'yer', l: 'Yer' },
      { k: 'gundem', l: 'Gündem (her satıra bir)', type: 'area' },
      { k: 'gorus', l: 'Görüşülenler', type: 'area' },
      { k: 'kararlar', l: 'Kararlar (her satıra bir)', type: 'area' },
      { k: 'katilan', l: 'Katılanlar (ad yerine görev yazılabilir)', type: 'area' }
    ]),
    build: function (p, f) {
      f = f || {};
      var o = ust(p, 'Kulüp Toplantı Tutanağı', f);
      o.push({ t: 'kv', rows: [
        ['Kulüp', kulupAd(f)], ['Tarih', f.tarih || '…………'], ['Saat', f.saat || '…………'], ['Yer', f.yer || '…………'],
        ['Danışman', ogretmen(p, f)]
      ]});
      var g = satir(f.gundem); o.push({ t: 'h2', x: 'GÜNDEM' }); o.push({ t: 'ol', items: g.length ? g : ['………………'] });
      o.push({ t: 'h2', x: 'GÖRÜŞÜLENLER' }); o.push({ t: 'p', x: f.gorus || '…………………………………………' });
      var k = satir(f.kararlar); o.push({ t: 'h2', x: 'KARARLAR' }); o.push({ t: 'ol', items: k.length ? k : ['………………'] });
      var kat = satir(f.katilan); o.push({ t: 'h2', x: 'KATILANLAR' });
      o.push({ t: 'ul', items: kat.length ? kat : ['Danışman öğretmen', 'Öğrenci temsilcisi'] });
      o.push(not(NOT_KULUP + ' ' + NOT_CIHAZ));
      o.push(imza([ogretmen(p, f) + '\nDanışman öğretmen', '……………………\nÖğrenci temsilcisi']));
      return o;
    }
  });

  ekle({
    id: 'kulup_katilim', kat: 'Sosyal Etkinlik ve Kulüp', baslik: 'Öğrenci Kulüp Katılım Listesi',
    kaynak: NOT_KULUP,
    alan: kulupAlan([
      { k: 'etkinlik', l: 'Etkinlik' }, { k: 'tarih', l: 'Tarih', type: 'date' },
      { k: 'liste', l: 'Katılanlar (her satır: ad veya numara)', type: 'area' }
    ]),
    build: function (p, f) {
      f = f || {};
      var o = ust(p, 'Öğrenci Kulüp Katılım Listesi', f);
      o.push({ t: 'kv', rows: [['Kulüp', kulupAd(f)], ['Etkinlik', f.etkinlik || '…………'], ['Tarih', f.tarih || '…………'], ['Danışman', ogretmen(p, f)]] });
      var L = satir(f.liste); if (!L.length) L = ['', '', '', '', ''];
      o.push({ t: 'table', head: ['Sıra', 'Ad veya numara', 'İmza'], rows: L.map(function (a, i) { return [String(i + 1), a, '']; }) });
      o.push(not(NOT_CIHAZ));
      o.push(imza([ogretmen(p, f) + '\nDanışman öğretmen']));
      return o;
    }
  });

  ekle({
    id: 'kulup_toplum', kat: 'Sosyal Etkinlik ve Kulüp', baslik: 'Toplum Hizmeti Çalışması Formu',
    kaynak: NOT_KULUP,
    alan: kulupAlan([
      { k: 'etkinlik', l: 'Çalışmanın adı' }, { k: 'tarih', l: 'Tarih', type: 'date' }, { k: 'yer', l: 'Yer' },
      { k: 'amac', l: 'Amaç', type: 'area' }, { k: 'yapilan', l: 'Yapılan iş', type: 'area' },
      { k: 'sayi', l: 'Katılan öğrenci sayısı (isim zorunlu değil)' },
      { k: 'isbirligi', l: 'İş birliği yapılan kurum (yoksa boş bırakın)' },
      { k: 'sonuc', l: 'Sonuç', type: 'area' }
    ]),
    build: function (p, f) {
      f = f || {};
      var o = ust(p, 'Toplum Hizmeti Çalışması', f);
      o.push({ t: 'kv', rows: [
        ['Kulüp', kulupAd(f)], ['Çalışma', f.etkinlik || '…………'], ['Tarih', f.tarih || '…………'], ['Yer', f.yer || '…………'],
        ['Katılan öğrenci sayısı', f.sayi || '…………'], ['İş birliği', f.isbirligi || '—'], ['Danışman', ogretmen(p, f)]
      ]});
      o.push({ t: 'h2', x: 'AMAÇ' }); o.push({ t: 'p', x: f.amac || '…………………………………………' });
      o.push({ t: 'h2', x: 'YAPILAN İŞ' }); o.push({ t: 'p', x: f.yapilan || '…………………………………………' });
      o.push({ t: 'h2', x: 'SONUÇ' }); o.push({ t: 'p', x: f.sonuc || '…………………………………………' });
      o.push(not(NOT_KULUP));
      o.push(imza([ogretmen(p, f) + '\nDanışman öğretmen', ((p && p.mudur) || '……………………') + '\nOkul müdürü']));
      return o;
    }
  });

  ekle({
    id: 'kulup_yilsonu', kat: 'Sosyal Etkinlik ve Kulüp', baslik: 'Kulüp Yıl Sonu Raporu',
    kaynak: NOT_KULUP,
    alan: kulupAlan([
      { k: 'amac', l: 'Kulübün amacı', type: 'area' },
      { k: 'yapilan', l: 'Yıl boyunca yapılan çalışmalar', type: 'area' },
      { k: 'toplum', l: 'Toplum hizmeti çalışmaları', type: 'area' },
      { k: 'katilim', l: 'Katılım özeti (sayı; isim listesi gerekmez)', type: 'area' },
      { k: 'sorun', l: 'Karşılaşılan sorunlar', type: 'area' },
      { k: 'oneri', l: 'Sonraki yıl için öneriler', type: 'area' }
    ]),
    build: function (p, f) {
      f = f || {};
      var o = ust(p, 'Kulüp Yıl Sonu Raporu', f);
      o.push({ t: 'kv', rows: [['Kulüp', kulupAd(f)], ['Danışman', ogretmen(p, f)]] });
      function b(ad, m) { o.push({ t: 'h2', x: ad }); o.push({ t: 'p', x: m || '…………………………………………' }); }
      b('AMAÇ', f.amac); b('YAPILAN ÇALIŞMALAR', f.yapilan); b('TOPLUM HİZMETİ', f.toplum);
      b('KATILIM', f.katilim); b('SORUNLAR', f.sorun); b('SONRAKİ YIL', f.oneri);
      o.push(not(NOT_KULUP));
      o.push(imza([ogretmen(p, f) + '\nDanışman öğretmen', ((p && p.mudur) || '……………………') + '\nOkul müdürü']));
      return o;
    }
  });

  ekle({
    id: 'kulup_belge', kat: 'Sosyal Etkinlik ve Kulüp', baslik: 'Kulüp Katılım / Teşekkür Belgesi',
    kaynak: NOT_KULUP,
    alan: kulupAlan([
      { k: 'belge', l: 'Belge türü', type: 'select', opts: ['Katılım belgesi', 'Teşekkür belgesi'] },
      { k: 'ogrenci', l: 'Öğrencinin adı (isteğe bağlı)' },
      { k: 'etkinlik', l: 'Etkinlik veya dönem' },
      { k: 'tarih', l: 'Tarih', type: 'date' }
    ]),
    build: function (p, f) {
      f = f || {};
      var o = ust(p, f.belge || 'Katılım belgesi', f);
      var ad = f.ogrenci || '…………………………';
      o.push({ t: 'p', x: ad + ', ' + yil(f) + ' eğitim-öğretim yılında ' + kulupAd(f) + ' çalışmalarına (' + (f.etkinlik || 'yıl içi etkinlikler') + ') katılmıştır.' });
      o.push({ t: 'p', x: 'Bu belge, danışman öğretmenin beyanına dayanır ve resmî transkript yerine geçmez.' });
      o.push({ t: 'kv', rows: [['Tarih', f.tarih || '…………'], ['Kulüp', kulupAd(f)]] });
      o.push(not(NOT_CIHAZ));
      o.push(imza([ogretmen(p, f) + '\nDanışman öğretmen', ((p && p.mudur) || '……………………') + '\nOkul müdürü']));
      return o;
    }
  });

  ekle({
    id: 'rehber_etkinlik', kat: 'Rehberlik', baslik: 'Sınıf Rehberlik Etkinlik Formu',
    kaynak: 'Sınıf rehberlik etkinliği için özgün form. Kazanım metnini güncel sınıf rehberlik programından yazınız; bu form kod üretmez.',
    alan: [
      { k: 'sinif', l: 'Sınıf / şube' }, { k: 'tarih', l: 'Tarih', type: 'date' }, { k: 'sure', l: 'Süre (dakika)' },
      { k: 'etkinlik', l: 'Etkinliğin adı' },
      { k: 'amac', l: 'Amaç / kazanım (programdan)', type: 'area' },
      { k: 'yontem', l: 'Yöntem ve akış', type: 'area' },
      { k: 'deger', l: 'Değerlendirme', type: 'area' }
    ],
    build: function (p, f) {
      f = f || {};
      var o = ust(p, 'Sınıf Rehberlik Etkinlik Formu', f);
      o.push({ t: 'kv', rows: [
        ['Sınıf', f.sinif || (p && p.sinif) || '…………'], ['Tarih', f.tarih || '…………'],
        ['Süre', f.sure || '…………'], ['Etkinlik', f.etkinlik || '…………'], ['Öğretmen', ogretmen(p, f)]
      ]});
      o.push({ t: 'h2', x: 'AMAÇ' }); o.push({ t: 'p', x: f.amac || '…………………………………………' });
      o.push({ t: 'h2', x: 'AKIŞ' }); o.push({ t: 'p', x: f.yontem || '…………………………………………' });
      o.push({ t: 'h2', x: 'DEĞERLENDİRME' }); o.push({ t: 'p', x: f.deger || '…………………………………………' });
      o.push(not('Öğrenci adı yazılmadan, sınıf düzeyinde tutulması önerilir. ' + NOT_CIHAZ));
      o.push(imza([ogretmen(p, f) + '\nSınıf rehber öğretmeni']));
      return o;
    }
  });

  var NOT_BE = 'İşletmelerde beceri eğitimi; alan şefi ve koordinatör öğretmenin izlemesi, devam, değerlendirme ve ücret belgelerinin okulda saklanmasıyla yürür. Madde numarası yazılmamıştır; güncel mesleki eğitim mevzuatını esas alınız. ' + NOT_CIHAZ;
  var KAT_BE = 'Alan Şefliği Dosyası';
  function beKv(p, f, ekstra) {
    return { t: 'kv', rows: [['Alan', f.alan || '…………'], ['İşyeri', f.isyeri || '…………'], ['Dönem / ay', f.donem || f.ay || '…………'], ['Koordinatör / alan şefi', ogretmen(p, f)]].concat(ekstra || []) };
  }
  ekle({
    id: 'be_devam', kat: KAT_BE, baslik: 'İşyeri devam cetveli',
    kaynak: NOT_BE,
    alan: [
      { k: 'alan', l: 'Alan / dal' }, { k: 'isyeri', l: 'İşyeri' }, { k: 'ay', l: 'Ay' },
      { k: 'satirlar', l: 'Her satır: numara veya ad | devam günü | özür | not (T.C. kimlik yazmayın)', type: 'area' }
    ],
    build: function (p, f) {
      f = f || {};
      var o = ust(p, 'İşyeri Devam Cetveli', f);
      o.push(beKv(p, f));
      var L = satir(f.satirlar); if (!L.length) L = ['', '', ''];
      o.push({ t: 'table', head: ['Sıra', 'Öğrenci (no veya ad)', 'Devam günü', 'Özür', 'Not'], rows: L.map(function (s, i) {
        var c = s.split(/\s*\|\s*/); return [String(i + 1), c[0] || '', c[1] || '', c[2] || '', c[3] || ''];
      }) });
      o.push(not(NOT_BE));
      o.push(imza([ogretmen(p, f) + '\nKoordinatör öğretmen']));
      return o;
    }
  });
  ekle({
    id: 'be_gun', kat: KAT_BE, baslik: 'Koordinatör gün notu',
    kaynak: NOT_BE,
    alan: [
      { k: 'tarih', l: 'Tarih', type: 'date' }, { k: 'alan', l: 'Alan' }, { k: 'isyeri', l: 'İşyeri' }, { k: 'yetkili', l: 'Görüşülen yetkili' },
      { k: 'sayi', l: 'Görülen öğrenci sayısı' },
      { k: 'gozlem', l: 'Gözlem (iş güvenliği, usta öğretici, devam)', type: 'area' },
      { k: 'eksik', l: 'Eksik ve öneri', type: 'area' }
    ],
    build: function (p, f) {
      f = f || {};
      var o = ust(p, 'Koordinatör Gün Notu', f);
      o.push({ t: 'kv', rows: [['Tarih', f.tarih || '…………'], ['Alan', f.alan || '…………'], ['İşyeri', f.isyeri || '…………'], ['Yetkili', f.yetkili || '…………'], ['Öğrenci sayısı', f.sayi || '…………'], ['Koordinatör', ogretmen(p, f)]] });
      o.push({ t: 'h2', x: 'GÖZLEM' }); o.push({ t: 'p', x: f.gozlem || '…………………………………………' });
      o.push({ t: 'h2', x: 'EKSİK VE ÖNERİ' }); o.push({ t: 'p', x: f.eksik || '…………………………………………' });
      o.push(not(NOT_BE));
      o.push(imza([ogretmen(p, f) + '\nKoordinatör öğretmen']));
      return o;
    }
  });
  ekle({
    id: 'be_ay', kat: KAT_BE, baslik: 'Koordinatör ay özeti',
    kaynak: NOT_BE,
    alan: [
      { k: 'ay', l: 'Ay' }, { k: 'alan', l: 'Alan' },
      { k: 'isyeriSayi', l: 'İzlenen işyeri sayısı' }, { k: 'ziyaret', l: 'Ziyaret sayısı' },
      { k: 'devam', l: 'Devamda görülen durum', type: 'area' },
      { k: 'ucret', l: 'Ücret belgesi durumu (tutar yazmayabilirsiniz)', type: 'area' },
      { k: 'sonuc', l: 'Ay değerlendirmesi', type: 'area' }
    ],
    build: function (p, f) {
      f = f || {};
      var o = ust(p, 'Koordinatör Ay Özeti', f);
      o.push({ t: 'kv', rows: [['Ay', f.ay || '…………'], ['Alan', f.alan || '…………'], ['İşyeri sayısı', f.isyeriSayi || '…………'], ['Ziyaret', f.ziyaret || '…………'], ['Koordinatör', ogretmen(p, f)]] });
      o.push({ t: 'h2', x: 'DEVAM' }); o.push({ t: 'p', x: f.devam || '…………………………………………' });
      o.push({ t: 'h2', x: 'ÜCRET BELGESİ' }); o.push({ t: 'p', x: f.ucret || '…………………………………………' });
      o.push({ t: 'h2', x: 'DEĞERLENDİRME' }); o.push({ t: 'p', x: f.sonuc || '…………………………………………' });
      o.push(not(NOT_BE));
      o.push(imza([ogretmen(p, f) + '\nKoordinatör öğretmen', ((p && p.mudur) || '……………………') + '\nOkul müdürü']));
      return o;
    }
  });
  ekle({
    id: 'be_not', kat: KAT_BE, baslik: 'Beceri dönemi değerlendirme fişi',
    kaynak: NOT_BE,
    alan: [
      { k: 'donem', l: 'Dönem' }, { k: 'alan', l: 'Alan / dal' }, { k: 'isyeri', l: 'İşyeri' },
      { k: 'ogrenci', l: 'Öğrenci (numara önerilir)' }, { k: 'usta', l: 'Usta öğretici görüşü', type: 'area' },
      { k: 'koord', l: 'Koordinatör değerlendirmesi', type: 'area' }
    ],
    build: function (p, f) {
      f = f || {};
      var o = ust(p, 'Beceri Dönemi Değerlendirme Fişi', f);
      o.push(beKv(p, f, [['Öğrenci', f.ogrenci || '…………']]));
      o.push({ t: 'h2', x: 'USTA ÖĞRETİCİ GÖRÜŞÜ' }); o.push({ t: 'p', x: f.usta || '…………………………………………' });
      o.push({ t: 'h2', x: 'KOORDİNATÖR DEĞERLENDİRMESİ' }); o.push({ t: 'p', x: f.koord || '…………………………………………' });
      o.push({ t: 'table', head: ['Başlık', 'Not (e-Okul’a elle işlenir)'], rows: [['Uygulama', ''], ['İş güvenliği ve devam', ''], ['Genel', '']] });
      o.push(not('Bu fiş taslaktır; not e-Okul’a sizin onayınızla işlenir. ' + NOT_BE));
      o.push(imza([ogretmen(p, f) + '\nKoordinatör öğretmen']));
      return o;
    }
  });
  ekle({
    id: 'be_fesih', kat: KAT_BE, baslik: 'Eğitim sözleşmesi sonlandırma yazısı',
    kaynak: NOT_BE,
    alan: [
      { k: 'tarih', l: 'Tarih', type: 'date' }, { k: 'alan', l: 'Alan' }, { k: 'isyeri', l: 'İşyeri' },
      { k: 'ogrenci', l: 'Öğrenci (numara veya ad)' }, { k: 'gerekce', l: 'Gerekçe', type: 'area' },
      { k: 'yon', l: 'Yazı kime', type: 'select', opts: ['İşyerine', 'Okul müdürlüğüne', 'Veliye bilgi'] }
    ],
    build: function (p, f) {
      f = f || {};
      var o = ust(p, 'Eğitim Sözleşmesi Sonlandırma Yazısı', f);
      o.push({ t: 'p', x: (f.yon || 'İşyerine') + ' iletilmek üzere.' });
      o.push(beKv(p, f, [['Öğrenci', f.ogrenci || '…………'], ['Tarih', f.tarih || '…………']]));
      o.push({ t: 'p', x: 'Yukarıda belirtilen öğrencinin işyerindeki beceri eğitimi ilişkisi, aşağıda yazılan gerekçeyle sonlandırılmak istenmektedir. Okul, işyeri ve veli aynı bilgiyi almalıdır.' });
      o.push({ t: 'h2', x: 'GEREKÇE' }); o.push({ t: 'p', x: f.gerekce || '…………………………………………' });
      o.push(not(NOT_BE));
      o.push(imza([ogretmen(p, f) + '\nAlan şefi / koordinatör', ((p && p.mudur) || '……………………') + '\nOkul müdürü']));
      return o;
    }
  });
  ekle({
    id: 'be_dekont', kat: KAT_BE, baslik: 'Ücret dekont izleme listesi',
    kaynak: NOT_BE,
    alan: [
      { k: 'ay', l: 'Ay' }, { k: 'alan', l: 'Alan' },
      { k: 'satirlar', l: 'Her satır: öğrenci no | işyeri | dekont tarihi | durum (geldi / gelmedi)', type: 'area' }
    ],
    build: function (p, f) {
      f = f || {};
      var o = ust(p, 'Ücret Dekont İzleme Listesi', f);
      o.push({ t: 'kv', rows: [['Ay', f.ay || '…………'], ['Alan', f.alan || '…………'], ['İzleyen', ogretmen(p, f)]] });
      var L = satir(f.satirlar); if (!L.length) L = ['', '', ''];
      o.push({ t: 'table', head: ['Sıra', 'Öğrenci no', 'İşyeri', 'Dekont tarihi', 'Durum'], rows: L.map(function (s, i) {
        var c = s.split(/\s*\|\s*/); return [String(i + 1), c[0] || '', c[1] || '', c[2] || '', c[3] || ''];
      }) });
      o.push(not('Tutar bu listede zorunlu değildir. Belge okulda saklanır. ' + NOT_CIHAZ));
      o.push(imza([ogretmen(p, f) + '\nAlan şefi']));
      return o;
    }
  });
  ekle({
    id: 'be_dagilim', kat: KAT_BE, baslik: 'İşyeri öğrenci dağılım tablosu',
    kaynak: NOT_BE,
    alan: [
      { k: 'alan', l: 'Alan' }, { k: 'donem', l: 'Dönem' },
      { k: 'satirlar', l: 'Her satır: işyeri | kontenjan | kayıtlı öğrenci sayısı | koordinatör', type: 'area' }
    ],
    build: function (p, f) {
      f = f || {};
      var o = ust(p, 'İşyeri Öğrenci Dağılım Tablosu', f);
      o.push({ t: 'kv', rows: [['Alan', f.alan || '…………'], ['Dönem', f.donem || '…………'], ['Alan şefi', ogretmen(p, f)]] });
      var L = satir(f.satirlar); if (!L.length) L = ['', '', ''];
      o.push({ t: 'table', head: ['İşyeri', 'Kontenjan', 'Kayıtlı öğrenci', 'Koordinatör'], rows: L.map(function (s) {
        var c = s.split(/\s*\|\s*/); return [c[0] || '', c[1] || '', c[2] || '', c[3] || ''];
      }) });
      o.push(not(NOT_BE));
      o.push(imza([ogretmen(p, f) + '\nAlan şefi', ((p && p.mudur) || '……………………') + '\nOkul müdürü']));
      return o;
    }
  });
  ekle({
    id: 'be_ziyaret', kat: KAT_BE, baslik: 'İşyeri izleme tutanağı',
    kaynak: NOT_BE,
    alan: [
      { k: 'tarih', l: 'Tarih', type: 'date' }, { k: 'alan', l: 'Alan' }, { k: 'isyeri', l: 'İşyeri' }, { k: 'yetkili', l: 'İşyeri yetkilisi' },
      { k: 'sayi', l: 'Görülen öğrenci sayısı' },
      { k: 'tespit', l: 'Tespit (güvenlik, eğitim, devam)', type: 'area' },
      { k: 'oneri', l: 'Öneri', type: 'area' }
    ],
    build: function (p, f) {
      f = f || {};
      var o = ust(p, 'İşyeri İzleme Tutanağı', f);
      o.push({ t: 'kv', rows: [['Tarih', f.tarih || '…………'], ['Alan', f.alan || '…………'], ['İşyeri', f.isyeri || '…………'], ['Yetkili', f.yetkili || '…………'], ['Öğrenci sayısı', f.sayi || '…………'], ['İzleyen', ogretmen(p, f)]] });
      o.push({ t: 'h2', x: 'TESPİT' }); o.push({ t: 'p', x: f.tespit || '…………………………………………' });
      o.push({ t: 'h2', x: 'ÖNERİ' }); o.push({ t: 'p', x: f.oneri || '…………………………………………' });
      o.push(not(NOT_BE));
      o.push(imza([ogretmen(p, f) + '\nKoordinatör öğretmen', (f.yetkili || '……………………') + '\nİşyeri yetkilisi']));
      return o;
    }
  });
  ekle({
    id: 'be_plan', kat: KAT_BE, baslik: 'Alan şefliği yıllık iş planı',
    kaynak: NOT_BE,
    alan: [
      { k: 'alan', l: 'Alan' }, { k: 'donem', l: 'Eğitim yılı' },
      { k: 'isler', l: 'Her satır: ay | iş (sözleşme, dağılım, ziyaret, değerlendirme, dekont)', type: 'area' }
    ],
    build: function (p, f) {
      f = f || {};
      var o = ust(p, 'Alan Şefliği Yıllık İş Planı', f);
      o.push({ t: 'kv', rows: [['Alan', f.alan || '…………'], ['Eğitim yılı', f.donem || yil(f)], ['Alan şefi', ogretmen(p, f)]] });
      var L = satir(f.isler);
      var aylar = ['Eylül', 'Ekim', 'Kasım', 'Aralık', 'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran'];
      if (!L.length) L = aylar.map(function (a) { return a + ' | '; });
      o.push({ t: 'table', head: ['Ay', 'İş'], rows: L.map(function (s) {
        var c = s.split(/\s*\|\s*/); return [c[0] || '', c.slice(1).join(' | ') || ''];
      }) });
      o.push(not(NOT_BE));
      o.push(imza([ogretmen(p, f) + '\nAlan şefi', ((p && p.mudur) || '……………………') + '\nOkul müdürü']));
      return o;
    }
  });
  ekle({
    id: 'sg_istek', kat: 'Sınav Görev Yazışması', baslik: 'Merkezî sınav görev isteği',
    kaynak: 'Öğretmenin sınav görevi isteğini okula iletmesi için özgün dilekçe. Görevlendirme kararı idarededir.',
    alan: [
      { k: 'tarih', l: 'Tarih', type: 'date' }, { k: 'sinav', l: 'Sınavın adı' },
      { k: 'aralik', l: 'Tarih aralığı' },
      { k: 'tur', l: 'İstenen görev', type: 'select', opts: ['Gözetmen', 'Yedek gözetmen', 'Bina görevi', 'Sınav koordinasyonu'] },
      { k: 'tercih', l: 'Tercih veya açıklama', type: 'area' }
    ],
    build: function (p, f) {
      f = f || {};
      var o = ust(p, 'Merkezî Sınav Görev İsteği', f);
      o.push({ t: 'p', x: (p && p.okul ? p.okul + ' Müdürlüğüne' : 'Okul Müdürlüğüne') });
      o.push({ t: 'kv', rows: [['Öğretmen', ogretmen(p, f)], ['Branş', (p && p.brans) || '…………'], ['Sınav', f.sinav || '…………'], ['Tarih aralığı', f.aralik || '…………'], ['İstenen görev', f.tur || 'Gözetmen'], ['Yazı tarihi', f.tarih || '…………']] });
      o.push({ t: 'p', x: 'Belirtilen sınavda görev almak istiyorum. Görevlendirme okulun ve ilgili merciin kararıdır; bu yazı yalnızca isteği bildirir.' });
      o.push({ t: 'h2', x: 'AÇIKLAMA' }); o.push({ t: 'p', x: f.tercih || '…………………………………………' });
      o.push(imza([ogretmen(p, f) + '\nÖğretmen']));
      return o;
    }
  });
  ekle({
    id: 'sg_izleme', kat: 'Sınav Görev Yazışması', baslik: 'Görev isteği izleme listesi',
    kaynak: 'İdare veya öğretmen, iletilen görev isteklerinin durumunu bu cihazda izler.',
    alan: [
      { k: 'sinav', l: 'Sınav' },
      { k: 'satirlar', l: 'Her satır: öğretmen | istenen görev | durum (yazıldı / iletildi / görev geldi / gelmedi)', type: 'area' }
    ],
    build: function (p, f) {
      f = f || {};
      var o = ust(p, 'Görev İsteği İzleme Listesi', f);
      o.push({ t: 'kv', rows: [['Sınav', f.sinav || '…………'], ['Tutan', ogretmen(p, f)]] });
      var L = satir(f.satirlar); if (!L.length) L = ['', '', ''];
      o.push({ t: 'table', head: ['Öğretmen', 'İstenen görev', 'Durum'], rows: L.map(function (s) {
        var c = s.split(/\s*\|\s*/); return [c[0] || '', c[1] || '', c[2] || ''];
      }) });
      o.push(not('Liste bu cihazda kalır. Görevlendirme yazısı idare tarafından ayrıca düzenlenir.'));
      return o;
    }
  });

  if (typeof cats === 'function') { try { cats(); } catch (e) {} }
})();
