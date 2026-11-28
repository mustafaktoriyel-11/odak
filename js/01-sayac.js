

(function(){
  var kok=document.getElementById('pm');if(!kok)return;
  var T={"odak": "Odaklanma zamanı", "odakCalis": "Odaklan", "kisa": "Kısa mola", "uzun": "Uzun mola", "duraklat": "Duraklat", "baslat": "Başlat", "devam": "Devam et", "bos": "Henüz kayıt yok. Sayacı başlattığında burada görünecek.", "gunler": ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"], "silSor": "Tüm çalışma kayıtları silinsin mi?", "ort": "{n} gün çalıştın, günlük ortalama {d} dk", "bugunK": "Bugün", "son7": "Son 7 gün", "son30": "Son 30 gün", "aylar": ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"], "rBaslik": "Günlük çalışma raporum", "rToplam": "Toplam", "rGun": "gün çalıştım", "rBos": "Bugün sayacı henüz kullanmadım, bir plan yapabilir miyiz?", "curuB": "Odaktan çıktın! Bu tur bozuldu", "curuP": "Sıkı moddayken uygulamadan çıktığın için bu tur sayılmadı. {dk} dakikalık çalışman yine de kaydedildi. Hadi yeniden başla!", "rCikis": "Sıkı modda odaktan çıkış", "ozetK": "Bugün {dk} dk · {p} tur", "bitOdak": "Odak süresi bitti!", "bitOdakM": "Harika iş. Şimdi kısa bir mola zamanı.", "bitOdakU": "4 tur tamam! Şimdi uzun mola zamanı.", "bitMola": "Mola bitti", "bitMolaM": "Hazırsan yeni bir odak turuna başla.", "atla": "Molayı atla", "son3": "Son 3 ay", "son6": "Son 6 ay", "buHafta": "Bu hafta", "aylarK": ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"]};
  var $=function(id){return document.getElementById(id);};
  // eski kayitlardaki TYT/AYT Matematik tek 'Matematik' olarak gosterilir
  function dersAd(x){return /^(TYT|AYT) Matematik$/.test(x)?'Matematik':x;}
  var DURUM_K='pm-durum',KAYIT_K='pm-kayit',AYAR_K='pm-ayar';
  function oku(k,v){try{var x=localStorage.getItem(k);return x?JSON.parse(x):v;}catch(e){return v;}}
  function yaz(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
  var ayar=oku(AYAR_K,{odak:'40',ses:'',seviye:40,ders:''});
  if(ayar.odak==='50'){ayar.ozel=50;ayar.odak='ozel';} // 50 seçeneği kalktı: eski seçim özel süre olur
  if(ayar.sinav)$('pm-sinav').value=ayar.sinav;$('pm-odak').value=ayar.odak;if(ayar.ozel)$('pm-ozel').value=ayar.ozel;$('pm-ses').value=ayar.ses;$('pm-seviye').value=ayar.seviye;if(ayar.ders)$('pm-ders').value=dersAd(ayar.ders);if(!$('pm-ders').value)$('pm-ders').selectedIndex=0;
  if(!$('pm-odak').value)$('pm-odak').value='40';
  function ayarKaydet(){ayar={odak:$('pm-odak').value,ses:$('pm-ses').value,seviye:+$('pm-seviye').value,ders:$('pm-ders').value,siki:$('pm-siki').checked,sinav:$('pm-sinav').value,ozel:odakDk()};yaz(AYAR_K,ayar);}
  // durum: mod, toplam(ms), bitis(ms|null), kalan(ms), calisiyor, tur, ders, basla
  var d=oku(DURUM_K,null);
  var SINAV={TYT:{ad:'TYT',dk:165,d:[['tur','Türkçe',40],['sos','Sosyal Bilimler',20],['tmat','Temel Matematik',40],['fen','Fen Bilimleri',20]]},
    SAY:{ad:'AYT Sayısal',dk:180,d:[['mat','Matematik',40],['fiz','Fizik',14],['kim','Kimya',13],['bio','Biyoloji',13]]},
    EA:{ad:'AYT Eşit Ağırlık',dk:180,d:[['mat','Matematik',40],['edb','Türk Dili ve Edebiyatı',24],['tar1','Tarih-1',10],['cog1','Coğrafya-1',6]]},
    SOZ:{ad:'AYT Sözel',dk:180,d:[['edb','Türk Dili ve Edebiyatı',24],['tar1','Tarih-1',10],['cog1','Coğrafya-1',6],['tar2','Tarih-2',11],['cog2','Coğrafya-2',11],['fel','Felsefe Grubu',12],['din','Din Kültürü',6]]},
    YDT:{ad:'YDT',dk:180,d:[['ydl','Yabancı Dil',80]]},
    LGS:{ad:'LGS',dk:155,ceza:3,oturum:[75,80],ara:45,d:[['tur','Türkçe',20],['sos','T.C. İnkılap Tarihi',10],['din','Din Kültürü',10],['ydl','Yabancı Dil',10],['tmat','Matematik',20],['fen','Fen Bilimleri',20]]},
    LGS1:{ad:'LGS Sözel',dk:75,ceza:3,d:[['tur','Türkçe',20],['sos','T.C. İnkılap Tarihi',10],['din','Din Kültürü',10],['ydl','Yabancı Dil',10]]},
    LGS2:{ad:'LGS Sayısal',dk:80,ceza:3,d:[['tmat','Matematik',20],['fen','Fen Bilimleri',20]]}};
  function sinavKod(){var v=$('pm-sinav').value;return SINAV[v]?v:'TYT';}
  function calismaMi(m){return m==='odak'||m==='deneme';}
  // mola odak suresine gore otomatik: 25 dk -> 5/15, 40-50 dk -> 10/30
  // ozel sure: 5-720 dk (12 saat); mola: 40 dk altinda 5/15, 60 dk'ya kadar 10/30, daha uzunsa 15/30
  function odakDk(){var v=$('pm-odak').value;if(v==='serbest')return 720;if(v==='ozel'){var x=Math.round(+$('pm-ozel').value);return Math.max(5,Math.min(720,x||25));}return +v||25;}
  function molaDk(o){return o<40?5:(o<=60?10:15);}
  function sure(m){var o=odakDk(),mo=molaDk(o);if(m==='deneme'){var sv=SINAV[sinavKod()];if(sv.oturum){var f=(d&&d.faz)||1;return (f==='ara'?sv.ara:sv.oturum[f-1])*60000;}return sv.dk*60000;}return (m==='odak'?o:m==='kisa'?mo:Math.min(mo*3,30))*60000;}
  if(!d){d={mod:'odak',toplam:sure('odak'),bitis:null,kalan:sure('odak'),calisiyor:false,tur:0,ders:'',basla:null};}
  function kaydet(){yaz(DURUM_K,d);}
  var CEVRE=2*Math.PI*52;$('pm-halka').style.strokeDasharray=CEVRE;
  function kalanMs(){return d.calisiyor?Math.max(0,d.bitis-Date.now()):d.kalan;}
  function bicim(ms){var s=Math.ceil(ms/1000),m=Math.floor(s/60);s=s%60;if(m>=60){var h=Math.floor(m/60);m=m%60;return h+':'+(m<10?'0':'')+m+':'+(s<10?'0':'')+s;}return (m<10?'0':'')+m+':'+(s<10?'0':'')+s;}
  function ciz(){
    var k=kalanMs(),ara=araMi(),mola=!calismaMi(d.mod)||ara;
    $('pm-sure').textContent=bicim(k);$('pm-sure').style.fontSize=k>=3600000?'36px':'';
    $('pm-halka').style.strokeDashoffset=CEVRE*(1-k/d.toplam);
    $('pm-saat').classList.toggle('mola',mola);$('pm-saat').classList.toggle('deneme',d.mod==='deneme'&&!ara);$('pm-sinav-k').classList.toggle('acik',d.mod==='deneme');$('pm-sinav').disabled=d.mod==='deneme'&&(k!==d.toplam||!!d.faz);
    var sfB=ara?'Arayı atla':mola?T.atla:((k!==d.toplam||d.faz)?'Bitir':'Sıfırla');$('pm-sifir').textContent=sfB;$('pm-sifir').classList.toggle('tut',sfB==='Bitir');$('pm-sifir').setAttribute('aria-label',sfB==='Bitir'?'Bitir, basılı tut':sfB);
    $('pm-domates').style.display=d.mod==='deneme'?'none':'';
    $('pm-ders-k').style.display=$('pm-odak-k').style.display=d.mod==='deneme'?'none':'';
    $('pm-ozel-k').style.display=(d.mod!=='deneme'&&$('pm-odak').value==='ozel')?'':'none';$('pm-ozel').disabled=$('pm-odak').disabled=d.calisiyor&&d.mod==='odak';cipGuncelle();
    $('pm-etiket').textContent=d.mod==='deneme'?denemeEtiket():d.mod==='odak'?((d.calisiyor||k!==d.toplam)?(d.ders||$('pm-ders').value):T.odak+' · '+$('pm-ders').value):(d.mod==='kisa'?T.kisa:T.uzun);
    $('pm-basla').textContent=d.calisiyor?T.duraklat:(k===d.toplam?T.baslat:T.devam);
    $('pm-muzik').classList.toggle('cal',d.calisiyor&&!!$('pm-ses').value);seansGizle(d.mod==='odak'&&k!==d.toplam);
    var dm='';for(var i=0;i<4;i++)dm+=i<(d.tur%4)?'●':'○';
    $('pm-domates').innerHTML='<small>Odak turu</small>'+dm;$('pm-domates').setAttribute('aria-label','Odak turu '+(d.tur%4)+' / 4');
    var bs=kok.querySelectorAll('.pm-mod button');for(var j=0;j<bs.length;j++){var dn=bs[j].getAttribute('data-m')==='deneme';bs[j].classList.toggle('aktif',dn===(d.mod==='deneme'));bs[j].classList.toggle('molada',!dn&&mola);}
    document.title=(d.calisiyor?bicim(k)+' – ':'')+BASLIK;
    if(d.mod==='odak'&&(d.serbest||(!d.calisiyor&&k===d.toplam&&$('pm-odak').value==='serbest'))){
      var gec=d.toplam-k,gs=Math.floor(gec/1000),gm=Math.floor(gs/60),gh=Math.floor(gm/60);gs%=60;
      var gt=gh?gh+':'+(gm%60<10?'0':'')+(gm%60)+':'+(gs<10?'0':'')+gs:(gm<10?'0':'')+gm+':'+(gs<10?'0':'')+gs;
      $('pm-sure').textContent=gt;$('pm-sure').style.fontSize=gh?'36px':'';
      $('pm-halka').style.strokeDashoffset=CEVRE*(1-(gec%3600000)/3600000);
      $('pm-etiket').textContent=d.calisiyor?(d.ders||$('pm-ders').value):(k===d.toplam?'Serbest çalışma · '+$('pm-ders').value:'Duraklatıldı');
      document.title=(d.calisiyor?gt+' – ':'')+BASLIK;$('pm-saat').classList.add('serbest');
    }else $('pm-saat').classList.remove('serbest');
    if(window.MF_KADRAN)try{window.MF_KADRAN({k:k,toplam:d.toplam,calisiyor:d.calisiyor,bitis:d.bitis,mod:d.mod,mola:mola,
      serbest:d.mod==='odak'&&(d.serbest||(!d.calisiyor&&k===d.toplam&&$('pm-odak').value==='serbest'))});}catch(e){}
    kilitEkrani(k);
    tutGuncelle();
  }
  var BASLIK=document.title;
  $('pm-ders').addEventListener('change',function(){ciz();}); // boşta etikette seçili ders anında görünsün
  // LGS Tam: 1. oturum -> 45 dk ara -> 2. oturum, hepsi kendiliginden gecer
  function araMi(){return d.mod==='deneme'&&d.faz==='ara';}
  function denemeEtiket(){
    var sv=SINAV[sinavKod()];if(!sv.oturum)return sv.ad+' denemesi';
    var f=d.faz||1;return f==='ara'?'LGS · oturum arası':(f===1?'LGS · 1. oturum (Sözel)':'LGS · 2. oturum (Sayısal)');
  }
  // kilit ekranindaki medya karti: buyuk satirda kalan sure, altinda ne yapildigi, ilerleme cubugu
  var MS='mediaSession' in navigator,msBaslik='';
  function kilitEkrani(k){
    // Android uygulaması: kilit ekranı / bildirim alanında yerel sayaç (00-android.js › MF_KILIT); yalnız durum değişince yazılır
    if(window.MF_KILIT)try{
      var kEt=$('pm-etiket').textContent,kCal=calismaMi(d.mod)&&!araMi(),kSb=!!d.serbest&&d.mod==='odak';
      if(!d.calisiyor&&k===d.toplam)window.MF_KILIT({gizle:true});
      else if(!d.calisiyor)window.MF_KILIT({calisiyor:false,baslik:'⏸ '+(kSb?bicim(d.toplam-k)+' geçti':bicim(k)+' kaldı')+' · duraklatıldı',metin:kEt,calis:kCal});
      else window.MF_KILIT({calisiyor:true,serbest:kSb,zaman:kSb?d.bitis-d.toplam:d.bitis,baslik:kEt,metin:kSb?'Süre ileri sayıyor':(kCal?'Odak zamanı':'Mola zamanı'),calis:kCal});
    }catch(e){}
    if(!MS)return;
    try{
      if(!d.calisiyor){if(msBaslik&&k!==d.toplam){msBaslik='';navigator.mediaSession.metadata=new MediaMetadata({title:'⏸ '+bicim(k)+' · duraklatıldı',artist:$('pm-etiket').textContent,album:'MF Odak',artwork:[{src:'kilit-durdu.png',sizes:'512x512',type:'image/png'}]});navigator.mediaSession.playbackState='paused';}return;}
      var bas=d.serbest?'⏱ '+bicim(d.toplam-k)+' geçti':'⏱ '+bicim(k)+' kaldı',alt=$('pm-etiket').textContent;
      if(bas!==msBaslik){msBaslik=bas;navigator.mediaSession.metadata=new MediaMetadata({title:bas,artist:alt,album:'MF Odak',artwork:[{src:(calismaMi(d.mod)&&!araMi()?'kilit-calis.png':'kilit-mola.png'),sizes:'512x512',type:'image/png'}]});}
      navigator.mediaSession.playbackState='playing';
      if(navigator.mediaSession.setPositionState)navigator.mediaSession.setPositionState({duration:d.toplam/1000,playbackRate:1,position:Math.max(0,Math.min(d.toplam,d.toplam-k))/1000});
    }catch(e){}
  }
  function sikiAktif(){return d.calisiyor&&calismaMi(d.mod)&&!araMi();}
  // --- kayitlar ---
  function gun(t){var x=new Date(t);return x.getFullYear()+'-'+(x.getMonth()+1)+'-'+x.getDate();}
  window.MF_KAYIT_EKLE=function(dk,ders,tarih,elle){if(dk<1)return;var t=tarih||Date.now(),k=oku(KAYIT_K,{}),g=gun(t);if(!k[g])k[g]={dk:0,p:0,d:{}};k[g].dk+=dk;k[g].d[ders]=(k[g].d[ders]||0)+dk;yaz(KAYIT_K,k);istatistik();if(window.MF_PR)window.MF_PR();var kk={tarih:new Date(t).toISOString(),ders:ders,dk:Math.round(dk*10)/10,tam:false,notsuz:true,elle:!!elle};if(window.MF_KOC)window.MF_KOC(kk);else(window.MF_KOC_ON=window.MF_KOC_ON||[]).push(kk);if(window.MF_IST_YENILE)try{window.MF_IST_YENILE();}catch(e){}};function kayitEkle(dk,ders,tam,dnm){
    if(dk<1)return;
    var k=oku(KAYIT_K,{}),g=gun(Date.now());
    if(!k[g])k[g]={dk:0,p:0,d:{}};
    k[g].dk+=dk;if(tam)k[g].p+=1;k[g].d[ders]=(k[g].d[ders]||0)+dk;
    yaz(KAYIT_K,k);istatistik();if(window.MF_PR)window.MF_PR();
    var kk={tarih:new Date().toISOString(),ders:ders,dk:Math.round(dk*10)/10,tam:!!tam,notsuz:!!dnm};if(window.MF_KOC)window.MF_KOC(kk);else(window.MF_KOC_ON=window.MF_KOC_ON||[]).push(kk);
  }
  var ARALIK='bugun';
  function istatistik(){
    var k=oku(KAYIT_K,{}),simdi=Date.now(),b=k[gun(simdi)]||{dk:0,p:0,d:{}};
    var oz=$('pm-acc-o');if(oz)oz.textContent=T.ozetK.replace('{dk}',Math.round(b.dk)).replace('{p}',b.p);
    if(window.MF_IST)window.MF_IST(k,ARALIK);
  }
  window.MF_IST_YENILE=function(){istatistik();};
  function sureKisa(dk){dk=Math.round(dk);return dk>=600?String(Math.round(dk/6)/10).replace('.',',')+' sa':dk+' dk';}
  // --- sesler ---
  var sesUrl={};
  function gurultu(tur,vr){
    var key=tur+'-'+(vr||0);if(sesUrl[key])return sesUrl[key];
    var sr=tur==='kozmik'?16000:(tur==='beyaz'?16000:12000),sure=(tur==='yagmur'||tur==='kozmik')?300:45,n=sr*sure;
    var R=Math.random,out=new Float32Array(n),i;
    if(tur==='beyaz'){for(i=0;i<n;i++)out[i]=(R()*2-1)*0.5;}
    else if(tur==='kahve'){var son=0;for(i=0;i<n;i++){son=(son+0.02*(R()*2-1))/1.02;out[i]=son*3.5;}}
    else if(tur==='kozmik'){
      // ozgun uzay ambiyansi: yavas degisen akorlar, alcak drone, seyrek parilti, yapay yanki
      var TS=2048,tab=new Float32Array(TS),h,hz=[1,0.42,0.22,0.1,0.05,0.025];
      for(i=0;i<TS;i++){var sx=0;for(h=0;h<hz.length;h++)sx+=hz[h]*Math.sin(6.2832*(h+1)*i/TS);tab[i]=sx;}
      function frek(m){return 440*Math.pow(2,(m-69)/12);}
      var AK=[[45,52,57,60,64],[41,48,52,57,60],[48,55,60,64,67],[40,47,55,59,64],[50,57,62,65,69],[43,50,55,59,62],[38,45,53,57,62],[44,52,59,63,68]];
      // 25 akor x 12 sn = 5 dk; rastgele sira, ayni akor art arda ve son 2 icinde tekrar etmez, son akor ilkine esit olmaz
      var sira=[Math.floor(R()*AK.length)];while(sira.length<25){var sc=Math.floor(R()*AK.length),L=sira.length;if(sc===sira[L-1]||sc===sira[L-2]||(L===24&&sc===sira[0]))continue;sira.push(sc);}
      var AKS=12*sr,AT=4.5*sr,RL=6*sr;
      var notalar=[];
      for(k=0;k<sira.length;k++){var ak=AK[sira[k]];for(var a2=0;a2<ak.length;a2++){
        notalar.push({b:k*AKS,e:(k+1)*AKS+RL,f:frek(ak[a2]),g:(a2===0?0.9:0.55)/ak.length,d:1+(R()-0.5)*0.003,ph:R()*TS,ph2:R()*TS});}}
      // seyrek parilti tonlari
      var ust=[81,84,88,76,79];for(k=0;k<Math.round(sure/13);k++){var bs=Math.round(R()*(n-10*sr));notalar.push({b:bs,e:bs+9*sr,f:frek(ust[Math.floor(R()*ust.length)]),g:0.05,d:1.002,ph:0,ph2:TS/3,par:1});}
      var kuru=new Float32Array(n+RL+sr),dr=frek(33),dp=0;
      for(var q=0;q<notalar.length;q++){var nt=notalar[q],adim=nt.f*TS/sr,adim2=adim*nt.d,p1=nt.ph,p2=nt.ph2,bas=nt.b,son2=Math.min(n+RL+sr,nt.e),uz=nt.e-nt.b;
        for(i=bas;i<son2;i++){var tt=i-bas,env;
          if(nt.par){var oran=tt/uz;env=Math.sin(3.1416*oran);env*=env;}
          else env=tt<AT?tt/AT:(tt>uz-RL?(uz-tt)/RL:1);
          kuru[i]+=(tab[p1|0]+tab[p2|0])*env*nt.g;
          p1+=adim;if(p1>=TS)p1-=TS;p2+=adim2;if(p2>=TS)p2-=TS;}}
      for(i=n;i<kuru.length;i++)kuru[i-n]+=kuru[i];
      for(i=0;i<n;i++){kuru[i]+=Math.sin(dp)*0.12*(0.8+0.2*Math.sin(i/sr*0.21));dp+=6.2832*dr/sr;if(dp>6.2832)dp-=6.2832;}
      // Schroeder yankisi
      var CD=[1116,1188,1277,1356].map(function(x){return Math.round(x*sr/44100*1.6);}),AD=[556,341].map(function(x){return Math.round(x*sr/44100);});
      var cb=CD.map(function(d){return {b:new Float32Array(d),i:0,d:d};}),ab=AD.map(function(d){return {b:new Float32Array(d),i:0,d:d};});
      for(var gr=-4*sr;gr<n;gr++){i=gr<0?n+gr:gr;var xin=kuru[i],ys=0,c2,cc;
        for(c2=0;c2<4;c2++){cc=cb[c2];var o2=cc.b[cc.i];ys+=o2;cc.b[cc.i]=xin+o2*0.84;cc.i=(cc.i+1)%cc.d;}
        ys*=0.25;
        for(c2=0;c2<2;c2++){cc=ab[c2];var bo=cc.b[cc.i],yo=-ys+bo;cc.b[cc.i]=ys+bo*0.5;cc.i=(cc.i+1)%cc.d;ys=yo;}
        if(gr>=0)out[i]=xin*0.45+ys*0.9;}
    }
    else{
      // 1) yagmur: pembe gurultu + yavas dalgalanma + damlalar
      var dalga=1,b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0,f1=R()*6.28,f2=R()*6.28,yag=new Float32Array(n),ym=0;
      for(i=0;i<n;i++){var w=R()*2-1;
        b0=0.99886*b0+w*0.0555179;b1=0.99332*b1+w*0.0750759;b2=0.969*b2+w*0.153852;b3=0.8665*b3+w*0.3104856;b4=0.55*b4+w*0.5329522;b5=-0.7616*b5-w*0.016898;
        var x=(b0+b1+b2+b3+b4+b5+b6+w*0.5362)*0.11;b6=w*0.115926;
        if((i&255)===0){var t=i/sr;dalga=0.82+0.12*Math.sin(6.283*t/31+f1)+0.06*Math.sin(6.283*t/11+f2);}
        x*=dalga;if(R()<0.0012)x+=(R()*2-1)*0.25;
        yag[i]=x;if(Math.abs(x)>ym)ym=Math.abs(x);}
      // 2) uzak gok gurultusu: 3 olay, alcak frekansli, yavas yukselip uzun sonen
      var gok=new Float32Array(n),olay=[],k;
      // 5 dk icine duzensiz aralikli (22-77 sn), farkli siddet ve uzunlukta gok gurultuleri
      var gt=8+R()*20;while(gt<sure-12){olay.push({b:Math.round(sr*gt),a:0.35+R()*0.65,u:sr*(5+R()*6)});gt+=22+R()*55;}
      for(k=0;k<olay.length;k++){var o=olay[k],br=0,br2=0,j;
        for(j=0;j<o.u&&o.b+j<n;j++){var ww=R()*2-1;br=(br+0.012*ww)/1.012;br2=br2*0.995+br*0.005;
          var tt=j/sr,env=(tt<0.6?tt/0.6:Math.exp(-(tt-0.6)/1.8))*(0.75+0.25*Math.sin(tt*2.1+k));
          gok[o.b+j]+=br2*env*o.a;}}
      var gm=0;for(i=0;i<n;i++)if(Math.abs(gok[i])>gm)gm=Math.abs(gok[i]);
      // 3) somine citirtisi: seyrek, kisa, tiz patlamalar
      var cit=new Float32Array(n),ca=0,onc=0;
      for(i=0;i<n;i++){if(R()<2.2/sr)ca=0.25+R()*0.75;if(R()<0.25/sr)ca=1.2;
        var ww2=R()*2-1,h=ww2-onc;onc=ww2;cit[i]=h*ca;ca*=0.9935;}
      var cm=0;for(i=0;i<n;i++)if(Math.abs(cit[i])>cm)cm=Math.abs(cit[i]);
      for(i=0;i<n;i++)out[i]=yag[i]/(ym||1)*0.55+gok[i]/(gm||1)*0.5+cit[i]/(cm||1)*0.16;
    }
    // dongu: son 3 saniye basa esit-guclu gecisle eklenir, tek dosya kendi icinde kesintisiz doner
    var X=sr*3,m=n-X,y=new Float32Array(m);
    for(i=0;i<m;i++)y[i]=out[i];
    for(i=0;i<X;i++){var tx=i/X;y[i]=out[i]*Math.sin(1.5708*tx)+out[m+i]*Math.cos(1.5708*tx);}
    var mx=0;for(i=0;i<m;i++)if(Math.abs(y[i])>mx)mx=Math.abs(y[i]);
    var c=0.85/(mx||1);for(i=0;i<m;i++)y[i]*=c;
    sesUrl[key]=wavUrl(sr,y);
    return sesUrl[key];
  }
  function sesGuncelle(){
    var tur=$('pm-ses').value,sev=+$('pm-seviye').value/100;hedefSes=sev;
    if(!tur||(!d.calisiyor&&!sesOnizle)){sesDur();return;}
    if(!sesA){sesA=new Audio();sesA.preload='auto';sesA.loop=true;aktifSes=sesA;sesA.addEventListener('ended',function(){if(sesTur==='debussy'){DEB_I=(DEB_I+1)%DEB.length;try{localStorage.setItem('mf-deb-i',DEB_I);}catch(e){}debCal();}});}
    if(sesTur!==tur){sesDur();sesTur=tur;if(tur==='debussy'){sesA.loop=false;debCal();sesA.volume=sev;return;}sesA.loop=true;sesA.src=gurultu(tur,0);}
    sesA.volume=sev;
    if(sesA.paused&&sesA.src){var p=sesA.play();if(p&&p.catch)p.catch(function(){});}
  }
  var sesOnizle=false,sesA=null,sesB=null,aktifSes=null,sesTur='',hedefSes=0.4,fadeT=null;
  // --- Debussy: parçalar ilk seçimde bir kez iner, önbellekte kalır (internetsiz çalar) ---
  var DEB=[['debussy-clair-de-lune','Clair de lune','gh'],['debussy-fille','La fille aux cheveux de lin'],['debussy-arabesk-1','Birinci Arabesk'],['debussy-danseuses','Danseuses de Delphes'],['debussy-arabesk-2','İkinci Arabesk']];
  var DEB_I=0;try{DEB_I=(parseInt(localStorage.getItem('mf-deb-i'),10)||0)%DEB.length;}catch(e){}
  var DEB_URL=null,DEB_YUK=0;
  function debBlob(i){var u=DEB[i][0]+'.m4a';
    return caches.open('mf-muzik-1').then(function(c){return c.match(u).then(function(r){return r||fetch(u).then(function(y){if(!y.ok)throw 0;return c.put(u,y.clone()).then(function(){return y;},function(){return y;});});});}).then(function(r){return r.blob();});}
  function debCal(){
    var i=DEB_I,j=++DEB_YUK;sesKunye('yukleniyor');
    debBlob(i).then(function(b){
      if(j!==DEB_YUK||sesTur!=='debussy')return;
      if(DEB_URL)URL.revokeObjectURL(DEB_URL);DEB_URL=URL.createObjectURL(b);
      sesA.src=DEB_URL;sesA.volume=hedefSes;sesKunye('');
      if(d.calisiyor||sesOnizle){var p=sesA.play();if(p&&p.catch)p.catch(function(){});}
      debBlob((i+1)%DEB.length).catch(function(){});
    }).catch(function(){if(j===DEB_YUK)sesKunye('hata');});
  }
  var DEB_D='';function sesKunye(dr){if(dr!==undefined)DEB_D=dr;dr=DEB_D;var k=$('ses-kunye');if(!k)return;
    if($('pm-ses').value!=='debussy'){k.hidden=true;return;}k.hidden=false;
    k.innerHTML=(dr==='yukleniyor'?'<svg class="ic" aria-hidden="true"><use href="#i-kum"/></svg>Parça indiriliyor (ilk seferde, ~3 MB)…':dr==='hata'?'<svg class="ic" aria-hidden="true"><use href="#i-uyari"/></svg>Parça indirilemedi. İnternete bağlanıp tekrar seç.':'▶ <b>'+DEB[DEB_I][1]+'</b>')+'<br><small>Claude Debussy · '+(DEB[DEB_I][2]==='gh'?'Piyano: Laurens Goedhart (2011) · <a href="https://creativecommons.org/licenses/by/3.0/deed.tr" target="_blank" rel="noopener">CC BY 3.0</a>':'Piyano: Patrizia Prati (canlı kayıt, Madrid 2016) · <a href="https://creativecommons.org/licenses/by-sa/4.0/deed.tr" target="_blank" rel="noopener">CC BY-SA 4.0</a>')+' · Wikimedia Commons · sıkıştırılarak kullanıldı</small>';}
  function sesDur(){if(sesA)sesA.pause();}
  // --- ekran kilitliyken uyanik kalma ---
  // Telefon kilitlenince tarayici sessiz sayfalari uyutur ve sayac durur.
  // Sayac calisirken duyulmayacak kadar kisik bir ses dongusu calinir; boylece sayfa uyanik kalir,
  // sure bitince zil ve bildirim zamaninda gelir.
  function wavUrl(sr,out){
    var n=out.length,buf=new ArrayBuffer(44+n*2),v=new DataView(buf);
    function str(o,s){for(var i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i));}
    str(0,'RIFF');v.setUint32(4,36+n*2,true);str(8,'WAVE');str(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);
    v.setUint32(24,sr,true);v.setUint32(28,sr*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);str(36,'data');v.setUint32(40,n*2,true);
    var pcm=new Int16Array(buf,44,n);
    for(var i=0;i<n;i++){var y=Math.round(out[i]*32767);pcm[i]=y>32767?32767:(y<-32768?-32768:y);}
    return URL.createObjectURL(new Blob([buf],{type:'audio/wav'}));
  }
  var tutA=null,zilA=null,tutBiz=false,tutDis=false,wac=null,wosc=null;
  // Yedek uyanik tutucu: Web Audio. Android'e "muzik caliyor" demez, YouTube gibi uygulamalari durdurmaz.
  function waHazir(){try{if(!wac){var C=window.AudioContext||window.webkitAudioContext;if(C)wac=new C();}}catch(e){}}
  function waBaslat(){
    try{waHazir();if(!wac)return;if(wac.state==='suspended')wac.resume();
      if(!wosc){wosc=wac.createOscillator();var g=wac.createGain();wosc.frequency.value=10;g.gain.value=0.0015;wosc.connect(g);g.connect(wac.destination);wosc.start();}}catch(e){}
  }
  function waDur(){try{if(wosc){wosc.stop();wosc.disconnect();wosc=null;}if(wac&&wac.state==='running')wac.suspend();}catch(e){}}
  function tutGuncelle(){
    var gerek=d.calisiyor||!!alarmT;
    if(!gerek){
      if(d.kalan===d.toplam)tutDis=false;
      waDur();if(tutA&&!tutA.paused){tutBiz=true;tutA.pause();}
      return;
    }
    // 10 Hz: insan kulaginin duyamayacagi kadar alcak; tarayici yine de "ses caliyor" sayar. 12 sn = tam 120 dalga, dongu atlamasiz
    if(!tutA){var sr=8000,o=new Float32Array(sr*12);for(var i=0;i<o.length;i++)o[i]=Math.sin(6.283185307*10*i/sr)*0.0015;
      tutA=new Audio(wavUrl(sr,o));tutA.loop=true;tutA.preload='auto';
      // baska bir uygulama (YouTube vb.) sesi aldiysa geri alma, yedek tutucuya gec
      tutA.addEventListener('pause',function(){if(tutBiz){tutBiz=false;return;}tutDis=true;waBaslat();});}
    if(tutDis){waBaslat();return;}
    if(tutA.paused){var p=tutA.play();if(p&&p.catch)p.catch(function(){tutDis=true;waBaslat();});}
  }
  function zilHazir(){
    if(zilA)return;
    var sr=22050,n=Math.round(sr*2.2),o=new Float32Array(n);
    [0,0.35,0.7].forEach(function(dt,k){var f=[880,1047,1319][k],b=Math.round(dt*sr);
      for(var i=0;i<sr&&b+i<n;i++){var t=i/sr,env=t<0.02?t/0.02:Math.exp(-(t-0.02)*6);o[b+i]+=Math.sin(6.2832*f*t)*env*0.3;}});
    zilA=new Audio(wavUrl(sr,o));zilA.preload='auto';
    // ilk dokunusta sessizce bir kez calip kilidi ac (sonradan arka planda calabilsin)
    zilA.muted=true;var p=zilA.play();
    if(p&&p.then)p.then(function(){if(zilA.muted){zilA.pause();zilA.currentTime=0;zilA.muted=false;}}).catch(function(){zilA.muted=false;});
    else zilA.muted=false;
  }
  function bildir(B,M){
    try{if(document.hidden&&'Notification' in window&&Notification.permission==='granted'&&navigator.serviceWorker){
      navigator.serviceWorker.ready.then(function(r){r.showNotification(B,{body:M,icon:'icon-192.png',badge:'icon-192.png',tag:'mf-odak',renotify:true,requireInteraction:true,vibrate:[400,100,400,100,400,100,400]});});
    }}catch(e){}
  }
  var alarmT=null,alarmN=null,alarmBit=0;
  function alarmBaslat(odakti,uzun,ozelB,ozelM){
    alarmDurdur(true);$('alarm').classList.remove('sakin');
    var B=ozelB||(odakti?T.bitOdak:T.bitMola),M=ozelM||(odakti?(uzun?T.bitOdakU:T.bitOdakM):T.bitMolaM);
    $('alarm-b').textContent=B;$('alarm-p').textContent=M;$('alarm-pr').hidden=true;
    $('alarm').classList.add('acik');
    alarmBit=Date.now()+120000;
    function tur(){
      if(Date.now()>alarmBit){alarmDurdur();return;}
      zil();
      if(navigator.vibrate)navigator.vibrate([300,150,300,150,300,150,300,150,300,150,300,150,300]);
    }
    tur();alarmT=setInterval(tur,3000);tutGuncelle();
    bildir(B,M);alarmN=setInterval(function(){if(document.hidden)bildir(B,M);},2000);
  }
  function prKutu(o){var k=$('alarm-pr');if(!o){k.hidden=true;return;}k.hidden=false;k.classList.toggle('tamam',o.yz>=100);$('alarm-pr-y').textContent=o.yz>=100?'✓ Tamam':'%'+o.yz;$('alarm-pr-bar').style.width=o.yz+'%';$('alarm-pr-t').textContent=o.ayr;}
  // erken bitirince: sessiz bilgi penceresi (zil ve titresim yok)
  function erkenBitti(dk,ders,sb){
    $('alarm-b').textContent='Çalışman kaydedildi ✓';
    $('alarm-p').textContent=ders+' · '+(dk>=60?Math.floor(dk/60)+' sa '+Math.round(dk%60):Math.round(dk))+' dk\n'+(sb?'Serbest çalışma olarak kaydedildi.':'Tam tur olmadığı için tur sayılmadı.');
    prKutu(window.MF_PR_OZET?window.MF_PR_OZET(ders):null);
    var a=$('alarm');a.classList.add('acik','sakin');
  }
  function alarmDurdur(yeniden){
    clearInterval(alarmT);clearInterval(alarmN);alarmT=alarmN=null;
    if(navigator.vibrate)navigator.vibrate(0);
    if(zilA&&!zilA.muted){try{zilA.pause();}catch(e){}}
    var a=$('alarm');if(a)a.classList.remove('acik','sakin');
    try{if(navigator.serviceWorker)navigator.serviceWorker.ready.then(function(r){r.getNotifications({tag:'mf-odak'}).then(function(ns){ns.forEach(function(n){n.close();});});});}catch(e){}
    if(yeniden!==true)tutGuncelle();
  }
  $('alarm-tamam').addEventListener('click',alarmDurdur);
  function zil(){
    try{zilHazir();zilA.muted=false;zilA.currentTime=0;var p=zilA.play();if(p&&p.catch)p.catch(zilEski);}catch(e){zilEski();}
  }
  function zilEski(){
    try{var C=window.AudioContext||window.webkitAudioContext,ac=new C(),t=ac.currentTime;
      [0,0.35,0.7].forEach(function(dt,i){var o=ac.createOscillator(),g=ac.createGain();o.type='sine';o.frequency.value=[880,1047,1319][i];
        g.gain.setValueAtTime(0.0001,t+dt);g.gain.exponentialRampToValueAtTime(0.35,t+dt+0.02);g.gain.exponentialRampToValueAtTime(0.0001,t+dt+0.9);
        o.connect(g);g.connect(ac.destination);o.start(t+dt);o.stop(t+dt+1);});
      setTimeout(function(){ac.close();},2500);}catch(e){}
  }
  // --- kontrol ---
  function modSec(m){
    if(m===d.mod)return;
    if(m==='odak'&&!calismaMi(d.mod)){molaAtla(false);return;}
    if(d.calisiyor&&calismaMi(d.mod))odakKaydet(false);
    d.faz=null;d.lgsDk=0;d.mod=m;d.toplam=sure(m);d.kalan=d.toplam;d.bitis=null;d.calisiyor=false;d.basla=null;kaydet();sesGuncelle();ciz();
  }
  function molaAtla(baslat){
    d.mod='odak';d.toplam=d.kalan=sure('odak');d.bitis=null;d.calisiyor=false;d.basla=null;d.ders='';kaydet();
    if(baslat){d.ders=$('pm-ders').value;basla();}else{sesGuncelle();ciz();}
  }
  function odakKaydet(tam){
    var gecen=(d.toplam-kalanMs())/60000;
    if(d.mod==='deneme'){if(araMi())return d.lgsDk||0;var dm=tam?d.toplam/60000:gecen;kayitEkle(dm,SINAV[sinavKod()].ad+' Deneme',false,true);return dm+(d.lgsDk||0);}
    kayitEkle(tam?d.toplam/60000:gecen,d.ders||$('pm-ders').value,tam);
  }
  function denemeBitti(tam){
    var dk=odakKaydet(tam);
    d.faz=null;d.lgsDk=0;d.kalan=d.toplam=sure('deneme');d.calisiyor=false;d.bitis=null;d.ders='';kaydet();sesGuncelle();ciz();
    if(dk>=10)dnmAc(sinavKod(),Math.round(dk));
  }
  var GUN_S={1:'1! = 1 · ilk adım atıldı',2:'√4 = 2',3:'∛27 = 3',4:'2² = 4',5:'√25 = 5',6:'√36 = 6',7:'2³ − 1 = 7',8:'2³ = 8',9:'3² = 9',10:'1 + 2 + 3 + 4 = 10',11:'11 = 11 · asal ve kararlı!',12:'3! + 3! = 12'};
  var TOP_S={24:'4! = 24',50:'7² + 1 = 50',100:'10² = 100',120:'5! = 120',250:'250 = 2 · 5³',500:'500 = 2² · 5³',720:'6! = 720',1000:'10³ = 1000'};
  function kutlama(){
    var k=oku(KAYIT_K,{}),b=(k[gun(Date.now())]||{}).p||0,t=0,m='';
    for(var g in k)t+=k[g].p||0;
    if(TOP_S[t])m='Toplam '+t+'. odak turu: '+TOP_S[t];
    else if(GUN_S[b])m='Bugünün '+b+'. odak turu: '+GUN_S[b];
    else{var r=Math.round(Math.sqrt(b));if(r*r===b)m='Bugünün '+b+'. odak turu: '+r+'² = '+b;}
    if(m)$('alarm-p').textContent=$('alarm-p').textContent+'\n'+m;
  }
  function bitti(){
    var eski=d.mod;
    if(eski==='deneme'){
      var sv=SINAV[sinavKod()];
      if(sv.oturum&&d.faz!==2){
        if(d.faz==='ara'){d.faz=2;alarmBaslat(true,false,'2. oturum başladı!','Sayısal oturum: '+sv.oturum[1]+' dakika. Başarılar!');}
        else{kayitEkle(sv.oturum[0],sv.ad+' Deneme',false,true);d.lgsDk=sv.oturum[0];d.faz='ara';alarmBaslat(true,false,'1. oturum bitti!',sv.ara+' dakika ara. Ara bitince 2. oturum kendiliğinden başlayacak.');}
        d.toplam=d.kalan=sure('deneme');d.calisiyor=false;d.bitis=null;basla();return;
      }
      alarmBaslat(true,false,'Deneme bitti!','Kalemleri bırak. Sonuçlarını girelim.');denemeBitti(true);return;}
    if(eski==='odak'){odakKaydet(true);d.tur+=1;}
    var yeni=eski==='odak'?((d.tur%4===0)?'uzun':'kisa'):'odak';
    d.mod=yeni;d.toplam=sure(yeni);d.kalan=d.toplam;d.bitis=null;d.calisiyor=false;kaydet();
    var prO=(eski==='odak'&&window.MF_PR_OZET)?window.MF_PR_OZET(d.ders||$('pm-ders').value):null;
    alarmBaslat(eski==='odak',yeni==='uzun',null,prO?((yeni==='uzun'?T.bitOdakU:T.bitOdakM)+'\n'+prO.kisa):null);prKutu(prO);if(prO)$('alarm-p').textContent=(yeni==='uzun'?T.bitOdakU:T.bitOdakM);if(eski==='odak')kutlama();
    if(eski==='odak'){basla();}else{sesGuncelle();}
    ciz();
  }
  function basla(){try{if('Notification' in window&&Notification.permission==='default')Notification.requestPermission();}catch(e){}
    zilHazir();waHazir();if(d.mod==='odak'&&d.kalan===d.toplam)d.serbest=$('pm-odak').value==='serbest';d.calisiyor=true;d.bitis=Date.now()+d.kalan;if(d.mod==='odak'&&!d.ders)d.ders=$('pm-ders').value;kaydet();sesGuncelle();ciz();}
  // --- dugme incelikleri: titresim, cift dokunma korumasi, basili tutarak bitir ---
  function titre(ms){try{if(navigator.vibrate)navigator.vibrate(ms);}catch(e){}}
  var sonBas=0,tutSon=0,tutOk=false,tutT=null,ipT=null,sf=$('pm-sifir');
  [].forEach.call(document.querySelectorAll('.pm-dugmeler button,#pm-muzik'),function(b){b.addEventListener('pointerdown',function(){titre(10);});b.addEventListener('contextmenu',function(e){e.preventDefault();});});
  function tutBirak(){if(!tutT)return;clearTimeout(tutT);tutT=null;sf.classList.remove('basili');
    var ip=$('pm-tut-ip');ip.classList.add('acik');clearTimeout(ipT);ipT=setTimeout(function(){ip.classList.remove('acik');},1800);}
  sf.addEventListener('pointerdown',function(e){if(!sf.classList.contains('tut')||e.button>0)return;
    $('pm-tut-ip').classList.remove('acik');sf.classList.add('basili');
    tutT=setTimeout(function(){tutT=null;sf.classList.remove('basili');titre([30,40,30]);tutOk=true;sf.click();tutSon=Date.now();},350);});
  ['pointerup','pointerleave','pointercancel'].forEach(function(t){sf.addEventListener(t,tutBirak);});
  $('pm-basla').addEventListener('click',function(){
    var simdiB=Date.now();if(simdiB-sonBas<500)return;sonBas=simdiB;
    if(d.calisiyor){d.kalan=kalanMs();d.calisiyor=false;d.bitis=null;kaydet();sesGuncelle();ciz();}
    else{if(d.kalan===d.toplam)d.ders=$('pm-ders').value;basla();}
  });
  $('pm-sifir').addEventListener('click',function(e){
    if(!tutOk&&Date.now()-tutSon<700)return;
    if(sf.classList.contains('tut')&&!tutOk&&e.detail!==0)return;tutOk=false;
    if(!calismaMi(d.mod)){molaAtla(true);return;}
    if(araMi()){alarmDurdur();d.faz=2;d.toplam=d.kalan=sure('deneme');d.calisiyor=false;d.bitis=null;basla();return;}
    if(d.mod==='deneme'&&(kalanMs()!==d.toplam||d.faz)){if(d.calisiyor){d.kalan=kalanMs();d.calisiyor=false;d.bitis=null;}denemeBitti(false);return;}
    var erkenDk=0,erkenDers='',sbE=!!d.serbest&&d.mod==='odak';
    if(d.mod==='odak'&&kalanMs()!==d.toplam){erkenDk=(d.toplam-kalanMs())/60000;erkenDers=d.ders||$('pm-ders').value;odakKaydet(false);}
    d.kalan=d.toplam=sure(d.mod);d.calisiyor=false;d.bitis=null;d.ders='';d.serbest=false;kaydet();sesGuncelle();ciz();
    if(erkenDk>=1)erkenBitti(erkenDk,erkenDers,sbE);
  });
  var mb=kok.querySelectorAll('.pm-mod button');for(var i=0;i<mb.length;i++)mb[i].addEventListener('click',function(){modSec(this.getAttribute('data-m'));});
  function ozelNot(){if($('pm-odak').value==='serbest'){$('pm-sure-not').textContent='Süre ileri sayar · bitirmek için Bitir’e basılı tut · 90 dk’da bir mola hatırlatması';return;}var o=odakDk(),mo=molaDk(o);$('pm-sure-not').textContent='Mola '+mo+' dk · 4 turda bir uzun mola '+Math.min(mo*3,30)+' dk';}
  function sureDegisti(){ayarKaydet();ozelNot();if(!d.calisiyor&&d.mod!=='deneme'&&d.kalan===d.toplam){d.toplam=d.kalan=sure(d.mod);kaydet();}ciz();}
  $('pm-odak').addEventListener('change',sureDegisti);
  $('pm-ozel').addEventListener('input',sureDegisti);
  $('pm-ozel').addEventListener('change',function(){$('pm-ozel').value=odakDk();sureDegisti();});
  ozelNot();
  // --- cip secicileri (gizli select'leri yonetir; mantik ayni kalir) ---
  var CIP_AD={'25':'25 dk','40':'40 dk','ozel':'Özel','serbest':'∞'};
  function cipKur(sid,kid){
    var sel=$(sid),kap=$(kid);
    [].forEach.call(sel.options,function(o){var b=document.createElement('button');b.type='button';b.setAttribute('role','radio');b.dataset.v=o.value;b.textContent=CIP_AD[o.value]||o.text;
      b.addEventListener('click',function(){if(sel.disabled||sel.value===o.value)return;sel.value=o.value;sel.dispatchEvent(new Event('change'));cipGuncelle();});kap.appendChild(b);});
  }
  var seansDurum=false,seansT=null;
  function seansGizle(g){if(g===seansDurum)return;seansDurum=g;clearTimeout(seansT);
    var el=['pm-ders-k','pm-odak-k','pm-ozel-k'].map($).filter(Boolean);
    if(window.LV_KATLA){el.forEach(function(e){LV_KATLA(e,g);});return;}
    el.forEach(function(e){e.classList.toggle('seans-gizli',g);});}
  function cipGuncelle(){
    [['pm-ders','pm-ders-c'],['pm-odak','pm-odak-c']].forEach(function(x){var sel=$(x[0]);
      [].forEach.call($(x[1]).children,function(b){var on=b.dataset.v===sel.value;b.classList.toggle('on',on);b.setAttribute('aria-checked',on);b.disabled=sel.disabled;});});
  }
  cipKur('pm-ders','pm-ders-c');cipKur('pm-odak','pm-odak-c');cipGuncelle();
  (function(){var b=$('pm-ders-c').querySelector('.on');if(b)$('pm-ders-c').scrollLeft=Math.max(0,b.offsetLeft-$('pm-ders-c').offsetLeft-16);})();
  $('pm-sinav').addEventListener('change',function(){ayarKaydet();if(d.mod==='deneme'&&!d.calisiyor){d.toplam=d.kalan=sure('deneme');kaydet();}ciz();});
  $('pm-ses').addEventListener('change',function(){ayarKaydet();sesGuncelle();sesArayuz();});
  // --- muzik butonu ve alt pencere ---
  var SES_K=[['','<svg class="ic" aria-hidden="true"><use href="#i-ses-kapali"/></svg>','Kapalı','Sessiz çalış'],['yagmur','<svg class="ic" aria-hidden="true"><use href="#i-yagmur"/></svg>','Yağmur','Gök gürültüsü ve şömine'],['kozmik','<svg class="ic" aria-hidden="true"><use href="#i-yildizlar"/></svg>','Kozmik','Uzay ambiyansı'],['kahve','<svg class="ic" aria-hidden="true"><use href="#i-dalga"/></svg>','Kahverengi gürültü','Derin ve yumuşak'],['beyaz','<svg class="ic" aria-hidden="true"><use href="#i-daire"/></svg>','Beyaz gürültü','Dış sesleri bastırır'],['debussy','<svg class="ic" aria-hidden="true"><use href="#i-nota"/></svg>','Debussy','Sakin piyano · 5 parça']];
  SES_K.forEach(function(x){var b=document.createElement('button');b.type='button';b.setAttribute('role','radio');b.dataset.v=x[0];if(!x[0])b.className='kapali';
    b.innerHTML='<em>'+x[1]+'</em><span><b>'+x[2]+'</b><br><small>'+x[3]+'</small></span>';
    b.addEventListener('click',function(){var sel=$('pm-ses');if(sel.value===x[0])return;sel.value=x[0];sel.dispatchEvent(new Event('change'));});
    $('ses-kartlar').appendChild(b);});
  function sesArayuz(){
    var v=$('pm-ses').value,sv=+$('pm-seviye').value;
    [].forEach.call($('ses-kartlar').children,function(b){var on=b.dataset.v===v;b.classList.toggle('on',on);b.setAttribute('aria-checked',on);});
    $('pm-seviye').style.setProperty('--p',sv+'%');$('ses-yuzde').textContent='%'+sv;
    $('pm-seviye').closest('.ses-sev-s').classList.toggle('pasif',!v);
    var ad='Kapalı';SES_K.forEach(function(x){if(x[0]===v)ad=x[2];});
    $('ses-durum').textContent=v?(ad+' · %'+sv):'Kapalı';sesKunye();
    $('pm-muzik').classList.toggle('on',!!v);$('pm-muzik').setAttribute('aria-label','Arka plan sesi: '+ad);
  }
  var sp=$('pm-ses-p');
  function sesAc(){sesOnizle=true;sp.classList.add('acik');sesArayuz();requestAnimationFrame(function(){requestAnimationFrame(function(){sp.classList.add('gor');});});sesGuncelle();}
  function sesKapat(){sesOnizle=false;sp.classList.remove('gor');setTimeout(function(){sp.classList.remove('acik');},280);sesGuncelle();}
  $('pm-muzik').addEventListener('click',sesAc);$('ses-tamam').addEventListener('click',sesKapat);
  sp.addEventListener('click',function(e){if(e.target===sp)sesKapat();});
  $('pm-seviye').addEventListener('input',sesArayuz);
  sesArayuz();
  $('pm-seviye').addEventListener('input',function(){ayarKaydet();hedefSes=+this.value/100;if(aktifSes&&!fadeT)aktifSes.volume=hedefSes;});
  $('pm-ders').addEventListener('change',function(){ayarKaydet();if(!d.calisiyor||d.mod!=='odak'){d.ders='';}ciz();});
  var sk=kok.querySelectorAll('.pm-sekme button');for(var s=0;s<sk.length;s++)sk[s].addEventListener('click',function(){ARALIK=this.getAttribute('data-a');for(var z=0;z<sk.length;z++)sk[z].classList.toggle('aktif',sk[z]===this);istatistik();});
  // --- kayit silme: ozel onay + 10 sn geri al + 30 gun cop kutusu ---
  var COP_K='mf-cop',COP_GUN=30,toastT=null;
  function birlestir(a,b){a=JSON.parse(JSON.stringify(a||{}));for(var g in b){var x=b[g];if(!a[g]){a[g]=JSON.parse(JSON.stringify(x));continue;}
    var y=a[g];y.dk=(y.dk||0)+(x.dk||0);y.p=(y.p||0)+(x.p||0);if(x.c)y.c=(y.c||0)+x.c;y.d=y.d||{};for(var z in (x.d||{}))y.d[z]=(y.d[z]||0)+x.d[z];}return a;}
  function copOku(){var c=oku(COP_K,null);if(c&&Date.now()-c.t>COP_GUN*864e5){try{localStorage.removeItem(COP_K);}catch(e){}return null;}return c;}
  function copArayuz(){var c=copOku(),b=$('pm-gerial');if(!c){b.hidden=true;return;}
    var kal=Math.max(1,COP_GUN-Math.floor((Date.now()-c.t)/864e5));b.hidden=false;b.textContent='↩︎ Silinen kayıtları geri getir ('+kal+' gün kaldı)';}
  function toast(m,geri){var t=$('mf-toast');$('mf-toast-m').textContent=m;$('mf-toast-b').hidden=!geri;t.classList.add('acik');clearTimeout(toastT);toastT=setTimeout(function(){t.classList.remove('acik');},geri?10000:3500);}
  function geriGetir(){var c=copOku();if(!c)return;yaz(KAYIT_K,birlestir(oku(KAYIT_K,{}),c.k));try{localStorage.removeItem(COP_K);}catch(e){}
    istatistik();if(window.MF_PR)window.MF_PR();copArayuz();$('mf-toast').classList.remove('acik');toast('Kayıtların geri geldi ✓',false);}
  $('pm-temizle').addEventListener('click',function(){
    var k=oku(KAYIT_K,{}),gunS=0,dk=0;for(var g in k){if(k[g].dk>0){gunS++;dk+=k[g].dk;}}
    if(!gunS){toast('Silinecek kayıt yok.',false);return;}
    $('sil-ozet').innerHTML='<b>'+gunS+' günlük</b>, toplam <b>'+sureYaz(dk)+'</b> çalışma kaydın silinecek.';
    $('sil-p').classList.add('acik');
  });
  $('sil-vazgec').addEventListener('click',function(){$('sil-p').classList.remove('acik');});
  $('sil-p').addEventListener('click',function(e){if(e.target===this)this.classList.remove('acik');});
  $('sil-tamam').addEventListener('click',function(){
    var c=copOku(),k=oku(KAYIT_K,{});yaz(COP_K,{t:Date.now(),k:birlestir(c?c.k:{},k)});yaz(KAYIT_K,{});
    $('sil-p').classList.remove('acik');istatistik();if(window.MF_PR)window.MF_PR();copArayuz();toast('Çalışma kayıtların silindi.',true);
  });
  $('mf-toast-b').addEventListener('click',geriGetir);
  $('pm-gerial').addEventListener('click',geriGetir);
  copArayuz();
  window.MF_KILIT_EYLEM=function(e){if(e==='duraklat'&&d.calisiyor)$('pm-basla').click();else if(e==='devam'&&!d.calisiyor)$('pm-basla').click();};
  if('mediaSession' in navigator){try{navigator.mediaSession.setActionHandler('pause',function(){if(d.calisiyor)$('pm-basla').click();});navigator.mediaSession.setActionHandler('play',function(){if(!d.calisiyor)$('pm-basla').click();});}catch(e){}}

  function sureYaz(dk){dk=Math.round(dk);var h=Math.floor(dk/60),m=dk%60;return h?(h+' sa'+(m?' '+m+' dk':'')):(m+' dk');}
  function rapor(){
    var k=oku(KAYIT_K,{}),x=k[gun(Date.now())]||{dk:0,p:0,d:{}},bu=new Date();
    var m=T.rBaslik+' ('+bu.getDate()+' '+T.aylar[bu.getMonth()]+')\n';
    if(!x.dk){m+=T.rBos;}
    else{
      m+=T.rToplam+': '+sureYaz(x.dk)+' · '+x.p+' tur\n';
      var lt={},l=[];for(var z in x.d)lt[dersAd(z)]=(lt[dersAd(z)]||0)+x.d[z];for(var z2 in lt)l.push([z2,lt[z2]]);l.sort(function(a,b){return b[1]-a[1];});
      for(var n=0;n<l.length;n++)m+='• '+l[n][0]+': '+sureYaz(l[n][1])+'\n';
      if(x.c)m+='! '+T.rCikis+': '+x.c+'\n';
    }
    return m;
  }

  var wl=null,wlBekle=false;
  function sikiMi(){var c=$('pm-siki');return !!(c&&c.checked);}
  function ekranAcik(){
    var gerek=sikiMi()&&sikiAktif()&&!document.hidden;
    if(gerek&&!wl&&!wlBekle&&navigator.wakeLock){wlBekle=true;navigator.wakeLock.request('screen').then(function(w){wl=w;wlBekle=false;w.addEventListener('release',function(){wl=null;});}).catch(function(){wlBekle=false;});}
    else if(!gerek&&wl){try{wl.release();}catch(e){}wl=null;}
  }
  function curut(cikis){
    var basla=d.bitis-d.toplam,dk=Math.max(0,(cikis-basla)/60000),ders=d.mod==='deneme'?SINAV[sinavKod()].ad+' Deneme':(d.ders||$('pm-ders').value);
    kayitEkle(dk,ders,false,d.mod==='deneme');
    var k=oku(KAYIT_K,{}),g=gun(Date.now());if(!k[g])k[g]={dk:0,p:0,d:{}};k[g].c=(k[g].c||0)+1;yaz(KAYIT_K,k);
    d.faz=null;d.lgsDk=0;d.kalan=d.toplam=sure(d.mod);d.calisiyor=false;d.bitis=null;d.cikis=0;d.ders='';kaydet();sesGuncelle();ciz();
    $('pm-curu-b').textContent=T.curuB;$('pm-curu-p').textContent=T.curuP.replace('{dk}',Math.round(dk));
    $('pm-curu').classList.add('acik');
    if(navigator.vibrate)navigator.vibrate([200,100,200]);
  }
  // --- kilit ekranini ayirt etme (Idle Detection) ---
  // Ekran kilitliyken gecen sure "uygulama disi" sayilmaz; sadece baska bir seyle ugrasilan sure sayilir.
  var idl=null,kilitBas=0,kilitTop=0;
  function idleKur(){
    if(idl||!('IdleDetector' in window))return;
    try{idl=new IdleDetector();
      idl.addEventListener('change',function(){var k=idl.screenState==='locked',t=Date.now();
        if(k&&!kilitBas){kilitBas=(d.cikis&&t-d.cikis<15000)?d.cikis:t;}
        else if(!k&&kilitBas){kilitTop+=t-kilitBas;kilitBas=0;}});
      idl.start({threshold:60000}).catch(function(){idl=null;});
    }catch(e){idl=null;}
  }
  function idleIzin(istek){
    if(!('IdleDetector' in window)){idleNot();return;}
    if(istek){try{navigator.permissions.query({name:'idle-detection'}).then(function(p){
        if(p.state==='granted'){idleKur();idleNot();return;}
        if(p.state==='denied'){idleNot();return;}
        setTimeout(function(){if($('pm-siki').checked)$('sik-izn').classList.add('acik');},2300);
      }).catch(function(){idleNot();});}catch(e){}return;}
    try{navigator.permissions.query({name:'idle-detection'}).then(function(p){if(p.state==='granted')idleKur();idleNot();}).catch(function(){});}catch(e){}
  }
  function idleNot(){var n=$('sik-izin');if(!n)return;
    if(!('IdleDetector' in window)){n.hidden=false;n.textContent='Bu telefonda kilit ekranı otomatik anlaşılamıyor. Uygulamaya döndüğünde telefonu kilitleyip kilitlemediğin sorulacak.';return;}
    try{navigator.permissions.query({name:'idle-detection'}).then(function(p){n.hidden=p.state==='granted';
      n.textContent=p.state==='denied'?'Kilit ekranını ayırt etme izni kapalı. Uygulamaya döndüğünde telefonu kilitleyip kilitlemediğin sorulacak.':'Telefonu kilitlemenin çıkış sayılmaması için gelen izin sorusuna “İzin ver” de.';}).catch(function(){});}catch(e){}
  }
  function cikisKontrol(){
    if(!d.cikis)return;var c=d.cikis,simdi=Date.now();d.cikis=0;kaydet();
    var kilitli=kilitTop+(kilitBas?simdi-Math.max(kilitBas,c):0),disari=simdi-c-kilitli;
    kilitTop=0;
    if(!(sikiAktif()&&d.bitis>c+10000))return;
    if(idl){if(disari>10000)curut(c);return;}
    // kilit otomatik anlasilamiyor (iPhone, izin yok): ogrenciye sor
    var uzak=simdi-c;if(uzak<=10000||$('sik-sor').classList.contains('acik'))return;
    var dk=Math.floor(uzak/60000);
    $('sik-sor-p').textContent='Sıkı moddayken '+(dk>=1?dk+' dakika':Math.round(uzak/1000)+' saniye')+' uygulamanın dışındaydın. Telefonu kilitleyip bıraktıysan turun devam eder.';
    sikSorC=c;$('sik-sor').classList.add('acik');
  }
  var sikSorC=0;
  $('sik-sor-kilit').addEventListener('click',function(){$('sik-sor').classList.remove('acik');sikSorC=0;});
  $('sik-sor-baktim').addEventListener('click',function(){$('sik-sor').classList.remove('acik');var c=sikSorC;sikSorC=0;if(c&&sikiAktif())curut(c);});
  document.addEventListener('visibilitychange',function(){
    if(document.hidden){if(sikiMi()&&sikiAktif()){d.cikis=Date.now();kilitTop=0;kaydet();}}
    else{cikisKontrol();ekranAcik();}
  });
  $('pm-curu-tamam').addEventListener('click',function(){$('pm-curu').classList.remove('acik');});
  $('pm-siki').checked=!!ayar.siki;
  function sikDurum(){var on=$('pm-siki').checked;$('pm-sik-k').classList.toggle('on',on);$('pm-sik-durum').textContent=on?'Açık':'Kapalı';}
  // kedi -> aslan evrimi
  var evT=[],haleEl=document.querySelector('.aslan-hale'),evrSur=false;
  function haleYak(v){haleEl.style.transition='opacity .03s linear';haleEl.style.opacity=v;}
  function haleBitir(){haleEl.style.transition='';haleEl.style.opacity='';}
  function evDur(){evT.forEach(clearTimeout);evT=[];var sh=$('sik-sahne');sh.classList.remove('evr','titre','flas','gel','geri');
    if(evrSur){evrSur=false;haleBitir();document.body.classList.remove('hale-patla');try{if(navigator.vibrate)navigator.vibrate(0);}catch(e){}}}
  window.MF_EVR=function(){return evrSur;};
  function evrim(ac){
    var sh=$('sik-sahne'),ik=$('sik-hayvan');evDur();
    var az=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(az||$('pm-sik-ic').hidden){sh.dataset.g=ac?'a':'k';ik.classList.toggle('as',ac);return;}
    if(!ac){sh.dataset.g='k';void sh.offsetWidth;sh.classList.add('geri');evT.push(setTimeout(function(){sh.classList.remove('geri');},600));ik.classList.remove('as');return;}
    // hale evrimle ayni ritimde yanip soner, aslan ciktiginda parlar ve kalici olur
    evrSur=true;
    sh.dataset.g='k';sh.classList.add('evr');
    haleEl.style.transition='opacity .4s ease-in';haleEl.style.opacity='.3';
    var t=420,ara=[230,200,170,140,115,95,80,68,58,50,44,40,36];
    // titresim: halenin yanip sonmesiyle ayni zaman cizelgesi; parlaklik arttikca titresim uzar, sonda patlama ve sonumlenme
    try{if(navigator.vibrate){var vp=[0],bas0=t,yer=t,tz=t;ara.forEach(function(a){tz+=a;});var son0=tz+60,kenar=[];
      var tt=t;ara.forEach(function(a){tt+=a;kenar.push(tt);});kenar.push(son0);
      var bos=kenar[0];
      for(var i=0;i<ara.length;i++){var d=kenar[i+1]-kenar[i];
        if(i%2===0){var on=Math.max(18,Math.round(d*(.45+.55*i/(ara.length-1))));vp.push(bos,on);bos=d-on;}else bos+=d;}
      vp.push(bos,420,70,220,90,150,120,95,150,60,190,35);
      navigator.vibrate(vp);}}catch(e){}
    evT.push(setTimeout(function(){sh.classList.add('titre');},t));
    ara.forEach(function(a,i){t+=a;evT.push(setTimeout(function(){var asl=i%2===0;sh.dataset.g=asl?'a':'k';haleYak(asl?(.55+i*.035).toFixed(2):'.12');},t));});
    t+=60;evT.push(setTimeout(function(){sh.dataset.g='a';sh.classList.remove('evr','titre');void sh.offsetWidth;sh.classList.add('flas','gel');ik.classList.add('as');
      evrSur=false;haleBitir();document.body.classList.add('hale-patla');},t));
    evT.push(setTimeout(function(){sh.classList.remove('flas','gel');document.body.classList.remove('hale-patla');},t+1800));
  }
  $('sik-izn-devam').addEventListener('click',function(){$('sik-izn').classList.remove('acik');
    try{IdleDetector.requestPermission().then(function(p){if(p==='granted')idleKur();idleNot();}).catch(function(){idleNot();});}catch(e){idleNot();}});
  $('sik-izn-sonra').addEventListener('click',function(){$('sik-izn').classList.remove('acik');idleNot();});
  $('pm-siki').addEventListener('change',function(){ayarKaydet();ekranAcik();sikDurum();evrim(this.checked);if(this.checked)idleIzin(true);});
  if($('pm-siki').checked)idleIzin(false);
  $('pm-sik-bas').addEventListener('click',function(){var ac=this.getAttribute('aria-expanded')!=='true';this.setAttribute('aria-expanded',ac);$('pm-sik-ic').hidden=!ac;});
  sikDurum();(function(){var on=$('pm-siki').checked;$('sik-sahne').dataset.g=on?'a':'k';$('sik-hayvan').classList.toggle('as',on);})();
  setInterval(ekranAcik,2000);
  cikisKontrol();
  var acc=$('pm-acc');if(acc){try{acc.open=localStorage.getItem('mf-kayit-acik')==='1';}catch(e){}
    acc.addEventListener('toggle',function(){try{localStorage.setItem('mf-kayit-acik',acc.open?'1':'0');}catch(e){}});}
  function tik(){if(d.calisiyor&&kalanMs()<=0)bitti();else ciz();}
  setInterval(tik,1000);
  document.addEventListener('visibilitychange',tik);
  // --- deneme sonucu ---
  var DNM_K='mf-denemeler',dnmS=null;
  function dnmSayi(el){var v=el.value;return v===''?null:Math.max(0,Math.min(999,Math.floor(+v)||0));}
  function netYaz(n){return (Math.round(n*100)/100).toString().replace('.',',');}
  function dnmHesap(){
    var top=0,dolu=false,hata='';
    [].forEach.call(document.querySelectorAll('#dnm-satirlar .dnm-s'),function(r){
      var i=r.querySelectorAll('input'),dd=dnmSayi(i[0]),yy=dnmSayi(i[1]),mx=+r.getAttribute('data-n');
      var h=(dd||0)+(yy||0)>mx;r.classList.toggle('hata',h);if(h)hata='Doğru + yanlış, dersin soru sayısını geçemez.';
      if(dd!==null||yy!==null)dolu=true;var cz=dnmS&&dnmS.kod==='OZEL'?dnmS.ceza:((SINAV[dnmS&&dnmS.kod]||{}).ceza||4);var n=(dd||0)-(cz?(yy||0)/cz:0);top+=n;r.querySelector('b').textContent=(dd!==null||yy!==null)?netYaz(n):'–';
    });
    $('dnm-top').textContent=netYaz(top);$('dnm-hata').textContent=hata;$('dnm-kaydet').disabled=!dolu||!!hata;return top;
  }
  function ozelAyar(){return {ders:$('dnm-o-ders').value,n:Math.max(1,Math.min(200,Math.floor(+$('dnm-o-n').value)||20)),ceza:+$('dnm-o-ceza').value};}
  function dnmSatir(kod){var sv=SINAV[kod];
    $('dnm-ozel').hidden=kod!=='OZEL';
    if(kod==='OZEL'){var oa=ozelAyar();dnmS.ceza=oa.ceza;sv={ad:'Branş',d:[['ozel',oa.ders,oa.n]]};}
    $('dnm-satirlar').innerHTML=sv.d.map(function(x){return '<div class="dnm-s" data-k="'+x[0]+'" data-n="'+x[2]+'"><span>'+x[1]+'<small>'+x[2]+' soru</small></span><input type="number" inputmode="numeric" min="0" max="'+x[2]+'"><input type="number" inputmode="numeric" min="0" max="'+x[2]+'"><b>–</b></div>';}).join('');
    [].forEach.call(document.querySelectorAll('#dnm-satirlar input'),function(el){el.addEventListener('input',dnmHesap);});
    dnmHesap();
  }
  function bugunISO(){var t=new Date();return t.getFullYear()+'-'+('0'+(t.getMonth()+1)).slice(-2)+'-'+('0'+t.getDate()).slice(-2);}
  function dnmAc(kod,dk,dis){
    var sv=SINAV[kod];dnmS={kod:kod,dk:dk,tarih:new Date().toISOString(),dis:!!dis};if(!dis)yaz('mf-dnm-bekleyen',dnmS);
    $('dnm-dis').hidden=!dis;$('dnm-gec').textContent=dis?'Vazgeç':'Şimdi değil';
    $('dnm-alt').textContent=dis?'Okulda, dershanede ya da kağıt üzerinde çözdüğün denemeyi ekle.':sv.ad+' · '+dk+' dk';$('dnm-ad').value='';
    if(dis){$('dnm-sinav').value=kod;var bi=bugunISO();$('dnm-tarih').value=bi;$('dnm-tarih').max=bi;}
    dnmSatir(kod);$('pm-dnm').classList.add('acik');
  }
  $('dnm-sinav').addEventListener('change',function(){if(!dnmS)return;dnmS.kod=this.value;dnmSatir(this.value);});
  (function(){var oz=oku('mf-dnm-ozel',null);if(oz){$('dnm-o-ders').value=oz.ders;$('dnm-o-n').value=oz.n;$('dnm-o-ceza').value=String(oz.ceza);}})();
  function ozelGuncelle(){if(!dnmS||dnmS.kod!=='OZEL')return;var oa=ozelAyar(),sr=document.querySelector('#dnm-satirlar .dnm-s');if(!sr)return;dnmS.ceza=oa.ceza;
    sr.setAttribute('data-n',oa.n);sr.querySelector('span').innerHTML=oa.ders+'<small>'+oa.n+' soru</small>';[].forEach.call(sr.querySelectorAll('input'),function(i){i.max=oa.n;});dnmHesap();}
  ['dnm-o-ders','dnm-o-ceza'].forEach(function(id){$(id).addEventListener('change',ozelGuncelle);});$('dnm-o-n').addEventListener('input',ozelGuncelle);
  $('dnm-ekle').addEventListener('click',function(){var son=oku('mf-dnm-son','TYT');dnmAc((SINAV[son]||son==='OZEL')?son:'TYT',0,true);});
  function dnmKapat(){dnmS=null;try{localStorage.removeItem('mf-dnm-bekleyen');}catch(e){}$('pm-dnm').classList.remove('acik');}
  $('dnm-gec').addEventListener('click',dnmKapat);
  $('dnm-kaydet').addEventListener('click',function(){
    if(!dnmS)return;var top=dnmHesap(),dersler={};
    [].forEach.call(document.querySelectorAll('#dnm-satirlar .dnm-s'),function(r){var i=r.querySelectorAll('input'),dd=dnmSayi(i[0]),yy=dnmSayi(i[1]);
      if(dd!==null||yy!==null)dersler[r.getAttribute('data-k')]={d:dd||0,y:yy||0};});
    var tarih=dnmS.tarih;
    if(dnmS.dis){var tv=$('dnm-tarih').value;if(tv&&tv!==bugunISO()){var pp=tv.split('-');tarih=new Date(+pp[0],+pp[1]-1,+pp[2],12).toISOString();}yaz('mf-dnm-son',dnmS.kod);}
    var kayit={tarih:tarih,sinav:dnmS.kod,ad:$('dnm-ad').value.trim().slice(0,50),dk:dnmS.dk||0,net:Math.round(top*100)/100,dersler:dersler},kocK=kayit;
    if(dnmS.kod==='OZEL'){var oa=ozelAyar();kayit.ozel=oa;yaz('mf-dnm-ozel',oa);var dy=dersler.ozel||{d:0,y:0};
      // koc tablosu icin: tablodaki hazir sutunlara uygun bicim (net tabloda dogru hesaplansin)
      var KK={'Matematik':'tmat','Geometri':'tmat','Türkçe':'tur','Fen Bilimleri':'fen','Fizik':'fiz','Kimya':'kim','Biyoloji':'bio','Sosyal Bilgiler':'sos','TYT Fen':'fen','TYT Sosyal':'sos','T.C. İnkılap Tarihi':'sos','Tarih':'tar1','Coğrafya':'cog1','Edebiyat':'edb','Felsefe':'fel','Din Kültürü':'din','İngilizce':'ydl'};
      var kd={};kd[KK[oa.ders]||'tmat']={d:dy.d,y:oa.ceza?dy.y:0};
      kocK={tarih:tarih,sinav:((oa.ceza===3?'LGS Branş: ':'Branş: ')+oa.ders).slice(0,20),ad:((kayit.ad?kayit.ad+' · ':'')+oa.n+' soru · '+dy.d+'D '+dy.y+'Y'+(oa.ceza?'':' (yanlış götürmez)')).slice(0,50),dk:0,net:kayit.net,dersler:kd};}
    var l=oku(DNM_K,[]);l.push(kayit);l.sort(function(a,b){return new Date(a.tarih)-new Date(b.tarih);});yaz(DNM_K,l.slice(-100));
    if(window.MF_KOC_DENEME)window.MF_KOC_DENEME(kocK);
    dnmKapat();dnmListe();var a=$('pm-dnm-acc');if(a)a.open=true;
  });
  function grup(x){return x.sinav==='OZEL'&&x.ozel?('OZEL|'+x.ozel.ders+'|'+x.ozel.n):x.sinav;}
  function dnmGruplar(l){var G={},sira=[];
    l.forEach(function(x){var k=grup(x),g=G[k];
      if(!g){var sv,dl,cz;if(x.sinav==='OZEL'&&x.ozel){sv={ad:x.ozel.ders+' branş · '+x.ozel.n+' soru'};dl=[['ozel',x.ozel.ders,x.ozel.n]];cz=x.ozel.ceza;}
        else{sv=SINAV[x.sinav];if(!sv)return;dl=sv.d;cz=sv.ceza||4;}
        g=G[k]={k:k,ad:sv.ad,d:dl,ceza:cz,top:dl.reduce(function(a,b){return a+b[2];},0),l:[]};}
      var dn={};g.d.forEach(function(dd){var v=(x.dersler||{})[dd[0]];dn[dd[0]]=v?Math.round(((v.d||0)-(g.ceza?(v.y||0)/g.ceza:0))*100)/100:null;});
      g.l.push({t:x.tarih,net:x.net,ad:x.ad||'',dn:dn});});
    Object.keys(G).forEach(function(k){sira.push(G[k]);});
    sira.sort(function(a,b){return new Date(b.l[b.l.length-1].t)-new Date(a.l[a.l.length-1].t);});return sira;}
  window.MF_DNM_YENILE=function(){if(window.MF_DNM_CIZ)window.MF_DNM_CIZ(dnmGruplar(oku(DNM_K,[])));};
  function dnmListe(){
    window.MF_DNM_YENILE();
    var l=oku(DNM_K,[]),el=$('pm-dnm-liste');if(!el)return;
    $('pm-dnm-o').textContent=l.length?(l.length+' deneme'):'';
    if(!l.length){el.innerHTML='<p class="pm-kucuk" style="margin:0">Henüz deneme yok. Çalışma ekranında <b><svg class="ic" aria-hidden="true"><use href="#i-deneme"/></svg>Deneme</b> sekmesiyle çöz ya da dışarıda çözdüğün denemeyi yukarıdaki butonla ekle.</p>';return;}
    var son={},satir=[];
    l.forEach(function(x){var g=grup(x),o=son[g];x._f=(o===undefined)?null:x.net-o;son[g]=x.net;});
    l.slice().reverse().slice(0,20).forEach(function(x){
      var t=new Date(x.tarih),sv=x.sinav==='OZEL'&&x.ozel?{ad:x.ozel.ders+' branş · '+x.ozel.n+' soru'}:(SINAV[x.sinav]||{ad:x.sinav}),f='';
      if(x._f!==null&&x._f!==0)f='<i class="'+(x._f>0?'art':'azal')+'">'+(x._f>0?'▲ +':'▼ ')+netYaz(x._f)+'</i>';
      var ad=(x.ad||'').replace(/[<>&"]/g,'');
      satir.push('<div class="dnm-l"><div>'+sv.ad+(ad?' · '+ad:'')+'<small>'+t.getDate()+' '+T.aylar[t.getMonth()]+' '+t.getFullYear()+'</small></div><b>'+netYaz(x.net)+' net'+f+'</b></div>');
    });
    el.innerHTML=satir.join('');
  }
  dnmListe();
  (function(){var b=oku('mf-dnm-bekleyen',null);if(b&&Date.now()-new Date(b.tarih).getTime()<24*3600000&&SINAV[b.kod])dnmAc(b.kod,b.dk);else if(b){try{localStorage.removeItem('mf-dnm-bekleyen');}catch(e){}}})();
  // --- haftalik program ---
  (function(){
    var PR_K='mf-program',GUNLER=['Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi','Pazar'],GK=['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'];
    var pr=oku(PR_K,null);if(!pr||!pr.g)pr={g:[[],[],[],[],[],[],[]]};
    function prYaz(){yaz(PR_K,pr);}
    function bugunI(){return (new Date().getDay()+6)%7;}
    var secGun=bugunI(),gunZip=false;
    function gunTarih(i){var t=new Date();t.setHours(12,0,0,0);t.setDate(t.getDate()-bugunI()+i);return t.getTime();}
    function yapilan(i,ders){var k=oku(KAYIT_K,{}),x=k[gun(gunTarih(i))],t=0;if(x&&x.d)for(var z in x.d)if(dersAd(z)===ders)t+=x.d[z];return t;}
    function gunOzet(i){var hed=0,yap=0;pr.g[i].forEach(function(o){hed+=o.dk;yap+=Math.min(o.dk,yapilan(i,o.ders));});return {hed:hed,yap:yap};}
    function sk(dk){dk=Math.round(dk);var h=Math.floor(dk/60),m=dk%60;return h?(h+' sa'+(m?' '+m+' dk':'')):(m+' dk');}
    var OYNAT='<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>',TIK='<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>';
    var GEC_K='mf-program-gecmis';
    function pzt(off){var t=new Date();t.setHours(12,0,0,0);t.setDate(t.getDate()-bugunI()+off*7);return t;}
    function anlik(){var g=oku(GEC_K,{}),key=gun(pzt(0).getTime()),bos=!pr.g.some(function(x){return x.length;});
      if(bos&&!g[key])return;g[key]=JSON.parse(JSON.stringify(pr.g));
      var ks=Object.keys(g).sort(function(a,b){return new Date(a.replace(/-/g,'/'))-new Date(b.replace(/-/g,'/'));});while(ks.length>60)delete g[ks.shift()];yaz(GEC_K,g);}
    function yapTarih(t,ders,k){var x=k[gun(t)],y=0;if(x&&x.d)for(var z in x.d)if(dersAd(z)===ders)y+=x.d[z];return y;}
    var AYK=['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
    function gecmisCiz(){
      var g=oku(GEC_K,{}),k=oku(KAYIT_K,{}),bu=gun(pzt(0).getTime()),satir=[],tops=[];
      var ks=Object.keys(g).map(function(x){var p=x.split('-');return [x,new Date(+p[0],+p[1]-1,+p[2],12)];}).sort(function(a,b){return b[1]-a[1];}).slice(0,52);
      ks.forEach(function(e){var plan=g[e[0]],hed=0,yap=0;
        for(var j=0;j<7;j++){var t=new Date(e[1]);t.setDate(t.getDate()+j);(plan[j]||[]).forEach(function(o){hed+=o.dk;yap+=Math.min(o.dk,yapTarih(t.getTime(),o.ders,k));});}
        if(!hed)return;var yz=Math.round(yap*100/hed),son=new Date(e[1]);son.setDate(son.getDate()+6);
        var ad=e[1].getMonth()===son.getMonth()?(e[1].getDate()+'–'+son.getDate()+' '+T.aylar[son.getMonth()]):(e[1].getDate()+' '+AYK[e[1].getMonth()]+' – '+son.getDate()+' '+AYK[son.getMonth()]);
        var buMu=e[0]===bu;if(!buMu)tops.push(yz);
        satir.push('<div class="prg-s'+(yz>=100?' tam':'')+'"><div class="prg-u"><span>'+ad+(buMu?'<small>Bu hafta</small>':'')+'</span><b>%'+yz+'</b></div><div class="prg-bar"><i style="width:'+Math.min(100,yz)+'%"></i></div><small>'+sk(yap)+' / '+sk(hed)+(yz>=100?' · tamamlandı':'')+'</small></div>');});
      $('pm-prg-liste').innerHTML=satir.length?satir.join(''):'<p class="pm-kucuk" style="margin:0">Henüz geçmiş yok. Program sekmesinde planını kurduğun haftadan itibaren her haftanın tamamlanma oranı burada birikir.</p>';
      $('pm-prg-o').textContent=tops.length?('Ortalama %'+Math.round(tops.reduce(function(a,b){return a+b;},0)/tops.length)):'';
    }
    window.MF_PRG=gecmisCiz;
    function halka(){var hh=0,hy=0,bi=bugunI();for(var i=0;i<7;i++){var oz=gunOzet(i);hh+=oz.hed;hy+=oz.yap;}var yz=hh?Math.round(hy*100/hh):0;
      var hk=$('st-halka');if(hk){hk.hidden=!hh;if(hh){var bg=gunOzet(bi),kal=6-bi;
        hk.classList.toggle('tam',yz>=100);$('hlk-y').textContent='%'+yz;$('hlk-d').style.strokeDashoffset=100-Math.min(100,yz);
        $('hlk-a').textContent=sk(hy)+' / '+sk(hh);
        $('hlk-b').textContent=yz>=100?'Haftayı tamamladın!':((bg.hed?'Bugün %'+Math.round(bg.yap*100/bg.hed)+' · ':'')+(kal?kal+' gün kaldı':'Son gün'));}}
    }
    function ciz2(){setTimeout(function(){if(window.MF_SB_GUNCELLE)window.MF_SB_GUNCELLE();},0);
      anlik();
      var hh=0,hy=0,bi=bugunI();
      var gb=$('pr-gunler');gb.innerHTML='';
      for(var i=0;i<7;i++){var oz=gunOzet(i);hh+=oz.hed;hy+=oz.yap;
        var b=document.createElement('button');b.type='button';b.setAttribute('role','tab');b.setAttribute('aria-selected',i===secGun);
        b.className=(i===secGun?'on ':'')+(i===bi?'bugun ':'')+(i===secGun&&gunZip?'zip':'');
        b.innerHTML='<b>'+GK[i]+'</b><small>'+(oz.hed?oz.hed+'dk':'–')+'</small><i><u style="width:'+(oz.hed?Math.round(oz.yap*100/oz.hed):0)+'%"></u></i>';
        (function(n){b.addEventListener('click',function(){if(n===secGun)return;secGun=n;gunZip=true;ciz2();gunZip=false;});})(i);gb.appendChild(b);}
      var yz=hh?Math.round(hy*100/hh):0;
      $('pr-hafta-yuzde').textContent=hh?('%'+yz):'';$('pr-hafta-bar').style.width=yz+'%';
      $('pr-hafta-ozet').textContent=hh?('Bu hafta '+sk(hy)+' / '+sk(hh)+' tamamlandı'):'Henüz plan yok. Bir güne ders ekleyerek başla.';
      var g=pr.g[secGun],oz2=gunOzet(secGun);
      $('pr-gun-ad').textContent=GUNLER[secGun]+(secGun===bi?' · bugün':'');
      $('pr-gun-ozet').textContent=oz2.hed?(sk(oz2.yap)+' / '+sk(oz2.hed)):'';
      var l=$('pr-liste');l.innerHTML='';
      if(!g.length){l.innerHTML='<div class="pr-bos">Bu güne ders eklenmedi.</div>';}
      g.forEach(function(o,j){var y=yapilan(secGun,o.ders),tam=y>=o.dk,el=document.createElement('div');
        el.className='pr-o'+(tam?' tamam':'');
        el.innerHTML='<div class="pr-o-m" role="button" tabindex="0" aria-label="Düzenle"><div class="pr-o-u"><b></b><span>'+(tam?'✓ '+sk(o.dk):sk(y)+' / '+sk(o.dk))+'</span></div><div class="pr-o-bar"><i style="width:'+Math.min(100,Math.round(y*100/o.dk))+'%"></i></div></div>'+(secGun===bi?'<button type="button" class="pr-oynat" aria-label="'+o.ders+' çalışmaya başla">'+(tam?TIK:OYNAT)+'</button>':'');
        el.querySelector('b').textContent=o.ders;
        el.querySelector('.pr-o-m').addEventListener('click',function(){pAc(j);});
        var ob=el.querySelector('.pr-oynat');if(ob)ob.addEventListener('click',function(){calis(o.ders);});
        l.appendChild(el);});
      halka();
      var ob2=gunOzet(bi),ny=$('nav-yuzde');
      if(ob2.hed){var p2=Math.round(ob2.yap*100/ob2.hed);ny.textContent='%'+p2;ny.className='var'+(p2>=100?' tam':'');}else{ny.className='';ny.textContent='';}
    }
    function calis(ders){
      sayfa('sayac');
      if(d.calisiyor)return;
      if(d.mod==='deneme')modSec('odak');
      if(d.mod!=='odak')molaAtla(false);
      var sel=$('pm-ders');sel.value=ders;sel.dispatchEvent(new Event('change'));cipGuncelle();
      if(d.kalan===d.toplam)$('pm-basla').click();
    }
    // ekle / duzenle penceresi
    var pp=$('pr-p'),pDuz=-1,pDers='',pSure=0,pGun=[];
    var SURELER=[30,45,60,90,120];
    function cipler(kap,liste,secili,tik,coklu){var k=$(kap);k.innerHTML='';liste.forEach(function(x){var b=document.createElement('button');b.type='button';b.textContent=x[1];b.dataset.v=x[0];
      var on=coklu?secili.indexOf(x[0])>=0:secili===x[0];b.classList.toggle('on',on);b.setAttribute('aria-pressed',on);b.addEventListener('click',function(){tik(x[0]);});k.appendChild(b);});}
    function pCiz(){
      var dl=[].map.call($('pm-ders').options,function(o){return [o.value,o.text];});
      cipler('pr-p-ders',dl,pDers,function(v){pDers=v;pCiz();});
      var oz=SURELER.indexOf(pSure)<0&&pSure>0;
      cipler('pr-p-sure',SURELER.map(function(x){return [x,x>=60?(x%60?(Math.floor(x/60)+' sa '+x%60+' dk'):(x/60+' saat')):x+' dk'];}).concat([['ozel','Özel']]),oz||pSure==='ozel'?'ozel':pSure,function(v){if(v==='ozel'){pSure=Math.max(5,Math.min(720,+$('pr-p-ozel').value||75));$('pr-p-ozel-k').hidden=false;pCizOzel=true;}else{pSure=v;pCizOzel=false;}pCiz();});
      $('pr-p-ozel-k').hidden=!(oz||pCizOzel);
      if(pDuz<0)cipler('pr-p-gun',GK.map(function(x,i){return [i,x];}),pGun,function(v){var i=pGun.indexOf(v);if(i>=0)pGun.splice(i,1);else pGun.push(v);pCiz();},true);
      $('pr-p-kaydet').disabled=!(pDers&&pSure>0&&(pDuz>=0||pGun.length));
    }
    var pCizOzel=false;
    $('pr-p-ozel').addEventListener('input',function(){var v=Math.round(+this.value);if(v>0){pSure=Math.max(5,Math.min(720,v));pCizOzel=true;$('pr-p-kaydet').disabled=!(pDers&&(pDuz>=0||pGun.length));}});
    $('pr-p-ozel').addEventListener('change',function(){this.value=pSure;});
    function pAc(j){
      pDuz=typeof j==='number'?j:-1;pCizOzel=false;
      if(pDuz>=0){var o=pr.g[secGun][pDuz];pDers=o.ders;pSure=o.dk;if(SURELER.indexOf(o.dk)<0){$('pr-p-ozel').value=o.dk;pCizOzel=true;}}
      else{pDers='';pSure=60;pGun=[secGun];}
      $('pr-p-bas').textContent=pDuz>=0?'Dersi düzenle':'Ders ekle';$('pr-p-alt').textContent=pDuz>=0?GUNLER[secGun]:'';
      $('pr-p-kaydet').textContent=pDuz>=0?'Kaydet':'Ekle';$('pr-p-sil').hidden=pDuz<0;$('pr-p-gun-k').hidden=pDuz>=0;$('pr-p-hata').textContent='';
      pCiz();pp.classList.add('acik');requestAnimationFrame(function(){requestAnimationFrame(function(){pp.classList.add('gor');});});
    }
    function pKapat(){pp.classList.remove('gor');setTimeout(function(){pp.classList.remove('acik');},280);}
    pp.addEventListener('click',function(e){if(e.target===pp)pKapat();});
    $('pr-ekle').addEventListener('click',function(){pAc();});
    $('pr-p-kaydet').addEventListener('click',function(){
      if(!pDers||!(pSure>0))return;
      if(pDuz>=0){pr.g[secGun][pDuz]={ders:pDers,dk:pSure};}
      else pGun.forEach(function(i){var g=pr.g[i],var_=null;g.forEach(function(o){if(o.ders===pDers)var_=o;});if(var_)var_.dk=pSure;else g.push({ders:pDers,dk:pSure});});
      prYaz();pKapat();ciz2();
    });
    $('pr-p-sil').addEventListener('click',function(){if(pDuz<0)return;pr.g[secGun].splice(pDuz,1);prYaz();pKapat();ciz2();});
    // sayfa gecisi
    function hazirla(s){
      if(s==='program'){secGun=bugunI();ciz2();}
      if(s==='istat'){var hd=$('hlk-d');if(hd){hd.style.transition='none';hd.style.strokeDashoffset=100;void hd.getBoundingClientRect();hd.style.transition='';halka();}if(window.MF_IST_YENILE)window.MF_IST_YENILE();$('pm-acc').open=true;$('pm-dnm-acc').open=true;$('pm-prg-acc').open=true;gecmisCiz();}
      if(s==='mantik'&&window.MF_MT)window.MF_MT();
      if(s==='kutuphane'&&window.LEX_KUT)window.LEX_KUT();
    }
    window.MF_HAZIRLA=hazirla;
    function sayfa(s){document.body.classList.toggle('s-kutuphane',s==='kutuphane');var tkb=document.querySelector('#alt-nav button[data-takip]');if(tkb&&(s==='program'||s==='istat')){tkb.dataset.s=s;try{localStorage.setItem('mf-takip',s);}catch(e){}}document.body.classList.toggle('s-program',s==='program');document.body.classList.toggle('s-istat',s==='istat');document.body.classList.toggle('s-mantik',s==='mantik');
      try{history.replaceState(history.state,'',s==='mantik'?'#mantik':location.pathname+location.search);}catch(e){}hazirla(s);try{sessionStorage.setItem('mf-sekme',s);}catch(e){}
      [].forEach.call(document.querySelectorAll('#alt-nav button'),function(b){var on=b.dataset.s===s;b.classList.toggle('on',on);if(on)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
      if(s==='program'){secGun=bugunI();ciz2();}window.scrollTo(0,0);}
    [].forEach.call(document.querySelectorAll('#alt-nav button'),function(b){b.addEventListener('click',function(){sayfa(b.dataset.s);});});
    // Sayfa yenilenirse (ör. yanlışlıkla aşağı çekince) son açık sekmeye dön; uygulama kapatılıp açılınca Çalışma'dan başlar
    (function(){var son=null;try{son=sessionStorage.getItem('mf-sekme');}catch(e){}
      if(['kutuphane','mantik','program','istat'].indexOf(son)<0)return;
      var git=function(){if(!document.body.classList.contains('s-'+son))sayfa(son);};
      if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',git);else setTimeout(git,0);})();
    // seans sonunda: bugunku programin ne kadari bitti
    window.MF_PR_GUN=function(){var bi=bugunI();if(!pr.g[bi].length)return null;return gunOzet(bi);};
    window.MF_PR_OZET=function(ders){
      var bi=bugunI(),g=pr.g[bi];if(!g.length)return null;
      var oz=gunOzet(bi),yz=Math.min(100,Math.round(oz.yap*100/oz.hed)),ayr=[];
      if(yz>=100)return {yz:100,ayr:'Bugünün planını bitirdin. Harika gün!',kisa:'Bugünkü programın tamamlandı!'};
      var bu=null;g.forEach(function(o){if(o.ders===dersAd(ders))bu=o;});
      if(bu){var y=yapilan(bi,bu.ders);ayr.push(bu.ders+': '+(y>=bu.dk?'✓ tamamlandı':sk(y)+' / '+sk(bu.dk)));}
      var kalan=g.filter(function(o){return o!==bu&&yapilan(bi,o.ders)<o.dk;}).slice(0,2).map(function(o){return o.ders+' '+sk(o.dk-yapilan(bi,o.ders));});
      if(kalan.length)ayr.push('Sırada: '+kalan.join(', '));
      return {yz:yz,ayr:ayr.join('\n'),kisa:'Bugünkü program: %'+yz+' tamamlandı'};
    };
    window.MF_PR=ciz2;window.MF_PR_BOS=function(){return !pr.g.some(function(x){return x.length;});};window.MF_PR_UYGULA=function(g){if(!g||g.length!==7)return false;pr.g=g.map(function(x){return x.map(function(o){return {ders:String(o.ders),dk:+o.dk};});});prYaz();anlik();secGun=bugunI();ciz2();return true;};window.MF_SAYFA=sayfa;ciz2();
    window.MF_PR_SEC=function(ders){sayfa('sayac');window.scrollTo(0,0);if(d.calisiyor)return;if(d.mod==='deneme')modSec('odak');if(d.mod!=='odak')molaAtla(false);var sel=$('pm-ders');sel.value=ders;sel.dispatchEvent(new Event('change'));cipGuncelle();};
    window.MF_PR_BUGUN=function(ders){return pr.g[bugunI()].some(function(o){return o.ders===ders;});};
    window.MF_PR_ONER=function(ders,dk){sayfa('program');window.scrollTo(0,0);secGun=bugunI();ciz2();pAc();pDers=ders;pSure=dk;if(SURELER.indexOf(dk)<0){$('pr-p-ozel').value=dk;pCizOzel=true;}pCiz();};
    $('st-halka').addEventListener('click',function(){sayfa('program');window.scrollTo(0,0);});
  })();
  if(d.calisiyor&&kalanMs()<=0){bitti();}
  ciz();istatistik();
})();

