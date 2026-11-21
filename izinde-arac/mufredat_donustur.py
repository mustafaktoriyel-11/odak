#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Taslak mufredati (izinde/mufredat-taslak.json) uygulama bicimine cevirir.

Cikti: veri/izinde/mufredat.json

DIKKAT - KIMLIKLER SIRADAN TURETILIR:
  konu kimligi = "<sinif>.<unite sirasi>.<konu sirasi>" (1'den baslar; Mezun icin "M.<n>.<m>").
  Taslakta unite/konu SIRASI degisirse (araya ekleme, silme, yer degistirme) kimlikler
  KAYAR ve soru dosyalarindaki "konu" alanlari yanlis konuya baglanir.
  Yeni konu/unite eklemek gerekiyorsa listenin SONUNA ekleyin; sonra dogrula.py calistirin.

Kullanim: python3 izinde-arac/mufredat_donustur.py [taslak.json] [cikti.json]
"""
import json
import os
import sys

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VARSAYILAN_GIRDI = "/home/claude/izinde/mufredat-taslak.json"
VARSAYILAN_CIKTI = os.path.join(KOK, "veri", "izinde", "mufredat.json")
SINIF_SIRASI = ["6", "7", "8", "9", "10", "11", "12", "Mezun"]


def donustur(taslak):
    siniflar = {}
    for sinif in SINIF_SIRASI:
        if sinif not in taslak["siniflar"]:
            continue
        ham = taslak["siniflar"][sinif]
        onek = "M" if sinif == "Mezun" else sinif
        uniteler = []
        for ui, u in enumerate(ham["uniteler"], 1):
            konular = []
            for ki, k in enumerate(u["konular"], 1):
                konular.append({
                    "id": "%s.%d.%d" % (onek, ui, ki),
                    "ad": k["ad"],
                    "alan": k["alan"],
                    "hafta": k.get("hafta", "") or "",
                    "sinav": list(k.get("sinav", [])),
                    "dogrulandi": bool(k.get("dogrulandi", False)),
                })
            uniteler.append({"no": ui, "ad": u["ad"], "konular": konular})
        s = {"uniteler": uniteler}
        if "program" in ham:
            s["program"] = ham["program"]
        siniflar[sinif] = s
    return {
        "surum": 1,
        "yil": taslak.get("yil"),
        "tampon_hafta": 2,
        "takvim": taslak.get("takvim", {}),
        "siniflar": siniflar,
    }


def main():
    girdi = sys.argv[1] if len(sys.argv) > 1 else VARSAYILAN_GIRDI
    cikti = sys.argv[2] if len(sys.argv) > 2 else VARSAYILAN_CIKTI
    with open(girdi, encoding="utf-8") as f:
        taslak = json.load(f)
    sonuc = donustur(taslak)
    os.makedirs(os.path.dirname(cikti), exist_ok=True)
    with open(cikti, "w", encoding="utf-8") as f:
        json.dump(sonuc, f, ensure_ascii=False, indent=1)
        f.write("\n")
    n = sum(len(u["konular"]) for s in sonuc["siniflar"].values() for u in s["uniteler"])
    print("yazildi: %s (%d sinif, %d konu)" % (cikti, len(sonuc["siniflar"]), n))


if __name__ == "__main__":
    main()
