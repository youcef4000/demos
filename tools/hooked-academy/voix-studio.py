#!/usr/bin/env python3
"""Voix « studio » (calibrée sur ta référence Auphonic) pour les leçons créatives.
1) recoupe chaque leçon depuis sa source brute (mêmes morceaux qu'avant : durée et calage inchangés),
2) calibre une EQ par source pour retrouver l'équilibre tonal de la version Auphonic,
3) débruitage, gate dans les silences, EQ, de-esser, compression, -16 LUFS / -1,5 dBTP (2 passes)."""
import json, subprocess, glob, os, sys, numpy as np, soundfile as sf
S=os.environ.get('VOIX_DIR', '.')   # dossier de travail : raw/, edit/<leçon>.json, vox/ref/<référence Auphonic>.wav
PRO=f'{S}/vox/ref/66eb3e78-Voix_260823_201726.wav'
B=[60,100,150,200,300,400,600,800,1000,1500,2000,3000,4000,5000,6000,8000,10000,12000,16000]
CENT=[int(np.sqrt(a*b)) for a,b in zip(B[:-1],B[1:])]
def ff(*a): r=subprocess.run(['ffmpeg','-nostdin','-v','error','-y',*a],capture_output=True,text=True); assert r.returncode==0, r.stderr; return r
def prof(x,sr):
    N=2048;hop=1024;w=np.hanning(N);fr=[]
    for i in range(0,len(x)-N,hop):
        f=x[i:i+N];fr.append((np.sqrt((f**2).mean()),np.abs(np.fft.rfft(f*w))**2))
    es=np.array([e for e,_ in fr]);th=np.percentile(es,60)
    sp=np.mean([s for e,s in fr if e>=th],0);fq=np.fft.rfftfreq(N,1/sr)
    b=lambda a,c:10*np.log10(sp[(fq>=a)&(fq<c)].mean()+1e-20)
    r1=b(800,1200);return np.array([b(a,c)-r1 for a,c in zip(B[:-1],B[1:])])
def levels(x):
    n=len(x)//480; return 20*np.log10(np.sqrt((x[:n*480].reshape(n,480)**2).mean(1))+1e-9)
def chain(eq,thr,exc=False):
    e=';'.join(f'entry({c},{v:.2f})' for c,v in zip(CENT,eq))
    return (f"highpass=f=80:p=2,afftdn=nr=20:nf=-48:tn=1,agate=threshold={thr:.4f}:ratio=5:range=0.005:attack=1.5:release=60:knee=2,"
            + ("aexciter=amount=2.2:drive=8:blend=0:freq=4500:ceil=16000," if exc else "") +
            f"firequalizer=gain_entry='{e}',deesser=i=0.45:m=0.5:f=0.5,"
            "acompressor=threshold=-26dB:ratio=3.2:attack=6:release=150:knee=6:makeup=2")
TARGET=prof(*sf.read(PRO))
def cut(src,keep,out):
    parts=[f"[0:a]atrim={a}:{b},asetpts=PTS-STARTPTS,afade=t=in:d=0.012,afade=t=out:st={max(0,b-a-0.012):.3f}:d=0.012[p{i}]" for i,(a,b) in enumerate(keep)]
    ff('-i',src,'-filter_complex',';'.join(parts)+';'+''.join(f'[p{i}]' for i in range(len(keep)))+f'concat=n={len(keep)}:v=0:a=1,aresample=48000,pan=mono|c0=c0[o]','-map','[o]','-c:a','pcm_f32le',out)
def calibrate(wav,thr,exc):
    eq=np.zeros(len(CENT))
    for it in range(6):
        ff('-i',wav,'-af',chain(eq,thr,exc),'-c:a','pcm_f32le','cal.wav')
        cur=prof(*sf.read('cal.wav')); err=TARGET-cur; err[cur<-60]=0   # pas d'EQ là où la source n'a rien
        eq=np.clip(eq+0.8*err,-20,18)
    sm=eq.copy(); sm[1:-1]=0.25*eq[:-2]+0.5*eq[1:-1]+0.25*eq[2:]          # courbe lissée : pas d'ondulations
    eq=np.clip(sm,-16,16); eq[np.array(CENT)>8000]=np.minimum(eq[np.array(CENT)>8000],6)
    ff('-i',wav,'-af',chain(eq,thr,exc),'-c:a','pcm_f32le','cal.wav'); cur=prof(*sf.read('cal.wav')); err=TARGET-cur
    m=cur>=-60; return eq,float(np.sqrt((err[m]**2).mean()))
def process(wav,eq,thr,exc,out):
    m=subprocess.run(['ffmpeg','-nostdin','-v','info','-y','-i',wav,'-af',chain(eq,thr,exc)+',loudnorm=I=-16:TP=-1.5:LRA=7:print_format=json','-f','null','-'],capture_output=True,text=True).stderr
    j=json.loads(m[m.rindex('{'):m.rindex('}')+1])
    ln=f"loudnorm=I=-16:TP=-1.5:LRA=7:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true"
    ff('-i',wav,'-af',chain(eq,thr,exc)+','+ln+',alimiter=limit=0.84:level=false,aresample=48000','-ac','1','-c:a','pcm_s24le',out)
if __name__=='__main__':
    os.makedirs('cut',exist_ok=True); os.makedirs('out',exist_ok=True); os.chdir(f'{S}/vox')
    ids=sys.argv[1:] or sorted(os.path.basename(p)[:-5] for p in glob.glob(f'{S}/edit/*.json'))
    groups={}
    for i in ids:
        j=json.load(open(f'{S}/edit/{i}.json')); cut(f'{S}/{j["src"]}',j['keep'],f'cut/{i}.wav'); groups.setdefault(j['src'],[]).append(i)
    report={}
    for src,lst in groups.items():
        xs=[sf.read(f'cut/{i}.wav')[0] for i in lst]; x=np.concatenate(xs)[:48000*150]; sf.write('calsrc.wav',x,48000,subtype='FLOAT')
        lv=levels(x); speech=np.percentile(lv,70); thr=10**((speech-12)/20)   # gate ~12 dB sous la parole (rapide : n'agit qu'entre les mots)
        sp=prof(x,48000); exc=bool(sp[-3]<-45)   # source sans aigus (codec) : on recrée un peu d'air
        eq,rms=calibrate('calsrc.wav',thr,exc)
        print(f'{src}: {len(lst)} leçons, gate {20*np.log10(thr):.1f} dBFS, exciter {exc}, écart EQ {rms:.2f} dB', flush=True)
        for i in lst:
            c=levels(sf.read(f'cut/{i}.wav')[0]); q=c<np.percentile(c,20); pz=np.median(c[q]); spk=np.median(c[~q])
            ti=10**((pz+0.65*(spk-pz))/20)   # gate de la leçon : entre ses pauses et sa parole
            process(f'cut/{i}.wav',eq,ti,exc,f'out/{i}.wav'); report[i]={'src':src,'eq':[round(float(v),2) for v in eq],'gate_db':round(20*np.log10(ti),1)}
            print('  ✓',i,flush=True)
    json.dump(report,open('report.json','w'),indent=1)
