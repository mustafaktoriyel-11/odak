"""MEB 2026-2027 resmî yıllık planındaki başlangıç haftalarını veri/izinde/mufredat.json'a uygular.
Konu kimlikleri DEĞİŞMEZ (sorular bunlara bağlı); yalnız 'hafta' ve 'dogrulandi' güncellenir.
Kaynaklar (Mustafa yükledi, 21 Kasım 2026): MATEMATİK 5-8. SINIF TASLAK ÇERÇEVE YILLIK PLAN (2026-2027) ve
MEB matematik-dersi-taslak-yillik-planlar (2026-2027 ANADOLU LİSESİ 9, 10, 11, 12. SINIF TASLAK YILLIK PLAN). Fen lisesi planı ayrı; Anadolu lisesi esas alındı.
Hafta numarası -> pazartesi: 1-9: 14 Eyl'den; 10-18: 23 Kas'tan (16-20 Kas ara tatil); 19-22: 8 Şub'dan (yarıyıl); 23+: 15 Mar'tan (8-12 Mar ara tatil).
Kullanım: python3 izinde-arac/plan_uygula.py"""
import json, datetime
def W(n):
    d=datetime.date
    if n<=9: b,k=d(2026,9,14),n-1
    elif n<=18: b,k=d(2026,11,23),n-10
    elif n<=22: b,k=d(2027,2,8),n-19
    else: b,k=d(2027,3,15),n-23
    return (b+datetime.timedelta(weeks=k)).isoformat()
PLAN={  # konu id -> plandaki ilk hafta numarası (öğrenme çıktısı koduna göre)
 # 6. sınıf (Maarif)
 '6.1.1':1,'6.1.2':2,'6.1.3':3,'6.1.4':3,
 '6.3.1':4,'6.3.2':4,'6.3.3':5,
 '6.4.2':5,'6.4.3':6,'6.4.1':8,'6.4.4':12,
 '6.2.1':13,'6.2.2':13,'6.2.3':15,'6.2.4':15,'6.2.5':18,
 '6.6.1':19,'6.6.2':20,'6.6.3':20,'6.6.4':21,
 '6.5.1':23,'6.5.2':26,'6.5.3':28,'6.5.4':28,
 '6.7.1':30,'6.7.2':31,'6.7.3':34,'6.7.4':36,
 # 7. sınıf (Maarif)
 '7.1.1':1,'7.1.2':3,'7.1.3':4,'7.1.4':6,
 '7.2.1':8,'7.2.2':9,'7.2.3':9,'7.2.4':9,'7.2.5':10,'7.2.6':11,
 '7.3.1':12,'7.3.2':15,
 '7.4.1':17,'7.4.2':18,
 '7.5.1':19,'7.5.2':19,
 '7.6.1':20,'7.6.2':21,'7.6.3':22,
 '7.9.1':23,'7.9.2':23,'7.9.3':24,
 '7.7.1':25,'7.7.2':27,'7.7.3':30,'7.7.4':32,
 '7.8.1':33,'7.8.2':33,'7.8.3':35,'7.8.4':36,
 # 8. sınıf (2018 programı)
 # 9. sınıf (Maarif, Anadolu lisesi)
 '9.1.1':1,'9.1.2':3,'9.1.3':5,'9.1.4':6,'9.2.1':7,'9.2.2':10,'9.2.3':11,'9.3.1':13,
 '9.4.1':15,'9.4.2':17,'9.4.3':20,'9.4.4':20,'9.4.5':21,'9.5.1':22,'9.5.2':26,'9.6.1':27,'9.6.2':33,'9.7.1':33,'9.7.2':34,
 # 10. sınıf
 '10.1.1':1,'10.1.2':3,'10.1.3':4,'10.1.4':6,'10.2.1':7,'10.2.2':10,'10.3.1':11,'10.3.2':11,'10.3.3':13,
 '10.4.1':14,'10.4.2':15,'10.4.3':17,'10.4.4':19,'10.4.5':21,'10.4.6':23,'10.5.1':25,'10.5.2':28,'10.6.1':29,'10.6.2':31,'10.7.1':33,'10.7.2':35,
 # 11. sınıf
 '11.1.1':1,'11.1.2':4,'11.2.1':5,'11.2.2':10,'11.2.3':10,'11.2.4':11,'11.2.5':14,'11.3.1':15,'11.3.2':22,
 '11.4.1':23,'11.4.2':25,'11.4.3':26,'11.4.4':29,'11.5.1':30,'11.5.2':34,
 # 12. sınıf (2018 programı)
 '12.1.1':1,'12.1.2':2,'12.1.3':5,'12.2.1':7,'12.3.1':10,'12.3.2':13,'12.4.1':16,'12.5.1':19,'12.5.2':20,'12.5.3':23,'12.6.1':26,'12.6.2':29,'12.7.1':33,
 '8.1.1':1,'8.2.1':3,'8.3.1':6,'8.4.1':11,'8.5.1':13,'8.6.1':15,'8.7.1':18,'8.8.1':24,'8.9.1':26,'8.10.1':30,'8.11.1':32,'8.12.1':34,
}
p='veri/izinde/mufredat.json'; m=json.load(open(p,encoding='utf-8'))
gor=set()
for s in ('6','7','8','9','10','11','12'):
    for u in m['siniflar'][s]['uniteler']:
        for k in u['konular']:
            if k['id'] in PLAN:
                eski=k['hafta']; k['hafta']=W(PLAN[k['id']]); k['dogrulandi']=True; gor.add(k['id'])
                if eski!=k['hafta']: print(k['id'], eski,'->',k['hafta'], k['ad'][:50])
eksik=set(PLAN)-gor; assert not eksik, eksik
m.setdefault('kaynak',{})['6-8']='MEB 2026-2027 taslak çerçeve yıllık plan (5-8. sınıf matematik), resmî hafta dağılımı'
m['kaynak']['9-12']='MEB 2026-2027 Anadolu lisesi 9-12. sınıf matematik taslak yıllık planı, resmî hafta dağılımı'
for u in m['siniflar']['10']['uniteler']:
    for k in u['konular']:
        if k['id']=='10.7.2': k['ad']='Bayes teoremi'
json.dump(m,open(p,'w',encoding='utf-8'),ensure_ascii=False,indent=1)
