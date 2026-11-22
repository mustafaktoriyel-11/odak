
(function(){
'use strict';
// her yıl ÖSYM/MEB takvimine göre güncelle (YKS: TYT günü 10:15, LGS: 09:30; İstanbul saati)
var SN_TAKVIM={YKS:{ad:'YKS',tarih:'2027-06-19',saat:'10:15'},LGS:{ad:'LGS',tarih:'2027-06-13',saat:'09:30'}};
var KEY='mf-sinif',GEC='mf-sinif-gec';
var SINIFLAR=[['6','Ortaokul'],['7','Ortaokul'],['8','LGS'],['9',''],['10',''],['11',''],['12',''],['Mezun','YKS']];
var ALANLAR=[['SAY','Sayısal'],['EA','Eşit Ağırlık'],['SOZ','Sözel'],['','Henüz karar vermedim']];
var ALAN_AD={SAY:'Sayısal',EA:'Eşit Ağırlık',SOZ:'Sözel'},ALAN_KISA={SAY:'SAY',EA:'EA',SOZ:'SÖZ'};
var DERS_SIRA={
 SAY:['Matematik','Geometri','Fizik','Kimya','Biyoloji','Türkçe'],
 EA:['Matematik','Geometri','Edebiyat','Tarih','Coğrafya','Türkçe'],
 SOZ:['Edebiyat','Tarih','Coğrafya','Felsefe','Türkçe','Din Kültürü'],
 '8':['Matematik','Türkçe','Fen Bilimleri','İnkılap Tarihi','İngilizce','Din Kültürü']
};
function ORTA(s){return s==='6'||s==='7'||s==='8';}
function $(id){return document.getElementById(id);}
function oku(){try{var x=JSON.parse(localStorage.getItem(KEY)||'null');return x&&x.sinif?x:null;}catch(e){return null;}}
function var_(k){try{return localStorage.getItem(k);}catch(e){return null;}}
window.MF_SINIF=function(){var x=oku();return x?{sinif:String(x.sinif),alan:x.alan||''}:null;};
var sp=$('sn-p');if(!sp)return;

// ---- kart + geri sayım ----
function bugunIst(){
 var p=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Istanbul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()).split('-');
 return Date.UTC(+p[0],+p[1]-1,+p[2]);
}
function gunKaldi(tarih){var q=tarih.split('-');return Math.round((Date.UTC(+q[0],+q[1]-1,+q[2])-bugunIst())/86400000);}
function etiket(f){
 var a=f.alan;
 if(f.sinif==='Mezun')return 'Mezun'+(a?' · '+ALAN_KISA[a]:'');
 return f.sinif+'. sınıf'+((f.sinif==='11'||f.sinif==='12')&&a?' · '+ALAN_AD[a]:'');
}
function kartGuncelle(){
 var f=window.MF_SINIF(),k=$('sn-kart'),i=$('sn-ince'),say=$('sn-say');
 var ilk=!f&&!var_(GEC);   // pencere açılmak üzere: kart gösterme
 if(!f){k.hidden=true;i.hidden=ilk||!var_(GEC);say.hidden=true;return;}
 i.hidden=true;k.hidden=false;
 $('sn-et').textContent=etiket(f);
 var t=null;
 if(f.sinif==='12'||f.sinif==='Mezun')t=SN_TAKVIM.YKS;else if(f.sinif==='8')t=SN_TAKVIM.LGS;
 var m='';
 if(t){var n=gunKaldi(t.tarih);if(n>0)m='<small>'+t.ad+'</small><b>'+n+' gün</b>';else if(n===0)m='<small>'+t.ad+'</small><b>bugün</b>';}
 say.innerHTML=m;say.hidden=!m;say.dataset.kisa=m;
 if(t){var q=t.tarih.split('-'),AYL=['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
  var hedef=new Date(+q[0],+q[1]-1,+q[2],+t.saat.split(':')[0],+t.saat.split(':')[1]),fark=hedef-Date.now();
  var gun=Math.floor(fark/864e5),sa=Math.floor(fark%864e5/36e5);
  say.dataset.uzun=fark>0?('<small>'+(+q[2])+' '+AYL[+q[1]-1].slice(0,3)+' · '+t.saat+'</small><b>'+gun+'g '+sa+'sa</b>'):m;
  say.setAttribute('aria-label',fark>0?t.ad+' '+(+q[2])+' '+AYL[+q[1]-1]+' '+t.saat+', '+gun+' gün '+sa+' saat kaldı':t.ad);}
}

// ---- kişiselleştirme ----
function sinavUygula(){
 var f=window.MF_SINIF(),se=$('pm-sinav');if(!f||!se||se.disabled)return;
 var h;
 if(ORTA(f.sinif))h='LGS';
 else if(f.sinif==='12'||f.sinif==='Mezun')h=f.alan||'TYT';
 else h='TYT';
 if(!se.querySelector('option[value="'+h+'"]'))return;
 var ay=null;try{ay=JSON.parse(localStorage.getItem('pm-ayar')||'null');}catch(e){}
 var oto=var_('mf-sinav-oto'),elle=var_('mf-sinav-elle');
 var ok=!ay||!ay.sinav||(!elle&&oto&&ay.sinav===oto);   // kullanıcının kendi seçimi asla ezilmez
 if(!ok)return;
 try{localStorage.setItem('mf-sinav-oto',h);}catch(e){}
 if(se.value!==h||!ay||!ay.sinav){se.value=h;window.__snOto=1;try{se.dispatchEvent(new Event('change',{bubbles:true}));}finally{window.__snOto=0;}}
}
document.addEventListener('change',function(e){
 if(e.target&&e.target.id==='pm-sinav'&&!window.__snOto){try{localStorage.setItem('mf-sinav-elle','1');}catch(x){}}
},true);
var ORJ=null;
function dersIzin(f){
 if(!f||!f.sinif)return null;
 if(f.sinif==='8')return ['Matematik','Türkçe','Fen Bilimleri','İnkılap Tarihi','İngilizce','Din Kültürü','Diğer'];
 if(ORTA(f.sinif))return ['Matematik','Türkçe','Fen Bilimleri','Sosyal Bilgiler','İngilizce','Din Kültürü','Diğer'];
 var L=['Matematik','Geometri','Türkçe','Edebiyat','Fizik','Kimya','Biyoloji','Tarih','Coğrafya','Felsefe','Din Kültürü','İngilizce','Diğer'];
 if(f.alan==='SAY')L=L.filter(function(x){return x!=='Edebiyat';});
 return L;
}
function dersSirala(){
 var f=window.MF_SINIF(),sel=$('pm-ders'),kap=$('pm-ders-c');if(!sel||!kap)return;
 if(!ORJ)ORJ=[].map.call(sel.options,function(o){return o.value||o.text;});
 var anah=f&&(ORTA(f.sinif)?'8':((f.sinif==='11'||f.sinif==='12'||f.sinif==='Mezun')&&f.alan?f.alan:''));
 var on=(anah&&DERS_SIRA[anah])||[];
 var yeni=on.filter(function(x){return ORJ.indexOf(x)>=0;}).concat(ORJ.filter(function(x){return on.indexOf(x)<0;}));
 // sınıfa göre süzme: yalnız o sınıfın dersleri görünür (sınıf seçilmediyse hepsi)
 var izin=dersIzin(f);
 if(izin)yeni=yeni.filter(function(x){return izin.indexOf(x)>=0;}).concat(yeni.filter(function(x){return izin.indexOf(x)<0;}));
 var v=sel.value;
 yeni.forEach(function(ad){
  var o=[].filter.call(sel.options,function(x){return (x.value||x.text)===ad;})[0];if(o)sel.appendChild(o);
  var b=[].filter.call(kap.children,function(x){return x.dataset.v===ad;})[0];if(b)kap.appendChild(b);
 });
 [].forEach.call(kap.children,function(x){x.hidden=!!izin&&izin.indexOf(x.dataset.v)<0;});
 if(izin&&izin.indexOf(v)<0){v=izin[0];sel.value=v;sel.dispatchEvent(new Event('change'));}
 sel.value=v;kap.scrollLeft=0;
 var sec=kap.querySelector('.on');if(sec&&sec.offsetLeft>kap.clientWidth-60)kap.scrollLeft=Math.max(0,sec.offsetLeft-kap.offsetLeft-16);
}
function uygula(){kartGuncelle();sinavUygula();dersSirala();if(window.MF_SB_GUNCELLE)window.MF_SB_GUNCELLE();}

// ---- seçim penceresi ----
var st={sinif:'',alan:'',adim:1,acik:false};
function adimGoster(n){
 st.adim=n;$('sn-a1').hidden=n!==1;$('sn-a2').hidden=n!==2;
 $('sn-adim').textContent=n===2?'2 / 2':'';
 $('sn-bas').textContent=n===1?'Kaçıncı sınıftasın?':'Alanın?';
 if(n===1)cizSinif();else cizAlan();
 $('sn-gec').textContent=oku()?'Vazgeç':'Şimdilik geç';
 var k=sp.querySelector('.sheet-k');if(k)k.scrollTop=0;
}
function needAlan(s){return s==='11'||s==='12'||s==='Mezun';}
function dugme(b,on,fn){b.type='button';if(on)b.className='on';b.setAttribute('aria-pressed',!!on);b.addEventListener('click',fn);return b;}
function cizSinif(){
 var k=$('sn-siniflar');k.innerHTML='';
 SINIFLAR.forEach(function(x){
  var b=document.createElement('button'),t=document.createElement('b');t.textContent=x[0];b.appendChild(t);
  if(x[1]){var s=document.createElement('small');s.textContent=x[1];b.appendChild(s);}
  b.dataset.v=x[0];
  dugme(b,st.sinif===x[0],function(){st.sinif=x[0];if(needAlan(x[0])){adimGoster(2);}else{kaydet(x[0],'');}});
  k.appendChild(b);
 });
}
function cizAlan(){
 var k=$('sn-alanlar');k.innerHTML='';
 ALANLAR.forEach(function(x){
  var b=document.createElement('button');b.textContent=x[1];b.dataset.v=x[0];
  dugme(b,st.alan===x[0],function(){st.alan=x[0];kaydet(st.sinif,x[0]);});
  k.appendChild(b);
 });
}
function ac(){
 if(st.acik)return;
 var o=oku();st.sinif=o?String(o.sinif):'';st.alan=o&&o.alan?o.alan:'';
 st.acik=true;adimGoster(1);
 sp.classList.add('acik');
 requestAnimationFrame(function(){requestAnimationFrame(function(){sp.classList.add('gor');});});
 if(window.LEX_GERI&&LEX_GERI.ekle)LEX_GERI.ekle('sn',kapat);
}
function kapat(){
 if(!st.acik)return;
 st.acik=false;sp.classList.remove('gor');
 setTimeout(function(){if(!st.acik)sp.classList.remove('acik');},280);
}
function kapatTikla(){
 if(window.LEX_GERI&&LEX_GERI.dus)LEX_GERI.dus('sn');
 kapat();
}
function kaydet(s,a){
 try{localStorage.setItem(KEY,JSON.stringify({sinif:s,alan:a||'',t:Date.now()}));}catch(e){}
 kapatTikla();uygula();
 try{window.dispatchEvent(new Event('mf-sinif-degisti'));}catch(e){}
}
function gec(){
 if(!oku()){try{localStorage.setItem(GEC,String(Date.now()));}catch(e){}}
 kapatTikla();kartGuncelle();
}
sp.addEventListener('click',function(e){if(e.target===sp)gec();});
$('sn-gec').addEventListener('click',gec);
$('sn-geri').addEventListener('click',function(){adimGoster(1);});
$('sn-deg').addEventListener('click',ac);
$('sn-ince').addEventListener('click',ac);
$('sn-say').addEventListener('click',function(){var e=this;if(e.dataset.uzun){e.innerHTML=e.dataset.uzun;clearTimeout(e._z);e._z=setTimeout(function(){e.innerHTML=e.dataset.kisa;},4000);}});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&st.acik)gec();});
// geri tuşu pencereyi kapattığında (kapat çağrısı) "geç" kaydı da yapılsın
var kapat0=kapat;kapat=function(){var w=st.acik;kapat0();if(w&&!oku()&&!var_(GEC)){try{localStorage.setItem(GEC,String(Date.now()));}catch(e){}kartGuncelle();}};

// ---- ilk açılışta otomatik aç ----
function otoAc(){
 if(oku()||var_(GEC))return;
 var t0=Date.now(),iv=setInterval(function(){
  if(oku()||var_(GEC)||st.acik){clearInterval(iv);return;}
  var ac_=$('mf-acilis');
  if(ac_&&Date.now()-t0<8000)return;
  if(document.querySelector('.pm-sheet.acik,[role=dialog].acik'))return;
  clearInterval(iv);ac();
 },250);
}
uygula();otoAc();
document.addEventListener('visibilitychange',function(){if(!document.hidden)kartGuncelle();});
setInterval(kartGuncelle,60000);
})();
