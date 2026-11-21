
// ---- Alt sayfalar: aşağı kaydırarak kapatma (genel yardımcı) ----
// ksKapat(sayfa, kapatFn, perde)
//   sayfa : kapanacak panel (içinde .sheet-k varsa o kaydırılır, yoksa sayfanın kendisi)
//   kapatFn: mevcut kapatma yolu (ör. Tamam/Vazgeç düğmesine tıklamak)
//   perde : arka plan kararan öğe (verilmezse sayfa kendisi)
function ksKapat(sayfa, kapatFn, perde){
  var pan=sayfa.querySelector(':scope>.sheet-k')||sayfa, fon=perde||sayfa;
  var y0=null,x0=0,dy=0,t0=0,basladi=false,yut=false,h=0,baz=.5;
  function bgA(){var m=/([\d.]+)\)\s*$/.exec(getComputedStyle(fon).backgroundColor);return m?+m[1]:.5;}
  function kaydirilabilir(t){ // hedef ile panel arasında kaydırılmış bir öğe varsa sürükleme başlamaz
    for(var n=t;n&&n.nodeType===1;n=n.parentNode){if(n.scrollTop>0)return true;if(n===pan)break;}
    return false;}
  function bas(e){
    if(e.target.closest&&e.target.closest('input,select,textarea,a,[contenteditable]'))return;
    if(kaydirilabilir(e.target))return;
    var p=e.touches?e.touches[0]:e;y0=p.clientY;x0=p.clientX;dy=0;t0=Date.now();basladi=false;
    if(!e.touches){e.preventDefault();var sl=window.getSelection&&window.getSelection();if(sl)sl.removeAllRanges();}}
  function hareket(e){
    if(y0===null)return;var p=e.touches?e.touches[0]:e,d=p.clientY-y0,dx=Math.abs(p.clientX-x0);
    if(!basladi){
      if(d>8&&d>dx){basladi=true;h=pan.offsetHeight||400;baz=bgA();pan.style.transition='none';fon.style.transition='none';}
      else if(Math.abs(d)>8||dx>8){y0=null;return;}
      else return;}
    dy=Math.max(0,d);
    pan.style.transform='translateY('+dy+'px)';
    fon.style.background='rgba(10,16,48,'+(baz*Math.max(0,1-dy/h)).toFixed(3)+')';
    if(e.cancelable)e.preventDefault();}
  function bitir(){
    if(y0===null)return;y0=null;if(!basladi)return;basladi=false;
    yut=true;setTimeout(function(){yut=false;},350);
    var hiz=dy/Math.max(1,Date.now()-t0);
    pan.style.transition='transform .2s ease-out';fon.style.transition='background .2s';
    if(dy>h*.25||(hiz>.5&&dy>30)){
      pan.style.transform='translateY('+(pan.offsetHeight+dy)+'px)';
      fon.style.background='rgba(10,16,48,0)';
      setTimeout(function(){
        yut=false;kapatFn();                       // mevcut kapatma yolu
        pan.style.transition='';pan.style.transform='';fon.style.transition='';fon.style.background='';
      },200);
    }else{
      pan.style.transform='';fon.style.background='';   // geri dön
      setTimeout(function(){pan.style.transition='';fon.style.transition='';},220);
    }}
  pan.addEventListener('touchstart',bas,{passive:true});
  pan.addEventListener('touchmove',hareket,{passive:false});
  pan.addEventListener('touchend',bitir);
  pan.addEventListener('touchcancel',bitir);
  pan.addEventListener('mousedown',bas);
  window.addEventListener('mousemove',function(e){if(y0!==null&&e.buttons)hareket(e);});
  window.addEventListener('mouseup',bitir);
  // sürüklemeden sonra gelen tıklamayı yut (sayfanın kendi kapatma tıklaması dahil)
  sayfa.addEventListener('click',function(e){if(yut){e.stopImmediatePropagation();e.preventDefault();}},true);
}

(function(){
  // Arka plan sesi sayfası: kapatma yolu = Tamam düğmesi (sesKapat)
  var sp=document.getElementById('pm-ses-p');
  if(sp)ksKapat(sp,function(){var t=document.getElementById('ses-tamam');if(t)t.click();},sp);
  // Sayaçsız çalışma ekleme: kapatma yolu = Vazgeç düğmesi (kapat)
  var el=document.getElementById('mf-elle');
  if(el){var pn=el.querySelector('.el-panel'),pe=el.querySelector('.el-perde');
    if(pn)ksKapat(pn,function(){var v=document.getElementById('el-vaz');if(v)v.click();},pe);}
})();
