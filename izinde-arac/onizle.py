#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Gunluk set onizlemesi (js/izinde-secim.js'in Python karsiligi).
python3 izinde-arac/onizle.py --sinif 9 --tarih 2026-11-23 --n 8 [--gun 7]"""
import argparse
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import izinde_ortak as ort  # noqa: E402


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--sinif", required=True)
    ap.add_argument("--tarih", required=True)
    ap.add_argument("--n", type=int, default=8)
    ap.add_argument("--gun", type=int, default=1)
    a = ap.parse_args()
    muf = ort.mufredat_yukle()
    sorular = ort.sorular_yukle(a.sinif)
    sec = ort.Secici(sorular, muf, a.sinif, a.n)
    konu_ad = {k["id"]: k for k in ort.konular(muf, a.sinif)}
    t0 = ort.gun_no(a.tarih)
    gor = {}
    konu_top = {}
    ozet_rep = 0
    onceki = set()
    for g in range(a.gun):
        iso = ort.gun_iso(t0 + g)
        s = sec.set(iso)
        acik = ort.acik_konular(muf, a.sinif, iso)
        print("\n%s  (acik konu: %d, havuz: %d, set: %d)" % (iso, len(acik), len([q for q in sorular if q["konu"] in {k["id"] for k in acik}]), len(s)))
        for q in s:
            k = konu_ad[q["konu"]]
            print("  %-8s %-7s z%d %-9s %s" % (q["id"], q["konu"], q["zorluk"], k["alan"], k["ad"][:50]))
            konu_top[q["konu"]] = konu_top.get(q["konu"], 0) + 1
            gor.setdefault(q["id"], []).append(iso)
        ids = set(q["id"] for q in s)
        ard = ids & onceki
        if ard:
            print("  ! onceki gunle ortak: %s" % ", ".join(sorted(ard)))
        onceki = ids
    print("\n== konu dagilimi ==")
    for kid, n in sorted(konu_top.items(), key=lambda x: (-x[1], x[0])):
        print("  %-7s %3d  %s" % (kid, n, konu_ad[kid]["ad"]))
    tek = [(i, d) for i, d in gor.items() if len(d) > 1]
    print("\n== tekrarlar (%d soru birden fazla gunde) ==" % len(tek))
    for i, d in sorted(tek):
        print("  %s: %s" % (i, ", ".join(d)))
    print("\nbenzersiz soru: %d, toplam yerlesim: %d" % (len(gor), sum(len(d) for d in gor.values())))


if __name__ == "__main__":
    main()
