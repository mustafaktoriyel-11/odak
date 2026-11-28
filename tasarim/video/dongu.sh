#!/bin/bash
# Durak videosu → dikişsiz döngü (sesiz, 720x1280, 24 fps, H.264, faststart).
# Kullanım: bash tasarim/video/dongu.sh KAYNAK.mp4 d14   → vid/durak/d14.mp4
# Yöntem: videonun sonundaki T saniye, başındaki T saniyeyle çapraz geçer; çıktı [T, D] aralığıdır,
# böylece son kare tam başa bağlanır (kesik görünmez). Süre D−T (8 sn kaynak → ~6,5 sn).
set -e
S="$1"; ID="$2"; T="${3:-1.5}"
D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$S")
D=$(python3 -c "print(round($D-0.05,3))")
O=$(python3 -c "print(round($D-$T,3))")
cd "$(dirname "$0")/../.."
ffmpeg -loglevel error -y -i "$S" -i "$S" -filter_complex \
 "[0:v]trim=0:$D,setpts=PTS-STARTPTS,fps=24,scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280,format=yuv420p[a];\
  [1:v]trim=0:$T,setpts=PTS-STARTPTS,fps=24,scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280,format=yuv420p[b];\
  [a][b]xfade=transition=fade:duration=$T:offset=$O[x];[x]trim=$T:$D,setpts=PTS-STARTPTS,format=yuv420p[o]" \
 -map "[o]" -an -c:v libx264 -preset slow -crf 27 -profile:v high -pix_fmt yuv420p -movflags +faststart "vid/durak/$ID.mp4"
ffprobe -v error -show_entries format=duration,size -of csv=p=0 "vid/durak/$ID.mp4"
