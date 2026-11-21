package com.mustafaktoriyel.odak;

import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import com.getcapacitor.BridgeActivity;

// Web görünümü durum çubuğu, görev çubuğu ve klavyenin arasında kalır (Chrome'daki PWA gibi)
public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(MfKilitPlugin.class);   // kilit ekranı / bildirim alanı sayacı
        super.onCreate(savedInstanceState);
        View web = getBridge().getWebView();
        View kap = (View) web.getParent();
        kap.setBackgroundColor(Color.parseColor("#141B3F"));
        ViewCompat.setOnApplyWindowInsetsListener(kap, (v, ins) -> {
            Insets i = ins.getInsets(WindowInsetsCompat.Type.systemBars()
                    | WindowInsetsCompat.Type.displayCutout()
                    | WindowInsetsCompat.Type.ime());
            v.setPadding(i.left, i.top, i.right, i.bottom);
            return WindowInsetsCompat.CONSUMED;
        });
        ViewCompat.requestApplyInsets(kap);
    }
}
