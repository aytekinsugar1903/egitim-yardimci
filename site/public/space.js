(function(){
var RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
/* starfield */
var c=document.createElement('canvas');c.id='sp-stars';c.setAttribute('aria-hidden','true');document.body.prepend(c);
var x=c.getContext('2d'),W,H,S=[],D=Math.min(devicePixelRatio||1,2);
function rs(){W=innerWidth;H=innerHeight;c.width=W*D;c.height=H*D;x.setTransform(D,0,0,D,0,0);var n=Math.min(260,Math.round(W*H/5000));S=[];for(var i=0;i<n;i++)S.push({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.3+.2,v:Math.random()*.12+.02,p:Math.random()*6.3});dr(0)}
function dr(t){x.clearRect(0,0,W,H);for(var i=0;i<S.length;i++){var s=S[i];if(!RM){s.y+=s.v;s.x+=s.v*.3;if(s.y>H)s.y=0;if(s.x>W)s.x=0}var a=.55+.45*Math.sin(t/900+s.p);x.globalAlpha=a;x.fillStyle=s.r>1.1?'#cfe8ff':'#fff';x.beginPath();x.arc(s.x,s.y,s.r,0,6.283);x.fill()}x.globalAlpha=1}
rs();addEventListener('resize',rs);
if(!RM){var last=0;(function lp(t){if(!document.hidden&&t-last>40){dr(t);last=t}requestAnimationFrame(lp)})(0)}
/* back button */
var b=document.createElement('button');b.type='button';b.className='sp-back';b.innerHTML='<span aria-hidden="true">←</span> Geri';b.setAttribute('aria-label','Geri dön');
var home=location.pathname==='/'||location.pathname==='/index.html';
function upd(){b.hidden=home&&!location.hash&&!document.querySelector('details[open]')}
b.onclick=function(){var op=document.querySelector('details[open]');if(op&&!location.hash&&home){op.open=false;upd();return}
 var ref=document.referrer&&document.referrer.indexOf(location.origin)===0;
 if(history.length>1&&(ref||location.hash))history.back();else location.href='/'};
document.body.appendChild(b);upd();addEventListener('hashchange',upd);addEventListener('popstate',upd);document.addEventListener('toggle',upd,true);
})();
