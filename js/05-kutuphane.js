
// ================= DERS DOSYALARI KÜTÜPHANESİ =================
(function(){
  var DB_AD='mf-kutuphane', MAX=100*1024*1024,BUYUK=50*1024*1024;
  var DERSLER=['Matematik','Geometri','Türkçe','Fizik','Kimya','Biyoloji','Edebiyat','Coğrafya','Tarih','İngilizce','Almanca','Fen Bilimleri','Sosyal Bilgiler','Felsefe','Din Kültürü','Diğer'];
  var AY=['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
  var $=function(i){return document.getElementById(i);};
  var kart=$('kt-kart');
  if(!kart)return;
  var durumEl=$('kt-durum'), listeEl=$('kt-liste'), icerik=$('kt-icerik');
  var dosyaBol=$('kt-dosya-bol'), soruBol=$('kt-soru-bol'), sekme='soru';
  var st={meta:[],filtre:'',ara:'',db:null,hata:false};
  var durumT=0;

  // ---------- yardımcılar ----------
  function bildir(m,kalici){
    durumEl.textContent=m||'';
    clearTimeout(durumT);
    if(m&&!kalici)durumT=setTimeout(function(){if(durumEl.textContent===m)durumEl.textContent='';},6000);
  }
  function tr(s){return String(s||'').toLocaleLowerCase('tr');}
  function boyutYaz(b){
    if(b<1024*1024)return Math.max(1,Math.round(b/1024))+' KB';
    return (b/1048576).toFixed(b<10485760?1:0).replace('.',',')+' MB';
  }
  function tarihYaz(ms){var d=new Date(ms);return d.getDate()+' '+AY[d.getMonth()]+' '+d.getFullYear();}
  function yeniId(){return 'k'+Date.now().toString(36)+Math.random().toString(36).slice(2,8);}
  function dersler(){return DERSLER.slice();}
  function dosyalar(){return st.meta.filter(function(m){return m.tip!=='soru';});}
  function sorular(){return st.meta.filter(function(m){return m.tip==='soru';});}
  function gunAy(ms){var d=new Date(ms);return d.getDate()+' '+AY[d.getMonth()];}
  function uzanti(m){
    if(m.tur==='pdf')return '.pdf';
    var t=(m.mime||'').toLowerCase();
    if(t.indexOf('png')>-1)return '.png';
    if(t.indexOf('webp')>-1)return '.webp';
    if(t.indexOf('gif')>-1)return '.gif';
    if(t.indexOf('heic')>-1)return '.heic';
    return '.jpg';
  }
  function guvenliAd(m){
    var a=String(m.ad||'dosya').replace(/[\\\/:*?"<>|\u0000-\u001f]+/g,'_').replace(/^\.+/,'').trim()||'dosya';
    return a.slice(0,120)+uzanti(m);
  }
  function uzantisiz(ad){return String(ad).replace(/\.(pdf|png|jpe?g|webp|gif|heic|heif|bmp|avif)$/i,'');}
  function yedekGerek(){
    if(!st.meta.length)return false;
    var n=parseInt(localStorage.getItem('mf-son-yedek'),10);
    return !n||(Date.now()-n)>30*86400000;
  }

  // ---------- IndexedDB ----------
  function idbAc(){
    if(st.db)return Promise.resolve(st.db);
    return new Promise(function(ok,hata){
      if(!window.indexedDB){hata(new Error('yok'));return;}
      var r;
      try{r=indexedDB.open(DB_AD,1);}catch(e){hata(e);return;}
      r.onupgradeneeded=function(){
        var d=r.result;
        if(!d.objectStoreNames.contains('meta'))d.createObjectStore('meta',{keyPath:'id'});
        if(!d.objectStoreNames.contains('veri'))d.createObjectStore('veri',{keyPath:'id'});
      };
      r.onsuccess=function(){
        st.db=r.result;
        st.db.onversionchange=function(){try{st.db.close();}catch(e){}st.db=null;};
        ok(st.db);
      };
      r.onerror=function(){hata(r.error||new Error('açılamadı'));};
      r.onblocked=function(){hata(new Error('engellendi'));};
    });
  }
  function islem(depolar,kip,fn){
    return idbAc().then(function(db){
      return new Promise(function(ok,hata){
        var t=db.transaction(depolar,kip), sonuc;
        t.oncomplete=function(){ok(sonuc);};
        t.onerror=function(){hata(t.error);};
        t.onabort=function(){hata(t.error||new Error('iptal'));};
        sonuc=fn(t);
      });
    });
  }
  function istek(r){return new Promise(function(ok,hata){r.onsuccess=function(){ok(r.result);};r.onerror=function(){hata(r.error);};});}
  function metaOku(){
    return idbAc().then(function(db){return istek(db.transaction('meta','readonly').objectStore('meta').getAll());});
  }
  function blobOku(id){
    return idbAc().then(function(db){return istek(db.transaction('veri','readonly').objectStore('veri').get(id));}).then(function(r){return r&&r.blob;});
  }
  function metaYaz(m){return islem('meta','readwrite',function(t){t.objectStore('meta').put(m);});}
  function hataMesaji(e){
    var ad=e&&e.name;
    if(ad==='QuotaExceededError')return 'Telefonda yeterli alan yok. Bazı dosyaları silip tekrar dene.';
    return 'İşlem yapılamadı. Tekrar dene.';
  }

  // ---------- liste ----------
  function yenile(){
    return metaOku().then(function(l){
      st.meta=l||[];st.hata=false;
    }).catch(function(){st.meta=[];st.hata=true;}).then(ciz);
  }
  function sayilar(){
    var s={};
    dosyalar().forEach(function(m){s[m.ders]=(s[m.ders]||0)+1;});
    return s;
  }
  function ciz(){ciDosya();ciSoru();}
  function ciDosya(){
    var arac=$('kt-arac'), ekle=$('kt-ekle'), serit=$('kt-serit');
    if(st.hata||!window.indexedDB){
      ekle.hidden=true;arac.hidden=true;serit.hidden=true;$('kt-depo').textContent='';
      listeEl.innerHTML='<div class="kt-bos"><div class="kt-bs"><svg class="ic" aria-hidden="true"><use href="#i-uyari"/></svg></div><p>Bu tarayıcı dosya saklamayı desteklemiyor.</p></div>';
      return;
    }
    ekle.hidden=false;
    serit.hidden=!yedekGerek();
    var sy=sayilar();
    if(st.filtre&&!sy[st.filtre])st.filtre='';
    if(!dosyalar().length){
      arac.hidden=true;
      listeEl.innerHTML='<div class="kt-bos"><div class="kt-bs"><svg class="ic" aria-hidden="true"><use href="#i-klasor"/></svg></div><p>Konu özetlerini, PDF\'lerini ve deneme cevap anahtarlarını buraya ekle. Hepsi yalnız bu telefonda saklanır.</p></div>';
      depoYaz();
      return;
    }
    arac.hidden=false;
    // çipler
    var sira=dersler(), cip='<button type="button" class="kt-cip'+(st.filtre?'':' on')+'" data-d="">Tümü<i>'+dosyalar().length+'</i></button>';
    var gorulen={};
    sira.forEach(function(d){gorulen[d]=1;});
    var sirali=sira.concat(Object.keys(sy).filter(function(d){return !gorulen[d];}));
    sirali.forEach(function(d){
      if(!sy[d])return;
      cip+='<button type="button" class="kt-cip'+(st.filtre===d?' on':'')+'" data-d="'+esc(d)+'">'+esc(d)+'<i>'+sy[d]+'</i></button>';
    });
    $('kt-cipler').innerHTML=cip;
    // gruplar
    var q=tr(st.ara).trim();
    var gr={};
    dosyalar().forEach(function(m){
      if(st.filtre&&m.ders!==st.filtre)return;
      if(q&&tr(m.ad).indexOf(q)<0)return;
      (gr[m.ders]=gr[m.ders]||[]).push(m);
    });
    var h='';
    sirali.forEach(function(d){
      var l=gr[d];if(!l)return;
      l.sort(function(a,b){return b.eklendi-a.eklendi;});
      h+='<div class="kt-grup">'+esc(d)+'</div>';
      l.forEach(function(m){
        h+='<div class="kt-satir"><button type="button" class="kt-ac" data-id="'+m.id+'"><span class="kt-sim">'+(m.tur==='pdf'?'<svg class="ic" aria-hidden="true"><use href="#i-belge"/></svg>':'<svg class="ic" aria-hidden="true"><use href="#i-resim"/></svg>')+'</span><span class="kt-metin"><span class="kt-ad">'+esc(m.ad)+'</span><span class="kt-alt">'+boyutYaz(m.boyut)+' · '+tarihYaz(m.eklendi)+'</span></span></button><button type="button" class="kt-dd" data-id="'+m.id+'" aria-label="Seçenekler">⋯</button></div>';
      });
    });
    listeEl.innerHTML=h||'<p class="pm-kucuk kt-yok">Eşleşen dosya yok.</p>';
    depoYaz();
  }
  function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function depoYaz(){
    var top=st.meta.reduce(function(a,m){return a+(m.boyut||0);},0);
    var el=$('kt-depo'), t='Kütüphane: '+boyutYaz(top);
    el.textContent=t;
    try{
      if(navigator.storage&&navigator.storage.estimate){
        navigator.storage.estimate().then(function(e){
          if(e&&e.quota!=null&&e.usage!=null){
            var bos=Math.max(0,e.quota-e.usage);
            el.textContent=t+' · Telefonda kullanılabilir alan: '+(bos>=1073741824?(bos/1073741824).toFixed(1).replace('.',',')+' GB':boyutYaz(bos));
          }
        }).catch(function(){});
      }
    }catch(e){}
  }

  // ---------- ekleme / düzenleme penceresi ----------
  var sh={kip:'',dosyalar:[],duz:null,ders:''};
  var shEl=$('kt-sheet');
  function dersSecenekleri(secili){
    var l=dersler();
    if(secili&&l.indexOf(secili)<0)l.splice(l.length-1,0,secili);
    $('kt-sh-ders').innerHTML=l.map(function(d){return '<option value="'+esc(d)+'"'+(d===secili?' selected':'')+'>'+esc(d)+'</option>';}).join('');
  }
  function shAc(){
    shEl.hidden=false;
    if(window.LEX_GERI)window.LEX_GERI.ekle('kt-sheet',function(){shEl.hidden=true;});
  }
  function shKapat(geriden){
    if(shEl.hidden)return;
    shEl.hidden=true;
    if(!geriden&&window.LEX_GERI)window.LEX_GERI.dus('kt-sheet');
  }
  function onerilenDers(){
    var l=dersler(), d='';
    try{d=JSON.parse(localStorage.getItem('pm-ayar')||'{}').ders||'';}catch(e){}
    if(l.indexOf(d)>-1)return d;
    d=localStorage.getItem('mf-kut-son-ders')||'';
    return l.indexOf(d)>-1?d:l[0];
  }
  function ekleSheet(dosyalar,reddedilen){
    sh.kip='ekle';sh.dosyalar=dosyalar;sh.duz=null;
    $('kt-sh-baslik').textContent=dosyalar.length>1?dosyalar.length+' dosya ekle':'Dosya ekle';
    var u=$('kt-sh-uyari');
    u.hidden=!reddedilen.length;u.textContent=reddedilen.join(' ');
    $('kt-sh-satirlar').innerHTML=dosyalar.map(function(f,i){
      return '<div class="kt-sh-satir"><span class="kt-sim">'+(f.tur==='pdf'?'<svg class="ic" aria-hidden="true"><use href="#i-belge"/></svg>':'<svg class="ic" aria-hidden="true"><use href="#i-resim"/></svg>')+'</span><input type="text" class="lex-in kt-ad-in" data-i="'+i+'" value="'+esc(f.ad)+'" maxlength="150" aria-label="Dosya adı"><span class="kt-boy">'+boyutYaz(f.file.size)+'</span></div>';
    }).join('');
    dersSecenekleri(onerilenDers());
    $('kt-sh-kaydet').textContent='Kaydet';
    shAc();
  }
  function duzenleSheet(m){
    sh.kip='duzenle';sh.duz=m;sh.dosyalar=[];
    $('kt-sh-baslik').textContent='Dersi değiştir';
    $('kt-sh-uyari').hidden=true;
    $('kt-sh-satirlar').innerHTML='<div class="kt-sh-satir"><span class="kt-sim">'+(m.tur==='pdf'?'<svg class="ic" aria-hidden="true"><use href="#i-belge"/></svg>':'<svg class="ic" aria-hidden="true"><use href="#i-resim"/></svg>')+'</span><input type="text" class="lex-in kt-ad-in" data-i="0" value="'+esc(m.ad)+'" maxlength="150" aria-label="Dosya adı"></div>';
    dersSecenekleri(m.ders);
    $('kt-sh-kaydet').textContent='Kaydet';
    shAc();
  }
  var kaydediyor=false;
  async function shKaydet(){
    if(kaydediyor)return;
    kaydediyor=true;$('kt-sh-kaydet').disabled=true;
    var ders=$('kt-sh-ders').value||'Diğer', girdiler=document.querySelectorAll('#kt-sh-satirlar .kt-ad-in');
    try{
      if(sh.kip==='duzenle'){
        var m=sh.duz, ad=(girdiler[0].value||'').trim();
        m.ad=uzantisiz(ad)||m.ad;m.ders=ders;
        await metaYaz(m);
        shKapat();bildir('Kaydedildi.');
      }else{
        var ilk=!st.meta.length, eklenen=0, hatali=0, son=null;
        for(var i=0;i<sh.dosyalar.length;i++){
          var f=sh.dosyalar[i], ad2=uzantisiz((girdiler[i].value||'').trim())||f.ad;
          var id=yeniId();
          var blob=f.file.slice(0,f.file.size,f.mime);
          var meta={id:id,ad:ad2,ders:ders,tur:f.tur,mime:f.mime,boyut:f.file.size,eklendi:Date.now(),sonSayfa:1};
          try{
            await islem(['meta','veri'],'readwrite',function(t){t.objectStore('veri').put({id:id,blob:blob});t.objectStore('meta').put(meta);});
            eklenen++;
          }catch(e){hatali++;son=e;}
        }
        if(eklenen){
          try{localStorage.setItem('mf-kut-son-ders',ders);}catch(e){}
          if(ilk&&navigator.storage&&navigator.storage.persist){try{navigator.storage.persist();}catch(e){}}
        }
        shKapat();
        if(hatali)bildir(eklenen?eklenen+' dosya eklendi, '+hatali+' dosya eklenemedi. '+hataMesaji(son):hataMesaji(son),true);
        else bildir(eklenen+' dosya eklendi.');
        // PDF görüntüleyiciyi internet varken önceden indir (sonra internetsiz açılsın)
        if(eklenen&&navigator.onLine!==false)['pdfjs.min.mjs','pdfjs.worker.min.mjs','jbig2.wasm','openjpeg.wasm'].forEach(function(u){try{fetch(u).catch(function(){});}catch(e){}});
      }
      await yenile();
    }catch(e){
      bildir(hataMesaji(e),true);
    }finally{kaydediyor=false;$('kt-sh-kaydet').disabled=false;}
  }
  shEl.addEventListener('click',function(e){
    if(e.target.getAttribute&&e.target.getAttribute('data-kapat'))shKapat();
  });
  $('kt-sh-iptal').addEventListener('click',function(){shKapat();});
  $('kt-sh-kaydet').addEventListener('click',shKaydet);

  // ---------- dosya seçimi ----------
  var inp=$('kt-dosya');
  $('kt-ekle').addEventListener('click',function(){inp.value='';inp.click();});
  inp.addEventListener('change',function(){
    var fl=Array.prototype.slice.call(inp.files||[]), gecerli=[], red=[];
    fl.forEach(function(f){
      var t=(f.type||'').toLowerCase(), pdf=t==='application/pdf'||(!t&&/\.pdf$/i.test(f.name));
      var res=t.indexOf('image/')===0;
      if(!pdf&&!res){red.push('"'+f.name+'" PDF ya da resim olmadığı için eklenmedi.');return;}
      if(f.size>MAX){red.push('"'+f.name+'" '+boyutYaz(f.size)+' olduğu için eklenmedi (en çok 100 MB).');return;}
      if(f.size>BUYUK)red.push('"'+f.name+'" '+boyutYaz(f.size)+': büyük dosya, eski telefonlarda yavaş açılabilir.');
      gecerli.push({file:f,tur:pdf?'pdf':'resim',mime:pdf?'application/pdf':t,ad:uzantisiz(f.name)||'Dosya'});
    });
    inp.value='';
    if(!gecerli.length){if(red.length)bildir(red.join(' '),true);return;}
    bildir('');
    ekleSheet(gecerli,red);
  });

  // ---------- liste olayları ----------
  var araT=0;
  $('kt-ara').addEventListener('input',function(e){
    clearTimeout(araT);var v=e.target.value;
    araT=setTimeout(function(){st.ara=v;ciz();},120);
  });
  $('kt-cipler').addEventListener('click',function(e){
    var b=e.target.closest('.kt-cip');if(!b)return;
    st.filtre=b.getAttribute('data-d')||'';ciz();
  });
  $('kt-serit').addEventListener('click',function(){
    var y=$('yd-kart');
    if(y&&y.scrollIntoView)y.scrollIntoView({behavior:'smooth',block:'start'});
  });
  listeEl.addEventListener('click',function(e){
    var d=e.target.closest('.kt-dd');
    if(d){menuAc(d.getAttribute('data-id'));return;}
    var a=e.target.closest('.kt-ac');
    if(a)gorAc(a.getAttribute('data-id'));
  });
  function bul(id){for(var i=0;i<st.meta.length;i++)if(st.meta[i].id===id)return st.meta[i];return null;}

  // ---------- satır menüsü ----------
  var mnEl=$('kt-menu'), mnId=null;
  function menuAc(id){
    var m=bul(id);if(!m)return;
    mnId=id;$('kt-mn-ad').textContent=m.ad;mnEl.hidden=false;
    if(window.LEX_GERI)window.LEX_GERI.ekle('kt-menu',function(){mnEl.hidden=true;});
  }
  function menuKapat(){
    if(mnEl.hidden)return;
    mnEl.hidden=true;
    if(window.LEX_GERI)window.LEX_GERI.dus('kt-menu');
  }
  mnEl.addEventListener('click',function(e){
    if(e.target.getAttribute&&e.target.getAttribute('data-kapat')){menuKapat();return;}
    var b=e.target.closest('.kt-mn-b');if(!b)return;
    var m=bul(mnId), i=b.getAttribute('data-i');
    menuKapat();
    if(!m)return;
    // geri tuşu kaydı kapanırken popstate asenkron; işlemi bir sonraki turda yap
    setTimeout(function(){
      if(i==='ad')adDegistir(m);
      else if(i==='ders')duzenleSheet(m);
      else if(i==='paylas')paylas(m);
      else if(i==='sil')sil(m);
    },window.LEX_GERI?60:0);
  });
  async function adDegistir(m){
    var y=prompt('Yeni ad',m.ad);
    if(y===null)return;
    y=uzantisiz(y.trim());
    if(!y)return;
    try{m.ad=y;await metaYaz(m);bildir('Yeniden adlandırıldı.');await yenile();}
    catch(e){bildir(hataMesaji(e),true);}
  }
  async function sil(m){
    if(!confirm('"'+m.ad+'" silinsin mi? Bu işlem geri alınamaz.'))return;
    try{
      await islem(['meta','veri'],'readwrite',function(t){t.objectStore('meta').delete(m.id);t.objectStore('veri').delete(m.id);});
      bildir('Silindi.');await yenile();
    }catch(e){bildir(hataMesaji(e),true);}
  }
  async function paylas(m,blobHazir){
    try{
      var b=blobHazir||await blobOku(m.id);
      if(!b){bildir('Dosya bulunamadı.',true);return;}
      var f=new File([b],guvenliAd(m),{type:m.mime||b.type});
      if(navigator.canShare&&navigator.share&&navigator.canShare({files:[f]})){
        try{await navigator.share({files:[f],title:m.ad});return;}
        catch(e){if(e&&e.name==='AbortError')return;}
      }
      var u=URL.createObjectURL(f), a=document.createElement('a');
      a.href=u;a.download=f.name;document.body.appendChild(a);a.click();a.remove();
      setTimeout(function(){URL.revokeObjectURL(u);},30000);
    }catch(e){bildir('Paylaşılamadı.',true);}
  }

  // ---------- görüntüleyici ----------
  var gor=$('kt-gor'), kaydir=$('kt-gor-kaydir'), ic=$('kt-gor-ic'), msg=$('kt-gor-msg'), sayfaEl=$('kt-gor-sayfa');
  var G=null; // açık görüntüleyici durumu
  var pdfjsP=null;
  function pdfjsYukle(){
    if(!pdfjsP){
      pdfjsP=import(new URL('pdfjs.min.mjs',document.baseURI).href).then(function(m){
        m.GlobalWorkerOptions.workerSrc='./pdfjs.worker.min.mjs';
        return m;
      }).catch(function(e){pdfjsP=null;throw e;});
    }
    return pdfjsP;
  }
  var kilitEski=null;
  function kilitle(k){
    var h=document.documentElement,b=document.body;
    if(k){kilitEski=[h.style.overflow,b.style.overflow];h.style.overflow='hidden';b.style.overflow='hidden';}
    else if(kilitEski){h.style.overflow=kilitEski[0];b.style.overflow=kilitEski[1];kilitEski=null;}
  }
  function mesaj(t,dugme){
    msg.hidden=false;msg.innerHTML='';
    var p=document.createElement('div');p.textContent=t;msg.appendChild(p);
    if(dugme){var b=document.createElement('button');b.type='button';b.textContent=dugme.ad;b.addEventListener('click',dugme.fn);msg.appendChild(b);}
  }
  async function gorAc(id){
    if(G)return;
    var m=bul(id);if(!m)return;
    G={m:m,id:id,zoom:1,sayfalar:[],obs:null,pdf:null,url:null,kapali:false,sayfa:1,kayitT:0,raf:0,blob:null,gorev:[]};
    var g=G;
    $('kt-gor-ad').textContent=m.ad;
    sayfaEl.textContent='';
    ic.innerHTML='';msg.hidden=true;
    $('kt-gor-eksi').disabled=$('kt-gor-arti').disabled=false;
    $('kt-ciz-ac').hidden=m.tur!=='pdf';
    krBasla(m);
    gor.hidden=false;kilitle(true);
    if(window.LEX_GERI)window.LEX_GERI.ekle('kt-gor',kapat);
    try{
      g.blob=await blobOku(id);
      if(g.kapali)return;
      if(!g.blob){mesaj('Dosya bulunamadı.');return;}
      if(m.tur==='pdf')await pdfAc(g);else resimAc(g);
    }catch(e){
      if(!g.kapali)mesaj('Dosya açılamadı.',{ad:'Telefonda aç',fn:function(){paylas(m,g.blob);}});
    }
  }
  function kapat(){
    var g=G;if(!g||g.kapali)return;
    cizKapat(false);
    g.kapali=true;G=null;
    kaydet(g,true);notYaz(g,true);setTimeout(krBitir,350);
    if(g.obs)try{g.obs.disconnect();}catch(e){}
    g.gorev.forEach(function(t){try{t.cancel();}catch(e){}});
    if(g.url)URL.revokeObjectURL(g.url);
    if(g.pdf)try{g.pdf.destroy();}catch(e){}
    if(g.gorevPdf)try{g.gorevPdf.destroy();}catch(e){}
    ic.innerHTML='';msg.hidden=true;msg.innerHTML='';
    gor.hidden=true;kilitle(false);
    ciz();
  }
  $('kt-gor-geri').addEventListener('click',function(){
    if(!G)return;
    kapat();
    if(window.LEX_GERI)window.LEX_GERI.dus('kt-gor');
  });
  function kaydet(g,hemen){
    if(g.m.tur!=='pdf'||!g.sayfalar.length)return;
    clearTimeout(g.kayitT);
    var yaz=function(){
      g.m.sonSayfa=g.sayfa;
      metaYaz(g.m).catch(function(){});
    };
    if(hemen)yaz();else g.kayitT=setTimeout(yaz,700);
  }
  function zoomDegis(d){
    var g=G;if(!g)return;
    var z=Math.round((g.zoom+d)*100)/100;
    z=Math.max(.5,Math.min(4,z));
    if(z===g.zoom)return;
    g.zoom=z;
    if(g.m.tur==='pdf')yerlestir(g,g.sayfa);else resimOlcek(g);
  }
  // iki parmakla yakınlaştır/uzaklaştır (tarayıcının sayfa zumu yerine belgeyi büyütür)
  var PN=null;
  function pnMesafe(t){var a=t[0],b=t[1];return Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY)||1;}
  function pnMerkez(t){var r=kaydir.getBoundingClientRect();return {x:(t[0].clientX+t[1].clientX)/2-r.left,y:(t[0].clientY+t[1].clientY)/2-r.top};}
  kaydir.addEventListener('touchstart',function(e){
    var g=G;if(!g||CZ.acik||e.touches.length!==2)return;
    var c=pnMerkez(e.touches);
    PN={d0:pnMesafe(e.touches),c0:c,c:c,f:1,z0:g.zoom,ox:kaydir.scrollLeft+c.x-ic.offsetLeft,oy:kaydir.scrollTop+c.y-ic.offsetTop};
    ic.style.transformOrigin=PN.ox+'px '+PN.oy+'px';ic.style.willChange='transform';
  },{passive:true});
  kaydir.addEventListener('touchmove',function(e){
    if(!PN)return;if(e.touches.length<2)return;
    if(e.cancelable)e.preventDefault();
    var z=Math.max(.5,Math.min(4,PN.z0*pnMesafe(e.touches)/PN.d0));
    PN.f=z/PN.z0;PN.c=pnMerkez(e.touches);
    ic.style.transform='translate('+(PN.c.x-PN.c0.x)+'px,'+(PN.c.y-PN.c0.y)+'px) scale('+PN.f+')';
    sayfaEl.textContent=Math.round(z*100)+'%';
  },{passive:false});
  function pnBitir(){
    var p=PN,g=G;if(!p)return;PN=null;
    ic.style.transform='';ic.style.transformOrigin='';ic.style.willChange='';
    if(!g)return;
    var z=Math.round(p.z0*p.f*100)/100;z=Math.max(.5,Math.min(4,z));
    if(Math.abs(z-g.zoom)<.02){sayfaEl.textContent=g.m.tur==='pdf'?'':Math.round(g.zoom*100)+'%';if(g.m.tur==='pdf')sayfaGoster(g);return;}
    var oran=z/g.zoom;g.zoom=z;
    if(g.m.tur==='pdf')yenidenOlcek(g);else resimOlcek(g);
    kaydir.scrollLeft=Math.max(0,p.ox*oran+ic.offsetLeft-p.c.x);
    kaydir.scrollTop=Math.max(0,p.oy*oran+ic.offsetTop-p.c.y);
    if(g.m.tur==='pdf'){sayfaGoster(g);cizGorunur(g);}
  }
  kaydir.addEventListener('touchend',function(e){if(PN&&e.touches.length<2)pnBitir();},{passive:true});
  kaydir.addEventListener('touchcancel',function(){if(PN)pnBitir();},{passive:true});
  $('kt-gor-eksi').addEventListener('click',function(){zoomDegis(-.25);});
  $('kt-gor-arti').addEventListener('click',function(){zoomDegis(.25);});

  // resim
  function resimAc(g){
    g.url=URL.createObjectURL(g.blob);
    var im=new Image();
    im.alt=g.m.ad;
    im.onload=function(){g.nw=im.naturalWidth;g.nh=im.naturalHeight;resimOlcek(g);};
    im.onerror=function(){mesaj('Resim açılamadı.',{ad:'Telefonda aç',fn:function(){paylas(g.m,g.blob);}});};
    ic.innerHTML='';ic.appendChild(im);im.src=g.url;g.img=im;
  }
  function resimOlcek(g){
    if(!g.img||!g.nw)return;
    var w=Math.max(120,kaydir.clientWidth-16);
    g.img.style.width=Math.round(w*g.zoom)+'px';
    g.img.style.height='auto';
    sayfaEl.textContent=Math.round(g.zoom*100)+'%';
  }

  // PDF
  async function pdfAc(g){
    mesaj('PDF hazırlanıyor…');
    var lib;
    try{lib=await pdfjsYukle();}
    catch(e){
      if(g.kapali)return;
      mesaj('PDF görüntüleyici ilk kullanımda internetten bir kez yüklenir. İnternete bağlanıp tekrar dene.',{ad:'Telefonda aç',fn:function(){paylas(g.m,g.blob);}});
      return;
    }
    if(g.kapali)return;
    var data=new Uint8Array(await g.blob.arrayBuffer());
    if(g.kapali)return;
    var gorev=lib.getDocument({data:data,wasmUrl:'./',isEvalSupported:false,enableScripting:false});
    g.gorevPdf=gorev;
    gorev.onPassword=function(cb,neden){
      var p=prompt(neden===2?'Parola yanlış. Tekrar dene:':'Bu PDF şifreli. Parolayı gir:');
      if(p===null){try{gorev.destroy();}catch(e){}return;}
      cb(p);
    };
    var pdf;
    try{pdf=await gorev.promise;}
    catch(e){
      if(g.kapali)return;
      var pw=e&&e.name==='PasswordException';
      mesaj(pw?'Şifreli PDF açılmadı.':'PDF açılamadı. Dosya bozuk olabilir.',{ad:'Telefonda aç',fn:function(){paylas(g.m,g.blob);}});
      return;
    }
    if(g.kapali){try{pdf.destroy();}catch(e){}return;}
    g.pdf=pdf;
    // tüm sayfaların boyutu
    var n=pdf.numPages, i;
    for(i=1;i<=n;i++){
      var pg=await pdf.getPage(i);
      if(g.kapali)return;
      var vp=pg.getViewport({scale:1});
      g.sayfalar.push({n:i,w:vp.width,h:vp.height,page:null,el:null,canvas:null,gorev:null,is:0});
      pg.cleanup();
      if(i===1)mesaj('PDF hazırlanıyor… (1 / '+n+')');
    }
    msg.hidden=true;
    var ilk=Math.max(1,Math.min(n,parseInt(g.m.sonSayfa,10)||1));
    g.sayfa=ilk;
    kaydir.addEventListener('scroll',kaydirma,{passive:true});
    g.obs=new IntersectionObserver(function(es){
      es.forEach(function(e){
        var s=g.sayfalar[parseInt(e.target.getAttribute('data-n'),10)-1];
        if(e.isIntersecting)ciziliyor(g,s);else bosalt(s);
      });
    },{root:kaydir,rootMargin:'100% 0px 100% 0px',threshold:0});
    yerlestir(g,ilk);
  }
  function yerlestir(g,git){
    // tüm yer tutucuları (yeniden) kur
    if(g.obs)g.obs.disconnect();
    g.sayfalar.forEach(function(s){bosalt(s);});
    ic.innerHTML='';
    var gen=Math.max(120,kaydir.clientWidth-16)*g.zoom;
    g.sayfalar.forEach(function(s){
      var el=document.createElement('div');
      el.className='kt-sf';el.setAttribute('data-n',s.n);
      var oran=gen/s.w;
      s.cw=Math.round(gen);s.ch=Math.round(s.h*oran);s.oran=oran;
      el.style.width=s.cw+'px';el.style.height=s.ch+'px';
      s.el=el;ic.appendChild(el);
    });
    kaydir.scrollTop=0;
    var hedef=g.sayfalar[git-1];
    if(hedef)kaydir.scrollTop=Math.max(0,hedef.el.offsetTop-8);
    g.sayfalar.forEach(function(s){g.obs.observe(s.el);});
    sayfaGoster(g);
  }
  function yenidenOlcek(g){
    var gen=Math.max(120,kaydir.clientWidth-16)*g.zoom;
    g.sayfalar.forEach(function(s){
      if(s.gorev){try{s.gorev.cancel();}catch(e){}s.gorev=null;}
      s.is=0;
      var oran=gen/s.w;s.cw=Math.round(gen);s.ch=Math.round(s.h*oran);s.oran=oran;
      if(s.el){s.el.style.width=s.cw+'px';s.el.style.height=s.ch+'px';}
      if(s.canvas){if(s.eskiC){s.eskiC.width=0;s.eskiC.height=0;if(s.eskiC.parentNode)s.eskiC.parentNode.removeChild(s.eskiC);}s.eskiC=s.canvas;s.canvas=null;}
    });
  }
  function cizGorunur(g){g.sayfalar.forEach(function(s){if(s.el&&isGorunur(g,s))ciziliyor(g,s);else if(s.eskiC)bosalt(s);});}
  function sayfaGoster(g){
    sayfaEl.textContent=g.sayfa+' / '+g.sayfalar.length;
  }
  function kaydirma(){
    var g=G;if(!g||g.raf||!g.sayfalar.length)return;
    g.raf=requestAnimationFrame(function(){
      g.raf=0;
      if(G!==g)return;
      var y=kaydir.scrollTop+kaydir.clientHeight*0.35, bulunan=1, l=g.sayfalar, a=0, b=l.length-1;
      while(a<=b){
        var o=(a+b)>>1;
        if(l[o].el.offsetTop<=y){bulunan=l[o].n;a=o+1;}else b=o-1;
      }
      if(kaydir.scrollTop>0&&kaydir.scrollTop+kaydir.clientHeight>=kaydir.scrollHeight-2)bulunan=l[l.length-1].n;
      if(bulunan!==g.sayfa){g.sayfa=bulunan;sayfaGoster(g);kaydet(g,false);}
    });
  }
  var JET=0;
  async function ciziliyor(g,s){
    if(g.kapali||s.canvas||s.is)return;
    var j=s.is=++JET;
    try{
      var page=await g.pdf.getPage(s.n);
      if(g.kapali||s.is!==j||!s.el||!s.el.isConnected||!isGorunur(g,s)){if(s.is===j)s.is=0;try{page.cleanup();}catch(e){}return;}
      var dpr=Math.min(window.devicePixelRatio||1,2);
      var olcek=s.oran*dpr;
      var px=s.w*olcek*s.h*olcek;
      if(px>16e6)olcek*=Math.sqrt(16e6/px);
      var vp=page.getViewport({scale:olcek});
      var c=document.createElement('canvas');
      c.width=Math.max(1,Math.floor(vp.width));c.height=Math.max(1,Math.floor(vp.height));
      var gorev=page.render({canvasContext:c.getContext('2d'),viewport:vp});
      s.gorev=gorev;g.gorev.push(gorev);
      try{await gorev.promise;}finally{g.gorev=g.gorev.filter(function(t){return t!==gorev;});}
      if(g.kapali||s.is!==j){return;}
      s.gorev=null;s.canvas=c;s.el.insertBefore(c,s.el.firstChild);if(s.eskiC){s.eskiC.width=0;s.eskiC.height=0;if(s.eskiC.parentNode)s.eskiC.parentNode.removeChild(s.eskiC);s.eskiC=null;}s.is=0;notKatman(g,s);
      try{page.cleanup();}catch(e){}
    }catch(e){
      if(s.is===j){s.is=0;s.gorev=null;}
    }
  }
  function isGorunur(g,s){
    var r=s.el.getBoundingClientRect(), k=kaydir.getBoundingClientRect(), h=k.height;
    return r.bottom>k.top-h&&r.top<k.bottom+h;
  }
  function bosalt(s){
    if(!s)return;
    s.is=0;
    if(s.gorev){try{s.gorev.cancel();}catch(e){}s.gorev=null;}
    if(s.canvas){s.canvas.width=0;s.canvas.height=0;if(s.canvas.parentNode)s.canvas.parentNode.removeChild(s.canvas);s.canvas=null;}
    if(s.eskiC){s.eskiC.width=0;s.eskiC.height=0;if(s.eskiC.parentNode)s.eskiC.parentNode.removeChild(s.eskiC);s.eskiC=null;}
    if(s.not){s.not.width=0;s.not.height=0;if(s.not.parentNode)s.not.parentNode.removeChild(s.not);s.not=null;}
  }

  // ---------- bölüm seçimi ----------
  var SEK_AD='mf-kut-sek';
  function sekmeOku(){var s='';try{s=localStorage.getItem(SEK_AD)||'';}catch(e){}return s==='dosya'?'dosya':'soru';}
  function bolUygula(){
    var kb=document.querySelectorAll('#kt-bolumler .kt-bol');
    for(var i=0;i<kb.length;i++){
      var on=kb[i].getAttribute('data-bol')===sekme;
      kb[i].classList.toggle('on',on);
      kb[i].setAttribute('aria-pressed',on?'true':'false');
    }
    dosyaBol.hidden=sekme!=='dosya';
    soruBol.hidden=sekme!=='soru';
  }
  function bolSec(b){
    if(b===sekme||(b!=='soru'&&b!=='dosya'))return;
    sekme=b;
    try{localStorage.setItem(SEK_AD,b);}catch(e){}
    bolUygula();
    bildir('');
    ciz();
  }
  $('kt-bolumler').addEventListener('click',function(e){
    var b=e.target.closest('.kt-bol');if(b)bolSec(b.getAttribute('data-bol'));
  });

  // ---------- soru defteri: liste ----------
  var SQ={durum:'tekrar',ders:'',ara:''};
  var sqUrls=[], sqGen=0;
  function sqUrlTemizle(){sqUrls.forEach(function(u){URL.revokeObjectURL(u);});sqUrls=[];}
  function soruBul(id){for(var i=0;i<st.meta.length;i++)if(st.meta[i].id===id&&st.meta[i].tip==='soru')return st.meta[i];return null;}
  function durumu(m){return m.durum==='ogrendim'?'ogrendim':'tekrar';}
  function sorularFiltre(){
    var q=tr(SQ.ara).trim();
    return sorular().filter(function(m){
      if(SQ.ders&&m.ders!==SQ.ders)return false;
      if(q&&tr(m.konu).indexOf(q)<0&&tr(m.not).indexOf(q)<0&&tr(m.kaynak).indexOf(q)<0)return false;
      return true;
    });
  }
  function ciSoru(){
    var hata=st.hata||!window.indexedDB;
    var tumu=hata?[]:sorular();
    var ust=$('sq-ust'), oz=$('sq-ozet-satir'), arac=$('sq-arac'), izg=$('sq-izgara'), bos=$('sq-bos');
    sqUrlTemizle();
    var gen=++sqGen;
    if(hata){
      ust.hidden=oz.hidden=arac.hidden=true;izg.innerHTML='';
      bos.hidden=false;bos.innerHTML='<div class="kt-bs"><svg class="ic" aria-hidden="true"><use href="#i-uyari"/></svg></div><p>Bu tarayıcı soru saklamayı desteklemiyor.</p>';
      return;
    }
    if(!tumu.length){
      ust.hidden=oz.hidden=arac.hidden=true;izg.innerHTML='';
      bos.hidden=false;
      bos.innerHTML='<div class="kt-bs"><svg class="ic" aria-hidden="true"><use href="#i-kamera"/></svg></div><p>Çözemediğin ya da yanlış yaptığın soruların fotoğrafını çek, konusunu yaz. Sonra burada tekrar et, öğrendiklerini işaretle. Hepsi yalnız bu telefonda saklanır.</p><div class="sq-bos-dugme"><button type="button" class="mt-btn sq-ekle" data-ac="cek"><svg class="ic" aria-hidden="true"><use href="#i-kamera"/></svg>Fotoğraf çek</button><button type="button" class="mt-btn2 sq-ekle" data-ac="galeri"><svg class="ic" aria-hidden="true"><use href="#i-resim"/></svg>Galeriden</button></div>';
      return;
    }
    bos.hidden=true;bos.innerHTML='';
    ust.hidden=oz.hidden=arac.hidden=false;
    var ogr=tumu.filter(function(m){return durumu(m)==='ogrendim';}).length;
    oz.innerHTML='Tekrar edilecek: <b>'+(tumu.length-ogr)+'</b> · Öğrendim: <b>'+ogr+'</b>';
    var sy={};
    tumu.forEach(function(m){sy[m.ders]=(sy[m.ders]||0)+1;});
    if(SQ.ders&&!sy[SQ.ders])SQ.ders='';
    var dc='<button type="button" class="sq-cip'+(SQ.ders?'':' on')+'" data-ders="">Tümü<i>'+tumu.length+'</i></button>';
    dersler().concat(Object.keys(sy).filter(function(d){return DERSLER.indexOf(d)<0;})).forEach(function(d){
      if(!sy[d])return;
      dc+='<button type="button" class="sq-cip'+(SQ.ders===d?' on':'')+'" data-ders="'+esc(d)+'">'+esc(d)+'<i>'+sy[d]+'</i></button>';
    });
    $('sq-ders-cip').innerHTML=dc;
    var DUR=[['tekrar','Tekrar edilecek'],['ogrendim','Öğrendim'],['hepsi','Tümü']];
    $('sq-durum-cip').innerHTML=DUR.map(function(d){return '<button type="button" class="sq-cip'+(SQ.durum===d[0]?' on':'')+'" data-dur="'+d[0]+'">'+d[1]+'</button>';}).join('');
    var filtreli=sorularFiltre();
    var tekrarSayi=filtreli.filter(function(m){return durumu(m)==='tekrar';}).length;
    var tb=$('sq-tekrar-et');
    tb.hidden=!tekrarSayi;tb.textContent='▶ Tekrar et ('+tekrarSayi+')';
    var liste=filtreli.filter(function(m){return SQ.durum==='hepsi'||durumu(m)===SQ.durum;});
    liste.sort(function(a,b){return b.eklendi-a.eklendi;});
    if(!liste.length){izg.innerHTML='<p class="pm-kucuk kt-yok">Eşleşen soru yok.</p>';return;}
    izg.innerHTML=liste.map(function(m){
      var ogr=durumu(m)==='ogrendim';
      return '<button type="button" class="sq-kart" data-id="'+esc(m.id)+'">'+
        '<span class="sq-resim"><img alt="" data-kucuk="'+esc(m.id)+'">'+(ogr?'<span class="sq-tik" aria-label="Öğrendim">✓</span>':'')+'</span>'+
        '<span class="sq-kb"><span class="sq-rozet">'+esc(m.ders)+'</span><span class="sq-konu">'+esc(m.konu||'Konu yok')+'</span>'+
        '<span class="sq-altk">'+(m.tekrar?m.tekrar+' kez tekrar':'Henüz tekrar yok')+' · '+gunAy(m.eklendi)+'</span></span></button>';
    }).join('');
    izg.querySelectorAll('img[data-kucuk]').forEach(function(im){
      var m=soruBul(im.getAttribute('data-kucuk'));
      if(!m)return;
      blobOku(m.kucuk||m.foto).then(function(b){
        if(!b)return;
        var u=URL.createObjectURL(b);
        if(gen!==sqGen){URL.revokeObjectURL(u);return;}
        sqUrls.push(u);im.src=u;
      }).catch(function(){});
    });
  }
  soruBol.addEventListener('click',function(e){
    var t=e.target;
    var ac=t.closest('[data-ac]');
    if(ac){
      var inp=$(ac.getAttribute('data-ac')==='cek'?'sq-kamera':'sq-galeri');
      inp.value='';inp.click();return;
    }
    var cip=t.closest('.sq-cip');
    if(cip){
      if(cip.hasAttribute('data-dur'))SQ.durum=cip.getAttribute('data-dur');
      else SQ.ders=cip.getAttribute('data-ders')||'';
      ciSoru();return;
    }
    if(t.closest('#sq-tekrar-et')){sqTekrarBaslat();return;}
    var sk=t.closest('.sq-kart');
    if(sk)sqGorAc(sk.getAttribute('data-id'));
  });
  var sqAraT=0;
  $('sq-ara').addEventListener('input',function(e){
    clearTimeout(sqAraT);var v=e.target.value;
    sqAraT=setTimeout(function(){SQ.ara=v;ciSoru();},120);
  });

  // ---------- soru defteri: fotoğraf küçültme ve ekleme ----------
  async function kucult(file, max, kalite){
    let img;
    try{ img = await createImageBitmap(file, {imageOrientation:'from-image'}); }
    catch(e){ img = await new Promise((ok,no)=>{const u=URL.createObjectURL(file);const i=new Image();i.onload=()=>{URL.revokeObjectURL(u);ok(i);};i.onerror=no;i.src=u;}); }
    const w=img.width,h=img.height,o=Math.min(1,max/Math.max(w,h));
    const c=document.createElement('canvas');c.width=Math.round(w*o);c.height=Math.round(h*o);
    c.getContext('2d').drawImage(img,0,0,c.width,c.height);
    return await new Promise(ok=>c.toBlob(ok,'image/jpeg',kalite));
  }
  async function kucultGuvenli(file,max,kalite){var b=await kucult(file,max,kalite);if(!b)throw new Error('kucult');return b;}
  var sqHazir=false;
  async function yeniFoto(f){
    if(sqHazir)return;
    sqHazir=true;
    bildir('Fotoğraf hazırlanıyor…',true);
    try{
      var foto=await kucultGuvenli(f,1600,0.82), kucuk=await kucultGuvenli(f,360,0.7);
      bildir('');
      sqShAc({kip:'ekle',m:null,foto:foto,kucuk:kucuk,cozum:null});
    }catch(e){bildir('Fotoğraf okunamadı. Başka bir fotoğraf dene.',true);}
    finally{sqHazir=false;}
  }
  ['sq-kamera','sq-galeri'].forEach(function(id){
    $(id).addEventListener('change',function(){
      var f=this.files&&this.files[0];this.value='';
      if(f)yeniFoto(f);
    });
  });

  // ---------- soru defteri: ekleme / düzenleme penceresi ----------
  var SS=null, ssEl=$('kt-soru-sheet'), ssUrl=null, sqKaydediyor=false;
  function sqDersDoldur(secili){
    var l=dersler();
    if(secili&&l.indexOf(secili)<0)l.splice(l.length-1,0,secili);
    $('sq-sh-ders').innerHTML=l.map(function(d){return '<option value="'+esc(d)+'">'+esc(d)+'</option>';}).join('');
    $('sq-sh-ders').value=secili||l[0];
  }
  function konuListesi(){
    var d=$('sq-sh-ders').value, gorulen={}, h='';
    sorular().forEach(function(m){
      if(m.ders!==d||!m.konu||m.konu==='Konu yok'||gorulen[m.konu])return;
      gorulen[m.konu]=1;h+='<option value="'+esc(m.konu)+'"></option>';
    });
    $('sq-konu-liste').innerHTML=h;
  }
  function cozumEtiket(){
    var b=$('sq-sh-cozum');
    if(SS&&SS.cozum)b.textContent='✓ Çözüm eklendi (değiştirmek için dokun)';
    else if(SS&&SS.m&&SS.m.cozum)b.textContent='✓ Çözüm var (değiştirmek için dokun)';
    else b.textContent='＋ Çözüm fotoğrafı ekle (isteğe bağlı)';
  }
  function onizleYaz(o){
    if(ssUrl){URL.revokeObjectURL(ssUrl);ssUrl=null;}
    var im=$('sq-onizle-img');im.removeAttribute('src');
    var kaynak=o.kucuk?Promise.resolve(o.kucuk):blobOku(o.m.kucuk||o.m.foto);
    kaynak.then(function(b){
      if(!b||SS!==o)return;
      ssUrl=URL.createObjectURL(b);im.src=ssUrl;
    }).catch(function(){});
  }
  function sqShAc(o){
    SS=o;
    $('sq-sh-baslik').textContent=o.kip==='duzenle'?'Soruyu düzenle':'Soru ekle';
    var u=$('sq-sh-uyari');u.hidden=true;u.textContent='';
    var m=o.m;
    $('sq-sh-konu').value=m&&m.konu&&m.konu!=='Konu yok'?m.konu:'';
    $('sq-sh-not').value=m?(m.not||''):'';
    $('sq-sh-kaynak').value=m?(m.kaynak||''):'';
    sqDersDoldur(m?m.ders:onerilenDers());
    konuListesi();
    cozumEtiket();
    onizleYaz(o);
    ssEl.hidden=false;
    if(window.LEX_GERI)window.LEX_GERI.ekle('kt-soru-sheet',function(){sqShKapat(true);});
  }
  function sqShKapat(geriden){
    if(ssEl.hidden)return;
    ssEl.hidden=true;SS=null;
    if(ssUrl){URL.revokeObjectURL(ssUrl);ssUrl=null;}
    $('sq-onizle-img').removeAttribute('src');
    if(!geriden&&window.LEX_GERI)window.LEX_GERI.dus('kt-soru-sheet');
  }
  async function sqShKaydet(){
    var o=SS;
    if(sqKaydediyor||!o)return;
    sqKaydediyor=true;$('sq-sh-kaydet').disabled=true;
    var ders=$('sq-sh-ders').value||'Diğer';
    var konu=($('sq-sh-konu').value||'').trim().slice(0,60)||'Konu yok';
    var not=($('sq-sh-not').value||'').trim().slice(0,200);
    var kaynak=($('sq-sh-kaynak').value||'').trim().slice(0,80);
    try{
      var ilk=!st.meta.length;
      if(o.kip==='duzenle'){
        var m=o.m, veriler=[], eskiC=m.cozum?await blobOku(m.cozum):null;
        m.ders=ders;m.konu=konu;m.not=not;m.kaynak=kaynak;
        if(o.cozum){
          if(!m.cozum)m.cozum='c'+yeniId();
          veriler.push({id:m.cozum,blob:o.cozum});
          m.boyut=(m.boyut||0)-(eskiC?eskiC.size:0)+o.cozum.size;
        }
        await islem(['meta','veri'],'readwrite',function(t){
          veriler.forEach(function(v){t.objectStore('veri').put(v);});
          t.objectStore('meta').put(m);
        });
        sqShKapat(false);
        bildir('Kaydedildi.');
        await yenile();
        if(SG&&SG.id===m.id){var g=soruBul(m.id);if(g)sqGoster(g);}
      }else{
        var fid='f'+yeniId(), kid='u'+yeniId(), cid=o.cozum?'c'+yeniId():null;
        var yeni={id:yeniId(),tip:'soru',ders:ders,konu:konu,not:not,kaynak:kaynak,durum:'tekrar',eklendi:Date.now(),tekrar:0,sonTekrar:null,foto:fid,kucuk:kid,cozum:cid,boyut:o.foto.size+o.kucuk.size+(o.cozum?o.cozum.size:0)};
        await islem(['meta','veri'],'readwrite',function(t){
          t.objectStore('veri').put({id:fid,blob:o.foto});
          t.objectStore('veri').put({id:kid,blob:o.kucuk});
          if(cid)t.objectStore('veri').put({id:cid,blob:o.cozum});
          t.objectStore('meta').put(yeni);
        });
        try{localStorage.setItem('mf-kut-son-ders',ders);}catch(e){}
        if(ilk&&navigator.storage&&navigator.storage.persist){try{navigator.storage.persist();}catch(e){}}
        sqShKapat(false);
        bildir('Soru kaydedildi.');
        await yenile();
      }
    }catch(e){bildir(hataMesaji(e),true);}
    finally{sqKaydediyor=false;$('sq-sh-kaydet').disabled=false;}
  }
  ssEl.addEventListener('click',function(e){
    if(e.target.getAttribute&&e.target.getAttribute('data-kapat'))sqShKapat(false);
  });
  $('sq-sh-iptal').addEventListener('click',function(){sqShKapat(false);});
  $('sq-sh-kaydet').addEventListener('click',sqShKaydet);
  $('sq-sh-ders').addEventListener('change',konuListesi);
  $('sq-sh-cozum').addEventListener('click',function(){var i=$('sq-cozum-in');i.value='';i.click();});
  $('sq-cozum-in').addEventListener('change',async function(){
    var f=this.files&&this.files[0];this.value='';
    if(!f||!SS)return;
    var o=SS;
    try{
      var b=await kucultGuvenli(f,1600,0.82);
      if(SS!==o)return;
      o.cozum=b;cozumEtiket();
    }catch(e){
      var u=$('sq-sh-uyari');u.textContent='Çözüm fotoğrafı okunamadı. Başka bir fotoğraf dene.';u.hidden=false;
    }
  });

  // ---------- soru defteri: tam ekran görünüm ve tekrar modu ----------
  var sqGor=$('kt-soru-gor'), sqGovde=$('sq-govde'), sqAlt=$('sq-alt'), sqOzet=$('sq-ozet'),
      sqFotoKap=$('sq-foto-kap'), sqFoto=$('sq-foto'), sqBilgi=$('sq-bilgi'), sqCozumBtn=$('sq-cozum-goster'),
      sqCozumKap=$('sq-cozum-kap'), sqCozumImg=$('sq-cozum-img'), sqIslemBtn=$('sq-islem'), sqTekrarSor=$('sq-tekrar-sor');
  var SG=null;
  function sqGorAcilis(){
    sqGor.hidden=false;
    document.body.style.overflow='hidden';
    if(window.LEX_GERI)window.LEX_GERI.ekle('kt-soru-gor',function(){sqGorKapat(true);});
  }
  function sqGorKapat(geriden){
    var s=SG;if(!s)return;
    SG=null;
    if(s.fotoUrl)URL.revokeObjectURL(s.fotoUrl);
    if(s.cozumUrl)URL.revokeObjectURL(s.cozumUrl);
    sqFoto.removeAttribute('src');sqCozumImg.removeAttribute('src');
    sqGor.hidden=true;
    document.body.style.overflow=s.ovf;
    sqGovde.hidden=false;sqAlt.hidden=false;sqOzet.hidden=true;
    if(!geriden&&window.LEX_GERI)window.LEX_GERI.dus('kt-soru-gor');
    ciz();
  }
  function zoomUygula(){
    var s=SG;if(!s)return;
    var w=Math.max(120,sqFotoKap.clientWidth||0);
    sqFoto.style.width=s.zoom<=1?'100%':Math.round(w*s.zoom)+'px';
    $('sq-yuzde').textContent=Math.round(s.zoom*100)+'%';
    $('sq-eksi').disabled=s.zoom<=1;$('sq-arti').disabled=s.zoom>=3;
  }
  function altGuncelle(m){
    var ogr=durumu(m)==='ogrendim';
    sqIslemBtn.innerHTML=ogr?'<svg class="ic" aria-hidden="true"><use href="#i-tekrar"/></svg>Tekrar listesine al':'<svg class="ic" aria-hidden="true"><use href="#i-tamam"/></svg>Öğrendim';
    sqIslemBtn.setAttribute('data-islem',ogr?'geri':'ogren');
    sqIslemBtn.className='sq-alt-b'+(ogr?'':' sq-yesil');
  }
  function sqGoster(m){
    var s=SG;if(!s)return;
    var g=++s.gen;
    s.zoom=1;s.cozumAcik=false;
    if(s.fotoUrl){URL.revokeObjectURL(s.fotoUrl);s.fotoUrl=null;}
    if(s.cozumUrl){URL.revokeObjectURL(s.cozumUrl);s.cozumUrl=null;}
    sqFoto.removeAttribute('src');sqCozumImg.removeAttribute('src');
    sqCozumKap.hidden=true;
    sqGovde.hidden=false;sqAlt.hidden=false;sqOzet.hidden=true;
    $('sq-gor-ad').textContent=m.ders+' · '+(m.konu||'Konu yok');
    $('sq-gor-sayac').textContent=s.tekrar?(s.sira+1)+' / '+s.kuyruk.length:'';
    var h='';
    if(m.not)h+='<p>'+esc(m.not)+'</p>';
    if(m.kaynak)h+='<p class="sq-kaynak"><svg class="ic" aria-hidden="true"><use href="#i-kitap"/></svg>'+esc(m.kaynak)+'</p>';
    sqBilgi.innerHTML=h;sqBilgi.hidden=!h;
    sqCozumBtn.hidden=!m.cozum;sqCozumBtn.innerHTML='<svg class="ic" aria-hidden="true"><use href="#i-ampul"/></svg>Çözümü göster';
    altGuncelle(m);
    zoomUygula();
    sqFotoKap.scrollLeft=0;sqFotoKap.scrollTop=0;
    blobOku(m.foto).then(function(b){
      if(!b||SG!==s||s.gen!==g)return;
      s.fotoUrl=URL.createObjectURL(b);sqFoto.src=s.fotoUrl;
    }).catch(function(){});
  }
  function sqGorAc(id){
    if(SG)return;
    var m=soruBul(id);if(!m)return;
    SG={id:id,tekrar:false,kuyruk:[id],sira:0,islenen:0,ogrenilen:0,gen:0,zoom:1,cozumAcik:false,fotoUrl:null,cozumUrl:null,isleniyor:false,ovf:document.body.style.overflow};
    sqGorAcilis();
    sqGoster(m);
  }
  function sqTekrarBaslat(){
    if(SG)return;
    var kuy=sorularFiltre().filter(function(m){return durumu(m)==='tekrar';});
    if(!kuy.length)return;
    kuy.sort(function(a,b){
      var x=a.sonTekrar,y=b.sonTekrar;
      if(x==null&&y==null)return 0;
      if(x==null)return -1;
      if(y==null)return 1;
      return x-y;
    });
    SG={id:kuy[0].id,tekrar:true,kuyruk:kuy.map(function(m){return m.id;}),sira:0,islenen:0,ogrenilen:0,gen:0,zoom:1,cozumAcik:false,fotoUrl:null,cozumUrl:null,isleniyor:false,ovf:document.body.style.overflow};
    sqGorAcilis();
    sqGoster(kuy[0]);
  }
  function sqOzetGoster(){
    var s=SG;if(!s)return;
    sqGovde.hidden=true;sqAlt.hidden=true;sqOzet.hidden=false;
    $('sq-gor-sayac').textContent='';
    $('sq-ozet-metin').textContent=s.islenen+' soru tekrar ettin, '+s.ogrenilen+"'ünü öğrendin!";
  }
  function sqSonraki(){
    var s=SG;if(!s)return;
    s.sira++;
    while(s.sira<s.kuyruk.length){
      var m=soruBul(s.kuyruk[s.sira]);
      if(m){sqGoster(m);return;}
      s.sira++;
    }
    sqOzetGoster();
  }
  async function sqIsle(t){
    var s=SG;if(!s||s.isleniyor)return;
    var m=soruBul(s.id);
    if(!m){sqGorKapat(false);return;}
    s.isleniyor=true;
    try{
      if(t==='sor'||t==='ogren'){m.tekrar=(m.tekrar||0)+1;m.sonTekrar=Date.now();}
      if(t==='ogren'){m.durum='ogrendim';s.ogrenilen++;}
      if(t==='geri')m.durum='tekrar';
      await metaYaz(m);
      if(s.tekrar){s.islenen++;s.isleniyor=false;sqSonraki();}
      else sqGorKapat(false);
    }catch(e){bildir(hataMesaji(e),true);}
    finally{s.isleniyor=false;}
  }
  sqTekrarSor.addEventListener('click',function(){sqIsle('sor');});
  sqIslemBtn.addEventListener('click',function(){sqIsle(sqIslemBtn.getAttribute('data-islem'));});
  $('sq-gor-geri').addEventListener('click',function(){sqGorKapat(false);});
  $('sq-ozet-kapat').addEventListener('click',function(){sqGorKapat(false);});
  $('sq-arti').addEventListener('click',function(){if(!SG)return;SG.zoom=Math.min(3,Math.round((SG.zoom+.25)*100)/100);zoomUygula();});
  $('sq-eksi').addEventListener('click',function(){if(!SG)return;SG.zoom=Math.max(1,Math.round((SG.zoom-.25)*100)/100);zoomUygula();});
  sqCozumBtn.addEventListener('click',async function(){
    var s=SG;if(!s)return;
    if(s.cozumAcik){s.cozumAcik=false;sqCozumKap.hidden=true;sqCozumBtn.innerHTML='<svg class="ic" aria-hidden="true"><use href="#i-ampul"/></svg>Çözümü göster';return;}
    var m=soruBul(s.id);if(!m||!m.cozum)return;
    var b=await blobOku(m.cozum);
    if(SG!==s)return;
    if(!b){bildir('Çözüm fotoğrafı bulunamadı.',true);return;}
    if(s.cozumUrl)URL.revokeObjectURL(s.cozumUrl);
    s.cozumUrl=URL.createObjectURL(b);sqCozumImg.src=s.cozumUrl;
    s.cozumAcik=true;sqCozumKap.hidden=false;sqCozumBtn.innerHTML='<svg class="ic" aria-hidden="true"><use href="#i-goz-yok"/></svg>Çözümü gizle';
  });

  // soru menüsü: düzenle, paylaş, sil
  var sqMnEl=$('sq-menu'), sqMnId=null;
  function sqMenuAc(){
    var s=SG;if(!s)return;
    var m=soruBul(s.id);if(!m)return;
    sqMnId=m.id;
    $('sq-mn-ad').textContent=m.ders+' · '+(m.konu||'Konu yok');
    sqMnEl.hidden=false;
    if(window.LEX_GERI)window.LEX_GERI.ekle('sq-menu',function(){sqMenuKapat(true);});
  }
  function sqMenuKapat(geriden){
    if(sqMnEl.hidden)return;
    sqMnEl.hidden=true;
    if(!geriden&&window.LEX_GERI)window.LEX_GERI.dus('sq-menu');
  }
  $('sq-gor-menu').addEventListener('click',function(){sqMenuAc();});
  sqMnEl.addEventListener('click',function(e){
    if(e.target.getAttribute&&e.target.getAttribute('data-kapat')){sqMenuKapat(false);return;}
    var b=e.target.closest('.sq-mn-b');if(!b)return;
    var i=b.getAttribute('data-i'), id=sqMnId;
    sqMenuKapat(false);
    setTimeout(function(){
      if(i==='duzenle')sqDuzenle(id);
      else if(i==='paylas')sqPaylas(id);
      else if(i==='sil')sqSil(id);
    },window.LEX_GERI?60:0);
  });
  function sqDuzenle(id){var m=soruBul(id);if(m)sqShAc({kip:'duzenle',m:m,cozum:null});}
  async function sqPaylas(id){
    var m=soruBul(id);if(!m)return;
    try{
      var b=await blobOku(m.foto);
      if(!b){bildir('Fotoğraf bulunamadı.',true);return;}
      var ad=String(m.konu||'soru').replace(/[\\\/:*?"<>|\u0000-\u001f]+/g,'_').slice(0,60)||'soru';
      var f=new File([b],'soru-'+ad+'.jpg',{type:'image/jpeg'});
      if(navigator.canShare&&navigator.share&&navigator.canShare({files:[f]})){
        try{await navigator.share({files:[f],title:m.konu||'Soru'});return;}
        catch(e){if(e&&e.name==='AbortError')return;}
      }
      var u=URL.createObjectURL(f),a=document.createElement('a');
      a.href=u;a.download=f.name;document.body.appendChild(a);a.click();a.remove();
      setTimeout(function(){URL.revokeObjectURL(u);},30000);
    }catch(e){bildir('Paylaşılamadı.',true);}
  }
  async function sqSil(id){
    var m=soruBul(id);if(!m)return;
    if(!confirm('Bu soru silinsin mi?'))return;
    var ids=[m.foto,m.kucuk,m.cozum].filter(Boolean);
    try{
      await islem(['meta','veri'],'readwrite',function(t){
        ids.forEach(function(x){t.objectStore('veri').delete(x);});
        t.objectStore('meta').delete(m.id);
      });
      if(SG&&SG.id===id)sqGorKapat(false);
      bildir('Silindi.');
      await yenile();
    }catch(e){bildir(hataMesaji(e),true);}
  }

  // ---------- sayaç açılmadan çalışma: gizli kronometre ----------
  var KR={aktif:0,son:0,dosya:null,ders:'',t:0},KR_K='lex-pdf-sure',ESIK=180000,BOS=600000;
  function sayacCalisiyor(){try{var d=JSON.parse(localStorage.getItem('pm-durum')||'null');return !!(d&&d.calisiyor);}catch(e){return false;}}
  function krKaydet(){try{if(KR.dosya&&KR.aktif>=ESIK)localStorage.setItem(KR_K,JSON.stringify({aktif:KR.aktif,ad:KR.ad,ders:KR.ders,t:Date.now()}));}catch(e){}}
  function krBasla(m){KR={aktif:0,son:Date.now(),dosya:m.id,ad:m.ad,ders:m.ders||'',t:Date.now()};}
  function etkin(){if(KR.dosya)KR.son=Date.now();}
  ['pointerdown','wheel','keydown','scroll'].forEach(function(o){gor.addEventListener(o,etkin,{passive:true,capture:true});});
  setInterval(function(){
    if(!KR.dosya||!G||gor.hidden)return;
    var simdi=Date.now(),adim=Math.min(simdi-KR.t,10000);KR.t=simdi;
    if(document.visibilityState!=='visible'||simdi-KR.son>BOS||sayacCalisiyor())return;
    KR.aktif+=adim;if(KR.aktif>=ESIK)krKaydet();
  },5000);
  document.addEventListener('visibilitychange',function(){if(KR.dosya){KR.t=Date.now();if(document.visibilityState!=='visible')krKaydet();}});
  function krBitir(){
    var k=KR;KR={aktif:0,dosya:null};
    try{localStorage.removeItem(KR_K);}catch(e){}
    if(k.aktif>=ESIK)sureSor({aktif:k.aktif,ad:k.ad,ders:k.ders});
  }
  var SURE=null;
  function sureSor(k){
    var dk=Math.max(1,Math.round(k.aktif/60000));SURE={dk:dk,sec:''};
    $('kt-sure-dk').textContent=dk+' dk';
    $('kt-sure-ac').textContent='“'+(k.ad||'Dosya')+'” açıkken sayaç kapalıydı. Bu süreyi çalışmana ekledik; dersini seç ya da genel çalışma olarak kaydet.';
    var DG=(typeof DIGER!=='undefined')?DIGER:'Diğer',L=dersler().filter(function(x){return x!==DG;});
    if(k.ders&&k.ders!==DG&&L.indexOf(k.ders)<0)L.unshift(k.ders);
    if(k.ders&&L.indexOf(k.ders)>0){L.splice(L.indexOf(k.ders),1);L.unshift(k.ders);}
    $('kt-sure-d').innerHTML=L.map(function(d){return '<button type="button" class="kt-eb" role="radio" aria-checked="false" data-d="'+esc(d)+'">'+esc(d)+(d===k.ders?'<small>bu dosyanın dersi</small>':'')+'</button>';}).join('');
    var ilk=k.ders&&$('kt-sure-d').querySelector('[data-d]');if(ilk&&ilk.getAttribute('data-d')===k.ders){ilk.classList.add('on');ilk.setAttribute('aria-checked','true');SURE.sec=k.ders;}
    $('kt-sure').hidden=false;
    if(window.LEX_GERI)window.LEX_GERI.ekle('kt-sure',function(){sureKapat('Genel çalışma',true);});
  }
  function sureKapat(ders,geriden){
    if(!SURE)return;var s=SURE;SURE=null;
    $('kt-sure').hidden=true;
    if(!geriden&&window.LEX_GERI)window.LEX_GERI.dus('kt-sure');
    try{if(window.MF_KAYIT_EKLE)window.MF_KAYIT_EKLE(s.dk,ders,Date.now(),false);}catch(e){}
    bildir(s.dk+' dk “'+ders+'” olarak çalışmana eklendi.');
  }
  $('kt-sure-d').addEventListener('click',function(e){var b=e.target.closest('[data-d]');if(!b||!SURE)return;SURE.sec=b.getAttribute('data-d');[].forEach.call(this.querySelectorAll('[data-d]'),function(x){var on=x===b;x.classList.toggle('on',on);x.setAttribute('aria-checked',on?'true':'false');});});
  $('kt-sure-kaydet').addEventListener('click',function(){if(!SURE)return;sureKapat(SURE.sec||'Genel çalışma');});
  $('kt-sure-genel').addEventListener('click',function(){sureKapat('Genel çalışma');});
  $('kt-sure').addEventListener('click',function(e){if(e.target.getAttribute('data-kapat'))sureKapat('Genel çalışma');});
  // uygulama PDF açıkken kapandıysa: sonraki açılışta sor
  setTimeout(function(){try{var k=JSON.parse(localStorage.getItem(KR_K)||'null');if(k&&k.aktif>=ESIK&&Date.now()-k.t<12*3600000){localStorage.removeItem(KR_K);sureSor(k);}else if(k)localStorage.removeItem(KR_K);}catch(e){}},2500);
  // ---------- PDF üzerine not (kalem, fosforlu, altını çiz, silgi) ----------
  var CZ={acik:false,arac:'k',renk:{k:'#1A237E',f:'#FFE600',c:'#C62828'},kalemVar:false,ciziyor:null,parmak:{},geri:[],yazT:0};
  var RENK={k:['#111111','#1A237E','#C62828','#2E7D32'],f:['#FFE600','#3DFF6E','#FF4FA8','#2EC5FF'],c:['#C62828','#1A237E','#111111']};
  var KAL={k:.0024,f:.022,c:.0032};
  var bar=$('kt-ciz-bar'),acBtn=$('kt-ciz-ac'),ipucu=$('kt-ciz-ipucu');
  function notlar(g){if(!g.m.not||typeof g.m.not!=='object')g.m.not={};return g.m.not;}
  function notKatman(g,s){
    if(!s.el||!s.canvas)return;
    var c=s.not;
    if(!c){c=document.createElement('canvas');c.className='kt-not';s.not=c;}
    if(c.parentNode!==s.el)s.el.appendChild(c);
    var dpr=Math.min(window.devicePixelRatio||1,2);
    c.width=Math.max(1,Math.round(s.cw*dpr));c.height=Math.max(1,Math.round(s.ch*dpr));
    notCiz(g,s);
  }
  function cizgi(ctx,st,W,H){
    var p=st.p;if(!p||p.length<2)return;
    ctx.save();
    ctx.lineCap=st.t==='f'?'butt':'round';ctx.lineJoin='round';
    ctx.strokeStyle=st.r;ctx.lineWidth=Math.max(1,st.w*W);
    if(st.t==='f'){ctx.globalAlpha=.55;ctx.globalCompositeOperation='multiply';}
    ctx.beginPath();ctx.moveTo(p[0]*W,p[1]*H);
    if(p.length===2)ctx.lineTo(p[0]*W+.1,p[1]*H);
    else if(st.t==='k'&&p.length>6){
      for(var i=2;i<p.length-2;i+=2){var mx=(p[i]+p[i+2])/2*W,my=(p[i+1]+p[i+3])/2*H;ctx.quadraticCurveTo(p[i]*W,p[i+1]*H,mx,my);}
      ctx.lineTo(p[p.length-2]*W,p[p.length-1]*H);
    }
    else for(var i=2;i<p.length;i+=2)ctx.lineTo(p[i]*W,p[i+1]*H);
    ctx.stroke();ctx.restore();
  }
  function notCiz(g,s,canli){
    var c=s.not;if(!c)return;
    var ctx=c.getContext('2d'),W=c.width,H=c.height;
    ctx.clearRect(0,0,W,H);
    (notlar(g)[s.n]||[]).forEach(function(st){cizgi(ctx,st,W,H);});
    if(canli)cizgi(ctx,canli,W,H);
  }
  function notYaz(g,hemen){
    clearTimeout(CZ.yazT);
    var yaz=function(){metaYaz(g.m).catch(function(){bildir('Not kaydedilemedi. Depolama dolu olabilir.');});};
    if(hemen)yaz();else CZ.yazT=setTimeout(yaz,600);
  }
  function renkCiz(){
    var r=$('kt-ciz-renk');
    if(CZ.arac==='s'){r.innerHTML='';return;}
    r.innerHTML=RENK[CZ.arac].map(function(k){return '<button type="button" data-r="'+k+'" aria-label="Renk" style="background:'+k+'"'+(CZ.renk[CZ.arac]===k?' class="sec"':'')+'></button>';}).join('');
  }
  function ipucuYaz(){
    var t={k:'Kalemle yaz',f:'Cümlenin üzerinden geç, düz boyanır',c:'Cümlenin altından çiz, düz çizgi olur',s:'Silmek istediğin çizginin üzerinden geç'}[CZ.arac];
    ipucu.textContent=t+(CZ.kalemVar?' · Parmakla kaydır':' · İki parmakla kaydır');
  }
  function cizAc(){
    var g=G;if(!g||g.m.tur!=='pdf'||CZ.acik)return;
    CZ.acik=true;CZ.geri=[];gor.classList.add('ciz');bar.hidden=false;acBtn.setAttribute('aria-pressed','true');
    renkCiz();ipucuYaz();
    if(window.LEX_GERI)window.LEX_GERI.ekle('kt-ciz',function(){cizKapat(false,true);});
  }
  function cizKapat(sessiz,geriden){
    if(!CZ.acik)return;
    CZ.acik=false;if(CZ.ciziyor)canliKaldir(CZ.ciziyor);CZ.ciziyor=null;CZ.parmak={};gor.classList.remove('ciz');bar.hidden=true;acBtn.setAttribute('aria-pressed','false');
    if(G)notYaz(G,true);
    if(!geriden&&!sessiz&&window.LEX_GERI)window.LEX_GERI.dus('kt-ciz');
  }
  acBtn.addEventListener('click',function(){if(CZ.acik)cizKapat();else cizAc();});
  $('kt-ciz-bitti').addEventListener('click',function(){cizKapat();});
  bar.addEventListener('click',function(e){
    var b=e.target.closest('[data-a]');
    if(b){CZ.arac=b.getAttribute('data-a');[].forEach.call(bar.querySelectorAll('[data-a]'),function(x){x.classList.toggle('sec',x===b);});renkCiz();ipucuYaz();return;}
    var r=e.target.closest('[data-r]');
    if(r){CZ.renk[CZ.arac]=r.getAttribute('data-r');renkCiz();}
  });
  $('kt-ciz-geri').addEventListener('click',function(){
    var g=G;if(!g)return;var x=CZ.geri.pop();if(!x){ipucu.textContent='Geri alınacak bir şey yok';return;}
    var L=notlar(g)[x.n]=notlar(g)[x.n]||[];
    if(x.tur==='ekle'){var i=L.indexOf(x.st);if(i>=0)L.splice(i,1);}else{L.splice(Math.min(x.i,L.length),0,x.st);}
    var s=g.sayfalar[x.n-1];if(s)notCiz(g,s);notYaz(g);
  });
  function sayfaBul(g,x,y){
    for(var i=0;i<g.sayfalar.length;i++){var s=g.sayfalar[i];if(!s.el)continue;var r=s.el.getBoundingClientRect();if(y>=r.top&&y<=r.bottom&&x>=r.left&&x<=r.right)return {s:s,r:r};}
    return null;
  }
  function nokta(b,e){return [Math.round((e.clientX-b.r.left)/b.r.width*1e4)/1e4,Math.round((e.clientY-b.r.top)/b.r.height*1e4)/1e4];}
  function notSil(g,b,e){
    var q=nokta(b,e),L=notlar(g)[b.s.n]||[],en=b.r.width,es=b.r.height,yar=14;
    for(var i=L.length-1;i>=0;i--){
      var p=L[i].p,ek=Math.max(yar,L[i].w*en/2);
      for(var j=0;j<p.length;j+=2){
        var dx=(p[j]-q[0])*en,dy=(p[j+1]-q[1])*es;
        var bas=j>=2?[p[j-2],p[j-1]]:null,yakin=dx*dx+dy*dy<=ek*ek;
        if(!yakin&&bas){var ax=bas[0]*en,ay=bas[1]*es,bx=p[j]*en,by=p[j+1]*es,qx=q[0]*en,qy=q[1]*es,vx=bx-ax,vy=by-ay,L2=vx*vx+vy*vy,t=L2?Math.max(0,Math.min(1,((qx-ax)*vx+(qy-ay)*vy)/L2)):0,cx=ax+t*vx-qx,cy=ay+t*vy-qy;yakin=cx*cx+cy*cy<=ek*ek;}
        if(yakin){var st=L.splice(i,1)[0];CZ.geri.push({tur:'sil',n:b.s.n,st:st,i:i});notCiz(g,b.s);notYaz(g);break;}
      }
    }
  }
  function kaydirParmak(){
    var ids=Object.keys(CZ.parmak);if(!ids.length)return null;
    var x=0,y=0;ids.forEach(function(k){x+=CZ.parmak[k].x;y+=CZ.parmak[k].y;});return {x:x/ids.length,y:y/ids.length,n:ids.length};
  }
  kaydir.addEventListener('pointerdown',function(e){
    var g=G;if(!CZ.acik||!g)return;
    if(e.pointerType==='pen'&&!CZ.kalemVar){CZ.kalemVar=true;ipucuYaz();}
    var parmakla=e.pointerType==='touch'&&(CZ.kalemVar||Object.keys(CZ.parmak).length>0);
    if(e.pointerType==='touch'){CZ.parmak[e.pointerId]={x:e.clientX,y:e.clientY};}
    if(parmakla||(e.pointerType==='touch'&&Object.keys(CZ.parmak).length>1)){
      if(CZ.ciziyor&&CZ.ciziyor.id!==e.pointerId){var cs=CZ.ciziyor;CZ.ciziyor=null;canliKaldir(cs);notCiz(g,cs.s);}
      CZ.kay=kaydirParmak();return;
    }
    var b=sayfaBul(g,e.clientX,e.clientY);if(!b||!b.s.not)return;
    e.preventDefault();try{kaydir.setPointerCapture(e.pointerId);}catch(x){}
    if(CZ.arac==='s'){CZ.ciziyor={id:e.pointerId,s:b.s,silgi:true};notSil(g,b,e);return;}
    var q=nokta(b,e);
    CZ.ciziyor={id:e.pointerId,s:b.s,r:b.r,st:{t:CZ.arac,r:CZ.renk[CZ.arac],w:KAL[CZ.arac],p:q.slice()}};
    canliKur(CZ.ciziyor);
  });

  // canlı katman: çizerken yalnız yeni parça çizilir (gecikmesiz)
  function canliKur(c){
    var s=c.s,dpr=Math.min(window.devicePixelRatio||1,2),cv=document.createElement('canvas');
    cv.className='kt-not kt-canli';cv.width=Math.max(1,Math.round(s.cw*dpr));cv.height=Math.max(1,Math.round(s.ch*dpr));
    s.el.appendChild(cv);
    var ctx=cv.getContext('2d');
    c.cv=cv;c.ctx=ctx;c.W=cv.width;c.H=cv.height;
    ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=c.st.r;ctx.lineWidth=Math.max(1,c.st.w*c.W);
    if(c.st.t==='f'){ctx.lineCap='butt';ctx.globalAlpha=.55;}
    if(c.st.t==='k'){var p=c.st.p;ctx.beginPath();ctx.moveTo(p[0]*c.W,p[1]*c.H);ctx.lineTo(p[0]*c.W+.1,p[1]*c.H);ctx.stroke();}
  }
  function canliKaldir(c){if(c&&c.cv){c.cv.width=0;c.cv.height=0;if(c.cv.parentNode)c.cv.parentNode.removeChild(c.cv);c.cv=null;}}
  function hareket(e){
    var g=G,c=CZ.ciziyor;if(!g||!c||c.id!==e.pointerId)return;
    if(e.cancelable)e.preventDefault();
    var r=c.r;
    if(c.silgi){notSil(g,{s:c.s,r:c.s.el.getBoundingClientRect()},e);return;}
    var L=(e.getCoalescedEvents&&e.getCoalescedEvents())||[];if(!L.length)L=[e];
    var p=c.st.p,ctx=c.ctx;
    if(c.st.t==='c'||c.st.t==='f'){
      var son=L[L.length-1],q=[(son.clientX-r.left)/r.width,(son.clientY-r.top)/r.height];
      var dx=(q[0]-p[0])*r.width,dy=(q[1]-p[1])*r.height;
      c.st.p=[p[0],p[1],Math.round(q[0]*1e4)/1e4,Math.abs(dy)<Math.max(10,Math.abs(dx)*.12)?p[1]:Math.round(q[1]*1e4)/1e4];
      if(ctx){ctx.clearRect(0,0,c.W,c.H);ctx.beginPath();ctx.moveTo(c.st.p[0]*c.W,c.st.p[1]*c.H);ctx.lineTo(c.st.p[2]*c.W,c.st.p[3]*c.H);ctx.stroke();}
      return;
    }
    if(ctx)ctx.beginPath();
    var lx=p[p.length-2],ly=p[p.length-1],ciz=false;
    if(ctx)ctx.moveTo(lx*c.W,ly*c.H);
    for(var i=0;i<L.length;i++){
      var x=(L[i].clientX-r.left)/r.width,y=(L[i].clientY-r.top)/r.height;
      if(Math.abs((x-lx)*r.width)+Math.abs((y-ly)*r.height)<0.8)continue;
      x=Math.round(x*1e4)/1e4;y=Math.round(y*1e4)/1e4;
      p.push(x,y);if(ctx)ctx.lineTo(x*c.W,y*c.H);lx=x;ly=y;ciz=true;
    }
    if(ctx&&ciz)ctx.stroke();
  }
  var HAM='onpointerrawupdate' in window;
  if(HAM)kaydir.addEventListener('pointerrawupdate',function(e){if(CZ.acik&&CZ.ciziyor&&CZ.ciziyor.id===e.pointerId&&!CZ.ciziyor.silgi)hareket(e);});
  kaydir.addEventListener('pointermove',function(e){
    var g=G;if(!CZ.acik||!g)return;
    if(e.pointerType==='touch'&&CZ.parmak[e.pointerId]){
      CZ.parmak[e.pointerId]={x:e.clientX,y:e.clientY};
      if(!CZ.ciziyor||CZ.ciziyor.id!==e.pointerId){
        var k=kaydirParmak();if(CZ.kay&&k&&k.n===CZ.kay.n){kaydir.scrollLeft-=k.x-CZ.kay.x;kaydir.scrollTop-=k.y-CZ.kay.y;}
        CZ.kay=k;return;
      }
    }
    var c=CZ.ciziyor;if(!c||c.id!==e.pointerId)return;
    if(HAM&&!c.silgi){e.preventDefault();return;}
    hareket(e);
  });
  function birak(e){
    var g=G;
    if(CZ.parmak[e.pointerId]){delete CZ.parmak[e.pointerId];CZ.kay=kaydirParmak();}
    var c=CZ.ciziyor;if(!c||c.id!==e.pointerId||!g)return;
    CZ.ciziyor=null;
    if(c.silgi)return;
    if(e.type==='pointercancel'){canliKaldir(c);return;}
    var L=notlar(g)[c.s.n]=notlar(g)[c.s.n]||[];
    L.push(c.st);CZ.geri.push({tur:'ekle',n:c.s.n,st:c.st});
    notCiz(g,c.s);canliKaldir(c);notYaz(g);
  }
  kaydir.addEventListener('pointerup',birak);
  kaydir.addEventListener('pointercancel',birak);

  // ---------- yedek kancası ----------
  window.LEX_KUT_YEDEK={
    topla:async function(){
      var out=[], meta;
      try{meta=await metaOku();}catch(e){return out;}
      var gecerli=[];
      for(var i=0;i<meta.length;i++){
        var m=meta[i], parca=[], ana=false;
        if(m.tip==='soru'){
          var sira=[['foto','soru.jpg'],['kucuk','kucuk.jpg'],['cozum','cozum.jpg']];
          for(var j=0;j<sira.length;j++){
            if(!m[sira[j][0]])continue;
            var sb=await blobOku(m[sira[j][0]]);
            if(sb){parca.push({yol:'dosyalar/'+m.id+'/'+sira[j][1],blob:sb});if(sira[j][0]==='foto')ana=true;}
          }
        }else{
          var b=await blobOku(m.id);
          if(b){parca.push({yol:'dosyalar/'+m.id+'/'+guvenliAd(m),blob:b});ana=true;}
        }
        if(ana){out=out.concat(parca);gecerli.push(m);}
      }
      out.push({yol:'dosyalar/_liste.json',blob:new Blob([JSON.stringify(gecerli)],{type:'application/json'})});
      return out;
    },
    yukle:async function(dosyalar){
      var liste=null, parcalar={}, i;
      for(i=0;i<dosyalar.length;i++){
        var yol=String(dosyalar[i].yol||'');
        if(yol==='dosyalar/_liste.json'){
          try{
            var tx=dosyalar[i].blob.text?await dosyalar[i].blob.text():await new Promise(function(ok,h){var r=new FileReader();r.onload=function(){ok(r.result);};r.onerror=h;r.readAsText(dosyalar[i].blob);});
            liste=JSON.parse(tx);
          }catch(e){liste=null;}
        }else{
          var p=yol.split('/');
          if(p.length===3&&p[0]==='dosyalar'){(parcalar[p[1]]=parcalar[p[1]]||{})[p[2]]=dosyalar[i].blob;}
        }
      }
      if(!Array.isArray(liste))liste=[];
      var db=await idbAc();
      await islem(['meta','veri'],'readwrite',function(t){
        t.objectStore('meta').clear();t.objectStore('veri').clear();
        liste.forEach(function(m){
          if(!m||!m.id||!parcalar[m.id])return;
          var pc=parcalar[m.id];
          if(m.tip==='soru'){
            if(!pc['soru.jpg'])return;
            [['foto','soru.jpg'],['kucuk','kucuk.jpg'],['cozum','cozum.jpg']].forEach(function(r){
              if(!m[r[0]])return;
              if(!pc[r[1]]){m[r[0]]=null;return;}
              t.objectStore('veri').put({id:m[r[0]],blob:pc[r[1]]});
            });
          }else{
            var ad=Object.keys(pc)[0], b=pc[ad];
            var tip=m.mime||'';
            if(tip&&b.type!==tip)b=b.slice(0,b.size,tip);
            t.objectStore('veri').put({id:m.id,blob:b});
          }
          t.objectStore('meta').put(m);
        });
      });
      yenile();
    }
  };

  // ---------- dışa açılan ----------
  window.LEX_KUT=function(){
    if(G)return;
    yenile();
  };
  sekme=sekmeOku();bolUygula();
  if(window.indexedDB)yenile();else ciz();
})();
