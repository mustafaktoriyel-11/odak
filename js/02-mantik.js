
// ================= MANTIK TESTI =================
(function(){
  var $=function(id){return document.getElementById(id);};
  var SETLER=Array.isArray(window.MF_MANTIK_VERI)?window.MF_MANTIK_VERI:[];
  if(!SETLER.length)return;
  var K='mf-mantik-g',SURE=600,BAZ=new Date(2026,10,2);
  var TIPAD={sayi:'Sayı dizisi',sekil:'Şekil örüntüsü',mantik:'Mantık',problem:'Problem'};
  var AY=['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
  function oku(){try{return JSON.parse(localStorage.getItem(K)||'{}');}catch(e){return {};}}
  function yaz(v){try{localStorage.setItem(K,JSON.stringify(v));}catch(e){}}
  function pzt(t){var d=new Date(t);d.setHours(0,0,0,0);d.setDate(d.getDate()-((d.getDay()+6)%7));return d;}
  function gunBas(t){var d=new Date(t);d.setHours(0,0,0,0);return d;}
  function haftaNo(){return Math.round((gunBas(Date.now())-BAZ)/864e5);}
  function setNo(h){return ((h%SETLER.length)+SETLER.length)%SETLER.length;}
  function seviye(d,sn){
    if(d===12)return sn<360?{e:'⚡',a:'Hızlı Usta'}:{e:'🏆',a:'Usta'};
    if(d>=10)return {e:'💎',a:'Keskin Zihin'};if(d>=8)return {e:'🚀',a:'Güçlü'};if(d>=5)return {e:'📈',a:'Gelişen'};return {e:'🌱',a:'Başlangıç'};
  }
  function sureYaz(sn){sn=Math.round(sn);return Math.floor(sn/60)+':'+(sn%60<10?'0':'')+sn%60;}
  function esc(x){return String(x).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function diziHtml(h){var bos=h.indexOf(null)>=0;return '<div class="mt-dizi">'+h.map(function(x){return x===null?'<span class="q">?</span>':'<span>'+x+'</span>';}).join('')+(bos?'':'<span class="q">?</span>')+'</div>';}
  // ---- cizim ----
  var MAVI='#1E3BD6';
  var RENK={mavi:'#1E3BD6',turuncu:'#FF8A1F',yesil:'#1FA463'};
  function poli(pts){return pts.map(function(p){return p[0].toFixed(1)+','+p[1].toFixed(1);}).join(' ');}
  function sekil(s,f,cx,cy,r){
    var renk=RENK[f],cz=renk||MAVI,fill=renk?renk:(f==='dolu'?MAVI:(f==='yari'?'url(#mfy)':'#fff')),st='stroke="'+cz+'" stroke-width="2.2" stroke-linejoin="round" fill="'+fill+'"',i,p=[];
    if(s==='daire')return '<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" '+st+'/>';
    if(s==='kare')return '<rect x="'+(cx-r*.88)+'" y="'+(cy-r*.88)+'" width="'+(r*1.76)+'" height="'+(r*1.76)+'" rx="2" '+st+'/>';
    if(s==='altigen'){for(i=0;i<6;i++){var a=Math.PI/3*i;p.push([cx+r*Math.cos(a),cy+r*Math.sin(a)]);}return '<polygon points="'+poli(p)+'" '+st+'/>';}
    if(s==='yildiz'){for(i=0;i<10;i++){var a2=-Math.PI/2+Math.PI/5*i,rr=i%2?r*.45:r*1.12;p.push([cx+rr*Math.cos(a2),cy+rr*Math.sin(a2)]);}return '<polygon points="'+poli(p)+'" '+st+'/>';}
    if(s==='arti'){var w=r*.36,L=r*.98;return '<polygon points="'+poli([[cx-w,cy-L],[cx+w,cy-L],[cx+w,cy-w],[cx+L,cy-w],[cx+L,cy+w],[cx+w,cy+w],[cx+w,cy+L],[cx-w,cy+L],[cx-w,cy+w],[cx-L,cy+w],[cx-L,cy-w],[cx-w,cy-w]])+'" '+st+'/>';}
    var h=r*1.9;return '<polygon points="'+cx+','+(cy-h*.55)+' '+(cx+r*1.05)+','+(cy+h*.45)+' '+(cx-r*1.05)+','+(cy+h*.45)+'" '+st+'/>';
  }
  function izg(m,x,y,b,eksen){var n=4,c=b/n,o='';
    for(var i=0;i<16;i++){var cx=x+(i%n)*c,cy=y+Math.floor(i/n)*c;o+='<rect x="'+cx+'" y="'+cy+'" width="'+c+'" height="'+c+'" fill="'+(m[i]?MAVI:'#fff')+'" stroke="#C9D2F5" stroke-width="1"/>';}
    o+='<rect x="'+x+'" y="'+y+'" width="'+b+'" height="'+b+'" fill="none" stroke="#8A99D8" stroke-width="1.6"/>';
    if(eksen==='d')o+='<line x1="'+(x+b+12)+'" y1="'+(y-6)+'" x2="'+(x+b+12)+'" y2="'+(y+b+6)+'" stroke="#FF7A00" stroke-width="2.5" stroke-dasharray="6 4"/>';
    if(eksen==='y')o+='<line x1="'+(x-6)+'" y1="'+(y+b+12)+'" x2="'+(x+b+6)+'" y2="'+(y+b+12)+'" stroke="#FF7A00" stroke-width="2.5" stroke-dasharray="6 4"/>';
    return o;}
  function kare3(f,x,y,b){var c=b/3,o='';
    for(var i=0;i<9;i++)o+='<rect x="'+(x+(i%3)*c)+'" y="'+(y+Math.floor(i/3)*c)+'" width="'+c+'" height="'+c+'" fill="#fff" stroke="#C9D2F5" stroke-width="1"/>';
    if(!f)return o+'<text x="'+(x+b/2)+'" y="'+(y+b/2+10)+'" text-anchor="middle" font-size="28" font-weight="800" fill="#FF7A00">?</text>';
    f.forEach(function(d){o+='<circle cx="'+(x+(d[1]+.5)*c)+'" cy="'+(y+(d[0]+.5)*c)+'" r="'+(c*.32)+'" fill="'+(d[2]==='t'?'#FF8A1F':MAVI)+'"/>';});return o;}
  var DUZEN={1:[[.5,.5]],2:[[.28,.5],[.72,.5]],3:[[.5,.28],[.27,.72],[.73,.72]],4:[[.28,.28],[.72,.28],[.28,.72],[.72,.72]]};
  function hucre(c,x,y,b){
    if(!c)return '<text x="'+(x+b/2)+'" y="'+(y+b/2+11)+'" text-anchor="middle" font-size="32" font-weight="800" fill="#FF7A00">?</text>';
    var r=c.n===1?b*.24:b*.15,o='';
    DUZEN[c.n].forEach(function(p){o+=sekil(c.s,c.f,x+p[0]*b,y+p[1]*b,r);});return o;
  }
  var DEFS='<defs><linearGradient id="mfy" x1="0" x2="1" y1="0" y2="0"><stop offset=".5" stop-color="'+MAVI+'"/><stop offset=".5" stop-color="#fff"/></linearGradient></defs>';
  function ok(c,x,y,b){
    if(!c)return '<text x="'+(x+b/2)+'" y="'+(y+b/2+11)+'" text-anchor="middle" font-size="32" font-weight="800" fill="#FF7A00">?</text>';
    var cx=x+b/2,cy=y+b/2,s=b/60;
    return '<g transform="translate('+cx+' '+cy+') rotate('+c.a+') scale('+s+')"><path d="M0,-22 L14,-4 L5,-4 L5,20 L-5,20 L-5,-4 L-14,-4 Z" stroke="'+MAVI+'" stroke-width="2.4" stroke-linejoin="round" fill="'+(c.f==='dolu'?MAVI:'#fff')+'"/></g>';
  }
  function figur(g){
    if(g.tip==='matris'){var b=78,o='<svg viewBox="0 0 '+(b*3+4)+' '+(b*3+4)+'" width="'+(b*3+4)+'" xmlns="http://www.w3.org/2000/svg">'+DEFS;
      for(var i=0;i<9;i++){var x=2+(i%3)*b,y=2+Math.floor(i/3)*b;o+='<rect x="'+x+'" y="'+y+'" width="'+b+'" height="'+b+'" fill="'+(g.h[i]?'#fff':'#FFF3E6')+'" stroke="#C9D2F5" stroke-width="1.5"/>'+hucre(g.h[i],x,y,b);}
      return o+'</svg>';}
    if(g.tip==='izgara'){var B=150;return '<svg viewBox="-4 -10 '+(B+(g.eksen==='d'?30:12))+' '+(B+(g.eksen==='y'?36:20))+'" width="'+(B+30)+'" xmlns="http://www.w3.org/2000/svg">'+izg(g.h,0,0,B,g.eksen)+'</svg>';}
    if(g.tip==='hareket'){var b3=60,g3=8,o3='<svg viewBox="0 0 '+(b3*5+g3*4+4)+' '+(b3+4)+'" width="'+(b3*5+g3*4+4)+'" xmlns="http://www.w3.org/2000/svg">';
      for(var k=0;k<5;k++)o3+=kare3(g.h[k],2+k*(b3+g3),2,b3);return o3+'</svg>';}
    if(g.tip==='dondur'){var b2=62,o2='<svg viewBox="0 0 '+(b2*5+4)+' '+(b2+4)+'" width="'+(b2*5+4)+'" xmlns="http://www.w3.org/2000/svg">';
      for(var j=0;j<5;j++){var x2=2+j*b2;o2+='<rect x="'+x2+'" y="2" width="'+b2+'" height="'+b2+'" fill="'+(g.h[j]?'#fff':'#FFF3E6')+'" stroke="#C9D2F5" stroke-width="1.5"/>'+ok(g.h[j],x2,2,b2);}
      return o2+'</svg>';}
    return '';
  }
  function secFig(g,o){var b=86,ic;
    if(!g||g.tip==='izgara')ic=izg(o,3,3,b-6);else if(g.tip==='hareket')ic=kare3(o,3,3,b-6);else if(g.tip==='dondur')ic=ok(o,0,0,b);else ic=hucre(o,0,0,b);
    return '<svg viewBox="0 0 '+b+' '+b+'" width="'+b+'" xmlns="http://www.w3.org/2000/svg">'+DEFS+ic+'</svg>';}
  // ---- durum ----
  var aktif=null,zT=null;
  function kaydetAktif(){try{localStorage.setItem(K+'-aktif',JSON.stringify(aktif));}catch(e){}}
  function giris(){
    var v=oku(),h=haftaNo(),bu=v[h],sn=setNo(h),ys=new Date();ys.setHours(24,0,0,0);var kalS=Math.ceil((ys-Date.now())/36e5),o='';
    o+='<div class="mt-hero"><span class="mt-hafta">Günün testi · her gün yeni set</span><h2>🧠 Mantık ve Muhakeme</h2>'+
      '<p>12 soru, 10 dakika. Zihnini ısıt, seviyeni gör, sonucunu paylaş.</p>'+
      '<div class="mt-tipler"><span>🔢 Sayı dizisi · 3</span><span>🔷 Şekil örüntüsü · 3</span><span>🧩 Mantık · 3</span><span>✏️ Problem · 3</span></div>';
    if(!bu)o+='<button type="button" class="mt-btn" id="mt-basla">'+(aktif&&aktif.h===h?'Teste devam et':'Teste başla')+'</button>';
    o+='<p class="mt-sonraki">Yeni set '+(kalS<=1?'1 saatten kısa süre sonra':kalS+' saat sonra')+' açılıyor.</p></div>';
    if(bu){var sv=seviye(bu.d,bu.sn);
      o+='<div class="mt-kart"><div class="mt-ozet"><span class="mt-ikon">'+sv.e+'</span><div><b>'+sv.a+' · '+bu.d+'/12</b><small>Bugünkü en iyi sonucun · '+sureYaz(bu.sn)+((bu.n||1)>1?' · '+bu.n+' deneme':'')+'</small></div></div>'+
        '<button type="button" class="mt-btn" id="mt-gor" style="margin-top:14px">Sonucu ve çözümleri gör</button>'+
        '<button type="button" class="mt-btn2" id="mt-tekrar">'+(bu.d<12?'🔁 Tekrar çöz, rekorunu geliştir':'🔁 Tekrar çöz, süreni kısalt')+'</button></div>';}
    var ks=Object.keys(v).map(Number).filter(function(x){return x!==h;}).sort(function(a,b){return b-a;}).slice(0,8);
    if(ks.length){o+='<div class="mt-kart"><p class="mt-bas">Önceki günler</p><div class="mt-gec">';
      ks.forEach(function(k){var x=v[k],sv=seviye(x.d,x.sn),t=new Date(BAZ);t.setDate(t.getDate()+k);
        o+='<div><span>'+t.getDate()+' '+AY[t.getMonth()]+'</span><b>'+sv.e+' '+x.d+'/12</b></div>';});
      o+='</div></div>';}
    $('mt-giris').innerHTML=o;$('mt-giris').hidden=false;$('mt-test').hidden=true;$('mt-sonuc').hidden=true;
    var b=$('mt-basla');if(b)b.addEventListener('click',function(){basla(false);});
    var g=$('mt-gor');if(g)g.addEventListener('click',function(){sonucGoster(bu,h);});
    var tk=$('mt-tekrar');if(tk)tk.addEventListener('click',function(){basla(true);});
    rozet();
  }
  function rozet(){var e=$('nav-mantik');if(!e)return;var r=oku()[haftaNo()],yeni=!r;e.textContent=yeni?'Yeni':'';e.className=yeni?'var':'';
    var b=e.parentNode,z=b.querySelector('.nav-roz');
    if(r){var sv=seviye(r.d,r.sn);if(!z){z=document.createElement('i');z.className='nav-roz';z.setAttribute('aria-hidden','true');b.insertBefore(z,b.firstChild);}
      if(z.textContent!==sv.e){z.textContent=sv.e;z.classList.remove('yeni');void z.offsetWidth;z.classList.add('yeni');}
      b.classList.add('rozetli');b.setAttribute('aria-label','Mantık, bugünkü rozetin: '+sv.a);}
    else{if(z)z.remove();b.classList.remove('rozetli');b.removeAttribute('aria-label');}}
  document.addEventListener('visibilitychange',function(){if(!document.hidden)rozet();});
  function basla(tekrar){
    var h=haftaNo();
    if(!(aktif&&aktif.h===h&&!tekrar))aktif={h:h,set:setNo(h),cev:[null,null,null,null,null,null,null,null,null,null,null,null],bas:Date.now(),i:0,tekrar:!!tekrar};
    kaydetAktif();soru();clearInterval(zT);zT=setInterval(saat,500);window.scrollTo(0,0);
  }
  function kalan(){return Math.max(0,SURE-(Date.now()-aktif.bas)/1000);}
  function saat(){if(!aktif){clearInterval(zT);return;}var k=kalan(),e=$('mt-sure');if(e){e.textContent=sureYaz(k);e.classList.toggle('az',k<60);}if(k<=0)bitir();}
  function soru(){
    var S=SETLER[aktif.set],i=aktif.i,q=S[i],fig=q.t==='sekil',o='';
    o+='<div class="mt-ust"><div class="mt-ust-s"><span>Soru '+(i+1)+' / 12</span><span class="mt-sure" id="mt-sure">'+sureYaz(kalan())+'</span></div><div class="mt-ilerle"><i style="width:'+Math.round(aktif.cev.filter(function(x){return x!==null;}).length*100/12)+'%"></i></div></div>';
    o+='<div class="mt-kart"><span class="mt-tip">'+TIPAD[q.t]+'</span><p class="mt-soru">'+esc(q.s)+'</p>';
    if(q.g&&q.g.tip==='dizi')o+=diziHtml(q.g.h);
    else if(q.g)o+='<div class="mt-fig">'+figur(q.g)+'</div>';
    o+='<div class="mt-sec'+(fig?' fig':'')+'">'+q.o.map(function(x,j){return '<button type="button" data-j="'+j+'" class="'+(aktif.cev[i]===j?'on':'')+'"><i>'+'ABCD'[j]+'</i>'+(fig?secFig(q.g,x):'<span>'+esc(x)+'</span>')+'</button>';}).join('')+'</div>';
    o+='<div class="mt-alt"><button type="button" class="geri" id="mt-geri"'+(i===0?' disabled':'')+'>‹ Önceki</button>'+(i<11?'<button type="button" class="ileri" id="mt-ileri">Sonraki ›</button>':'<button type="button" class="bitir" id="mt-bitir">Testi bitir</button>')+'</div>';
    o+='<div class="mt-noktalar">'+S.map(function(_,j){return '<button type="button" data-n="'+j+'" class="'+(aktif.cev[j]!==null?'dolu ':'')+(j===i?'su':'')+'">'+(j+1)+'</button>';}).join('')+'</div></div>';
    $('mt-test').innerHTML=o;$('mt-test').hidden=false;$('mt-giris').hidden=true;$('mt-sonuc').hidden=true;
    [].forEach.call(document.querySelectorAll('#mt-test .mt-sec button'),function(b){b.addEventListener('click',function(){aktif.cev[i]=+b.dataset.j;kaydetAktif();
      [].forEach.call(b.parentNode.children,function(x){x.classList.toggle('on',x===b);});
      setTimeout(function(){if(aktif&&aktif.i===i&&i<11){aktif.i++;kaydetAktif();soru();}else soru();},250);});});
    [].forEach.call(document.querySelectorAll('#mt-test .mt-noktalar button'),function(b){b.addEventListener('click',function(){aktif.i=+b.dataset.n;kaydetAktif();soru();});});
    $('mt-geri').addEventListener('click',function(){if(aktif.i>0){aktif.i--;kaydetAktif();soru();}});
    var il=$('mt-ileri');if(il)il.addEventListener('click',function(){aktif.i++;kaydetAktif();soru();});
    var bt=$('mt-bitir');if(bt)bt.addEventListener('click',function(){var bos=aktif.cev.filter(function(x){return x===null;}).length;
      if(bos&&!confirm(bos+' soru boş. Yine de bitirilsin mi?'))return;bitir();});
  }
  function bitir(){
    if(!aktif)return;clearInterval(zT);
    var S=SETLER[aktif.set],d=0;S.forEach(function(q,j){if(aktif.cev[j]===q.c)d++;});
    var sn=Math.min(SURE,(Date.now()-aktif.bas)/1000),sonuc={d:d,sn:Math.round(sn),cev:aktif.cev,set:aktif.set,t:Date.now()},h=aktif.h;
    // en iyi sonuc saklanir: daha cok dogru, esitse daha kisa sure
    var v=oku(),eski=v[h],rekor=!eski||sonuc.d>eski.d||(sonuc.d===eski.d&&sonuc.sn<eski.sn);
    sonuc.n=(eski&&eski.n||(eski?1:0))+1;
    if(rekor)v[h]=sonuc;else v[h].n=sonuc.n;yaz(v);
    sonuc.rekor=rekor&&!!eski;sonuc.enIyi=v[h];
    var gos=sonuc;aktif=null;try{localStorage.removeItem(K+'-aktif');}catch(e){}
    sonucGoster(gos,h,true);rozet();
  }
  function sonucGoster(r,h,yeni){
    var S=SETLER[r.set],sv=seviye(r.d,r.sn),v=oku(),onceki=null;
    Object.keys(v).map(Number).filter(function(x){return x<h;}).sort(function(a,b){return b-a;}).slice(0,1).forEach(function(k){onceki=v[k];});
    var tip={sayi:[0,0],sekil:[0,0],mantik:[0,0],problem:[0,0]};
    S.forEach(function(q,j){tip[q.t][1]++;if(r.cev[j]===q.c)tip[q.t][0]++;});
    var en=null,zay=null;Object.keys(tip).forEach(function(t){if(!en||tip[t][0]>tip[en][0])en=t;if(!zay||tip[t][0]<tip[zay][0])zay=t;});
    var o='<div class="mt-hero mt-seviye"><div class="e">'+sv.e+'</div><h2>'+sv.a+'</h2><div class="puan">'+r.d+' / 12 doğru · '+sureYaz(r.sn)+'</div>';
    if(r.rekor)o+='<span class="fark">🎉 Yeni rekor!</span>';
    else if(r.enIyi&&r.enIyi!==r&&(r.enIyi.d>r.d||r.enIyi.sn<r.sn))o+='<span class="fark">Bugünkü en iyin: '+r.enIyi.d+'/12 · '+sureYaz(r.enIyi.sn)+'</span>';
    else if(onceki){var f=r.d-onceki.d;o+='<span class="fark">'+(f>0?'Önceki testine göre +'+f+' doğru 📈':f<0?'Önceki testine göre '+f+' doğru':'Önceki testinle aynı')+'</span>';}
    o+='</div>';
    o+='<button type="button" class="mt-btn" id="mt-paylas" style="margin-bottom:16px">Sonucumu paylaş</button>';
    o+='<div class="mt-kart"><p class="mt-bas">Soru tiplerine göre</p><div class="mt-tipsonuc">'+Object.keys(tip).map(function(t){return '<div><span>'+TIPAD[t]+'</span><i><u style="width:'+Math.round(tip[t][0]*100/tip[t][1])+'%"></u></i><b>'+tip[t][0]+'/'+tip[t][1]+'</b></div>';}).join('')+'</div>';
    o+='<p class="mt-yorum">'+(tip[en][0]===tip[zay][0]?'Dört soru tipinde de dengelisin.':'En güçlü olduğun alan <b>'+TIPAD[en].toLowerCase()+'</b>, geliştirebileceğin alan <b>'+TIPAD[zay].toLowerCase()+'</b>.')+'</p></div>';
    o+='<a class="mt-tyt" href="https://www.mustafaktoriyel.com/p/yks.html" target="_blank" rel="noopener"><span style="font-size:24px">🎯</span><span><b>Bu soru tipleri TYT Matematik\'te de çıkıyor</b>Sayılar, problemler ve mantık konularına göz at ›</span></a>';
    o+='<div class="mt-kart mt-coz"><p class="mt-bas">Çözümler</p>'+S.map(function(q,j){var c=r.cev[j],ok=c===q.c,fig=q.t==='sekil';
      var ic='<p class="mt-soru" style="margin-top:10px">'+esc(q.s)+'</p>'+(q.g&&q.g.tip==='dizi'?diziHtml(q.g.h):(q.g?'<div class="mt-fig">'+figur(q.g)+'</div>':''))+
        '<div class="mt-sec'+(fig?' fig':'')+'">'+q.o.map(function(x,k){return '<button type="button" disabled class="'+(k===q.c?'dogru':(k===c?'yanlis':''))+'"><i>'+'ABCD'[k]+'</i>'+(fig?secFig(q.g,x):'<span>'+esc(x)+'</span>')+'</button>';}).join('')+'</div><div class="acik">💡 '+esc(q.a)+'</div>';
      return '<details><summary><em>'+(ok?'✅':(c===null?'⚪':'❌'))+'</em>'+(j+1)+'. '+TIPAD[q.t]+'</summary>'+ic+'</details>';}).join('')+'</div>';
    o+='<button type="button" class="mt-btn2" id="mt-don" style="margin-bottom:16px">‹ Mantık sayfasına dön</button>';
    $('mt-sonuc').innerHTML=o;$('mt-sonuc').hidden=false;$('mt-giris').hidden=true;$('mt-test').hidden=true;window.scrollTo(0,0);
    $('mt-don').addEventListener('click',giris);
    $('mt-paylas').addEventListener('click',function(){paylas(r,sv,h,tip);});
  }
  // ---- paylasim karti ----
  function paylas(r,sv,h,tip){
    var c=document.createElement('canvas');c.width=1080;c.height=1350;var x=c.getContext('2d');
    var g=x.createLinearGradient(0,0,1080,1350);g.addColorStop(0,'#2346F5');g.addColorStop(1,'#0E1660');x.fillStyle=g;x.fillRect(0,0,1080,1350);
    x.strokeStyle='rgba(255,255,255,.06)';x.lineWidth=2;for(var i=0;i<=1080;i+=54){x.beginPath();x.moveTo(i,0);x.lineTo(i,1350);x.stroke();}for(var j=0;j<=1350;j+=54){x.beginPath();x.moveTo(0,j);x.lineTo(1080,j);x.stroke();}
    var rg=x.createRadialGradient(900,160,0,900,160,360);rg.addColorStop(0,'rgba(255,138,31,.45)');rg.addColorStop(1,'rgba(255,138,31,0)');x.fillStyle=rg;x.fillRect(0,0,1080,1350);
    x.textAlign='center';x.fillStyle='#fff';
    x.font='800 44px Roboto,Arial,sans-serif';var tg=new Date(BAZ);tg.setDate(tg.getDate()+h);x.fillText('MF Mantık Testi · '+tg.getDate()+' '+AY[tg.getMonth()],540,150);
    x.font='190px sans-serif';x.fillText(sv.e,540,430);
    x.font='800 96px Roboto,Arial,sans-serif';x.fillText(sv.a,540,580);
    x.font='700 64px Roboto,Arial,sans-serif';x.fillStyle='#FFB066';x.fillText(r.d+' / 12 doğru · '+sureYaz(r.sn),540,680);
    var y=780;x.textAlign='left';x.font='600 40px Roboto,Arial,sans-serif';
    Object.keys(tip).forEach(function(t){x.fillStyle='rgba(255,255,255,.85)';x.fillText(TIPAD[t],150,y+14);
      x.fillStyle='rgba(255,255,255,.18)';x.fillRect(560,y-10,300,28);x.fillStyle='#FF8A1F';x.fillRect(560,y-10,300*tip[t][0]/tip[t][1],28);
      x.fillStyle='#fff';x.fillText(tip[t][0]+'/'+tip[t][1],880,y+14);y+=78;});
    x.textAlign='center';x.fillStyle='#fff';x.font='800 48px Roboto,Arial,sans-serif';x.fillText('Sen de dene 👇',540,1200);
    x.font='600 40px Roboto,Arial,sans-serif';x.fillStyle='rgba(255,255,255,.85)';x.fillText('odak.mustafaktoriyel.com/#mantik',540,1265);
    var url='https://odak.mustafaktoriyel.com/#mantik',metin='MF Mantık Testi\'nde '+sv.e+' '+sv.a+' oldum: '+r.d+'/12! Sen de dene 👉 '+url;
    c.toBlob(function(b){
      var f=null;try{f=new File([b],'mf-mantik-sonucum.png',{type:'image/png'});}catch(e){}
      if(f&&navigator.canShare&&navigator.canShare({files:[f]})){navigator.share({files:[f],text:metin}).catch(function(){});return;}
      if(navigator.share){navigator.share({text:metin,url:url}).catch(function(){});}
      var a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='mf-mantik-sonucum.png';document.body.appendChild(a);a.click();a.remove();
    },'image/png');
  }
  // devam eden test varsa geri yukle
  try{aktif=JSON.parse(localStorage.getItem(K+'-aktif')||'null');}catch(e){aktif=null;}
  if(aktif&&(aktif.h!==haftaNo()||kalan()<=0)){if(aktif.h===haftaNo())bitir();else{aktif=null;try{localStorage.removeItem(K+'-aktif');}catch(e){}}}
  window.MF_MT=function(){if(aktif){soru();clearInterval(zT);zT=setInterval(saat,500);}else giris();};
  rozet();
  if(location.hash==='#mantik'&&window.MF_SAYFA)window.MF_SAYFA('mantik');
})();

// ================= YANA KAYDIRARAK SEKME GECISI (yandaki sekme belirerek gelir) =================
(function(){
  var SIRA=['sayac','kutuphane','mantik','program'],m=document.getElementById('pm');
  var x0=0,y0=0,dx=0,iz=false,kilit='',son=[],mesgul=false,hedef=null,hEl=null,sEl=null,yon=0;
  var az=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  function simdiki(){var b=document.body.classList;return b.contains('s-program')?'program':b.contains('s-istat')?'istat':b.contains('s-mantik')?'mantik':b.contains('s-kutuphane')?'kutuphane':'sayac';}
  function sayfaEl(ad){return document.getElementById('pg-'+ad);}
  function engel(el){
    var kg=document.getElementById('kt-gor');if(kg&&!kg.hidden)return true;
    if(document.querySelector('.pm-sheet.acik,#alarm.acik,#sik-sor.acik,#pm-curu.acik,#koc-onay.acik,#pm-not.acik,#pm-dnm.acik,#sil-p.acik'))return true;
    return !!(el&&el.closest&&el.closest('input,select,textarea,.kaydir,.pm-chips,.mt-sec,.mt-noktalar,.pr-gunler,.alt-nav,.st-cizim,.dg-cip,.dg-d,.kt-gor,.kt-ort,.kt-yan'));
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
    kpi+=GUN>1?'<div><span>Günlük ortalama</span><b>'+sk(aktif?top/aktif:0)+'</b><small>'+aktif+' / '+GUN+' gün çalıştın</small></div>':'<div><span>Bugünkü oturum</span><b>'+(g[0].p)+' 🍅</b><small>tamamlanan pomodoro</small></div>';
    kpi+='<div><span>Pomodoro</span><b>'+pom+' 🍅</b><small>'+(GUN>1?'bu aralıkta':'bugün')+'</small></div>';
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
  if('serviceWorker' in navigator)window.addEventListener('load',function(){navigator.serviceWorker.register('sw.js');});
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
