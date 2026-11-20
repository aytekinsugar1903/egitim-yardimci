# Eğitim Yardımcı – ortak sunucu (Cloudflare Worker "egitim-yardimci" + D1 "egitim-sync")
- PWA: /oy/ (Öğretmen Yardımcısı), /myp/ (Müdür Yardımcısı Paneli); gizlilik: /oy/gizlilik, /myp/gizlilik
- API: /api/register, /api/login, /api/logout, /api/sync, /api/delete-account (PBKDF2-SHA256 100k, oturum 180 gün, IP/e-posta hız sınırı)
- Yıllık MEB verisi: public/data/meb-YYYY-YYYY.json; uygulamalar /data/meb-guncel.json'ı okur.
  Yeni yıl: yeni dosyayı hazırlayın (yil, versiyon, takvim{bas,son,yariyil_bas,tatilHafta,gun,bgh}, belirli_aylik, sinav_kurallari, tubitak_4006_takvim, myp_takvim, myp_bgh), meb-guncel.json'a kopyalayın, `npx wrangler deploy`. Uygulama güncellemesi gerekmez (bir sonraki açılışta ya da "Şimdi uygula" ile geçerli).
- Yayıncı adı/e-posta/yıl: client/yayinci.json (tek yer) → her iki uygulamanın build.js'i ve Android www kopyası yeniden üretilmeli.
- İstemci modülleri: client/eysync.js (MEB verisi + hesap + eşitleme), client/native.js (Android indir/paylaş/yazdır, PWA).
- Mevzuat hızlı başvuru: client/mevzuat.json (uygulamaya gömülü) + public/data/mevzuat.json (güncel). Güncellemek için "versiyon"u artırıp ikisini de değiştirin, `npx wrangler deploy` + Pages deploy; uygulamalar daha yeni sürümü indirip önbelleğe alır.
- Ortak öğretmen formları: client/formlar.js (aylık rapor, pansiyon, evde eğitim, destek eğitim odası) – her iki uygulamada.
- Yıllık plan hazır tema başlıkları: /workspace/oy/tymm_uniteler.json (tymm.meb.gov.tr'den yalnızca ünite/tema başlıkları, 16.10.2026).
