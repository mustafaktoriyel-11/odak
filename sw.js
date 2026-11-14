// MustaFaktoriyel Odak - service worker
var SURUM = 'mf-odak-v95';
var DOSYALAR = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(SURUM).then(function (c) { return c.addAll(DOSYALAR); }));
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== SURUM && k !== 'mf-ozet'; }).map(function (k) { return caches.delete(k); }));
  }));
  self.clients.claim();
});

// Uygulama dosyalari: once agdan dene (guncel kalsin), olmazsa onbellekten ver
self.addEventListener('fetch', function (e) {
  var u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then(function (r) {
      var kopya = r.clone();
      caches.open(SURUM).then(function (c) { c.put(e.request, kopya); });
      return r;
    }).catch(function () {
      return caches.match(e.request).then(function (r) { return r || caches.match('./index.html'); });
    })
  );
});

self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window' }).then(function (cs) {
    for (var i = 0; i < cs.length; i++) { if ('focus' in cs[i]) return cs[i].focus(); }
    if (self.clients.openWindow) return self.clients.openWindow('./');
  }));
});

// ---- MF Odak bildirim mesajları (push) ----
function mfMesaj(tur, oz, simdi) {
  var GUN = 86400000;
  function anh(d) { return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  var nw = new Date(simdi);
  var bK = anh(nw), dK = anh(new Date(nw.getFullYear(), nw.getMonth(), nw.getDate() - 1));
  var n = Math.floor(simdi / GUN);
  function sec(a) { return a[n % a.length]; }
  function dkS(x) {
    x = Math.round(x);
    if (x < 60) return x + ' dk';
    var h = Math.floor(x / 60), m = x % 60;
    return h + ' sa' + (m ? ' ' + m + ' dk' : '');
  }
  function kes(s) { return s.length > 110 ? s.slice(0, 109) + '…' : s; }
  var bugun = 0, dun = 0, seri = 0, hedef = 0, h7 = 0, h7o = 0, aktif = 0, enCok = '', koc = false, eski = false;
  if (oz) {
    koc = !!oz.koc; hedef = oz.hedef || 0; enCok = oz.enCok || '';
    if (oz.gun === bK) { bugun = oz.bugun || 0; dun = oz.dun || 0; seri = oz.seri || 0; }
    else if (oz.gun === dK) { bugun = 0; dun = oz.bugun || 0; seri = oz.seri || 0; }
    if (oz.gun === bK || oz.gun === dK) { h7 = oz.h7 || 0; h7o = oz.h7o || 0; aktif = oz.aktif || 0; }
    if (oz.gun !== bK) hedef = 0;
    if (oz.t && simdi - oz.t > 10 * GUN) eski = true;
  }
  var R;
  if (eski && (tur === 'gun' || tur === 'aksam')) {
    R = { title: 'Seni özledik', body: sec(koc ?
      ['Koçun seni bekliyor. Bugün tek bir pomodoro ile geri dön, 25 dk yeter.', 'Bir süredir görüşemedik. Koçun için küçük bir kayıt düşelim mi?'] :
      ['Uzun zamandır uğramadın. Tek bir pomodoro ile geri dön, 25 dk yeter.', 'Bir süredir görüşemedik. Küçük bir başlangıç yapalım mı?']) };
    return { title: R.title, body: kes(R.body) };
  }
  var fark = bugun - dun, farkS = (fark >= 0 ? '+' : '-') + Math.abs(Math.round(fark)) + ' dk';
  var bitti = hedef > 0 ? bugun >= hedef : bugun >= 90;
  if (tur === 'hafta') {
    if (!h7) {
      R = { title: 'Yeni hafta, yeni başlangıç', body: sec(koc ?
        ['Bu hafta kayıt yok. Yeni hafta yeni başlangıç; koçun ilk kaydını bekliyor.', 'Geçen hafta sessizdi. Pazartesi bir pomodoro ile başlayalım.'] :
        ['Bu hafta kayıt yok. Yeni hafta yeni başlangıç, pazartesi bir pomodoro?', 'Geçen hafta sessizdi. Yeni haftada 25 dk ile başlayalım.']) };
    } else {
      var yuz = '';
      if (h7o > 0) { var y = Math.round((h7 - h7o) * 100 / h7o); yuz = y === 0 ? ' Geçen haftayla aynı.' : ' Geçen haftaya göre %' + Math.abs(y) + (y > 0 ? ' artış.' : ' düşüş.'); }
      var en = enCok ? ' En çok: ' + enCok + '.' : '';
      var ana = 'Bu hafta ' + dkS(h7) + ' çalıştın.' + yuz + ' ' + aktif + ' gün aktif.' + en;
      var bas = sec(['Haftalık özet', 'Haftanın özeti', 'Hafta kapandı']);
      if (koc) ana = 'Koçun haftanı görecek. ' + dkS(h7) + ', ' + aktif + ' gün aktif.' + yuz + en;
      R = { title: bas, body: ana };
    }
    return { title: R.title, body: kes(R.body) };
  }
  if (tur === 'aksam') {
    if (bugun === 0) {
      if (seri >= 2) {
        R = { title: 'Serin bozulmak üzere', body: sec(koc ?
          [seri + ' günlük serin bozulmak üzere. Koçun bugünü görecek; 25 dk yeter.', seri + ' günlük serin bozulmak üzere. Uyumadan bir pomodoro?'] :
          [seri + ' günlük serin bozulmak üzere. Uyumadan bir pomodoro yeter.', seri + ' günlük serin bozulmak üzere. 25 dk ile kurtar.']) };
      } else {
        R = { title: 'Bugün kayıt yok', body: sec(koc ?
          ['Koçun bugünkü kaydını görecek. Uyumadan 25 dk yeter.', 'Bugün boş kaldı. Koçun için tek pomodoro yeter.'] :
          ['Uyumadan 25 dk yeter. Bir pomodoro, gün boş kalmasın.', 'Bugün henüz kayıt yok. 25 dk ile günü kurtarabilirsin.']) };
      }
    } else if (hedef > 0 && bugun < hedef / 2) {
      R = { title: 'Bugün hedefin yarısı', body: sec(koc ?
        [dkS(bugun) + ' / ' + dkS(hedef) + '. Koçun görecek; yarın telafi ederiz.', dkS(bugun) + ' yaptın, hedef ' + dkS(hedef) + '. Yarın telafi, küçük başla.'] :
        [dkS(bugun) + ' / ' + dkS(hedef) + '. Sorun değil, yarın telafi ederiz.', dkS(bugun) + ' yaptın, hedef ' + dkS(hedef) + '. Yarın biraz öne alalım.']) };
    } else if (bitti) {
      var fs = dun > 0 ? ' Dünden ' + farkS + '.' : ' Yarın da böyle devam.';
      R = { title: 'Günü ' + dkS(bugun) + ' ile kapattın', body: sec(koc ?
        ['Koçun bugünkü kaydını görecek, güzel iş.' + fs, 'Güzel gün. Koçun kaydı gördü.' + fs] :
        ['Güzel gün, bravo.' + fs, 'Günü sağlam kapattın.' + fs]) };
    } else {
      R = { title: dkS(bugun) + ' yaptın bugün', body: sec(koc ?
        ['Koçun kaydı görecek. Uyumadan bir pomodoro daha olur mu?', 'Fena değil. Koçun için bir tur daha?'] :
        ['Fena değil. Uyumadan bir pomodoro daha olur mu?', 'İyi gidiyorsun. Gece kapanmadan bir tur daha?']) };
    }
    return { title: R.title, body: kes(R.body) };
  }
  // gün içi
  if (bugun === 0) {
    R = { title: 'Bugün henüz 0 dk', body: sec(koc ?
      ['Koçun bugünkü kaydını görecek. Tek pomodoro ile başla, 25 dk yeter.', 'Henüz başlamadın. Koçun için tek bir pomodoro?'] :
      ['Henüz başlamadın. Tek bir pomodoro ile açalım mı, 25 dk?', 'Bugün sıfır. Bir pomodoro ile günü aç, gerisi gelir.']) };
  } else if (hedef > 0 && bugun < hedef) {
    var kal = hedef - bugun;
    R = { title: dkS(bugun) + ' tamam', body: sec(koc ?
      [dkS(bugun) + ' yaptın, hedef ' + dkS(hedef) + ', ' + dkS(kal) + ' kaldı. Koçun akşam bakacak.', dkS(bugun) + ' / ' + dkS(hedef) + '. Koçun görecek, ' + dkS(kal) + ' kaldı.'] :
      [dkS(bugun) + ' yaptın, hedef ' + dkS(hedef) + ', ' + dkS(kal) + ' kaldı.', dkS(bugun) + ' / ' + dkS(hedef) + '. ' + dkS(kal) + ' kaldı, gidiyorsun.']) };
  } else if (hedef > 0) {
    R = { title: 'Hedef tamam 🎯', body: sec(koc ?
      [dkS(bugun) + ' yaptın, hedefi geçtin. Koçun bunu görecek.', 'Bugünkü hedef bitti, ' + dkS(bugun) + '. Koçun mutlu olacak.'] :
      [dkS(bugun) + ' yaptın, bugünkü hedef tamam. Eline sağlık.', 'Hedefi bitirdin: ' + dkS(bugun) + '. Gerisi bonus.']) };
  } else if (bugun >= 90) {
    R = { title: 'Güzel tempo', body: sec(koc ?
      [dkS(bugun) + ' çalıştın. Koçun bu tempoyu görecek.', 'Bugün ' + dkS(bugun) + ' oldu bile. Koçun görecek.'] :
      [dkS(bugun) + ' çalıştın, güzel tempo. Böyle devam.', 'Bugün ' + dkS(bugun) + ' oldu bile. Güzel gidiyor.']) };
  } else {
    R = { title: dkS(bugun) + ', akşama biraz daha', body: sec(koc ?
      [dkS(bugun) + ' yaptın. Koçun akşam kaydına bakacak, biraz daha?', dkS(bugun) + ' tamam. Akşama kadar bir tur daha olur.'] :
      [dkS(bugun) + ' yaptın. Akşama kadar biraz daha olur mu?', dkS(bugun) + ' tamam. Bir pomodoro daha eklemek ister misin?']) };
  }
  return { title: R.title, body: kes(R.body) };
}

self.addEventListener('push', function (e) {
  var p = {}; try { p = e.data ? e.data.json() : {}; } catch (x) {}
  var d = p.data || p; var tur = d.tur || 'gun';
  if (tur === 'koc') {
    e.waitUntil(self.registration.showNotification('Koçundan mesaj', {
      body: String(d.metin || 'Yeni bir mesajın var.').slice(0, 300), icon: './icon-192.png', badge: './icon-192.png',
      tag: 'mf-koc-' + (d.id || ''), renotify: true, requireInteraction: true, data: { url: './' }
    }));
    return;
  }
  function goster(m) {
    return self.registration.showNotification(m.title, {
      body: m.body, icon: './icon-192.png', badge: './icon-192.png',
      tag: 'mf-' + tur, renotify: true, data: { url: './' }
    });
  }
  e.waitUntil(
    caches.open('mf-ozet').then(function (c) { return c.match('./__ozet'); })
      .then(function (r) { return r ? r.json() : null; })
      .then(function (oz) { return goster(mfMesaj(tur, oz, Date.now())); })
      .catch(function () { return goster({ title: 'MF Odak', body: 'Bugünkü çalışmana bir göz atalım mı?' }); })
  );
});
