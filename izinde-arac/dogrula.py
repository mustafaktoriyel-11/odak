#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Matematigin Izinde soru dosyalarini denetler.

Kullanim:
  python3 izinde-arac/dogrula.py [dosya...] [--kapsam] [--tarih YYYY-MM-DD]
Dosya verilmezse veri/izinde/sorular-*.json hepsi. HATA varsa cikis kodu 1.
--kapsam: konu basina soru sayisi tablosu + hic sorusu olmayan, --tarih'te (varsayilan bugun) acik konular.
"""
import argparse
import datetime
import glob
import json
import os
import re
import sys
import xml.etree.ElementTree as ET

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import izinde_ortak as ort  # noqa: E402

ALAN = {"id", "konu", "zorluk", "s", "o", "c", "a", "sekil", "kaynak", "ornek"}
ETIKET = {"svg", "g", "line", "polyline", "polygon", "path", "circle", "ellipse", "rect", "text", "tspan"}
OZNITELIK = {"viewBox", "width", "height", "x", "y", "x1", "y1", "x2", "y2", "cx", "cy", "r", "rx", "ry",
             "points", "d", "fill", "stroke", "stroke-width", "stroke-dasharray", "font-size",
             "font-weight", "text-anchor", "dominant-baseline", "transform"}
RENK = {"none", "currentcolor", "#1e3bd6", "#ff8a1f", "#141b3f", "#1fa463", "#9aa3c7"}
SVG_YASAK = re.compile(r"<\s*(script|style|foreignObject|image)\b|\bon\w+\s*=|href|javascript:|url\s*\(|xmlns", re.I)
LATEX_YASAK = re.compile(r"\\(begin|end|newcommand|renewcommand|def|href|url|includegraphics|input|include)\b")
OLUMSUZ = re.compile(r"(değildir|yanlıştır|olamaz)", re.I)


def trlower(s):
    return s.replace("İ", "i").replace("I", "ı").lower()


def trupper(s):
    return s.replace("i", "İ").replace("ı", "I").upper()


def normalize(s):
    s = trlower(s)
    s = re.sub(r"[^0-9a-zçğıöşü]+", " ", s)
    return " ".join(s.split())


def matematik_parcalar(metin):
    """$...$ icindeki parcalari dondurur; $ sayisi (kacisli \\$ haric) tek ise None."""
    parcalar, i, acik, bas = [], 0, False, 0
    while i < len(metin):
        c = metin[i]
        if c == "\\":
            i += 2
            continue
        if c == "$":
            if acik:
                parcalar.append(metin[bas:i])
            else:
                bas = i + 1
            acik = not acik
        i += 1
    return None if acik else parcalar


def suslu_dengeli(m):
    d, i = 0, 0
    while i < len(m):
        if m[i] == "\\":
            i += 2
            continue
        if m[i] == "{":
            d += 1
        elif m[i] == "}":
            d -= 1
            if d < 0:
                return False
        i += 1
    return d == 0


def metin_denetle(ad, metin, enc, hata):
    if not isinstance(metin, str) or not metin.strip():
        hata("%s: bos veya metin degil" % ad)
        return
    if len(metin) > enc:
        hata("%s: %d karakter (en cok %d)" % (ad, len(metin), enc))
    p = matematik_parcalar(metin)
    if p is None:
        hata("%s: $ isaretleri dengesiz" % ad)
        return
    for m in p:
        if not m.strip():
            hata("%s: bos $$ ifadesi" % ad)
        if not suslu_dengeli(m):
            hata("%s: LaTeX'te suslu parantezler dengesiz: $%s$" % (ad, m))
        if LATEX_YASAK.search(m):
            hata("%s: desteklenmeyen LaTeX komutu: $%s$" % (ad, m))


def svg_denetle(svg, hata):
    if not isinstance(svg, str):
        hata("sekil: metin degil")
        return
    if len(svg) > 6000:
        hata("sekil: %d karakter (en cok 6000)" % len(svg))
    y = SVG_YASAK.search(svg)
    if y:
        hata("sekil: yasak oge/ozellik: %r" % y.group(0))
    try:
        kok = ET.fromstring(svg)
    except ET.ParseError as e:
        hata("sekil: gecerli XML degil (%s)" % e)
        return
    if kok.tag != "svg":
        hata("sekil: kok etiket svg olmali (bulunan %s)" % kok.tag)
    if "viewBox" not in kok.attrib:
        hata("sekil: viewBox zorunlu")
    for el in kok.iter():
        if not isinstance(el.tag, str) or el.tag not in ETIKET:
            hata("sekil: izinsiz etiket: %s" % el.tag)
        for k, v in el.attrib.items():
            if k not in OZNITELIK:
                hata("sekil: izinsiz oznitelik: %s (<%s>)" % (k, el.tag))
            elif k in ("fill", "stroke") and v.strip().lower() not in RENK:
                hata("sekil: izinsiz renk %s=%r" % (k, v))


def dosya_denetle(yol, muf):
    hatalar, uyarilar, bilgi = [], [], {}
    try:
        d = ort.yukle(yol)
    except Exception as e:  # noqa
        return ["JSON okunamadi: %s" % e], [], {}
    sinif = str(d.get("sinif"))
    if sinif not in muf["siniflar"]:
        hatalar.append("sinif gecersiz: %r" % d.get("sinif"))
        return hatalar, uyarilar, {}
    ad = os.path.basename(yol)
    if ad != "sorular-%s.json" % sinif:
        uyarilar.append("dosya adi sorular-%s.json olmali" % sinif)
    if not isinstance(d.get("surum"), int):
        hatalar.append("surum tamsayi olmali")
    sorular = d.get("sorular")
    if not isinstance(sorular, list):
        hatalar.append("sorular liste olmali")
        return hatalar, uyarilar, {}
    onek = "M" if sinif == "Mezun" else sinif
    sik = 4 if sinif in ("6", "7", "8") else 5
    konu_idleri = {k["id"] for k in ort.konular(muf, sinif)}
    tum_konu = {k["id"] for s in muf["siniflar"].values() for u in s["uniteler"] for k in u["konular"]}
    ids, koklar, say, harf, ornek = set(), {}, {}, [0] * sik, 0
    idre = re.compile(r"^%s-\d{4}$" % re.escape(sinif))
    for idx, q in enumerate(sorular):
        qid = q.get("id") if isinstance(q, dict) else None
        et = "[%s]" % (qid or "#%d" % (idx + 1))

        def h(m, et=et):
            hatalar.append("%s %s" % (et, m))

        def u(m, et=et):
            uyarilar.append("%s %s" % (et, m))
        if not isinstance(q, dict):
            h("soru nesne degil")
            continue
        for k in q:
            if k not in ALAN:
                h("bilinmeyen alan: %s" % k)
        if not isinstance(qid, str) or not idre.match(qid):
            h("id '%s-NNNN' bicimde olmali" % sinif)
        elif qid in ids:
            h("id tekrar")
        ids.add(qid)
        kid = q.get("konu")
        if kid not in tum_konu:
            h("konu id'si mufredatta yok: %r" % (kid,))
        elif kid not in konu_idleri:
            h("konu baska sinifa ait: %s (bu dosya %s. sinif)" % (kid, sinif))
        else:
            say[kid] = say.get(kid, 0) + 1
        z = q.get("zorluk")
        if isinstance(z, bool) or z not in (1, 2, 3):
            h("zorluk 1, 2 veya 3 olmali")
        metin_denetle("s", q.get("s"), 400, h)
        metin_denetle("a", q.get("a"), 400, h)
        o = q.get("o")
        if not isinstance(o, list) or len(o) != sik:
            h("o tam %d secenek olmali" % sik)
        else:
            for i, s in enumerate(o):
                metin_denetle("o[%d]" % i, s, 120, h)
            nor = [" ".join(str(s).split()) for s in o]
            if len(set(nor)) != len(nor):
                h("ayni secenek tekrar ediyor")
            c = q.get("c")
            if isinstance(c, bool) or not isinstance(c, int) or not (0 <= c < sik):
                h("c 0..%d araliginda tamsayi olmali" % (sik - 1))
            else:
                harf[c] += 1
        if "sekil" in q:
            svg_denetle(q["sekil"], h)
        if q.get("kaynak") != "ozgun":
            h('kaynak "ozgun" olmali')
        if "ornek" in q:
            if q["ornek"] is not True:
                h("ornek yalniz true olabilir")
            else:
                ornek += 1
        stem = q.get("s")
        if isinstance(stem, str):
            nk = normalize(stem)
            if nk in koklar:
                h("kok %s ile ayni (tekrar)" % koklar[nk])
            else:
                koklar[nk] = qid
            for m in OLUMSUZ.finditer(stem):
                if m.group(0) != trupper(m.group(0)):
                    u("olumsuz kok '%s' BUYUK harfle yazilmali" % m.group(0))
    top = sum(harf)
    if top >= 10:
        for i, v in enumerate(harf):
            p = 100.0 * v / top
            if p < 10 or p > 35:
                uyarilar.append("dogru secenek dagilimi dengesiz: %s sikki %%%.0f (%d/%d)" % ("ABCDE"[i], p, v, top))
    elif top:
        bilgi["dagilim_notu"] = "dogru cevap dagilimi %d soruda denetlenmedi (en az 10 gerekir)" % top
    bilgi.update({"sinif": sinif, "soru": len(sorular), "ornek": ornek, "say": say,
                  "harf": dict(zip("ABCDE"[:sik], harf))})
    return hatalar, uyarilar, bilgi


def kapsam(muf, tarih, sayimlar):
    print("\n== KAPSAM (acik konu tarihi: %s) ==" % tarih)
    for sinif, s in muf["siniflar"].items():
        acik = {k["id"] for k in ort.acik_konular(muf, sinif, tarih)}
        say = sayimlar.get(sinif, {})
        bos_acik = []
        if sinif not in sayimlar:
            print("\n-- %s. sinif: soru dosyasi yok (%d acik konu) --" % (sinif, len(acik)))
            continue
        print("\n-- %s. sinif --" % sinif)
        for un in s["uniteler"]:
            for k in un["konular"]:
                n = say.get(k["id"], 0)
                isaret = "acik" if k["id"] in acik else "----"
                print("  %-7s %-4s %-8s %3d  %s" % (k["id"], isaret, k["alan"], n, k["ad"]))
                if k["id"] in acik and n == 0:
                    bos_acik.append(k)
        print("  >> sorusuz ACIK konu: %d / %d acik" % (len(bos_acik), len(acik)))
        for k in bos_acik:
            print("     - %s %s" % (k["id"], k["ad"]))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("dosyalar", nargs="*")
    ap.add_argument("--kapsam", action="store_true")
    ap.add_argument("--tarih", default=datetime.date.today().isoformat())
    a = ap.parse_args()
    muf = ort.mufredat_yukle()
    dosyalar = a.dosyalar or sorted(glob.glob(os.path.join(ort.VERI, "sorular-*.json")))
    if not dosyalar:
        print("denetlenecek dosya yok")
    th = tu = 0
    sayimlar = {}
    for yol in dosyalar:
        h, u, b = dosya_denetle(yol, muf)
        th += len(h)
        tu += len(u)
        print("\n# %s" % os.path.relpath(yol))
        for m in h:
            print("  HATA   %s" % m)
        for m in u:
            print("  UYARI  %s" % m)
        if b.get("sinif"):
            sayimlar[b["sinif"]] = b["say"]
            ek = ", ornek: %d" % b["ornek"] if b["ornek"] else ""
            print("  %d soru%s; dogru cevap dagilimi %s" % (b["soru"], ek, b["harf"]))
            if b.get("dagilim_notu"):
                print("  not: %s" % b["dagilim_notu"])
        if not h and not u:
            print("  temiz")
    print("\nOZET: %d dosya, %d HATA, %d UYARI" % (len(dosyalar), th, tu))
    if a.kapsam:
        kapsam(muf, a.tarih, sayimlar)
    sys.exit(1 if th else 0)


if __name__ == "__main__":
    main()
