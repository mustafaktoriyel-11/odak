// ================= MATEMATİĞİN İZİNDE (günlük 8 soru + dünya turu) =================
// Veri: veri/izinde/{mufredat,rota,duraklar}.json, sorular-<sınıf>.json · Seçici: js/izinde-secim.js · Görseller: js/17-izinde-gorsel.js
// Kayıt: localStorage 'mf-izinde' = {g:{'YYYY-MM-DD':{s:sınıf, ids:[...], cev:[...], d:doğru, bit:zaman, gec:sonradan mı}}, gor:{dr:[görülen duraklar], k:görülen kademe}}
(function(){
  var $=function(id){return document.getElementById(id);};
  var K='mf-izinde',NS=8,W=2576,H=1438;
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
    if(!yukleniyor)yukleniyor=Promise.all([json('veri/izinde/mufredat.json'),json('veri/izinde/rota.json'),json('veri/izinde/duraklar.json')]).then(function(a){
      V.muf=a[0];V.rota=a[1];V.dur={};(Array.isArray(a[2])?a[2]:a[2].duraklar).forEach(function(d){V.dur[d.id]=d;});
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
  function haritaKur(st){
    var kap=$('iz-harita');if(!kap)return;
    var w=kap.clientWidth||360,s=yakin?Math.max(w/900,.3):w/W,ic=$('iz-ic');
    ic.style.width=Math.round(W*s)+'px';ic.style.height=Math.round(H*s)+'px';
    kap.style.height=Math.min(Math.round(H*s),Math.round(w*.78))+'px';
    $('iz-svg').innerHTML=haritaSvg(st);
    if(yakin){var mp=maskotYer(st);kap.scrollLeft=Math.max(0,mp.x*s-w/2);kap.scrollTop=Math.max(0,mp.y*s-kap.clientHeight*.55);}
    else{kap.scrollLeft=0;kap.scrollTop=0;}
  }

  // ---------- ekranlar ----------
  function goster(ad){['mt-giris','mt-test','mt-sonuc'].forEach(function(x){var e=$(x);if(e)e.hidden=x!==ad;});}
  function giris(){
    var s=sinif(),el=$('mt-giris');if(!el)return;
    if(!s){
      el.innerHTML='<div class="iz-hero"><span class="iz-ust">Her gün 8 soru · dünya turu</span><h2>🧭 Matematiğin İzinde</h2>'+
        '<p>Sorular sınıfına ve okulda işlediğin konulara göre gelir. Önce sınıfını seç.</p><button type="button" class="mt-btn" id="iz-sinif-sec">Sınıfımı seç</button></div>';
      goster('mt-giris');var b=$('iz-sinif-sec');if(b)b.onclick=sinifSec;rozet();return;
    }
    if(!V.rota)el.innerHTML='<div class="iz-hero"><h2>🧭 Matematiğin İzinde</h2><p>Yükleniyor…</p></div>';
    goster('mt-giris');
    temelVeri().then(function(){return katex();}).then(function(){cizGiris(s);})['catch'](function(){
      el.innerHTML='<div class="iz-hero"><h2>🧭 Matematiğin İzinde</h2><p>Veriler yüklenemedi. İnternet bağlantını kontrol edip tekrar dene.</p><button type="button" class="mt-btn" id="iz-yeniden">Tekrar dene</button></div>';
      var b=$('iz-yeniden');if(b)b.onclick=giris;});
  }
  function cizGiris(s){
    var st=durum(),D=V.rota.duraklar,cur=D[st.konum],dr=V.dur[cur.id]||{},bg=bugun(),r=st.v.g[bg],o='';
    o+='<div class="iz-hero"><div class="iz-ust-satir"><span class="iz-ust">Her gün 8 soru · dünya turu</span><button type="button" class="iz-sinif" id="iz-sinif">'+esc(sinifAd(s))+' ›</button></div>'+
      '<h2>🧭 Matematiğin İzinde</h2><p class="iz-yer">📍 '+esc(cur.yer)+(dr.matematikci?' · '+esc(dr.matematikci.ad):'')+'</p></div>';
    o+='<div class="iz-harita-kart"><div class="iz-harita" id="iz-harita"><div class="iz-ic" id="iz-ic"><img class="iz-g" src="img/harita-gunduz.webp" alt="" draggable="false"><img class="iz-n" src="img/harita-gece.webp" alt="" draggable="false">'+
      '<svg id="iz-svg" viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none"></svg></div></div>'+
      '<div class="iz-harita-alt"><button type="button" class="iz-yak" id="iz-yak">'+(yakin?'🗺️ Tüm harita':'🔍 Yakınlaş')+'</button><span>'+(st.sonraki?'Sıradaki durak: <b>'+esc(st.sonraki.yer)+'</b> · '+(st.sonraki.adim-st.toplam)+' set':'🏁 Yolculuğu tamamladın!')+'</span></div></div>';
    // günün seti
    o+='<div class="mt-kart iz-gun">';
    if(tamamMi(r)){o+='<div class="iz-gun-ust"><b>Bugünün seti tamam ✅</b><span>'+r.d+'/'+r.cev.length+' doğru</span></div><button type="button" class="mt-btn2" id="iz-gor">Çözümleri gör</button>';}
    else{var cevli=r&&r.cev?r.cev.filter(function(x){return x!==null&&x!==undefined;}).length:0;
      o+='<div class="iz-gun-ust"><b>Bugünün seti</b><span>'+NS+' soru · yaklaşık 15 dk</span></div>'+
        '<button type="button" class="mt-btn" id="iz-basla">'+(cevli?'Devam et ('+cevli+'/'+NS+')':'Başla')+'</button>';}
    o+='</div>';
    // durum
    var kad=st.kademe;
    o+='<div class="mt-kart iz-durum"><div class="iz-kademe"><svg viewBox="0 0 120 124" aria-hidden="true"><use href="#iz-m'+kad+'"/></svg><div><small>'+kad+'. kademe</small><b>'+esc(KADEME[kad-1])+'</b>';
    if(st.bekleyen){var b=st.bekleyen,eks=[];if(st.toplam<b.adim)eks.push((b.adim-st.toplam)+' set');if(st.enUzun<b.seri)eks.push(b.seri+' günlük seri (en uzun serin '+st.enUzun+')');
      o+='<span>'+(b.no===4?'Aslana dönüşmek':'Sonraki kademe')+' için: '+eks.join(' + ')+'</span>';}
    o+='</div></div><div class="iz-sayilar"><div><b>🔥 '+st.seri+'</b><small>günlük seri</small></div><div><b>'+st.enUzun+'</b><small>en uzun seri</small></div><div><b>'+st.toplam+'</b><small>çözülen set</small></div></div>'+
      '<p class="iz-not">Haftada 1 gün kaçırırsan serin bozulmaz. Önceki günlerin setlerini sonradan çözebilirsin ama seriye sayılmaz.</p></div>';
    // önceki günler
    var gec='',bosSay=0;for(var i=1;i<=7;i++){var k=gunEkle(bg,-i),x=st.v.g[k],t=gunT(k),ad=t.getDate()+' '+AY[t.getMonth()];
      if(!tamamMi(x)&&++bosSay>3)continue;                    // çözülmemiş günlerden en yakın 3'ü
      gec+='<div><span>'+ad+'</span>'+(tamamMi(x)?'<b>'+x.d+'/'+x.cev.length+(x.gec?' ·sonradan':'')+'</b>':'<button type="button" class="iz-gec-btn" data-gun="'+k+'">Sonradan çöz</button>')+'</div>';}
    o+='<div class="mt-kart"><p class="mt-bas">Önceki günler</p><div class="iz-gecmis">'+gec+'</div></div>';
    $('mt-giris').innerHTML=o;goster('mt-giris');
    haritaKur(st);
    $('iz-yak').onclick=function(){yakin=!yakin;cizGiris(s);};
    $('iz-sinif').onclick=sinifSec;
    var bb=$('iz-basla');if(bb)bb.onclick=function(){basla(bg,s);};
    var gg=$('iz-gor');if(gg)gg.onclick=function(){sonucGoster(bg,s,null);};
    [].forEach.call(document.querySelectorAll('.iz-gec-btn'),function(b){b.onclick=function(){basla(b.getAttribute('data-gun'),s);};});
    $('iz-svg').addEventListener('click',function(e){var g=e.target.closest&&e.target.closest('.iz-durak');if(!g)return;var i=+g.getAttribute('data-i'),d=D[i];
      if(st.toplam>=d.adim)durakAc(d.id,false);else tost(d.yer+' için '+(d.adim-st.toplam)+' set daha çöz.');});
    rozet();
  }
  function sinifSec(){var b=$('sn-deg');if(b)b.click();else tost('Sınıfını Ayarlar’dan seçebilirsin.');}

  // ---------- soru çözme ----------
  function basla(gun,s){
    setAl(gun,s,true).then(function(liste){
      if(!liste.length){tost('Bu sınıf için henüz soru yok.');return;}
      var v=oku(),r=v.g[gun];
      aktif={gun:gun,s:s,liste:liste,i:0};
      var i=r.cev.indexOf(null);aktif.i=i<0?0:i;
      soruCiz();window.scrollTo(0,0);
    });
  }
  function soruCiz(){
    var a=aktif,q=a.liste[a.i],v=oku(),r=v.g[a.gun],sec=r.cev[a.i],harf='ABCDE',cozuldu=sec!==null&&sec!==undefined,o='';
    o+='<div class="iz-test-ust"><button type="button" class="iz-kapat" id="iz-kapat" aria-label="Kapat">✕</button><div class="iz-noktalar">';
    for(var j=0;j<a.liste.length;j++){var c=r.cev[j],cls=c===null||c===undefined?'':(c===a.liste[j].c?' d':' y');o+='<i class="'+(j===a.i?'su':'')+cls+'"></i>';}
    o+='</div><span>'+(a.i+1)+'/'+a.liste.length+'</span></div>';
    if(a.gun!==bugun())o+='<p class="iz-gec-not">'+gunT(a.gun).getDate()+' '+AY[gunT(a.gun).getMonth()]+' seti · sonradan çözüm (seriye sayılmaz)</p>';
    o+='<div class="mt-kart iz-soru"><p class="iz-s">'+tex(q.s)+'</p>'+(q.sekil?'<div class="iz-sekil">'+q.sekil+'</div>':'')+'<div class="iz-secenekler">';
    q.o.forEach(function(x,k){var cls='';if(cozuldu){if(k===q.c)cls=' dogru';else if(k===sec)cls=' yanlis';}
      o+='<button type="button" class="iz-sec'+cls+'" data-k="'+k+'"'+(cozuldu?' disabled':'')+'><b>'+harf[k]+'</b><span>'+tex(x)+'</span></button>';});
    o+='</div>';
    if(cozuldu)o+='<div class="iz-cozum '+(sec===q.c?'d':'y')+'"><b>'+(sec===q.c?'Doğru! 🎉':'Doğru cevap '+harf[q.c]+'.')+'</b><p>'+tex(q.a)+'</p></div>'+
      '<button type="button" class="mt-btn" id="iz-sonraki">'+(a.i<a.liste.length-1?'Sonraki soru':'Seti bitir')+'</button>';
    o+='</div>';
    $('mt-test').innerHTML=o;goster('mt-test');
    $('iz-kapat').onclick=function(){aktif=null;giris();};
    [].forEach.call(document.querySelectorAll('.iz-sec'),function(b){b.onclick=function(){cevapla(+b.getAttribute('data-k'));};});
    var sn=$('iz-sonraki');if(sn)sn.onclick=function(){
      var v2=oku(),r2=v2.g[a.gun],bos=r2.cev.indexOf(null);
      if(bos<0)bitir();else{a.i=a.i<a.liste.length-1&&r2.cev[a.i+1]==null?a.i+1:bos;soruCiz();window.scrollTo(0,0);}};
  }
  function cevapla(k){
    var a=aktif,v=oku(),r=v.g[a.gun];if(!r||r.cev[a.i]!==null&&r.cev[a.i]!==undefined)return;
    r.cev[a.i]=k;yaz(v);
    try{if(navigator.vibrate)navigator.vibrate(k===a.liste[a.i].c?15:[30,40,30]);}catch(e){}
    soruCiz();
    var c=document.querySelector('.iz-cozum');if(c&&c.scrollIntoView)c.scrollIntoView({behavior:'smooth',block:'nearest'});
  }
  function bitir(){
    var a=aktif,once=durum(),v=oku(),r=v.g[a.gun];
    r.d=r.cev.filter(function(x,j){return x===a.liste[j].c;}).length;r.bit=Date.now();r.gec=a.gun!==bugun();yaz(v);
    var sonra=durum();aktif=null;
    sonucGoster(a.gun,a.s,{once:once,sonra:sonra});
  }
  function sonucGoster(gun,s,fark){
    setAl(gun,s,false).then(function(liste){
      var r=oku().g[gun];if(!r)return giris();
      var d=r.d||0,n=r.cev.length,harf='ABCDE',msg=d===n?'Kusursuz! 🌟':d>=n*.75?'Harika iş! 💪':d>=n/2?'İyi gidiyorsun 👍':'Her set bir adım. Çözümlere göz at 📖',o='';
      o+='<div class="iz-hero iz-sonuc-hero"><span class="iz-ust">'+(gun===bugun()?'Bugünün seti':gunT(gun).getDate()+' '+AY[gunT(gun).getMonth()]+' seti')+'</span><h2>'+d+'/'+n+'</h2><p>'+msg+'</p>';
      if(fark)o+='<p class="iz-adim">🐾 Haritada bir adım ilerledin'+(fark.sonra.seri>fark.once.seri?' · seri 🔥 '+fark.sonra.seri:'')+'</p>';
      o+='</div><div class="mt-kart"><p class="mt-bas">Çözümler</p>';
      liste.forEach(function(q,j){var c=r.cev[j],ok=c===q.c;
        o+='<details class="iz-coz '+(ok?'d':'y')+'"><summary><b>'+(j+1)+'.</b> '+(ok?'✅':'❌')+' <span>'+tex(q.s.length>90?q.s.slice(0,q.s.lastIndexOf(' ',90))+'…':q.s)+'</span></summary>'+
          '<div><p>'+tex(q.s)+'</p>'+(q.sekil?'<div class="iz-sekil">'+q.sekil+'</div>':'')+'<p>Senin cevabın: <b>'+harf[c]+'</b> · Doğru: <b>'+harf[q.c]+') '+tex(q.o[q.c])+'</b></p><p>'+tex(q.a)+'</p></div></details>';});
      o+='</div><button type="button" class="mt-btn" id="iz-haritaya">Haritaya dön</button>';
      $('mt-sonuc').innerHTML=o;goster('mt-sonuc');window.scrollTo(0,0);
      $('iz-haritaya').onclick=giris;
      if(fark)setTimeout(function(){yeniOlaylar(fark.sonra);},700);
    });
  }

  // ---------- durak kartı ve kademe töreni ----------
  function yeniOlaylar(st){
    var v=oku(),kuyruk=[];
    V.rota.duraklar.forEach(function(d){if(st.toplam>=d.adim&&v.gor.dr.indexOf(d.id)<0){kuyruk.push(function(sonra){durakAc(d.id,true,sonra);});v.gor.dr.push(d.id);}});
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
  function durakAc(id,yeni,sonra){
    var d=V.dur[id],r=null;V.rota.duraklar.forEach(function(x){if(x.id===id)r=x;});if(!d||!r)return sonra&&sonra();
    var m=d.matematikci||{},o='<div class="iz-d-ust"><svg viewBox="0 0 64 64" style="--m:#141B3F;--v:#FF8A1F"><use href="#iz-s-'+r.simge+'"/></svg><div><small>'+(yeni?'Yeni durak · ':'')+esc(d.yer||r.yer)+(d.yaklasik_tarih?' · '+esc(d.yaklasik_tarih):'')+'</small><b>'+esc(m.ad)+'</b>'+(m.yasam?'<span>'+esc(m.yasam)+'</span>':'')+'</div></div>';
    o+='<p class="iz-d-sahne">'+esc(d.karsilasma)+'</p><div class="iz-d-bilgi"><b>💡 Bunu biliyor muydun?</b><p>'+esc(d.ilginc)+'</p></div>';
    if(d.yan_kisi){var y=d.yan_kisi;o+='<p class="iz-d-yan">Bu durakta ayrıca: <b>'+esc(y.ad||'')+'</b>'+(y.yasam?' ('+esc(y.yasam)+')':'')+'</p>';}
    if(d.dene&&d.dene.soru)o+='<details class="iz-d-dene"><summary>🤔 Dene: '+esc(d.dene.soru)+'</summary><p>'+esc(d.dene.cevap)+'</p></details>';
    pencere(o,sonra);
  }
  function tore(eski,yeni,sonra){
    var o='<div class="iz-tore'+(yeni===4?' donusum':'')+'"><div class="iz-tore-sahne"><svg class="iz-t-eski" viewBox="0 0 120 124"><use href="#iz-m'+eski+'"/></svg><svg class="iz-t-yeni" viewBox="0 0 120 124"><use href="#iz-m'+yeni+'"/></svg></div>'+
      '<small>'+yeni+'. kademe</small><h3>'+(yeni===4?'Dönüşüm! Artık bir aslansın 🦁':esc(KADEME[yeni-1]))+'</h3><p>'+
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
})();
