/* Evrak Asistanı · Rehberlik PWA depo ayırıcı. Yayıncı: Eyüp ŞEKER.
   ÖY / MYP ile aynı alan adında (otonomevrak.com) çalıştığı için bu uygulamanın localStorage ve IndexedDB
   kayıtları kendi önekiyle tutulur (rh: / srh:). Veriler yalnız bu cihazda kalır; hiçbir yere gönderilmez. */
(function () {
  'use strict';
  var s = document.currentScript, ON = (s && s.getAttribute('data-onek')) || 'rh', P = ON + ':';
  var ls; try { ls = window.localStorage; } catch (e) { return; }
  if (!ls || window.__eaDepoAyir) return;
  function anahtarlar() { var a = []; for (var i = 0; i < ls.length; i++) { var k = ls.key(i); if (k && k.indexOf(P) === 0) a.push(k.slice(P.length)); } return a; }
  var S = {
    getItem: function (k) { return ls.getItem(P + k); },
    setItem: function (k, v) { ls.setItem(P + k, String(v)); },
    removeItem: function (k) { ls.removeItem(P + k); },
    clear: function () { anahtarlar().forEach(function (k) { ls.removeItem(P + k); }); },
    key: function (i) { var a = anahtarlar(); return a[i] == null ? null : a[i]; }
  };
  Object.defineProperty(S, 'length', { get: function () { return anahtarlar().length; }, configurable: true });
  var prox = new Proxy(S, {
    get: function (t, k) { if (k in t) return t[k]; if (typeof k !== 'string') return undefined; var v = ls.getItem(P + k); return v === null ? undefined : v; },
    set: function (t, k, v) { if (typeof k === 'string' && !(k in t)) ls.setItem(P + k, String(v)); return true; },
    deleteProperty: function (t, k) { if (typeof k === 'string') ls.removeItem(P + k); return true; },
    has: function (t, k) { return (k in t) || (typeof k === 'string' && ls.getItem(P + k) !== null); },
    ownKeys: function () { return anahtarlar(); },
    getOwnPropertyDescriptor: function (t, k) { var v = typeof k === 'string' ? ls.getItem(P + k) : null; return v === null ? undefined : { value: v, writable: true, enumerable: true, configurable: true }; }
  });
  try {
    Object.defineProperty(window, 'localStorage', { configurable: true, enumerable: true, get: function () { return prox; } });
  } catch (e) { console.warn('depo ayrılamadı', e); return; }
  try {
    var idb = window.indexedDB, ac = idb.open.bind(idb), sil = idb.deleteDatabase.bind(idb);
    idb.open = function (ad) { var a = [].slice.call(arguments); a[0] = P + ad; return ac.apply(null, a); };
    idb.deleteDatabase = function (ad) { return sil(P + ad); };
  } catch (e) {}
  window.__eaDepoAyir = P;
})();
