
(function(){
'use strict';
var K='mf-sablon';
var GUN=['Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi','Pazar'];
var ALAN={
 TYT:{ad:'TYT',alt:'11. sınıf ve TYT odaklı',w:[['Matematik',28],['Türkçe',22],['Geometri',8],['Fizik',8],['Kimya',7],['Biyoloji',7],['Tarih',7],['Coğrafya',6],['Felsefe',4],['Din Kültürü',3]]},
 SAY:{ad:'Sayısal',alt:'Mat-Fen',w:[['Matematik',32],['Fizik',15],['Kimya',13],['Türkçe',12],['Biyoloji',11],['Geometri',11],['Tarih',2],['Coğrafya',2],['Felsefe',2]]},
 EA:{ad:'Eşit Ağırlık',alt:'Mat-Edebiyat-Sosyal',w:[['Matematik',30],['Edebiyat',18],['Türkçe',14],['Tarih',12],['Coğrafya',10],['Geometri',10],['Felsefe',3],['Fizik',1],['Kimya',1],['Biyoloji',1]]},
 SOZ:{ad:'Sözel',alt:'Edebiyat-Sosyal',w:[['Edebiyat',22],['Tarih',20],['Coğrafya',16],['Türkçe',14],['Matematik',12],['Felsefe',10],['Din Kültürü',6]]}
};
var ALAN_SIRA=['TYT','SAY','EA','SOZ'];
var SEV={
 caylak:{e:'<svg class="ic" aria-hidden="true"><use href="#i-filiz"/></svg>',ad:'Çaylak',acik:'Yeni başlayanlar ve okulu yoğun olanlar için. Pazar dinlenme.',h:[75,100,0],b:25,m:2},
 duzenli:{e:'<svg class="ic" aria-hidden="true"><use href="#i-adim"/></svg>',ad:'Düzenli',acik:'Her gün düzenli tempo.',h:[160,200,120],b:40,m:2},
 azimli:{e:'<svg class="ic" aria-hidden="true"><use href="#i-alev"/></svg>',ad:'Azimli',acik:'Hedefi yüksek olanlar için ciddi tempo.',h:[300,350,250],b:50,m:2},
 nerd:{e:'<svg class="ic" aria-hidden="true"><use href="#i-kitap"/></svg>',ad:'Nerd',acik:'Mezunlar ve son aylar için tam gaz.',h:[450,500,400],b:50,m:3}
};
var SEV_SIRA=['caylak','duzenli','azimli','nerd'];

function uret(alan,sev){
 var A=ALAN[alan],S=SEV[sev];
 if(!A||!S)return null;
 var i,j,s,d,cap=[],N=0,n=A.w.length;
 for(i=0;i<7;i++){cap.push(Math.round(S.h[i<5?0:(i===5?1:2)]/S.b));N+=cap[i];}
 // en buyuk kalan yontemi
 var ex=[],c=[],top=0;
 for(i=0;i<n;i++){ex.push(A.w[i][1]*N/100);c.push(Math.floor(ex[i]));top+=c[i];}
 var sira=[];for(i=0;i<n;i++)sira.push(i);
 sira.sort(function(a,b){var ra=ex[a]-c[a],rb=ex[b]-c[b];return rb-ra||A.w[b][1]-A.w[a][1]||a-b;});
 for(i=0;top<N;i++,top++)c[sira[i%n]]++;
 // her ders en az 1 blok (toplam blok yeterliyse)
 if(N>=3*n){
  for(j=0;j<n;j++){
   if(c[j]>0)continue;
   var k=-1,kv=-1e9;
   for(i=0;i<n;i++)if(c[i]>1&&c[i]-ex[i]>kv){kv=c[i]-ex[i];k=i;}
   if(k>=0){c[k]--;c[j]++;}
  }
 }
 // gunlere yerlestir
 var ord=[];for(i=0;i<n;i++)ord.push(i);
 ord.sort(function(a,b){return c[b]-c[a]||A.w[b][1]-A.w[a][1]||a-b;});
 var rem=cap.slice(),cnt=[];
 for(i=0;i<n;i++){cnt.push([0,0,0,0,0,0,0]);}
 for(var oi=0;oi<ord.length;oi++){
  s=ord[oi];
  for(var b=0;b<c[s];b++){
   var best=-1,bs=1e9,fb=-1,fs=1e9;
   for(d=0;d<7;d++){
    if(rem[d]<=0)continue;
    var kk=cnt[s][d];
    var adj=((d>0&&cnt[s][d-1]>0)?1:0)+((d<6&&cnt[s][d+1]>0)?1:0);
    var sc=kk*1000+adj*40-rem[d]*10+((d+s)%7)*0.01;
    if(kk<S.m){if(sc<bs){bs=sc;best=d;}}
    else if(sc<fs){fs=sc;fb=d;}
   }
   if(best<0)best=fb;
   if(best<0)break;
   cnt[s][best]++;rem[best]--;
  }
 }
 var g=[];
 for(d=0;d<7;d++){
  var gun=[];
  for(s=0;s<n;s++)if(cnt[s][d]>0)gun.push({ders:A.w[s][0],dk:cnt[s][d]*S.b});
  g.push(gun);
 }
 return g;
}
window.MF_SB_URET=uret;

function $(id){return document.getElementById(id);}
function oku(){try{return JSON.parse(localStorage.getItem(K)||'null')||{};}catch(e){return {};}}
function sk(dk){var h=Math.floor(dk/60),m=dk%60;return h?(h+' sa'+(m?' '+m+' dk':'')):(m+' dk');}
function topla(g){var t=0;g.forEach(function(x){x.forEach(function(o){t+=o.dk;});});return t;}
function bos(){return typeof window.MF_PR_BOS==='function'?!!window.MF_PR_BOS():true;}

var st={alan:'',sev:'',adim:1,acik:false};
var sp=$('sb-p');
if(!sp)return;

function sinifAl(){try{return typeof window.MF_SINIF==='function'?(window.MF_SINIF()||null):null;}catch(e){return null;}}
// sınıf/alana göre önerilen {alan,sev,etiket}; 8. sınıf (LGS) için null
function oner(){
 var f=sinifAl();if(!f||f.sinif==='6'||f.sinif==='7'||f.sinif==='8')return null;
 var al=ALAN[f.alan]&&f.alan!=='TYT'?f.alan:'',sv='duzenli';
 if(f.sinif==='12')sv='azimli';else if(f.sinif==='Mezun')sv='nerd';
 if(f.sinif==='9'||f.sinif==='10')al='';
 var ad=(f.sinif==='Mezun'?'Mezun':f.sinif+'. sınıf')+(al?' '+ALAN[al].ad:'');
 return {alan:al||'TYT',sev:sv,etiket:ad+' için önerilen: '+(al?'':'TYT · ')+SEV[sv].ad};
}
function onerAyni(){var o=oku();return !(o&&ALAN[o.alan]&&SEV[o.seviye]);}
function guncelle(){
 var f=sinifAl(),gizle=!!(f&&(f.sinif==='6'||f.sinif==='7'||f.sinif==='8'));
 var b=bos(),a=$('sb-buyuk'),i=$('sb-ince'),on=$('sb-oner');
 if(a)a.hidden=gizle||!b;
 if(i)i.hidden=gizle||b;
 var o=oner();
 if(on){if(o&&onerAyni()){on.textContent=o.etiket;on.hidden=false;}else on.hidden=true;}
}
window.addEventListener('mf-sinif-degisti',function(){guncelle();});
window.MF_SB_GUNCELLE=guncelle;

var BAS=['Hedefin ne?','Temponu seç','Önizleme'];
function adimGoster(n){
 st.adim=n;
 for(var i=1;i<=3;i++)$('sb-a'+i).hidden=(i!==n);
 $('sb-adim').textContent=n+' / 3';
 $('sb-bas').textContent=BAS[n-1];
 if(n===1)cizAlan();
 if(n===2)cizSev();
 if(n===3)cizOnizle();
 var k=sp.querySelector('.sheet-k');if(k)k.scrollTop=0;
}
function cizAlan(){
 var k=$('sb-alanlar');k.innerHTML='';
 ALAN_SIRA.forEach(function(a){
  var b=document.createElement('button');b.type='button';b.dataset.v=a;
  b.className=st.alan===a?'on':'';b.setAttribute('aria-pressed',st.alan===a);
  var t=document.createElement('b');t.textContent=ALAN[a].ad;
  var s=document.createElement('small');s.textContent=ALAN[a].alt;
  b.appendChild(t);b.appendChild(s);
  b.addEventListener('click',function(){st.alan=a;adimGoster(2);});
  k.appendChild(b);
 });
}
function cizSev(){
 var k=$('sb-sevler');k.innerHTML='';
 SEV_SIRA.forEach(function(v){
  var S=SEV[v],g=uret(st.alan,v),saat=Math.round(topla(g)/60);
  var b=document.createElement('button');b.type='button';b.dataset.v=v;
  b.className=st.sev===v?'on':'';b.setAttribute('aria-pressed',st.sev===v);
  var e=document.createElement('span');e.className='sb-s-ik';e.innerHTML=S.e;
  var m=document.createElement('span');m.className='sb-s-m';
  var t=document.createElement('b');t.textContent=S.ad;
  var a=document.createElement('small');a.textContent=S.acik;
  var h=document.createElement('em');h.textContent='Haftada ~'+saat+' saat';
  m.appendChild(t);m.appendChild(a);m.appendChild(h);
  b.appendChild(e);b.appendChild(m);
  b.addEventListener('click',function(){st.sev=v;adimGoster(3);});
  k.appendChild(b);
 });
}
function cizOnizle(){
 var k=$('sb-onizle');k.innerHTML='';
 var g=uret(st.alan,st.sev);if(!g)return;
 g.forEach(function(gun,i){
  var d=document.createElement('div');d.className='sb-gun';
  var u=document.createElement('div');u.className='sb-gun-u';
  var a=document.createElement('b');a.textContent=GUN[i];
  var t=document.createElement('span');t.textContent=gun.length?sk(topla([gun])):'Dinlenme';
  u.appendChild(a);u.appendChild(t);d.appendChild(u);
  var l=document.createElement('div');l.className='sb-gun-d';
  if(gun.length)gun.forEach(function(o){var x=document.createElement('i');x.textContent=o.ders+' · '+o.dk+' dk';l.appendChild(x);});
  else{var x=document.createElement('i');x.className='bos';x.textContent='Bu gün ders yok';l.appendChild(x);}
  d.appendChild(l);k.appendChild(d);
 });
}

function ac(){
 if(st.acik)return;
 var o=oku();
 st.alan=ALAN[o.alan]?o.alan:'';st.sev=SEV[o.seviye]?o.seviye:'';
 if(!st.alan||!st.sev){var on=oner();if(on){st.alan=on.alan;st.sev=on.sev;}}
 st.acik=true;
 adimGoster(1);
 sp.classList.add('acik');
 requestAnimationFrame(function(){requestAnimationFrame(function(){sp.classList.add('gor');});});
 if(window.LEX_GERI&&LEX_GERI.ekle)LEX_GERI.ekle('sb',kapat);
}
function kapat(){
 if(!st.acik)return;
 st.acik=false;
 sp.classList.remove('gor');
 setTimeout(function(){if(!st.acik)sp.classList.remove('acik');},280);
}
function kapatTikla(){
 if(window.LEX_GERI&&LEX_GERI.dus)LEX_GERI.dus('sb');
 kapat();
}
var tT=0;
function bildir(m){
 var t=$('sb-toast');t.textContent=m;t.hidden=false;
 clearTimeout(tT);tT=setTimeout(function(){t.hidden=true;},3500);
}
function uygula(){
 var g=uret(st.alan,st.sev);if(!g)return;
 if(!bos()&&!confirm('Mevcut programın bu şablonla değiştirilecek. Devam edilsin mi?'))return;
 var ok=typeof window.MF_PR_UYGULA==='function'?window.MF_PR_UYGULA(g):false;
 if(!ok){bildir('Program uygulanamadı, tekrar dene.');return;}
 try{localStorage.setItem(K,JSON.stringify({alan:st.alan,seviye:st.sev,tarih:Date.now()}));}catch(e){}
 kapatTikla();
 guncelle();
 bildir('Programın hazır! İstediğin dersi düzenleyebilirsin.');
}

sp.addEventListener('click',function(e){if(e.target===sp)kapatTikla();});
$('sb-vazgec').addEventListener('click',kapatTikla);
$('sb-geri2').addEventListener('click',function(){adimGoster(1);});
$('sb-geri3').addEventListener('click',function(){adimGoster(2);});
$('sb-uygula').addEventListener('click',uygula);
document.addEventListener('click',function(e){
 var t=e.target&&e.target.closest?e.target.closest('#sb-buyuk,#sb-ince'):null;
 if(t)ac();
});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&st.acik)kapatTikla();});
setTimeout(guncelle,0);
})();
