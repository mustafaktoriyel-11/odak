import numpy as np
from PIL import Image
src=np.array(Image.open('../../icon-512.png').convert('RGBA')).astype(float)
H,W=src.shape[:2];yy,xx=np.mgrid[0:H,0:W]
bgmask=(src[:,:,3]>250)&(src[:,:,0]<70)
# arka plan: her kanal için düzlem + karesel uyum
A=np.stack([np.ones(bgmask.sum()),xx[bgmask],yy[bgmask],xx[bgmask]**2,yy[bgmask]**2,xx[bgmask]*yy[bgmask]],1)
coef=[np.linalg.lstsq(A,src[:,:,c][bgmask],rcond=None)[0] for c in range(3)]
def bg(x,y):
    F=np.stack([np.ones_like(x),x,y,x**2,y**2,x*y],-1);return np.stack([F@coef[c] for c in range(3)],-1)
B=bg(xx.astype(float),yy.astype(float))
# alfa: kırmızı kanaldan (beyaz ve turuncu r=255)
al=np.clip((src[:,:,0]-B[:,:,0])/(255-B[:,:,0]),0,1)*(src[:,:,3]/255)
al[al<0.02]=0
col=np.zeros((H,W,3))
nz=al>0.02
col[nz]=np.clip((src[:,:,:3][nz]-(1-al[nz,None])*B[nz])/al[nz,None],0,255)
glyph=np.dstack([col,al*255]).astype(np.uint8)
g=Image.fromarray(glyph,'RGBA');bb=g.getbbox();print('bbox',bb);g=g.crop(bb);g.save('glyph.png')
print('bg corners',bg(np.array([0.,511]),np.array([0.,511])))
np.save('coef.npy',np.array(coef))
