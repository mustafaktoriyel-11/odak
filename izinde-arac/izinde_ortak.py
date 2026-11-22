# -*- coding: utf-8 -*-
"""Ortak yardimcilar: mufredat/soru yukleme ve js/izinde-secim.js'in birebir Python karsiligi.
Secici mantigini degistirirsen JS dosyasini da degistir; test_secim.py ikisini karsilastirir."""
import datetime
import glob
import json
import math
import os

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VERI = os.path.join(KOK, "veri", "izinde")
M = 0xFFFFFFFF

TAMPON_VARSAYILAN = 2
GECMIS_GUN = 14
YENI_KONU_GUN = 21
DAYANAK = "2026-11-23"
ZINCIR_EN_FAZLA = 400


def yukle(yol):
    with open(yol, encoding="utf-8") as f:
        return json.load(f)


def mufredat_yukle(veri=VERI):
    return yukle(os.path.join(veri, "mufredat.json"))


def sorular_yukle(sinif, veri=VERI):
    return yukle(os.path.join(veri, "sorular-%s.json" % sinif))["sorular"]


def gun_no(iso):
    y, m, d = [int(x) for x in str(iso).split("-")]
    return (datetime.date(y, m, d) - datetime.date(1970, 1, 1)).days


def gun_iso(no):
    return (datetime.date(1970, 1, 1) + datetime.timedelta(days=no)).isoformat()


def imul(a, b):
    return (a * b) & M


def fnv1a(s):
    h = 0x811C9DC5
    for ch in s:
        h ^= ord(ch)
        h = imul(h, 16777619)
    return h & M


def mulberry32(a):
    st = {"a": a & M}

    def rnd():
        a = (st["a"] + 0x6D2B79F5) & M
        st["a"] = a
        t = imul(a ^ (a >> 15), 1 | a)
        t = (((t + imul(t ^ (t >> 7), 61 | t)) & M) ^ t) & M
        return ((t ^ (t >> 14)) & M) / 4294967296.0
    return rnd


def karistir(dizi, rnd):
    for i in range(len(dizi) - 1, 0, -1):
        j = int(math.floor(rnd() * (i + 1)))
        dizi[i], dizi[j] = dizi[j], dizi[i]
    return dizi


def konular(mufredat, sinif):
    s = mufredat.get("siniflar", {}).get(str(sinif))
    out = []
    if not s:
        return out
    for u in s["uniteler"]:
        out.extend(u["konular"])
    return out


def acilis_gunu(mufredat, konu):
    if not konu.get("hafta"):
        return None
    tampon = mufredat.get("tampon_hafta", TAMPON_VARSAYILAN)
    return gun_no(konu["hafta"]) + tampon * 7


def acik_konular(mufredat, sinif, tarih):
    hepsi = konular(mufredat, sinif)
    if str(sinif) == "Mezun":
        return hepsi
    t = gun_no(tarih)
    out = []
    for k in hepsi:
        a = acilis_gunu(mufredat, k)
        if a is None or a <= t:
            out.append(k)
    return out


def _set_sec(sorular, mufredat, sinif, tarih, n, yasak, son=None):
    son = son or {}
    acik = acik_konular(mufredat, sinif, tarih)
    acik_id, yeni_id, geo_id = set(), set(), set()
    t = gun_no(tarih)
    for k in acik:
        acik_id.add(k["id"])
        if k["alan"] == "geometri":
            geo_id.add(k["id"])
        a = acilis_gunu(mufredat, k)
        if a is not None and t - YENI_KONU_GUN < a <= t:
            yeni_id.add(k["id"])
    havuz = [q for q in sorular if q["konu"] in acik_id]
    rnd = mulberry32(fnv1a(tarih + "|" + str(sinif)))
    hic = sorted([q for q in havuz if q["id"] not in yasak and q["id"] not in son], key=lambda q: q["id"])
    eski = sorted([q for q in havuz if q["id"] not in yasak and q["id"] in son], key=lambda q: q["id"])
    bayat = sorted([q for q in havuz if q["id"] in yasak], key=lambda q: q["id"])
    karistir(hic, rnd)
    karistir(eski, rnd)
    karistir(bayat, rnd)
    eski.sort(key=lambda q: son[q["id"]])  # en uzun suredir cikmayan once (kararli)
    L = hic + eski + bayat
    if len(L) <= n:
        return karistir(list(L), rnd)
    secilen = []
    st = {"yeni": 0, "geo": 0}
    secildi = set()
    konu_say = {}
    zor_say = {1: 0, 2: 0, 3: 0}

    def al(q):
        secildi.add(q["id"])
        secilen.append(q)
        konu_say[q["konu"]] = konu_say.get(q["konu"], 0) + 1
        zor_say[q["zorluk"]] += 1
        if q["konu"] in yeni_id:
            st["yeni"] += 1
        if q["konu"] in geo_id:
            st["geo"] += 1

    def sec(uygun, ust, taze_zorunlu=False):
        for q in L:
            if q["id"] in secildi or konu_say.get(q["konu"], 0) >= ust:
                continue
            if taze_zorunlu and q["id"] in yasak:
                continue
            if uygun is not None and not uygun(q):
                continue
            al(q)
            return True
        return False

    if st["geo"] == 0 and n >= 1:
        gf = lambda q: q["konu"] in geo_id  # noqa: E731
        if not sec(gf, 2, True):
            sec(gf, 2, False)
    if n >= 5:
        for z in (1, 2, 3):
            if zor_say[z] == 0:
                zf = lambda q, z=z: q["zorluk"] == z  # noqa: E731
                sec(zf, 2, True)  # zorluk dengesi icin son 14 gunun sorusu secilmez
    hedef = (2 * n + 4) // 5
    while len(secilen) < n and st["yeni"] < hedef:
        if not sec(lambda q: q["konu"] in yeni_id, 2, True):
            break
    for tz in (True, False):
        for ust in (2, 3, 1000):
            while len(secilen) < n and sec(None, ust, tz):
                pass
    return karistir(secilen, rnd)


class Secici(object):
    """JS'teki gununSeti + onbellek karsiligi. Ornek: Secici(sorular, mufredat, '9', 8).set('2026-11-23')"""

    def __init__(self, sorular, mufredat, sinif, n):
        self.sinif = str(sinif)
        self.mufredat = mufredat
        self.n = n
        kon = set(k["id"] for k in konular(mufredat, self.sinif))
        self.sorular = [q for q in sorular if q["konu"] in kon]
        self.gunler = {}

    def set(self, tarih):
        t = gun_no(tarih)
        if t < gun_no(DAYANAK):
            return _set_sec(self.sorular, self.mufredat, self.sinif, tarih, self.n, set())
        bas = max(gun_no(DAYANAK), t - ZINCIR_EN_FAZLA)
        for g in range(bas, t + 1):
            iso = gun_iso(g)
            if iso not in self.gunler:
                yasak, son = set(), {}
                for d in range(g - bas, 0, -1):
                    onceki = self.gunler.get(gun_iso(g - d))
                    if onceki:
                        for q in onceki:
                            son[q["id"]] = g - d
                            if d <= GECMIS_GUN:
                                yasak.add(q["id"])
                self.gunler[iso] = _set_sec(self.sorular, self.mufredat, self.sinif, iso, self.n, yasak, son)
        return list(self.gunler[tarih])
