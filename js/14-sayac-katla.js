
(function(){
  var $=function(i){return document.getElementById(i);};
  var saat=$('pm-saat'),bb=$('pm-basla'),sy=$('pg-sayac');if(!saat||!bb||!sy)return;
  var az=matchMedia('(prefers-reduced-motion: reduce)');
  function sure(){return az.matches?0:620;}
  // yüksekliği ölçerek yumuşak katla / aç
  function katla(e,k,aninda){
    if(!e)return;var tok=(e._oeTok||0)+1;e._oeTok=tok;
    var bitir=function(){if(e._oeTok!==tok)return;if(k){e.style.height='0px';}else{e.classList.remove('oe-kt');e.style.height='';e.style.overflow='';e.style.boxSizing='';}};
    if(k){
      if(e._oeK)return;e._oeK=1;e.inert=true;e.setAttribute('aria-hidden','true');
      e.classList.remove('seans-gizli');
      var h=e.getBoundingClientRect().height;
      e.style.boxSizing='border-box';e.style.overflow='hidden';
      if(aninda||!sure()||!h){e.classList.add('oe-kt','oe-kapan');e.style.height='0px';return;}
      e.classList.remove('oe-kt');e.style.height=h+'px';void e.offsetHeight;
      e.classList.add('oe-kt','oe-kapan');e.style.height='0px';
      setTimeout(bitir,sure()+60);
    }else{
      if(!e._oeK)return;e._oeK=0;e.inert=false;e.removeAttribute('aria-hidden');e.classList.remove('seans-gizli');
      var ec=e.classList.contains('oe-kt');e.classList.remove('oe-kt','oe-kapan');e.style.height='auto';
      var h2=e.getBoundingClientRect().height;
      if(aninda||!sure()||!h2){e.style.height='';e.style.overflow='';e.style.boxSizing='';return;}
      e.classList.add('oe-kapan');e.style.height='0px';void e.offsetHeight;
      e.classList.add('oe-kt');e.classList.remove('oe-kapan');e.style.height=h2+'px';
      setTimeout(bitir,sure()+60);
    }
  }
  window.LV_KATLA=katla;
  function hedefler(){
    // MF: ilk kart içinde mod sekmeleri, tur sırası, bildirim satırı ve ayar bloğu (sınav/ders/süre/sıkı mod) katlanır
    var l=[document.querySelector('header.ust'),sy.querySelector('.pm-mod'),$('pm-domates'),sy.querySelector('.bl-satir'),sy.querySelector('.pm-ayar')];
    var ilk=sy.querySelector('section.kart');
    [].forEach.call(sy.children,function(c){if(c!==ilk&&c!==mk)l.push(c);});
    // ilk kartta pm-kutu dışındakiler (ör. masaüstü klavye kısayolu ipucu .tb-kisa) da katlanır
    if(ilk)[].forEach.call(ilk.children,function(c){if(!c.classList.contains('pm-kutu'))l.push(c);});
    return l.filter(Boolean);
  }
  var mk=document.createElement('div');mk.className='oe-maskot';mk.id='oe-maskot';mk.setAttribute('aria-hidden','true');
  var dg=document.querySelector('#pg-sayac .pm-dugmeler');if(dg&&dg.parentNode)dg.parentNode.insertBefore(mk,dg.nextSibling);
  function maskot(){var as=!!($('pm-siki')&&$('pm-siki').checked);
    mk.innerHTML='<div class="om-i"><svg viewBox="0 0 120 120"><use href="#'+(as?'mf-aslan':'mf-kedi')+'"/></svg></div>';}
  function olc(){
    var B=Math.max(saat.offsetWidth,saat.offsetHeight)||230,kdUzun=saat.classList.contains('kd-bc')||saat.classList.contains('kd-ks'),gen=innerWidth>=760,nav=$('alt-nav');
    var nr=nav?nav.getBoundingClientRect():null;
    // alttaki menü şeridi (mobil/dikey tablet) yer kaplar; yatay tablette menü solda dikey, yer kaplamaz
    var navH=(nr&&nr.left<5&&nr.width>=innerWidth*.9)?Math.max(0,innerHeight-nr.top):0;
    var avW=gen?(sy.clientWidth-60):(innerWidth-20);
    var H=innerHeight-navH,EK=OE_EK+(gen?28:0),Wt=Math.min(avW,680),M;
    if(!kdUzun&&H-EK-64-10>=Wt){M=Math.round(Math.min(112,H-EK-10-Wt));}else{M=0;}
    maskotsuz=!M;document.body.style.setProperty('--omS',(M||64)+'px');
    var kd=window.MF_KD_ORAN&&window.MF_KD_ORAN();
    if(kd){ // yeni kadranlar kare değil: ölçek, en-boy oranına (+ etiket) göre ekrana sığacak şekilde; animasyon yine transform (scale) ile akıcı
      var Wm=Math.min((saat.parentNode&&saat.parentNode.clientWidth)||avW,gen?760:560),Bw=saat.offsetWidth||300,Bh=Bw*kd.ra+kd.e;
      maskotsuz=true;M=0;document.body.style.setProperty('--omS','64px');
      var Sk=Math.max(1,Math.min(Wm/Bw,(H-EK-12)/Bh));
      saat.style.setProperty('--lvS',Sk.toFixed(4));saat.style.setProperty('--lvI',(1/Sk).toFixed(4));saat.style.setProperty('--lvM',(Bh*(Sk-1)/2).toFixed(1)+'px');
      document.body.style.setProperty('--oeUst',Math.max(8,Math.round((H-(Bh*Sk+EK))/2))+'px');return;}
    var W=Math.max(B,Math.min(Wt,H-EK-(M?M+10:0))),S=W/B;
    var bos=H-(W+EK+(M?M+10:0));document.body.style.setProperty('--oeUst',Math.max(8,Math.round(bos/2))+'px');
    saat.style.setProperty('--lvS',S.toFixed(4));saat.style.setProperty('--lvI',(1/S).toFixed(4));saat.style.setProperty('--lvM',((W-B)/2).toFixed(1)+'px');
  }
  var acik=null,maskotsuz=false,OE_EK=115;
  function sayacSayfasi(){return !/(^|\s)s-(program|istat|mantik|mevzuat|kutuphane)(\s|$)/.test(document.body.className);}
  function guncelle(aninda){
    var on=/Duraklat/.test(bb.textContent)&&sayacSayfasi();
    if(on===acik)return;var ilk=acik===null;acik=on;
    document.body.classList.toggle('lv-odak',on); // önce tek sütun düzenine geç, sonra ölç
    if(on)olc();
    hedefler().forEach(function(e){katla(e,on,aninda||ilk);});
    if(on)maskot();katla(mk,!on||maskotsuz,aninda||ilk);
    if(on&&!ilk&&!aninda)window.scrollTo({top:0,behavior:az.matches?'auto':'smooth'});
  }
  new MutationObserver(function(){guncelle(false);}).observe(bb,{childList:true,characterData:true,subtree:true});
  new MutationObserver(function(){guncelle(true);}).observe(document.body,{attributes:true,attributeFilter:['class']});
  addEventListener('resize',function(){if(acik)olc();});
  // seansGizle, LV_KATLA'dan önce çalıştıysa seans-gizli ile gizlenmiş öğeleri katla durumuna al
  ['pm-ders-k','pm-odak-k','pm-ozel-k'].forEach(function(i){var e=$(i);if(e&&e.classList.contains('seans-gizli'))katla(e,true,true);});
  // odak açıkken sayfaya sonradan eklenen kartlar da katlansın
  new MutationObserver(function(ms){if(!acik)return;ms.forEach(function(m){[].forEach.call(m.addedNodes,function(n){if(n.nodeType===1&&n!==mk&&n.parentNode===sy&&n!==sy.querySelector('section.kart'))katla(n,true,true);});});}).observe(sy,{childList:true});
  guncelle(true);
})();
