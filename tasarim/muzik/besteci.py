# Özgün kısa döngü besteleri (MIDI -> FluidR3_GM, MIT lisanslı soundfont)
import sys,random,subprocess,numpy as np
from midiutil import MIDIFile
from scipy.io import wavfile
def yap(ad,bpm,olcu,kur,sf='/usr/share/sounds/sf2/FluidR3_GM.sf2'):
    m=MIDIFile(6,deinterleave=False);[m.addTempo(t,0,bpm) for t in range(6)]
    kur(m);open(ad+'.mid','wb').write(m.writeFile.__self__ and b'' or b'') if False else None
    with open(ad+'.mid','wb') as f:m.writeFile(f)
    subprocess.run(['fluidsynth','-ni','-g','0.6','-r','44100','-F',ad+'_ham.wav',sf,ad+'.mid'],check=True,capture_output=True)
    sr,a=wavfile.read(ad+'_ham.wav');a=a.astype(float)
    n=int(round(olcu*4*60/bpm*sr));tail=a[n:]
    lp=a[:n].copy();k=min(len(tail),n);lp[:k]+=tail[:k]   # kuyruğu başa sar: dikişsiz döngü
    lp/=np.abs(lp).max()/ (0.5*32767)
    wavfile.write(ad+'.wav',sr,lp.astype(np.int16))
    subprocess.run(['ffmpeg','-v','error','-y','-i',ad+'.wav','-c:a','libopus','-b:a','56k',ad+'.ogg'],check=True)
    subprocess.run(['ffmpeg','-v','error','-y','-i',ad+'.wav','-c:a','aac','-b:a','80k',ad+'.m4a'],check=True)
