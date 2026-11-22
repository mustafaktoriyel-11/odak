# Bilgi kartları için haritaya sonradan eklenen adlar (v179). uret.py yeniden çalıştırılırsa bu betik de çalıştırılmalı:
#   python3 ek_adlar.py  → ../../veri/izinde/harita.svg içine <text> ekler (varsa atlar)
import json,math,re
P=json.load(open('proj.json'));AX,BX,AY,BY=P['p'];W,H=2576,1438;LONMIN=(0-BX)/AX
def fy(lat): return (1+math.sqrt(2)/2)*math.tan(math.radians(lat)/2)
def pr(lon,lat):
    if lon<LONMIN: lon+=360
    return (AX*lon+BX, AY*fy(lat)+BY)
# (ad, boylam, enlem, sınıf, boy, harf aralığı)
EK=[('Grönland',-41,74,'hs-ad2 hs-dag-ad',16,1),('Sibirya',100,64,'hs-ad2 hs-dag-ad',16,1),('Sahra',8,23.5,'hs-ad2 hs-dag-ad',16,1),
    ('Gobi',104,43.5,'hs-ad2 hs-dag-ad',13,1),('Japonya',138.5,37.5,'hs-ad2 hs-dag-ad',12,0.6),
    ('Hudson Körfezi',-85.5,59.5,'hs-ad2 hs-deniz-ad',14,1),
    ('Büyük Göller',-84,46.5,'hs-ad3 hs-nehir-ad',10,0.3),('Baykal Gölü',107,52,'hs-ad3 hs-nehir-ad',10,0.3),
    ('Victoria Gölü',33,-1.5,'hs-ad3 hs-nehir-ad',10,0.3),('Titicaca Gölü',-69.5,-16.5,'hs-ad3 hs-nehir-ad',10,0.3),
    ('Büyük Kanyon',-112.5,36.5,'hs-ad3 hs-dag-ad',10,0.4),('Yukatan',-89,19.5,'hs-ad3 hs-dag-ad',10,0.4),
    ('Cusco',-72,-13.5,'hs-ad3 hs-dag-ad',10,0.4),('Angel Şelalesi',-62.5,6.5,'hs-ad3 hs-dag-ad',10,0.4),
    ('Atacama Çölü',-69.5,-24.5,'hs-ad3 hs-dag-ad',10,0.4),('Hawaii',-156,20.5,'hs-ad3 hs-dag-ad',10,0.4),
    ('Kilimanjaro',37.3,-3.5,'hs-ad3 hs-dag-ad',10,0.4),('Rift Vadisi',36.5,3.5,'hs-ad3 hs-dag-ad',10,0.4),
    ('Büyük Set Resifi',153.5,-16,'hs-ad3 hs-deniz-ad',10,0.4)]
p='../../veri/izinde/harita.svg';s=open(p).read()
i=s.index('<g class="hs-adlar">')+len('<g class="hs-adlar">');ek=''
for ad,lo,la,cl,boy,ara in EK:
    if '>%s</text>'%ad in s: continue
    x,y=pr(lo,la);ek+='<text class="%s" x="%.0f" y="%.0f" font-size="%g" style="--f:%g" letter-spacing="%g">%s</text>'%(cl,x,y,boy,boy,ara,ad)
    print(ad,round(x),round(y))
s=s[:i]+ek+s[i:];open(p,'w').write(s)
