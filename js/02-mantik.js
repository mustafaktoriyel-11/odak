// Günlük mantık testi kaldırıldı (v117); yerine "Matematiğin İzinde" geldi: js/18-izinde.js

// ================= YANA KAYDIRARAK SEKME GECISI (yandaki sekme belirerek gelir) =================
(function(){
  var SIRA=['sayac','kutuphane','mantik','program'],m=document.getElementById('pm');
  var x0=0,y0=0,dx=0,iz=false,kilit='',son=[],mesgul=false,hedef=null,hEl=null,sEl=null,yon=0;
  var az=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  function simdiki(){var b=document.body.classList;return b.contains('s-program')?'program':b.contains('s-istat')?'istat':b.contains('s-mantik')?'mantik':b.contains('s-kutuphane')?'kutuphane':'sayac';}
  function sayfaEl(ad){return document.getElementById('pg-'+ad);}
  function engel(el){
    var kg=document.getElementById('kt-gor');if(kg&&!kg.hidden)return true;
    if(document.querySelector('.iz-pencere,.iz-sahne'))return true;   // Yolculuk: açık durak sahnesi/pencere
    if(document.querySelector('.pm-sheet.acik,#alarm.acik,#sik-sor.acik,#pm-curu.acik,#koc-onay.acik,#pm-not.acik,#pm-dnm.acik,#sil-p.acik'))return true;
    return !!(el&&el.closest&&el.closest('input,select,textarea,.kaydir,.pm-chips,.mt-sec,.mt-noktalar,.pr-gunler,.alt-nav,.st-cizim,.dg-cip,.dg-d,.kt-gor,.kt-ort,.kt-yan,.iz-harita,.iz-test-ust'));
  }
  function ciz(x,gecis){
    var W=window.innerWidth,p=Math.min(1,Math.abs(x)/W);
    m.style.transition=gecis||'none';m.style.transform=x?'translate3d('+x+'px,0,0)':'';
    if(sEl){sEl.style.transition=gecis?gecis.replace(/transform/g,'opacity'):'none';sEl.style.opacity=hEl?String(1-p*.85):String(1-p*.4);}
    if(hEl){hEl.style.transition=sEl.style.transition;hEl.style.opacity=String(Math.min(1,p*1.25));}
  }
  function temizle(){
    m.style.transition='';m.style.transform='';
    if(sEl){sEl.style.opacity='';sEl.style.transition='';}
    if(hEl){hEl.classList.remove('onizle');hEl.style.cssText='';}
    hEl=sEl=hedef=null;
  }
  function onizleKur(){
    SIRA[3]=window.LEX_TAKIP?window.LEX_TAKIP():'program';var i=SIRA.indexOf(simdiki()),j=i+yon;sEl=sayfaEl(simdiki());
    if(j<0||j>=SIRA.length){hedef=null;return;}
    hedef=SIRA[j];hEl=sayfaEl(hedef);
    if(window.MF_HAZIRLA)window.MF_HAZIRLA(hedef);
    var pad=parseFloat(getComputedStyle(m).paddingLeft)||0;
    hEl.classList.add('onizle');hEl.style.top=window.scrollY+'px';hEl.style.left=(pad+yon*window.innerWidth)+'px';hEl.style.width=(m.clientWidth-2*pad)+'px';hEl.style.opacity='0';
  }
  document.addEventListener('touchstart',function(e){
    if(mesgul||e.touches.length!==1){iz=false;return;}var t=e.touches[0];
    // ekran kenarindan baslayan hareketler telefonun geri hareketi olabilir
    iz=t.clientX>24&&t.clientX<window.innerWidth-24&&!engel(e.target);x0=t.clientX;y0=t.clientY;dx=0;kilit='';son=[[Date.now(),x0]];
  },{passive:true});
  document.addEventListener('touchmove',function(e){
    if(!iz)return;var t=e.touches[0],ddx=t.clientX-x0,ddy=t.clientY-y0;
    if(!kilit){if(Math.abs(ddx)<10&&Math.abs(ddy)<10)return;kilit=Math.abs(ddx)>Math.abs(ddy)*1.2?'x':'y';
      if(kilit==='x'){yon=ddx<0?1:-1;if(!az)onizleKur();else{var i=SIRA.indexOf(simdiki());hedef=SIRA[i+yon]||null;}}}
    if(kilit!=='x')return;
    e.preventDefault();
    if((ddx<0?1:-1)!==yon)ddx=0;                     // ters yone gecmesin
    dx=hedef?ddx:ddx*.25;                             // gidilecek sekme yoksa lastik etkisi
    son.push([Date.now(),t.clientX]);if(son.length>5)son.shift();
    if(!az)ciz(dx);
  },{passive:false});
  document.addEventListener('touchend',function(){
    if(!iz||kilit!=='x'){iz=false;return;}iz=false;
    var W=window.innerWidth,a=son[0],b=son[son.length-1],hiz=(b[1]-a[1])/Math.max(1,b[0]-a[0]);
    var gec=hedef&&(Math.abs(dx)>W*.25||(Math.abs(hiz)>.45&&Math.abs(dx)>30&&(hiz<0)===(dx<0)));
    if(az){if(gec&&window.MF_SAYFA)(window.LEX_GERI&&LEX_GERI.sekme(hedef)),window.MF_SAYFA(hedef);temizle();return;}
    mesgul=true;
    if(!gec){ciz(0,'transform .3s cubic-bezier(.2,.8,.2,1),opacity .3s ease');setTimeout(function(){temizle();mesgul=false;},320);return;}
    var git=hedef,sure=Math.max(180,Math.min(340,(W-Math.abs(dx))/Math.max(.8,Math.abs(hiz))));
    ciz(-yon*W,'transform '+sure+'ms cubic-bezier(.25,.8,.25,1),opacity '+sure+'ms ease');
    setTimeout(function(){
      var y=window.scrollY;temizle();if(window.MF_SAYFA)(window.LEX_GERI&&LEX_GERI.sekme(git)),window.MF_SAYFA(git);
      mesgul=false;
    },sure+20);
  },{passive:true});
  document.addEventListener('touchcancel',function(){if(iz&&kilit==='x'){ciz(0,'transform .25s ease-out,opacity .25s');setTimeout(temizle,270);}iz=false;},{passive:true});
})();

