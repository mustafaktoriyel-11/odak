// ================= MANTIK SEKIL CIZIMI (bagimsiz modul) =================
// window.MF_MANTIK_CIZ.soru(q) -> soru govdesi (dizi HTML / SVG) ; q.g yoksa ''
// window.MF_MANTIK_CIZ.sik(q,i) -> sik i icin HTML (metin kacisli, sekil SVG)
(function(){
  var MAVI='#1E3BD6',TUR='#FF8A1F',LACI='#1C2E8A',YESIL='#1FA463',GRI='#9AA3C7',ZEMIN='#EEF1FD',BEYAZ='#fff';
  var RENK={mavi:MAVI,turuncu:TUR,yesil:YESIL};
  var sayac=0;
  function esc(x){return String(x).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function poli(pts){return pts.map(function(p){return p[0].toFixed(1)+','+p[1].toFixed(1);}).join(' ');}
  function svg(vb,w,ic,id){
    return '<svg viewBox="'+vb+'" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true" style="display:block;margin:0 auto;width:100%;max-width:'+w+'px;height:auto">'+
      '<defs><linearGradient id="'+id+'" x1="0" x2="1" y1="0" y2="0"><stop offset=".5" stop-color="'+MAVI+'"/><stop offset=".5" stop-color="'+BEYAZ+'"/></linearGradient></defs>'+ic+'</svg>';
  }
  function soruIsareti(x,y,b,fs){
    return '<text x="'+(x+b/2)+'" y="'+(y+b/2+fs*.36)+'" text-anchor="middle" font-size="'+fs+'" font-weight="800" font-family="sans-serif" fill="'+TUR+'">?</text>';
  }
  function sekil(s,f,cx,cy,r,gid){
    var renk=RENK[f],cz=renk||MAVI,fill=renk?renk:(f==='dolu'?MAVI:(f==='yari'?'url(#'+gid+')':BEYAZ)),
      st='stroke="'+cz+'" stroke-width="2.2" stroke-linejoin="round" fill="'+fill+'"',i,p=[];
    if(s==='daire')return '<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" '+st+'/>';
    if(s==='kare')return '<rect x="'+(cx-r*.88)+'" y="'+(cy-r*.88)+'" width="'+(r*1.76)+'" height="'+(r*1.76)+'" rx="2" '+st+'/>';
    if(s==='altigen'){for(i=0;i<6;i++){var a=Math.PI/3*i;p.push([cx+r*Math.cos(a),cy+r*Math.sin(a)]);}return '<polygon points="'+poli(p)+'" '+st+'/>';}
    if(s==='yildiz'){for(i=0;i<10;i++){var a2=-Math.PI/2+Math.PI/5*i,rr=i%2?r*.45:r*1.12;p.push([cx+rr*Math.cos(a2),cy+rr*Math.sin(a2)]);}return '<polygon points="'+poli(p)+'" '+st+'/>';}
    if(s==='arti'){var w=r*.36,L=r*.98;return '<polygon points="'+poli([[cx-w,cy-L],[cx+w,cy-L],[cx+w,cy-w],[cx+L,cy-w],[cx+L,cy+w],[cx+w,cy+w],[cx+w,cy+L],[cx-w,cy+L],[cx-w,cy+w],[cx-L,cy+w],[cx-L,cy-w],[cx-w,cy-w]])+'" '+st+'/>';}
    var h=r*1.9;return '<polygon points="'+cx+','+(cy-h*.55)+' '+(cx+r*1.05)+','+(cy+h*.45)+' '+(cx-r*1.05)+','+(cy+h*.45)+'" '+st+'/>';
  }
  function izg(m,x,y,b,eksen){var n=4,c=b/n,o='';
    for(var i=0;i<16;i++){var cx=x+(i%n)*c,cy=y+Math.floor(i/n)*c;o+='<rect x="'+cx+'" y="'+cy+'" width="'+c+'" height="'+c+'" fill="'+(m[i]?MAVI:BEYAZ)+'" stroke="'+GRI+'" stroke-width="1"/>';}
    o+='<rect x="'+x+'" y="'+y+'" width="'+b+'" height="'+b+'" fill="none" stroke="'+LACI+'" stroke-width="1.6"/>';
    if(eksen==='d')o+='<line x1="'+(x+b+12)+'" y1="'+(y-6)+'" x2="'+(x+b+12)+'" y2="'+(y+b+6)+'" stroke="'+TUR+'" stroke-width="2.5" stroke-dasharray="6 4"/>';
    if(eksen==='y')o+='<line x1="'+(x-6)+'" y1="'+(y+b+12)+'" x2="'+(x+b+6)+'" y2="'+(y+b+12)+'" stroke="'+TUR+'" stroke-width="2.5" stroke-dasharray="6 4"/>';
    return o;}
  function kare3(f,x,y,b){var c=b/3,o='';
    for(var i=0;i<9;i++)o+='<rect x="'+(x+(i%3)*c)+'" y="'+(y+Math.floor(i/3)*c)+'" width="'+c+'" height="'+c+'" fill="'+BEYAZ+'" stroke="'+GRI+'" stroke-width="1"/>';
    o+='<rect x="'+x+'" y="'+y+'" width="'+b+'" height="'+b+'" fill="none" stroke="'+LACI+'" stroke-width="1.4"/>';
    if(!f)return o+soruIsareti(x,y,b,28);
    f.forEach(function(d){o+='<circle cx="'+(x+(d[1]+.5)*c)+'" cy="'+(y+(d[0]+.5)*c)+'" r="'+(c*.32)+'" fill="'+(d[2]==='t'?TUR:MAVI)+'"/>';});return o;}
  var DUZEN={1:[[.5,.5]],2:[[.28,.5],[.72,.5]],3:[[.5,.28],[.27,.72],[.73,.72]],4:[[.28,.28],[.72,.28],[.28,.72],[.72,.72]]};
  function hucre(c,x,y,b,gid){
    if(!c)return soruIsareti(x,y,b,32);
    var r=c.n===1?b*.24:b*.15,o='',d=DUZEN[c.n]||DUZEN[1];
    d.forEach(function(p){o+=sekil(c.s,c.f,x+p[0]*b,y+p[1]*b,r,gid);});return o;
  }
  function ok(c,x,y,b){
    if(!c)return soruIsareti(x,y,b,32);
    var cx=x+b/2,cy=y+b/2,s=b/60;
    return '<g transform="translate('+cx+' '+cy+') rotate('+c.a+') scale('+s+')"><path d="M0,-22 L14,-4 L5,-4 L5,20 L-5,20 L-5,-4 L-14,-4 Z" stroke="'+MAVI+'" stroke-width="2.4" stroke-linejoin="round" fill="'+(c.f==='dolu'?MAVI:BEYAZ)+'"/></g>';
  }
  function kutu(c,x,y,b){return '<rect x="'+x+'" y="'+y+'" width="'+b+'" height="'+b+'" fill="'+(c?BEYAZ:ZEMIN)+'" stroke="'+GRI+'" stroke-width="1.5"/>';}
  function diziHtml(h){
    var bos=h.indexOf(null)>=0;
    var sp='display:inline-block;min-width:34px;padding:8px 6px;border-radius:10px;text-align:center;font-weight:800;font-size:17px;font-family:inherit;';
    var a=h.map(function(x){return x===null?'<span style="'+sp+'background:'+BEYAZ+';color:'+TUR+';border:2px dashed '+TUR+'">?</span>':'<span style="'+sp+'background:'+ZEMIN+';color:'+LACI+'">'+esc(x)+'</span>';}).join('');
    if(!bos)a+='<span style="'+sp+'background:'+BEYAZ+';color:'+TUR+';border:2px dashed '+TUR+'">?</span>';
    return '<div class="mt-dizi" style="display:flex;flex-wrap:nowrap;gap:4px;justify-content:center;align-items:center;margin:8px 0">'+a+'</div>';
  }
  function figur(g){
    var id='mfy'+(++sayac),i,o;
    if(g.tip==='dizi')return diziHtml(g.h);
    if(g.tip==='matris'){var b=78;o='';
      for(i=0;i<9;i++){var x=2+(i%3)*b,y=2+Math.floor(i/3)*b;o+=kutu(g.h[i],x,y,b)+hucre(g.h[i],x,y,b,id);}
      return svg('0 0 '+(b*3+4)+' '+(b*3+4),b*3+4,o,id);}
    if(g.tip==='izgara'){var B=150;
      return svg('-4 -10 '+(B+(g.eksen==='d'?30:12))+' '+(B+(g.eksen==='y'?36:20)),B+30,izg(g.h,0,0,B,g.eksen),id);}
    if(g.tip==='hareket'){var b3=60,g3=8;o='';
      for(i=0;i<5;i++)o+=kare3(g.h[i],2+i*(b3+g3),2,b3);
      return svg('0 0 '+(b3*5+g3*4+4)+' '+(b3+4),b3*5+g3*4+4,o,id);}
    if(g.tip==='dondur'){var b2=62;o='';
      for(i=0;i<5;i++){o+=kutu(g.h[i],2+i*b2,2,b2)+ok(g.h[i],2+i*b2,2,b2);}
      return svg('0 0 '+(b2*5+4)+' '+(b2+4),b2*5+4,o,id);}
    return '';
  }
  function secFig(g,o){
    var b=86,id='mfy'+(++sayac),ic;
    if(!g||g.tip==='izgara')ic=izg(o,3,3,b-6);
    else if(g.tip==='hareket')ic=kare3(o,3,3,b-6);
    else if(g.tip==='dondur')ic=ok(o,0,0,b);
    else ic=hucre(o,0,0,b,id);
    return svg('0 0 '+b+' '+b,b,ic,id);
  }
  window.MF_MANTIK_CIZ={
    soru:function(q){return q&&q.g?figur(q.g):'';},
    sik:function(q,i){
      var x=q.o[i];
      if(q.t==='sekil'&&x!==null&&typeof x==='object')return secFig(q.g,x);
      return esc(x);
    }
  };
})();
