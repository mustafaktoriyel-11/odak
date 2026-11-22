# Vektör dünya haritası (Natural Earth, kamu malı) -> veri/izinde/harita.svg
import json,math,numpy as np
from shapely.geometry import shape,box,Polygon,MultiPolygon,LineString,MultiLineString,Point
from shapely.affinity import translate
from shapely.ops import unary_union
P=json.load(open('proj.json'));AX,BX,AY,BY=P['p']
W,H=2576,1438
LON0=-BX/AX-0; LONMIN=(0-BX)/AX; LONMAX=(W-BX)/AX
def fy(lat): return (1+math.sqrt(2)/2)*math.tan(math.radians(lat)/2)
def pr(lon,lat): return (AX*lon+BX, AY*fy(lat)+BY)
def sar(g):  # pencereye sar: [-180,LONMAX-360] parçasını sağa taşı
    a=g.intersection(box(LONMIN,-61,180,86.5))
    b=g.intersection(box(-180,-61,LONMAX-360,86.5))
    return unary_union([x for x in [a,translate(b,360)] if not x.is_empty]) if not b.is_empty else a
def proj_geom(g):
    from shapely.ops import transform
    return transform(lambda x,y,z=None:(AX*np.asarray(x)+BX, AY*(1+math.sqrt(2)/2)*np.tan(np.radians(np.asarray(y))/2)+BY),g)
def d_poly(g,tol):
    g=g.simplify(tol,preserve_topology=True);out=[]
    polys=[g] if isinstance(g,Polygon) else list(getattr(g,'geoms',[]))
    for p in polys:
        if not isinstance(p,Polygon) or p.area<6: continue
        for ring in [p.exterior]+list(p.interiors):
            c=list(ring.coords)[:-1]
            if len(c)<3: continue
            out.append('M'+' '.join('%.1f %.1f'%xy for xy in c[:1])+'L'+' '.join('%.1f %.1f'%xy for xy in c[1:])+'Z')
    return ''.join(out)
def d_line(g,tol):
    g=g.simplify(tol);out=[]
    ls=[g] if isinstance(g,LineString) else [x for x in getattr(g,'geoms',[]) if isinstance(x,LineString)]
    for l in ls:
        c=list(l.coords)
        if len(c)<2: continue
        out.append('M'+'%.1f %.1f'%c[0]+'L'+' '.join('%.1f %.1f'%xy for xy in c[1:]))
    return ''.join(out)
