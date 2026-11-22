// Kadranlar: Dijital (varsayılan), Birim çember, Kum saati. (Eski İletki kadranı 22 Kasım'da kaldırıldı.)
// Seçim: Odak ayarlarında "Kadran" çipleri, localStorage 'mf-kadran'. Sayaç durumu 01-sayac.js ciz() → window.MF_KADRAN(s).
// Rakamlar: MF rakamları — yalnız doğru parçası ve çember yayıyla (cetvel + pergel) çizilmiş özel glifler; yalnız sayaçta kullanılır.
(function(){
  'use strict';
  var h=document.getElementById('pm-saat'),kap=document.getElementById('pm-kadran-c');if(!h||!kap)return;
  var NS='http://www.w3.org/2000/svg',K='mf-kadran',SECIM=[['dj','Dijital'],['bc','Birim çember'],['ks','Kum saati']];
  var secim='dj';try{secim=localStorage.getItem(K)||'dj';}catch(e){}
  if(!SECIM.some(function(x){return x[0]===secim;}))secim='dj';
  var satir=document.getElementById('pm-kadran-k');if(satir&&satir.parentNode)satir.parentNode.appendChild(satir); // ayarların en altı
  function f(n){return n.toFixed(2);}
  function iki(n){return (n<10?'0':'')+n;}
  // ---------- MF rakamları (60x100 kutu) ----------
  var GLIF={
   '0':'M10 32A20 20 0 0 1 50 32V68A20 20 0 0 1 10 68Z','1':'M17 25L33 12V88','2':'M12.5 31A18.5 18.5 0 1 1 45 43.5L12 88H50',
   '3':'M14 13H47L29 42A22 22 0 1 1 10.5 74','4':'M40 88V12L9 66H52','5':'M47 12H19L17 46A22 22 0 1 1 10.5 75',
   '6':'M42 11L12.5 52M8 64A22 22 0 1 0 52 64A22 22 0 1 0 8 64','7':'M10 12H50L23 88',
   '8':'M14 29A16 16 0 1 0 46 29A16 16 0 1 0 14 29M10 68A20 20 0 1 0 50 68A20 20 0 1 0 10 68',
   '9':'M18 89L47.5 48M52 36A22 22 0 1 0 8 36A22 22 0 1 0 52 36'};
  function rakamlar(str,boy,renk,kal){var k=boy/100,o='',cx=0;kal=kal||12;
    for(var i=0;i<str.length;i++){var c=str[i];
      if(c===':'){o+='<g transform="translate('+f(cx)+' '+f(-boy)+') scale('+k+')"><circle cx="12" cy="35" r="7.5" class="kd-v"/><circle cx="12" cy="68" r="7.5" class="kd-v"/></g>';cx+=24*k;continue;}
      o+='<path transform="translate('+f(cx)+' '+f(-boy)+') scale('+k+')" d="'+GLIF[c]+'" style="fill:none;stroke:'+renk+';stroke-width:'+kal+';stroke-linecap:round;stroke-linejoin:round"/>';cx+=66*k;}
    return [o,cx-6*k];}
  // ---------- durum ----------
  var S=null,djGecen=false;try{djGecen=localStorage.getItem('mf-kadran-gecen')==='1';}catch(e){}
  function kNow(){return S.calisiyor?Math.max(0,S.bitis-Date.now()):S.k;}
  function parcalar(k){ // [büyük, saniye]
    if(S.serbest){var g=S.toplam-k;return [iki(Math.floor(g/3600000))+':'+iki(Math.floor(g%3600000/60000)),iki(Math.floor(g%60000/1000))];}
    var x=djGecen&&secim==='dj'?S.toplam-k:k,s=Math.ceil(x/1000);
    if(s>=3600)return [Math.floor(s/3600)+':'+iki(Math.floor(s%3600/60)),iki(s%60)];
    return [iki(Math.floor(s/60)),iki(s%60)];}
  function zamanSvg(k,boy,y,renk,snYok){var p=parcalar(k),A=rakamlar(p[0],boy,renk||'var(--kd-yazi)'),B=snYok?['',0]:rakamlar(':'+p[1],boy*.4,'var(--kd-sn)'),gw=A[1]+(snYok?0:6+B[1]),x0=150-gw/2;
    return '<g transform="translate('+f(x0)+' '+y+')">'+A[0]+'</g>'+(snYok?'':'<g transform="translate('+f(x0+A[1]+6)+' '+y+')">'+B[0]+'</g>');}
  function oran(k){if(S.serbest)return ((S.toplam-k)%3600000)/3600000;return S.toplam?Math.min(1,Math.max(0,1-k/S.toplam)):0;}
  function odakMi(){return document.body.classList.contains('lv-odak');}
  // odak geçişi: 0 → 1 yumuşak (viewBox ve rakam boyu aniden sıçramasın, CSS scale ile aynı anda akar)
  var oa=odakMi()?1:0,oaHd=oa,oaT0=0,oaFrom=oa;function oaAdim(){var hd=odakMi()?1:0,n=performance.now();if(hd!==oaHd){oaHd=hd;oaT0=n;oaFrom=oa;}
    var u=Math.min(1,(n-oaT0)/600),e=1-Math.pow(1-u,3.4);/* CSS --oeE ile uyumlu */oa=oaFrom+(hd-oaFrom)*e;if(u>=1)oa=hd;}
  function lr(a,b){return a+(b-a)*oa;}
  function oaSuruyor(){return oa!==(odakMi()?1:0);}
  // ---------- çizimler ----------
  var svg=document.createElementNS(NS,'svg');svg.setAttribute('class','kd');svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');
  h.insertBefore(svg,h.querySelector('.pm-yazi'));
  var C=150,R=104,kurulan='';
  function $(i){return svg.querySelector('#'+i);}
  function L(id,a,b,c,d){var e=$(id);if(!e)return;e.setAttribute('x1',f(a));e.setAttribute('y1',f(b));e.setAttribute('x2',f(c));e.setAttribute('y2',f(d));}
  function kurBc(){
    var o='<line class="bc-eksen" x1="34" y1="150" x2="266" y2="150"/><line class="bc-eksen" x1="150" y1="266" x2="150" y2="34"/><path class="bc-dilim" id="bc-dilim"/><circle class="bc-cember" cx="150" cy="150" r="'+R+'"/>';
    var et=['0','π/2','π','3π/2'];
    for(var i=0;i<12;i++){var a=i*Math.PI/6,c=Math.cos(a),s=Math.sin(a);
      o+='<line class="bc-tik" x1="'+f(C+(R-6)*c)+'" y1="'+f(C-(R-6)*s)+'" x2="'+f(C+(R+6)*c)+'" y2="'+f(C-(R+6)*s)+'"/>';
      if(i%3===0)o+='<text class="bc-yazi" x="'+f(C+(R+22)*c)+'" y="'+f(C-(R+22)*s+4)+'">'+et[i/3]+'</text>';}
    o+='<path class="bc-ilerleme" id="bc-il"/><line class="bc-kesik" id="bc-k1"/><line class="bc-kesik" id="bc-k2"/><line class="bc-cos" id="bc-cos"/><line class="bc-sin" id="bc-sin"/>'+
      '<line class="bc-yaricap" id="bc-r"/><path class="bc-teta" id="bc-teta"/><text class="bc-etk" id="bc-tt">θ</text><text class="bc-etk bc-ec" id="bc-ec">cos θ</text><text class="bc-etk bc-es" id="bc-es">sin θ</text>'+
      '<circle class="bc-hale" id="bc-hale" r="13"/><circle class="bc-n" id="bc-n" r="7"/><circle cx="150" cy="150" r="3.5" class="kd-y"/><g id="kd-z"></g>';
    svg.innerHTML=o;}
  function cizBc(k){var p=((S.toplam-k)%60000)/60000,th=p*2*Math.PI,c=Math.cos(th),s=Math.sin(th),x=C+R*c,y=C-R*s;
    if(p<=0.0005){$('bc-il').setAttribute('d','');$('bc-dilim').setAttribute('d','');}
    else{var d='M'+(C+R)+' '+C+'A'+R+' '+R+' 0 '+(th>Math.PI?1:0)+' 0 '+f(x)+' '+f(y);$('bc-il').setAttribute('d',d);$('bc-dilim').setAttribute('d','M150 150L'+d.slice(1)+'Z');}
    L('bc-r',C,C,x,y);L('bc-k1',x,y,x,C);L('bc-k2',x,y,C,y);L('bc-cos',C,C,x,C);L('bc-sin',x,C,x,y);
    ['bc-n','bc-hale'].forEach(function(i){$(i).setAttribute('cx',f(x));$(i).setAttribute('cy',f(y));});
    var r=24;$('bc-teta').setAttribute('d',th<0.02?'':'M'+(C+r)+' '+C+'A'+r+' '+r+' 0 '+(th>Math.PI?1:0)+' 0 '+f(C+r*Math.cos(th))+' '+f(C-r*Math.sin(th)));
    var tm=th/2;$('bc-tt').setAttribute('x',f(C+38*Math.cos(tm)-4));$('bc-tt').setAttribute('y',f(C-38*Math.sin(tm)+4));
    $('bc-ec').setAttribute('x',f((C+x)/2-16));$('bc-ec').setAttribute('y',f(C+(s>=0?17:-9)));
    $('bc-es').setAttribute('x',f(x+(c>=0?8:-40)));$('bc-es').setAttribute('y',f((C+y)/2+4));
    svg.setAttribute('viewBox','0 0 300 '+lr(372,398).toFixed(1));$('kd-z').innerHTML=zamanSvg(k,lr(52,72),lr(352,380));
    $('bc-tt').style.opacity=th>0.25&&th<6.1?1:0;$('bc-es').style.opacity=Math.abs(s)>0.18?1:0;$('bc-ec').style.opacity=Math.abs(c)>0.18?1:0;}
  // kum saati
  var UST=46,BOGAZ=150,ALT=254,KUM=0,taneler=[],sonSaat=-1,sonP=0,donT=0;
  function yan(y){var u=Math.min(1,Math.abs(y-BOGAZ)/(BOGAZ-UST));return 5+57*(1-Math.pow(1-u,2.2))*(u<.92?1:1-(u-.92)*1.2);}
  function alan(a,b){var t=0;for(var y=Math.ceil(a);y<=b;y++)t+=2*yan(y);return t;}
  function sev(fn,hedef,a,b){var lo=a,hi=b;for(var i=0;i<26;i++){var m=(lo+hi)/2;if(fn(m)>hedef)lo=m;else hi=m;}return (lo+hi)/2;}
  function camYol(){var s='M'+f(150-yan(UST))+' '+UST;for(var y=UST;y<=ALT;y+=2)s+='L'+f(150-yan(y))+' '+y;for(y=ALT;y>=UST;y-=2)s+='L'+f(150+yan(y))+' '+y;return s+'Z';}
  function kurKs(){KUM=0.82*alan(UST,BOGAZ);
    var o='<defs><linearGradient id="kdKum" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="kd-st1"/><stop offset="1" class="kd-st2"/></linearGradient><clipPath id="kdKap"><path d="'+camYol()+'"/></clipPath></defs>';
    o+='<g id="ks-don" class="ks-don"><line class="ks-direk" x1="74" y1="40" x2="74" y2="260"/><line class="ks-direk" x1="226" y1="40" x2="226" y2="260"/>'+
      '<g clip-path="url(#kdKap)"><path id="ks-ust" fill="url(#kdKum)"/><path id="ks-alt" fill="url(#kdKum)"/><line class="ks-akis" id="ks-akis" x1="150" x2="150"/><g id="ks-tane"></g></g>'+
      '<path class="ks-cam" d="'+camYol()+'"/><path class="ks-parlak" d="M'+f(150-yan(70)+9)+' 70Q'+f(150-yan(100)+12)+' 108 '+f(150-yan(128)+8)+' 132"/>'+
      '<path class="ks-parlak" d="M'+f(150+yan(232)-10)+' 232Q'+f(150+yan(205)-12)+' 196 '+f(150+yan(178)-7)+' 172"/>'+
      '<rect class="ks-kapak" x="62" y="28" width="176" height="16" rx="8"/><rect class="ks-kapak" x="62" y="256" width="176" height="16" rx="8"/></g><g id="ks-bon"></g><g id="kd-z"></g>';
    svg.innerHTML=o;taneler=[];}
  function cizKs(k,dt){var p=oran(k),akan=S.calisiyor&&p>0&&p<1&&!donT;
    if(S.serbest){var saat=Math.floor((S.toplam-k)/3600000);if(sonSaat>=0&&saat>sonSaat)cevir();sonSaat=saat;}
    else if(sonP>0.02&&p===0&&!S.calisiyor)cevir();
    sonP=p;if(donT)p=1;
    var kal=KUM*(1-p),u=kal>0.5?sev(function(m){return alan(m,BOGAZ);},kal,UST,BOGAZ):BOGAZ,cuk=Math.min(10,(BOGAZ-u)*.35)*(p>0&&p<1?1:0);
    $('ks-ust').setAttribute('d',kal>0.5?'M80 '+f(u)+'L128 '+f(u)+'Q150 '+f(u+cuk*2)+' 172 '+f(u)+'L220 '+f(u)+'L220 '+BOGAZ+'L80 '+BOGAZ+'Z':'');
    var dol=KUM*p,a=dol>0.5?sev(function(m){return alan(m,ALT);},dol,BOGAZ,ALT):ALT,tepe=Math.min(16,(ALT-a)*.6+4)*(dol>0.5?1:0),gn=Math.max(14,yan(a)*.9);
    $('ks-alt').setAttribute('d',dol>0.5?'M80 '+ALT+'L80 '+f(a)+'L'+f(150-gn)+' '+f(a)+'Q150 '+f(a-tepe*2)+' '+f(150+gn)+' '+f(a)+'L220 '+f(a)+'L220 '+ALT+'Z':'');
    var ak=$('ks-akis');ak.setAttribute('y1',BOGAZ-2);ak.setAttribute('y2',f(a-tepe));ak.style.opacity=akan?.9:0;
    if(akan&&Math.random()<.5)taneler.push({y:BOGAZ,x:150+(Math.random()-.5)*2,v:40+Math.random()*30});
    var o='',hd=a-tepe;taneler=akan?taneler.filter(function(t){t.v+=420*dt;t.y+=t.v*dt;if(t.y>hd)return false;o+='<circle class="kd-v" cx="'+f(t.x)+'" cy="'+f(t.y)+'" r="1.4"/>';return true;}):[];
    $('ks-tane').innerHTML=o;
    var bo='';if(S.serbest){var n=Math.min(8,Math.floor((S.toplam-k)/3600000));for(var i=0;i<n;i++)bo+='<circle class="kd-v" cx="'+(150-(n-1)*7+i*14)+'" cy="286" r="4.5"/>';}
    $('ks-bon').innerHTML=bo;
    svg.setAttribute('viewBox','0 0 300 '+lr(372,398).toFixed(1));$('kd-z').innerHTML=zamanSvg(k,lr(52,72),lr(356,382));}
  function cevir(){var g=$('ks-don');if(!g||donT)return;donT=1;g.classList.add('don');g.style.transform='rotate(180deg)';
    setTimeout(function(){g.classList.remove('don');g.style.transform='';donT=0;},900);}
  // dijital
  function kurDj(){svg.setAttribute('viewBox','0 0 300 222');
    svg.innerHTML='<g id="dj-ust-g" class="dj-ust-g"><rect id="dj-ust-r" class="dj-ust-r" y="10" height="22" rx="11"/><text class="dj-ust" id="dj-ust" x="150" y="25"></text></g>'+
      '<g id="kd-z"></g><text class="dj-bitis" id="dj-bitis" x="150" y="140"></text>'+
      '<g class="dj-panel"><rect class="dj-pn" x="64" y="154" width="172" height="62" rx="13"/><line class="dj-ara" x1="76" y1="185" x2="224" y2="185"/>'+
      '<text class="dj-e" x="78" y="174" id="dj-e1">PLAN</text><g id="dj-v1" data-y="176"></g><text class="dj-e" x="78" y="205" id="dj-e2">KALAN</text><g id="dj-v2" data-y="207"></g></g>';
    $('dj-ust-g').addEventListener('click',function(e){e.stopPropagation();if(S.serbest)return;djGecen=!djGecen;try{localStorage.setItem('mf-kadran-gecen',djGecen?'1':'0');}catch(x){}ciz(0);});}
  function saatYaz(t){var d=new Date(t);return iki(d.getHours())+':'+iki(d.getMinutes());}
  function bugunDk(){try{var k=JSON.parse(localStorage.getItem('pm-kayit')||'{}'),d=new Date(),g=k[d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()];return g&&g.dk||0;}catch(e){return 0;}}
  function mini(id,dk,renk){var y=+$(id).getAttribute('data-y'),x=224,o='',h2=Math.floor(dk/60),m=Math.round(dk%60),par=[];
    if(m===60){h2++;m=0;}if(h2)par.push([h2+'','sa']);if(m||!h2)par.push([m+'','dk']);
    for(var i=par.length-1;i>=0;i--){x-=13;o+='<text x="'+f(x)+'" y="'+y+'" class="dj-birim">'+par[i][1]+'</text>';x-=3.5;
      var g=rakamlar(par[i][0],16,renk);x-=g[1];o+='<g transform="translate('+f(x)+' '+y+')">'+g[0]+'</g>';x-=9;}
    $(id).innerHTML=o;}
  function yaziYaz(id,t,cls){$(id).innerHTML='<text x="224" y="'+(+$(id).getAttribute('data-y')-1)+'" class="dj-yazi '+(cls||'')+'">'+t+'</text>';}
  function cizDj(k){
    var dur=!S.calisiyor&&k!==S.toplam&&(S.serbest||k>0),son5=!S.serbest&&S.mod!=='kisa'&&S.mod!=='uzun'&&k>0&&k<=300000,od=odakMi();
    var vx=S.serbest?30:48,vw=S.serbest?240:204;svg.setAttribute('viewBox',lr(0,vx).toFixed(1)+' '+lr(0,4).toFixed(1)+' '+lr(300,vw).toFixed(1)+' '+lr(222,146).toFixed(1)); // odak ekranında rakamlara yumuşakça yakınlaş
    $('kd-z').innerHTML=zamanSvg(k,S.serbest?60:78,(S.serbest?82:100)+8,son5?'var(--kd-v)':null);
    $('kd-z').style.opacity=dur?.42:1;
    var u=S.serbest?'SINIRSIZ':(S.mod==='deneme'?'DENEME':(S.mola?'MOLA':'ODAK'));if(!S.serbest)u+=' · '+(djGecen?'GEÇEN ⇄':'KALAN ⇄');if(dur)u='DURAKLATILDI';
    var t=$('dj-ust');t.textContent=u;t.classList.toggle('dur',dur);
    var w=Math.max(70,u.length*7.6+22);$('dj-ust-r').setAttribute('x',f(150-w/2));$('dj-ust-r').setAttribute('width',f(w));
    $('dj-bitis').innerHTML=S.serbest?(k!==S.toplam?'Başlangıç <tspan class="dj-bs">'+saatYaz(Date.now()-(S.toplam-k))+'</tspan>':''):(k>0?'Bitiş <tspan class="dj-bs">'+saatYaz(Date.now()+k)+'</tspan>':'Süre doldu');
    var pl=window.MF_PR_GUN?window.MF_PR_GUN():null,canli=(S.mod==='odak'&&!S.mola)?(S.toplam-k)/60000:0;
    if(pl&&pl.hed){$('dj-e1').textContent='PLAN';$('dj-e2').textContent='KALAN';mini('dj-v1',pl.hed,'var(--kd-yazi)');
      var kl=Math.max(0,pl.hed-pl.yap-canli);if(kl>0.5)mini('dj-v2',kl,'var(--kd-v)');else yaziYaz('dj-v2','tamam ✓','dj-tamam');}
    else{$('dj-e1').textContent='PLAN';$('dj-e2').textContent='BUGÜN';yaziYaz('dj-v1','program yok');mini('dj-v2',bugunDk()+canli,'var(--kd-v)');}
  }
  // ---------- yönetim ----------
  var son=0,raf=0,sonCiz=0;
  function ciz(dt){if(!S)return;oaAdim();var k=kNow();
    if(kurulan!==secim){kurulan=secim;if(secim==='bc')kurBc();else if(secim==='ks')kurKs();else kurDj();}
    if(secim==='bc')cizBc(k);else if(secim==='ks')cizKs(k,dt||0);else cizDj(k);}
  function dongu(t){raf=0;if(!S||document.hidden)return;var dt=Math.min(.1,(t-son)/1000);son=t;
    // kum saati her karede, diğerleri saniyede bir yeter (pil)
    if(secim!=='dj'||oaSuruyor()||t-sonCiz>250){sonCiz=t;ciz(dt);}
    if(S.calisiyor||donT||oaSuruyor())raf=requestAnimationFrame(dongu);}
  function uyan(){if(!raf){son=performance.now();raf=requestAnimationFrame(dongu);}}
  // odak ekranı yerleşimi için (14-sayac-katla.js): odak hâlindeki en-boy oranı, etiket yüksekliği, maskot olur mu
  window.MF_KD_ORAN=function(){var y=h.querySelector('.pm-yazi'),e=(y?y.offsetHeight:20)+6;
    if(secim==='dj')return {ra:146/(S&&S.serbest?240:204),e:e,maskot:false};return {ra:398/300,e:e,maskot:false};};
  window.MF_KADRAN=function(s){S=s;h.classList.toggle('kd-mola',!!s.mola);h.classList.toggle('kd-deneme',s.mod==='deneme'&&!s.mola);ciz(0);uyan();};
  document.addEventListener('visibilitychange',function(){if(!document.hidden)uyan();});
  new MutationObserver(function(){if(S){ciz(0);uyan();}}).observe(document.body,{attributes:true,attributeFilter:['class']});
  function uygula(){['kd-bc','kd-ks','kd-dj'].forEach(function(c){h.classList.remove(c);});h.classList.add('kd-'+secim);
    kurulan='';svg.innerHTML='';ciz(0);uyan();
    [].forEach.call(kap.children,function(b){var on=b.dataset.v===secim;b.classList.toggle('on',on);b.setAttribute('aria-checked',on);});}
  SECIM.forEach(function(x){var b=document.createElement('button');b.type='button';b.setAttribute('role','radio');b.dataset.v=x[0];b.textContent=x[1];
    b.addEventListener('click',function(){secim=x[0];try{localStorage.setItem(K,secim);}catch(e){}uygula();});kap.appendChild(b);});
  uygula();
})();
