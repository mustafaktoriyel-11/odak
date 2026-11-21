
(function(){
var URL_=typeof KOC_URL!=='undefined'?KOC_URL:'';if(!URL_)return;
var GOR_K='mf-koc-goruldu',son=0,kutu=null;
function kod(){try{return (localStorage.getItem('mf-koc-kod')||'').trim().toUpperCase();}catch(e){return '';}}
function gorulen(){try{return JSON.parse(localStorage.getItem(GOR_K)||'[]');}catch(e){return [];}}
function gorEkle(id){var g=gorulen();if(g.indexOf(id)<0)g.push(id);while(g.length>50)g.shift();try{localStorage.setItem(GOR_K,JSON.stringify(g));}catch(e){}}
function esc(x){return String(x).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function zaman(iso){var d=new Date(iso),b=new Date();var g=d.toDateString()===b.toDateString()?'Bugün':d.getDate()+'.'+(d.getMonth()+1);return g+' '+('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2);}
function ciz(L){
 var sayfa=document.getElementById('pg-sayac');if(!sayfa)return;
 if(!kutu){kutu=document.createElement('div');kutu.id='km-kutu';sayfa.insertBefore(kutu,sayfa.firstChild);}
 kutu.innerHTML=L.map(function(m){return '<div class="km-kart" role="status"><div class="km-ust"><b>💬 Koçundan mesaj</b><small>'+zaman(m.t)+'</small></div><p>'+esc(m.metin)+'</p><button type="button" class="km-tamam" data-id="'+esc(m.id)+'">Tamam</button></div>';}).join('');
 [].forEach.call(kutu.querySelectorAll('.km-tamam'),function(b){b.addEventListener('click',function(){
  var id=b.dataset.id;gorEkle(id);var k=b.closest('.km-kart');if(k)k.remove();
  try{fetch(URL_,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain'},body:JSON.stringify({tip:'mesajgor',kod:kod(),id:id})});}catch(e){}
 });});
}
function cek(zorla){
 var k=kod();if(!k||!navigator.onLine)return;
 if(!zorla&&Date.now()-son<180000)return;son=Date.now();
 fetch(URL_+'?islem=mesajlarim&kod='+encodeURIComponent(k)+'&_='+Date.now(),{cache:'no-store'}).then(function(r){return r.json();}).then(function(L){
  if(!Array.isArray(L))return;var g=gorulen();ciz(L.filter(function(m){return m&&m.id&&g.indexOf(m.id)<0;}));
 }).catch(function(){});
}
setTimeout(function(){cek(true);},2500);
document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible')cek(false);});
})();