// ================= ISTATISTIK GRAFIKLERI =================
(function(){
  var $=function(id){return document.getElementById(id);};
  var GK=['Paz','Pzt','Sal','Çar','Per','Cum','Cmt'],GT=['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'];
  var AYK=['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'],AY=['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
  function gunK(t){var x=new Date(t);return x.getFullYear()+'-'+(x.getMonth()+1)+'-'+x.getDate();}
  function dAd(x){return /^(TYT|AYT) Matematik$/.test(x)?'Matematik':x;}
  function sk(dk){dk=Math.round(dk);var h=Math.floor(dk/60),m=dk%60;return h?(h+' sa'+(m?' '+m+' dk':'')):(m+' dk');}
  function eks(dk){return dk<120?Math.round(dk)+' dk':dk<6000?String(Math.round(dk/6)/10).replace('.',',')+' sa':Math.round(dk/60)+' sa';}
  function kpiS(dk){return dk>=600?eks(dk):sk(dk);}
  function css(v){return getComputedStyle($('st-kpi')).getPropertyValue(v).trim();}
  function esc(x){return String(x).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  // ---- ipucu ----
  var ip=$('st-ipucu');
  function ipGoster(el,html){var r=el.getBoundingClientRect();ip.innerHTML=html;ip.hidden=false;
    var x=r.left+r.width/2,y=r.top-8;x=Math.max(70,Math.min(window.innerWidth-70,x));ip.style.left=x+'px';ip.style.top=Math.max(40,y)+'px';}
  function ipGizle(){ip.hidden=true;[].forEach.call(document.querySelectorAll('.st-cizim .aktif,.dg-d .aktif'),function(e){e.classList.remove('aktif');});var c=document.querySelectorAll('.st-cz');[].forEach.call(c,function(e){e.style.opacity=0;});}
  document.addEventListener('pointerdown',function(e){if(!e.target.closest||!e.target.closest('.st-cizim,.dg-d'))ipGizle();},{passive:true});
  window.addEventListener('scroll',ipGizle,{passive:true});
  // ---- sutun grafigi ----
  function olcek(mx){var adim=[5,10,15,20,30,60,90,120,180,240,300,600,900,1200,1800,3000,6000],u=adim[adim.length-1];for(var i=0;i<adim.length;i++)if(mx/3<=adim[i]){u=adim[i];break;}return {ust:u*Math.max(1,Math.ceil(mx/u)),adim:u};}
  function sutun(kap,veri,vurguIdx,renkFn){
    // veri: [{v, etk, bas}]
    var W=330,H=150,ml=34,mb=20,mt=8,iw=W-ml-4,ih=H-mb-mt,n=veri.length,mx=0;veri.forEach(function(d){mx=Math.max(mx,d.v);});
    if(!mx){kap.innerHTML='<p class="st-bos">Bu aralıkta kayıt yok.</p>';return;}
    var o=olcek(mx),band=iw/n,bw=Math.min(24,Math.max(3,band*.62)),svg='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Çalışma süresi grafiği">';
    for(var t=0;t<=o.ust;t+=o.adim){var y=mt+ih-ih*t/o.ust;svg+='<line x1="'+ml+'" x2="'+W+'" y1="'+y+'" y2="'+y+'" stroke="'+css('--izgara')+'" stroke-width="1"/><text x="'+(ml-6)+'" y="'+(y+4)+'" text-anchor="end" font-size="10" fill="'+css('--yazi2')+'">'+(o.ust>=120?String(t/60).replace('.',',')+' sa':t+' dk')+'</text>';}
    veri.forEach(function(d,i){var x=ml+band*i+(band-bw)/2,h=d.v?Math.max(2,ih*d.v/o.ust):0,y=mt+ih-h,rr=Math.min(4,bw/2,h);
      var renk=renkFn?renkFn(i):(i===vurguIdx?'#FF8A1F':css('--vurgu'));
      svg+='<g data-i="'+i+'">'+(h?'<path class="bar" d="M'+x+','+(mt+ih)+'V'+(y+rr)+'Q'+x+','+y+' '+(x+rr)+','+y+'H'+(x+bw-rr)+'Q'+(x+bw)+','+y+' '+(x+bw)+','+(y+rr)+'V'+(mt+ih)+'Z" fill="'+renk+'"/>':'')+
        '<rect class="hit" x="'+(ml+band*i)+'" y="'+mt+'" width="'+band+'" height="'+(ih+mb)+'"/>'+
        (d.etk?'<text x="'+(ml+band*i+band/2)+'" y="'+(H-5)+'" text-anchor="middle" font-size="10" fill="'+css('--yazi2')+'">'+esc(d.etk)+'</text>':'')+'</g>';});
    svg+='<line x1="'+ml+'" x2="'+W+'" y1="'+(mt+ih)+'" y2="'+(mt+ih)+'" stroke="'+css('--soluk')+'" stroke-width="1"/></svg>';
    kap.innerHTML=svg;
    [].forEach.call(kap.querySelectorAll('g[data-i]'),function(g){var d=veri[+g.dataset.i];
      g.addEventListener('pointerdown',function(e){e.stopPropagation();ipGizle();g.classList.add('aktif');ipGoster(g.querySelector('.bar')||g.querySelector('.hit'),'<b>'+sk(d.v)+'</b><br><small>'+esc(d.bas)+'</small>');});});
  }
  // ---- cizgi grafigi ----
  function cizgi(kap,etiketler,seriler){
    var W=330,H=150,ml=34,mb=20,mt=10,mr=8,iw=W-ml-mr,ih=H-mb-mt,n=etiketler.length,mx=0;
    seriler.forEach(function(s){s.v.forEach(function(v){mx=Math.max(mx,v);});});
    if(!mx||n<2){kap.innerHTML='<p class="st-bos">Grafik için yeterli kayıt yok.</p>';return;}
    var o=olcek(mx),X=function(i){return ml+iw*i/(n-1);},Y=function(v){return mt+ih-ih*v/o.ust;},svg='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Derslere göre çalışma süresi">';
    for(var t=0;t<=o.ust;t+=o.adim)svg+='<line x1="'+ml+'" x2="'+W+'" y1="'+Y(t)+'" y2="'+Y(t)+'" stroke="'+css('--izgara')+'" stroke-width="1"/><text x="'+(ml-6)+'" y="'+(Y(t)+4)+'" text-anchor="end" font-size="10" fill="'+css('--yazi2')+'">'+(o.ust>=120?String(t/60).replace('.',',')+' sa':t+' dk')+'</text>';
    var her=Math.ceil(n/6);etiketler.forEach(function(e,i){if(i%her===0||i===n-1)svg+='<text x="'+X(i)+'" y="'+(H-5)+'" text-anchor="'+(i===0?'start':i===n-1?'end':'middle')+'" font-size="10" fill="'+css('--yazi2')+'">'+esc(e.k)+'</text>';});
    svg+='<line class="st-cz" x1="0" x2="0" y1="'+mt+'" y2="'+(mt+ih)+'" stroke="'+css('--yazi2')+'" stroke-width="1" style="opacity:0"/>';
    seriler.forEach(function(s){svg+='<polyline fill="none" stroke="'+s.renk+'" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" points="'+s.v.map(function(v,i){return X(i).toFixed(1)+','+Y(v).toFixed(1);}).join(' ')+'"/>';
      svg+='<circle cx="'+X(n-1)+'" cy="'+Y(s.v[n-1])+'" r="4" fill="'+s.renk+'" stroke="'+css('--ust')+'" stroke-width="2"/>';});
    var bw=iw/(n-1);for(var i=0;i<n;i++)svg+='<rect class="hit" data-i="'+i+'" x="'+(X(i)-bw/2)+'" y="'+mt+'" width="'+bw+'" height="'+ih+'"/>';
    kap.innerHTML=svg+'</svg>';
    var cz=kap.querySelector('.st-cz');
    [].forEach.call(kap.querySelectorAll('rect.hit'),function(h){h.addEventListener('pointerdown',function(e){e.stopPropagation();var i=+h.dataset.i;
      cz.setAttribute('x1',X(i));cz.setAttribute('x2',X(i));cz.style.opacity=1;
      var html='<small>'+esc(etiketler[i].b)+'</small>';seriler.forEach(function(s){html+='<div class="sr"><u style="background:'+s.renk+'"></u><b>'+sk(s.v[i])+'</b> <small>'+esc(s.ad)+'</small></div>';});
      ipGoster(h,html);});});
  }
  // ---- ana cizim ----
  // ---- notlar, ders detayi, analiz ----
  var SON=null;
  function notlar(){try{return JSON.parse(localStorage.getItem('mf-notlar')||'[]').map(function(x){x.ders=dAd(x.ders);return x;});}catch(e){return [];}}
  function shAc(id){var p=$(id);p.classList.add('acik');requestAnimationFrame(function(){requestAnimationFrame(function(){p.classList.add('gor');});});}
  function shKapat(id){var p=$(id);p.classList.remove('gor');setTimeout(function(){p.classList.remove('acik');},280);}
  ['ders-p','an-p'].forEach(function(id){$(id).addEventListener('click',function(e){if(e.target===$(id))shKapat(id);});});
  $('ders-p-kapat').addEventListener('click',function(){shKapat('ders-p');});$('an-kapat').addEventListener('click',function(){shKapat('an-p');if(AN_ONER&&AN_ONER[2]&&window.MF_PR_SEC)setTimeout(function(){window.MF_PR_SEC(AN_ONER[0]);},300);else if(AN_ONER&&window.MF_PR_ONER)setTimeout(function(){window.MF_PR_ONER(AN_ONER[0],AN_ONER[1]);},300);else if(window.MF_SAYFA){setTimeout(function(){window.MF_SAYFA('sayac');window.scrollTo(0,0);},300);}});
  $('an-vazgec').addEventListener('click',function(){shKapat('an-p');});
  function gunOnce(t){var a=new Date();a.setHours(0,0,0,0);var b=new Date(t);b.setHours(0,0,0,0);return Math.round((a-b)/864e5);}
  function onceYaz(n){return n===0?'bugün':n===1?'dün':n+' gün önce';}
  function dersDk(k,ad,t){var x=k[gunK(t)];if(!x||!x.d)return 0;var s=0;for(var z in x.d)if(dAd(z)===ad)s+=x.d[z];return s;}
  function sonCalisma(k,ad){for(var i=0;i<400;i++){if(dersDk(k,ad,Date.now()-i*864e5)>0)return i;}return null;}
  function dersAc(ad){if(!SON)return;var k=SON.k,GUN=Math.max(7,SON.GUN),simdi=Date.now(),v=[],top=0,gun=0;
    for(var i=GUN-1;i>=0;i--){var t=simdi-i*864e5,m=dersDk(k,ad,t);top+=m;if(m)gun++;var dt=new Date(t);v.push({v:m,etk:GUN<=7?['Paz','Pzt','Sal','Çar','Per','Cum','Cmt'][dt.getDay()]:(i%Math.ceil(GUN/6)===0?dt.getDate()+' '+AYK2[dt.getMonth()]:''),bas:dt.getDate()+' '+AYK2[dt.getMonth()]});}
    var basT=new Date(simdi-(GUN-1)*864e5);basT.setHours(0,0,0,0);
    var nt=SON.NOT.filter(function(x){return x.ders===ad&&new Date(x.t)>=basT;}),sq=0,sd=0,sy=0;nt.forEach(function(x){if(x.soru){sq+=x.soru;sd+=x.d||0;sy+=x.y||0;}});
    var sc=sonCalisma(k,ad),ar={bugun:'son 7 gün',hafta:'son 7 gün',ay:'son 30 gün',ay3:'son 3 ay',yil:'son 1 yıl'}[SON.ARALIK];
    $('ders-p-b').textContent=ad;$('ders-p-a').textContent=ar;
    var o='<div class="st-kpi"><div><span>Toplam süre</span><b>'+kpiS(top)+'</b><small>'+gun+' / '+GUN+' gün çalıştın</small></div><div><span>Son çalışma</span><b>'+(sc===null?'–':onceYaz(sc))+'</b><small>'+(top&&gun?'çalıştığın günlerde ort. '+sk(top/gun):'')+'</small></div>'+
      '<div class="genis"><span>Çözülen soru</span><b>'+sq+' ✏️</b><small>'+(sq?(sd+sy?'%'+Math.round(sd*100/(sd+sy))+' doğru · '+sd+' D, '+sy+' Y':'doğru/yanlış girilmedi'):'Bu derste soru kaydı yok')+'</small></div></div>';
    o+='<div class="st-blok"><div class="st-bas"><b>Günlük çalışma</b><span>'+ar+'</span></div><div class="st-cizim" id="dp-graf"></div></div>';
    var kn=nt.filter(function(x){return x.konu||x.soru;}).slice(-6).reverse();
    if(kn.length)o+='<div class="st-blok"><div class="st-bas"><b>Son notların</b><span></span></div><ul class="dp-konu">'+kn.map(function(x){var d=new Date(x.t);return '<li><span>'+esc(x.konu||x.yapti)+'</span><small>'+(x.soru?x.soru+' soru'+(x.d!=null?' · '+x.d+'D '+(x.y||0)+'Y':'')+' · ':'')+d.getDate()+' '+AYK2[d.getMonth()]+'</small></li>';}).join('')+'</ul></div>';
    $('ders-p-ic').innerHTML=o;sutun($('dp-graf'),v,-1,function(){return SON.renk(ad);});shAc('ders-p');}
  // --- analiz ---
  function haftaDers(k,bas,uzun){var o={},t=0;for(var i=bas;i<bas+uzun;i++){var x=k[gunK(Date.now()-i*864e5)];if(x&&x.d)for(var z in x.d){var a=dAd(z);o[a]=(o[a]||0)+x.d[z];t+=x.d[z];}}return {d:o,t:t};}
  function ekN(n,acc){n=Math.abs(Math.round(n));var u=n%10,t=Math.floor(n/10)%10,son;
    if(n===0)son='ı';else if(u)son=['','i','si','ü','ü','i','sı','si','i','u'][u];else if(t)son=['','u','si','u','ı','si','ı','i','i','ı'][t];else son='ü';
    var v=son.slice(-1),sesli=son.length>1;return '\''+(sesli?'s':'')+v+(acc?'n'+v:'');}
  function yuzde(a,b){return b?Math.round((a-b)*100/b):null;}
  function programUyum(k){var G;try{G=JSON.parse(localStorage.getItem('mf-program-gecmis')||'{}');}catch(e){return null;}
    var ks=Object.keys(G).map(function(x){var p=x.split('-');return [x,new Date(+p[0],+p[1]-1,+p[2],12)];}).sort(function(a,b){return b[1]-a[1];});
    var bugun=new Date();bugun.setHours(23,59,0,0);var sonuc=[];
    ks.slice(0,3).forEach(function(e){var plan=G[e[0]],hed=0,yap=0,hedBug=0,acik={},dset={};
      for(var j=0;j<7;j++){var t=new Date(e[1]);t.setDate(t.getDate()+j);var gecti=t<=bugun;(plan[j]||[]).forEach(function(o){var a=dAd(o.ders);dset[a]=1;var y=Math.min(o.dk,dersDk(k,a,t.getTime()));hed+=o.dk;if(gecti){hedBug+=o.dk;yap+=y;acik[a]=(acik[a]||0)+(o.dk-y);}else{}});}
      if(hed)sonuc.push({bas:e[1],hed:hed,hedBug:hedBug,yap:yap,acik:acik,dset:dset});});
    return sonuc;}
  function analiz(){var k;try{k=JSON.parse(localStorage.getItem('pm-kayit')||'{}');}catch(e){k={};}
    var B=haftaDers(k,0,7),O=haftaDers(k,7,7),D4=haftaDers(k,7,28),N=notlar(),H=[],ON=[];AN_ONER=null;
    var bugunDk=haftaDers(k,0,1).t,aktif=0;for(var i=0;i<7;i++){var x=k[gunK(Date.now()-i*864e5)];if(x&&x.dk>0)aktif++;}
    if(B.t+O.t<30){$('an-ic').innerHTML='<div class="an-one"><p class="an-krit">Henüz yeterli kayıt yok</p><p class="an-iyi">Birkaç gün sayaçla çalış, analizin burada hazır olacak.</p></div>';anButon();return;}
    var f=yuzde(B.t,O.t),ort=B.t/7;
    var tum={};Object.keys(B.d).concat(Object.keys(O.d)).forEach(function(a){tum[a]=1;});
    var degis=Object.keys(tum).map(function(a){return [a,(B.d[a]||0)-(O.d[a]||0),B.d[a]||0,O.d[a]||0];});
    var art=degis.filter(function(x){return x[1]>=20&&x[3]>0;}).sort(function(a,b){return b[1]-a[1];});
    var az=degis.filter(function(x){return x[1]<=-20&&x[2]>0;}).sort(function(a,b){return a[1]-b[1];});
    var yeni=Object.keys(B.d).filter(function(a){return !D4.d[a]&&B.d[a]>=20;});
    var PU=programUyum(k),PRG=!!(PU&&PU.length&&new Date()-PU[0].bas<8*864e5),PSET=PRG?PU[0].dset:null;
    var ihmal=Object.keys(D4.d).filter(function(a){return !B.d[a]&&D4.d[a]>=40&&(!PSET||PSET[a]);}).map(function(a){return [a,sonCalisma(k,a)];}).sort(function(a,b){return b[1]-a[1];});
    var bas=Object.keys(B.d).sort(function(a,b){return B.d[b]-B.d[a];})[0];
    // soru
    var b7=Date.now()-7*864e5,b14=Date.now()-14*864e5,S1={q:0,d:0,y:0,dr:{}},S0={q:0,d:0,y:0};
    N.forEach(function(x){var t=new Date(x.t).getTime();if(!x.soru)return;var S=t>=b7?S1:(t>=b14?S0:null);if(!S)return;S.q+=x.soru;S.d+=x.d||0;S.y+=x.y||0;
      if(S===S1){var r=S1.dr[x.ders]=S1.dr[x.ders]||{q:0,d:0,y:0};r.q+=x.soru;r.d+=x.d||0;r.y+=x.y||0;}});
    var dog1=S1.d+S1.y?Math.round(S1.d*100/(S1.d+S1.y)):null,dog0=S0.d+S0.y?Math.round(S0.d*100/(S0.d+S0.y)):null;
    var dl=Object.keys(S1.dr).filter(function(a){var r=S1.dr[a];return r.d+r.y>=15;}).map(function(a){var r=S1.dr[a];return [a,Math.round(r.d*100/(r.d+r.y))];}).sort(function(a,b){return a[1]-b[1];});
    var zayif=dl.length&&dl[0][1]<65?dl[0]:null;
    // program
    var geri=null,tYz=null,onc=null;
    if(PRG){var bu=PU[0];tYz=Math.round(bu.yap*100/bu.hed);if(PU[1])onc=Math.round(Math.min(PU[1].yap,PU[1].hed)*100/PU[1].hed);
      var ac=Object.keys(bu.acik).filter(function(a){return bu.acik[a]>=15;}).sort(function(a,b){return bu.acik[b]-bu.acik[a];});if(ac.length)geri=[ac[0],bu.acik[ac[0]]];}
    // --- one cikan: 1 kritik + 1 olumlu ---
    var krit=null,iyi=null;
    if(PRG&&geri)krit='Programında '+esc(geri[0])+' '+sk(geri[1])+' geride.';
    else if(ihmal.length)krit=esc(ihmal[0][0])+' '+ihmal[0][1]+' gündür seni bekliyor.';
    else if(zayif)krit=esc(zayif[0])+' sorularında doğruluk %'+zayif[1]+'.';
    else if(f!==null&&f<=-20)krit='Bu hafta %'+(-f)+' daha az çalıştın.';
    if(art.length)iyi=esc(ekDat(art[0][0]))+' ayırdığın süre '+sk(art[0][1])+' arttı.';
    else if(dog1!==null&&dog0!==null&&dog1>dog0)iyi='Doğruluğun yükseldi: %'+dog0+' → %'+dog1+'.';
    else if(f!==null&&f>=5)iyi='Geçen haftadan %'+f+' daha fazla çalıştın.';
    else if(yeni.length)iyi=esc(yeni[0])+' çalışmaya başladın.';
    else if(aktif>=5)iyi='7 günün '+aktif+' gününde masadaydın, istikrarın güzel.';
    else if(bugunDk>=ort&&bugunDk)iyi='Bugün ortalamanın üstündesin.';
    else iyi='Her kayıt bir adım: devam ettiğin sürece toparlarsın.';
    // --- bolumler (en fazla 2 kisa cumle) ---
    H.push(['Genel','<b>'+sk(B.t)+'</b>'+(f===null?'':' <span class="'+(f>=5?'art':f<=-5?'azal':'')+'">('+(f>=5?'▲ %'+f:f<=-5?'▼ %'+(-f):'≈ aynı')+')</span>')+' · '+aktif+' gün · günde ort. '+sk(ort)+'.']);
    var dp=[];if(bas)dp.push('En çok <b>'+esc(bas)+'</b> (%'+Math.round(B.d[bas]*100/B.t)+').');
    var ad2=[];if(art.length)ad2.push('<span class="art">▲ '+esc(art[0][0])+' +'+sk(art[0][1])+'</span>');if(az.length)ad2.push('<span class="azal">▼ '+esc(az[0][0])+' −'+sk(-az[0][1])+'</span>');
    if(ad2.length)dp.push(ad2.join(' · ')+'.');
    if(ihmal.length>1)dp.push(esc(deDa(ihmal[1][0]))+' '+ihmal[1][1]+' gündür ara verdi.');
    H.push(['Dersler',dp.slice(0,3).join(' ')||'Belirgin bir değişiklik yok.']);
    if(S1.q)H.push(['Soru','<b>'+S1.q+' soru</b>'+(dog1!==null?', doğruluk <b>%'+dog1+'</b>'+(dog0!==null?' <span class="'+(dog1>dog0?'art':dog1<dog0?'azal':'')+'">(önce %'+dog0+')</span>':''):'')+'.'+(dl.length>1?' En iyi '+esc(dl[dl.length-1][0])+' %'+dl[dl.length-1][1]+', en zayıf '+esc(dl[0][0])+' %'+dl[0][1]+'.':'')]);
    else H.push(['Soru','Bu hafta soru kaydı yok. Seans sonunda soru sayını girersen doğruluğunu da görürsün.']);
    if(!PRG)H.push(['Program','Haftalık programın yok. <b>Program</b> sekmesinden kurarsan analizini planına göre yaparım.']);
    if(tYz!==null)H.push(['Program','Haftanın <b>%'+tYz+ekN(tYz)+'</b> tamam'+(onc!==null?' (geçen hafta %'+onc+')':'')+'.'+(geri?' En çok geride: '+esc(geri[0])+'.':'')]);
    try{var DL=JSON.parse(localStorage.getItem('mf-denemeler')||'[]');if(DL.length>=2){var s1=DL[DL.length-1],s0=null;for(var j=DL.length-2;j>=0;j--)if(DL[j].sinav===s1.sinav&&JSON.stringify(DL[j].ozel||'')===JSON.stringify(s1.ozel||'')){s0=DL[j];break;}
      if(s0){var fn=Math.round((s1.net-s0.net)*100)/100;H.push(['Deneme','Son net <b>'+String(s1.net).replace('.',',')+'</b> '+(fn>0?'<span class="art">(▲ '+String(fn).replace('.',',')+')</span>':fn<0?'<span class="azal">(▼ '+String(-fn).replace('.',',')+')</span>':'(aynı)')+'.']);}}}catch(e){}
    // --- oneriler (en fazla 2) + uygulanacak ders ---
    if(geri){ON.push('<b>'+esc(geri[0])+'</b> için bugün '+sk(Math.min(geri[1],60))+' ayırırsan programı yakalarsın.');AN_ONER=[geri[0],Math.min(60,Math.max(25,Math.round(geri[1]/5)*5)),window.MF_PR_BUGUN&&window.MF_PR_BUGUN(geri[0])];}
    if(ihmal.length){ON.push('<b>'+esc(ihmal[0][0])+'</b> için kısa bir tekrar seansı yap'+(PRG?'; programında var ama '+ihmal[0][1]+' gündür açılmadı.':'.'));if(!AN_ONER)AN_ONER=[ihmal[0][0],40];}
    if(zayif)ON.push('<b>'+esc(ekLoc(zayif[0]))+'</b> yeni soruya geçmeden yanlışlarının çözümüne dön.');
    if(aktif<5)ON.push('Her gün kısa da olsa çalışmak, seyrek ve uzun seanslardan daha kalıcı.');
    if(!ON.length)ON.push('Dengen iyi. Yarınki ilk seansını şimdiden planla.');
    if(!AN_ONER&&az.length)AN_ONER=[az[0][0],40];
    var o='<div class="an-one">'+(krit?'<p class="an-krit">'+krit+'</p>':'')+'<p class="an-iyi">'+iyi+'</p></div>';
    o+='<div class="an-k an-liste">'+H.map(function(h){return '<div class="an-s"><span>'+h[0]+'</span><p>'+h[1]+'</p></div>';}).join('')+'</div>';
    o+='<div class="an-k oneri"><h4>💡 Bugün için</h4><ul>'+ON.slice(0,2).map(function(x){return '<li>'+x+'</li>';}).join('')+'</ul></div>';
    $('an-ic').innerHTML=o;anButon();
  }
  var AN_ONER=null;
  function sesliU(w){var m=String(w).toLowerCase().match(/[aeıioöuü](?=[^aeıioöuü]*$)/);return m?m[0]:'e';}
  function kalin(w){return 'aıou'.indexOf(sesliU(w))>=0;}
  function ekDat(w){var v=kalin(w)?'a':'e',son=String(w).slice(-1).toLowerCase();return w+'\''+('aeıioöuü'.indexOf(son)>=0?'y':'')+v;}
  function ekLoc(w){var v=kalin(w)?'a':'e',son=String(w).slice(-1).toLowerCase();return w+'\''+('çfhkpsşt'.indexOf(son)>=0?'t':'d')+v;}
  function deDa(w){return w+' '+(kalin(w)?'da':'de');}
  function anButon(){var b=$('an-kapat'),a=$('an-uygula-a');
    if(AN_ONER&&AN_ONER[2]){b.textContent='Önerileri uygula';a.textContent=AN_ONER[0]+' bugünkü programında var. Sayaç '+AN_ONER[0]+' seçili açılacak.';a.hidden=false;}
    else if(AN_ONER&&window.MF_PR_ONER){b.textContent='Önerileri uygula';a.textContent='Bugünkü programına '+AN_ONER[0]+' ('+AN_ONER[1]+' dk) eklenecek';a.hidden=false;}
    else{b.textContent='Hadi başlayalım';a.textContent='';a.hidden=true;}}
  $('an-btn').addEventListener('click',function(){var d=new Date();$('an-p-a').textContent='son 7 gün · '+d.getDate()+' '+AYK2[d.getMonth()];analiz();shAc('an-p');});
  // ---- deneme grafikleri ----
  var dgSec=null,AYK2=['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
  function nY(n){return (Math.round(n*100)/100).toString().replace('.',',');}
  function netOlcek(mx){var A=[1,2,5,10,20,25,50],u=50;for(var i=0;i<A.length;i++)if(mx/4<=A[i]){u=A[i];break;}return {ust:u*Math.max(1,Math.ceil(mx/u)),adim:u};}
  function netSutun(kap,veri,ust){
    var W=330,H=150,ml=28,mb=20,mt=16,iw=W-ml-4,ih=H-mb-mt,n=veri.length,mx=0;veri.forEach(function(d){mx=Math.max(mx,d.v||0);});
    var o=netOlcek(Math.max(1,mx)),band=iw/Math.max(n,5),bw=Math.min(26,band*.62),x0=ml+(iw-band*n)/2,son=n-1,etAdim=n>7?2:1;
    var svg='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Deneme toplam net grafiği">';
    for(var t=0;t<=o.ust;t+=o.adim){var y=mt+ih-ih*t/o.ust;svg+='<line x1="'+ml+'" x2="'+W+'" y1="'+y+'" y2="'+y+'" stroke="'+css('--izgara')+'"/><text x="'+(ml-6)+'" y="'+(y+4)+'" text-anchor="end" font-size="10" fill="'+css('--yazi2')+'">'+t+'</text>';}
    veri.forEach(function(d,i){var v=Math.max(0,d.v||0),x=x0+band*i+(band-bw)/2,h=v?Math.max(2,ih*v/o.ust):0,y=mt+ih-h,rr=Math.min(4,bw/2,h);
      svg+='<g data-i="'+i+'">'+(h?'<path class="bar" d="M'+x+','+(mt+ih)+'V'+(y+rr)+'Q'+x+','+y+' '+(x+rr)+','+y+'H'+(x+bw-rr)+'Q'+(x+bw)+','+y+' '+(x+bw)+','+(y+rr)+'V'+(mt+ih)+'Z" fill="'+(i===son?'#FF8A1F':css('--vurgu'))+'"/>':'')+
        (i===son?'<text x="'+(x+bw/2)+'" y="'+(y-4)+'" text-anchor="middle" font-size="11" font-weight="800" fill="'+css('--yazi')+'">'+nY(d.v)+'</text>':'')+
        '<rect class="hit" x="'+(x0+band*i)+'" y="0" width="'+band+'" height="'+H+'"/>'+
        ((son-i)%etAdim===0?'<text x="'+(x0+band*i+band/2)+'" y="'+(H-5)+'" text-anchor="middle" font-size="10" fill="'+css('--yazi2')+'">'+esc(d.etk)+'</text>':'')+'</g>';});
    svg+='<line x1="'+ml+'" x2="'+W+'" y1="'+(mt+ih)+'" y2="'+(mt+ih)+'" stroke="'+css('--soluk')+'"/></svg>';
    kap.innerHTML=svg;dgIpucu(kap,veri);
  }
  function miniSutun(veri,ust){
    var W=150,H=44,n=veri.length,band=W/Math.max(n,5),bw=Math.min(14,band*.62),x0=(W-band*n)/2,son=n-1,svg='<svg viewBox="0 0 '+W+' '+(H+2)+'" aria-hidden="true">';
    veri.forEach(function(d,i){var v=d.v,x=x0+band*i+(band-bw)/2;
      if(v===null){svg+='<g data-i="'+i+'"><rect x="'+(x+bw/2-1.5)+'" y="'+(H-3)+'" width="3" height="3" rx="1.5" fill="'+css('--soluk')+'"/><rect class="hit" x="'+(x0+band*i)+'" y="0" width="'+band+'" height="'+H+'"/></g>';return;}
      var h=Math.max(v>0?2:0,H*Math.max(0,v)/ust),y=H-h,rr=Math.min(3,bw/2,h);
      svg+='<g data-i="'+i+'">'+(h?'<path class="bar" d="M'+x+','+H+'V'+(y+rr)+'Q'+x+','+y+' '+(x+rr)+','+y+'H'+(x+bw-rr)+'Q'+(x+bw)+','+y+' '+(x+bw)+','+(y+rr)+'V'+H+'Z" fill="'+(i===son?'#FF8A1F':css('--vurgu'))+'"/>':'')+'<rect class="hit" x="'+(x0+band*i)+'" y="0" width="'+band+'" height="'+H+'"/></g>';});
    return svg+'<line x1="0" x2="'+W+'" y1="'+H+'" y2="'+H+'" stroke="'+css('--soluk')+'"/></svg>';
  }
  function dgIpucu(kap,veri){[].forEach.call(kap.querySelectorAll('g[data-i]'),function(g){var d=veri[+g.dataset.i];
    g.addEventListener('pointerdown',function(e){e.stopPropagation();ipGizle();g.classList.add('aktif');ipGoster(g.querySelector('.bar')||g.querySelector('.hit'),'<b>'+(d.v===null?'Girilmedi':nY(d.v)+' net')+'</b><br><small>'+esc(d.bas)+'</small>');});});}
  window.MF_DNM_CIZ=function(G){
    var kap=$('dnm-graf');if(!kap)return;if(!G.length){kap.innerHTML='';return;}
    var g=G.filter(function(x){return x.k===dgSec;})[0]||G[0];dgSec=g.k;
    var L=g.l.slice(-10),o='';
    if(G.length>1)o+='<div class="dg-cip" role="tablist">'+G.map(function(x){return '<button type="button" role="tab" aria-selected="'+(x===g)+'" data-k="'+esc(x.k)+'" class="'+(x===g?'on':'')+'">'+esc(x.ad)+'</button>';}).join('')+'</div>';
    var nl=g.l.map(function(x){return x.net;}),son=nl[nl.length-1],ort=nl.reduce(function(a,b){return a+b;},0)/nl.length,en=Math.max.apply(null,nl),f=nl.length>1?son-nl[nl.length-2]:null;
    o+='<div class="st-kpi"><div><span>Son deneme</span><b>'+nY(son)+'</b><small class="'+(f>0?'art':f<0?'azal':'')+'">'+(f===null?g.top+' soru':f>0?'▲ +'+nY(f):f<0?'▼ '+nY(f):'aynı')+'</small></div>'+
      '<div><span>Ortalama</span><b>'+nY(Math.round(ort*100)/100)+'</b><small>'+nl.length+' deneme</small></div><div><span>En yüksek</span><b>'+nY(en)+'</b><small>'+g.top+' soruda</small></div></div>';
    o+='<div class="st-blok"><div class="st-bas"><b>Toplam net</b><span>'+(g.l.length>10?'son 10 deneme':g.l.length+' deneme')+'</span></div><div class="st-cizim" id="dg-top"></div></div>';
    if(g.d.length>1)o+='<div class="st-blok"><div class="st-bas"><b>Derslere göre</b><span>turuncu: son deneme</span></div><div class="dg-dersler" id="dg-dersler"></div></div>';
    kap.innerHTML=o;
    function tEt(t){var d=new Date(t);return d.getDate()+' '+AYK2[d.getMonth()];}
    function bas(x){var d=new Date(x.t);return d.getDate()+' '+AYK2[d.getMonth()]+' '+d.getFullYear()+(x.ad?' · '+x.ad:'');}
    netSutun($('dg-top'),L.map(function(x){return {v:x.net,etk:tEt(x.t),bas:bas(x)};}),g.top);
    if(g.d.length>1){var dk=$('dg-dersler');
      dk.innerHTML=g.d.map(function(dd,j){var v=L.map(function(x){return x.dn[dd[0]];}),dolu=v.filter(function(x){return x!==null;}),sn=dolu.length?dolu[dolu.length-1]:null,on=dolu.length>1?dolu[dolu.length-2]:null,ff=sn!==null&&on!==null?sn-on:null;
        return '<div class="dg-d" data-j="'+j+'"><div class="dg-d-u"><span>'+esc(dd[1])+'</span><b>'+(sn===null?'–':nY(sn))+'</b></div><small class="'+(ff>0?'art':ff<0?'azal':'')+'">'+(ff===null?dd[2]+' soru':ff>0?'▲ +'+nY(ff):ff<0?'▼ '+nY(ff):'aynı')+'</small>'+miniSutun(v.map(function(x){return {v:x};}),dd[2])+'</div>';}).join('');
      [].forEach.call(dk.querySelectorAll('.dg-d'),function(c){var dd=g.d[+c.dataset.j];dgIpucu(c,L.map(function(x){return {v:x.dn[dd[0]],bas:dd[1]+' · '+bas(x)};}));});}
    [].forEach.call(kap.querySelectorAll('.dg-cip button'),function(b){b.addEventListener('click',function(){dgSec=b.dataset.k;window.MF_DNM_CIZ(G);});});
  };
  if(window.MF_DNM_YENILE)window.MF_DNM_YENILE();
  window.MF_IST=function(k,ARALIK){
    var simdi=Date.now(),GUN={bugun:1,hafta:7,ay:30,ay3:91,yil:365}[ARALIK]||1;
    function gunVeri(i){var t=simdi-i*864e5,x=k[gunK(t)]||{dk:0,p:0,d:{}};return {t:t,dk:x.dk||0,p:x.p||0,d:x.d||{}};}
    var g=[],once=[];for(var i=GUN-1;i>=0;i--)g.push(gunVeri(i));for(var j=2*GUN-1;j>=GUN;j--)once.push(gunVeri(j));
    var top=0,pom=0,aktif=0,top0=0;g.forEach(function(x){top+=x.dk;pom+=x.p;if(x.dk>0)aktif++;});once.forEach(function(x){top0+=x.dk;});
    // seri: bugunden geriye kesintisiz gun
    var seri=0,bas=(k[gunK(simdi)]&&k[gunK(simdi)].dk>0)?0:1;for(var s1=bas;s1<4000;s1++){var y=k[gunK(simdi-s1*864e5)];if(y&&y.dk>0)seri++;else break;}
    // renkler: tum zamanlar siralamasi (aralik degisince renk degismez)
    var tum={};for(var gk in k)for(var z in (k[gk].d||{})){var a=dAd(z);tum[a]=(tum[a]||0)+k[gk].d[z];}
    var sira=Object.keys(tum).sort(function(a,b){return tum[b]-tum[a];});
    var RV=['--y1','--y2','--y3','--y4','--y5','--y6','--y7'];function renk(ad){var i=sira.indexOf(ad);return i>=0&&i<7?css(RV[i]):css('--ydiger');}
    // --- KPI ---
    var NOT=notlar(),basT=new Date(g[0].t);basT.setHours(0,0,0,0);var nA=NOT.filter(function(x){return new Date(x.t)>=basT;}),sq=0,sd=0,sy=0;
    nA.forEach(function(x){if(x.soru){sq+=x.soru;if(x.d!=null||x.y!=null){sd+=x.d||0;sy+=x.y||0;}}});
    var once_ad={bugun:'düne',hafta:'önceki 7 güne',ay:'önceki 30 güne',ay3:'önceki 3 aya',yil:'önceki yıla'}[ARALIK];
    var fark=top0?Math.round((top-top0)*100/top0):null;
    var kpi='<div><span>Toplam çalışma</span><b>'+kpiS(top)+'</b><small class="'+(fark===null?'':fark>0?'art':fark<0?'azal':'')+'">'+(fark===null?(top?'İlk kayıtlar':'Henüz kayıt yok'):(fark>0?'▲ %'+fark:fark<0?'▼ %'+(-fark):'= aynı')+' '+once_ad+' göre')+'</small></div>';
    kpi+=GUN>1?'<div><span>Günlük ortalama</span><b>'+sk(aktif?top/aktif:0)+'</b><small>'+aktif+' / '+GUN+' gün çalıştın</small></div>':'<div><span>Bugünkü oturum</span><b>'+(g[0].p)+' tur</b><small>tamamlanan odak turu</small></div>';
    kpi+='<div><span>Odak turu</span><b>'+pom+'</b><small>'+(GUN>1?'bu aralıkta':'bugün')+'</small></div>';
    kpi+='<div><span>Seri</span><b>'+seri+' gün 🔥</b><small>'+(seri?'aralıksız çalıştığın gün':'bugün başla, seri başlasın')+'</small></div>';
    kpi+='<div class="genis"><span>Çözülen soru</span><b>'+sq+' ✏️</b><small>'+(sq?(sd+sy?'%'+Math.round(sd*100/(sd+sy))+' doğru · '+sd+' D, '+sy+' Y':'doğru/yanlış girilmedi'):'Seans sonunda soru sayını girersen burada görünür')+'</small></div>';
    $('st-kpi').innerHTML=kpi;
    SON={k:k,g:g,GUN:GUN,renk:renk,NOT:NOT,ARALIK:ARALIK};
    // --- calisma suresi (sutun) ---
    var sv=[],ett=$('st-sure-b');
    if(GUN===1){$('st-sure').hidden=true;}else{$('st-sure').hidden=false;
      if(GUN<=30)g.forEach(function(x,i){var d=new Date(x.t),son=i===g.length-1;sv.push({v:x.dk,etk:son?'Bugün':(GUN===7?GK[d.getDay()]:((g.length-1-i)%6===0?d.getDate()+'.'+(d.getMonth()+1):'')),bas:(son?'Bugün · ':'')+d.getDate()+' '+AY[d.getMonth()]+' '+GT[d.getDay()]});});
      else if(GUN===91)for(var w=0;w<13;w++){var tp=0,ilk=g[w*7];for(var z2=0;z2<7;z2++)if(g[w*7+z2])tp+=g[w*7+z2].dk;var bd=new Date(ilk.t);sv.push({v:tp,etk:w===12?'Bu hf.':(w%3===0?bd.getDate()+'.'+(bd.getMonth()+1):''),bas:bd.getDate()+' '+AY[bd.getMonth()]+' haftası'});}
      else{var sd=new Date(simdi);for(var m=11;m>=0;m--){var ay=new Date(sd.getFullYear(),sd.getMonth()-m,1),tp2=0;for(var key in k){var pp=key.split('-');if(+pp[0]===ay.getFullYear()&&+pp[1]===ay.getMonth()+1)tp2+=k[key].dk||0;}sv.push({v:tp2,etk:AYK[ay.getMonth()],bas:AY[ay.getMonth()]+' '+ay.getFullYear()});}}
      ett.textContent={hafta:'Günlük çalışma',ay:'Günlük çalışma',ay3:'Haftalık çalışma',yil:'Aylık çalışma'}[ARALIK];
      $('st-sure-o').textContent='Toplam '+eks(top);
      sutun($('st-sure-c'),sv,sv.length-1);}
    // --- ders dagilimi ---
    var dg={};g.forEach(function(x){for(var z in x.d){var a=dAd(z);dg[a]=(dg[a]||0)+x.d[z];}});
    var dl=Object.keys(dg).map(function(a){return [a,dg[a]];}).sort(function(a,b){return b[1]-a[1];}),dt=0;dl.forEach(function(x){dt+=x[1];});
    if(!dt){$('st-seg').innerHTML='';$('st-liste').innerHTML='<p class="st-bos">Bu aralıkta kayıt yok. Sayacı başlattığında burada görünecek.</p>';$('st-dag-o').textContent='';}
    else{
      // segment: renk alan dersler + diger
      var seg={},dig=0;dl.forEach(function(x){var i=sira.indexOf(x[0]);if(i>=0&&i<7)seg[x[0]]=x[1];else dig+=x[1];});
      var parca=Object.keys(seg).sort(function(a,b){return seg[b]-seg[a];}).map(function(a){return [a,seg[a],renk(a)];});if(dig)parca.push(['Diğer',dig,css('--ydiger')]);
      $('st-seg').innerHTML=parca.map(function(p){return '<i style="flex:'+p[1]+' 0 0;background:'+p[2]+'" title="'+esc(p[0])+'"></i>';}).join('');
      var en=dl[0][1];
      $('st-liste').innerHTML=dl.map(function(x){var yz=Math.round(x[1]*100/dt);return '<div class="st-satir" role="button" tabindex="0" data-ad="'+esc(x[0])+'"><u style="background:'+renk(x[0])+'"></u><span class="ad"><em>'+esc(x[0])+'</em><i><s style="width:'+Math.round(x[1]*100/en)+'%;background:'+renk(x[0])+'"></s></i></span><span class="yz">%'+yz+'</span><span class="dk">'+eks(x[1])+'</span></div>';}).join('');
      $('st-dag-o').textContent=dl.length+' ders';
      [].forEach.call($('st-liste').querySelectorAll('.st-satir[data-ad]'),function(e){e.addEventListener('click',function(){dersAc(e.getAttribute('data-ad'));});});
    }
    // --- trend (ilk 3 ders, cizgi) ---
    var uc=sira.filter(function(a){return dg[a];}).slice(0,3);
    if(GUN<7||!uc.length){$('st-trend').hidden=true;}else{$('st-trend').hidden=false;
      var kova=[];
      if(GUN===7)g.forEach(function(x,i){var d=new Date(x.t);kova.push({k:i===6?'Bugün':GK[d.getDay()],b:d.getDate()+' '+AY[d.getMonth()],gun:[x]});});
      else if(GUN===30||GUN===91){var hs=GUN===30?5:13,uz=Math.ceil(GUN/hs);for(var h1=0;h1<hs;h1++){var parc=g.slice(Math.max(0,GUN-(hs-h1)*uz),GUN-(hs-h1-1)*uz);if(!parc.length)continue;var d0=new Date(parc[0].t);kova.push({k:d0.getDate()+'.'+(d0.getMonth()+1),b:d0.getDate()+' '+AY[d0.getMonth()]+' ile başlayan '+parc.length+' gün',gun:parc});}}
      else{var sd2=new Date(simdi);for(var m2=11;m2>=0;m2--){var ay2=new Date(sd2.getFullYear(),sd2.getMonth()-m2,1);kova.push({k:AYK[ay2.getMonth()],b:AY[ay2.getMonth()]+' '+ay2.getFullYear(),gun:g.filter(function(x){var d=new Date(x.t);return d.getFullYear()===ay2.getFullYear()&&d.getMonth()===ay2.getMonth();})});}}
      var ser=uc.map(function(a){return {ad:a,renk:renk(a),v:kova.map(function(kv){var t2=0;kv.gun.forEach(function(x){for(var z in x.d)if(dAd(z)===a)t2+=x.d[z];});return t2;})};});
      $('st-trend-l').innerHTML=ser.map(function(s){return '<span><u style="background:'+s.renk+'"></u>'+esc(s.ad)+'</span>';}).join('');
      $('st-trend-o').textContent=GUN===7?'günlük':GUN===365?'aylık':'haftalık';
      cizgi($('st-trend-c'),kova.map(function(kv){return {k:kv.k,b:kv.b};}),ser);}
    // --- haftanin gunleri (ortalama) ---
    if(GUN<30){$('st-gun').hidden=true;}else{$('st-gun').hidden=false;
      var gt=[0,0,0,0,0,0,0],gs=[0,0,0,0,0,0,0];g.forEach(function(x){var gd=new Date(x.t).getDay();gt[gd]+=x.dk;gs[gd]++;});
      var sirali=[1,2,3,4,5,6,0],ort=sirali.map(function(d){return gs[d]?gt[d]/gs[d]:0;}),eni=0;ort.forEach(function(v,i){if(v>ort[eni])eni=i;});
      $('st-gun-o').textContent=ort[eni]?'En verimli: '+GT[sirali[eni]]:'';
      sutun($('st-gun-c'),ort.map(function(v,i){return {v:v,etk:GK[sirali[i]],bas:GT[sirali[i]]+' ortalaması'};}),-1,function(i){return i===eni?css('--vurgu'):css('--soluk');});}
  };
})();

(function(){
  // gece modu
  var h=document.documentElement,b=document.getElementById('tema');
  function boya(){var g=h.classList.contains('mf-gece');b.textContent=g?'☀️':'🌙';var m=document.querySelector('meta[name=color-scheme]');if(m)m.setAttribute('content',g?'dark':'light');}
  boya();b.addEventListener('click',function(){h.classList.toggle('mf-gece');try{localStorage.setItem('mf-tema',h.classList.contains('mf-gece')?'gece':'gunduz');}catch(e){}boya();if(window.MF_IST_YENILE)window.MF_IST_YENILE();if(window.MF_DNM_YENILE)window.MF_DNM_YENILE();});
  // service worker
  // Android uygulamasında (Capacitor) dosyalar zaten telefonda: service worker gerekmez
  if('serviceWorker' in navigator&&!window.Capacitor)window.addEventListener('load',function(){navigator.serviceWorker.register('sw.js');});
  // yükleme önerisi
  var olay=null,kutu=document.getElementById('yukle'),kapali=false;
  try{kapali=localStorage.getItem('mf-yukle-kapat')==='1';}catch(e){}
  var kurulu=window.matchMedia('(display-mode: standalone)').matches||navigator.standalone;
  var ios=/iphone|ipad|ipod/i.test(navigator.userAgent);
  window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();olay=e;if(!kapali&&!kurulu)kutu.classList.add('goster');});
  var uyg=/Instagram|FBAN|FBAV|FB_IAB|TikTok|musical_ly/i.test(navigator.userAgent);
  if(uyg&&!kurulu){kutu.querySelector('p').innerHTML='<b>Uygulamayı yükle</b><br>'+(ios?'Sağ üstteki <b>•••</b> menüsünden <b>Safari\'de aç</b>, sonra Paylaş → Ana Ekrana Ekle.':'Sağ üstteki <b>⋮</b> menüsünden <b>Tarayıcıda aç</b> / <b>Chrome\'da aç</b>, sonra Yükle\'ye dokun.');document.getElementById('yukle-btn').style.display='none';kutu.classList.add('goster');}
  else if(ios&&!kurulu&&!kapali){kutu.querySelector('p').innerHTML='<b>Uygulamayı yükle</b><br>Safari\'de <b>Paylaş</b> → <b>Ana Ekrana Ekle</b>.';document.getElementById('yukle-btn').style.display='none';kutu.classList.add('goster');}
  document.getElementById('yukle-btn').addEventListener('click',function(){if(!olay)return;olay.prompt();olay.userChoice.then(function(){kutu.classList.remove('goster');olay=null;});});
  document.getElementById('yukle-kapat').addEventListener('click',function(){kutu.classList.remove('goster');try{localStorage.setItem('mf-yukle-kapat','1');}catch(e){}});
  // koç takibi
  if(KOC_URL){
    var kk=document.getElementById('pm-koc'),ki=document.getElementById('pm-kod');kk.hidden=false;
    
    function kuyruk(){try{return JSON.parse(localStorage.getItem('mf-kuyruk')||'[]');}catch(e){return [];}}
    function kaydet(q){try{localStorage.setItem('mf-kuyruk',JSON.stringify(q));}catch(e){}}
    function durum(t,c){var e=document.getElementById('pm-koc-son');e.textContent=t;e.className=c||'';try{localStorage.setItem('mf-koc-son',JSON.stringify([t,c||'']));}catch(x){}}
    try{var sd=JSON.parse(localStorage.getItem('mf-koc-son')||'null');if(sd)durum(sd[0],sd[1]);}catch(x){}
    function saat(){var d=new Date();return (d.getHours()<10?'0':'')+d.getHours()+':'+(d.getMinutes()<10?'0':'')+d.getMinutes();}
    var gMesgul=false,gTekrar=false;
    function gonder(){
      if(gMesgul){gTekrar=true;return;}
      var q=kuyruk();if(!q.length)return;
      if(!navigator.onLine){durum('⏳ '+q.length+' kayıt internet bekliyor','');return;}
      var gruplar={};q.forEach(function(r){var k=r.kod||'';if(!k)return;var o={};for(var a in r){if(a!=='kod'&&a!=='notsuz')o[a]=r[a];}(gruplar[k]=gruplar[k]||[]).push(o);});
      var isler=Object.keys(gruplar).map(function(k){
        return fetch(KOC_URL,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain'},body:JSON.stringify({kod:k,kayitlar:gruplar[k]})});
      });
      gMesgul=true;
      Promise.all(isler).then(function(){kaydet(kuyruk().slice(q.length));durum('✓ Son gönderim '+saat(),'ok');}).catch(function(){durum('✗ Gönderilemedi, sonra tekrar denenecek','hata');}).then(function(){gMesgul=false;if(gTekrar){gTekrar=false;gonder();}});
    }
    function kayitliKod(){try{return localStorage.getItem('mf-koc-kod')||'';}catch(e){return '';}}
    function onayli(v){try{var o=JSON.parse(localStorage.getItem('mf-koc-onay')||'null');return !!(o&&o.kod===v);}catch(e){return false;}}
    var pen=document.getElementById('koc-onay'),o1=document.getElementById('onay-1'),o2=document.getElementById('onay-2'),ot=document.getElementById('onay-tamam'),bekleyen='';
    function arayuz(){var kod=kayitliKod();document.getElementById('koc-giris').hidden=!!kod;document.getElementById('pm-koc').classList.toggle('kucuk',!!kod);document.getElementById('koc-aktif').hidden=!kod;document.getElementById('koc-kod-goster').textContent=kod;if(!kod)ki.value='';
      var wa=document.getElementById('pm-wa'),wn=document.getElementById('pm-wa-not');if(wa)wa.style.display=kod?'none':'';if(wn)wn.style.display=kod?'none':'';}
    function kodUygula(v){try{localStorage.setItem('mf-koc-kod',v);}catch(e){}arayuz();durum('✓ Katıldın','ok');gonder();}
    function kodIste(){
      if(pen.classList.contains('acik'))return;
      var v=ki.value.trim().toUpperCase();ki.value=v;var mev=kayitliKod();
      if(v===mev)return;
      if(!v){kodKaldir(true);return;}
      if(onayli(v)){kodUygula(v);return;}
      bekleyen=v;o1.checked=false;o2.checked=false;ot.disabled=true;pen.classList.add('acik');
    }
    // kod kaldirilinca hocaya bildir; internet yoksa sonra gonder
    function ayrilBildir(kod){var cid='';try{cid=localStorage.getItem('mf-cihaz')||'';}catch(e){}
      var v={tip:'ayril',kod:kod,cihaz:cid,zaman:new Date().toISOString()};try{localStorage.setItem('mf-ayril',JSON.stringify(v));}catch(e){}ayrilGonder();}
    function ayrilGonder(){var v=null;try{v=JSON.parse(localStorage.getItem('mf-ayril')||'null');}catch(e){}if(!v||!navigator.onLine)return;
      fetch(KOC_URL,{method:'POST',mode:'no-cors',keepalive:true,headers:{'Content-Type':'text/plain'},body:JSON.stringify(v)})
        .then(function(){try{var w=JSON.parse(localStorage.getItem('mf-ayril')||'null');if(w&&w.zaman===v.zaman)localStorage.removeItem('mf-ayril');}catch(e){}}).catch(function(){});}
    window.addEventListener('online',ayrilGonder);setTimeout(ayrilGonder,1500);
    var dsec=document.getElementById('ders-sec');
    document.getElementById('koc-ders').addEventListener('click',function(){dsec.classList.add('acik');});
    document.getElementById('ders-sec-k').addEventListener('click',function(){dsec.classList.remove('acik');});
    dsec.addEventListener('click',function(e){if(e.target===dsec||e.target.closest('.ds-b'))dsec.classList.remove('acik');});
    function kodKaldir(sessiz){
      if(!sessiz&&!confirm('Koç kodun kaldırılsın mı? Bundan sonra hiçbir kayıt gönderilmez.'))return;
      var eskiKod=kayitliKod();if(eskiKod)ayrilBildir(eskiKod);
      try{localStorage.removeItem('mf-koc-kod');localStorage.removeItem('mf-koc-onay');}catch(e){}
      kaydet([]);ki.value='';arayuz();durum('Paylaşım durduruldu','');
    }
    function onayGuncelle(){ot.disabled=!(o1.checked&&o2.checked);}
    o1.addEventListener('change',onayGuncelle);o2.addEventListener('change',onayGuncelle);
    ot.addEventListener('click',function(){try{localStorage.setItem('mf-koc-onay',JSON.stringify({kod:bekleyen,zaman:new Date().toISOString()}));}catch(e){}
      pen.classList.remove('acik');kodUygula(bekleyen);bekleyen='';});
    document.getElementById('onay-vazgec').addEventListener('click',function(){pen.classList.remove('acik');bekleyen='';});
    document.getElementById('pm-koc-katil').addEventListener('click',function(){if(!ki.value.trim()){ki.focus();return;}kodIste();});
    ki.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();ki.blur();if(ki.value.trim())kodIste();}});
    document.getElementById('pm-koc-kaldir').addEventListener('click',function(){kodKaldir(false);});
    arayuz();
    function kuyrugaEkle(k){var q=kuyruk();q.push(k);kaydet(q.slice(-200));gonder();}
    function notSakla(k){if(!k.yapti)return;try{var l=JSON.parse(localStorage.getItem('mf-notlar')||'[]'),sinir=Date.now()-366*864e5;
      l.push({t:k.tarih,ders:k.ders,dk:k.dk,yapti:k.yapti,konu:k.konu||'',soru:k.soru==null?null:k.soru,d:k.d==null?null:k.d,y:k.y==null?null:k.y});
      l=l.filter(function(x){return new Date(x.t).getTime()>sinir;}).slice(-3000);localStorage.setItem('mf-notlar',JSON.stringify(l));}catch(e){}
      if(window.MF_IST_YENILE)window.MF_IST_YENILE();}
    function teslim(k){if(k.kod)kuyrugaEkle(k);}
    // seans sonu notu
    var np=document.getElementById('pm-not'),nSec='',nKayit=null;
    function nAl(id){var v=document.getElementById(id).value;return v===''?null:Math.max(0,Math.min(999,Math.floor(+v)||0));}
    function nKontrol(){
      var h='',ok=!!nSec;
      if(nSec&&nSec!=='Konu'){var s=nAl('not-s'),dd=nAl('not-d'),yy=nAl('not-y');
        if(!s){ok=false;}else if((dd||0)+(yy||0)>s){ok=false;h='Doğru + yanlış, soru sayısından fazla olamaz.';}}
      document.getElementById('not-hata').textContent=h;document.getElementById('not-gonder').disabled=!ok;
    }
    function nBekleyen(){try{return JSON.parse(localStorage.getItem('mf-not-bekleyen')||'null');}catch(e){return null;}}
    function nTemizle(){try{localStorage.removeItem('mf-not-bekleyen');}catch(e){}nKayit=null;np.classList.remove('acik');}
    function nAc(k){
      nKayit=k;nSec='';
      [].forEach.call(document.querySelectorAll('#not-sec button'),function(b){b.classList.remove('on');});
      ['not-s','not-d','not-y','not-konu'].forEach(function(i){document.getElementById(i).value='';});
      document.getElementById('not-soru').classList.remove('acik');
      var t=new Date(k.tarih),sa=(t.getHours()<10?'0':'')+t.getHours()+':'+(t.getMinutes()<10?'0':'')+t.getMinutes();
      document.getElementById('not-alt').textContent=k.ders+' · '+Math.round(k.dk)+' dk · '+sa+(k.kod?' — Hocan bu notları görecek.':' — Soru istatistiğine eklenir.');document.getElementById('not-gonder').textContent=k.kod?'Gönder':'Kaydet';
      nKontrol();np.classList.add('acik');
    }
    [].forEach.call(document.querySelectorAll('#not-sec button'),function(b){b.addEventListener('click',function(){
      nSec=b.getAttribute('data-v');
      [].forEach.call(document.querySelectorAll('#not-sec button'),function(x){x.classList.toggle('on',x===b);});
      document.getElementById('not-soru').classList.toggle('acik',nSec!=='Konu');nKontrol();
      if(nSec!=='Konu')document.getElementById('not-s').focus();
    });});
    ['not-s','not-d','not-y'].forEach(function(i){document.getElementById(i).addEventListener('input',nKontrol);});
    document.getElementById('not-gonder').addEventListener('click',function(){
      if(!nKayit)return;var k=nKayit;k.yapti=nSec;k.konu=document.getElementById('not-konu').value.trim().slice(0,60);
      if(nSec!=='Konu'){k.soru=nAl('not-s');k.d=nAl('not-d');k.y=nAl('not-y');}
      nTemizle();notSakla(k);teslim(k);
    });
    document.getElementById('not-gec').addEventListener('click',function(){if(!nKayit)return;var k=nKayit;nTemizle();teslim(k);});
    window.MF_KOC=function(k){var kod='';try{kod=localStorage.getItem('mf-koc-kod')||'';}catch(e){}if(kod)k.kod=kod;
      if(k.dk<5||k.notsuz){teslim(k);return;}
      var eski=nBekleyen();if(eski){nTemizle();teslim(eski);}
      try{localStorage.setItem('mf-not-bekleyen',JSON.stringify(k));}catch(e){}
      nAc(k);
    };
    window.MF_KOC_DENEME=function(x){var kod=kayitliKod();if(!kod)return;var k=JSON.parse(JSON.stringify(x));k.tip='deneme';k.kod=kod;kuyrugaEkle(k);};
    (function(){var b=nBekleyen();if(!b)return;
      if(b.kod&&b.kod!==kayitliKod())delete b.kod;
      if(Date.now()-new Date(b.tarih).getTime()<12*3600000)nAc(b);else{nTemizle();teslim(b);}})();
    if(window.MF_KOC_ON){var on=window.MF_KOC_ON;window.MF_KOC_ON=null;on.forEach(function(x){window.MF_KOC(x);});}
    window.addEventListener('online',gonder);gonder();
    // anonim kullanım sayacı (günde 1 kez)
    function sayac(mod){
      var cid='';try{cid=localStorage.getItem('mf-cihaz')||'';if(!cid){cid='C-'+Math.random().toString(36).slice(2,8).toUpperCase();localStorage.setItem('mf-cihaz',cid);}}catch(e){return;}
      var d=new Date(),gun=d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate(),anahtar=gun+'|'+mod;
      try{if(localStorage.getItem('mf-sayac')===anahtar)return;}catch(e){}
      if(!navigator.onLine)return;
      var plt=ios?'iPhone':(/android/i.test(navigator.userAgent)?'Android':'Bilgisayar');
      fetch(KOC_URL,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain'},body:JSON.stringify({tip:'sayac',cihaz:cid,platform:plt,mod:mod,kod:kayitliKod(),sinif:(function(){try{var x=JSON.parse(localStorage.getItem('mf-sinif')||'null');return x&&x.sinif?String(x.sinif)+(x.alan?' '+x.alan:''):'';}catch(e){return '';}})()})})
        .then(function(){try{localStorage.setItem('mf-sayac',anahtar);}catch(e){}}).catch(function(){});
    }
    var acMod=kurulu?'Kurulu':(uyg?'Instagram/TikTok':'Tarayıcı');
    sayac(acMod);
    window.addEventListener('appinstalled',function(){sayac('Kurulu');});
    window.addEventListener('online',function(){sayac(acMod);});
  }
})();
