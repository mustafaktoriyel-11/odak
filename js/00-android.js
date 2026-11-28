/* Android uygulaması (Capacitor) köprüsü. Web'de (tarayıcı/PWA) hiçbir şey yapmaz.
   - Sistem açılış ekranı, web sayfasının ilk karesi çizilince kapanır (aynı zemin rengi → tek akış).
   - navigator.share / canShare: uygulamada WebView'de yok; Filesystem + Share eklentileriyle aynı arayüz sağlanır,
     böylece mevcut paylaşma kodu (mantık sonucu, kütüphane, yedek) değişmeden çalışır. Vazgeçilince AbortError fırlatır.
   - <a download>: WebView indirmez; dosya telefonun Belgeler › MF Odak klasörüne kaydedilir.
   - MF_DOSYA_KAYDET(blob, ad): dosyayı Belgeler › MF Odak klasörüne kalıcı kaydeder (yedek için). Söz: {yol, uri} */
(function(){
  var CAP=window.Capacitor;if(!CAP)return;
  var P=CAP.Plugins||{},Fs=P.Filesystem,Sh=P.Share,SS=P.SplashScreen;
  try{document.documentElement.classList.add('mf-uygulama');}catch(e){}
  if(SS)try{requestAnimationFrame(function(){requestAnimationFrame(function(){SS.hide({fadeOutDuration:180});});});}catch(e){}

  var PARCA=3*1024*1024;  // büyük dosyalar köprüden tek seferde geçmez: 3 MB'lık parçalar
  function b64(blob){return new Promise(function(ok,hata){var r=new FileReader();r.onload=function(){var s=String(r.result||''),i=s.indexOf(',');ok(i<0?'':s.slice(i+1));};r.onerror=function(){hata(r.error||new Error('okunamadi'));};r.readAsDataURL(blob);});}
  function temiz(ad){return String(ad||'dosya').replace(/[\\\/:*?"<>|\u0000-\u001f]+/g,'_').slice(0,120)||'dosya';}
  async function yaz(blob,yol,klasor){
    var w=null;
    for(var o=0;o<Math.max(1,blob.size);o+=PARCA){
      var d=await b64(blob.slice(o,o+PARCA));
      if(o===0)w=await Fs.writeFile({path:yol,data:d,directory:klasor,recursive:true});
      else await Fs.appendFile({path:yol,data:d,directory:klasor});
    }
    var uri=w&&w.uri;
    if(!uri){var g=await Fs.getUri({path:yol,directory:klasor});uri=g&&g.uri;}
    return uri;
  }
  window.MF_DOSYA_KAYDET=async function(blob,ad){
    if(!Fs)throw new Error('Dosya sistemi yok');
    ad=temiz(ad);
    try{if(Fs.checkPermissions){var iz=await Fs.checkPermissions();if(iz&&iz.publicStorage&&iz.publicStorage!=='granted'&&Fs.requestPermissions)await Fs.requestPermissions();}}catch(e){}
    var uri=await yaz(blob,'MF Odak/'+ad,'DOCUMENTS');
    return {yol:'Belgeler › MF Odak › '+ad,uri:uri};
  };

  if(Fs&&Sh){
    navigator.canShare=function(d){return !!d;};
    navigator.share=async function(d){
      d=d||{};var dosyalar=[],fl=d.files||[];
      for(var i=0;i<fl.length;i++)dosyalar.push(await yaz(fl[i],temiz(fl[i].name||('dosya-'+i)),'CACHE'));
      var baslik=d.title||'MF Odak',o={title:baslik,dialogTitle:baslik};
      var metin=[d.text,d.url].filter(Boolean).join(' ');if(metin)o.text=metin;
      if(dosyalar.length)o.files=dosyalar;
      try{await Sh.share(o);}
      catch(e){
        if(/cancel|iptal|dismiss/i.test(String(e&&(e.message||e)))){var x=new Error('Paylaşım iptal edildi');x.name='AbortError';throw x;}
        throw e;
      }
    };
  }

  // Kilit ekranı / bildirim alanı sayacı (yerel eklenti MfKilit). Sayaç durumu değişince 01-sayac.js çağırır.
  var KL=P.MfKilit;
  if(KL){
    var sonDurum='',izinSoruldu=false;
    // Süre bitişi için telefonun kendi alarm bildirimi: uygulama arka plandayken ya da ekran kilitliyken de çalar
    var LNp=P.LocalNotifications,kanalHazir=null;
    function sureKanal(){if(!kanalHazir)kanalHazir=LNp.createChannel({id:'sure',name:'Süre doldu',description:'Odak turu ya da mola bitince',importance:5,visibility:1,vibration:true}).catch(function(){});return kanalHazir;}
    function sureBildirim(s){if(!LNp)return;
      LNp.cancel({notifications:[{id:7100}]}).catch(function(){}).then(function(){
        if(!(s&&s.calisiyor&&!s.serbest&&s.zaman>Date.now()+3000))return;
        return sureKanal().then(function(){return LNp.schedule({notifications:[{id:7100,title:s.calis?'Odak turu bitti':'Mola bitti',body:s.calis?'Süre doldu. Mola zamanı!':'Mola bitti, odaklanma zamanı.',
          schedule:{at:new Date(s.zaman),allowWhileIdle:true},channelId:'sure',smallIcon:'mf_bildirim',iconColor:'#FF8A1F'}]});});
      }).catch(function(){});}
    // uygulama açıkken süre biterse uygulamanın kendi zili çalar; telefon bildirimi tekrar etmesin
    window.MF_SURE_GORULDU=function(){if(!LNp)return;LNp.cancel({notifications:[{id:7100}]}).catch(function(){});if(LNp.removeDeliveredNotifications)LNp.removeDeliveredNotifications({notifications:[{id:7100}]}).catch(function(){});};
    window.MF_KILIT=function(s){
      var a=JSON.stringify(s);if(a===sonDurum)return;sonDurum=a;sureBildirim(s);
      if(s.gizle){KL.gizle().catch(function(){});return;}
      var yaz=function(){KL.goster(s).catch(function(){});};
      if(!izinSoruldu&&s.calisiyor){izinSoruldu=true;KL.izinIste().then(yaz,yaz);}else yaz();
    };
    KL.addListener('eylem',function(e){try{if(window.MF_KILIT_EYLEM)window.MF_KILIT_EYLEM(e&&e.eylem);}catch(x){}});
  }

  function bildir(t){
    try{var d=document.createElement('div');d.textContent=t;
      d.style.cssText='position:fixed;left:16px;right:16px;bottom:calc(84px + env(safe-area-inset-bottom));z-index:99999;background:#141B3F;color:#fff;padding:12px 14px;border-radius:12px;font:14px/1.4 Roboto,Arial,sans-serif;box-shadow:0 6px 24px rgba(0,0,0,.3);text-align:center';
      document.body.appendChild(d);setTimeout(function(){d.remove();},3500);}catch(e){}
  }
  document.addEventListener('click',function(e){
    var a=e.target&&e.target.closest&&e.target.closest('a[download]');
    if(!a||!Fs)return;
    e.preventDefault();
    var ad=a.getAttribute('download')||'dosya';
    fetch(a.href).then(function(r){return r.blob();})
      .then(function(b){return window.MF_DOSYA_KAYDET(b,ad);})
      .then(function(k){bildir('Kaydedildi: '+k.yol);})
      .catch(function(){bildir('Dosya kaydedilemedi.');});
  },true);
})();
