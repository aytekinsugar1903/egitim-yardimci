# Eğitim Yardımcı

Öğretmen Yardımcısı (OY) ve Müdür Yardımcısı Paneli (MYP) uygulamalarının **derlenmiş, statik yansısı**. GitHub Pages ile yayınlanır:

- Giriş: https://aytekinsugar1903.github.io/egitim-yardimci/
- Öğretmen Yardımcısı: https://aytekinsugar1903.github.io/egitim-yardimci/oy/
- Müdür Yardımcısı Paneli: https://aytekinsugar1903.github.io/egitim-yardimci/myp/

## İçerik

| Klasör | Ne var |
| --- | --- |
| `index.html` | İki uygulamaya bağlantı veren giriş sayfası |
| `oy/` | Öğretmen Yardımcısı PWA (index, service worker, manifest, ikonlar, gizlilik) |
| `myp/` | Müdür Yardımcısı Paneli PWA (aynı yapı) |
| `ortak/` | Paylaşılan çevrimdışı kitaplıklar: Tesseract 5.1.1 + Türkçe dil verisi (OY/MYP fotoğraftan yazı okuma) |
| `oy/lib/`, `myp/lib/` | pdf.js 4.10.38 (PDF okuma internetsiz) |
| `okul-paketi/` | Okul Paketi (Windows): kurulum `.exe`, güncelleme paketi `.zip` ve `manifest.json` |
| `.nojekyll` | Pages'in dosyaları olduğu gibi sunması için |

Her iki uygulama da telefona "Ana ekrana ekle" ile kurulabilir ve service worker sayesinde çevrimdışı açılır. Gizlilik metni her uygulamanın kendi `gizlilik.html` dosyasındadır.

## Okul Paketi güncelleme adresi

Kurulu Okul Paketi'nin başlatıcısı (1.0.3 ve sonrası) güncellemeyi şu adresten denetler:
`https://aytekinsugar1903.github.io/egitim-yardimci/okul-paketi/manifest.json`

`manifest.json` → `{"surum","paket","sha256","not"}`. Başlatıcı yalnız daha yeni `surum` görürse paketi indirir, SHA256'yı doğrular,
`www` ve `NotGirisi` klasörlerini değiştirir; kullanıcı verisine dokunmaz. Yeni sürüm: GELISTIRME'de
`python3 scripts/paketle.py --kurulum <önceki kurulum.exe> --test --depo <bu depo>` → commit → push.
1.0.2 kurulumlarında adres yer tutucudur; o bilgisayarlara güncel kurulum (okul-paketi/ içindeki .exe) bir kez elle kurulmalıdır.

1.0.7 kurulum exe'si Not Girişi 1.9.1, ÖY 1.10.4 ve MYP 1.12.3 içerir; başlatıcı Windows GUI olarak derlenir (kısayolda siyah konsol penceresi açılmaz) ve ÖY/MYP açılışında yükleniyor ekranı gösterir. Siyah pencere düzeltmesi için 1.0.7 kurulum exe'sinin çalıştırılması gerekir (yalnız güncelleme başlatıcıyı değiştirmez).

1.0.8 güncelleme paketi Not Girişi 1.9.2 getirir (panel ve Not sekmesi sağ kenarda, birlikte yukarı-aşağı taşınır). Kurulu paketler bunu `manifest.json` üzerinden alır. Kurulum exe 1.0.7 olarak durur; exe yeniden üretilmedi.

## Önemli

- Bu depo **kaynak kod değildir**; derleme çıktısıdır. Değişiklik asıl uygulama deposunda yapılır, sonra derlenmiş dosyalar buraya kopyalanır. Burada elle düzenleme yapma.
- Güncelleme sonrası eski sürümün önbellekte kalmaması için `sw.js` içindeki önbellek adı/sürümü değişmiş olmalı.
- **KVKK:** Bu depoya gerçek öğrenci, veli ya da personel verisi (liste, not, fotoğraf, dışa aktarılmış Excel) asla eklenmez. Uygulamalar veriyi kullanıcının cihazında tutar.

## Yerelde deneme

```bash
python3 -m http.server 8080
# http://localhost:8080/
```
