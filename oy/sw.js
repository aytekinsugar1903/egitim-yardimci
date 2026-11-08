const C='oy-1.10.3-1793100008';const F=['./','gizlilik','gizlilik.html','lib/yerel.json','lib/pdfjs/pdf.min.mjs','lib/pdfjs/pdf.worker.min.mjs','manifest.webmanifest','icon-192.png','icon-512.png','qr.js','jsqr.js','xlsx.js'];
// iOS Safari, servis çalışanının yönlendirilmiş (redirected) yanıt vermesini reddeder; bu yüzden yönlendirilmiş yanıtlar temiz bir kopyaya çevrilir.
function clean(r){if(!r||!r.redirected)return Promise.resolve(r);return r.blob().then(b=>new Response(b,{status:r.status,statusText:r.statusText,headers:r.headers}))}
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>Promise.all(F.map(u=>fetch(u,{cache:'reload'}).then(clean).then(r=>r&&r.ok?c.put(u,r):null).catch(()=>null)))));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==location.origin||u.pathname.startsWith('/api/')||u.pathname.startsWith('/data/'))return;
 e.respondWith(fetch(e.request).then(clean).then(r=>{if(r.ok){const cl=r.clone();caches.open(C).then(c=>c.put(e.request,cl))}return r}).catch(()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||(e.request.mode==='navigate'?caches.match('./'):undefined)).then(clean)))});
