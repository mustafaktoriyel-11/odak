
// ---- Masaüstü: klavye kısayolları ----
(function(){
  function $(i){return document.getElementById(i);}
  function yaziyor(e){var t=e.target;if(!t||!t.tagName)return false;var n=t.tagName;return n==='INPUT'||n==='TEXTAREA'||n==='SELECT'||t.isContentEditable;}
  function sekme(){var b=document.body.classList;return b.contains('s-mevzuat')?'mevzuat':b.contains('s-mantik')?'mantik':b.contains('s-kutuphane')?'kutuphane':b.contains('s-program')||b.contains('s-istat')?'takip':'sayac';}
  function gorAcik(){var g=$('kt-gor');return g&&!g.hidden;}
  function sayfaGit(yon){
    var k=$('kt-gor-kaydir');if(!k)return;
    var L=[].slice.call(k.querySelectorAll('.kt-sf'));if(!L.length){k.scrollBy({top:yon*k.clientHeight*.9,behavior:'smooth'});return;}
    var gs=/^(\d+)/.exec(($('kt-gor-sayfa')||{}).textContent||''),i=gs?(+gs[1]-1):0;
    var h=L[Math.max(0,Math.min(L.length-1,i+yon))];k.scrollTo({top:Math.max(0,h.offsetTop-8),behavior:'smooth'});
  }
  document.addEventListener('keydown',function(e){
    if(e.ctrlKey||e.metaKey||e.altKey)return;
    if(e.key==='Escape'){
      if(yaziyor(e)&&e.target.value){return;}
      if(window.LEX_GERI&&LEX_GERI.ust()){e.preventDefault();history.back();}
      return;
    }
    if(yaziyor(e))return;
    if(gorAcik()){
      if(e.key==='ArrowRight'||e.key==='PageDown'){e.preventDefault();sayfaGit(1);}
      else if(e.key==='ArrowLeft'||e.key==='PageUp'){e.preventDefault();sayfaGit(-1);}
      return;
    }
    if(e.key===' '||e.code==='Space'){
      var t=e.target;if(t&&(t.tagName==='BUTTON'||t.tagName==='SUMMARY'||t.getAttribute&&t.getAttribute('role')==='button'))return;
      if(sekme()!=='sayac'||document.querySelector('.pm-sheet.acik'))return;
      var b=$('pm-basla');if(b&&!b.disabled&&b.offsetParent){e.preventDefault();b.click();}
      return;
    }
    if(e.key==='/'&&sekme()==='mevzuat'){
      var k=$('mv-kanun-k'),i=k&&!k.hidden?$('mv-ic-ara'):$('mv-ara');
      if(i){e.preventDefault();i.focus();i.select&&i.select();}
    }
  });
  // sayaç altına kısayol ipucu (yalnız fareli geniş ekranda görünür)
  var d=$('pm-basla');var kap=d&&d.closest('section.kart');
  if(kap){var p=document.createElement('p');p.className='tb-kisa';p.innerHTML='<kbd>Boşluk</kbd> başlat / durdur · <kbd>Esc</kbd> geri';kap.appendChild(p);}
})();
