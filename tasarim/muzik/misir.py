import random;from besteci import yap
random.seed(7)
# Hicaz (D): D Eb F# G A Bb C
H=[62,63,66,67,69,70,72,74]
def kur(m):
    # 0 dron (yaylı ped), 1 arp, 2 ney benzeri flüt, 9 vurmalı
    m.addProgramChange(0,0,0,89)   # warm pad
    m.addProgramChange(1,1,0,46)   # arp
    m.addProgramChange(2,2,0,77)   # shakuhachi ~ ney
    for b in range(0,32,8):
        m.addNote(0,0,38,b,8,52);m.addNote(0,0,45,b,8,44)
    # arp: yavaş çıkıcı figür
    fig=[0,2,4,3, 1,2,4,5]
    for o in range(8):
        for i,x in enumerate(fig):
            v=40 if i%4 else 52
            m.addNote(1,1,H[(x+(o%2))%7]-12,o*4+i*0.5,1.2,v)
    # ney melodisi: 2 cümle, soru-cevap
    mel=[(4,67,1.5),(5.5,69,0.5),(6,70,1),(7,69,1),(8,66,3),
         (12,69,1),(13,70,0.5),(13.5,72,0.5),(14,70,1),(15,69,1),(16,67,2),(18,66,1),(19,63,1),
         (20,62,4),
         (26,66,1),(27,67,1),(28,69,2),(30,63,1),(31,62,1)]
    for t,p,d in mel: m.addNote(2,2,p,t,d,58)
    # def/çerçeve davulu: hafif
    for o in range(8):
        m.addNote(5,9,61,o*4,0.5,34);m.addNote(5,9,60,o*4+1.5,0.5,24);m.addNote(5,9,60,o*4+2,0.5,26);m.addNote(5,9,61,o*4+3,0.5,22)
yap('misir',72,8,kur)
