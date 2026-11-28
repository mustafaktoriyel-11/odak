// ---- Sonuç Simülatörü (uygulama içi): netler, tahmini TYT/SAY/EA/SÖZ/DİL puanı, OBP, tercih robotu bağlantısı ----
// Hesap sitedeki simülatörle birebir (www.mustafaktoriyel.com/p/yks-puan-hesaplama.html). Katsayılar veri/puan/katsayi.json;
// Android uygulamasında sitedeki güncel dosya arka planda alınır (yeni sürüm çıkarmadan katsayı güncellenir).
(function(){
  'use strict';
  var UZAK='https://odak.mustafaktoriyel.com/veri/puan/katsayi.json',KK='mf-katsayi',GK='mf-sim';
  var TYT=[['Türkçe',40],['Sosyal Bilimler',20],['Temel Matematik',40],['Fen Bilimleri',20]];
  var AYT=[['Matematik',40],['Fizik',14],['Kimya',13],['Biyoloji',13],['Edebiyat',24],['Tarih-1',10],['Coğrafya-1',6],['Tarih-2',11],['Coğrafya-2',11],['Felsefe Grubu',12],['Din Kültürü',6]];
  var YDT=[['YDT (Yabancı Dil)',80]];
  var LGS=[['Türkçe',20],['Matematik',20],['Fen Bilimleri',20],['T.C. İnkılap Tarihi',10],['Din Kültürü',10],['Yabancı Dil',10]];
  var sinav='yks';
  var K=null,p=null,sekme='tyt';
  function $(i){return document.getElementById(i);}
  function gecerli(k){return k&&k.tyt&&k.tyt.length===5&&k.say&&k.ea&&k.soz&&k.dil&&k.obp;}
  function katsayi(){
    if(K)return Promise.resolve(K);
    var ls=null;try{ls=JSON.parse(localStorage.getItem(KK)||'null');}catch(e){}
    return fetch('veri/puan/katsayi.json',{cache:'no-cache'}).then(function(r){return r.json();}).catch(function(){return null;}).then(function(y){
      K=(gecerli(ls)&&(!gecerli(y)||ls.surum>=y.surum))?ls:y;
      if(window.Capacitor)fetch(UZAK,{cache:'no-cache'}).then(function(r){return r.ok?r.json():null;}).then(function(u){
        if(gecerli(u)&&(!K||u.surum>=K.surum)){try{localStorage.setItem(KK,JSON.stringify(u));}catch(e){}K=u;if(p&&p.classList.contains('acik'))hesapla();}}).catch(function(){});
      return K;});
  }
  function kayit(){try{return JSON.parse(localStorage.getItem(GK)||'{}')||{};}catch(e){return {};}}
  function satirlar(l,g,kay){return l.map(function(x,i){var id=g+i,v=kay[id]||['',''];
    return '<div class="sim-satir" data-g="'+g+'" data-i="'+i+'" data-max="'+x[1]+'"><div class="sim-ad">'+x[0]+'<small>'+x[1]+' soru</small></div>'+
      '<input type="number" inputmode="numeric" min="0" max="'+x[1]+'" placeholder="D" aria-label="'+x[0]+' doğru" value="'+(v[0]===''?'':v[0])+'">'+
      '<input type="number" inputmode="numeric" min="0" max="'+x[1]+'" placeholder="Y" aria-label="'+x[0]+' yanlış" value="'+(v[1]===''?'':v[1])+'">'+
      '<output class="sim-net">0</output></div>';}).join('');}
  function kur(){
    p=document.createElement('div');p.id='sim-p';p.className='pm-sheet sim-p';p.setAttribute('role','dialog');p.setAttribute('aria-modal','true');p.setAttribute('aria-labelledby','sim-b');
    var kay=kayit();
    p.innerHTML='<div class="sheet-k"><div class="sheet-tut"></div>'+
      '<div class="sheet-ust"><b id="sim-b"><svg class="ic" aria-hidden="true"><use href="#i-hesap"/></svg>Sonuç Simülatörü</b><span id="sim-kural">4 yanlış 1 doğruyu götürür</span></div>'+
      '<div class="sim-sinav"><button type="button" data-x="yks">YKS</button><button type="button" data-x="lgs">LGS</button></div>'+
      '<div class="sim-yks"><div class="sim-sekme"><button type="button" data-s="tyt" class="on">TYT</button><button type="button" data-s="ayt">AYT · YDT</button></div>'+
      '<div data-panel="tyt"><div class="sim-top"><div><b id="sim-t-tyt">0</b><span>TYT net</span></div><div class="tur"><b id="sim-t-mat">0</b><span>Matematik</span></div></div>'+
        '<div class="sim-kart"><div class="sim-bas"><span>Test</span><span>D</span><span>Y</span><span>Net</span></div>'+satirlar(TYT,'t',kay)+'</div></div>'+
      '<div data-panel="ayt" hidden><div class="sim-top"><div><b id="sim-t-say">0</b><span>Sayısal</span></div><div class="tur"><b id="sim-t-ea">0</b><span>Eşit Ağırlık</span></div><div><b id="sim-t-soz">0</b><span>Sözel</span></div></div>'+
        '<div class="sim-kart"><div class="sim-bas"><span>Test</span><span>D</span><span>Y</span><span>Net</span></div>'+satirlar(AYT,'a',kay)+satirlar(YDT,'y',kay)+'</div></div>'+
      '<div class="sim-puan"><h4>Tahmini puan</h4><p class="sim-alt" id="sim-kaynak"></p>'+
        '<div class="sim-obp"><label>Diploma notu <input type="number" id="sim-dip" min="50" max="100" step="0.01" inputmode="decimal" placeholder="ör. 85" value="'+(kay.dip||'')+'"></label>'+
        '<label class="pm-anahtar sim-yer"><input type="checkbox" id="sim-yer" role="switch"'+(kay.yer?' checked':'')+'><span class="ray" aria-hidden="true"></span><b>Geçen yıl bir programa yerleştim</b></label></div>'+
        '<div class="sim-pt">'+['tyt:TYT','say:Sayısal','ea:Eşit Ağırlık','soz:Sözel','dil:Dil'].map(function(x){var a=x.split(':');return '<div><span>'+a[1]+'</span><b id="sim-p-'+a[0]+'">–</b><small id="sim-y-'+a[0]+'"></small></div>';}).join('')+'</div>'+
        '<a class="sim-robot pasif" id="sim-robot" target="_blank" rel="noopener" href="#"><svg class="ic" aria-hidden="true"><use href="#i-hedef"/></svg><span>Bu puanlarla hangi bölümlere girebilirim?<small>Tercih Robotu · sitede açılır</small></span><i aria-hidden="true">›</i></a>'+
        '<p class="sim-alt" id="sim-robot-not">Tercih robotu için diploma notunu da gir.</p></div></div>'+
      '<div class="sim-lgs" hidden><div class="sim-top"><div><b id="sim-l-net">0</b><span>Toplam net</span></div><div class="tur"><b id="sim-l-agr">0</b><span>Ağırlıklı net</span></div></div>'+
        '<div class="sim-kart"><div class="sim-bas"><span>Test</span><span>D</span><span>Y</span><span>Net</span></div>'+satirlar(LGS,'l',kay)+'</div>'+
        '<div class="sim-puan"><h4>Tahmini LGS puanı</h4><p class="sim-alt">3 yanlış 1 doğruyu götürür. Türkçe, Matematik ve Fen netleri 4, diğerleri 1 katsayıyla sayılır.</p>'+
        '<div class="sim-pt sim-pt1"><div><span>LGS (500 üzerinden)</span><b id="sim-l-puan">–</b><small>tahmini</small></div></div></div></div>'+
      '<p class="sim-not sim-yks"><svg class="ic" aria-hidden="true"><use href="#i-uyari"/></svg><span><b>Puanlar tahminidir.</b> ÖSYM katsayıları önceden yayımlamaz; bu değerler bir önceki yılın sonuçlarından hesaplanmış yaklaşık katsayılardır ve sınavın zorluğuna göre değişir. Büyük sayı ham puan, altındaki OBP eklenmiş yerleştirme puanıdır.</span></p>'+
      '<p class="sim-not sim-lgs" hidden><svg class="ic" aria-hidden="true"><use href="#i-uyari"/></svg><span><b>Puan tahminidir.</b> MEB, LGS puanını her dersin o yılki Türkiye ortalamasına göre standart puanla hesaplar. Bu tahmin 2026 LGS raporu ve 2026 yüzdelik dilimleri kullanılarak hesaplandı; yüksek puanlarda daha isabetli, düşük netlerde sapma artabilir.</span></p>'+
      '<button type="button" class="sim-temizle" id="sim-temizle"><svg class="ic" aria-hidden="true"><use href="#i-cop"/></svg>Tümünü temizle</button>'+
      '<button type="button" class="sheet-tamam sim-kapat">Tamam</button></div>';
    document.body.appendChild(p);
    var kap=function(){kaydet();if(window.LEX_GERI&&LEX_GERI.dus)LEX_GERI.dus('sim-p');p.classList.remove('gor');setTimeout(function(){p.classList.remove('acik');},280);};
    p._kap=kap;p.addEventListener('click',function(e){if(e.target===p&&Date.now()-(p._t||0)>450)kap();});
    p.querySelector('.sim-kapat').addEventListener('click',kap);
    if(typeof ksKapat==='function')ksKapat(p,kap,p);
    p.addEventListener('input',hesapla);p.addEventListener('change',function(){hesapla();kaydet();});
    [].forEach.call(p.querySelectorAll('.sim-sekme button'),function(b){b.addEventListener('click',function(){sekme=b.getAttribute('data-s');
      [].forEach.call(p.querySelectorAll('.sim-sekme button'),function(x){x.classList.toggle('on',x===b);});
      [].forEach.call(p.querySelectorAll('[data-panel]'),function(x){x.hidden=x.getAttribute('data-panel')!==sekme;});});});
    [].forEach.call(p.querySelectorAll('.sim-sinav button'),function(b){b.addEventListener('click',function(){sinavSec(b.getAttribute('data-x'));kaydet();});});
    $('sim-temizle').addEventListener('click',function(){[].forEach.call(p.querySelectorAll('input'),function(i){if(i.type==='checkbox')i.checked=false;else i.value='';});hesapla();kaydet();});
  }
  function sinavSec(x){sinav=x;if(!p)return;[].forEach.call(p.querySelectorAll('.sim-sinav button'),function(b){b.classList.toggle('on',b.getAttribute('data-x')===x);});
    [].forEach.call(p.querySelectorAll('.sim-yks'),function(e){e.hidden=x!=='yks';});[].forEach.call(p.querySelectorAll('.sim-lgs'),function(e){e.hidden=x!=='lgs';});$('sim-kural').textContent=x==='lgs'?'3 yanlış 1 doğruyu götürür':'4 yanlış 1 doğruyu götürür';}
  function sayi(i){var v=parseInt(i.value,10);return isNaN(v)||v<0?0:v;}
  function yuv(x){return Math.round(x*100)/100;}
  var N={t:[],a:[],y:[],l:[]};
  function kaydet(){if(!p)return;var o={};[].forEach.call(p.querySelectorAll('.sim-satir'),function(s){var i=s.querySelectorAll('input');if(i[0].value!==''||i[1].value!=='')o[s.getAttribute('data-g')+s.getAttribute('data-i')]=[i[0].value,i[1].value];});
    o.dip=$('sim-dip').value;o.yer=$('sim-yer').checked;o.sinav=sinav;try{localStorage.setItem(GK,JSON.stringify(o));}catch(e){}}
  function hesapla(){
    if(!p)return;N={t:[],a:[],y:[],l:[]};
    [].forEach.call(p.querySelectorAll('.sim-satir'),function(s){var i=s.querySelectorAll('input'),mx=+s.getAttribute('data-max'),d=sayi(i[0]),y=sayi(i[1]),h=d+y>mx;
      i[0].classList.toggle('hata',h);i[1].classList.toggle('hata',h);var n=yuv(d-y/(s.getAttribute('data-g')==='l'?3:4));s.querySelector('.sim-net').textContent=n;N[s.getAttribute('data-g')][+s.getAttribute('data-i')]=n;});
    var t=N.t,a=N.a,A=function(i){return a[i]||0;},top=function(l){return yuv(l.reduce(function(x,y){return x+(y||0);},0));};
    $('sim-t-tyt').textContent=top(t);$('sim-t-mat').textContent=t[2]||0;
    $('sim-t-say').textContent=top([A(0),A(1),A(2),A(3)]);$('sim-t-ea').textContent=top([A(0),A(4),A(5),A(6)]);$('sim-t-soz').textContent=top([A(4),A(5),A(6),A(7),A(8),A(9),A(10)]);
    var L=N.l,ag=(K&&K.lgs&&K.lgs.agirlik)||[4,4,4,1,1,1],w=0,ln=0;for(var li=0;li<6;li++){w+=(L[li]||0)*ag[li];ln+=(L[li]||0);}
    $('sim-l-net').textContent=yuv(ln);$('sim-l-agr').textContent=yuv(w);
    var lk=(K&&K.lgs)||{},lp=lk.carpan?lk.sabit+lk.carpan.reduce(function(t,b,i){return t+b*(L[i]||0);},0):194.75+305.25*w/270,dolu=[].some.call(p.querySelectorAll('.sim-satir[data-g="l"] input'),function(i){return i.value!=='';});
    $('sim-l-puan').textContent=dolu?Math.min(500,Math.max(100,lp)).toFixed(2):'–';
    if(!K)return;
    $('sim-kaynak').textContent=K.kaynak?K.kaynak+'.':'';
    var tr=t[0]||0,so=t[1]||0,ma=t[2]||0,fe=t[3]||0,tg=(tr>=0.5||ma>=0.5);
    var taban=function(k){return k[0]+k[1]*tr+k[2]*so+k[3]*ma+k[4]*fe;};
    var ay=function(c,ix){var s=0;for(var i=0;i<ix.length;i++)s+=c[i]*A(ix[i]);return s;};
    var IX={say:[0,1,2,3],ea:[0,4,5,6],soz:[4,5,6,7,8,9,10]},net=function(ix){return ix.reduce(function(x,i){return x+A(i);},0);};
    var sk={tyt:tg?taban(K.tyt):null};
    ['say','ea','soz'].forEach(function(x){sk[x]=tg&&net(IX[x])>=0.5?taban(K[x].taban)+ay(K[x].ayt,IX[x]):null;});
    var ydn=N.y[0]||0;sk.dil=tg&&ydn>=0.5?taban(K.dil.taban)+K.dil.ydt*ydn:null;
    var dip=parseFloat(($('sim-dip').value||'').replace(',','.')),obp=(dip>=50&&dip<=100)?dip*K.obp.carpan*($('sim-yer').checked?K.obp.yerlesen:K.obp.katsayi):0,q=[];
    Object.keys(sk).forEach(function(k){var v=sk[k];if(v!=null)v=Math.min(500,Math.max(100,v));
      $('sim-p-'+k).textContent=v==null?'–':v.toFixed(2);$('sim-y-'+k).textContent=(v==null||!obp)?'':'OBP ile: '+(v+obp).toFixed(2);
      if(v!=null&&obp)q.push(k+'='+(v+obp).toFixed(2));});
    var rb=$('sim-robot');rb.href=(K.robot||'https://www.mustafaktoriyel.com/p/2027-yks-tercih-robotu.html')+(q.length?'?'+q.join('&'):'');
    rb.classList.toggle('pasif',!q.length);$('sim-robot-not').hidden=!!q.length;
  }
  function ac(){if(!p){kur();var kk=kayit(),sn=null;try{sn=window.MF_SINIF&&window.MF_SINIF();}catch(e){}sinavSec(kk.sinav||((sn&&/^[5-8]$/.test(String(sn.sinif)))?'lgs':'yks'));}katsayi().then(hesapla);hesapla();p._t=Date.now();p.classList.add('acik');requestAnimationFrame(function(){requestAnimationFrame(function(){p.classList.add('gor');});});
    if(window.LEX_GERI&&LEX_GERI.ekle)LEX_GERI.ekle('sim-p',p._kap);}
  window.MF_SIM_AC=ac;
  // Çalışma ekranındaki "Sonuç Simülatörü" bağlantısı artık uygulama içinde açılır
  document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href*="yks-puan-hesaplama"]');if(!a)return;e.preventDefault();ac();},true);
})();
