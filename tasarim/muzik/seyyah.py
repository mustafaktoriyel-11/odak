# Harita teması "Seyyah": D dorian, ortaçağ esintili ama zamansız; yumuşak yaylı + arp + blok flüt + çok hafif def. 16 ölçü, 66 bpm ≈ 58 sn dikişsiz döngü.
from besteci import yap
D=50 # D3
AK={'Dm':[50,57,62,65],'C':[48,55,60,64],'Am':[45,52,57,60],'F':[41,53,57,60],'G':[43,50,55,59],'Em':[40,52,55,59]}
SIRA=['Dm','C','Dm','Am','F','C','G','Dm','Dm','C','F','G','Dm','Am','C','Dm']
def kur(m):
    m.addProgramChange(0,0,0,49)   # yavaş yaylılar (ped)
    m.addProgramChange(1,1,0,46)   # arp
    m.addProgramChange(2,2,0,74)   # blok flüt
    m.addProgramChange(3,3,0,32)   # akustik bas (dron hissi)
    for b,a in enumerate(SIRA):
        k=AK[a];t=b*4
        m.addNote(0,0,k[1],t,4,34);m.addNote(0,0,k[2],t,4,30);m.addNote(0,0,k[3],t,4,26)
        m.addNote(3,3,k[0]-12 if k[0]>45 else k[0],t,3.8,40)
        # arp: yürüyüş hissi veren yavaş sekizlikler (ölçü başı vurgulu)
        fig=[k[0]+12,k[1]+12,k[2]+12,k[3]+12,k[2]+12,k[1]+12]
        for i,x in enumerate([0,.75,1.5,2,2.75,3.5]):
            m.addNote(1,1,fig[i],t+x,1.4,40 if i==0 else 30)
        # def: çok hafif, ölçü başı + 3. vuruş
        m.addNote(5,9,64,t,0.5,18);m.addNote(5,9,64,t+2.5,0.5,12)
    # flüt melodisi: 1. cümle (3-8. ölçü) soru-cevap, 2. cümle (11-16) varyasyon; nefes payları bırakıldı
    mel=[(8,69,1.5),(9.5,71,.5),(10,72,1),(11,71,1),(12,69,2),(14,67,1),(15,65,1),
         (16,64,1.5),(17.5,65,.5),(18,67,2),(20,69,3),
         (24,74,1.5),(25.5,72,.5),(26,71,1),(27,69,1),(28,67,2),(30,71,2),
         (32,69,4),
         (40,72,1),(41,74,1),(42,76,2),(44,74,1),(45,72,1),(46,71,2),
         (48,72,1.5),(49.5,71,.5),(50,69,1),(51,67,1),(52,65,2),(54,67,2),
         (56,69,1.5),(57.5,67,.5),(58,65,1),(59,64,1),(60,62,4)]
    for t,p,d in mel: m.addNote(2,2,p,t,d*.97,50)
yap('seyyah',66,16,kur)
