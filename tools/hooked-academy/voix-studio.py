#!/usr/bin/env python3
"""Voix « studio » (calibrée sur ta référence Auphonic) pour les leçons créatives — version 3.
1) recoupe chaque leçon depuis sa source brute (mêmes morceaux, même durée : le calage ne bouge pas),
   avec des fondus enchaînés de 25 ms aux raccords (plus de micro-silence entre deux morceaux),
2) calibre une EQ par source pour retrouver l'équilibre tonal de la version Auphonic,
3) débruitage doux, EQ, de-esser, compression, -16 LUFS / -1,5 dBTP (2 passes),
4) atténue le souffle uniquement dans les vraies pauses (≥ 220 ms au niveau du bruit dans la voix brute),
   avec des rampes de 60 ms : aucun mot n'est jamais coupé.
La v2 utilisait un gate rapide qui fermait entre les syllabes (15 à 30 coupures par minute) : abandonné."""
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
def chain(eq,exc=False):
    e=';'.join(f'entry({c},{v:.2f})' for c,v in zip(CENT,eq))
    return ("highpass=f=80:p=2,afftdn=nr=16:nf=-50:tn=1,"
            + ("aexciter=amount=2.2:drive=8:blend=0:freq=4500:ceil=16000," if exc else "") +
            f"firequalizer=gain_entry='{e}',deesser=i=0.4:m=0.5:f=0.5,"
            "acompressor=threshold=-24dB:ratio=2.6:attack=12:release=220:knee=8:makeup=1.6")
def pauses(raw,proc,out,att_db=-18,min_ms=220,guard_ms=40,ramp_ms=60):
    """Atténue le souffle dans les pauses d'au moins min_ms (niveau du bruit dans la voix brute), jamais dans la parole."""
    r,sr=sf.read(raw); x,_=sf.read(proc)
    l=levels(r); h=480; pz=np.median(l[l<np.percentile(l,20)]); low=l<pz+6
    g=np.ones(len(l)); i=0
    while i<len(l):
        if low[i]:
            j=i
            while j<len(l) and low[j]: j+=1
            if (j-i)*10>=min_ms and j-i>2*guard_ms//10: g[i+guard_ms//10:j-guard_ms//10]=10**(att_db/20)
            i=j
        else: i+=1
    k=max(1,ramp_ms//10); g=np.convolve(np.pad(g,(k,k),mode='edge'),np.ones(k)/k,mode='same')[k:-k]
    gs=np.interp(np.arange(len(x)),(np.arange(len(g))+0.5)*h,g,left=g[0],right=g[-1])
    sf.write(out,(x*gs).astype(np.float32),sr,subtype='PCM_24')
TARGET=prof(*sf.read(PRO))
XF=0.025   # fondu enchaîné aux raccords (s)
def cut(src,keep,out):
    """Morceaux bout à bout en fondu enchaîné ; chaque morceau sauf le dernier est prolongé de XF dans la source,
    donc la durée totale reste exactement celle des morceaux (calage des scènes inchangé)."""
    n=len(keep)
    if n==1:
        a,b=keep[0]; ff('-i',src,'-af',f'atrim={a}:{b},asetpts=PTS-STARTPTS,aresample=48000,pan=mono|c0=c0','-c:a','pcm_f32le',out); return
    parts=[f"[0:a]atrim={a}:{b+(XF if i<n-1 else 0):.4f},asetpts=PTS-STARTPTS,aresample=48000,pan=mono|c0=c0[p{i}]" for i,(a,b) in enumerate(keep)]
    chainx=[]; prev='p0'
    for i in range(1,n):
        nxt=f'x{i}' if i<n-1 else 'o'
        chainx.append(f'[{prev}][p{i}]acrossfade=d={XF}:c1=qsin:c2=qsin[{nxt}]'); prev=nxt
    ff('-i',src,'-filter_complex',';'.join(parts+chainx),'-map','[o]','-c:a','pcm_f32le',out)
def calibrate(wav,exc):
    eq=np.zeros(len(CENT))
    for it in range(6):
        ff('-i',wav,'-af',chain(eq,exc),'-c:a','pcm_f32le','cal.wav')
        cur=prof(*sf.read('cal.wav')); err=TARGET-cur; err[cur<-60]=0   # pas d'EQ là où la source n'a rien
        eq=np.clip(eq+0.8*err,-20,18)
    sm=eq.copy(); sm[1:-1]=0.25*eq[:-2]+0.5*eq[1:-1]+0.25*eq[2:]          # courbe lissée : pas d'ondulations
    eq=np.clip(sm,-16,16); eq[np.array(CENT)>8000]=np.minimum(eq[np.array(CENT)>8000],6)
    ff('-i',wav,'-af',chain(eq,exc),'-c:a','pcm_f32le','cal.wav'); cur=prof(*sf.read('cal.wav')); err=TARGET-cur
    m=cur>=-60; return eq,float(np.sqrt((err[m]**2).mean()))
def process(wav,eq,exc,out):
    m=subprocess.run(['ffmpeg','-nostdin','-v','info','-y','-i',wav,'-af',chain(eq,exc)+',loudnorm=I=-16:TP=-1.5:LRA=9:print_format=json','-f','null','-'],capture_output=True,text=True).stderr
    j=json.loads(m[m.rindex('{'):m.rindex('}')+1])
    ln=f"loudnorm=I=-16:TP=-1.5:LRA=9:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true"
    ff('-i',wav,'-af',chain(eq,exc)+','+ln+',alimiter=limit=0.84:level=false,aresample=48000','-ac','1','-c:a','pcm_f32le','proc.wav')
    pauses(wav,'proc.wav',out)
if __name__=='__main__':
    os.makedirs('cut',exist_ok=True); os.makedirs('out',exist_ok=True); os.chdir(f'{S}/vox')
    ids=sys.argv[1:] or sorted(os.path.basename(p)[:-5] for p in glob.glob(f'{S}/edit/*.json'))
    groups={}
    for i in ids:
        j=json.load(open(f'{S}/edit/{i}.json')); cut(f'{S}/{j["src"]}',j['keep'],f'cut/{i}.wav'); groups.setdefault(j['src'],[]).append(i)
    report={}
    for src,lst in groups.items():
        xs=[sf.read(f'cut/{i}.wav')[0] for i in lst]; x=np.concatenate(xs)[:48000*150]; sf.write('calsrc.wav',x,48000,subtype='FLOAT')
        sp=prof(x,48000); exc=bool(sp[-3]<-45)   # source sans aigus (codec) : on recrée un peu d'air
        eq,rms=calibrate('calsrc.wav',exc)
        print(f'{src}: {len(lst)} leçons, exciter {exc}, écart EQ {rms:.2f} dB', flush=True)
        for i in lst:
            process(f'cut/{i}.wav',eq,exc,f'out/{i}.wav'); report[i]={'src':src,'eq':[round(float(v),2) for v in eq],'exciter':exc}
            print('  ✓',i,flush=True)
    json.dump(report,open('report.json','w'),indent=1)
