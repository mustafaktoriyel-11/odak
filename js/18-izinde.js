// ================= MATEMATİĞİN İZİNDE (günlük 5 soru + dünya turu) =================
// Veri: veri/izinde/{mufredat,rota,duraklar}.json, sorular-<sınıf>.json · Seçici: js/izinde-secim.js · Görseller: js/17-izinde-gorsel.js
// Kayıt: localStorage 'mf-izinde' = {g:{'YYYY-MM-DD':{s:sınıf, ids:[...], cev:[...], d:doğru, bit:zaman, gec:sonradan mı}}, gor:{dr:[görülen duraklar], k:görülen kademe}}
(function(){
  var $=function(id){return document.getElementById(id);};
  var K='mf-izinde',NS=5,W=2576,H=1438;
  var KADEME=['Pati','Pençe','Yele','Aslan','Lider','Efsane'];
  var AY=['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
  var V={muf:null,rota:null,dur:null,soru:{}},yukleniyor=null,aktif=null,yakin=true,ilkKaydir=true;

  function oku(){try{var x=JSON.parse(localStorage.getItem(K)||'{}');x.g=x.g||{};x.gor=x.gor||{dr:[],k:0};x.gor.dr=x.gor.dr||[];x.mm=x.mm||{p:0,g:{}};x.mm.g=x.mm.g||{};return x;}catch(e){return {g:{},gor:{dr:[],k:0},mm:{p:0,g:{}}};}}
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
  function yerelJson(u){return fetch(u,{cache:'no-cache'}).then(function(r){if(!r.ok)throw new Error(u);return r.json();});}
  // Android uygulaması: soru/müfredat/durak verisi siteden güncellenir (mağaza sürümü gerekmez).
  // Önce telefondaki son kopya (yoksa uygulamanın içindeki) anında kullanılır; site arkada kontrol edilir, yenisi bir sonraki açılışta gelir.
  var UZAK='https://odak.mustafaktoriyel.com/',VERI_SURUM=1,UK='mf-veri-uzak',tazelendi={};
  function yerli(){try{return !!(window.Capacitor&&(window.Capacitor.isNativePlatform?window.Capacitor.isNativePlatform():window.Capacitor.platform!=='web'));}catch(e){return false;}}
  function gecerli(u,d){
    if(!d||typeof d!=='object')return false;
    if(d.min_surum&&d.min_surum>VERI_SURUM)return false; // veri daha yeni uygulama istiyor: yerel kopyada kal
    if(/sorular-/.test(u))return Array.isArray(d.sorular)&&d.sorular.length>0&&d.sorular.every(function(q){return q&&q.id&&q.s&&Array.isArray(q.o)&&typeof q.c==='number'&&q.c>=0&&q.c<q.o.length;});
    if(/mantik\//.test(u))return Array.isArray(d.sorular)&&d.sorular.length>0&&d.sorular.every(function(q){return q&&q.id&&q.s&&Array.isArray(q.o)&&typeof q.c==='number'&&q.c>=0&&q.c<q.o.length;});
    if(/bilgi\.json/.test(u))return Array.isArray(d.kartlar)&&d.kartlar.every(function(k){return k&&k.id&&k.etiket&&k.ad;});
    if(/mufredat/.test(u))return !!d.siniflar;
    if(/rota/.test(u))return Array.isArray(d.duraklar)&&d.duraklar.length>0;
    if(/duraklar/.test(u))return Array.isArray(d)||Array.isArray(d.duraklar);
    return true;
  }
  function uzakTazele(u){
    if(tazelendi[u]||!window.caches||navigator.onLine===false)return;tazelendi[u]=1;
    var ctl=window.AbortController?new AbortController():null,z=setTimeout(function(){if(ctl)ctl.abort();},8000);
    fetch(UZAK+u,{cache:'no-cache',signal:ctl?ctl.signal:undefined}).then(function(r){if(!r.ok)throw 0;return r.text();}).then(function(t){
      clearTimeout(z);var d=JSON.parse(t);if(!gecerli(u,d))throw 0;
      return caches.open(UK).then(function(c){return c.put(UZAK+u,new Response(t,{headers:{'Content-Type':'application/json'}}));});
    })['catch'](function(){clearTimeout(z);});
  }
  function json(u){
    if(!yerli()||!window.caches)return yerelJson(u);
    return caches.open(UK).then(function(c){return c.match(UZAK+u);}).then(function(r){
      return r?r.json().then(function(d){if(!gecerli(u,d))throw 0;return d;}):Promise.reject(0);
    })['catch'](function(){return yerelJson(u);}).then(function(d){uzakTazele(u);return d;});
  }
  function temelVeri(){
    if(V.muf&&V.rota&&V.dur)return Promise.resolve();
    if(!yukleniyor)yukleniyor=Promise.all([json('veri/izinde/mufredat.json'),json('veri/izinde/rota.json'),json('veri/izinde/duraklar.json'),fetch('veri/izinde/harita.svg').then(function(r){return r.ok?r.text():'';})['catch'](function(){return '';})]).then(function(a){
      V.taban=a[3]||'';BK=null;V.muf=a[0];V.rota=a[1];V.dur={};(Array.isArray(a[2])?a[2]:a[2].duraklar).forEach(function(d){V.dur[d.id]=d;});
    })['catch'](function(e){yukleniyor=null;throw e;});
    return yukleniyor;
  }
  // ---------- haritadaki bilgi kartları (dağ, deniz, nehir; veri/izinde/bilgi.json) ----------
  var BK=null; // [{k:kart, x,y, r:dönüş, ox,oy (tam boyutta ad merkezine göre), lv:1|2|3, f}]
  function bilgiYukle(){
    if(V.bilgi)return Promise.resolve(V.bilgi);
    return json('veri/izinde/bilgi.json').then(function(d){V.bilgi=d.kartlar||[];BK=null;return V.bilgi;})['catch'](function(){V.bilgi=[];return V.bilgi;});
  }
  function bilgiYerler(){
    if(BK||!V.bilgi||!V.taban)return BK||[];
    var adlar=[],re=/<text class="hs-ad(\d)[^"]*" x="([\d.]+)" y="([\d.]+)" font-size="([\d.]+)"[^>]*?letter-spacing="([\d.]+)"(?: transform="rotate\((-?[\d.]+)[^"]*")?[^>]*>([^<]*)<\/text>/g,m;
    while((m=re.exec(V.taban)))adlar.push({lv:+m[1],x:+m[2],y:+m[3],f:+m[4],ls:+m[5],r:m[6]?+m[6]:0,ad:m[7]});
    BK=[];
    V.bilgi.forEach(function(k){
      var ad=adlar.filter(function(a){return a.ad===k.etiket;});if(!ad.length)return;
      var a=ad[ad.length-1];if(k.yakin&&ad.length>1)a=ad.reduce(function(p,c){return Math.hypot(c.x-k.yakin[0],c.y-k.yakin[1])<Math.hypot(p.x-k.yakin[0],p.y-k.yakin[1])?c:p;});
      var yg=(a.f*.6+a.ls)*a.ad.length/2; // yaklaşık yarım genişlik
      var R0=a.lv===1?a.f*.5:Math.max(13,a.f*.95);BK.push({k:k,x:a.x,y:a.y,r:a.r,ox:yg+R0+3,oy:-a.f*.35,lv:a.lv,f:a.f});
    });
    return BK;
  }
  // yakınlaşma değişkenleri (kamDur yazar): --kd işaret ölçeği, --ro rozetin şehirden ofseti (1 → 0)
  function kamVar(ad){var ic=$('iz-ic');if(!ic)return 1;var v=parseFloat(ic.style.getPropertyValue(ad));return isNaN(v)?1:v;}
  function bilgiK(lv){var ic=$('iz-ic');if(lv===1||!ic)return 1;var v=parseFloat(ic.style.getPropertyValue(lv===2?'--k2':'--k3'));return isNaN(v)?1:v;}
  function bilgiGorunur(lv){var z=($('iz-ic')||{getAttribute:function(){return '1';}}).getAttribute('data-z')||'1';return lv===1?z!=='3':lv===2?z!=='1':z==='3';}
  function bilgiIsaret(){
    var h='';bilgiYerler().forEach(function(b,i){var R=b.lv===1?b.f*.5:Math.max(13,b.f*.95);
      h+='<g class="iz-bk l'+b.lv+'" data-b="'+i+'" style="transform:translate('+b.x+'px,'+b.y+'px) rotate('+b.r+'deg) scale(var(--k'+b.lv+',1)) translate('+b.ox.toFixed(1)+'px,'+b.oy.toFixed(1)+'px) scale(min(1,calc(var(--kd,1)/var(--k'+b.lv+',1))))">'+
        '<circle r="'+R.toFixed(1)+'" fill="#FF8A1F" stroke="#fff" stroke-width="'+(R*.22).toFixed(1)+'"/><text y="'+(R*.42).toFixed(1)+'" text-anchor="middle" font-size="'+(R*1.25).toFixed(1)+'" font-weight="700" font-family="Georgia,serif" fill="#fff">i</text></g>';});
    return h;
  }
  function bilgiBul(hx,hy){
    var en=null,ed=1e9;
    bilgiYerler().forEach(function(b){if(!bilgiGorunur(b.lv))return;var k=bilgiK(b.lv),t=b.r*Math.PI/180,ox=b.ox*k,oy=b.oy*k,kd=kamVar('--kd'),ks=Math.min(k,kd);
      var px=b.x+ox*Math.cos(t)-oy*Math.sin(t),py=b.y+ox*Math.sin(t)+oy*Math.cos(t),d=Math.hypot(hx-px,hy-py);
      if(d<ed&&d<=Math.max((b.lv===1?b.f*.5:Math.max(13,b.f*.95))*ks*1.6,20/kam.s)){ed=d;en=b.k;}});
    return en;
  }
  function kalin(t){return esc(t).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>');}
  var BK_IKON={
    dag:'<path class="bk-on" d="M6 52 L24 26 L31 34 L40 16 L58 52 Z"/><path class="bk-kar" d="M40 16 L35 26 L39 24 L42 28 L45 24 Z"/><line class="bk-cizgi" x1="4" y1="52" x2="60" y2="52"/>',
    cukur:'<path class="bk-dalga" d="M0 14 q8 -4 16 0 t16 0 t16 0 t16 0"/><path class="bk-dip" d="M0 64 V40 L20 38 L28 58 L34 60 L40 40 L64 42 V64 Z"/><path class="bk-ok" d="M31 16 V54" stroke-dasharray="3 3"/><path class="bk-ok" d="M27 50 L31 56 L35 50"/>',
    nehir:'<path class="bk-nehir" d="M30 60 C26 50 38 44 32 36 C26 28 36 22 30 14 C28 10 32 6 34 4"/><circle class="bk-yesil" cx="30" cy="59" r="4"/><circle class="bk-tur" cx="34" cy="6" r="3"/>',
    okyanus:'<path class="bk-dalga" d="M4 24 q7 -5 14 0 t14 0 t14 0 t14 0"/><path class="bk-dalga" d="M4 36 q7 -5 14 0 t14 0 t14 0 t14 0"/><path class="bk-dalga" d="M4 48 q7 -5 14 0 t14 0 t14 0 t14 0"/>',
    deniz:'<path class="bk-kara" d="M0 0 H64 V14 Q48 20 40 12 Q30 4 18 14 Q8 20 0 16 Z"/><path class="bk-kara" d="M0 64 V50 Q14 44 24 52 Q36 60 48 50 Q56 46 64 50 V64 Z"/><path class="bk-dalga" d="M14 32 q6 -4 12 0 t12 0 t12 0"/>',
    gol:'<ellipse class="bk-kara2" cx="32" cy="32" rx="28" ry="24"/><ellipse class="bk-su" cx="32" cy="33" rx="19" ry="15"/><path class="bk-dalga" d="M20 33 q6 -4 12 0 t12 0"/>'
  };
  function bilgiAc(k){
    var p=$('bk-p');
    if(!p){p=document.createElement('div');p.id='bk-p';p.className='pm-sheet bk-p';p.setAttribute('role','dialog');p.setAttribute('aria-modal','true');
      p.innerHTML='<div class="sheet-k"><div class="sheet-tut"></div><div class="bk-ic"></div><button type="button" class="mt-btn2 bk-kapat">Kapat</button></div>';document.body.appendChild(p);
      var kap=function(){if(window.LEX_GERI&&LEX_GERI.dus)LEX_GERI.dus('bk-p');p.classList.remove('gor');setTimeout(function(){p.classList.remove('acik');},280);};
      p.addEventListener('click',function(e){if(e.target===p&&Date.now()-(p._t||0)>450)kap();});p.querySelector('.bk-kapat').addEventListener('click',kap);p._kap=kap;
      if(typeof ksKapat==='function')ksKapat(p,kap,p);}
    var o='<div class="bk-ust"><svg class="bk-ikon ik-'+esc(k.ikon)+'" viewBox="0 0 64 64" aria-hidden="true"><rect class="bk-zemin" width="64" height="64" rx="14"/>'+(BK_IKON[k.ikon]||BK_IKON.dag)+'</svg>'+
      '<div><div class="bk-tur">'+esc(k.tur)+'</div><h3>'+esc(k.ad)+'</h3><div class="bk-yer">'+esc(k.yer)+'</div></div></div>';
    o+='<div class="bk-say">'+(k.sayilar||[]).map(function(x){return '<div><b>'+esc(x.d)+'</b><small>'+esc(x.e)+'</small></div>';}).join('')+'</div>';
    o+='<div class="bk-mat">'+kalin(k.mat)+'</div>';
    if(k.dene)o+='<div class="bk-dene"><p><b>Dene:</b> '+esc(k.dene.s)+'</p><button type="button" class="bk-gor">Cevabı gör</button><div class="bk-cev" hidden><b>'+esc(k.dene.c)+'</b>'+(k.dene.h?'<small>'+esc(k.dene.h)+'</small>':'')+'</div></div>';
    o+='<div class="bk-kaynak">Kaynak: '+esc(k.kaynak)+'</div>';
    p.querySelector('.bk-ic').innerHTML=o;
    var g=p.querySelector('.bk-gor');if(g)g.onclick=function(){g.hidden=true;p.querySelector('.bk-cev').hidden=false;};
    p._t=Date.now();
    p.classList.add('acik');requestAnimationFrame(function(){requestAnimationFrame(function(){p.classList.add('gor');});});
    if(window.LEX_GERI&&LEX_GERI.ekle)LEX_GERI.ekle('bk-p',p._kap);
  }

  // ---------- mantık soruları (mola + havuz boşluğu) ----------
  var MN_SET=3,MN_EN_FAZLA=2; // molada 3 soru; günlük sette en çok 2 tekrar yerine mantık sorusu
  function mantikHavuz(){
    if(V.mn)return Promise.resolve(V.mn);
    return json('veri/mantik/sorular.json').then(function(d){V.mn=(d.sorular||[]).map(function(q){q.mn=true;return q;});return V.mn;})['catch'](function(){V.mn=[];return V.mn;});
  }
  function gunSayi(k){return Math.round(gunT(k).getTime()/864e5);}
  function mnSoru(gun,k){var L=V.mn||[];if(!L.length)return null;var n=L.length,i=((gunSayi(gun)*MN_EN_FAZLA+k)%n+n)%n;return L[n-1-i];} // listenin sonundan: moladan uzak
  function soruM(q){return q.mn?esc(q.s).replace(/\n/g,'<br>'):tex(q.s);}
  function sekilM(q){if(q.mn){var h=window.MF_MANTIK_CIZ?window.MF_MANTIK_CIZ.soru(q):'';return h?'<div class="iz-sekil iz-mn-sekil">'+h+'</div>':'';}return q.sekil?'<div class="iz-sekil">'+q.sekil+'</div>':'';}
  function sikM(q,k){if(q.mn)return window.MF_MANTIK_CIZ?window.MF_MANTIK_CIZ.sik(q,k):esc(q.o[k]);return tex(q.o[k]);}
  function ozet(q){var t=q.mn?String(q.s).split('\n').pop():q.s;t=t.length>90?t.slice(0,t.lastIndexOf(' ',90))+'…':t;return q.mn?esc(t):tex(t);}
  function acikM(q){return q.mn?esc(q.a).replace(/\n/g,'<br>'):tex(q.a);}
  function sorular(s){
    if(V.soru[s])return Promise.resolve(V.soru[s]);
    return json('veri/izinde/sorular-'+s+'.json').then(function(d){V.soru[s]=d.sorular||[];return V.soru[s];});
  }
  // günün seti: bir kez açılınca kimlikler kaydedilir (havuz değişse de o günün seti kaymaz)
  function setAl(gun,s,dondur){
    return Promise.all([sorular(s),mantikHavuz()]).then(function(a){var havuz=a[0];
      var v=oku(),r=v.g[gun],ids;
      // eski sürümden kalan (ör. 8 soruluk) ve hiç cevaplanmamış set: güncel soru sayısıyla yeniden kurulur
      if(r&&r.ids&&r.ids.length!==NS&&!r.bit&&r.cev&&r.cev.every(function(x){return x===null||x===undefined;})){delete v.g[gun];yaz(v);r=null;}
      if(r&&r.s===s&&r.ids&&r.ids.length)ids=r.ids;
      else{var S=window.IZINDE_SECIM;ids=(S?S.gununSeti(havuz,V.muf,s,gun,NS):[]).map(function(q){return q.id;});
        // havuz boşluğu: daha önce çıkmış soru yerine (en çok 2) mantık sorusu
        if(S&&S.gorulmus&&V.mn&&V.mn.length){var gor=S.gorulmus(gun),k=0;ids=ids.map(function(id){if(gor[id]&&k<MN_EN_FAZLA){var m=mnSoru(gun,k++);if(m)return m.id;}return id;});}
        if(dondur&&ids.length){v.g[gun]={s:s,ids:ids,cev:ids.map(function(){return null;})};yaz(v);}}
      var by={};havuz.forEach(function(q){by[q.id]=q;});(V.mn||[]).forEach(function(q){by[q.id]=q;});
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
  function onizle(){try{return localStorage.getItem('mf-iz-onizle')==='1';}catch(e){return false;}}
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
    if(onizle()&&D.length){toplam=Math.max(toplam,D[D.length-1].adim);best=Math.max(best,99);} // yalnız bu cihaz: tüm duraklar açık, kayıt değişmez
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
    var dx=a.rozet?a.rozet[0]-a.x:0,dy=a.rozet?a.rozet[1]-a.y:0;
    var m0={x:a.x+dx+40,y:a.y+dy+24,ax:a.x,ay:a.y,dx:dx,dy:dy,ox:40,oy:24};     // durakta: rozetin yanında durur (yakınlaşınca şehrin yanına iner)
    if(!b)return m0;
    var t=Math.min(.85,(st.toplam-a.adim)/(b.adim-a.adim));   // durağa varana dek yolda
    if(t<=0)return m0;
    var q=bez(a,kontrol(a,b,b.kavis),b,t);return {x:q.x,y:q.y,ax:q.x,ay:q.y,dx:0,dy:0,ox:0,oy:0};
  }
  function haritaSvg(st){
    var D=V.rota.duraklar,gece=document.documentElement.classList.contains('mf-gece'),h='';
    var m=gece?'#CFE0FF':'#141B3F',vr='#FF8A1F',soluk=gece?'rgba(159,178,255,.55)':'rgba(20,27,63,.45)';
    for(var i=1;i<D.length;i++){
      var a=D[i-1],b=D[i],c=kontrol(a,b,b.kavis),p='M'+a.x+' '+a.y+' Q'+c.x+' '+c.y+' '+b.x+' '+b.y;
      h+='<path d="'+p+'" fill="none" class="iz-r1" stroke="'+soluk+'" stroke-width="5" stroke-linecap="round" stroke-dasharray="'+(b.deniz?'14 12':'1 12')+'"/>';
      var t=st.toplam>=b.adim?1:(st.toplam<=a.adim?0:Math.min(.85,(st.toplam-a.adim)/(b.adim-a.adim)));
      if(t>0){var q='M'+a.x+' '+a.y;for(var j=1;j<=24;j++){var o=bez(a,c,b,t*j/24);q+=' L'+o.x.toFixed(1)+' '+o.y.toFixed(1);}
        h+='<path d="'+q+'" fill="none" class="iz-r2" stroke="'+vr+'" stroke-width="7" stroke-linecap="round"'+(b.deniz?' stroke-dasharray="16 10"':'')+'/>';}
    }
    D.forEach(function(d,i){
      var ul=st.toplam>=d.adim,simdi=i===st.konum,bx=d.rozet?d.rozet[0]:d.x,by=d.rozet?d.rozet[1]:d.y,mm=ul?m:'#8C93B0',vv=ul?vr:'#B9BDD0';
      var dx=bx-d.x,dy=by-d.y;
      if(d.rozet)h+='<path class="iz-bag" d="M'+d.x+' '+d.y+' L'+bx+' '+by+'" stroke="'+(ul?m:'#A8AEC8')+'" stroke-width="2" opacity=".7"/>';
      h+='<circle class="iz-sehir" cx="'+d.x+'" cy="'+d.y+'" r="6" fill="'+vv+'" stroke="'+(ul?m:'#A8AEC8')+'" stroke-width="2"/>';
      h+='<g class="iz-durak'+(ul?' ul':'')+'" data-i="'+i+'" style="transform:translate(calc('+d.x+'px + '+dx+'px*var(--ro,1)),calc('+d.y+'px + '+dy+'px*var(--ro,1))) scale(var(--kd,1));--m:'+mm+';--v:'+vv+'" opacity="'+(ul?1:.6)+'">';
      if(simdi)h+='<circle class="iz-hale" r="42" fill="'+vr+'"/>';
      h+='<circle r="30" fill="'+(gece?'#1A2142':'#FFF8EA')+'" stroke="'+(ul?(gece?'#9FB2FF':'#141B3F'):'#A8AEC8')+'" stroke-width="'+(simdi?5:3)+'"/>';
      h+='<use href="#iz-s-'+d.simge+'" transform="translate(-22 -22) scale(.69)"/><circle r="40" fill="transparent"/></g>';
    });
    h+=bilgiIsaret();
    var mp=maskotYer(st);
    h+='<g class="iz-maskot" style="transform:translate(calc('+mp.ax.toFixed(1)+'px + '+mp.dx+'px*var(--ro,1) + '+mp.ox+'px*var(--kd,1)),calc('+mp.ay.toFixed(1)+'px + '+mp.dy+'px*var(--ro,1) + '+mp.oy+'px*var(--kd,1))) scale(var(--kd,1))"><ellipse cx="0" cy="2" rx="30" ry="7" fill="rgba(0,0,0,.18)"/><g class="iz-zipla"><use href="#iz-m'+st.kademe+'" x="-45" y="-90" width="90" height="93"/></g></g>';
    return h;
  }
  // ---------- harita kamerası: tek parmak kaydır, iki parmak yakınlaştır, dokun = durak ----------
  var kam={s:1,x:0,y:0},kamSt=null,kamAnim=0;
  function kamSinir(){var k=$('iz-harita');var w=k.clientWidth,h=k.clientHeight;return {w:w,h:h,min:Math.max(w/W,h/H),max:Math.max(w/W,h/H)*16};}
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
    // işaretler (rozet, şehir noktası, rota, maskot, "i") yakınlaştıkça ekranda yavaş büyür: kd; rozet z≥3,2'de şehrin üstüne oturur: ro
    ic.style.setProperty('--kd',Math.min(1,1.4/Math.pow(z,.85)).toFixed(3));ic.style.setProperty('--ro',Math.max(0,Math.min(1,(3.2-z)/2.2)).toFixed(3));
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
    var bk=bilgiBul(hx,hy);if(bk)return bilgiAc(bk);
    var D=V.rota.duraklar,en=-1,ed=1e9;
    var ro=kamVar('--ro'),kd=kamVar('--kd');
    D.forEach(function(d,i){var bx=d.rozet?d.x+(d.rozet[0]-d.x)*ro:d.x,by=d.rozet?d.y+(d.rozet[1]-d.y)*ro:d.y,dd=Math.hypot(hx-bx,hy-by);if(dd<ed){ed=dd;en=i;}});
    if(en>=0&&ed<=Math.max(40*kd,22/kam.s))durakSahne(en,true);
  }


  // ---------- ekranlar ----------
  function goster(ad){['mt-giris','mt-test','mt-sonuc'].forEach(function(x){var e=$(x);if(e)e.hidden=x!==ad;});if(typeof haritaMuzik==='function')haritaMuzik();}
  function giris(){
    var s=sinif(),el=$('mt-giris');if(!el)return;
    if(!s){
      el.innerHTML='<div class="iz-hero"><span class="iz-ust">Her gün 5 soru · dünya turu</span><h2><svg class="ic" aria-hidden="true"><use href="#i-pusula"/></svg>Matematiğin İzinde</h2>'+
        '<p>Sorular sınıfına ve okulda işlediğin konulara göre gelir. Önce sınıfını seç.</p><button type="button" class="mt-btn" id="iz-sinif-sec">Sınıfımı seç</button></div>';
      goster('mt-giris');var b=$('iz-sinif-sec');if(b)b.onclick=sinifSec;rozet();return;
    }
    if(!V.rota)el.innerHTML='<div class="iz-hero"><h2><svg class="ic" aria-hidden="true"><use href="#i-pusula"/></svg>Matematiğin İzinde</h2><p>Yükleniyor…</p></div>';
    goster('mt-giris');
    temelVeri().then(function(){return bilgiYukle();}).then(function(){cizGiris(s);setTimeout(katex,300);})['catch'](function(){
      el.innerHTML='<div class="iz-hero"><h2><svg class="ic" aria-hidden="true"><use href="#i-pusula"/></svg>Matematiğin İzinde</h2><p>Veriler yüklenemedi. İnternet bağlantını kontrol edip tekrar dene.</p><button type="button" class="mt-btn" id="iz-yeniden">Tekrar dene</button></div>';
      var b=$('iz-yeniden');if(b)b.onclick=giris;});
  }
  function cizGiris(s){
    var st=durum(),D=V.rota.duraklar,cur=D[st.konum],dr=V.dur[cur.id]||{},bg=bugun(),r=st.v.g[bg],o='';
    o+='<div class="iz-hero"><div class="iz-ust-satir"><span class="iz-ust">Her gün 5 soru · dünya turu</span><button type="button" class="iz-sinif" id="iz-sinif">'+esc(sinifAd(s))+' ›</button></div>'+
      '<h2><svg class="ic" aria-hidden="true"><use href="#i-pusula"/></svg>Matematiğin İzinde</h2><p class="iz-yer"><svg class="ic" aria-hidden="true"><use href="#i-konum"/></svg>'+esc(cur.yer)+(dr.matematikci?' · '+esc(dr.matematikci.ad):'')+'</p></div>';
    if(onizle())o+='<p class="iz-gec-not">Önizleme modu: tüm duraklar açık (yalnız bu cihazda). Kapatmak için Ayarlar’da sürüm yazısına 5 kez dokun.</p>';
    o+='<div class="iz-harita-kart"><div class="iz-harita" id="iz-harita"><div class="iz-ic" id="iz-ic">'+(V.taban||'')+
      '<svg id="iz-svg" viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none"></svg></div></div>'+
      '<div class="iz-harita-alt"><button type="button" class="iz-yak iz-muz" id="iz-muz" aria-label="Harita müziği"></button><button type="button" class="iz-yak" id="iz-yak">'+(yakin?'<svg class="ic" aria-hidden="true"><use href="#i-harita"/></svg>Tüm harita':'<svg class="ic" aria-hidden="true"><use href="#i-buyutec"/></svg>Yakınlaş')+'</button><span>'+(st.sonraki?'Sıradaki durak: <b>'+esc(st.sonraki.yer)+'</b> · '+(st.sonraki.adim-st.toplam)+' set':'<svg class="ic" aria-hidden="true"><use href="#i-bayrak"/></svg>Yolculuğu tamamladın!')+'</span></div></div>';
    // günün seti
    o+='<div class="mt-kart iz-gun">';
    if(tamamMi(r)){o+='<div class="iz-gun-ust"><b><svg class="ic" aria-hidden="true"><use href="#i-tamam"/></svg>Bugünün seti tamam</b><span>'+r.d+'/'+r.cev.length+' doğru</span></div><div class="iz-gun-btn"><button type="button" class="mt-btn2" id="iz-gor">Çözümleri gör</button><button type="button" class="mt-btn2" id="iz-tekrar">Baştan çöz</button></div>';}
    else{var cevli=r&&r.cev?r.cev.filter(function(x){return x!==null&&x!==undefined;}).length:0;
      o+='<div class="iz-gun-ust"><b>Bugünün seti</b><span>'+NS+' soru · yaklaşık 10 dk</span></div>'+
        '<button type="button" class="mt-btn" id="iz-basla">'+(cevli?'Devam et ('+cevli+'/'+NS+')':'Başla')+'</button>';}
    o+='</div>';
    if(tamamMi(r))o+=molaKart(bg);
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
    hmDugme();$('iz-muz').onclick=function(){HM.acik=!HM.acik;try{localStorage.setItem('mf-iz-hm',HM.acik?'1':'0');}catch(x){}hmDugme();haritaMuzik();};
    haritaMuzik();
    $('iz-yak').onclick=function(){yakin=!yakin;this.innerHTML=yakin?'<svg class="ic" aria-hidden="true"><use href="#i-harita"/></svg>Tüm harita':'<svg class="ic" aria-hidden="true"><use href="#i-buyutec"/></svg>Yakınlaş';var b=kamSinir(),mp=maskotYer(st);
      kamGit(yakin?kamMerkez(mp.x,mp.y,Math.max(b.min,b.w/900)):{s:b.min,x:0,y:0},700,yumusak);};
    $('iz-sinif').onclick=sinifSec;
    var bb=$('iz-basla');if(bb)bb.onclick=function(){basla(bg,s);};
    var gg=$('iz-gor');if(gg)gg.onclick=function(){sonucGoster(bg,s,null);};
    var tk=$('iz-tekrar');if(tk)tk.onclick=function(){basla(bg,s,true);};
    molaBagla();
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
  function kayitAl(a,v){return a.tekrar?{cev:a.cev}:a.mola?v.mm.g[a.gun]:v.g[a.gun];}
  function soruCiz(){
    // Sınav düzeni: seçim işaretlenir, doğru/yanlış ve çözümler yalnız set bitince sonuç ekranında toplu görünür
    var a=aktif,q=a.liste[a.i],v=oku(),r=kayitAl(a,v),sec=r.cev[a.i],harf='ABCDE',o='',son=a.i===a.liste.length-1;
    var bosSay=r.cev.filter(function(x){return x===null||x===undefined;}).length;
    o+='<div class="iz-test-ust"><button type="button" class="iz-kapat" id="iz-kapat" aria-label="Kapat">✕</button><div class="iz-noktalar">';
    for(var j=0;j<a.liste.length;j++){var c=r.cev[j];o+='<i class="'+(j===a.i?'su':'')+(c===null||c===undefined?'':' cev')+'" data-j="'+j+'"></i>';}
    o+='</div><span>'+(a.i+1)+'/'+a.liste.length+'</span></div>';
    if(a.mola)o+='<p class="iz-gec-not">Mantık molası · seriye sayılmaz</p>';
    else if(a.tekrar)o+='<p class="iz-gec-not">Tekrar çözüm · ilk sonucun değişmez</p>';
    else if(a.gun!==bugun())o+='<p class="iz-gec-not">'+gunT(a.gun).getDate()+' '+AY[gunT(a.gun).getMonth()]+' seti · sonradan çözüm (seriye sayılmaz)</p>';
    o+='<div class="mt-kart iz-soru'+(q.mn?' iz-mn':'')+'">'+(q.mn&&!a.mola?'<span class="iz-mn-et">Mantık sorusu</span>':'')+'<p class="iz-s">'+soruM(q)+'</p>'+sekilM(q)+'<div class="iz-secenekler">';
    q.o.forEach(function(x,k){o+='<button type="button" class="iz-sec'+(k===sec?' secili':'')+'" data-k="'+k+'" aria-pressed="'+(k===sec)+'"><b>'+harf[k]+'</b><span>'+sikM(q,k)+'</span></button>';});
    o+='</div><p class="iz-ipucu">'+(son?(bosSay?bosSay+' soru boş. Bitirmeden önce dönüp cevaplayabilirsin.':'Hepsi cevaplandı. Bitirince doğru ve yanlışların, çözümleriyle birlikte görünecek.'):'Cevabını istediğin zaman değiştirebilirsin; sonuçlar set bitince görünür.')+'</p>';
    o+='<div class="iz-gezin">'+(a.i>0?'<button type="button" class="mt-btn2" id="iz-onceki">Önceki</button>':'')+
      '<button type="button" class="mt-btn" id="iz-sonraki"'+(son&&bosSay?' disabled':'')+'>'+(son?(a.mola?'Molayı bitir':'Seti bitir'):'Sonraki soru')+'</button></div>';
    o+='</div>';
    $('mt-test').innerHTML=o;goster('mt-test');
    $('iz-kapat').onclick=function(){aktif=null;giris();};
    [].forEach.call(document.querySelectorAll('.iz-sec'),function(b){b.onclick=function(){cevapla(+b.getAttribute('data-k'));};});
    [].forEach.call(document.querySelectorAll('.iz-noktalar i'),function(n){n.onclick=function(){a.i=+n.getAttribute('data-j');soruCiz();};});
    var on=$('iz-onceki');if(on)on.onclick=function(){a.i--;soruCiz();window.scrollTo(0,0);};
    $('iz-sonraki').onclick=function(){
      if(!son){a.i++;soruCiz();window.scrollTo(0,0);return;}
      var r2=kayitAl(a,oku()),bos=r2.cev.indexOf(null);
      if(bos<0)bitir();else{a.i=bos;soruCiz();window.scrollTo(0,0);}};
  }
  function cevapla(k){
    var a=aktif,v=oku(),r=kayitAl(a,v);if(!r)return;
    r.cev[a.i]=k;if(!a.tekrar)yaz(v);
    try{if(navigator.vibrate)navigator.vibrate(12);}catch(e){}
    soruCiz();
  }
  function bitir(){
    if(aktif&&aktif.mola){var m=aktif;aktif=null;return molaSonuc(m.gun);}
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
        o+='<details class="iz-coz '+(ok?'d':'y')+'"><summary><b>'+(j+1)+'.</b> '+(ok?'<svg class="ic" aria-hidden="true"><use href="#i-tamam"/></svg>':'<svg class="ic" aria-hidden="true"><use href="#i-yanlis"/></svg>')+' <span>'+ozet(q)+'</span></summary>'+
          '<div><p>'+soruM(q)+'</p>'+sekilM(q)+'<p>Senin cevabın: <b>'+harf[c]+'</b> · Doğru: <b>'+harf[q.c]+') </b>'+sikM(q,q.c)+'</p><p>'+acikM(q)+'</p></div></details>';});
      o+='</div>'+(gun===bugun()&&!tcev&&tamamMi(oku().g[gun])?molaKart(gun):'')+(tamamMi(oku().g[gun])?'<button type="button" class="mt-btn2 iz-tek-alt" id="iz-tekrar2">Baştan çöz</button>':'')+'<button type="button" class="mt-btn" id="iz-haritaya">Haritaya dön</button>';
      $('mt-sonuc').innerHTML=o;goster('mt-sonuc');window.scrollTo(0,0);
      $('iz-haritaya').onclick=giris;
      var t2=$('iz-tekrar2');if(t2)t2.onclick=function(){basla(gun,s,true);};
      molaBagla();
      if(fark)setTimeout(function(){yeniOlaylar(fark.sonra);},700);
    });
  }

  // ---------- mantık molası (set bittikten sonra, isteğe bağlı, seriye sayılmaz) ----------
  function molaKart(gun){
    var v=oku(),m=v.mm.g[gun];
    if(m&&m.cev&&m.cev.every(function(x){return x!==null;}))
      return '<div class="mt-kart iz-mola"><div class="iz-gun-ust"><b><svg class="ic" aria-hidden="true"><use href="#i-parilti"/></svg>Mantık molası tamam</b><span>'+m.d+'/'+m.cev.length+' doğru</span></div><button type="button" class="mt-btn2 iz-mola-btn" data-gun="'+gun+'">Çözümleri gör</button></div>';
    var cevli=m&&m.cev?m.cev.filter(function(x){return x!==null;}).length:0;
    return '<div class="mt-kart iz-mola"><div class="iz-gun-ust"><b><svg class="ic" aria-hidden="true"><use href="#i-parilti"/></svg>Mantık molası</b><span>'+MN_SET+' soru · isteğe bağlı</span></div>'+
      '<p class="iz-not">Dizi, şekil ve akıl yürütme. Seriye sayılmaz, keyfine çöz.</p><button type="button" class="mt-btn2 iz-mola-btn" data-gun="'+gun+'">'+(cevli?'Devam et ('+cevli+'/'+MN_SET+')':'Molaya başla')+'</button></div>';
  }
  function molaBagla(){[].forEach.call(document.querySelectorAll('.iz-mola-btn'),function(b){b.onclick=function(){molaAc(b.getAttribute('data-gun'));};});}
  function molaAc(gun){
    mantikHavuz().then(function(L){
      if(!L.length){tost('Mantık soruları yüklenemedi.');return;}
      var v=oku(),m=v.mm.g[gun];
      if(!m){var ids=[];for(var k=0;k<MN_SET;k++)ids.push(L[(v.mm.p+k)%L.length].id);v.mm.p=(v.mm.p+MN_SET)%L.length;m=v.mm.g[gun]={ids:ids,cev:ids.map(function(){return null;})};
        var ks=Object.keys(v.mm.g).sort();while(ks.length>30)delete v.mm.g[ks.shift()];yaz(v);}
      var by={};L.forEach(function(q){by[q.id]=q;});var liste=m.ids.map(function(id){return by[id];}).filter(Boolean);
      if(liste.length!==m.ids.length){delete v.mm.g[gun];yaz(v);return molaAc(gun);} // veri güncellendi: yeni mola
      if(m.cev.every(function(x){return x!==null;}))return molaSonuc(gun);
      var i=m.cev.indexOf(null);aktif={gun:gun,liste:liste,i:i<0?0:i,mola:true};soruCiz();window.scrollTo(0,0);
    });
  }
  function molaSonuc(gun){
    var v=oku(),m=v.mm.g[gun];if(!m)return giris();
    mantikHavuz().then(function(L){
      var by={};L.forEach(function(q){by[q.id]=q;});var liste=m.ids.map(function(id){return by[id];}).filter(Boolean);
      m.d=m.cev.filter(function(x,j){return liste[j]&&x===liste[j].c;}).length;yaz(v);
      var harf='ABCDE',n=liste.length,o='<div class="iz-hero iz-sonuc-hero"><span class="iz-ust">Mantık molası</span><h2>'+m.d+'/'+n+'</h2><p>'+(m.d===n?'Zihnin keskin!':'Güzel bir mola oldu.')+'</p></div><div class="mt-kart"><p class="mt-bas">Çözümler</p>';
      liste.forEach(function(q,j){var c=m.cev[j],ok=c===q.c;
        o+='<details class="iz-coz '+(ok?'d':'y')+'"><summary><b>'+(j+1)+'.</b> '+(ok?'<svg class="ic" aria-hidden="true"><use href="#i-tamam"/></svg>':'<svg class="ic" aria-hidden="true"><use href="#i-yanlis"/></svg>')+' <span>'+ozet(q)+'</span></summary>'+
          '<div><p>'+soruM(q)+'</p>'+sekilM(q)+'<p>Senin cevabın: <b>'+harf[c]+'</b> · Doğru: <b>'+harf[q.c]+') </b>'+sikM(q,q.c)+'</p><p>'+acikM(q)+'</p></div></details>';});
      o+='</div><button type="button" class="mt-btn" id="iz-haritaya">Haritaya dön</button>';
      $('mt-sonuc').innerHTML=o;goster('mt-sonuc');window.scrollTo(0,0);$('iz-haritaya').onclick=giris;
    });
  }

  // ---------- durak kartı ve kademe töreni ----------
  function yeniOlaylar(st){
    if(onizle())return;
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
  function sesCal(ad,duzey,zorla){
    sesDur();if(!ad||(!SES.acik&&!zorla))return;
    var AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
    if(!SES.ctx){try{SES.ctx=new AC();}catch(e){return;}}
    var ctx=SES.ctx;if(ctx.state==='suspended')ctx.resume();
    var bekle=SES.tampon[ad]||(SES.tampon[ad]=fetch('ses/tema/'+ad+'.m4a').then(function(r){if(!r.ok)throw 0;return r.arrayBuffer();}).then(function(b){return new Promise(function(ok,no){ctx.decodeAudioData(b,ok,no);});}));
    bekle.then(function(buf){
      if((!SES.acik&&!zorla)||SES.istenen!==ad)return;
      var k=ctx.createBufferSource(),g=ctx.createGain();k.buffer=buf;k.loop=true;k.connect(g);g.connect(ctx.destination);
      var t=ctx.currentTime;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(duzey||.55,t+(zorla?3.5:2.2));k.start(t);SES.kaynak=k;SES.kazanc=g;
    }).catch(function(){delete SES.tampon[ad];});
  }
  // Harita müziği "Seyyah" (ses/tema/seyyah.m4a): isteğe bağlı, varsayılan kapalı; yalnız harita ekranındayken, kısık çalar
  var HM={acik:false};try{HM.acik=localStorage.getItem('mf-iz-hm')==='1';}catch(e){}
  function haritaEkrani(){var g=$('mt-giris');return !SES.sahne&&document.body.classList.contains('s-mantik')&&g&&!g.hidden&&!document.querySelector('.iz-sahne');}
  function haritaMuzik(){
    if(HM.acik&&haritaEkrani()){if(SES.istenen!=='seyyah'||!SES.kaynak){SES.istenen='seyyah';sesCal('seyyah',.3,true);}}
    else if(SES.istenen==='seyyah'){SES.istenen=null;sesDur();}
  }
  function hmDugme(){var b=$('iz-muz');if(!b)return;b.classList.toggle('acik',HM.acik);b.setAttribute('aria-pressed',HM.acik?'true':'false');
    b.innerHTML='<svg class="ic" aria-hidden="true"><use href="#'+(HM.acik?'i-ses-ac':'i-ses-kapali')+'"/></svg>Müzik';}
  new MutationObserver(function(){haritaMuzik();}).observe(document.body,{attributes:true,attributeFilter:['class']});
  document.addEventListener('visibilitychange',function(){if(!SES.ctx)return;if(document.hidden)SES.ctx.suspend();else if(SES.kaynak)SES.ctx.resume();});
  function durakSahne(i,zoom,sonra){
    var D=V.rota.duraklar,r=D[i],d=V.dur[r.id]||{},st=kamSt||durum(),ul=st.toplam>=r.adim;
    SES.sahne=true;if(SES.istenen==='seyyah'){SES.istenen=null;sesDur();} // durak sahnesi: harita müziği susar
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
      function kapat(){SES.istenen=null;sesDur();SES.sahne=false;setTimeout(haritaMuzik,320);sh.classList.remove('acik');kar.classList.remove('git');kar.classList.add('tam');
        setTimeout(function(){sh.remove();if(zoom&&$('iz-harita')){kamGit(geri,650,yumusak);}kar.classList.remove('tam');setTimeout(function(){kar.remove();},350);if(sonra)sonra();},300);}
      sh.querySelector('.iz-sh-kapat').onclick=kapat;
    }
    if(zoom&&$('iz-harita')){
      var b=kamSinir(),son=kamMerkez(r.x,r.y,Math.min(b.max,b.min*9));
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
      ['','','Yolculuğun ilk durakları geride kaldı.','Yelen belirmeye başladı; bilgin büyüyor.','Bağdat’ın kapısındasın. Emeğin ve serin seni aslana dönüştürdü.','Avrupa’nın akademileri seni bekliyor.','Efsane oldun. Son durak Ankara’da bir kara tahta seni bekliyor.'][yeni]+'</p></div>';
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
  (function onYukle(){var f=function(){temelVeri().then(function(){var x=sinif();mantikHavuz();if(x)return sorular(x);})['catch'](function(){});};
    if(window.requestIdleCallback)requestIdleCallback(f,{timeout:4000});else setTimeout(f,2500);})();
})();
