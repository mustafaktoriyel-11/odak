
// ---- Tablet: Çalışma ekranında "Bugün" kartı ----
(function(){
  var sayfa=document.getElementById('pg-sayac');if(!sayfa)return;
  var GN=['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'];
  var ilk=sayfa.querySelector(':scope>section.kart');
  var k=document.createElement('section');k.className='kart tb-bugun';k.id='tb-bugun';k.setAttribute('aria-live','polite');
  if(ilk&&ilk.nextSibling)sayfa.insertBefore(k,ilk.nextSibling);else sayfa.appendChild(k);
  var hk=document.createElement('section');hk.className='kart tb-hafta';hk.id='tb-hafta';
  if(k.nextSibling)sayfa.insertBefore(hk,k.nextSibling);else sayfa.appendChild(hk);
  var yk=document.getElementById('lex-yakin');
  var yan=document.createElement('div');yan.className='tb-yan';sayfa.insertBefore(yan,k);
  yan.appendChild(k);yan.appendChild(hk);
  if(yk){var ykYer=document.createComment('yk');yk.parentNode.insertBefore(ykYer,yk);
    var mq=window.matchMedia('(min-width:760px)');
    var ykYerlestir=function(){if(mq.matches){if(yk.parentNode!==yan)yan.insertBefore(yk,hk);}else if(ykYer.nextSibling!==yk)ykYer.parentNode.insertBefore(yk,ykYer.nextSibling);};
    ykYerlestir();if(mq.addEventListener)mq.addEventListener('change',ykYerlestir);else if(mq.addListener)mq.addListener(ykYerlestir);}
  var dcx=document.getElementById('pm-ders-c');
  if(dcx){var tb=document.createElement('button');tb.type='button';tb.className='tb-tumu';
    function tbYaz(){var n=dcx.children.length;tb.hidden=n<7;tb.textContent=dcx.classList.contains('tb-tum')?'Daha az göster ▴':'Tüm dersler ('+n+') ▾';}
    tb.addEventListener('click',function(){dcx.classList.toggle('tb-tum');tbYaz();});
    dcx.parentNode.insertBefore(tb,dcx.nextSibling);tbYaz();new MutationObserver(tbYaz).observe(dcx,{childList:true});}
  // daireye dokunarak başlat / durdur (telefon dahil)
  (function(){var h=document.getElementById('pm-saat'),b=document.getElementById('pm-basla');if(!h||!b)return;
    h.style.cursor='pointer';h.setAttribute('role','button');h.setAttribute('tabindex','0');h.setAttribute('aria-label','Sayacı başlat ya da durdur');
    h.addEventListener('click',function(e){if(e.target.closest('button'))return;b.click();});
    h.addEventListener('keydown',function(e){if((e.key==='Enter'||e.key===' ')&&e.target===h){e.preventDefault();e.stopPropagation();b.click();}});})();
  // sayacın içinde seçili ders
  var yazi=document.querySelector('#pm-saat .pm-yazi'),da=document.createElement('div');da.className='tb-ders-ad';da.id='tb-ders-ad';if(yazi)yazi.appendChild(da);
  function dersYaz(){var c=document.querySelector('#pm-ders-c [aria-checked="true"],#pm-ders-c .aktif,#pm-ders-c .on');da.textContent=c?c.textContent.trim():'';}
  var dc=document.getElementById('pm-ders-c');if(dc){new MutationObserver(dersYaz).observe(dc,{subtree:true,attributes:true,childList:true});}dersYaz();
  // sayaç çalışıyor mu
  var bb=document.getElementById('pm-basla');
  function calis(){document.body.classList.toggle('tb-calisiyor',!!bb&&/Duraklat/.test(bb.textContent));}
  if(bb){new MutationObserver(calis).observe(bb,{childList:true,characterData:true,subtree:true});calis();}
  // başlıkta sayfa adı ve tarih
  var ui=document.querySelector('.ust-ic'),sy=document.createElement('span');sy.className='tb-sayfa';
  var ay=['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
  function sayfaAd(){var c=document.body.classList,n=c.contains('s-mantik')?'Yolculuk':c.contains('s-kutuphane')?'Kütüphane':c.contains('s-program')||c.contains('s-istat')?'Takip':'Çalışma',d=new Date();sy.textContent=n+' · '+d.getDate()+' '+ay[d.getMonth()]+' '+GN[d.getDay()];}
  if(ui){var tm=document.getElementById('sn-say')||document.getElementById('tema');if(tm&&tm.parentNode===ui)ui.insertBefore(sy,tm);else ui.appendChild(sy);new MutationObserver(sayfaAd).observe(document.body,{attributes:true,attributeFilter:['class']});sayfaAd();}
  function oku(a,v){try{var x=JSON.parse(localStorage.getItem(a)||'null');return x==null?v:x;}catch(e){return v;}}
  function gun(t){var x=new Date(t);return x.getFullYear()+'-'+(x.getMonth()+1)+'-'+x.getDate();}
  function sure(dk){dk=Math.round(dk);if(dk<60)return dk+' dk';var s=Math.floor(dk/60),d=dk%60;return s+' sa'+(d?' '+d+' dk':'');}
  function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function ciz(){
    var kay=oku('pm-kayit',{}),b=kay[gun(Date.now())]||{dk:0,p:0,d:{}};
    var hafta=0;for(var i=0;i<7;i++)hafta+=(kay[gun(Date.now()-i*864e5)]||{}).dk||0;
    var pr=oku('mf-program',null),gi=(new Date().getDay()+6)%7,plan=pr&&pr.g&&pr.g[gi]||[],hedef=0;
    plan.forEach(function(x){hedef+=+x.dk||0;});
    var d=b.d||{},L=Object.keys(d).sort(function(x,z){return d[z]-d[x];}),top=b.dk||0;
    var o='<h3>Bugün ne çalıştım?<small>'+GN[new Date().getDay()]+'</small></h3>';
    if(L.length){
      o+='<div class="tb-liste">'+L.map(function(a){return '<div class="tb-ders"><b>'+esc(a)+'</b><span>'+sure(d[a])+'</span><em><i style="width:'+Math.max(4,Math.round(d[a]/top*100))+'%"></i></em></div>';}).join('')+'</div>';
      o+='<div class="tb-toplam"><span>Toplam</span><b>'+sure(top)+'</b></div>';
    }else o+='<p class="tb-bos">Bugün henüz kayıt yok. Sayacı başlat ya da sayaçsız çalıştıysan aşağıdan ekle.</p>';
    if(hedef>0){var y=Math.min(100,Math.round(top/hedef*100));o+='<div class="tb-hedef" title="Bugünkü hedef"><i style="width:'+y+'%"></i></div><small class="tb-hy">Bugünkü hedef '+sure(hedef)+' · %'+y+' tamam</small>';}
    if(plan.length){
      var kalan=plan.filter(function(x){return !d[x.ders]||d[x.ders]<(+x.dk||0);});
      o+='<div class="tb-prg"><svg class="ic" aria-hidden="true"><use href="#i-takvim"/></svg><b>Bugünkü program</b>'+(hedef?' · '+(kalan.length?sure(Math.max(0,hedef-(b.dk||0)))+' kaldı':'tamamlandı'):'')+'<ul>'+plan.map(function(x){var ok=(d[x.ders]||0)>=(+x.dk||0);return '<li'+(ok?' class="ok"':'')+'>'+(ok?'✓ ':'')+esc(x.ders)+' · '+sure(+x.dk||0)+'</li>';}).join('')+'</ul></div>';
    }
    var G7=[],mx=1,KG=['Paz','Pzt','Sal','Çar','Per','Cum','Cmt'];
    for(var j=6;j>=0;j--){var t=Date.now()-j*864e5,v=(kay[gun(t)]||{}).dk||0;mx=Math.max(mx,v);G7.push({v:v,a:KG[new Date(t).getDay()],bu:j===0});}
    o+='<div class="tb-hf"><b>Son 7 gün</b><div class="tb-cubuk">'+G7.map(function(x){return '<div'+(x.bu?' class="bu"':'')+'><em>'+(x.v?Math.round(x.v):'')+'</em><i style="height:'+Math.max(3,Math.round(x.v/mx*84))+'px"></i><small>'+x.a+'</small></div>';}).join('')+'</div></div>';
    var hi=o.indexOf('<div class="tb-hf">');
    hk.innerHTML=hi>=0?'<h3>Bu hafta<small>'+sure(hafta)+'</small></h3>'+o.slice(hi).replace('<b>Son 7 gün</b>',''):'';
    k.innerHTML=(hi>=0?o.slice(0,hi):o)+'<button type="button" class="tb-elle">＋ Unuttuğun çalışmayı ekle</button>';k.classList.toggle('bos',!L.length);
  }
  k.addEventListener('click',function(e){if(e.target.closest('.tb-elle')&&window.MF_ELLE_AC)window.MF_ELLE_AC();});
  window.MF_BUGUN_CIZ=ciz;
  ciz();
  setInterval(ciz,30000);
  document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible')ciz();});
  window.addEventListener('resize',ciz);
  var eski=window.MF_PR;window.MF_PR=function(){try{if(eski)eski.apply(this,arguments);}finally{ciz();}};
})();
