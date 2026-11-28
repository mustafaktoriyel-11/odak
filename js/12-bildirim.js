
var BL_FB={apiKey:'AIzaSyBT_8z_ffdfhjnsCopEF158ShGI14q7yCk',authDomain:'mf-odak.firebaseapp.com',projectId:'mf-odak',messagingSenderId:'892552486311',appId:'1:892552486311:web:776f8aefdcf2008f646a82'},BL_VAPID='BGWc-eNrrArmDOFSaZQCam_wu9hrozSrMmhoy2nx4aF91gPzHNa2crZlmDETa21oiITygIULMlvXT2jmp59txaY';
(function(){
'use strict';
var KEY='mf-bildirim',FBV='10.14.1';
// Android uygulamasında (Capacitor) web push (Firebase) çalışmaz: bildirim özelliği uygulamada gizli (yerel bildirimlere geçilene dek)
// Android uygulamasında (Capacitor): telefonun yerel bildirimleri (@capacitor/local-notifications); hatırlatmalar cihazda planlanır, sunucu gerekmez
var LN=window.Capacitor&&Capacitor.Plugins&&Capacitor.Plugins.LocalNotifications,YEREL=!!LN,lnIzin='default';
var HAZIR=(String(BL_FB.apiKey).indexOf('FB_')!==0&&!window.Capacitor)||YEREL;
function $(id){return document.getElementById(id);}
function ls(k){try{return localStorage.getItem(k);}catch(e){return null;}}
function lj(k){try{return JSON.parse(ls(k)||'null');}catch(e){return null;}}
function anahtar(d){return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();}
function oku(){var a=lj(KEY);return (a&&typeof a==='object')?a:{};}
function yaz(a){try{localStorage.setItem(KEY,JSON.stringify(a));}catch(e){}}
function desteklenir(){if(YEREL)return true;return ('Notification' in window)&&('serviceWorker' in navigator);}
function izin(){if(YEREL)return lnIzin;return ('Notification' in window)?Notification.permission:'denied';}
function lnDurum(x){var d=x&&x.display;lnIzin=d==='granted'?'granted':(d==='denied'?'denied':'default');return lnIzin;}
function izinIste(){
 if(YEREL)return LN.requestPermissions().then(lnDurum,function(){return lnIzin;});
 try{return Notification.requestPermission();}catch(e){return Promise.resolve(izin());}
}
var desteksiz=!desteklenir();

var ozetSon=null;
// ---------- özet önbelleği (service worker localStorage okuyamaz) ----------
function ozetYaz(){
 try{
  var kayit=lj('pm-kayit')||{},now=new Date(),dk=[],dersler={},i;
  var gun=function(n){return new Date(now.getFullYear(),now.getMonth(),now.getDate()-n);};
  for(i=0;i<60;i++){var kk=kayit[anahtar(gun(i))];dk.push(kk&&kk.dk>0?+kk.dk:0);}
  var h7=0,h7o=0,aktif=0;
  for(i=0;i<7;i++){h7+=dk[i];if(dk[i]>0)aktif++;}
  for(i=7;i<14;i++)h7o+=dk[i];
  for(i=0;i<7;i++){var e=kayit[anahtar(gun(i))];if(e&&e.d){for(var dn in e.d){if(e.d.hasOwnProperty(dn))dersler[dn]=(dersler[dn]||0)+(+e.d[dn]||0);}}}
  var enCok='',en=0;
  for(var dd in dersler){if(dersler.hasOwnProperty(dd)&&dersler[dd]>en){en=dersler[dd];enCok=dd;}}
  var seri=0;for(i=(dk[0]>0?0:1);i<60&&dk[i]>0;i++)seri++;
  var hedef=0,pr=lj('mf-program');
  if(pr&&pr.g){var g=pr.g[(now.getDay()+6)%7]||[];for(i=0;i<g.length;i++)hedef+=(+g[i].dk||0);}
  var sn=lj('mf-sinif');
  var oz={gun:anahtar(now),t:Date.now(),bugun:Math.round(dk[0]),dun:Math.round(dk[1]),hedef:Math.round(hedef),h7:Math.round(h7),h7o:Math.round(h7o),aktif:aktif,seri:seri,enCok:enCok,koc:!!ls('mf-koc-kod'),sinif:sn&&sn.sinif?sn.sinif:''};
  ozetSon=oz;
  if(window.caches&&caches.open){caches.open('mf-ozet').then(function(c){return c.put('./__ozet',new Response(JSON.stringify(oz),{headers:{'Content-Type':'application/json'}}));}).catch(function(){});}
 }catch(e){}
}

// ---------- Firebase token (yalnız izin verildiyse) ----------
function tokenAl(){
 if(!HAZIR||!desteklenir()||izin()!=='granted')return Promise.resolve('');
 var A,M;
 return import('https://www.gstatic.com/firebasejs/'+FBV+'/firebase-app.js').then(function(a){
  A=a;return import('https://www.gstatic.com/firebasejs/'+FBV+'/firebase-messaging.js');
 }).then(function(m){
  M=m;return m.isSupported();
 }).then(function(ok){
  if(!ok){desteksiz=true;satirGuncelle();return '';}
  var app;try{app=A.getApp('mf');}catch(e){app=A.initializeApp(BL_FB,'mf');}
  var msg=M.getMessaging(app);
  return navigator.serviceWorker.ready.then(function(reg){return M.getToken(msg,{vapidKey:BL_VAPID,serviceWorkerRegistration:reg});});
 }).then(function(t){return t||'';},function(){return '';});
}

// ---------- sunucuya kayıt ----------
function gonder(a,token){
 if(typeof KOC_URL==='undefined'||!KOC_URL)return;
 var tk=token||a.token||'';
 try{
  fetch(KOC_URL,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain'},body:JSON.stringify({tip:'bildirim',cihaz:ls('mf-cihaz')||'',token:tk,s1:a.s1||'17:00',s2:a.s2||'21:30',acik:!!a.acik,kod:(ls('mf-koc-kod')||'')})}).catch(function(){});
  if(a.acik){a.tgon=anahtar(new Date());}
  yaz(a);
 }catch(e){}
}
function tokenleGonder(a){
 if(YEREL){planla();return Promise.resolve();}
 return tokenAl().then(function(t){
  if(t)a.token=t;
  if(!t&&a.acik&&!a.token)return;
  gonder(a,t);
 });
}
function gunlukYenile(){
 if(YEREL){planla();return;}
 if(!HAZIR)return;
 var a=oku();
 if(!a.acik||izin()!=='granted'||a.tgon===anahtar(new Date()))return;
 tokenleGonder(a);
}

// ---------- alt sayfa yardımcısı (SN deseni) ----------
function sayfa(id,kod,cb){
 var el=$(id),st={acik:false,karar:false};
 function ac(){
  if(st.acik||!el)return;
  st.acik=true;st.karar=false;el.classList.add('acik');
  requestAnimationFrame(function(){requestAnimationFrame(function(){el.classList.add('gor');});});
  if(window.LEX_GERI&&LEX_GERI.ekle)LEX_GERI.ekle(kod,kapat);
 }
 function kapat(){
  if(!st.acik)return;
  st.acik=false;el.classList.remove('gor');
  if(cb)cb();
  setTimeout(function(){if(!st.acik)el.classList.remove('acik');},280);
 }
 function kapatTikla(){
  if(window.LEX_GERI&&LEX_GERI.dus)LEX_GERI.dus(kod);
  kapat();
 }
 return {el:el,st:st,ac:ac,kapat:kapat,kapatTikla:kapatTikla};
}

var satir=$('bl-deg');
var P=sayfa('bl-p','bl'),Q=sayfa('bl-q','blq',function(){if(!Q.st.karar){Q.st.karar=true;var a=oku();a.tsor=(a.tsor||0)+1;a.tsonsor=Date.now();yaz(a);}});
if(!satir||!P.el||!Q.el){ozetYaz();return;}

var zil=null,saat=$('pm-saat');
if(saat){zil=document.createElement('button');zil.type='button';zil.id='bl-zil';zil.className='bl-zil';zil.hidden=true;zil.setAttribute('aria-label','Bildirim ayarları');
 zil.innerHTML='<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22zm7-6V11a7 7 0 0 0-5.5-6.84V3.5a1.5 1.5 0 0 0-3 0v.66A7 7 0 0 0 5 11v5l-2 2v1h18v-1z"/></svg>';
 saat.appendChild(zil);zil.addEventListener('click',function(){satir.click();});}
function satirGuncelle(){
 var a=oku(),et=$('bl-et'),kutu=satir.parentNode;
 if(!HAZIR){if(kutu)kutu.hidden=true;return;}
 var acikMi=!desteksiz&&a.acik&&izin()==='granted',koclu=true;
 if(kutu){
  if(!kutu._yer){kutu._yer=document.createComment('bl');kutu.parentNode.insertBefore(kutu._yer,kutu);}
  // Bildirim açılana kadar sıkı modun üstünde uyarı olarak durur (öncelik öğrenciye açtırmak); açılınca Ayarlar'a taşınır
  var ayBl=$('ay-bl'),sik=$('pm-sik-k'),ayara=(acikMi||desteksiz)&&ayBl;
  if(ayara){if(kutu.parentNode!==ayBl)ayBl.appendChild(kutu);ayBl.hidden=false;kutu.classList.remove('bl-uyar','bl-alt');}
  else if(sik){if(kutu.nextSibling!==sik)sik.parentNode.insertBefore(kutu,sik);if(ayBl)ayBl.hidden=true;kutu.classList.add('bl-uyar');kutu.classList.remove('bl-alt');}
  kutu.hidden=false;
 }
 if(zil)zil.hidden=true;
 var t;
 if(desteksiz)t='Bu cihaz desteklemiyor';
 else if(izin()==='denied')t='Telefon ayarlarından izin ver';
 else if(a.acik&&izin()==='granted')t='Açık '+(a.s1||'17:00')+' / '+(a.s2||'21:30');
 else t='Kapalı';
 et.innerHTML='<svg class="ic" aria-hidden="true"><use href="#i-zil"/></svg>'+(kutu&&kutu.classList.contains('bl-uyar')?(izin()==='denied'?'Bildirimlere izin ver: telefon ayarları':'Bildirimleri aç, günlük hatırlatma al'):'Bildirimler · '+t);
}

// ---------- ayar sayfası ----------
var sw=$('bl-sw'),s1=$('bl-s1'),s2=$('bl-s2'),uy=$('bl-uyari'),acikDeger=false;
function saatler(bas,bit){var r=[];for(var m=bas*60;m<=bit*60;m+=30){var h=Math.floor(m/60),n=m%60;r.push((h<10?'0':'')+h+':'+(n?'30':'00'));}return r;}
function doldur(s,liste,sec){
 s.innerHTML='';
 for(var i=0;i<liste.length;i++){var o=document.createElement('option');o.value=o.textContent=liste[i];if(liste[i]===sec)o.selected=true;s.appendChild(o);}
}
function swCiz(){sw.setAttribute('aria-checked',acikDeger?'true':'false');}
function uyari(m){if(m){uy.textContent=m;uy.hidden=false;}else{uy.hidden=true;}}
function ayarAc(){
 var a=oku();
 doldur(s1,saatler(12,20),a.s1||'17:00');
 doldur(s2,saatler(19,23.5),a.s2||'21:30');
 acikDeger=!!a.acik&&izin()==='granted';swCiz();
 uyari(desteksiz?'Bu cihaz desteklemiyor':(izin()==='denied'?'Telefon ayarlarından izin ver':''));
 P.ac();
}
function kocKod(){try{return (localStorage.getItem('mf-koc-kod')||'').trim();}catch(e){return '';}}
sw.addEventListener('click',function(){
 if(acikDeger&&kocKod()){uyari('Koçluk öğrencilerinde bildirimler açık kalır. Saatlerini değiştirebilirsin.');return;}
 acikDeger=!acikDeger;swCiz();});
satir.addEventListener('click',ayarAc);
P.el.addEventListener('click',function(e){if(e.target===P.el)P.kapatTikla();});
$('bl-kaydet').addEventListener('click',function(){
 var a=oku();a.s1=s1.value;a.s2=s2.value;
 if(!acikDeger){
  a.acik=false;yaz(a);gonder(a,'');satirGuncelle();P.kapatTikla();return;
 }
 if(desteksiz||(!YEREL&&!('Notification' in window))){uyari('Bu cihaz desteklemiyor');return;}
 var sonra=function(){
  if(izin()!=='granted'){a.acik=false;yaz(a);satirGuncelle();uyari('Telefon ayarlarından izin ver');acikDeger=false;swCiz();return;}
  a.acik=true;yaz(a);satirGuncelle();P.kapatTikla();
  tokenleGonder(a).then(satirGuncelle);
 };
 if(izin()==='default'){izinIste().then(sonra,sonra);}else{sonra();}
});

// ---------- izin sorma ----------
function aciksa(){var l=document.querySelectorAll('.pm-sheet.acik');return l.length>0;}
function sormaUygun(){
 if(!HAZIR||desteksiz||izin()!=='default')return false;
 if(document.visibilityState&&document.visibilityState!=='visible')return false;
 var a=oku();
 if(typeof a.acik!=='undefined')return false;
 if((a.tsor||0)>=3)return false;
 if(a.tsonsor&&Date.now()-a.tsonsor<3*86400000)return false;
 var k=lj('pm-kayit'),b=k&&k[anahtar(new Date())];
 if(!b||!(b.p>=1))return false;
 var d=lj('pm-durum');if(d&&d.calisiyor===true)return false;
 return !aciksa();
}
function sorKontrol(){if(!Q.st.acik&&sormaUygun()){var a=oku();$('bl-qac').textContent=(a.s1||'17:00')+" ve "+(a.s2||'21:30')+"'da kısa bir not. İstediğin zaman kapatabilirsin.";Q.ac();}}
function sorDegil(){Q.kapatTikla();}
$('bl-hayir').addEventListener('click',sorDegil);
Q.el.addEventListener('click',function(e){if(e.target===Q.el)sorDegil();});
$('bl-evet').addEventListener('click',function(){
 var a=oku();
 var sonra=function(){
  Q.st.karar=true;Q.kapatTikla();
  a=oku();
  if(izin()==='granted'){a.acik=true;yaz(a);satirGuncelle();tokenleGonder(a).then(satirGuncelle);}
  else if(izin()==='denied'){a.acik=false;yaz(a);satirGuncelle();}
  else{a.tsor=(a.tsor||0)+1;a.tsonsor=Date.now();yaz(a);}
 };
 izinIste().then(sonra,sonra);
});
// ---------- koç kodlu öğrenci: izin yoksa her açılışta şerit ----------
var serit=null;
function seritGuncelle(){
 var sayfa=$('pg-sayac');if(!sayfa||!HAZIR||desteksiz)return;
 var a=oku(),gerek=!YEREL&&!!kocKod()&&!(a.acik&&izin()==='granted');
 if(!gerek){if(serit)serit.hidden=true;return;}
 if(!serit){serit=document.createElement('button');serit.type='button';serit.className='bl-serit';
  var km=$('km-kutu');sayfa.insertBefore(serit,km?km.nextSibling:sayfa.firstChild);
  serit.addEventListener('click',function(){
   if(izin()==='denied'){serit.classList.add('acik');return;}
   if(izin()==='granted'){ayarAc();acikDeger=true;swCiz();return;}
   var sonra=function(){var b=oku();if(izin()==='granted'){b.acik=true;yaz(b);satirGuncelle();tokenleGonder(b).then(satirGuncelle);}seritGuncelle();};
   izinIste().then(sonra,sonra);
  });}
 serit.hidden=false;serit.classList.toggle('acik',izin()==='denied');
 serit.innerHTML=izin()==='denied'
  ?'<b><svg class="ic" aria-hidden="true"><use href="#i-zil-yok"/></svg>Koçunun mesajları sana ulaşmıyor</b><span>Bildirim izni telefon ayarlarından kapatılmış.</span><small>Aç: Telefon Ayarları → Uygulamalar → MF Odak (ya da Chrome) → Bildirimler → İzin ver</small>'
  :'<b><svg class="ic" aria-hidden="true"><use href="#i-zil-yok"/></svg>Koçunun mesajları sana ulaşmıyor</b><span>Bildirimleri aç ›</span>';
}
var _sg=satirGuncelle;satirGuncelle=function(){_sg();seritGuncelle();};
document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible')seritGuncelle();});
setTimeout(seritGuncelle,3000);
// ---------- yerel bildirim planı (Android uygulaması) ----------
// Önümüzdeki 7 günün iki saati (s1, s2) için bildirim kurulur; uygulama her açılıp kapandığında bugünün durumuna göre yenilenir.
var LN_ID0=7000,lnKanal=false;
function planla(){
 if(!YEREL)return;
 var ids=[];for(var i=0;i<14;i++)ids.push({id:LN_ID0+i});
 var a=oku();
 LN.cancel({notifications:ids}).catch(function(){}).then(function(){
  if(!a.acik||lnIzin!=='granted')return;
  var kanal=lnKanal?Promise.resolve():LN.createChannel({id:'hatirlatma',name:'Hatırlatmalar',description:'Günlük çalışma ve Yolculuk hatırlatmaları',importance:3}).then(function(){lnKanal=true;},function(){});
  return kanal.then(function(){
   ozetYaz();var oz=ozetSon||{},iz=null;try{iz=window.MF_IZ_OZET&&window.MF_IZ_OZET();}catch(e){}
   var yol=!!(iz&&iz.sinif),now=new Date(),liste=[];
   var gun1=[['Bugünün 5 sorusu hazır','Matematiğin izinde yeni bir gün. 10 dakikada çöz, haritada ilerle.'],['Odak vakti','Bir odak turu başlat, telefonu kenara koy. Gerisi kendiliğinden gelir.'],['Bugünün 5 sorusu seni bekliyor','Her gün 5 soru, dünya turunda bir adım daha.'],['Küçük bir başlangıç yeter','25 dakikalık bir odak turuyla güne başla.']];
   var gun2=[['Gün bitmeden','Bugünün setini çözdün mü? Serin bozulmasın.'],['Günü kapatmadan','5 soru, 10 dakika. Yarın daha kolay başlarsın.'],['Bugün nasıl geçti?','Çalıştığın süreleri kaydetmeyi unutma.']];
   function ekle(n,gunNo,saat,baslik,metin,git){
    var p=(saat||'').split(':'),t=new Date(now.getFullYear(),now.getMonth(),now.getDate()+gunNo,+p[0]||17,+p[1]||0,0);
    if(t.getTime()<=Date.now()+60000)return;
    liste.push({id:LN_ID0+n,title:baslik,body:metin,schedule:{at:t,allowWhileIdle:true},channelId:'hatirlatma',smallIcon:'mf_bildirim',iconColor:'#FF8A1F',extra:{git:git||''}});
   }
   for(var d=0;d<7;d++){
    var k=(now.getDate()+d)%4,b1=gun1[k],b2=gun2[(now.getDate()+d)%3],git1=yol?'mantik':'sayac';
    if(!yol){b1=gun1[(d%2)?3:1];b2=gun2[2];}
    if(d===0){
     var kalan=Math.max(0,(oz.hedef||0)-(oz.bugun||0));
     if(yol&&!iz.bugunTamam){b1=['Bugünün 5 sorusu hazır',iz.sonraki?'Sıradaki durak: '+iz.sonraki+'. 10 dakikada çöz, haritada ilerle.':'10 dakikada çöz, serini sürdür.'];}
     else if(kalan>0){b1=['Çalışma vakti','Bugünkü planında '+kalan+' dk kaldı. Bir odak turuyla başla.'];git1='sayac';}
     else if(oz.bugun>0){b1=null;}
     if(yol&&!iz.bugunTamam)b2=iz.seri>0?['Serin '+iz.seri+' gün','Gün bitmeden bugünün setini çöz, serin bozulmasın.']:b2;
     else if(oz.bugun>0)b2=null;
    }
    if(b1)ekle(d*2,d,a.s1||'17:00',b1[0],b1[1],git1);
    if(b2)ekle(d*2+1,d,a.s2||'21:30',b2[0],b2[1],yol?'mantik':'sayac');
   }
   if(liste.length)return LN.schedule({notifications:liste});
  });
 }).catch(function(){});
}
if(YEREL){
 try{LN.addListener('localNotificationActionPerformed',function(e){var g=e&&e.notification&&e.notification.extra&&e.notification.extra.git;if(g&&window.MF_SAYFA)setTimeout(function(){window.MF_SAYFA(g);},300);});}catch(e){}
 LN.checkPermissions().then(function(x){lnDurum(x);satirGuncelle();planla();},function(){});
 document.addEventListener('visibilitychange',function(){planla();});
}
// ---------- başlat ----------
satirGuncelle();
ozetYaz();
setInterval(function(){ozetYaz();sorKontrol();},60000);
document.addEventListener('visibilitychange',function(){
 if(document.visibilityState==='hidden')ozetYaz();
 else{ozetYaz();setTimeout(sorKontrol,1500);}
});
window.addEventListener('mf-sinif-degisti',ozetYaz);
setTimeout(gunlukYenile,4000);setTimeout(sorKontrol,5000);
})();
