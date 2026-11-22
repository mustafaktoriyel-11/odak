
// ---- Serbest çalışmada mola hatırlatması ----
(function(){
  function oku(){try{return JSON.parse(localStorage.getItem('pm-durum')||'null');}catch(e){return null;}}
  // serbest çalışmada 90 dakikada bir mola hatırlatması
  var hat=document.createElement('div');hat.className='tb-hat';hat.hidden=true;hat.setAttribute('role','alert');
  hat.innerHTML='<b><svg class="ic" aria-hidden="true"><use href="#i-kahve"/></svg>Kısa bir mola?</b><span class="th-m"></span><button type="button">Tamam</button>';document.body.appendChild(hat);
  hat.querySelector('button').addEventListener('click',function(){hat.hidden=true;});
  setInterval(function(){
    var d=oku();if(!d||!d.serbest||!d.calisiyor||d.mod!=='odak')return;
    var gec=d.toplam-Math.max(0,(d.bitis||0)-Date.now()),n=Math.floor(gec/5400000);if(n<1)return;
    var key='mf-serbest-hat',v='';try{v=sessionStorage.getItem(key)||'';}catch(e){}
    var id=(d.toplam-d.kalan)+'|'+n;var bas=String(Math.round(((d.bitis||0)-d.toplam)/60000));id=bas+'|'+n;
    if(v===id)return;try{sessionStorage.setItem(key,id);}catch(e){}
    var sa=Math.floor(gec/3600000),dk=Math.round(gec%3600000/60000),t=(sa?sa+' sa ':'')+(dk?dk+' dk':'');
    hat.querySelector('.th-m').textContent=t+' oldu. 10 dakika ara verip su içmek odağını tazeler; istersen devam et.';hat.hidden=false;
    try{if(document.hidden&&'Notification' in window&&Notification.permission==='granted'&&navigator.serviceWorker)navigator.serviceWorker.ready.then(function(r){r.showNotification('☕ Kısa bir mola?',{body:t+' kesintisiz çalıştın. 10 dk ara iyi gelir.',icon:'icon-192.png',tag:'mf-serbest'});});}catch(e){}
  },15000);
  var sbc=document.querySelector('#pm-odak-c [data-v=serbest]');if(sbc){sbc.setAttribute('aria-label','Serbest çalışma (kronometre)');sbc.title='Serbest çalışma (kronometre)';}
})();
