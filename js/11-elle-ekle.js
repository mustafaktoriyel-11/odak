
// ---- Sayaçsız çalışmayı sonradan ekleme (bugün / dün) ----
(function(){
  function $(i){return document.getElementById(i);}
  var ort=$('mf-elle');if(!ort)return;
  var S={g:0,ders:'',dk:0};
  function esc(x){return String(x).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function secTek(kap,el){[].forEach.call(kap.querySelectorAll('button'),function(b){var on=b===el;b.classList.toggle('on',on);b.setAttribute('aria-checked',on?'true':'false');});}
  function kontrol(){var h='';var ok=!!S.ders&&S.dk>=5&&S.dk<=300;
    if(S.dk&&S.dk<5)h='En az 5 dakika ekleyebilirsin.';else if(S.dk>300)h='Tek seferde en fazla 300 dakika (5 saat) eklenebilir.';
    $('el-hata').textContent=h;$('el-kay').disabled=!ok;}
  function ac(){
    var sel=$('pm-ders'),L=sel?[].map.call(sel.options,function(o){return o.value;}).filter(Boolean):[];
    S={g:0,ders:sel&&sel.value||L[0]||'',dk:0};
    $('el-ders').innerHTML=L.map(function(d){return '<button type="button" role="radio" data-v="'+esc(d)+'"'+(d===S.ders?' class="on" aria-checked="true"':' aria-checked="false"')+'>'+esc(d)+'</button>';}).join('');
    secTek($('el-gun'),$('el-gun').querySelector('[data-g="0"]'));secTek($('el-hazir'),null);$('el-dk').value='';
    var kod='';try{kod=localStorage.getItem('mf-koc-kod')||'';}catch(e){}
    $('el-ac').textContent=kod?'Sayacı açmayı unuttuysan çalışmanı buradan ekle. Koçun bu kaydı “✍️ elle eklendi” olarak görür.':'Sayacı açmayı unuttuysan çalışmanı buradan ekle.';
    kontrol();ort.hidden=false;
    if(window.LEX_GERI)window.LEX_GERI.ekle('mf-elle',function(){kapat(true);});
  }
  function kapat(geriden){if(ort.hidden)return;ort.hidden=true;if(!geriden&&window.LEX_GERI)window.LEX_GERI.dus('mf-elle');}
  $('el-gun').addEventListener('click',function(e){var b=e.target.closest('[data-g]');if(!b)return;S.g=+b.getAttribute('data-g');secTek(this,b);});
  $('el-ders').addEventListener('click',function(e){var b=e.target.closest('[data-v]');if(!b)return;S.ders=b.getAttribute('data-v');secTek(this,b);kontrol();});
  $('el-hazir').addEventListener('click',function(e){var b=e.target.closest('[data-d]');if(!b)return;S.dk=+b.getAttribute('data-d');$('el-dk').value=S.dk;secTek(this,b);kontrol();});
  $('el-dk').addEventListener('input',function(){S.dk=Math.round(+this.value)||0;secTek($('el-hazir'),$('el-hazir').querySelector('[data-d="'+S.dk+'"]'));kontrol();});
  $('el-vaz').addEventListener('click',function(){kapat();});
  ort.addEventListener('click',function(e){if(e.target.getAttribute('data-kapat'))kapat();});
  $('el-kay').addEventListener('click',function(){
    if($('el-kay').disabled)return;
    var t=Date.now()-S.g*864e5;
    if(window.MF_KAYIT_EKLE)window.MF_KAYIT_EKLE(S.dk,S.ders,t,true);
    kapat();
    var m=S.dk+' dk '+S.ders+' '+(S.g?'düne':'bugüne')+' eklendi ✓';
    var tt=$('mf-toast'),tm=$('mf-toast-m'),tb=$('mf-toast-b');if(tt&&tm){tm.textContent=m;if(tb)tb.hidden=true;tt.classList.add('acik');setTimeout(function(){tt.classList.remove('acik');},2800);}
    if(window.MF_BUGUN_CIZ)window.MF_BUGUN_CIZ();
  });
  window.MF_ELLE_AC=ac;
})();
