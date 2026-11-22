import random;from besteci import yap
# Ortak üretici: dron/ped + akor-arp + melodi (soru-cevap, toniğe döner) + hafif vurmalı
def tema(ad,bpm,olcu,gam,kok,pad,arp,mel,perc=None,akorlar=None,seed=1,arpfig=(0,2,4,2),arpdur=0.5,melv=56,arpv=42,padv=44,mel_oktav=12,ritim=None):
    R=random.Random(seed)
    def nota(i,ok=0):  # gam derecesi -> midi
        o,d=divmod(i,len(gam));return kok+gam[d]+12*(o+ok)
    def kur(m):
        m.addProgramChange(0,0,0,pad);m.addProgramChange(1,1,0,arp);m.addProgramChange(2,2,0,mel)
        ak=akorlar or [0]*olcu
        for b in range(olcu):
            r=ak[b%len(ak)]
            m.addNote(0,0,nota(r,-1),b*4,4,padv);m.addNote(0,0,nota(r+4,-1),b*4,4,padv-8)
            t=0;k=0
            while t<4-1e-9:
                m.addNote(1,1,nota(r+arpfig[k%len(arpfig)]),b*4+t,arpdur*1.8,arpv+(8 if t==0 else 0));t+=arpdur;k+=1
        # melodi: 2 bar sus, sonra cümleler
        rit=ritim or [[2,1,1],[1,1,2],[1.5,.5,2],[3,1],[1,1,1,1],[2,2]]
        pos=2;t=pos*4;son=olcu*4-2;d=R.choice([4,2,5]);cumle=0
        while t<son:
            if (t//4)%4==3 and R.random()<.7: t=(t//4+1)*4;continue   # nefes
            for L in R.choice(rit):
                if t+L>son: break
                d+=R.choice([-2,-1,-1,1,1,2,0]);d=max(0,min(9,d))
                m.addNote(2,2,nota(d,0)+mel_oktav-12,t,L*.95,melv-(6 if L<1 else 0));t+=L
        m.addNote(2,2,nota(0,0)+mel_oktav-12,son,2,melv-10)
        if perc:
            for b in range(olcu):
                for (pt,nt,v) in perc: m.addNote(5,9,nt,b*4+pt,0.5,v)
    yap(ad,bpm,olcu,kur)

T={
 'afrika':dict(bpm=84,olcu=8,gam=[0,3,5,7,10],kok=57,pad=89,arp=108,mel=75,akorlar=[0,0,3,2],arpfig=(0,1,2,4,2,1),arpdur=0.5,perc=[(0,64,30),(1.5,63,22),(2,64,26),(3,63,20)],seed=3),
 'mezopotamya':dict(bpm=70,olcu=8,gam=[0,1,3,5,7,8,10],kok=52,pad=89,arp=24,mel=68,akorlar=[0,0,5,6],arpfig=(0,2,4,7),arpdur=1,perc=[(0,61,30),(2,60,22)],seed=5,melv=50),
 'yunan':dict(bpm=76,olcu=8,gam=[0,2,3,5,7,9,10],kok=50,pad=48,arp=46,mel=73,akorlar=[0,3,0,4],arpfig=(0,2,4,7,4,2),arpdur=0.5,seed=11),
 'hint':dict(bpm=68,olcu=8,gam=[0,2,4,6,7,9,11],kok=50,pad=89,arp=104,mel=104,akorlar=[0],arpfig=(0,4,7,4),arpdur=1,perc=[(0,60,30),(1,61,20),(1.5,61,18),(2.5,60,22),(3,61,18)],seed=8,mel_oktav=12,melv=60,arpv=34),
 'islam':dict(bpm=66,olcu=8,gam=[0,2,3,5,7,8,11],kok=50,pad=89,arp=15,mel=77,akorlar=[0,0,3,4],arpfig=(0,2,4,2),arpdur=0.5,perc=[(0,61,28),(2,60,20),(2.5,60,18)],seed=21),
 'istanbul':dict(bpm=60,olcu=8,gam=[0,1,4,5,7,8,10],kok=57,pad=48,arp=46,mel=77,akorlar=[0,0,3,0],arpfig=(0,2,4,7,4,2),arpdur=0.5,seed=31,mel_oktav=0),
 'ortacag':dict(bpm=80,olcu=8,gam=[0,2,3,5,7,9,10],kok=50,pad=52,arp=24,mel=74,akorlar=[0,6,0,4],arpfig=(0,4,2,4),arpdur=0.5,perc=[(0,54,14),(2,54,12)],seed=41),
 'avrupa':dict(bpm=78,olcu=8,gam=[0,2,4,5,7,9,11],kok=55,pad=48,arp=6,mel=40,akorlar=[0,5,3,4],arpfig=(0,4,2,4),arpdur=0.5,seed=51,melv=52,arpv=38),
 'maya':dict(bpm=72,olcu=8,gam=[0,3,5,7,10],kok=55,pad=95,arp=12,mel=75,akorlar=[0,0,3,2],arpfig=(0,2,1,3),arpdur=0.5,perc=[(0,77,26),(1.5,76,18),(3,77,20)],seed=61),
 'modern':dict(bpm=70,olcu=8,gam=[0,2,4,7,9],kok=53,pad=89,arp=0,mel=0,akorlar=[0,3,4,2],arpfig=(0,2,4,6),arpdur=1,seed=71,melv=46,arpv=32,padv=40),
 'ankara':dict(bpm=66,olcu=8,gam=[0,2,4,5,7,9,11],kok=55,pad=48,arp=0,mel=71,akorlar=[0,5,3,4],arpfig=(0,4,7,4),arpdur=0.5,seed=81,melv=52,arpv=34),
}
import sys
for ad in (sys.argv[1:] or T): tema(ad,**T[ad]);print(ad)
