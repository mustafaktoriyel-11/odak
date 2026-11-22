/* Matematigin Izinde - gunluk set secici (bagimsiz, ES5).
   window.IZINDE_SECIM = { acikKonular(mufredat, sinif, tarihISO), gununSeti(sorular, mufredat, sinif, tarihISO, n) }
   Ayni sinif + ayni tarih -> herkes ayni seti gorur (deterministik).
   Python karsiligi: izinde-arac/izinde_ortak.py (ikisi AYNI sonucu vermeli; izinde-arac/test_secim.py denetler).
   Mantigi degistirirsen iki dosyayi birlikte degistir. */
(function (root) {
  'use strict';

  var TAMPON_VARSAYILAN = 2;
  var GECMIS_GUN = 14;      // son 14 gunun setlerinde cikan soru tercih edilmez
  var YENI_KONU_GUN = 21;   // "son 3 hafta" icinde acilan konu
  var DAYANAK = '2026-11-23'; // gecmis zinciri bu gunden baslar (oncesi bos gecmis)
  var ZINCIR_EN_FAZLA = 400;

  function gunNo(iso) { // 'YYYY-MM-DD' -> 1970'ten beri gun sayisi (UTC)
    var p = String(iso).split('-');
    return Math.round(Date.UTC(+p[0], +p[1] - 1, +p[2]) / 86400000);
  }
  function gunISO(no) {
    var d = new Date(no * 86400000);
    var m = d.getUTCMonth() + 1, g = d.getUTCDate();
    return d.getUTCFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (g < 10 ? '0' : '') + g;
  }

  function fnv1a(str) {
    var h = 0x811c9dc5;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h >>> 0;
  }
  function mulberry32(a) {
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function karistir(dizi, rnd) { // Fisher-Yates, yerinde
    for (var i = dizi.length - 1; i > 0; i--) {
      var j = Math.floor(rnd() * (i + 1));
      var t = dizi[i]; dizi[i] = dizi[j]; dizi[j] = t;
    }
    return dizi;
  }
  function idSirala(a, b) { return a.id < b.id ? -1 : (a.id > b.id ? 1 : 0); }

  function konular(mufredat, sinif) {
    var s = mufredat && mufredat.siniflar && mufredat.siniflar[String(sinif)];
    var out = [];
    if (!s) return out;
    for (var i = 0; i < s.uniteler.length; i++) {
      for (var j = 0; j < s.uniteler[i].konular.length; j++) out.push(s.uniteler[i].konular[j]);
    }
    return out;
  }

  function acilisGunu(mufredat, konu) { // konunun acildigi gun (hafta + tampon); null = takvimsiz
    if (!konu.hafta) return null;
    var tampon = (mufredat && mufredat.tampon_hafta != null) ? mufredat.tampon_hafta : TAMPON_VARSAYILAN;
    return gunNo(konu.hafta) + tampon * 7;
  }

  function acikKonular(mufredat, sinif, tarihISO) {
    var hepsi = konular(mufredat, sinif);
    if (String(sinif) === 'Mezun') return hepsi;
    var t = gunNo(tarihISO), out = [];
    for (var i = 0; i < hepsi.length; i++) {
      var a = acilisGunu(mufredat, hepsi[i]);
      if (a === null || a <= t) out.push(hepsi[i]);
    }
    return out;
  }

  // Tek gunun seti (gecmis haric tutma listesi disaridan verilir).
  function setSec(sorular, mufredat, sinif, tarihISO, n, yasak, son) {
    son = son || {};
    var acik = acikKonular(mufredat, sinif, tarihISO);
    var acikId = {}, yeniId = {}, geoId = {}, i;
    var t = gunNo(tarihISO);
    for (i = 0; i < acik.length; i++) {
      acikId[acik[i].id] = true;
      if (acik[i].alan === 'geometri') geoId[acik[i].id] = true;
      var a = acilisGunu(mufredat, acik[i]);
      if (a !== null && a > t - YENI_KONU_GUN && a <= t) yeniId[acik[i].id] = true;
    }
    var havuz = [];
    for (i = 0; i < sorular.length; i++) if (acikId[sorular[i].konu]) havuz.push(sorular[i]);
    var rnd = mulberry32(fnv1a(tarihISO + '|' + sinif));
    var hic = [], eski = [], bayat = [];
    for (i = 0; i < havuz.length; i++) {
      var hq = havuz[i];
      (yasak[hq.id] ? bayat : (son[hq.id] === undefined ? hic : eski)).push(hq);
    }
    hic.sort(idSirala); eski.sort(idSirala); bayat.sort(idSirala);
    karistir(hic, rnd); karistir(eski, rnd); karistir(bayat, rnd);
    eski.sort(function (a, b) { return son[a.id] - son[b.id]; }); // en uzun suredir cikmayan once
    // once hic cikmamis, sonra en eski cikmis, en son (gevsetilirse) son 14 gunde cikanlar
    var L = hic.concat(eski, bayat);

    var secilen = [];
    if (L.length <= n) {
      secilen = L.slice();
      return karistir(secilen, rnd);
    }
    var secildi = {}, konuSay = {}, zorSay = {1: 0, 2: 0, 3: 0}, yeniSay = 0, geoSay = 0;
    function al(q) {
      secildi[q.id] = true; secilen.push(q);
      konuSay[q.konu] = (konuSay[q.konu] || 0) + 1;
      zorSay[q.zorluk]++;
      if (yeniId[q.konu]) yeniSay++;
      if (geoId[q.konu]) geoSay++;
    }
    function sec(uygun, ust, tazeZorunlu) { // L'de sirayla ilk uygun soruyu al
      for (var k = 0; k < L.length; k++) {
        var q = L[k];
        if (secildi[q.id] || (konuSay[q.konu] || 0) >= ust) continue;
        if (tazeZorunlu && yasak[q.id]) continue;
        if (uygun && !uygun(q)) continue;
        al(q); return true;
      }
      return false;
    }
    // 1) en az bir geometri
    if (geoSay === 0 && n >= 1) {
      var gf = function (q) { return geoId[q.konu]; };
      if (!sec(gf, 2, true)) sec(gf, 2, false);
    }
    // 2) n>=5 ise her zorluktan en az bir
    if (n >= 5) {
      for (var z = 1; z <= 3; z++) {
        if (zorSay[z] === 0) {
          var zf = function (q) { return q.zorluk === z; };
          sec(zf, 2, true); // zorluk dengesi icin son 14 gunun sorusu secilmez
        }
      }
    }
    // 3) yeni acilan konulardan en az %40
    var hedef = Math.floor((2 * n + 4) / 5); // ceil(0.4*n)
    while (secilen.length < n && yeniSay < hedef) {
      if (!sec(function (q) { return yeniId[q.konu]; }, 2, true)) break; // kota icin son 14 gunun sorusu secilmez
    }
    // 4) kalan: konu basina en cok 2; yetmezse 3; yetmezse sinirsiz
    // once taze sorular (konu siniri 2 -> 3 -> sinirsiz), yetmezse son 14 gunde cikanlar
    var ustler = [2, 3, 1000];
    for (var tz = 1; tz >= 0; tz--) {
      for (var u = 0; u < ustler.length; u++) {
        while (secilen.length < n && sec(null, ustler[u], tz === 1)) { /* devam */ }
      }
    }
    return karistir(secilen, rnd);
  }

  var onbellek = { sorular: null, mufredat: null, n: null, sinif: null, gunler: {} };

  function gununSeti(sorular, mufredat, sinif, tarihISO, n) {
    sinif = String(sinif);
    var sinifSorular = [], i;
    var kon = {}, kl = konular(mufredat, sinif);
    for (i = 0; i < kl.length; i++) kon[kl[i].id] = true;
    for (i = 0; i < sorular.length; i++) if (kon[sorular[i].konu]) sinifSorular.push(sorular[i]);

    if (onbellek.sorular !== sorular || onbellek.mufredat !== mufredat ||
        onbellek.n !== n || onbellek.sinif !== sinif) {
      onbellek = { sorular: sorular, mufredat: mufredat, n: n, sinif: sinif, gunler: {} };
    }
    var t = gunNo(tarihISO);
    var bas = Math.max(gunNo(DAYANAK), t - ZINCIR_EN_FAZLA);
    var sonuc = [];
    // dayanaktan hedef gune kadar sirayla hesapla (ozyineleme yok; her gun onbellekte)
    for (var g = bas; g <= t; g++) {
      var iso = gunISO(g);
      if (!onbellek.gunler[iso]) {
        var yasak = {}, son = {};
        for (var d = g - bas; d >= 1; d--) {
          var onceki = onbellek.gunler[gunISO(g - d)];
          if (onceki) for (var k = 0; k < onceki.length; k++) {
            son[onceki[k].id] = g - d;
            if (d <= GECMIS_GUN) yasak[onceki[k].id] = true;
          }
        }
        onbellek.gunler[iso] = setSec(sinifSorular, mufredat, sinif, iso, n, yasak, son);
      }
    }
    // dayanaktan once: gecmissiz tek hesap
    if (t < gunNo(DAYANAK)) return setSec(sinifSorular, mufredat, sinif, tarihISO, n, {}).slice();
    return onbellek.gunler[tarihISO].slice();
  }

  // tarihISO'dan ONCEKI gunlerin setlerinde cikmis soru kimlikleri (gununSeti ayni argumanlarla once cagrilmis olmali)
  function gorulmus(tarihISO) {
    var g = {}, t = gunNo(tarihISO);
    for (var iso in onbellek.gunler) if (gunNo(iso) < t) {
      var l = onbellek.gunler[iso];
      for (var i = 0; i < l.length; i++) g[l[i].id] = true;
    }
    return g;
  }

  var API = { acikKonular: acikKonular, gununSeti: gununSeti, gorulmus: gorulmus };
  root.IZINDE_SECIM = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})(typeof window !== 'undefined' ? window : this);