def yukle(f): return json.load(open(f))['features']
# kara
kara=unary_union([shape(f['geometry']) for f in yukle('ne_50m_land.geojson')])
karaP=proj_geom(sar(kara.buffer(0)))
D_KARA=d_poly(karaP,0.45)
gol=unary_union([shape(f['geometry']) for f in yukle('ne_50m_lakes.geojson') if f['properties'].get('scalerank',9)<=4])
D_GOL=d_poly(proj_geom(sar(gol.buffer(0))),0.45)
nehirler=[f for f in yukle('ne_50m_rivers_lake_centerlines.geojson') if f['properties']['scalerank']<=5 and f['properties']['featurecla']!='Lake Centerline']
ng=unary_union([shape(f['geometry']) for f in nehirler])
D_NEHIR=d_line(proj_geom(sar(ng)),0.5)
# dağlar
reg=yukle('ne_50m_geography_regions_polys.geojson')
daglar=[(f['properties'],shape(f['geometry'])) for f in reg if f['properties']['FEATURECLA']=='Range/mtn' and (f['properties']['SCALERANK']<=3 or f['properties']['NAME'] in ('PONTIC MOUNTAINS','Balkan Mts.'))]
toros=Polygon([(29.5,37.0),(31.5,36.6),(33,36.3),(35,36.8),(36.5,37.4),(38.5,37.9),(41,38.3),(41.2,38.9),(38.5,38.5),(36,38.1),(34,37.6),(32,37.6),(30,37.7)])
daglar.append(({'NAME':'TAURUS','NAME_TR':'Toros Dağları','SCALERANK':2},toros))
rng=np.random.default_rng(4);chev=[]
for p,g in daglar:
    gp=proj_geom(sar(g.buffer(0)))
    if gp.is_empty: continue
    x0,y0,x1,y1=gp.bounds;s=13
    for yy in np.arange(y0+s/2,y1,s*0.8):
        for xx in np.arange(x0+s/2+((yy//s)%2)*s/2,x1,s):
            jx,jy=xx+rng.uniform(-3,3),yy+rng.uniform(-2,2)
            if gp.contains(Point(jx,jy)):
                k=rng.uniform(0.75,1.2);w=5*k;h=4.2*k
                chev.append('M%.1f %.1fL%.1f %.1fL%.1f %.1f'%(jx-w,jy+h/2,jx,jy-h/2,jx+w,jy+h/2))
D_DAG=''.join(chev)
# etiketler
def ad_tr(p): 
    t=p.get('NAME_TR') or p['NAME'].title()
    return t
ETK=[]
def etk(metin,lon,lat,sinif,boy,aci=0,ara=0):
    x,y=pr(lon,lat)
    if lon<LONMIN: x,y=pr(lon+360,lat)
    ETK.append('<text class="%s" x="%.0f" y="%.0f" font-size="%g"%s%s>%s</text>'%(sinif,x,y,boy,(' letter-spacing="%g"'%ara) if ara else '',(' transform="rotate(%g %.0f %.0f)"'%(aci,x,y)) if aci else '',metin))
for t,lo,la in [('ATLAS OKYANUSU',-40,27),('BÜYÜK OKYANUS',-140,8),('BÜYÜK OKYANUS',168,22),('HİNT OKYANUSU',78,-22)]: etk(t,lo,la,'hs-ad1 hs-okyanus',36,0,8)
for t,lo,la in [('AFRİKA',20,8),('AVRUPA',22,55),('ASYA',95,52),('KUZEY AMERİKA',-102,45),('GÜNEY AMERİKA',-60,-12),('AVUSTRALYA',134,-26)]: etk(t,lo,la,'hs-ad1 hs-kita',40,0,12)
for t,lo,la,a in [('Akdeniz',18,34.6,0),('Karadeniz',34.5,43.4,0),('Kızıldeniz',38.3,20.5,-58),('Hazar Denizi',50.7,41,-70),('Basra Körfezi',51.2,27.3,-30),('Arap Denizi',63,15,0),('Bengal Körfezi',89,15,0),('Güney Çin Denizi',114,13,0),('Doğu Çin Denizi',126,28,0),('Japon Denizi',135,40.5,0),('Meksika Körfezi',-90,25,0),('Karayip Denizi',-76,15,0),('Kuzey Denizi',3.2,56,0),('Baltık Denizi',19,57,-60),('Ege',25.0,39.2,0),('Aral',59.5,45,0)]: etk(t,lo,la,'hs-ad2 hs-deniz-ad',17 if len(t)>5 else 14,a,1)
import collections
DTR={'HIMALAYAS':'Himalayalar','ALPS':'Alpler','ANDES':'And Dağları','ROCKY MOUNTAINS':'Kayalık Dağlar','ATLAS MOUNTAINS':'Atlas Dağları','ZAGROS MOUNTAINS':'Zagros Dağları','CAUCASUS MTS.':'Kafkas Dağları','URAL MOUNTAINS':'Ural Dağları','TAURUS':'Toros Dağları','PYRENEES':'Pireneler','CARPATHIAN MOUNTAINS':'Karpatlar','APPENNINI':'Apeninler','HINDU KUSH':'Hindukuş','PAMIRS':'Pamir','TIAN SHAN':'Tanrı Dağları','KUNLUN MOUNTAINS':'Kunlun Dağları','ALTAY MOUNTAINS':'Altay Dağları','ETHIOPIAN HIGHLANDS':'Habeş Yaylası','APPALACHIAN MTS.':'Appalaş Dağları','GREAT DIVIDING RANGE':'Büyük Set Dağları','ELBURZ MTS.':'Elburz Dağları','KARAKORAM RA.':'Karakurum','SIERRA MADRE OCCIDENTAL':'Sierra Madre','DRAKENSBERG':'Drakensberg','WESTERN GHATS':'Batı Gatlar','PONTIC MOUNTAINS':'Kuzey Anadolu Dağları','KJØLEN MOUNTAINS':'İskandinav Dağları','Balkan Mts.':'Balkan Dağları'}
for p,g in daglar:
    t=DTR.get(p['NAME'])
    if not t: continue
    DTR.pop(p['NAME']);c=g.representative_point()
    etk(t,c.x,c.y-0.6,'hs-ad3 hs-dag-ad',11.5,0,0.5)
nad={'Nile':'Nil','Euphrates':'Fırat','Tigris':'Dicle','Ganges':'Ganj','Indus':'İndus','Yangtze':'Yangtze','Huang':'Sarı Irmak','Danube':'Tuna','Rhine':'Ren','Volga':'Volga','Congo':'Kongo','Niger':'Nijer','Amazonas':'Amazon','Mississippi':'Mississippi','Amu  Darya':'Ceyhun','Syr Darya':'Seyhun','Seine':'Sen','Thames':'Thames','Rhône':'Ron','Po':'Po'}
bul=collections.defaultdict(list)
for f in yukle('ne_50m_rivers_lake_centerlines.geojson'):
    n=f['properties']['name'] or '';ne=f['properties'].get('name_en') or ''
    for k in nad:
        if n==k or ne==k or n.startswith(k+' ') : bul[k].append(shape(f['geometry']))
for k,gs in bul.items():
    g=unary_union(gs);ls=[g] if isinstance(g,LineString) else list(g.geoms)
    l=max(ls,key=lambda z:z.length);a=l.interpolate(0.45,normalized=True);b=l.interpolate(0.47,normalized=True)
    pa,pb=pr(a.x,a.y),pr(b.x,b.y);aci=math.degrees(math.atan2(pb[1]-pa[1],pb[0]-pa[0]))
    if aci>90: aci-=180
    if aci<-90: aci+=180
    etk(nad[k],a.x,a.y,'hs-ad3 hs-nehir-ad',10.5,round(aci),0.3)
print('eksik nehir',[k for k in nad if k not in bul])
# dalgalar
dal=[]
for lo,la in [(-30,40),(-25,5),(-45,-30),(-150,30),(-120,-20),(-160,-35),(60,-35),(95,-5),(150,0),(175,-30),(5,-20),(-10,-45),(100,-45),(-100,0)]:
    x,y=pr(lo,la) if lo>=LONMIN else pr(lo+360,la)
    for j in range(2): xx=x+j*18;yy=y+j*9;dal.append('M%.0f %.0fq6 -5 12 0t12 0t12 0'%(xx,yy))
D_DALGA=''.join(dal)
# pusula
cx,cy=2470,1330
pus='<g class="hs-pusula" transform="translate(%d %d)"><circle r="34"/><path d="M0-52L8-8L52 0L8 8L0 52L-8 8L-52 0L-8-8Z"/><path class="ic" d="M0-52L8-8L0 0ZM52 0L8 8L0 0ZM0 52L-8 8L0 0ZM-52 0L-8-8L0 0Z"/><text y="-58" font-size="16" text-anchor="middle">K</text></g>'%(cx,cy)
svg=('<svg class="iz-taban" viewBox="0 0 %d %d" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'%(W,H)+
 '<style>'+open('stil.css').read().replace('\n','')+'</style><defs><radialGradient id="hsVin" cx="50%%" cy="50%%" r="75%%"><stop offset="70%%" stop-opacity="0" class="hs-vs"/><stop offset="100%%" stop-opacity=".9" class="hs-vs"/></radialGradient><path id="hsKara" d="%s"/></defs>'%D_KARA+
 '<rect class="hs-deniz" fill="#BCD3E4" width="%d" height="%d"/>'%(W,H)+
 '<path class="hs-dalga" fill="none" d="%s"/>'%D_DALGA+
 '<use href="#hsKara" class="hs-golge" fill="none"/><use href="#hsKara" class="hs-kara" fill="#F5E6C6"/>'+
 '<path class="hs-nehir" fill="none" d="%s"/>'%D_NEHIR+
 '<path class="hs-gol" d="%s"/>'%D_GOL+
 '<path class="hs-dag" fill="none" d="%s"/>'%D_DAG+
 '<use href="#hsKara" class="hs-kiyi" fill="none" stroke="#23395F"/>'+
 '<g class="hs-adlar">'+''.join(ETK)+'</g>'+pus+
 '<rect class="hs-vin" width="%d" height="%d" fill="url(#hsVin)"/></svg>'%(W,H))
open('/home/claude/odak/veri/izinde/harita.svg','w').write(svg)
print(len(svg)//1024,'KB','kara',len(D_KARA)//1024,'nehir',len(D_NEHIR)//1024,'dag',len(D_DAG)//1024,'gol',len(D_GOL)//1024)
