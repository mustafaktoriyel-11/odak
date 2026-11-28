# MF Odak alarm imzası "π Çanı": π'nin ilk basamakları 3-1-4-1-5 → Do majörde 3., 1., 4., 1., 5. derece (Mi Do Fa Do Sol),
# kule çanı (tubular bells) + ince glokenşpil; ardından kornolar, yaylılar ve timpaniyle kararlı Do majör kapanış.
# Gerçek enstrüman örnekleri: FluidR3_GM (MIT). Çıktı: ses/alarm/pi-cani.m4a (uygulama zili) ve android-ayar/res/raw/mf_alarm.ogg (bildirim sesi).
import subprocess,numpy as np,os
from midiutil import MIDIFile
from scipy.io import wavfile
KOK=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
BPM=120;S=lambda sn:sn*BPM/60   # saniye -> vuruş
m=MIDIFile(6,deinterleave=False)
for t in range(6):m.addTempo(t,0,BPM)
m.addProgramChange(0,0,0,14)   # kule çanı
m.addProgramChange(1,1,0,9)    # glokenşpil
m.addProgramChange(2,2,0,60)   # korno
m.addProgramChange(3,3,0,48)   # yaylılar
m.addProgramChange(4,4,0,47)   # timpani
motif=[(0.00,76),(0.21,72),(0.42,77),(0.63,72),(0.84,79)]   # Mi5 Do5 Fa5 Do5 Sol5  = 3 1 4 1 5
for i,(t,p) in enumerate(motif):
    v=104 if i in (0,4) else 92
    m.addNote(0,0,p,S(t),S(1.6 if i==4 else 0.5),v)
    m.addNote(1,1,p+12,S(t),S(0.3),46)
# kapanış: Do majör (kararlı, akademik tören havası)
K=1.12
m.addNote(0,0,84,S(K),S(1.6),110)                      # Do6 çan
m.addNote(1,1,84+12,S(K),S(0.4),52)
for p,v in [(60,84),(64,78),(67,80),(72,70)]:m.addNote(2,2,p,S(K),S(1.5),v)   # kornolar
for p,v in [(48,80),(55,70),(64,62)]:m.addNote(3,3,p,S(K-0.02),S(1.6),v)     # yaylılar
m.addNote(4,4,36,S(K),S(0.8),112);m.addNote(4,4,43,S(0.84),S(0.3),70)        # timpani: Sol vurgusu + Do
os.makedirs('/tmp/alarm',exist_ok=True)
with open('/tmp/alarm/pi.mid','wb') as f:m.writeFile(f)
subprocess.run(['fluidsynth','-ni','-g','0.7','-r','44100','-F','/tmp/alarm/pi_ham.wav','/usr/share/sounds/sf2/FluidR3_GM.sf2','/tmp/alarm/pi.mid'],check=True,capture_output=True)
sr,a=wavfile.read('/tmp/alarm/pi_ham.wav');a=a.astype(float)
n=int(2.85*sr);a=a[:n] if len(a)>=n else np.pad(a,((0,n-len(a)),(0,0)))
f=int(0.35*sr);a[-f:]*=np.linspace(1,0,f)[:,None]          # son 0,35 sn yumuşak sönüş
a/=np.abs(a).max()/(0.89*32767)                              # tepe -1 dBFS
wavfile.write('/tmp/alarm/pi.wav',sr,a.astype(np.int16))
subprocess.run(['ffmpeg','-v','error','-y','-i','/tmp/alarm/pi.wav','-c:a','aac','-b:a','128k',os.path.join(KOK,'ses/alarm/pi-cani.m4a')],check=True)
os.makedirs(os.path.join(KOK,'android-ayar/res/raw'),exist_ok=True)
subprocess.run(['ffmpeg','-v','error','-y','-i','/tmp/alarm/pi.wav','-c:a','libvorbis','-q:a','5',os.path.join(KOK,'android-ayar/res/raw/mf_alarm.ogg')],check=True)
print('tamam')
