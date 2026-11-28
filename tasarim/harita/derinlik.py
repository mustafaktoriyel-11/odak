"""Haritaya 2,5B derinlik: kıyı duvarı (kara bloğu kalınlığı), kaydırılmış gölge, ışıklı/gölgeli dağ tepecikleri, derinleşen deniz.
uret.py ve ek_adlar.py'den SONRA çalıştır: python3 tasarim/harita/derinlik.py  (tekrar çalıştırmak güvenli)."""
import re,sys
P=sys.argv[1] if len(sys.argv)>1 else 'veri/izinde/harita.svg'
s=open(P).read()
if 'data-derinlik' in s: print('zaten uygulanmış');sys.exit()
s=s.replace('<svg class="iz-taban"','<svg class="iz-taban" data-derinlik="1"',1)
# --- stiller ---
css=('.iz-taban .hs-golge.hs-g3{opacity:.75}'
 '.iz-taban .hs-duvar{fill:#C9A46C;stroke:#B48C55;stroke-width:3;stroke-linejoin:round}'
 '.iz-taban .hs-dk1{stop-color:#C9DDEB}.iz-taban .hs-dk2{stop-color:#A9C3DA}'
 '.iz-taban .hs-dag3 .a{fill:#E9CFA0}.iz-taban .hs-dag3 .k{fill:#C08A56}.iz-taban .hs-dag3 .s{fill:none;stroke:#8E5F33;stroke-width:.9;stroke-linejoin:round;stroke-linecap:round}'
 'html.mf-gece .iz-taban .hs-duvar{fill:#2E3A72;stroke:#28336A}'
 'html.mf-gece .iz-taban .hs-dk1{stop-color:#10193B}html.mf-gece .iz-taban .hs-dk2{stop-color:#080F29}'
 'html.mf-gece .iz-taban .hs-dag3 .a{fill:#3A3F6E}html.mf-gece .iz-taban .hs-dag3 .k{fill:#151B3C}html.mf-gece .iz-taban .hs-dag3 .s{stroke:#8C7BC0}')
s=s.replace('</style>',css+'</style>',1)
# --- deniz: üstte açık, altta derin ---
s=s.replace('<defs>','<defs><linearGradient id="hsDeniz" x1="0" y1="0" x2=".35" y2="1"><stop offset="0" class="hs-dk1"/><stop offset="1" class="hs-dk2"/></linearGradient>',1)
s=s.replace('<rect class="hs-deniz" fill="#BCD3E4" width="2576" height="1438"/>','<rect class="hs-deniz" fill="#BCD3E4" width="2576" height="1438"/><rect fill="url(#hsDeniz)" width="2576" height="1438" opacity=".85"/>',1)
# --- gölge sağ-alta kayar, kara bloğunun kalınlığı (duvar) eklenir ---
a='<use href="#hsKara" class="hs-golge" fill="none"/>'
assert a in s
s=s.replace(a,'<use href="#hsKara" class="hs-golge hs-g3" fill="none" transform="translate(6 13)"/><use href="#hsKara" class="hs-duvar" transform="translate(0 7)"/>',1)
# --- dağlar: ^ çizgileri -> ışıklı (sol) ve gölgeli (sağ) yüzlü tepecikler ---
i=s.index('<g class="hs-dag"');j=s.index('</g>',i)+4
blok=s[i:j]
uc=re.findall(r'M\s*([\d.]+)[ ,]([\d.]+)\s*L\s*([\d.]+)[ ,]([\d.]+)\s*L\s*([\d.]+)[ ,]([\d.]+)',blok)
A=[];K=[];S=[]
for x1,y1,x2,y2,x3,y3 in uc:
    x1,y1,x2,y2,x3,y3=map(float,(x1,y1,x2,y2,x3,y3));ty=max(y1,y3)
    A.append(f'M{x1:.1f} {ty:.1f}L{x2:.1f} {y2:.1f}L{x2+(x3-x2)*.15:.1f} {ty:.1f}Z')
    K.append(f'M{x2:.1f} {y2:.1f}L{x3:.1f} {ty:.1f}L{x2+(x3-x2)*.15:.1f} {ty:.1f}Z')
    S.append(f'M{x1:.1f} {y1:.1f}L{x2:.1f} {y2:.1f}L{x3:.1f} {y3:.1f}')
yeni=(f'<g class="hs-dag3"><path class="a" d="{"".join(A)}"/><path class="k" d="{"".join(K)}"/><path class="s" d="{"".join(S)}"/></g>')
s=s[:i]+yeni+s[j:]
open(P,'w').write(s);print('tamam, dağ tepeciği:',len(uc))
