/* Rehberlik Yardımcısı PWA servis çalışanı (çevrimdışı). ÖY/MYP ile aynı kalıp; yalnız kendi önbelleğini (rhpwa-) yönetir. */
const ONEK='rhpwa-';const C=ONEK+'1.1.2-1798001120';const F=["./", "gizlilik.html", "lib/yerel.json", "lib/pdfjs/pdf.min.mjs", "lib/pdfjs/pdf.worker.min.mjs", "manifest.webmanifest", "icon-192.png", "icon-512.png", "qr.js", "jsqr.js", "xlsx.js", "planlar.js", "planlar-ui.js", "bep-havuz.js", "ng-cozumle.js", "ekler.js", "rehberlik-ek.js", "paket.js", "lisans.js", "lisans-ui.js", "lisans.html", "depo-ayir.js", "pwa-kur.js", "kurulum.html", "icon-180.png"];
// iOS Safari, servis çalışanının yönlendirilmiş (redirected) yanıt vermesini reddeder; bu yüzden yönlendirilmiş yanıtlar temiz bir kopyaya çevrilir.
function clean(r){if(!r||!r.redirected)return Promise.resolve(r);return r.blob().then(b=>new Response(b,{status:r.status,statusText:r.statusText,headers:r.headers}))}
function doldur(){return caches.open(C).then(c=>Promise.all(F.map(u=>fetch(u,{cache:'reload'}).then(clean).then(r=>r&&r.ok?c.put(u,r):null).catch(()=>null))))}
self.addEventListener('install',e=>{e.waitUntil(doldur());self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x.startsWith(ONEK)&&x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
// Aynı alan adındaki başka bir uygulama önbelleği silmişse sayfa açılışında yeniden doldurulur.
self.addEventListener('message',e=>{if(e.data==='onbellek')e.waitUntil(caches.has(C).then(v=>v?caches.open(C).then(c=>c.match('./')).then(m=>m?null:doldur()):doldur()))});
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==location.origin||u.pathname.startsWith('/api/')||u.pathname.startsWith('/data/'))return;
 e.respondWith(fetch(e.request).then(clean).then(r=>{if(r.ok){const cl=r.clone();caches.open(C).then(c=>c.put(e.request,cl))}return r}).catch(()=>caches.open(C).then(c=>c.match(e.request,{ignoreSearch:true}).then(r=>r||(e.request.mode==='navigate'?c.match('./'):undefined))).then(clean)))});
