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

1.0.9 güncelleme paketi Öğretmen Yardımcısı 1.10.5 getirir: Sınav Hazırlama bölümü (Bloom'a göre komut, yapıştır-ayrıştır, onay ekranı, yazılı kâğıdı / rubrik / cevap anahtarı / A-B grubu, uygulamalı ders formu). Kurulu paketler bunu `manifest.json` üzerinden alır. Kurulum exe 1.0.7 olarak durur; exe yeniden üretilmedi.

1.0.10 güncelleme paketi Öğretmen Yardımcısı 1.10.6 getirir: Karne Görüşü bölümü (e-Okul sınıf listesi içe aktarma, ölçüt seçimi, yerel cümle bankası, isteğe bağlı yapay zekâ komutu, düzenleme tablosu ve Excel çıktısı; öğrenci verisi cihazda kalır, komutta ad/numara yoktur). Kurulu paketler bunu `manifest.json` üzerinden alır. Kurulum exe 1.0.7 olarak durur; exe yeniden üretilmedi.

1.0.11 güncelleme paketi Öğretmen Yardımcısı 1.10.7 getirir: TDE hazırlık (Sözün Ebrusu) ve TDE 10 (Nesillerin Mirası) eksik öğrenme çıktıları tamamlandı; Coğrafya 11–12 için resmi 2 saatlik dağılım eklendi (öğretmen yıllık planda 2 veya 4 saat seçer); tema saatleri resmi programdaki `h` alanıyla haftalara dağılır (saat yoksa çıktı sayısına düşer); Tarih 11 ünite adı resmi biçime çekildi; Beden Eğitimi / Müzik / Görsel Sanatlar'da yazılı yerine uygulamalı sınav zümre kararıyla (OOY md. 45/f) seçenek oldu; kurul ve zümre takvimi Kurullar ve Zümreler Yönergesi'ne göre güncellendi. MYP 1.12.3, Not Girişi 1.9.2. Kurulu paketler bunu `manifest.json` üzerinden alır. Kurulum exe 1.0.7 olarak durur; exe yeniden üretilmedi.



1.11.0 Öğretmen Yardımcısı: Ders dışı egzersiz planı sihirbazı; sınav analizi (klasik/test, OYSS Excel, yerel); DYK/İYEP kurs planı (takvim ve kazanım yerleşimi); sosyal kulüp yıllık planı ve aylık faaliyet raporu; BEP/ZEP sihirbazı; çocuk kulübü planı; performans rubriği Excel çıktısı. MYP 1.12.3 ve Not Girişi aynı. Canlı yayın 1.11.1 / Okul Paketi 1.0.13 ile yapıldı.

1.11.1 Öğretmen Yardımcısı: Saat sütunu çalışma saat aralığını gösterir (süre ile karışmaz); ara tatil/yarıyıl bitişik hafta sonları ve 2026-2027 Ramazan (9–11 Mart) ile Kurban (16–19 Mayıs, arefe 8 Mart ve 15 Mayıs) takvimi tamamlandı; sınav analizinde boş artçı sorular budanır; yazdırma sayfa kırılımları iyileştirildi. 1.11.0 araçları aynıdır.

1.0.13 güncelleme paketi ve kurulum exe Öğretmen Yardımcısı 1.11.1 getirir (yukarıdaki plan araçları ve çıktı cilası). MYP 1.12.3, Not Girişi 1.9.2 değişmedi. Kurulu paketler bunu `manifest.json` üzerinden alır. Yeni kurulum için `EvrakAsistani-OkulPaketi-Kurulum-1.0.13.exe` kullanılır; 1.0.7 exe depoda durur.

1.12.2 Öğretmen Yardımcısı (Okul Paketi 1.0.19'daki ÖY üzerine): Sınıf İçi Ölçme ve Değerlendirme Kütüphanesi (`olcme-kutuphanesi.js` v1.0.1). Öğretmen ODSGM kılavuz PDF'lerini ekler; metin cihazda IndexedDB'de (`oy_olcme_kutuphanesi_v1`) tutulur; sayfa numarasıyla arama; 7 türde taslak (etkinlik, açık uçlu araç, dereceli puanlama anahtarı, öz/akran değerlendirme, geri bildirim, destekleme-zenginleştirme). Harici API yok. `site/public/oy` (otonomevrak.com) ve `oy/` (GitHub Pages) aynı. Aynı sürümde ÖY ve MYP profil branş listesine sınıf öğretmenliği ve 28 genel ders eklendi (liste dışı branş elle yazılabilir, iki listenin üst üste açılması giderildi); `site/public/myp` ve `myp/` Okul Paketi 1.0.19'daki MYP'ye çekildi (SheetJS `</script>` sızması düzeltmesi siteye de geldi), önbellek `myp-1.12.3-1124brans`. Okul Paketi güncelleme zip'i henüz üretilmedi; taranmış PDF için OCR ve öğrenme çıktısı kataloğu sonraki aşama.

## Önemli

- Bu depo **kaynak kod değildir**; derleme çıktısıdır. Değişiklik asıl uygulama deposunda yapılır, sonra derlenmiş dosyalar buraya kopyalanır. Burada elle düzenleme yapma.
- Güncelleme sonrası eski sürümün önbellekte kalmaması için `sw.js` içindeki önbellek adı/sürümü değişmiş olmalı.
- **KVKK:** Bu depoya gerçek öğrenci, veli ya da personel verisi (liste, not, fotoğraf, dışa aktarılmış Excel) asla eklenmez. Uygulamalar veriyi kullanıcının cihazında tutar.

## Yerelde deneme

```bash
python3 -m http.server 8080
# http://localhost:8080/
```

1.12.1 Öğretmen Yardımcısı: Ölçme ve Değerlendirme Yönetmeliği değişikliği (RG 14.11.2026). Sınav analizinde öğrenci/şube/okul sıralaması veya derece yok, şube bazlı analiz duruyor (md.4/1-g). Okul öncesi veya 1–4. sınıf seçilince sınav oluşturma, analiz ve sınav hazırlama akışlarında “Yönetmelik gereği okul öncesi ve ilkokulda sınav yapılmaz” uyarısı (md.4/1-b). Yapay zekâ soru önerisi uyarısına not: resmî sınav soruları için yalnızca Bakanlıkça uygun görülen araçlar kullanılabilir (md.4/1-h). 1.12.0 rehberlik araçları ve 1.11.1 plan araçları duruyor. MYP 1.12.3 ve Not Girişi 1.9.11 aynı. Rehberlik Yardımcısı ayrı üründür, bu pakete ve bu deponun güncelleme manifestine dahil edilmez.

1.0.15 güncelleme paketi ve kurulum exe Öğretmen Yardımcısı 1.12.1 getirir. MYP 1.12.3 ve Not Girişi 1.9.11 değişmedi. Kurulu paketler bunu `manifest.json` üzerinden alır (canlıya alınması ayrı onay ister). Yeni kurulum için `EvrakAsistani-OkulPaketi-Kurulum-1.0.15.exe` kullanılır; 1.0.14, 1.0.13 ve 1.0.7 exe depoda durur.

1.12.0 Öğretmen Yardımcısı: Sınıf Listelerim, rehberlik formlarında öğrenci seçimi, Rehberlik Kayıtlarım, sosyometri / Kimdir Bu?, sınıf risk haritası, bireysel görüşme, sınıf rehberlik yıllık planı, aylık ve yıl sonu rapor, BEP hedef havuzu (74 örnek). 1.11.1 plan araçları duruyor. MYP 1.12.3 aynı; Not Girişi 1.9.11 (OYSS ve sınıf listesi aktarımı). Rehberlik Yardımcısı ayrı üründür, bu pakete ve bu deponun güncelleme manifestine dahil edilmez.

1.0.14 güncelleme paketi ve kurulum exe Öğretmen Yardımcısı 1.12.0 ve Not Girişi 1.9.11 getirir. MYP 1.12.3 değişmedi. Kurulu paketler bunu `manifest.json` üzerinden alır. Yeni kurulum için `EvrakAsistani-OkulPaketi-Kurulum-1.0.14.exe` kullanılır; 1.0.13 ve 1.0.7 exe depoda durur.
