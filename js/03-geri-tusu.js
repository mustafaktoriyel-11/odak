
// ================= GERİ TUŞU =================
(function(){
  var G=[];   // {k:anahtar, fn:geri dönüş, iptal}
  try{history.scrollRestoration='manual';}catch(e){}
  function ust(){return G[G.length-1];}
  function ekle(k,fn){G.push({k:k,fn:fn});try{history.pushState({lex:G.length},'');}catch(e){}}
  function dus(k){var u=ust();if(u&&!u.iptal&&(!k||u.k===k)){u.iptal=true;history.back();return true;}return false;}
  function hepsi(){if(!G.length)return;G.forEach(function(x){x.iptal=true;});history.go(-G.length);}
  addEventListener('popstate',function(e){
    var d=(e.state&&e.state.lex)||0,cal=[];
    while(G.length>d)cal.push(G.pop());
    cal.forEach(function(x){if(!x.iptal)try{x.fn();}catch(_){}});
    var k=0;for(var i=G.length-1;i>=0&&G[i].iptal;i--)k++;   // iptal edilmiş kayıtları atla
    if(k)history.go(-k);
  });
  function sekme(){var c=document.body.classList;return c.contains('s-mevzuat')?'mevzuat':c.contains('s-mantik')?'mantik':c.contains('s-program')?'program':c.contains('s-istat')?'istat':c.contains('s-kutuphane')?'kutuphane':'sayac';}
  // sekme değişimi (alt menü ya da kaydırma): geri tuşu ana sekmeye (Sayaç) döner
  function sekmeGec(h){var c=sekme();if(!h||h===c)return;
    if(h==='sayac'){hepsi();return;}
    var canli=G.filter(function(x){return !x.iptal;});
    if(canli.length===1&&canli[0]===ust()&&ust().k==='tab')return;
    G.forEach(function(x){x.iptal=true;});
    ekle('tab',function(){if(window.MF_SAYFA)window.MF_SAYFA('sayac');});
  }
  window.LEX_GERI={ekle:ekle,dus:dus,hepsi:hepsi,sekme:sekmeGec,ust:function(){var u=ust();return u&&!u.iptal?u.k:null;}};
  window.LEX_SEKME=sekme;
  var nav=document.getElementById('alt-nav');
  if(nav)nav.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('button[data-s]');if(b)sekmeGec(b.dataset.s);},true);
})();
