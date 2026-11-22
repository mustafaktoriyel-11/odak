import json,numpy as np
from PIL import Image,ImageDraw
from scipy.optimize import minimize
S=4  # küçültme
im=np.asarray(Image.open('/home/claude/odak/img/harita-gunduz.webp').convert('RGB').resize((2576//S,1438//S)),float)
kara=(im[...,0]-im[...,2])>25
ROI=np.zeros_like(kara);ROI[22:340,28:616]=True
Image.fromarray((kara*255).astype('uint8')).save('kara_mask.png')
G=json.load(open('ne_110m_land.geojson'))
polys=[]
for f in G['features']:
  g=f['geometry'];cs=g['coordinates'] if g['type']=='MultiPolygon' else [g['coordinates']]
  for p in cs: polys.append(np.array(p[0]))
F={'eq':lambda p:np.radians(p),'merc':lambda p:np.log(np.tan(np.pi/4+np.radians(np.clip(p,-85,85))/2)),'miller':lambda p:1.25*np.log(np.tan(np.pi/4+0.4*np.radians(p))),'gall':lambda p:(1+np.sqrt(2)/2)*np.tan(np.radians(p)/2)}
def ras(k,prm):
  ax,bx,ay,by=prm;m=Image.new('L',(2576//S,1438//S));d=ImageDraw.Draw(m)
  for p in polys:
    X=(ax*p[:,0]+bx)/S;Y=(ay*F[k](p[:,1])+by)/S
    d.polygon(list(zip(X,Y)),fill=255)
  return np.asarray(m)>0
def skor(k,prm):
  r=ras(k,prm)&ROI;kk=kara&ROI;return -(r&kk).sum()/(r|kk).sum()
best=None
for k,y0 in [('miller',[-462,885]),('gall',[-556,886])]:
  x0=[7.36,1211.6]+y0
  o=minimize(lambda p:skor(k,p),x0,method='Nelder-Mead',options={'xatol':0.05,'fatol':1e-5,'maxiter':400,'initial_simplex':None})
  print(k,-o.fun,o.x)
  if best is None or o.fun<best[1]: best=(k,o.fun,o.x)
json.dump({'proj':best[0],'p':list(best[2])},open('proj.json','w'));print(best)
