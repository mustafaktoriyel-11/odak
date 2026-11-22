from besteci import yap
P=[62,64,66,69,71]  # D pentatonik
def kur(m):
    m.addProgramChange(0,0,0,92)   # bowed/pad
    m.addProgramChange(1,1,0,107)  # koto
    m.addProgramChange(2,2,0,75)   # pan/bambu flüt
    for b in range(0,32,8): m.addNote(0,0,38,b,8,44);m.addNote(0,0,50,b,8,34)
    k=[(0,0),(0.5,2),(1,4),(2,3),(3,1),(4,0),(4.5,2),(5,4),(6,3),(7,2)]
    for o in range(4):
        for t,i in k: m.addNote(1,1,P[i]+(12 if o%2 and t>5 else 0),o*8+t,1.5,48 if t in(0,4) else 38)
    mel=[(2,74,2),(4,76,1),(5,78,1),(6,76,2),(9,74,1),(10,71,1),(11,69,3),
         (16,71,1.5),(17.5,74,0.5),(18,76,2),(20,74,1),(21,71,1),(22,69,2),(25,66,1),(26,64,2),(28,62,4)]
    for t,p,d in mel: m.addNote(2,2,p,t,d,56)
yap('cin',66,8,kur)
