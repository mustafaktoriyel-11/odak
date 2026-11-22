// ================= MATEMATİĞİN İZİNDE (günlük 5 soru + dünya turu) =================
// Veri: veri/izinde/{mufredat,rota,duraklar}.json, sorular-<sınıf>.json · Seçici: js/izinde-secim.js · Görseller: js/17-izinde-gorsel.js
// Kayıt: localStorage 'mf-izinde' = {g:{'YYYY-MM-DD':{s:sınıf, ids:[...], cev:[...], d:doğru, bit:zaman, gec:sonradan mı}}, gor:{dr:[görülen duraklar], k:görülen kademe}}
(function(){
  var $=function(id){return document.getElementById(id);};
  var K='mf-izinde',NS=5,W=2576,H=1438;
  var KADEME=['Yavru kedi','Genç kedi','Yelesi belirmiş kedi','Aslan','Genç aslan','Bilge aslan'];
  var AY=['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
  var V={muf:null,rota:null,dur:null,soru:{}},yukleniyor=null,aktif=null,yakin=true,ilkKaydir=true;

  function oku(){try{var x=JSON.parse(localStorage.getItem(K)||'{}');x.g=x.g||{};x.gor=x.gor||{dr:[],k:0};x.gor.dr=x.gor.dr||[];return x;}catch(e){return {g:{},gor:{dr:[],k:0}};}}
  function yaz(v){try{localStorage.setItem(K,JSON.stringify(v));}catch(e){}}
  function iki(n){return (n<10?'0':'')+n;}
  function gunK(t){var d=new Date(t);return d.getFullYear()+'-'+iki(d.getMonth()+1)+'-'+iki(d.getDate());}
  function gunT(k){var p=k.split('-');return new Date(+p[0],+p[1]-1,+p[2]);}
  function gunEkle(k,n){var d=gunT(k);d.setDate(d.getDate()+n);return gunK(d);}
  function haftaK(k){var d=gunT(k);d.setDate(d.getDate()-((d.getDay()+6)%7));return gunK(d);}
  function bugun(){return gunK(Date.now());}
  function esc(x){return String(x==null?'':x).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function sinif(){try{var s=window.MF_SINIF&&window.MF_SINIF();return s&&s.sinif?String(s.sinif):null;}catch(e){return null;}}
  function sinifAd(s){return s==='Mezun'?'Mezun (YKS)':s+'. sınıf'+(s==='8'?' (LGS)':'');}

  // ---------- veri ----------
  function json(u){return fetch(u,{cache:'no-cache'}).then(function(r){if(!r.ok)throw new Error(u);return r.json();});}
  function temelVeri(){
    if(V.muf&&V.rota&&V.dur)return Promise.resolve();
    if(!yukleniyor)yukleniyor=Promise.all([json('veri/izinde/mufredat.json'),json('veri/izinde/rota.json'),json('veri/izinde/duraklar.json'),fetch('veri/izinde/harita.svg').then(function(r){return r.ok?r.text():'';})['catch'](function(){return '';})]).then(function(a){
      V.taban=a[3]||'';V.muf=a[0];V.rota=a[1];V.dur={};(Array.isArray(a[2])?a[2]:a[2].duraklar).forEach(function(d){V.dur[d.id]=d;});
    })['catch'](function(e){yukleniyor=null;throw e;});
    return yukleniyor;
  }
  function sorular(s){
    if(V.soru[s])return Promise.resolve(V.soru[s]);
    return json('veri/izinde/sorular-'+s+'.json').then(function(d){V.soru[s]=d.sorular||[];return V.soru[s];});
  }
  // günün seti: bir kez açılınca kimlikler kaydedilir (havuz değişse de o günün seti kaymaz)
  function setAl(gun,s,dondur){
    return sorular(s).then(function(havuz){
      var v=oku(),r=v.g[gun],ids;
      if(r&&r.s===s&&r.ids&&r.ids.length)ids=r.ids;
      else{ids=(window.IZINDE_SECIM?window.IZINDE_SECIM.gununSeti(havuz,V.muf,s,gun,NS):[]).map(function(q){return q.id;});
        if(dondur&&ids.length){v.g[gun]={s:s,ids:ids,cev:ids.map(function(){return null;})};yaz(v);}}
      var by={};havuz.forEach(function(q){by[q.id]=q;});
      return ids.map(function(id){return by[id];}).filter(Boolean);
    });
  }

  // ---------- KaTeX (ilk kullanımda yüklenir) ----------
  var ktx=null;
  function katex(){
    if(window.katex)return Promise.resolve();
    if(ktx)return ktx;
    ktx=new Promise(function(ok){
      var l=document.createElement('link');l.rel='stylesheet';l.href='lib/katex/katex.min.css';document.head.appendChild(l);
      var s=document.createElement('script');s.src='lib/katex/katex.min.js';s.onload=function(){ok();};s.onerror=function(){ok();};document.head.appendChild(s);
    });
    return ktx;
  }
  function tex(t){
    var p=String(t==null?'':t).split('$'),o='';
    for(var i=0;i<p.length;i++){
      if(i%2===0){o+=esc(p[i]);continue;}
      if(window.katex){try{o+=window.katex.renderToString(p[i],{throwOnError:false,output:'html'});continue;}catch(e){}}
      o+='<span class="iz-ham">'+esc(p[i])+'</span>';
    }
    return o;
  }

  // ---------- ilerleme ----------
  function tamamMi(r){return !!(r&&r.bit&&r.cev&&r.cev.length&&r.cev.every(function(x){return x!==null&&x!==undefined;}));}
  function durum(){
    var v=oku(),gunler=Object.keys(v.g).filter(function(k){return tamamMi(v.g[k]);}).sort();
    var toplam=gunler.length,bg=bugun(),cur=0,best=0,maz={},bas=gunler[0];
    if(bas){
      for(var k=bas;k<=bg;k=gunEkle(k,1)){
        var r=v.g[k],z=tamamMi(r)&&!r.gec;
        if(z){cur++;if(cur>best)best=cur;continue;}
        if(k===bg)break;                                       // bugün henüz çözülmedi: seri bozulmaz
        var h=haftaK(k);
        if(cur>0&&!maz[h]){maz[h]=k;continue;}                  // haftada 1 mazeret: seri korunur
        cur=0;
      }
    }
    var R=V.rota,kad=1,D=R?R.duraklar:[],konum=0;
    if(R){R.kademe.forEach(function(x){if(toplam>=x.adim&&best>=x.seri)kad=Math.max(kad,x.no);});
      D.forEach(function(d,i){if(toplam>=d.adim)konum=i;});}
    var sonraki=D[konum+1]||null,bekleyen=null;
    if(R)R.kademe.forEach(function(x){if(!bekleyen&&x.no>kad)bekleyen=x;});
    return {v:v,toplam:toplam,seri:cur,enUzun:best,kademe:kad,konum:konum,sonraki:sonraki,bekleyen:bekleyen,bugunTamam:tamamMi(v.g[bg])};
  }

  // ---------- harita ----------
  function kontrol(a,b,k){var mx=(a.x+b.x)/2,my=(a.y+b.y)/2,dx=b.x-a.x,dy=b.y-a.y;return {x:mx-dy*(k||0),y:my+dx*(k||0)};}
  function bez(a,c,b,t){var u=1-t;return {x:u*u*a.x+2*u*t*c.x+t*t*b.x,y:u*u*a.y+2*u*t*c.y+t*t*b.y};}
  function maskotYer(st){
    var D=V.rota.duraklar,a=D[st.konum],b=D[st.konum+1];
    var ax=(a.rozet?a.rozet[0]:a.x)+40,ay=(a.rozet?a.rozet[1]:a.y)+24;     // durakta: rozetin yanında durur
    if(!b)return {x:ax,y:ay};
    var t=Math.min(.85,(st.toplam-a.adim)/(b.adim-a.adim));   // durağa varana dek yolda
    return t<=0?{x:ax,y:ay}:bez(a,kontrol(a,b,b.kavis),b,t);
  }
  function haritaSvg(st){
    var D=V.rota.duraklar,gece=document.documentElement.classList.contains('mf-gece'),h='';
    var m=gece?'#CFE0FF':'#141B3F',vr='#FF8A1F',soluk=gece?'rgba(159,178,255,.55)':'rgba(20,27,63,.45)';
    for(var i=1;i<D.length;i++){
      var a=D[i-1],b=D[i],c=kontrol(a,b,b.kavis),p='M'+a.x+' '+a.y+' Q'+c.x+' '+c.y+' '+b.x+' '+b.y;
      h+='<path d="'+p+'" fill="none" stroke="'+soluk+'" stroke-width="5" stroke-linecap="round" stroke-dasharray="'+(b.deniz?'14 12':'1 12')+'"/>';
      var t=st.toplam>=b.adim?1:(st.toplam<=a.adim?0:Math.min(.85,(st.toplam-a.adim)/(b.adim-a.adim)));
      if(t>0){var q='M'+a.x+' '+a.y;for(var j=1;j<=24;j++){var o=bez(a,c,b,t*j/24);q+=' L'+o.x.toFixed(1)+' '+o.y.toFixed(1);}
        h+='<path d="'+q+'" fill="none" stroke="'+vr+'" stroke-width="7" stroke-linecap="round"'+(b.deniz?' stroke-dasharray="16 10"':'')+'/>';}
    }
    D.forEach(function(d,i){
      var ul=st.toplam>=d.adim,simdi=i===st.konum,bx=d.rozet?d.rozet[0]:d.x,by=d.rozet?d.rozet[1]:d.y,mm=ul?m:'#8C93B0',vv=ul?vr:'#B9BDD0';
      if(d.rozet)h+='<path d="M'+d.x+' '+d.y+' L'+bx+' '+by+'" stroke="'+(ul?m:'#A8AEC8')+'" stroke-width="2" opacity=".7"/>';
      h+='<circle cx="'+d.x+'" cy="'+d.y+'" r="6" fill="'+vv+'" stroke="'+(ul?m:'#A8AEC8')+'" stroke-width="2"/>';
      h+='<g class="iz-durak'+(ul?' ul':'')+'" data-i="'+i+'" transform="translate('+bx+' '+by+')" style="--m:'+mm+';--v:'+vv+'" opacity="'+(ul?1:.6)+'">';
      if(simdi)h+='<circle class="iz-hale" r="42" fill="'+vr+'"/>';
      h+='<circle r="30" fill="'+(gece?'#1A2142':'#FFF8EA')+'" stroke="'+(ul?(gece?'#9FB2FF':'#141B3F'):'#A8AEC8')+'" stroke-width="'+(simdi?5:3)+'"/>';
      h+='<use href="#iz-s-'+d.simge+'" transform="translate(-22 -22) scale(.69)"/><circle r="40" fill="transparent"/></g>';
    });
    var mp=maskotYer(st);
    h+='<g class="iz-maskot" transform="translate('+mp.x.toFixed(1)+' '+mp.y.toFixed(1)+')"><ellipse cx="0" cy="2" rx="30" ry="7" fill="rgba(0,0,0,.18)"/><g class="iz-zipla"><use href="#iz-m'+st.kademe+'" x="-45" y="-90" width="90" height="93"/></g></g>';
    return h;
  }
  // ---------- harita kamerası: tek parmak kaydır, iki parmak yakınlaştır, dokun = durak ----------
  var kam={s:1,x:0,y:0},kamSt=null,kamAnim=0;
  function kamSinir(){var k=$('iz-harita');var w=k.clientWidth,h=k.clientHeight;return {w:w,h:h,min:Math.max(w/W,h/H),max:Math.max(w/W,h/H)*9};}
  function kamUygula(){
    var b=kamSinir();kam.s=Math.min(b.max,Math.max(b.min,kam.s));
    kam.x=Math.min(0,Math.max(b.w-W*kam.s,kam.x));kam.y=Math.min(0,Math.max(b.h-H*kam.s,kam.y));
    var ic=$('iz-ic');if(!ic)return;
    // Hareket sırasında katman GPU'da ölçeklenir (yeniden çizim yok); parmak kalkıp durunca will-change kalkar,
    // harita o ölçekte bir kez keskin çizilir ve yakınlık kademesi (deniz/dağ/nehir adları) o an güncellenir
    if(!ic.classList.contains('hareket'))ic.classList.add('hareket');
    ic.style.transform='translate3d('+kam.x.toFixed(1)+'px,'+kam.y.toFixed(1)+'px,0) scale('+kam.s.toFixed(4)+')';
    clearTimeout(kamUygula.t);kamUygula.t=setTimeout(kamDur,260);
  }
  var kamParmak=0;
  function kamDur(){
    var ic=$('iz-ic');if(!ic)return;if(kamParmak>0){kamUygula.t=setTimeout(kamDur,260);return;}
    var b=kamSinir(),z=kam.s/b.min,zk=z<1.9?'1':(z<3.4?'2':'3');if(ic.getAttribute('data-z')!==zk)ic.setAttribute('data-z',zk);
    // yakınlaştıkça adlar büyümesin: belirdikleri boyutta kalsın (deniz adları 2,2×, dağ/nehir adları 3,6× yakınlıktan sonra küçülerek sabitlenir)
    ic.style.setProperty('--k2',Math.min(1,2.2/z).toFixed(3));ic.style.setProperty('--k3',Math.min(1,3.6/z).toFixed(3));
    ic.classList.remove('hareket');
  }
  function kamMerkez(px,py,s){var b=kamSinir();return {s:s,x:b.w/2-px*s,y:b.h*.55-py*s};}
  function kamGit(h,sure,ease,bitti){
    cancelAnimationFrame(kamAnim);var a={s:kam.s,x:kam.x,y:kam.y},t0=performance.now();
    (function adim(t){var u=Math.min(1,(t-t0)/sure),e=ease(u);
      // ölçek logaritmik geçer: yakınlaşma hızlanarak hissedilir
      kam.s=a.s*Math.pow(h.s/a.s,e);var r=(kam.s-a.s)/((h.s-a.s)||1);if(h.s===a.s)r=e;
      kam.x=a.x+(h.x-a.x)*r;kam.y=a.y+(h.y-a.y)*r;kamUygula();
      if(u<1)kamAnim=requestAnimationFrame(adim);else if(bitti)bitti();})(t0);
  }
  var yumusak=function(u){return u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2;},hizlanan=function(u){return u*u*u;};
  function haritaKur(st){
    var kap=$('iz-harita');if(!kap)return;kamSt=st;
    var w=kap.clientWidth||360;kap.style.height=Math.round(Math.min(w*.82,520))+'px';
    $('iz-svg').innerHTML=haritaSvg(st);
    var b=kamSinir(),mp=maskotYer(st);
    if(yakin){var h=kamMerkez(mp.x,mp.y,Math.max(b.min,w/900));kam.s=h.s;kam.x=h.x;kam.y=h.y;}else{kam.s=b.min;kam.x=0;kam.y=0;}
    kamUygula();
    if(!kap.dataset.dokunma){kap.dataset.dokunma='1';dokunmaKur(kap);}
  }
  var kamIstek=0;function kamIste(){if(!kamIstek)kamIstek=requestAnimationFrame(function(){kamIstek=0;kamUygula();});}
  function dokunmaKur(kap){
    var P={},bas=null,tap=null;
    function noktalar(){return Object.keys(P).map(function(k){return P[k];});}
    function durum0(){var n=noktalar();if(n.length>=2){var a=n[0],c=n[1];bas={d:Math.hypot(a.x-c.x,a.y-c.y),mx:(a.x+c.x)/2,my:(a.y+c.y)/2,s:kam.s,x:kam.x,y:kam.y};}
      else if(n.length===1)bas={px:n[0].x,py:n[0].y,x:kam.x,y:kam.y};}
    kap.addEventListener('pointerdown',function(e){cancelAnimationFrame(kamAnim);try{kap.setPointerCapture(e.pointerId);}catch(x){}
      var r=kap.getBoundingClientRect();P[e.pointerId]={x:e.clientX-r.left,y:e.clientY-r.top};kamParmak=noktalar().length;
      tap=noktalar().length===1?{x:e.clientX,y:e.clientY,t:Date.now()}:null;durum0();});
    kap.addEventListener('pointermove',function(e){if(!P[e.pointerId])return;var r=kap.getBoundingClientRect();P[e.pointerId]={x:e.clientX-r.left,y:e.clientY-r.top};
      if(tap&&Math.hypot(e.clientX-tap.x,e.clientY-tap.y)>8)tap=null;
      var n=noktalar();if(!bas)return;
      if(n.length>=2&&bas.d){var a=n[0],c=n[1],d=Math.hypot(a.x-c.x,a.y-c.y),mx=(a.x+c.x)/2,my=(a.y+c.y)/2,s2=bas.s*d/bas.d;
        var b=kamSinir();s2=Math.min(b.max,Math.max(b.min,s2));
        var harX=(bas.mx-bas.x)/bas.s,harY=(bas.my-bas.y)/bas.s;kam.s=s2;kam.x=mx-harX*s2;kam.y=my-harY*s2;kamIste();}
      else if(n.length===1&&bas.px!=null){kam.x=bas.x+(n[0].x-bas.px);kam.y=bas.y+(n[0].y-bas.py);kamIste();}});
    function bitir(e){var t=tap;delete P[e.pointerId];kamParmak=noktalar().length;durum0();
      if(t&&e.type==='pointerup'&&Date.now()-t.t<400){var r=kap.getBoundingClientRect();durakDokun((e.clientX-r.left-kam.x)/kam.s,(e.clientY-r.top-kam.y)/kam.s);}tap=null;}
    kap.addEventListener('pointerup',bitir);kap.addEventListener('pointercancel',bitir);
    kap.addEventListener('wheel',function(e){e.preventDefault();var r=kap.getBoundingClientRect(),mx=e.clientX-r.left,my=e.clientY-r.top,hx=(mx-kam.x)/kam.s,hy=(my-kam.y)/kam.s;
      kam.s*=Math.exp(-e.deltaY*.0015);var b=kamSinir();kam.s=Math.min(b.max,Math.max(b.min,kam.s));kam.x=mx-hx*kam.s;kam.y=my-hy*kam.s;kamIste();},{passive:false});
  }
  function durakDokun(hx,hy){
    var D=V.rota.duraklar,en=-1,ed=1e9;
    D.forEach(function(d,i){var bx=d.rozet?d.rozet[0]:d.x,by=d.rozet?d.rozet[1]:d.y,dd=Math.hypot(hx-bx,hy-by);if(dd<ed){ed=dd;en=i;}});
    if(en>=0&&ed<=Math.max(40,22/kam.s))durakSahne(en,true);
  }


  // ---------- ekranlar ----------
  function goster(ad){['mt-giris','mt-test','mt-sonuc'].forEach(function(x){var e=$(x);if(e)e.hidden=x!==ad;});}
  function giris(){
    var s=sinif(),el=$('mt-giris');if(!el)return;
    if(!s){
      el.innerHTML='<div class="iz-hero"><span class="iz-ust">Her gün 5 soru · dünya turu</span><h2><svg class="ic" aria-hidden="true"><use href="#i-pusula"/></svg>Matematiğin İzinde</h2>'+
        '<p>Sorular sınıfına ve okulda işlediğin konulara göre gelir. Önce sınıfını seç.</p><button type="button" class="mt-btn" id="iz-sinif-sec">Sınıfımı seç</button></div>';
      goster('mt-giris');var b=$('iz-sinif-sec');if(b)b.onclick=sinifSec;rozet();return;
    }
    if(!V.rota)el.innerHTML='<div class="iz-hero"><h2><svg class="ic" aria-hidden="true"><use href="#i-pusula"/></svg>Matematiğin İzinde</h2><p>Yükleniyor…</p></div>';
    goster('mt-giris');
    temelVeri().then(function(){cizGiris(s);setTimeout(katex,300);})['catch'](function(){
      el.innerHTML='<div class="iz-hero"><h2><svg class="ic" aria-hidden="true"><use href="#i-pusula"/></svg>Matematiğin İzinde</h2><p>Veriler yüklenemedi. İnternet bağlantını kontrol edip tekrar dene.</p><button type="button" class="mt-btn" id="iz-yeniden">Tekrar dene</button></div>';
      var b=$('iz-yeniden');if(b)b.onclick=giris;});
  }
  function cizGiris(s){
    var st=durum(),D=V.rota.duraklar,cur=D[st.konum],dr=V.dur[cur.id]||{},bg=bugun(),r=st.v.g[bg],o='';
    o+='<div class="iz-hero"><div class="iz-ust-satir"><span class="iz-ust">Her gün 5 soru · dünya turu</span><button type="button" class="iz-sinif" id="iz-sinif">'+esc(sinifAd(s))+' ›</button></div>'+
      '<h2><svg class="ic" aria-hidden="true"><use href="#i-pusula"/></svg>Matematiğin İzinde</h2><p class="iz-yer"><svg class="ic" aria-hidden="true"><use href="#i-konum"/></svg>'+esc(cur.yer)+(dr.matematikci?' · '+esc(dr.matematikci.ad):'')+'</p></div>';
    o+='<div class="iz-harita-kart"><div class="iz-harita" id="iz-harita"><div class="iz-ic" id="iz-ic">'+(V.taban||'')+
      '<svg id="iz-svg" viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none"></svg></div></div>'+
      '<div class="iz-harita-alt"><button type="button" class="iz-yak" id="iz-yak">'+(yakin?'<svg class="ic" aria-hidden="true"><use href="#i-harita"/></svg>Tüm harita':'<svg class="ic" aria-hidden="true"><use href="#i-buyutec"/></svg>Yakınlaş')+'</button><span>'+(st.sonraki?'Sıradaki durak: <b>'+esc(st.sonraki.yer)+'</b> · '+(st.sonraki.adim-st.toplam)+' set':'<svg class="ic" aria-hidden="true"><use href="#i-bayrak"/></svg>Yolculuğu tamamladın!')+'</span></div></div>';
    // günün seti
    o+='<div class="mt-kart iz-gun">';
    if(tamamMi(r)){o+='<div class="iz-gun-ust"><b><svg class="ic" aria-hidden="true"><use href="#i-tamam"/></svg>Bugünün seti tamam</b><span>'+r.d+'/'+r.cev.length+' doğru</span></div><div class="iz-gun-btn"><button type="button" class="mt-btn2" id="iz-gor">Çözümleri gör</button><button type="button" class="mt-btn2" id="iz-tekrar">Baştan çöz</button></div>';}
    else{var cevli=r&&r.cev?r.cev.filter(function(x){return x!==null&&x!==undefined;}).length:0;
      o+='<div class="iz-gun-ust"><b>Bugünün seti</b><span>'+NS+' soru · yaklaşık 10 dk</span></div>'+
        '<button type="button" class="mt-btn" id="iz-basla">'+(cevli?'Devam et ('+cevli+'/'+NS+')':'Başla')+'</button>';}
    o+='</div>';
    // durum
    var kad=st.kademe;
    o+='<div class="mt-kart iz-durum"><div class="iz-kademe"><svg viewBox="0 0 120 124" aria-hidden="true"><use href="#iz-m'+kad+'"/></svg><div><small>'+kad+'. kademe</small><b>'+esc(KADEME[kad-1])+'</b>';
    if(st.bekleyen){var b=st.bekleyen,eks=[];if(st.toplam<b.adim)eks.push((b.adim-st.toplam)+' set');if(st.enUzun<b.seri)eks.push(b.seri+' günlük seri (en uzun serin '+st.enUzun+')');
      o+='<span>'+(b.no===4?'Aslana dönüşmek':'Sonraki kademe')+' için: '+eks.join(' + ')+'</span>';}
    o+='</div></div><div class="iz-sayilar"><div><b><svg class="ic" aria-hidden="true"><use href="#i-alev"/></svg>'+st.seri+'</b><small>günlük seri</small></div><div><b>'+st.enUzun+'</b><small>en uzun seri</small></div><div><b>'+st.toplam+'</b><small>çözülen set</small></div></div>'+
      '<p class="iz-not">Haftada 1 gün kaçırırsan serin bozulmaz. Önceki günlerin setlerini sonradan çözebilirsin ama seriye sayılmaz.</p></div>';
    // önceki günler
    var gec='',bosSay=0;for(var i=1;i<=7;i++){var k=gunEkle(bg,-i),x=st.v.g[k],t=gunT(k),ad=t.getDate()+' '+AY[t.getMonth()];
      if(!tamamMi(x)&&++bosSay>3)continue;                    // çözülmemiş günlerden en yakın 3'ü
      gec+='<div><span>'+ad+'</span>'+(tamamMi(x)?'<b>'+x.d+'/'+x.cev.length+(x.gec?' ·sonradan':'')+'</b>':'<button type="button" class="iz-gec-btn" data-gun="'+k+'">Sonradan çöz</button>')+'</div>';}
    o+='<div class="mt-kart"><p class="mt-bas">Önceki günler</p><div class="iz-gecmis">'+gec+'</div></div>';
    $('mt-giris').innerHTML=o;goster('mt-giris');
    haritaKur(st);
    $('iz-yak').onclick=function(){yakin=!yakin;this.innerHTML=yakin?'<svg class="ic" aria-hidden="true"><use href="#i-harita"/></svg>Tüm harita':'<svg class="ic" aria-hidden="true"><use href="#i-buyutec"/></svg>Yakınlaş';var b=kamSinir(),mp=maskotYer(st);
      kamGit(yakin?kamMerkez(mp.x,mp.y,Math.max(b.min,b.w/900)):{s:b.min,x:0,y:0},700,yumusak);};
    $('iz-sinif').onclick=sinifSec;
    var bb=$('iz-basla');if(bb)bb.onclick=function(){basla(bg,s);};
    var gg=$('iz-gor');if(gg)gg.onclick=function(){sonucGoster(bg,s,null);};
    var tk=$('iz-tekrar');if(tk)tk.onclick=function(){basla(bg,s,true);};
    [].forEach.call(document.querySelectorAll('.iz-gec-btn'),function(b){b.onclick=function(){basla(b.getAttribute('data-gun'),s);};});
    rozet();
  }
  function sinifSec(){var b=$('sn-deg');if(b)b.click();else tost('Sınıfını Ayarlar’dan seçebilirsin.');}

  // ---------- soru çözme ----------
  function basla(gun,s,tekrar){
    setAl(gun,s,true).then(function(l){return katex().then(function(){return l;});}).then(function(liste){
      if(!liste.length){tost('Bu sınıf için henüz soru yok.');return;}
      var v=oku(),r=v.g[gun];
      aktif={gun:gun,s:s,liste:liste,i:0};
      if(tekrar){aktif.tekrar=true;aktif.cev=liste.map(function(){return null;});} // tekrar: kayda yazılmaz, seri/harita değişmez
      else{var i=r.cev.indexOf(null);aktif.i=i<0?0:i;}
      soruCiz();window.scrollTo(0,0);
    });
  }
  function soruCiz(){
    var a=aktif,q=a.liste[a.i],v=oku(),r=a.tekrar?{cev:a.cev}:v.g[a.gun],sec=r.cev[a.i],harf='ABCDE',cozuldu=sec!==null&&sec!==undefined,o='';
    o+='<div class="iz-test-ust"><button type="button" class="iz-kapat" id="iz-kapat" aria-label="Kapat">✕</button><div class="iz-noktalar">';
    for(var j=0;j<a.liste.length;j++){var c=r.cev[j],cls=c===null||c===undefined?'':(c===a.liste[j].c?' d':' y');o+='<i class="'+(j===a.i?'su':'')+cls+'"></i>';}
    o+='</div><span>'+(a.i+1)+'/'+a.liste.length+'</span></div>';
    if(a.tekrar)o+='<p class="iz-gec-not">Tekrar çözüm · ilk sonucun değişmez</p>';
    else if(a.gun!==bugun())o+='<p class="iz-gec-not">'+gunT(a.gun).getDate()+' '+AY[gunT(a.gun).getMonth()]+' seti · sonradan çözüm (seriye sayılmaz)</p>';
    o+='<div class="mt-kart iz-soru"><p class="iz-s">'+tex(q.s)+'</p>'+(q.sekil?'<div class="iz-sekil">'+q.sekil+'</div>':'')+'<div class="iz-secenekler">';
    q.o.forEach(function(x,k){var cls='';if(cozuldu){if(k===q.c)cls=' dogru';else if(k===sec)cls=' yanlis';}
      o+='<button type="button" class="iz-sec'+cls+'" data-k="'+k+'"'+(cozuldu?' disabled':'')+'><b>'+harf[k]+'</b><span>'+tex(x)+'</span></button>';});
    o+='</div>';
    if(cozuldu)o+='<div class="iz-cozum '+(sec===q.c?'d':'y')+'"><b>'+(sec===q.c?'Doğru!':'Doğru cevap '+harf[q.c]+'.')+'</b><p>'+tex(q.a)+'</p></div>'+
      '<button type="button" class="mt-btn" id="iz-sonraki">'+(a.i<a.liste.length-1?'Sonraki soru':'Seti bitir')+'</button>';
    o+='</div>';
    $('mt-test').innerHTML=o;goster('mt-test');
    $('iz-kapat').onclick=function(){aktif=null;giris();};
    [].forEach.call(document.querySelectorAll('.iz-sec'),function(b){b.onclick=function(){cevapla(+b.getAttribute('data-k'));};});
    var sn=$('iz-sonraki');if(sn)sn.onclick=function(){
      var r2=a.tekrar?{cev:a.cev}:oku().g[a.gun],bos=r2.cev.indexOf(null);
      if(bos<0)bitir();else{a.i=a.i<a.liste.length-1&&r2.cev[a.i+1]==null?a.i+1:bos;soruCiz();window.scrollTo(0,0);}};
  }
  function cevapla(k){
    var a=aktif,v=a.tekrar?null:oku(),r=a.tekrar?{cev:a.cev}:v.g[a.gun];if(!r||r.cev[a.i]!==null&&r.cev[a.i]!==undefined)return;
    r.cev[a.i]=k;if(!a.tekrar)yaz(v);
    try{if(navigator.vibrate)navigator.vibrate(k===a.liste[a.i].c?15:[30,40,30]);}catch(e){}
    soruCiz();
    var c=document.querySelector('.iz-cozum');if(c&&c.scrollIntoView)c.scrollIntoView({behavior:'smooth',block:'nearest'});
  }
  function bitir(){
    if(aktif&&aktif.tekrar){var t=aktif;aktif=null;return sonucGoster(t.gun,t.s,null,t.cev);}
    var a=aktif,once=durum(),v=oku(),r=v.g[a.gun];
    r.d=r.cev.filter(function(x,j){return x===a.liste[j].c;}).length;r.bit=Date.now();r.gec=a.gun!==bugun();yaz(v);
    var sonra=durum();aktif=null;
    sonucGoster(a.gun,a.s,{once:once,sonra:sonra});
  }
  function sonucGoster(gun,s,fark,tcev){
    setAl(gun,s,false).then(function(l){return katex().then(function(){return l;});}).then(function(liste){
      var r=oku().g[gun];if(!r)return giris();
      var ilk=r.d||0;if(tcev)r={cev:tcev,d:tcev.filter(function(x,j){return x===liste[j].c;}).length};
      var d=r.d||0,n=r.cev.length,harf='ABCDE',msg=d===n?'Kusursuz!':d>=n*.75?'Harika iş!':d>=n/2?'İyi gidiyorsun.':'Her set bir adım. Çözümlere göz at.',o='';
      o+='<div class="iz-hero iz-sonuc-hero"><span class="iz-ust">'+(gun===bugun()?'Bugünün seti':gunT(gun).getDate()+' '+AY[gunT(gun).getMonth()]+' seti')+'</span><h2>'+d+'/'+n+'</h2><p>'+msg+'</p>'+(tcev?'<p class="iz-adim">Tekrar çözüm · ilk denemen '+ilk+'/'+n+'</p>':'');
      if(fark)o+='<p class="iz-adim"><svg class="ic" aria-hidden="true"><use href="#i-konum"/></svg>Haritada bir adım ilerledin'+(fark.sonra.seri>fark.once.seri?' · seri '+fark.sonra.seri:'')+'</p>';
      o+='</div><div class="mt-kart"><p class="mt-bas">Çözümler</p>';
      liste.forEach(function(q,j){var c=r.cev[j],ok=c===q.c;
        o+='<details class="iz-coz '+(ok?'d':'y')+'"><summary><b>'+(j+1)+'.</b> '+(ok?'<svg class="ic" aria-hidden="true"><use href="#i-tamam"/></svg>':'<svg class="ic" aria-hidden="true"><use href="#i-yanlis"/></svg>')+' <span>'+tex(q.s.length>90?q.s.slice(0,q.s.lastIndexOf(' ',90))+'…':q.s)+'</span></summary>'+
          '<div><p>'+tex(q.s)+'</p>'+(q.sekil?'<div class="iz-sekil">'+q.sekil+'</div>':'')+'<p>Senin cevabın: <b>'+harf[c]+'</b> · Doğru: <b>'+harf[q.c]+') '+tex(q.o[q.c])+'</b></p><p>'+tex(q.a)+'</p></div></details>';});
      o+='</div>'+(tamamMi(oku().g[gun])?'<button type="button" class="mt-btn2 iz-tek-alt" id="iz-tekrar2">Baştan çöz</button>':'')+'<button type="button" class="mt-btn" id="iz-haritaya">Haritaya dön</button>';
      $('mt-sonuc').innerHTML=o;goster('mt-sonuc');window.scrollTo(0,0);
      $('iz-haritaya').onclick=giris;
      var t2=$('iz-tekrar2');if(t2)t2.onclick=function(){basla(gun,s,true);};
      if(fark)setTimeout(function(){yeniOlaylar(fark.sonra);},700);
    });
  }

  // ---------- durak kartı ve kademe töreni ----------
  function yeniOlaylar(st){
    var v=oku(),kuyruk=[];
    V.rota.duraklar.forEach(function(d){if(st.toplam>=d.adim&&v.gor.dr.indexOf(d.id)<0){kuyruk.push(function(sonra){durakSahne(V.rota.duraklar.indexOf(d),false,sonra);});v.gor.dr.push(d.id);}});
    if(st.kademe>(v.gor.k||1)){var k=st.kademe,eski=v.gor.k||1;kuyruk.push(function(sonra){tore(eski,k,sonra);});v.gor.k=k;}
    if(!v.gor.k)v.gor.k=st.kademe;
    yaz(v);
    (function sira(){var f=kuyruk.shift();if(f)f(sira);})();
  }
  function pencere(html,sonra){
    var p=document.createElement('div');p.className='iz-pencere';p.innerHTML='<div class="iz-p-ic" role="dialog" aria-modal="true">'+html+'<button type="button" class="mt-btn iz-p-kapat">Devam</button></div>';
    document.body.appendChild(p);requestAnimationFrame(function(){p.classList.add('acik');});
    function kapat(){p.classList.remove('acik');setTimeout(function(){p.remove();if(sonra)sonra();},250);}
    p.querySelector('.iz-p-kapat').onclick=kapat;p.addEventListener('click',function(e){if(e.target===p)kapat();});
    return p;
  }
  // ---------- durak sahnesi: hızlanan yakınlaşma -> kararma -> o şehrin o dönemi ----------
  var BOLGE_RENK=['#3B2A12','#2E1F0E','#3A2410','#14233F','#1E1A3A','#0F2A2A','#2A1430'];
  function durakIcerik(d,r,ul,st){
    var m=d.matematikci||{},o='<div class="iz-sh-ust"><small>'+esc(d.yaklasik_tarih||'')+'</small><h2>'+esc(r.yer)+'</h2></div>';
    if(!ul){
      o+='<div class="iz-sh-kart kilit"><b><svg class="ic" aria-hidden="true"><use href="#i-kilit"/></svg>Henüz ulaşmadın</b><p>Burada seni <b>'+esc(m.ad||'bir matematikçi')+'</b> bekliyor.'+(m.yasam?' ('+esc(m.yasam)+')':'')+'</p>'+
        '<p class="iz-sh-kalan">'+(r.adim-st.toplam)+' set daha çözünce kapılar açılacak.</p></div>';
      return o;}
    o+='<div class="iz-sh-kart"><div class="iz-sh-kim"><svg viewBox="0 0 64 64" style="--m:#141B3F;--v:#FF8A1F"><use href="#iz-s-'+r.simge+'"/></svg><div><b>'+esc(m.ad)+'</b>'+(m.yasam?'<span>'+esc(m.yasam)+'</span>':'')+'</div><button type="button" class="iz-sh-ac" aria-expanded="false">Hikâyeyi oku</button></div><div class="iz-sh-detay"><div>'+
      '<p class="iz-d-sahne">'+esc(d.karsilasma)+'</p>'+(d.eser?'<figure class="iz-eser">'+(d.eser.foto?'<img class="iz-eser-f" src="img/eser/'+r.id+'.webp" alt="'+esc(d.eser.alt||'')+'" loading="lazy"><small class="iz-eser-k">'+esc(d.eser.foto)+'</small>':'')+'<img src="img/eser/'+r.id+'.svg" alt="" loading="lazy"><figcaption>'+esc(d.eser.not||'')+'</figcaption></figure>':'')+'<div class="iz-d-bilgi"><b><svg class="ic" aria-hidden="true"><use href="#i-ampul"/></svg>Bunu biliyor muydun?</b><p>'+esc(d.ilginc)+'</p></div>';
    if(d.yan_kisi)o+='<p class="iz-d-yan">Bu durakta ayrıca: <b>'+esc(d.yan_kisi.ad||'')+'</b>'+(d.yan_kisi.yasam?' ('+esc(d.yan_kisi.yasam)+')':'')+'</p>';
    if(d.dene&&d.dene.soru)o+='<details class="iz-d-dene"><summary><svg class="ic" aria-hidden="true"><use href="#i-soru"/></svg>Dene: '+esc(d.dene.soru)+'</summary><p>'+esc(d.dene.cevap)+'</p></details>';
    return o+'</div></div></div>';
  }
  // Durak müziği: özgün bölge temaları (ses/tema/*.m4a), Web Audio ile dikişsiz döngü; varsayılan kapalı, tercih hatırlanır
  var SES={ctx:null,tampon:{},kaynak:null,kazanc:null,acik:false};
  try{SES.acik=localStorage.getItem('mf-iz-ses')==='1';}catch(e){}
  function sesDur(){var k=SES.kaynak,g=SES.kazanc;SES.kaynak=null;if(!k||!SES.ctx)return;var t=SES.ctx.currentTime;
    try{g.gain.cancelScheduledValues(t);g.gain.setValueAtTime(g.gain.value,t);g.gain.linearRampToValueAtTime(0,t+.8);k.stop(t+.85);}catch(e){}}
  function sesCal(ad){
    sesDur();if(!ad||!SES.acik)return;
    var AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
    if(!SES.ctx){try{SES.ctx=new AC();}catch(e){return;}}
    var ctx=SES.ctx;if(ctx.state==='suspended')ctx.resume();
    var bekle=SES.tampon[ad]||(SES.tampon[ad]=fetch('ses/tema/'+ad+'.m4a').then(function(r){if(!r.ok)throw 0;return r.arrayBuffer();}).then(function(b){return new Promise(function(ok,no){ctx.decodeAudioData(b,ok,no);});}));
    bekle.then(function(buf){
      if(!SES.acik||SES.istenen!==ad)return;
      var k=ctx.createBufferSource(),g=ctx.createGain();k.buffer=buf;k.loop=true;k.connect(g);g.connect(ctx.destination);
      var t=ctx.currentTime;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.55,t+2.2);k.start(t);SES.kaynak=k;SES.kazanc=g;
    }).catch(function(){delete SES.tampon[ad];});
  }
  document.addEventListener('visibilitychange',function(){if(!SES.ctx)return;if(document.hidden)SES.ctx.suspend();else if(SES.kaynak)SES.ctx.resume();});
  function durakSahne(i,zoom,sonra){
    var D=V.rota.duraklar,r=D[i],d=V.dur[r.id]||{},st=kamSt||durum(),ul=st.toplam>=r.adim;
    var kar=document.createElement('div');kar.className='iz-karart';document.body.appendChild(kar);
    var geri={s:kam.s,x:kam.x,y:kam.y};
    function ac(){
      var sh=document.createElement('div');sh.className='iz-sahne'+(ul?' kapali':' kilitli');sh.setAttribute('role','dialog');sh.setAttribute('aria-modal','true');
      sh.style.setProperty('--bolge',BOLGE_RENK[r.bolge]||'#141B3F');
      sh.innerHTML='<div class="iz-sh-arka">'+(r.gorsel?'<div class="iz-sh-gorsel"><img alt="" src="img/durak/'+r.id+'.webp"></div>':'')+'<svg class="iz-sh-yedek" viewBox="0 0 64 64" style="--m:rgba(255,255,255,.85);--v:#FFB35C"><use href="#iz-s-'+r.simge+'"/></svg></div>'+
        '<div class="iz-sh-ic">'+durakIcerik(d,r,ul,st)+'<button type="button" class="mt-btn iz-sh-kapat">'+(sonra?'Devam':'Haritaya dön')+'</button></div>';
      var img=sh.querySelector('.iz-sh-arka img');if(!img)sh.classList.add('gorselsiz');else img.onerror=function(){img.remove();sh.classList.add('gorselsiz');};
      // Hareketli sahne: açılmış duraklarda, görselin üstüne yumuşakça biner; döngü dikişi videoda çapraz geçişle gizli
      var azHareket=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
      if(img&&r.video&&ul&&!azHareket){
        var vd=document.createElement('video');vd.muted=true;vd.loop=true;vd.autoplay=true;vd.playsInline=true;vd.setAttribute('playsinline','');vd.setAttribute('muted','');vd.preload='auto';
        vd.addEventListener('playing',function(){vd.classList.add('on');},{once:true});
        vd.onerror=function(){vd.remove();};vd.src='vid/durak/'+r.id+'.mp4';
        img.parentNode.appendChild(vd);var pp=vd.play();if(pp&&pp.catch)pp.catch(function(){});
      }
      // Sinema düzeni: önce sahne izlenir, hikâye isteyince aşağıdan cam panelde açılır; görsele dokununca ya da aşağı kaydırınca geri iner
      var acB=sh.querySelector('.iz-sh-ac'),icK=sh.querySelector('.iz-sh-ic');
      function hikaye(ac){sh.classList.toggle('kapali',!ac);if(acB){acB.setAttribute('aria-expanded',ac?'true':'false');acB.textContent=ac?'Sahneye dön':'Hikâyeyi oku';}if(!ac)icK.scrollTop=0;}
      if(acB){acB.onclick=function(){hikaye(sh.classList.contains('kapali'));};
        sh.querySelector('.iz-sh-arka').onclick=function(){hikaye(false);};
        var y0=null;icK.addEventListener('touchstart',function(e){y0=e.touches[0].clientY;},{passive:true});
        icK.addEventListener('touchend',function(e){if(y0===null)return;var dy=e.changedTouches[0].clientY-y0;y0=null;
          if(dy<-40&&sh.classList.contains('kapali'))hikaye(true);else if(dy>60&&icK.scrollTop<=0&&!sh.classList.contains('kapali'))hikaye(false);},{passive:true});}
      if(ul&&r.muzik){
        var sb=document.createElement('button');sb.type='button';sb.className='iz-sh-ses';
        var sesYaz=function(){sb.innerHTML=SES.acik?'<svg class="ic" aria-hidden="true"><use href="#i-ses-ac"/></svg>':'<svg class="ic" aria-hidden="true"><use href="#i-ses-kapali"/></svg>';sb.setAttribute('aria-label',SES.acik?'Müziği kapat':'Müziği aç');sb.classList.toggle('acik',SES.acik);};
        sb.onclick=function(e){e.stopPropagation();SES.acik=!SES.acik;try{localStorage.setItem('mf-iz-ses',SES.acik?'1':'0');}catch(x){}sesYaz();SES.istenen=r.muzik;if(SES.acik)sesCal(r.muzik);else sesDur();};
        sesYaz();sh.appendChild(sb);SES.istenen=r.muzik;if(SES.acik)sesCal(r.muzik);
      }
      document.body.appendChild(sh);
      requestAnimationFrame(function(){sh.classList.add('acik');kar.classList.add('git');});
      function kapat(){SES.istenen=null;sesDur();sh.classList.remove('acik');kar.classList.remove('git');kar.classList.add('tam');
        setTimeout(function(){sh.remove();if(zoom&&$('iz-harita')){kamGit(geri,650,yumusak);}kar.classList.remove('tam');setTimeout(function(){kar.remove();},350);if(sonra)sonra();},300);}
      sh.querySelector('.iz-sh-kapat').onclick=kapat;
    }
    if(zoom&&$('iz-harita')){
      var b=kamSinir(),hx=r.rozet?r.rozet[0]:r.x,hy=r.rozet?r.rozet[1]:r.y,son=kamMerkez(hx,hy,b.max);
      kar.classList.add('yavas');requestAnimationFrame(function(){kar.classList.add('tam');});
      kamGit(son,1100,hizlanan,ac);
    }else{kar.classList.add('tam');setTimeout(ac,250);}
  }
  function durakAc(id,yeni,sonra){
    var d=V.dur[id],r=null;V.rota.duraklar.forEach(function(x){if(x.id===id)r=x;});if(!d||!r)return sonra&&sonra();
    var m=d.matematikci||{},o='<div class="iz-d-ust"><svg viewBox="0 0 64 64" style="--m:#141B3F;--v:#FF8A1F"><use href="#iz-s-'+r.simge+'"/></svg><div><small>'+(yeni?'Yeni durak · ':'')+esc(d.yer||r.yer)+(d.yaklasik_tarih?' · '+esc(d.yaklasik_tarih):'')+'</small><b>'+esc(m.ad)+'</b>'+(m.yasam?'<span>'+esc(m.yasam)+'</span>':'')+'</div></div>';
    o+='<p class="iz-d-sahne">'+esc(d.karsilasma)+'</p><div class="iz-d-bilgi"><b><svg class="ic" aria-hidden="true"><use href="#i-ampul"/></svg>Bunu biliyor muydun?</b><p>'+esc(d.ilginc)+'</p></div>';
    if(d.yan_kisi){var y=d.yan_kisi;o+='<p class="iz-d-yan">Bu durakta ayrıca: <b>'+esc(y.ad||'')+'</b>'+(y.yasam?' ('+esc(y.yasam)+')':'')+'</p>';}
    if(d.dene&&d.dene.soru)o+='<details class="iz-d-dene"><summary><svg class="ic" aria-hidden="true"><use href="#i-soru"/></svg>Dene: '+esc(d.dene.soru)+'</summary><p>'+esc(d.dene.cevap)+'</p></details>';
    pencere(o,sonra);
  }
  function tore(eski,yeni,sonra){
    var o='<div class="iz-tore'+(yeni===4?' donusum':'')+'"><div class="iz-tore-sahne"><svg class="iz-t-eski" viewBox="0 0 120 124"><use href="#iz-m'+eski+'"/></svg><svg class="iz-t-yeni" viewBox="0 0 120 124"><use href="#iz-m'+yeni+'"/></svg></div>'+
      '<small>'+yeni+'. kademe</small><h3>'+(yeni===4?'Dönüşüm! Artık bir aslansın':esc(KADEME[yeni-1]))+'</h3><p>'+
      ['','','Yolculuğun ilk durakları geride kaldı.','Yelen belirmeye başladı; bilgin büyüyor.','Bağdat’ın kapısındasın. Emeğin ve serin seni aslana dönüştürdü.','Avrupa’nın akademileri seni bekliyor.','Bilge aslan oldun. Son durak Ankara’da bir kara tahta seni bekliyor.'][yeni]+'</p></div>';
    pencere(o,sonra);
  }

  // ---------- rozet, yardımcılar ----------
  function rozet(){var e=$('nav-mantik');if(!e)return;var r=oku().g[bugun()],yeni=!!sinif()&&!tamamMi(r);e.textContent=yeni?'Yeni':'';e.className=yeni?'var':'';}
  var tT=null;function tost(t){var e=$('iz-tost');if(!e){e=document.createElement('div');e.id='iz-tost';e.setAttribute('role','status');document.body.appendChild(e);}
    e.textContent=t;e.classList.add('gor');clearTimeout(tT);tT=setTimeout(function(){e.classList.remove('gor');},2600);}
  document.addEventListener('visibilitychange',function(){if(!document.hidden)rozet();});
  window.addEventListener('mf-sinif-degisti',function(){if(document.body.classList.contains('s-mantik')&&!aktif)giris();rozet();});
  window.addEventListener('resize',function(){if(!aktif&&V.rota&&$('iz-harita')&&!$('mt-giris').hidden)haritaKur(durum());});
  try{new MutationObserver(function(){if(!aktif&&V.rota&&$('iz-svg')&&!$('mt-giris').hidden)$('iz-svg').innerHTML=haritaSvg(durum());}).observe(document.documentElement,{attributes:true,attributeFilter:['class']});}catch(e){}
  window.MF_MT=function(){if(aktif)soruCiz();else giris();};
  rozet();
  if(location.hash==='#mantik'&&window.MF_SAYFA)window.MF_SAYFA('mantik');
  // uygulama açılınca boşta: Yolculuk verisini önceden yükle (sekme anında açılsın)
  (function onYukle(){var f=function(){temelVeri().then(function(){var x=sinif();if(x)return sorular(x);})['catch'](function(){});};
    if(window.requestIdleCallback)requestIdleCallback(f,{timeout:4000});else setTimeout(f,2500);})();
})();
