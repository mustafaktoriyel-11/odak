import json,numpy as np
LL={'d01':(-0.1,29.6),'d02':(25.7,32.6),'d03':(30.0,31.1),'d04':(32.5,44.4),'d05':(37.7,26.8),'d06':(31.2,29.9),'d07':(37.1,15.3),'d08':(23.2,75.8),'d09':(25.6,85.1),'d10':(32.06,118.8),'d11':(33.3,44.4),'d12':(32.65,51.67),'d13':(39.65,66.96),'d14':(41.0,28.98),'d15':(43.7,10.4),'d16':(48.86,2.35),'d17':(52.2,0.12),'d18':(47.56,7.59),'d19':(51.54,9.93),'d20':(17.2,-89.6),'d21':(37.43,-122.17),'d22':(39.93,32.86)}
r=json.load(open('/home/claude/odak/veri/izinde/rota.json'))
P={d['id']:(d['x'],d['y']) for d in r['duraklar']}
ids=list(LL);lat=np.array([LL[i][0] for i in ids]);lon=np.array([LL[i][1] for i in ids]);x=np.array([P[i][0] for i in ids]);y=np.array([P[i][1] for i in ids])
A=np.c_[lon,np.ones_like(lon)];cx,res,*_=np.linalg.lstsq(A,x,rcond=None);print('x',cx,np.sqrt(res/len(x)))
F={'eq':lambda p:np.radians(p),'merc':lambda p:np.log(np.tan(np.pi/4+np.radians(p)/2)),'miller':lambda p:1.25*np.log(np.tan(np.pi/4+0.4*np.radians(p))),'gall':lambda p:(1+np.sqrt(2)/2)*np.tan(np.radians(p)/2)}
for k,f in F.items():
  A=np.c_[f(lat),np.ones_like(lat)];cy,res,*_=np.linalg.lstsq(A,y,rcond=None);print(k,cy,np.sqrt(res/len(y)), 'pxperrad x',cx[0]*180/np.pi)
  print(' resid',np.round(y-A@cy).astype(int))
print('x resid',np.round(x-np.c_[lon,np.ones_like(lon)]@cx).astype(int))
