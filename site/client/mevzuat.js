/* Mevzuat hızlı başvuru — çevrimdışı dizin (mevzuat.json). Özetler özgün ifadedir. */
var MZ=(function(){
function data(){var d=MZDEF;try{var c=JSON.parse(localStorage.getItem('mz_data')||'null');if(c&&c.versiyon&&c.versiyon>d.versiyon)d=c;}catch(e){}return d;}
function upd(){try{if(!navigator.onLine||typeof EY_BASE==='undefined')return;fetch(EY_BASE+'/data/mevzuat.json',{cache:'no-cache'}).then(function(r){return r.ok?r.json():null}).then(function(j){if(j&&j.maddeler&&j.versiyon>data().versiyon)localStorage.setItem('mz_data',JSON.stringify(j));}).catch(function(){});}catch(e){}}
function low(s){return String(s||'').toLocaleLowerCase('tr-TR');}
function ara(q,k){var d=data(),w=low(q).split(/\s+/).filter(Boolean);return d.maddeler.filter(function(m){if(k&&m.k!==k)return false;var t=low(m.m+' '+m.o+' '+m.e+' '+(d.kaynaklar[m.k]||{}).ad);return w.every(function(x){return t.indexOf(x)>=0;});});}
function el(t,a,txt){var e=document.createElement(t);for(var k in a||{})e.setAttribute(k,a[k]);if(txt!=null)e.textContent=txt;return e;}
function ui(box){upd();var d=data();box.innerHTML='';box.appendChild(el('h2',{},'Mevzuat Hızlı Başvuru'));
box.appendChild(el('p',{class:'noprint'},'Anahtar kelime yazın (ör. "itiraz", "devamsızlık", "evde eğitim"). Özetler kendi ifademizdir, resmî metin değildir; işlem yapmadan önce bağlantıdaki güncel metni kontrol edin. Dizin sürümü: '+d.versiyon));
var row=el('div',{class:'bar'}),q=el('input',{id:'mzQ',type:'search',placeholder:'Ara…','aria-label':'Mevzuatta ara',style:'flex:1;min-width:200px;font-size:18px;padding:8px'}),s=el('select',{id:'mzK','aria-label':'Kaynak'});
s.appendChild(el('option',{value:''},'Tüm mevzuat'));Object.keys(d.kaynaklar).forEach(function(k){s.appendChild(el('option',{value:k},d.kaynaklar[k].ad));});row.appendChild(q);row.appendChild(s);box.appendChild(row);
var out=el('div',{id:'mzOut'});box.appendChild(out);
function go(){var r=ara(q.value,s.value);out.innerHTML='';out.appendChild(el('p',{id:'mzSay'},r.length+' sonuç'));r.forEach(function(m){var k=d.kaynaklar[m.k]||{},c=el('div',{class:'mzc',style:'border:2px solid #000;padding:10px;margin:8px 0;background:#fff;color:#000'});c.appendChild(el('strong',{},m.m));c.appendChild(el('div',{style:'font-size:15px;margin:2px 0'},k.ad||''));c.appendChild(el('p',{style:'margin:6px 0'},m.o));var a=el('a',{href:k.url||'https://www.mevzuat.gov.tr/',target:'_blank',rel:'noopener',style:'color:#003399;font-weight:bold'},'Güncel metin: mevzuat.gov.tr');c.appendChild(a);out.appendChild(c);});}
q.addEventListener('input',go);s.addEventListener('change',go);go();}
return {ui:ui,ara:ara,data:data};})();
