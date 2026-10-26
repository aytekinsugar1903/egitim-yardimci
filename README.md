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
| `.nojekyll` | Pages'in dosyaları olduğu gibi sunması için |

Her iki uygulama da telefona "Ana ekrana ekle" ile kurulabilir ve service worker sayesinde çevrimdışı açılır. Gizlilik metni her uygulamanın kendi `gizlilik.html` dosyasındadır.

## Önemli

- Bu depo **kaynak kod değildir**; derleme çıktısıdır. Değişiklik asıl uygulama deposunda yapılır, sonra derlenmiş dosyalar buraya kopyalanır. Burada elle düzenleme yapma.
- Güncelleme sonrası eski sürümün önbellekte kalmaması için `sw.js` içindeki önbellek adı/sürümü değişmiş olmalı.
- **KVKK:** Bu depoya gerçek öğrenci, veli ya da personel verisi (liste, not, fotoğraf, dışa aktarılmış Excel) asla eklenmez. Uygulamalar veriyi kullanıcının cihazında tutar.

## Yerelde deneme

```bash
python3 -m http.server 8080
# http://localhost:8080/
```
