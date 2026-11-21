
(function(){
  var h=document.getElementById('pm-saat'),hl=document.getElementById('pm-halka');if(!h||!hl)return;
  var NS='http://www.w3.org/2000/svg',C=2*Math.PI*52;
  function P(r,a){a=a*Math.PI/180;return [150+r*Math.sin(a),150-r*Math.cos(a)];}
  function f(n){return n.toFixed(2);}
  function arc(r,a1,a2){var p=P(r,a1),q=P(r,a2);return 'M'+f(p[0])+' '+f(p[1])+'A'+r+' '+r+' 0 '+(a2-a1>180?1:0)+' 1 '+f(q[0])+' '+f(q[1]);}
  function sec(r,t){if(t<=0.05)return '';if(t>=359.9)return 'M150 '+(150-r)+'A'+r+' '+r+' 0 1 1 150 '+(150+r)+'A'+r+' '+r+' 0 1 1 150 '+(150-r)+'Z';
    var p=P(r,0);return 'M150 150L'+f(p[0])+' '+f(p[1])+'A'+r+' '+r+' 0 '+(t>180?1:0)+' 1 '+f(P(r,t)[0])+' '+f(P(r,t)[1])+'Z';}
  // dis halka: 5 derecelik taksimat (30'da uzun, 10'da orta, 5'te kisa)
  var dM='',dO='',dK='';
  for(var g=0;g<360;g+=5){var L=g%30===0?16:(g%10===0?10:6),a=P(142,g),b=P(142-L,g),s='M'+f(a[0])+' '+f(a[1])+'L'+f(b[0])+' '+f(b[1]);
    if(g%30===0)dM+=s;else dO+=s;}
  var TK='<path d="'+dO+'" stroke-width="1.3"/><path d="'+dM+'" stroke-width="2"/>';
  var o='<defs><radialGradient id="il-g" cx="150" cy="150" r="100" gradientUnits="userSpaceOnUse"><stop offset=".55" style="stop-color:var(--il-a);stop-opacity:0"/><stop offset="1" style="stop-color:var(--il-a);stop-opacity:.3"/></radialGradient>'
   +'<clipPath id="il-k"><path id="il-kp" d=""/></clipPath></defs>';
  o+='<path id="il-w" class="il-w" fill="url(#il-g)" d=""/>';
  o+='<circle class="il-cz" cx="150" cy="150" r="142"/>';
  o+='<g class="il-tm">'+TK+'</g><g class="il-ta" clip-path="url(#il-k)">'+TK+'</g>';
  o+='<path id="il-e" class="il-e" d=""/>';
  var bs=P(86,0),be=P(100,0);
  o+='<line class="il-b" x1="'+f(bs[0])+'" y1="'+f(bs[1])+'" x2="'+f(be[0])+'" y2="'+f(be[1])+'"/>';
  o+='<path id="il-th" class="il-th" d=""/><text id="il-tt" class="il-tt" x="0" y="0">θ</text>';
  var LB='';for(var i=0;i<12;i++){var q=P(111,i*30);LB+='<text class="il-l" data-a="'+(i*30)+'" x="'+f(q[0])+'" y="'+f(q[1]+4)+'">'+(i*30)+'</text>';}
  o+=LB;
  // el (ibre): 0 derecede dikey, donme transform ile
  o+='<g id="il-h" visibility="hidden"><line class="il-el" x1="150" y1="64" x2="150" y2="8"/><circle class="il-nk" cx="150" cy="8" r="5"/>'
   +'<line class="il-th" x1="150" y1="70" x2="150" y2="58"/></g>';
  var s=document.createElementNS(NS,'svg');s.setAttribute('viewBox','0 0 300 300');s.setAttribute('class','il');s.setAttribute('aria-hidden','true');s.setAttribute('focusable','false');s.innerHTML=o;
  h.insertBefore(s,h.querySelector('.pm-yazi'));
  var W=s.querySelector('#il-w'),E=s.querySelector('#il-e'),K=s.querySelector('#il-kp'),TH=s.querySelector('#il-th'),TT=s.querySelector('#il-tt'),H=s.querySelector('#il-h'),
      LS=[].slice.call(s.querySelectorAll('.il-l')),son=-1,dak=null;
  function etiketler(){var d=h.classList.contains('serbest');if(d===dak)return;dak=d;
    for(var i=0;i<12;i++)LS[i].textContent=d?String(i*5):String(i*30);son=-1;guncelle();}
  function guncelle(){
    var off=parseFloat(hl.style.strokeDashoffset);if(isNaN(off))off=0;
    var fr=off/C;if(h.classList.contains('serbest'))fr=1-fr;
    fr=Math.max(0,Math.min(1,fr));
    var t=Math.round(fr*3600)/10;if(t===son)return;son=t;
    var on=t>0.05;
    W.setAttribute('d',sec(100,t));K.setAttribute('d',sec(150,t));
    E.setAttribute('d',on?(t>=359.9?'M150 50A100 100 0 1 1 150 250A100 100 0 1 1 150 50':arc(100,0,t)):'');
    // teta yayi: yazinin etrafinda bosluk birakir
    if(on){var R=86,gp=t>=40?6:0,m=t/2;
      TH.setAttribute('d',gp?arc(R,0,m-gp)+arc(R,m+gp,t):(t>=359.9?'M150 64A86 86 0 1 1 150 236A86 86 0 1 1 150 64':arc(R,0,t)));
      var c=P(R,m);TT.setAttribute('x',f(c[0]));TT.setAttribute('y',f(c[1]+5));TT.style.display=gp?'':'none';
      H.setAttribute('transform','rotate('+t+' 150 150)');H.setAttribute('visibility','visible');
    }else{TH.setAttribute('d','');TT.style.display='none';H.setAttribute('visibility','hidden');}
    for(var i=0;i<12;i++){var a=i*30,dl=Math.abs(a-t);dl=Math.min(dl,360-dl);
      var yk=on&&dl<11,gc=on&&a<=t&&a>0,cl='il-l'+(gc?' g':'')+(yk?' y':'');
      if(LS[i].getAttribute('class')!==cl)LS[i].setAttribute('class',cl);}
  }
  new MutationObserver(guncelle).observe(hl,{attributes:true,attributeFilter:['style']});
  new MutationObserver(etiketler).observe(h,{attributes:true,attributeFilter:['class']});
  etiketler();guncelle();
})();
