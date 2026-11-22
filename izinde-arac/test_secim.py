#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""js/izinde-secim.js ile izinde_ortak.py'nin AYNI seti urettigini karsilastirir (node gerekir).
python3 izinde-arac/test_secim.py"""
import json
import os
import random
import subprocess
import sys
import tempfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import izinde_ortak as ort  # noqa: E402

JS = os.path.join(ort.KOK, "js", "izinde-secim.js")
NODE = """
var fs=require('fs');global.window={};require(process.argv[2]);
var g=JSON.parse(fs.readFileSync(process.argv[3],'utf8'));
var out=g.cases.map(function(c){
  var q=g.pools[c.pool], m=g.mufredat;
  var sets=c.dates.map(function(d){ return window.IZINDE_SECIM.gununSeti(q,m,c.sinif,d,c.n).map(function(x){return x.id;}); });
  var acik=c.dates.map(function(d){ return window.IZINDE_SECIM.acikKonular(m,c.sinif,d).map(function(k){return k.id;}); });
  return {sets:sets,acik:acik};
});
process.stdout.write(JSON.stringify(out));
"""


def sentetik(muf, sinif, adet, rng):
    ks = ort.konular(muf, sinif)
    sik = 4 if sinif in ("5", "6", "7", "8") else 5
    return [{"id": "%s-%04d" % (sinif, i + 1), "konu": rng.choice(ks)["id"], "zorluk": rng.choice([1, 2, 3]),
             "s": "x%d" % i, "o": list("abcde")[:sik], "c": 0, "a": "", "kaynak": "ozgun"} for i in range(adet)]


def tarihler(bas, gun):
    t = ort.gun_no(bas)
    return [ort.gun_iso(t + i) for i in range(gun)]


def main():
    muf = ort.mufredat_yukle()
    rng = random.Random(7)
    pools = {"gercek9": ort.sorular_yukle("9")}
    pools["s9"] = sentetik(muf, "9", 300, rng)
    pools["s9kucuk"] = sentetik(muf, "9", 14, rng)
    pools["s6"] = sentetik(muf, "6", 250, rng)
    pools["s8"] = sentetik(muf, "8", 120, rng)
    pools["sM"] = sentetik(muf, "Mezun", 400, rng)
    pools["s12"] = sentetik(muf, "12", 200, rng)
    cases = []
    for sinif, pool in (("9", "gercek9"), ("9", "s9"), ("9", "s9kucuk"), ("6", "s6"), ("8", "s8"), ("Mezun", "sM"), ("12", "s12")):
        for n in (5, 8, 10):
            for bas in ("2026-09-20", "2026-11-23", "2027-01-30", "2027-05-31", "2026-08-30"):
                cases.append({"sinif": sinif, "pool": pool, "n": n, "dates": tarihler(bas, 20)})
    with tempfile.TemporaryDirectory() as td:
        gir, nod = os.path.join(td, "g.json"), os.path.join(td, "t.js")
        with open(gir, "w", encoding="utf-8") as f:
            json.dump({"cases": cases, "pools": pools, "mufredat": muf}, f, ensure_ascii=False)
        with open(nod, "w") as f:
            f.write(NODE)
        r = subprocess.run(["node", nod, JS, gir], capture_output=True, text=True)
    if r.returncode != 0:
        print("node hatasi:", r.stderr)
        sys.exit(2)
    js = json.loads(r.stdout)
    sorun = esles = tekrar14 = kontrol = geo_tekrar = 0
    for c, j in zip(cases, js):
        sec = ort.Secici(pools[c["pool"]], muf, c["sinif"], c["n"])
        for d, jset, jacik in zip(c["dates"], j["sets"], j["acik"]):
            pset = [q["id"] for q in sec.set(d)]
            pacik = [k["id"] for k in ort.acik_konular(muf, c["sinif"], d)]
            etiket = "%s n=%d %s %s" % (c["sinif"], c["n"], c["pool"], d)
            if pset != jset:
                sorun += 1
                print("FARK set", etiket, "\n  py:", pset, "\n  js:", jset)
            elif pacik != jacik:
                sorun += 1
                print("FARK acik konu", etiket)
            else:
                esles += 1
            # degismezler
            if len(set(jset)) != len(jset):
                sorun += 1
                print("tekrarli soru", etiket)
            acikid = set(pacik)
            havuz = [q for q in pools[c["pool"]] if q["konu"] in acikid]
            if len(jset) != min(c["n"], len(havuz)):
                sorun += 1
                print("boyut hatali", etiket, len(jset), len(havuz))
            kon = dict((q["id"], q) for q in pools[c["pool"]])
            if any(kon[i]["konu"] not in acikid for i in jset):
                sorun += 1
                print("kapali konudan soru", etiket)
            kontrol += 1
    # 14 gun kurali: acik havuz >= 15*n ise (yeterince genis) 14 gun icinde tekrar OLMAMALI
    for c, j in zip(cases, js):
        for i in range(len(j["sets"])):
            havuz = [q for q in pools[c["pool"]] if q["konu"] in set(j["acik"][i])]
            if len(havuz) < 15 * c["n"] or c["dates"][i] < ort.DAYANAK:
                continue
            for k in range(max(0, i - 14), i):
                if c["dates"][k] < ort.DAYANAK:
                    continue
                ortak = set(j["sets"][i]) & set(j["sets"][k])
                geo = set(kk["id"] for kk in ort.konular(muf, c["sinif"]) if kk["alan"] == "geometri")
                for q in pools[c["pool"]]:
                    if q["id"] in ortak:
                        if q["konu"] in geo:
                            geo_tekrar += 1  # 'en az 1 geometri' kurali taze kurala ustun: bilincli
                        else:
                            tekrar14 += 1
    print("karsilastirilan gun-seti: %d, eslesen: %d, sorun: %d" % (kontrol, esles, sorun))
    print("genis havuzda (>=15*n) 14 gun icinde tekrar: %d (+%d geometri-kurali kaynakli, bilincli)" % (tekrar14, geo_tekrar))
    if tekrar14:
        sorun += 1
    sys.exit(1 if sorun else 0)


if __name__ == "__main__":
    main()
