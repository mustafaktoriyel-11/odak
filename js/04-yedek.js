
// ================= YEDEKLE / GERİ YÜKLE =================
(function(){
  var ONEKLER=['lex-','mf-','pm-'];
  var HARIC={'mf-cihaz':1,'mf-kuyruk':1,'mf-not-bekleyen':1,'mf-dnm-bekleyen':1,'pm-durum':1};
  var JSON_AD='mfodak-yedek.json';
  var AYLAR=['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
  var TE=new TextEncoder(), TD=new TextDecoder('utf-8');

  function yedeklenir(k){
    if(HARIC[k])return false;
    for(var i=0;i<ONEKLER.length;i++)if(k.indexOf(ONEKLER[i])===0)return true;
    return false;
  }
  function anahtarlar(){
    var l=[];
    for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(k!==null&&yedeklenir(k))l.push(k);}
    return l;
  }
  function iki(n){return (n<10?'0':'')+n;}

  // ---------- CRC32 ----------
  var TABLO=(function(){
    var t=new Uint32Array(256);
    for(var n=0;n<256;n++){var c=n;for(var k=0;k<8;k++)c=(c&1)?(0xEDB88320^(c>>>1)):(c>>>1);t[n]=c>>>0;}
    return t;
  })();
  function crc32(b){
    var c=0xFFFFFFFF;
    for(var i=0;i<b.length;i++)c=TABLO[(c^b[i])&0xFF]^(c>>>8);
    return (c^0xFFFFFFFF)>>>0;
  }

  // ---------- ZIP yazıcı (STORE) ----------
  function zipYaz(girdiler){
    var simdi=new Date();
    var dt=((simdi.getHours()<<11)|(simdi.getMinutes()<<5)|(simdi.getSeconds()>>1))&0xFFFF;
    var dd=(((Math.max(simdi.getFullYear(),1980)-1980)<<9)|((simdi.getMonth()+1)<<5)|simdi.getDate())&0xFFFF;
    var parcalar=[], merkez=[], konum=0, i;
    for(i=0;i<girdiler.length;i++){
      var ad=TE.encode(girdiler[i].yol), v=girdiler[i].veri, crc=crc32(v);
      var lh=new DataView(new ArrayBuffer(30));
      lh.setUint32(0,0x04034b50,true);lh.setUint16(4,20,true);lh.setUint16(6,0x0800,true);lh.setUint16(8,0,true);
      lh.setUint16(10,dt,true);lh.setUint16(12,dd,true);lh.setUint32(14,crc,true);
      lh.setUint32(18,v.length,true);lh.setUint32(22,v.length,true);lh.setUint16(26,ad.length,true);lh.setUint16(28,0,true);
      var ch=new DataView(new ArrayBuffer(46));
      ch.setUint32(0,0x02014b50,true);ch.setUint16(4,20,true);ch.setUint16(6,20,true);ch.setUint16(8,0x0800,true);ch.setUint16(10,0,true);
      ch.setUint16(12,dt,true);ch.setUint16(14,dd,true);ch.setUint32(16,crc,true);
      ch.setUint32(20,v.length,true);ch.setUint32(24,v.length,true);ch.setUint16(28,ad.length,true);
      ch.setUint16(30,0,true);ch.setUint16(32,0,true);ch.setUint16(34,0,true);ch.setUint16(36,0,true);ch.setUint32(38,0,true);
      ch.setUint32(42,konum,true);
      merkez.push(new Uint8Array(ch.buffer),ad);
      parcalar.push(new Uint8Array(lh.buffer),ad,v);
      konum+=30+ad.length+v.length;
    }
    var mb=0;for(i=0;i<merkez.length;i++)mb+=merkez[i].length;
    var e=new DataView(new ArrayBuffer(22));
    e.setUint32(0,0x06054b50,true);e.setUint16(4,0,true);e.setUint16(6,0,true);
    e.setUint16(8,girdiler.length,true);e.setUint16(10,girdiler.length,true);
    e.setUint32(12,mb,true);e.setUint32(16,konum,true);e.setUint16(20,0,true);
    return new Blob(parcalar.concat(merkez,[new Uint8Array(e.buffer)]),{type:'application/zip'});
  }

  // ---------- ZIP okuyucu ----------
  function bayttanOku(blob){
    if(blob.arrayBuffer)return blob.arrayBuffer();
    return new Promise(function(ok,hata){var r=new FileReader();r.onload=function(){ok(r.result);};r.onerror=function(){hata(r.error);};r.readAsArrayBuffer(blob);});
  }
  function acDeflate(v){
    if(typeof DecompressionStream==='undefined')return Promise.reject(new Error('Bu yedek sıkıştırılmış; bu tarayıcı açamıyor.'));
    var ds=new DecompressionStream('deflate-raw');
    return new Response(new Blob([v]).stream().pipeThrough(ds)).arrayBuffer().then(function(b){return new Uint8Array(b);});
  }
  async function zipOku(blob){
    var buf=await bayttanOku(blob), u=new Uint8Array(buf), dv=new DataView(buf), i, e=-1;
    if(u.length<22)throw new Error('Dosya bir ZIP değil.');
    for(i=u.length-22;i>=Math.max(0,u.length-22-65535);i--){
      if(dv.getUint32(i,true)===0x06054b50){e=i;break;}
    }
    if(e<0)throw new Error('Dosya bir ZIP değil.');
    var say=dv.getUint16(e+10,true), mkonum=dv.getUint32(e+16,true), p=mkonum, sonuc=[];
    for(i=0;i<say;i++){
      if(p+46>u.length||dv.getUint32(p,true)!==0x02014b50)throw new Error('ZIP dizini bozuk.');
      var yon=dv.getUint16(p+10,true), crc=dv.getUint32(p+16,true), cb=dv.getUint32(p+20,true);
      var nl=dv.getUint16(p+28,true), el=dv.getUint16(p+30,true), cl=dv.getUint16(p+32,true), lo=dv.getUint32(p+42,true);
      var ad=TD.decode(u.subarray(p+46,p+46+nl));
      p+=46+nl+el+cl;
      if(ad.charAt(ad.length-1)==='/')continue;
      if(lo+30>u.length||dv.getUint32(lo,true)!==0x04034b50)throw new Error('ZIP girdisi bozuk.');
      var bas=lo+30+dv.getUint16(lo+26,true)+dv.getUint16(lo+28,true);
      if(bas+cb>u.length)throw new Error('ZIP eksik ya da kesilmiş.');
      var ham=u.subarray(bas,bas+cb), veri;
      if(yon===0)veri=new Uint8Array(ham);
      else if(yon===8)veri=await acDeflate(ham);
      else throw new Error('Desteklenmeyen sıkıştırma yöntemi.');
      if(crc32(veri)!==crc)throw new Error('Yedek dosyası bozuk (CRC uyuşmuyor).');
      sonuc.push({yol:ad,veri:veri});
    }
    return sonuc;
  }

  // ---------- Yedek oluştur / çöz ----------
  async function olustur(){
    var ls={}, ks=anahtarlar(), i;
    for(i=0;i<ks.length;i++)ls[ks[i]]=localStorage.getItem(ks[i]);
    var meta={uygulama:'MF Odak',surum:1,tarih:new Date().toISOString(),ls:ls};
    var girdiler=[{yol:JSON_AD,veri:TE.encode(JSON.stringify(meta))}];
    var kut=window.LEX_KUT_YEDEK;
    if(kut&&typeof kut.topla==='function'){
      var dl=(await kut.topla())||[];
      for(i=0;i<dl.length;i++){
        var yol=String(dl[i].yol||'');
        if(yol.indexOf('dosyalar/')!==0)yol='dosyalar/'+yol.replace(/^\/+/,'');
        girdiler.push({yol:yol,veri:new Uint8Array(await bayttanOku(dl[i].blob))});
      }
    }
    return zipYaz(girdiler);
  }
  async function coz(blob){
    var gir=await zipOku(blob), meta=null, dosyalar=[], i;
    for(i=0;i<gir.length;i++){
      if(gir[i].yol===JSON_AD){
        try{meta=JSON.parse(TD.decode(gir[i].veri));}catch(e){meta=null;}
      }else if(gir[i].yol.indexOf('dosyalar/')===0){
        dosyalar.push({yol:gir[i].yol,blob:new Blob([gir[i].veri])});
      }
    }
    if(!meta||meta.uygulama!=='MF Odak'||!meta.ls||typeof meta.ls!=='object'){
      var h=new Error('Bu dosya bir MF Odak yedeği değil.');h.yedekDegil=true;throw h;
    }
    return {veri:meta,dosyalar:dosyalar};
  }
  function sonYedek(){
    var n=parseInt(localStorage.getItem('mf-son-yedek'),10);
    return isNaN(n)?null:n;
  }
  function tarihYaz(t){
    var d=new Date(t);
    if(isNaN(d.getTime()))return '';
    return d.getDate()+' '+AYLAR[d.getMonth()]+' '+d.getFullYear()+', '+iki(d.getHours())+':'+iki(d.getMinutes());
  }
  window.LEX_YEDEK={olustur:olustur,coz:coz,sonYedek:sonYedek};

  // ---------- Arayüz ----------
  function basla(){
    var bAl=document.getElementById('yd-al'), bYukle=document.getElementById('yd-yukle'),
        inp=document.getElementById('yd-dosya'), son=document.getElementById('yd-son'), dur=document.getElementById('yd-durum');
    if(!bAl||!bYukle||!inp||!son||!dur)return;
    var mesgul=false;
    function mesaj(s){dur.textContent=s;}
    function sonGuncelle(){var t=sonYedek();son.textContent=t?('Son yedek: '+tarihYaz(t)):'Henüz yedek almadın';}
    function kilit(b){mesgul=b;bAl.disabled=b;bYukle.disabled=b;}
    sonGuncelle();

    bAl.addEventListener('click',async function(){
      if(mesgul)return;
      kilit(true);mesaj('Yedek hazırlanıyor…');
      try{
        var blob, ks=anahtarlar().length, md=0;
        try{blob=await olustur();}catch(e){mesaj('Yedek hazırlanamadı: '+(e&&e.message?e.message:'bilinmeyen hata'));return;}
        try{var c=await coz(blob);md=c.dosyalar.length;ks=Object.keys(c.veri.ls).length;}catch(e){}
        var d=new Date(), ad='mfodak-yedek-'+d.getFullYear()+'-'+iki(d.getMonth()+1)+'-'+iki(d.getDate())+'.zip';
        var dosya;
        try{dosya=new File([blob],ad,{type:'application/zip'});}catch(e){dosya=null;}
        var tamam=false,kayitYol='';
        // Android uygulaması: yedek önce telefona (Belgeler › MF Odak) kalıcı kaydedilir, sonra isteğe bağlı paylaşma açılır
        // (Drive/Dosyalarım, paylaşılan geçici dosyayı arka planda okuyamayabiliyor)
        if(window.Capacitor&&window.MF_DOSYA_KAYDET){
          try{var kk=await window.MF_DOSYA_KAYDET(blob,ad);kayitYol=kk.yol;tamam=true;}
          catch(e){mesaj('Yedek telefona kaydedilemedi: '+(e&&e.message?e.message:'bilinmeyen hata'));return;}
          if(dosya&&navigator.share){try{await navigator.share({files:[dosya],title:'MF Odak yedeği'});}catch(e){}}
        }
        if(!tamam&&dosya&&navigator.share&&navigator.canShare&&navigator.canShare({files:[dosya]})){
          try{await navigator.share({files:[dosya],title:'MF Odak yedeği'});tamam=true;}
          catch(e){
            if(e&&e.name==='AbortError'){mesaj('');return;}   // kullanıcı vazgeçti
          }
        }
        if(!tamam){
          try{
            var url=URL.createObjectURL(blob), a=document.createElement('a');
            a.href=url;a.download=ad;a.style.display='none';
            document.body.appendChild(a);a.click();
            setTimeout(function(){try{document.body.removeChild(a);}catch(_){}URL.revokeObjectURL(url);},1500);
            tamam=true;
          }catch(e){mesaj('Yedek indirilemedi.');return;}
        }
        try{localStorage.setItem('mf-son-yedek',String(Date.now()));}catch(e){}
        sonGuncelle();
        mesaj('Yedek hazır: '+ks+' kayıt, '+md+' dosya'+(kayitYol?' · '+kayitYol:''));
      }catch(e){
        mesaj('Yedek alınamadı.');
      }finally{kilit(false);}
    });

    bYukle.addEventListener('click',function(){if(!mesgul)inp.click();});

    inp.addEventListener('change',async function(){
      var f=inp.files&&inp.files[0];
      if(!f)return;
      if(mesgul){inp.value='';return;}
      kilit(true);
      try{
        mesaj('Yedek okunuyor…');
        var r;
        try{r=await coz(f);}
        catch(e){mesaj(e&&e.yedekDegil?e.message:('Yedek okunamadı: '+(e&&e.message?e.message:'dosya geçersiz')));return;}
        var tr=r.veri.tarih?tarihYaz(r.veri.tarih):'';
        if(!confirm('Bu telefondaki veriler yedektekilerle değiştirilecek (yedek tarihi: '+(tr||'bilinmiyor')+'). Devam edilsin mi?')){mesaj('Geri yükleme iptal edildi.');return;}
        try{
          var eski=anahtarlar(), i, ks=Object.keys(r.veri.ls);
          for(i=0;i<eski.length;i++)localStorage.removeItem(eski[i]);
          for(i=0;i<ks.length;i++){
            if(yedeklenir(ks[i])&&typeof r.veri.ls[ks[i]]==='string')localStorage.setItem(ks[i],r.veri.ls[ks[i]]);
          }
        }catch(e){mesaj('Veriler yazılamadı (depolama dolu olabilir).');return;}
        try{
          var kut=window.LEX_KUT_YEDEK;
          if(r.dosyalar.length&&kut&&typeof kut.yukle==='function')await kut.yukle(r.dosyalar);
        }catch(e){mesaj('Veriler yüklendi ama dosyalar geri yüklenemedi.');return;}
        mesaj('Geri yüklendi, uygulama yenileniyor…');
        setTimeout(function(){location.reload();},800);
      }catch(e){
        mesaj('Geri yükleme başarısız oldu.');
      }finally{
        inp.value='';kilit(false);
      }
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',basla);else basla();
})();
