import numpy as np, math
from PIL import Image
coef=np.load('coef.npy');g=Image.open('glyph.png')
def zemin(N):
    yy,xx=np.mgrid[0:N,0:N].astype(float);x=xx*511/(N-1);y=yy*511/(N-1)
    F=np.stack([np.ones_like(x),x,y,x**2,y**2,x*y],-1)
    return Image.fromarray(np.clip(np.stack([F@coef[c] for c in range(3)],-1),0,255).astype(np.uint8),'RGB').convert('RGBA')
def koy(tuval,olcek,merkez=None):
    w,h=round(g.width*olcek),round(g.height*olcek);gg=g.resize((w,h),Image.LANCZOS)
    N=tuval.width;cx,cy=merkez or (N/2,N/2);tuval.alpha_composite(gg,(round(cx-w/2),round(cy-h/2)));return tuval
O='../../'
# 1) Play Store: 512 tam kare, logo eski ikondaki yerinde/boyunda
p=zemin(512);p.alpha_composite(g,(69,117));p.convert('RGB').save(O+'play-ikon-512.png')
# 2) PWA maskable: logo %80 güvenli dairenin içinde
r=0.80*512/math.hypot(g.width,g.height);koy(zemin(512),r).convert('RGB').save(O+'icon-maskable-512.png')
# 3) Android uyarlanabilir: 432px (108dp@4x); ön katman şeffaf, logo 66dp güvenli dairede
N=432;on=Image.new('RGBA',(N,N),(0,0,0,0));koy(on,(66/108*N)/math.hypot(g.width,g.height))
import os;d=O+'android-ayar/res/drawable-nodpi/';os.makedirs(d,exist_ok=True)
on.save(d+'mf_ikon_on.png');zemin(N).convert('RGB').save(d+'mf_ikon_zemin.png')
# önizleme: daire, yuvarlatılmış kare, play maskesi
def maske(im,tip):
    N=im.width;m=Image.new('L',(N,N),0);from PIL import ImageDraw;D=ImageDraw.Draw(m)
    if tip=='daire':D.ellipse((0,0,N-1,N-1),fill=255)
    else:D.rounded_rectangle((0,0,N-1,N-1),radius=int(N*0.22),fill=255)
    o=Image.new('RGBA',(N,N),(0,0,0,0));o.paste(im,(0,0),m);return o
ad=zemin(N);ad.alpha_composite(on);gor=ad.crop((N*18//108,N*18//108,N*90//108,N*90//108)).resize((240,240))  # 72dp görünür alan
pl=p.resize((240,240))
on_=Image.new('RGBA',(1040,300),(238,240,246,255))
for i,(im,t) in enumerate([(gor,'daire'),(gor,'kare'),(pl,'kare'),(zemin(512).resize((240,240)),'')]):
    pass
x=20
for im,t in [(gor,'daire'),(gor,'kare'),(pl,'kare'),(Image.open(O+'icon-maskable-512.png').convert('RGBA').resize((240,240)),'daire')]:
    k=maske(im,t);on_.alpha_composite(k,(x,30));s=k.resize((48,48));on_.alpha_composite(s,(x+96,280-8-48+8));x+=255
on_.save('onizleme.png')
