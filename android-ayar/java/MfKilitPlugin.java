package com.mustafaktoriyel.odak;

import android.Manifest;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Build;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import java.io.InputStream;

/**
 * Kilit ekranı ve bildirim alanında canlı sayaç (web'deki mediaSession kartının Android karşılığı).
 * Süre Android'in kendi kronometresiyle akar: uygulama arka planda uyusa da doğru gösterir.
 * Duraklat / Devam et düğmeleri web tarafına "eylem" olayı olarak gider.
 */
@CapacitorPlugin(
    name = "MfKilit",
    permissions = { @Permission(alias = "bildirim", strings = { Manifest.permission.POST_NOTIFICATIONS }) }
)
public class MfKilitPlugin extends Plugin {
    private static final String KANAL = "mf-sayac";
    private static final int NO = 4711;
    private static final String EYLEM = "com.mustafaktoriyel.odak.KILIT_EYLEM";
    private BroadcastReceiver alici;

    @Override
    public void load() {
        Context c = getContext();
        if (Build.VERSION.SDK_INT >= 26) {
            NotificationChannel k = new NotificationChannel(KANAL, "Sayaç", NotificationManager.IMPORTANCE_LOW);
            k.setDescription("Çalışırken kalan süre (kilit ekranı ve bildirim alanı)");
            k.setShowBadge(false);
            k.setSound(null, null);
            k.enableVibration(false);
            k.setLockscreenVisibility(android.app.Notification.VISIBILITY_PUBLIC);
            c.getSystemService(NotificationManager.class).createNotificationChannel(k);
        }
        alici = new BroadcastReceiver() {
            @Override
            public void onReceive(Context ctx, Intent i) {
                JSObject o = new JSObject();
                o.put("eylem", i.getStringExtra("e"));
                notifyListeners("eylem", o, true);
            }
        };
        ContextCompat.registerReceiver(c, alici, new IntentFilter(EYLEM), ContextCompat.RECEIVER_NOT_EXPORTED);
    }

    @Override
    protected void handleOnDestroy() {
        try { getContext().unregisterReceiver(alici); } catch (Exception e) { }
        try { NotificationManagerCompat.from(getContext()).cancel(NO); } catch (Exception e) { }
    }

    private boolean izinVar() {
        return Build.VERSION.SDK_INT < 33 || getPermissionState("bildirim") == PermissionState.GRANTED;
    }

    @PluginMethod
    public void izinIste(PluginCall call) {
        if (izinVar()) { izinCevap(call); return; }
        requestPermissionForAlias("bildirim", call, "izinSonuc");
    }

    @PermissionCallback
    private void izinSonuc(PluginCall call) { izinCevap(call); }

    private void izinCevap(PluginCall call) {
        JSObject r = new JSObject();
        r.put("izin", izinVar() ? "granted" : "denied");
        call.resolve(r);
    }

    private Bitmap resim(String ad) {
        try (InputStream s = getContext().getAssets().open("public/" + ad)) { return BitmapFactory.decodeStream(s); }
        catch (Exception e) { return null; }
    }

    private PendingIntent eylem(String e, int istek) {
        Intent i = new Intent(EYLEM).setPackage(getContext().getPackageName()).putExtra("e", e);
        return PendingIntent.getBroadcast(getContext(), istek, i, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
    }

    /** goster({calisiyor, serbest, zaman (ms: geri sayımda bitiş, serbestte başlangıç), baslik, metin, calis}) */
    @PluginMethod
    public void goster(PluginCall call) {
        if (!izinVar()) { call.resolve(); return; }
        Context c = getContext();
        boolean calisiyor = Boolean.TRUE.equals(call.getBoolean("calisiyor", false));
        boolean serbest = Boolean.TRUE.equals(call.getBoolean("serbest", false));
        boolean calis = Boolean.TRUE.equals(call.getBoolean("calis", true));
        Double zamanD = call.getDouble("zaman");
        long zaman = zamanD == null ? 0 : zamanD.longValue();
        Intent ac = c.getPackageManager().getLaunchIntentForPackage(c.getPackageName());
        PendingIntent acPi = PendingIntent.getActivity(c, 0, ac, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
        int ikon = c.getResources().getIdentifier("mf_bildirim", "drawable", c.getPackageName());
        NotificationCompat.Builder b = new NotificationCompat.Builder(c, KANAL)
            .setSmallIcon(ikon != 0 ? ikon : c.getApplicationInfo().icon)
            .setContentTitle(call.getString("baslik", "MF Odak"))
            .setContentText(call.getString("metin", ""))
            .setContentIntent(acPi)
            .setColor(0xFF1E3BD6)
            .setOnlyAlertOnce(true)
            .setSilent(true)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setCategory(NotificationCompat.CATEGORY_STOPWATCH)
            .setPriority(NotificationCompat.PRIORITY_LOW);
        Bitmap r = resim(!calisiyor ? "kilit-durdu.png" : (calis ? "kilit-calis.png" : "kilit-mola.png"));
        if (r != null) b.setLargeIcon(r);
        if (calisiyor && zaman > 0) {
            b.setOngoing(true).setShowWhen(true).setUsesChronometer(true).setWhen(zaman).setChronometerCountDown(!serbest);
            long kalan = zaman - System.currentTimeMillis();
            // geri sayım bitince bildirim kendiliğinden kalkar (sonraki durumu uygulama yeniden yazar); serbestte en çok 12 saat
            b.setTimeoutAfter(serbest ? 12L * 3600 * 1000 : Math.max(1000, kalan + 1500));
            b.addAction(0, "Duraklat", eylem("duraklat", 1));
        } else {
            b.setOngoing(false).setShowWhen(false);
            b.addAction(0, "Devam et", eylem("devam", 2));
        }
        try { NotificationManagerCompat.from(c).notify(NO, b.build()); } catch (SecurityException e) { }
        call.resolve();
    }

    @PluginMethod
    public void gizle(PluginCall call) {
        NotificationManagerCompat.from(getContext()).cancel(NO);
        call.resolve();
    }
}
