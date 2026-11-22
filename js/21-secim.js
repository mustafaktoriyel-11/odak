// Ders ve süre seçimi: Başlat'ın altında iki küçük düğme (kitap ve saat ikonlu); dokununca alttan pencere.
// Var olan seçim öğeleri (#pm-ders-k, #pm-odak-k, #pm-ozel-k) pencerelere taşınır; sayaç mantığı aynı kalır.
(function(){
  'use strict';
  function $(i){return document.getElementById(i);}
  var dk=$('pm-ders-k'),ok=$('pm-odak-k'),oz=$('pm-ozel-k'),dg=document.querySelector('#pg-sayac .pm-dugmeler');
  if(!dk||!ok||!dg)return;
  function sayfa(id,baslik){var p=document.createElement('div');p.id=id;p.className='pm-sheet sc-p';p.setAttribute('role','dialog');p.setAttribute('aria-modal','true');
    p.innerHTML='<div class="sheet-k"><div class="sheet-tut"></div><div class="sheet-ust"><b>'+baslik+'</b></div><div class="sc-ic"></div><button type="button" class="mt-btn sc-tamam">Tamam</button></div>';
    document.body.appendChild(p);var acik=false;
    function ac(){if(acik)return;acik=true;p.classList.add('acik');requestAnimationFrame(function(){requestAnimationFrame(function(){p.classList.add('gor');});});if(window.LEX_GERI&&LEX_GERI.ekle)LEX_GERI.ekle(id,kapat);}
    function kapat(){if(!acik)return;acik=false;p.classList.remove('gor');setTimeout(function(){if(!acik)p.classList.remove('acik');},280);}
    function kapatT(){if(window.LEX_GERI&&LEX_GERI.dus)LEX_GERI.dus(id);kapat();}
    p.addEventListener('click',function(e){if(e.target===p)kapatT();});p.querySelector('.sc-tamam').addEventListener('click',kapatT);
    if(typeof ksKapat==='function')ksKapat(p,kapatT,p); // çizgiden aşağı kaydırınca kapanır
    return {el:p,ic:p.querySelector('.sc-ic'),ac:ac,kapat:kapatT};}
  var D=sayfa('sc-dp','Hangi dersi çalışıyorsun?'),S=sayfa('sc-sp','Odak süresi');
  D.ic.appendChild(dk);S.ic.appendChild(ok);if(oz)S.ic.appendChild(oz);
  var dc=$('pm-ders-c');if(dc)dc.classList.remove('kaydir');
  // ana ekrandaki satır
  var sat=document.createElement('div');sat.className='sc-satir';sat.id='sc-satir';
  sat.innerHTML='<button type="button" class="sc-btn" id="sc-ders" aria-haspopup="dialog"><span class="sc-i"><svg class="ic" aria-hidden="true"><use href="#i-kitap"/></svg></span><b id="sc-ders-et"></b><i aria-hidden="true">▾</i></button>'+
    '<button type="button" class="sc-btn" id="sc-sure" aria-haspopup="dialog"><span class="sc-i"><svg class="ic" aria-hidden="true"><use href="#i-saat"/></svg></span><b id="sc-sure-et"></b><i aria-hidden="true">▾</i></button>';
  dg.parentNode.insertBefore(sat,dg.nextSibling);
  // seans bitince satır Bitir düğmesinin hemen altında belirir; Bitir'e basılı tutup bırakınca gelen tıklama buraya düşmesin
  // dokunuş bu düğmede başlamadıysa (ör. Bitir'e basılı tutan parmak kalkınca) tıklama sayılmaz
  var basilan=null;sat.addEventListener('pointerdown',function(e){basilan=e.target.closest('button');},true);
  function izinli(b){var ok=basilan===b;basilan=null;return ok;}
  $('sc-ders').addEventListener('click',function(){if(izinli(this))D.ac();});$('sc-sure').addEventListener('click',function(){if(izinli(this))S.ac();});
  function yaz(){
    var d=$('pm-ders');$('sc-ders-et').textContent=d?d.value:'';
    var v=$('pm-odak').value,t=v==='serbest'?'∞ Sınırsız':v==='ozel'?('Özel · '+(+$('pm-ozel').value||0)+' dk'):(v+' dk');
    $('sc-sure-et').textContent=t;$('sc-ders').setAttribute('aria-label','Ders: '+(d?d.value:'')+', değiştir');$('sc-sure').setAttribute('aria-label','Odak süresi: '+t+', değiştir');
    // deneme modunda ya da seans başlamışken satır görünmez (eski seçim alanlarıyla aynı kural)
    var bas=$('pm-basla'),gizli=dk.style.display==='none'||!bas||!/Başlat/.test(bas.textContent);
    sat.hidden=gizli;
  }
  ['pm-ders','pm-odak','pm-ozel'].forEach(function(i){var e=$(i);if(e){e.addEventListener('change',yaz);e.addEventListener('input',yaz);}});
  new MutationObserver(yaz).observe($('pm-basla'),{childList:true,characterData:true,subtree:true});
  new MutationObserver(yaz).observe(dk,{attributes:true,attributeFilter:['style']});
  // seçim yapılınca pencere kendiliğinden kapanır (özel süre hariç: sayı girilecek)
  if(dc)dc.addEventListener('click',function(e){if(e.target.closest('button'))setTimeout(function(){yaz();D.kapat();},160);});
  var oc=$('pm-odak-c');if(oc)oc.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;setTimeout(function(){yaz();if(b.dataset.v!=='ozel')S.kapat();},160);});
  yaz();setTimeout(yaz,600);
})();
