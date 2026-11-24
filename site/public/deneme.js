/* 48 saatlik deneme anahtarı formu. API: api.otonomevrak.com/v1/deneme */
(function () {
  var API = "https://api.otonomevrak.com/v1/deneme";
  var form = document.getElementById("deneme-formu");
  var durum = document.getElementById("deneme-durum");
  var sonuc = document.getElementById("deneme-sonuc");
  var anahtarEl = document.getElementById("deneme-anahtar");
  var kopyala = document.getElementById("deneme-kopyala");
  if (!form || !durum || !sonuc || !anahtarEl) return;
  function goster(msg, ok) {
    durum.hidden = false;
    durum.textContent = msg;
    durum.setAttribute("data-ok", ok ? "1" : "0");
  }
  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    sonuc.hidden = true;
    goster("Gönderiliyor…", true);
    var fd = new FormData(form);
    var govde = {
      urun: String(fd.get("urun") || ""),
      kurum_kodu: String(fd.get("kurum_kodu") || ""),
      eposta: String(fd.get("eposta") || ""),
      ad: String(fd.get("ad") || "")
    };
    fetch(API, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(govde)
    }).then(function (r) {
      return r.json().then(function (j) { return { r: r, j: j }; }).catch(function () {
        return { r: r, j: {} };
      });
    }).then(function (x) {
      if (!x.r.ok || !x.j.anahtar) {
        goster(x.j.hata || "Deneme anahtarı alınamadı.", false);
        return;
      }
      anahtarEl.textContent = x.j.anahtar;
      sonuc.hidden = false;
      goster("Anahtar oluşturuldu. 48 saat, en fazla 2 cihaz.", true);
    }).catch(function () {
      goster("Bağlantı hatası. Bir süre sonra yeniden deneyin.", false);
    });
  });
  if (kopyala) kopyala.addEventListener("click", function () {
    var t = anahtarEl.textContent || "";
    if (!t) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(t).then(function () { kopyala.textContent = "Kopyalandı"; });
    }
  });
})();
