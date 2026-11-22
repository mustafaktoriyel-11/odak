// Ayarlar düğmesi (sıkı modun altında, yalnız simge): sınıf, kadran ve (açıldıktan sonra) bildirim ayarları tek sayfada.
(function(){
  'use strict';
  function $(i){return document.getElementById(i);}
  var btn=$('ay-btn'),p=$('ay-p');if(!btn||!p)return;
  var acik=false,saat=$('pm-saat'),eski=btn.parentNode;
  if(saat){saat.appendChild(btn);if(eski&&eski.classList.contains('ay-satir'))eski.remove();}
  function sinifYaz(){var f=window.MF_SINIF&&window.MF_SINIF(),e=$('ay-sinif-et');if(!e)return;
    if(!f){e.textContent='Seçilmedi';return;}
    var AL={SAY:'Sayısal',EA:'Eşit Ağırlık',SOZ:'Sözel',DIL:'Dil'};
    e.textContent=(f.sinif==='Mezun'?'Mezun':f.sinif+'. sınıf')+(f.alan&&AL[f.alan]?' · '+AL[f.alan]:'');}
  function ac(){if(acik)return;acik=true;sinifYaz();p.classList.add('acik');
    requestAnimationFrame(function(){requestAnimationFrame(function(){p.classList.add('gor');});});
    if(window.LEX_GERI&&LEX_GERI.ekle)LEX_GERI.ekle('ay',kapat);}
  function kapat(){if(!acik)return;acik=false;p.classList.remove('gor');setTimeout(function(){if(!acik)p.classList.remove('acik');},280);}
  function kapatTikla(){if(window.LEX_GERI&&LEX_GERI.dus)LEX_GERI.dus('ay');kapat();}
  btn.addEventListener('click',ac);
  if(typeof ksKapat==='function')ksKapat(p,kapatTikla,p);
  // sürüm numarası (hangi sürümün kurulu olduğunu görmek için): sw.js içindeki mf-odak-vNNN
  fetch('sw.js',{cache:'no-store'}).then(function(r){return r.text();}).then(function(t){var m=t.match(/mf-odak-v(\d+)/);if(m)$('ay-surum').textContent='Sürüm '+m[1];}).catch(function(){});
  // gizli: sürüm yazısına 5 kez dokununca Yolculuk önizleme modu (tüm duraklar açık, yalnız bu cihaz) aç/kapa
  (function(){var e=$('ay-surum'),n=0,t=0;if(!e)return;e.addEventListener('click',function(){var s=Date.now();n=s-t<700?n+1:1;t=s;if(n<5)return;n=0;
    var acik=false;try{acik=localStorage.getItem('mf-iz-onizle')==='1';if(acik)localStorage.removeItem('mf-iz-onizle');else localStorage.setItem('mf-iz-onizle','1');}catch(x){}
    var eski=e.textContent;e.textContent=acik?'Önizleme kapandı':'Önizleme açık: tüm duraklar';setTimeout(function(){e.textContent=eski;},2500);
    window.dispatchEvent(new Event('mf-sinif-degisti'));});})();
  $('ay-tamam').addEventListener('click',kapatTikla);
  p.addEventListener('click',function(e){if(e.target===p)kapatTikla();});
  // sınıf: mevcut sınıf seçim sayfasını aç (07-sinif-sinav.js); kapanınca etiketi tazele
  $('ay-sinif').addEventListener('click',function(){var d=$('sn-deg');if(d)d.click();});
  try{new MutationObserver(sinifYaz).observe($('sn-p')||document.body,{attributes:true,attributeFilter:['class']});}catch(e){}
  addEventListener('storage',sinifYaz);
})();
