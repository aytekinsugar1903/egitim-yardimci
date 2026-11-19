(function(){
var sv=document.querySelector('.agsvg'); if(!sv) return;
var C=[450,340], R=250, PER=75000;
var K=['ebys', 'dys', 'belgenet', 'mudur', 'formt', 'eokul', 'oy', 'myp', 'muh', 'veli', 'reh', 'siz'];
var SHORT={'ebys': 'EBYS', 'dys': 'DYS', 'belgenet': 'Belgenet', 'mudur': 'Müdür Paketi', 'formt': 'Form Toplayıcı', 'eokul': 'Okul Pro', 'oy': 'Öğretmen Yrd.', 'myp': 'Müdür Yrd.', 'muh': 'Muhasebe', 'veli': 'Veli Asistanı', 'reh': 'Rehberlik', 'siz': 'Siz (onay)'};
var FULL={'ebys': 'EBYS', 'dys': 'DYS', 'belgenet': 'Belgenet', 'mudur': 'Müdür Paketi', 'formt': 'Form Toplayıcı', 'eokul': 'Okul Pro Devamsızlık Rapor Asistanı', 'oy': 'Öğretmen Yardımcısı', 'myp': 'Müdür Yardımcısı', 'muh': 'Muhasebe', 'veli': 'Veli Asistanı', 'reh': 'Rehberlik', 'siz': 'Siz (onay)'};
var tn={}, cu={}, nd={};
K.forEach(function(k){
  tn[k]=sv.querySelector('.tn[data-k="'+k+'"]');
  var cg=sv.querySelector('.cups[data-k="'+k+'"]');
  cu[k]=cg?cg.children:[];
  nd[k]=sv.querySelector('.nd[data-k="'+k+'"]');
});
var docs=[].slice.call(sv.querySelectorAll('.doc'));
var li=document.querySelectorAll('.agsteps li');
var cn=document.querySelector('.agn'), ct=document.querySelector('.agt');
var core=sv.querySelector('.core');
var orbit=sv.querySelector('.orbit');
var ctTitle=sv.querySelector('text.ct');
var STEP=3400;
var IN=['ebys','dys','belgenet','mudur','formt','eokul','oy','myp','muh','veli','reh'];
function cub(a,b,c,d,t){var u=1-t;return u*u*u*a+3*u*u*t*b+3*u*t*t*c+t*t*t*d}
var geo={};
var sm=false;
function layout(){
  sm=sv.getBoundingClientRect().width<640;
  sv.classList.toggle('sm',sm);
  if(sm){ C=[250,305]; R=168; sv.setAttribute('viewBox','0 0 500 620'); }
  else { C=[450,340]; R=250; sv.setAttribute('viewBox','0 0 900 700'); }
  if(orbit){ orbit.setAttribute('cx',C[0]); orbit.setAttribute('cy',C[1]); orbit.setAttribute('r',String(R)); }
  if(core) core.setAttribute('transform','translate('+C[0]+' '+C[1]+')');
  if(ctTitle){ ctTitle.setAttribute('x',C[0]); ctTitle.setAttribute('y',C[1]+(sm?98:108)); }
}
function placeLabel(g, a){
  var t=g.querySelector('text'); if(!t) return;
  var t1=g.querySelector('tspan.l1'), t2=g.querySelector('tspan.l2');
  var deg=((a*180/Math.PI)%360+360)%360;
  var top=deg>225 && deg<315;
  var x=0, y1=46, y2=60;
  if(top){
    if(t2 && t2.textContent){ y1=-52; y2=-38; }
    else { y1=-36; y2=-36; }
  }
  t.setAttribute('text-anchor','middle');
  if(t1){
    t1.setAttribute('x',x); t1.setAttribute('y',y1);
    if(t2){ t2.setAttribute('x',x); t2.setAttribute('y', t2.textContent?y2:y1); }
  } else {
    t.setAttribute('x',x); t.setAttribute('y', top?-36:50);
  }
}
function frame(now){
  var rot=-Math.PI/2+(now/PER)*2*Math.PI;
  K.forEach(function(k,i){
    var a=rot+i*2*Math.PI/K.length, nx=C[0]+R*Math.cos(a), ny=C[1]+R*0.92*Math.sin(a);
    nd[k].setAttribute('transform','translate('+nx.toFixed(1)+' '+ny.toFixed(1)+')');
    placeLabel(nd[k], a);
    var dx=nx-C[0], dy=ny-C[1], L=Math.hypot(dx,dy)||1, ux=dx/L, uy=dy/L, px=-uy, py=ux, ph=i*1.7, tt=now/1000;
    var w1=Math.sin(tt*1.6+ph)*46, w2=Math.sin(tt*2.1+ph+2)*40;
    var P=[[C[0]+ux*56,C[1]+uy*56],[C[0]+dx*.35+px*w1,C[1]+dy*.35+py*w1],[C[0]+dx*.68+px*w2,C[1]+dy*.68+py*w2],[nx-ux*26,ny-uy*26]];
    var n=22,lft=[],rgt=[],pts=[];
    for(var j=0;j<=n;j++){var t=j/n,x=cub(P[0][0],P[1][0],P[2][0],P[3][0],t),y=cub(P[0][1],P[1][1],P[2][1],P[3][1],t);pts.push([x,y])}
    for(j=0;j<=n;j++){
      var p0=pts[Math.max(0,j-1)],p1=pts[Math.min(n,j+1)],tx=p1[0]-p0[0],ty=p1[1]-p0[1],tl=Math.hypot(tx,ty)||1,nx2=-ty/tl,ny2=tx/tl,wd=(11*(1-j/n)+3)/2;
      lft.push((pts[j][0]+nx2*wd).toFixed(1)+' '+(pts[j][1]+ny2*wd).toFixed(1));
      rgt.unshift((pts[j][0]-nx2*wd).toFixed(1)+' '+(pts[j][1]-ny2*wd).toFixed(1));
      if(j%3==2&&j<20){var c=cu[k][(j-2)/3]; if(c){c.setAttribute('cx',(pts[j][0]+nx2*wd*.25).toFixed(1)); c.setAttribute('cy',(pts[j][1]+ny2*wd*.25).toFixed(1)); c.setAttribute('r',(2.6*(1-j/n)+1.1).toFixed(1));}}
    }
    tn[k].setAttribute('d','M'+lft.join(' L')+' L'+rgt.join(' L')+'Z'); geo[k]=pts;
  });
  var s=Math.floor(now/STEP)%4, f=(now%STEP)/STEP;
  if(s!==frame.s){
    frame.s=s;
    li.forEach(function(e,j){e.classList.toggle('on',j==s)});
    if(cn&&li[s]) cn.textContent='0'+(s+1);
    if(ct&&li[s]) ct.textContent=li[s].querySelector('b').textContent;
    sv.classList.toggle('think',s==1); sv.classList.toggle('ok',s==3);
    K.forEach(function(k){
      var on=(s==0||s==2)?IN.indexOf(k)>-1:(s==3?k=='siz':false);
      if(tn[k]) tn[k].classList.toggle('on',on);
      if(nd[k]) nd[k].classList.toggle('on',on);
    });
  }
  docs.forEach(function(d,i){
    var k,dir,ok=1;
    if(s==0||s==2){k=IN[i%IN.length]; dir=s==0?1:0; if(i>4) ok=0;}
    else if(s==3){k='siz'; dir=i%2; if(i>1) ok=0;} else ok=0;
    var lag=(i%5)*.07, t=Math.min(1,Math.max(0,(f-lag)/.75));
    if(!ok||t<=0||t>=1||!geo[k]){d.setAttribute('opacity','0'); return;}
    var pts=geo[k], q=dir?1-t:t, idx=q*22, a=Math.floor(idx), b=Math.min(22,a+1), r=idx-a;
    var x=pts[a][0]+(pts[b][0]-pts[a][0])*r, y=pts[a][1]+(pts[b][1]-pts[a][1])*r;
    d.setAttribute('opacity',Math.min(1,Math.min(t,1-t)*8).toFixed(2));
    d.setAttribute('transform','translate('+x.toFixed(1)+' '+y.toFixed(1)+') scale('+(0.75+0.35*Math.sin(t*Math.PI)).toFixed(2)+')');
    d.classList.toggle('reply',s>=2);
  });
}
function setLabels(){
  K.forEach(function(k){
    var g=nd[k]; if(!g) return;
    var t1=g.querySelector('tspan.l1'), t2=g.querySelector('tspan.l2'), t=g.querySelector('text');
    var label=sm?SHORT[k]:FULL[k];
    if(t1){
      if(label==='Siz (onay)'){ t1.textContent='Siz'; if(t2) t2.textContent='(onay)'; }
      else {
        var parts=label.split(' ');
        if(parts.length>=2){ t1.textContent=parts[0]; if(t2) t2.textContent=parts.slice(1).join(' '); }
        else { t1.textContent=label; if(t2) t2.textContent=''; }
      }
    } else if(t) t.textContent=label;
  });
}
function fit(){
  layout();
  setLabels();
}

var RM=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var paused=false, base=performance.now(), acc=0, run=false, raf=0, touchT=0;
function now(){ return paused ? acc : acc+(performance.now()-base); }
function pause(){ if(!paused){ acc=now(); paused=true; sv.classList.add('paused'); } if(touchT){ clearTimeout(touchT); touchT=0; } }
function resume(){ if(paused){ base=performance.now(); paused=false; sv.classList.remove('paused'); } }
sv.addEventListener('pointerenter', pause);
sv.addEventListener('pointerleave', resume);
sv.addEventListener('focusin', pause);
sv.addEventListener('focusout', function(e){ if(!sv.contains(e.relatedTarget)) resume(); });
sv.addEventListener('touchstart', function(){ pause(); }, {passive:true});
sv.addEventListener('touchend', function(){ if(touchT) clearTimeout(touchT); touchT=setTimeout(resume, 2800); }, {passive:true});
sv.addEventListener('touchcancel', function(){ if(touchT) clearTimeout(touchT); resume(); }, {passive:true});

fit();
addEventListener('resize', function(){ fit(); frame(RM?0:now()); });

if(RM){ frame(0); li.forEach(function(e){e.classList.add('on')}); return; }

function loop(){ frame(now()); if(run) raf=requestAnimationFrame(loop); }
if('IntersectionObserver' in window){
  new IntersectionObserver(function(e){
    var v=e[0].isIntersecting;
    if(v&&!run){ run=true; if(!paused){ base=performance.now(); } raf=requestAnimationFrame(loop); }
    else if(!v){ run=false; cancelAnimationFrame(raf); }
  }, {threshold:0.15}).observe(sv);
} else { run=true; raf=requestAnimationFrame(loop); }
frame(now());
})();
