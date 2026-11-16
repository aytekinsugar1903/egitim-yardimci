/* Evrak Asistanı · ÖY 1.12.1 BEP / ZEP örnek hedef havuzu. Yayıncı: Eyüp ŞEKER.
   Özgün ifadelerdir; resmî amaç listesi değildir. Her satır "[Alan] hedef" biçimindedir.
   Öğretmen havuzu düzenlerse cihazdaki kendi havuzu (oy_bep_havuz) kullanılır. */
(function (root) {
'use strict';
var BEP = {
  'Okuma-yazma': [
    'Sesleri duyduğunda karşılık gelen harfi gösterebilme',
    'Harfleri birleştirerek iki heceli sözcükleri okuyabilme',
    'Kısa ve basit cümleleri hecelemeden okuyabilme',
    'Okuduğu kısa metinle ilgili "kim, ne, nerede" sorularını yanıtlayabilme',
    'Okuduğu metnin ana fikrini bir cümleyle söyleyebilme',
    'Dakikada belirlenen sayıda sözcüğü doğru okuyabilme',
    'Büyük ve küçük harfleri satır çizgisine uygun yazabilme',
    'Dikte edilen sözcükleri doğru yazabilme',
    'Cümle başında büyük harf, sonunda nokta kullanabilme',
    'Bir resmi anlatan üç-dört cümlelik kısa bir paragraf yazabilme'
  ],
  'Dinleme-konuşma': [
    'Kendisine söylenen tek basamaklı yönergeyi yerine getirebilme',
    'İki-üç basamaklı yönergeyi sırasıyla yerine getirebilme',
    'Dinlediği kısa öyküdeki olayları sıralayabilme',
    'Gereksinimlerini tam cümleyle ifade edebilme',
    'Konuşma sırasını bekleyerek sohbete katılabilme',
    'Yaşadığı bir olayı başı, ortası ve sonu olacak biçimde anlatabilme',
    'Sınıf önünde kısa bir sunum yapabilme',
    'Anlamadığı yerde yardım ya da açıklama isteyebilme'
  ],
  'Matematik': [
    'Ritmik olarak 1\'den 100\'e kadar sayabilme',
    'Nesne sayısını rakamla eşleştirebilme',
    'Sayıları büyükten küçüğe ve küçükten büyüğe sıralayabilme',
    'Onluk ve birlikleri ayırt ederek iki basamaklı sayıları okuyabilme',
    'Eldesiz toplama işlemi yapabilme',
    'Onluk bozmadan çıkarma işlemi yapabilme',
    'Eldeli toplama ve onluk bozarak çıkarma işlemi yapabilme',
    'Çarpım tablosunu ezbere ya da desteğe bakarak kullanabilme',
    'Tek basamaklı bölen ile bölme işlemi yapabilme',
    'Paraları tanıyıp basit alışveriş hesabı yapabilme',
    'Saati tam ve yarım olarak okuyabilme',
    'Tek işlem gerektiren problemi çözebilme',
    'Basit kesirleri (yarım, çeyrek) modelle gösterebilme',
    'Uzunluk ve ağırlık ölçülerini günlük nesnelerle karşılaştırabilme'
  ],
  'Hayat bilgisi / fen / sosyal': [
    'Vücudunun temel bölümlerini ve işlevlerini söyleyebilme',
    'Mevsimlerin özelliklerini ayırt edebilme',
    'Trafik işaretlerini tanıyıp güvenli geçiş yapabilme',
    'Acil durumlarda kimden ve nasıl yardım isteyeceğini söyleyebilme',
    'Canlı ve cansız varlıkları sınıflandırabilme',
    'Basit bir deneyi yönergeyle adım adım yapabilme',
    'Yaşadığı yerin ve okulunun adresini söyleyebilme'
  ],
  'Öz bakım ve günlük yaşam': [
    'Ellerini doğru biçimde yıkayıp kurulayabilme',
    'Giysilerini mevsime uygun seçip giyebilme',
    'Ayakkabısını bağlayabilme',
    'Okul eşyalarını düzenli tutup çantasını hazırlayabilme',
    'Ders programına bakarak günlük hazırlığını yapabilme',
    'Beslenmesini masada uygun biçimde yiyebilme',
    'Kişisel bilgilerini (ad, soyad, telefon) söyleyebilme'
  ],
  'Sosyal beceriler': [
    'Selamlaşma, teşekkür etme ve özür dileme ifadelerini yerinde kullanabilme',
    'Grup oyununda sırasını bekleyebilme',
    'Malzemesini arkadaşlarıyla paylaşabilme',
    'Arkadaşının duygusunu yüz ifadesinden tahmin edebilme',
    'Bir anlaşmazlıkta öfkesini sözle ifade edebilme',
    'Grup çalışmasında kendisine verilen görevi tamamlayabilme',
    'Yeni bir arkadaşla tanışıp sohbet başlatabilme'
  ],
  'Dikkat ve davranış': [
    'Belirlenen süre boyunca göreve dikkatini verebilme',
    'Sınıf kurallarını söyleyip uygulayabilme',
    'Etkinlik değişikliklerine uyum sağlayabilme',
    'Söz almak için el kaldırıp beklemeyi sürdürebilme',
    'Başladığı çalışmayı yardım almadan tamamlayabilme',
    'Zorlandığında uygun yolla (mola isteme, yardım isteme) tepki verebilme',
    'Ödevlerini ajandasına kaydedip zamanında teslim edebilme'
  ],
  'İnce motor': [
    'Kalemi doğru tutarak çizgi çalışmalarını yapabilme',
    'Makasla düz ve eğri çizgiler üzerinden kesebilme',
    'Şekilleri sınır dışına taşmadan boyayabilme',
    'Düğme ilikleyip fermuar kapatabilme',
    'Küçük nesneleri parmak uçlarıyla kavrayıp yerleştirebilme'
  ],
  'Kaba motor': [
    'Dengesini koruyarak düz bir çizgi üzerinde yürüyebilme',
    'Topu hedefe atıp tutabilme',
    'Merdiveni ayakları değişerek inip çıkabilme',
    'Çift ayak sıçrayarak ilerleyebilme'
  ],
  'Çalışma becerisi': [
    'Ders araç-gerecini derse hazır getirebilme',
    'Bir metindeki önemli yerleri işaretleyebilme',
    'Kısa not alıp notlarından tekrar yapabilme',
    'Sınavda soruları sırayla okuyup yanıtlayabilme',
    'Uyarlanmış ödevi yönergeye bakarak yapabilme'
  ]
};
var ZEP = {
  'Derinleştirme': [
    'Konuyu farklı kaynaklardan karşılaştırarak derinleştirebilme',
    'Bir kavramı başka disiplinlerle ilişkilendirebilme',
    'Üst düzey bir problemi adım adım çözebilme',
    'Bir konudaki farklı görüşleri gerekçeleriyle değerlendirebilme'
  ],
  'Araştırma ve üretim': [
    'Bir araştırma sorusu belirleyip plan yapabilme',
    'Veri toplayıp tablo ve grafikle yorumlayabilme',
    'Özgün bir ürün veya proje tasarlayabilme',
    'Ürününü ölçütlere göre değerlendirip geliştirebilme'
  ],
  'İletişim ve liderlik': [
    'Öğrendiğini akranlarına açıklayarak aktarabilme',
    'Bir grup çalışmasında görev dağılımı yapıp yürütebilme',
    'Çalışmasını izleyiciye uygun biçimde sunabilme',
    'Akran geri bildirimini dinleyip çalışmasına yansıtabilme'
  ],
  'Yaratıcı düşünme': [
    'Bir soruna en az üç farklı çözüm önerisi geliştirebilme',
    'Alışılmış bir nesneye yeni kullanım alanları bulabilme',
    'Kendi öğrenme hedefini belirleyip izleyebilme'
  ]
};
function duz(o) { var a = []; Object.keys(o).forEach(function (k) { o[k].forEach(function (h) { a.push('[' + k + '] ' + h); }); }); return a; }
root.OY_BEP_HAVUZ = { BEP: duz(BEP), ZEP: duz(ZEP) };
})(typeof window !== 'undefined' ? window : this);
