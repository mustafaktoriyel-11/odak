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
  $('ay-tamam').addEventListener('click',kapatTikla);
  p.addEventListener('click',function(e){if(e.target===p)kapatTikla();});
  // sınıf: mevcut sınıf seçim sayfasını aç (07-sinif-sinav.js); kapanınca etiketi tazele
  $('ay-sinif').addEventListener('click',function(){var d=$('sn-deg');if(d)d.click();});
  try{new MutationObserver(sinifYaz).observe($('sn-p')||document.body,{attributes:true,attributeFilter:['class']});}catch(e){}
  addEventListener('storage',sinifYaz);
})();
