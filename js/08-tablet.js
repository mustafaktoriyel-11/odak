
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
  // koç kartı: tablette sağ sütunda, "Bu hafta"nın altında (telefonda yerinde)
  var kc=document.getElementById('pm-koc');
  if(kc){var kcYer=document.createComment('koc');kc.parentNode.insertBefore(kcYer,kc);
    var mq2=window.matchMedia('(min-width:760px)');
    var kcYerlestir=function(){if(mq2.matches){if(kc.parentNode!==yan)yan.appendChild(kc);}else if(kcYer.nextSibling!==kc)kcYer.parentNode.insertBefore(kc,kcYer.nextSibling);};
    kcYerlestir();if(mq2.addEventListener)mq2.addEventListener('change',kcYerlestir);else if(mq2.addListener)mq2.addListener(kcYerlestir);}
  // tablet panosu: Yolculuk kutucuğu + sayfa yüksekliği (ekrana tam otursun, kaydırma gerekmesin)
  var yol=document.createElement('section');yol.className='kart tb-yol';yol.id='tb-yol';yan.insertBefore(yol,hk);
  function yolYaz(){var o=null;try{o=window.MF_IZ_OZET&&window.MF_IZ_OZET();}catch(e){}
    var ust='<div class="tb-yol-ust"><svg class="ic" aria-hidden="true"><use href="#i-pusula"/></svg><b>Matematiğin İzinde</b></div>',alt;
    if(!o||!o.sinif)alt='<p>Her gün 5 soru, dünya turunda bir adım.</p><button type="button" class="tb-yol-git">Yolculuğa başla ›</button>';
    else if(o.bugunTamam)alt='<p><b>Bugünün seti tamam</b>'+(o.seri>0?' · Seri '+o.seri+' gün':'')+(o.sonraki?'<br>Sıradaki durak: '+o.sonraki:'')+'</p><button type="button" class="tb-yol-git ikincil">Haritaya git ›</button>';
    else alt='<p><b>Bugünün 5 sorusu hazır</b>'+(o.sonraki?'<br>Sıradaki durak: '+o.sonraki:'')+'</p><button type="button" class="tb-yol-git">Başla ›</button>';
    var hr='';if(o&&o.sinif&&o.x!=null)hr='<div class="tb-yol-harita" aria-hidden="true"><img alt="" loading="lazy" src="veri/izinde/harita.svg"><svg class="tb-yol-iz"></svg></div>';
    yol.innerHTML=ust+hr+alt;if(hr)haritaYerlestir(o);var g=yol.querySelector('.tb-yol-git');if(g)g.onclick=function(){if(window.MF_SAYFA)window.MF_SAYFA('mantik');};}
  // mini harita: bulunulan durak ortada, sıradaki durağa kesik çizgi
  function haritaYerlestir(o){var k=yol.querySelector('.tb-yol-harita');if(!k)return;var W=k.clientWidth,H=k.clientHeight;if(!W||!H){setTimeout(function(){haritaYerlestir(o);},300);return;}
    var MW=2576,MH=1438,sc=Math.max(W/900,H/MH),cx=o.x,cy=o.y;if(o.nx!=null){cx=(o.x+o.nx)/2;cy=(o.y+o.ny)/2;var gx=Math.abs(o.nx-o.x)+160,gy=Math.abs(o.ny-o.y)+120;sc=Math.max(H/MH,Math.min(W/600,Math.min(W/gx,H/gy)));}
    var L=Math.min(0,Math.max(W-MW*sc,W/2-cx*sc)),T=Math.min(0,Math.max(H-MH*sc,H/2-cy*sc)),im=k.querySelector('img');
    im.style.width=(MW*sc)+'px';im.style.height=(MH*sc)+'px';im.style.left=L+'px';im.style.top=T+'px';
    var p=function(x,y){return [(L+x*sc).toFixed(1),(T+y*sc).toFixed(1)];},a=p(o.x,o.y),sv=k.querySelector('svg'),h='';
    sv.setAttribute('viewBox','0 0 '+W+' '+H);
    if(o.nx!=null){var b=p(o.nx,o.ny);h+='<line x1="'+a[0]+'" y1="'+a[1]+'" x2="'+b[0]+'" y2="'+b[1]+'" class="tb-iz-cizgi"/><circle cx="'+b[0]+'" cy="'+b[1]+'" r="5" class="tb-iz-sonraki"/>';}
    h+='<circle cx="'+a[0]+'" cy="'+a[1]+'" r="11" class="tb-iz-hale"/><circle cx="'+a[0]+'" cy="'+a[1]+'" r="6" class="tb-iz-burada"/>';sv.innerHTML=h;}
  addEventListener('resize',function(){yolYaz();});
  yolYaz();setTimeout(yolYaz,1500);setTimeout(yolYaz,4000);
  document.addEventListener('visibilitychange',function(){if(!document.hidden)yolYaz();});
  new MutationObserver(function(){if(!/(^|\s)s-/.test(document.body.className))yolYaz();}).observe(document.body,{attributes:true,attributeFilter:['class']});
  function panoH(){var nav=document.getElementById('alt-nav'),nr=nav?nav.getBoundingClientRect():null;
    var navH=(nr&&nr.left<5&&nr.width>=innerWidth*.9)?Math.max(0,innerHeight-nr.top):0;
    var ust=sayfa.getBoundingClientRect().top+window.scrollY;
    sayfa.style.setProperty('--tbH',Math.max(560,Math.round(innerHeight-ust-navH-32))+'px');}
  panoH();addEventListener('resize',panoH);setTimeout(panoH,600);
  // alt kutucuklar (odak modu rehberi, simülatör/konular, odak turu nedir, imza) tablette tek satırda
  var alt=document.createElement('div');alt.className='tb-alt';
  var altlar=[sayfa.querySelector(':scope>details.pm-rehber'),sayfa.querySelector(':scope>.alt-link'),sayfa.querySelector(':scope>details.kart'),sayfa.querySelector(':scope>.imza')].filter(Boolean);
  var altYer=altlar.map(function(e){var c=document.createComment('alt');e.parentNode.insertBefore(c,e);return c;});
  var mq3=window.matchMedia('(min-width:760px)');
  function altYerlestir(){if(mq3.matches){if(!alt.parentNode)sayfa.appendChild(alt);altlar.forEach(function(e){if(e.parentNode!==alt)alt.appendChild(e);});}
    else{altlar.forEach(function(e,i){if(e.parentNode!==sayfa)altYer[i].parentNode.insertBefore(e,altYer[i].nextSibling);});if(alt.parentNode)alt.remove();}panoH();}
  altYerlestir();if(mq3.addEventListener)mq3.addEventListener('change',altYerlestir);else if(mq3.addListener)mq3.addListener(altYerlestir);
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
