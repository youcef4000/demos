#!/usr/bin/env python3
"""Voix off des leçons animées : la voix clonée du formateur, calée scène par scène sur l'animation.

    python3 tools/hooked-academy/voix-off.py [--jeune] <job.json> [<job.json> ...]

job.json, une voix générée par scène (recommandé : coupes exactes) :
    { "id": "ia1-l1", "scenes": [ { "type": "title", "audio": "/chemin/scene-1.mp3" }, ... ] }
ou une seule piste pour toute la leçon, découpée aux pauses les plus proches des fins de scène
attendues (au prorata du texte) :
    { "id": "ia1-l1", "audio": "/chemin/piste.mp3", "scenes": [ { "type": "title", "text": "…" }, ... ] }

Chaque scène dure au moins sa durée d'animation de base ; la voix est finie au niveau des leçons
enregistrées (-16 LUFS, -1.5 dBTP) et enregistrée dans video/voix/<id>.m4a. Les durées des scènes
vont dans data/voix-off.js, que programme.js applique : le lecteur passe en mode « la vidéo suit la
voix ». --jeune rend la voix un peu plus jeune (+1 demi-ton, formants gardés, débit +4 %).
Prérequis : ffmpeg (avec rubberband pour --jeune), numpy.
"""
import json
import subprocess
import sys
from pathlib import Path

import numpy as np

SITE = Path(__file__).resolve().parents[2] / 'sites/hooked-academy'
DATA = SITE / 'data/voix-off.js'
SR = 48000
# Durée minimale d'animation par type de scène (motion/engine.js, BASE)
BASE = {
    'title': 4.2, 'big': 4.6, 'quote': 5, 'stat': 4.6, 'cards': 6, 'grid': 6, 'steps': 7, 'checklist': 6.5, 'compare': 7,
    'formula': 6, 'flow': 7, 'funnel': 6, 'curve': 7, 'timeline': 8, 'prompt': 9, 'chat': 8, 'wave': 6, 'storyboard': 8,
    'camera': 10, 'ratio': 8, 'layers': 8, 'scan': 9, 'price': 7, 'phone': 7, 'anatomy': 10, 'acronym': 8, 'table': 9,
    'hooks': 8, 'outro': 4.2,
}
LEAD = 0.35   # souffle avant la première phrase de chaque scène
TAIL = 0.45   # respiration après la dernière phrase
JEUNE = 'rubberband=pitch=1.06:tempo=1.04:formant=preserved:pitchq=quality,equalizer=f=200:t=q:w=1:g=-1.5,equalizer=f=5000:t=h:w=3000:g=2,'
CHAIN = ('highpass=f=75,equalizer=f=250:t=q:w=1.2:g=-2,equalizer=f=3200:t=q:w=1.0:g=2,'
         'acompressor=threshold=-21dB:ratio=2.8:attack=6:release=90:makeup=2,deesser=i=0.35:m=0.5:f=0.5')


def load(path, pre=''):
    cmd = ['ffmpeg', '-nostdin', '-v', 'error', '-i', str(path)] + (['-af', pre.rstrip(',')] if pre else []) + \
          ['-ac', '1', '-ar', str(SR), '-f', 'f32le', '-']
    return np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, np.float32).copy()


def levels(x, win=0.02):
    n = int(SR * win)
    frames = x[: len(x) // n * n].reshape(-1, n)
    return 20 * np.log10(np.sqrt((frames ** 2).mean(1)) + 1e-9), win


def silences(x, floor_db=-38, min_len=0.16):
    """Plages de silence [(début, fin)] en secondes."""
    db, win = levels(x)
    quiet = db < max(floor_db, np.percentile(db, 95) - 34)
    out, start = [], None
    for i, q in enumerate(quiet):
        if q and start is None:
            start = i
        if not q and start is not None:
            if (i - start) * win >= min_len:
                out.append((start * win, i * win))
            start = None
    if start is not None:
        out.append((start * win, len(quiet) * win))
    return out


def trim(x):
    """Coupe le silence avant et après la parole d'un extrait."""
    db, win = levels(x)
    voiced = np.where(db > max(-45, np.percentile(db, 95) - 36))[0]
    if not len(voiced):
        return x
    a = max(0, int((voiced[0] * win - 0.05) * SR))
    b = min(len(x), int(((voiced[-1] + 1) * win + 0.12) * SR))
    return x[a:b]


def split(x, texts):
    """Une piste pour toute la leçon -> un extrait par scène, coupé dans la pause la plus probable."""
    sil = silences(x)
    dur = len(x) / SR
    head = sil[0][1] if sil and sil[0][0] < 0.05 else 0.0
    tail = sil[-1][0] if sil and sil[-1][1] > dur - 0.05 else dur
    weights = np.array([max(1, len(t)) for t in texts], float)
    expect = head + np.cumsum(weights)[:-1] / weights.sum() * (tail - head)
    inner = [s for s in sil if s[0] > head + 0.2 and s[1] < tail - 0.2]
    cuts, prev = [], head
    for k, e in enumerate(expect):
        span = max(2.5, 0.12 * (tail - head))
        cand = [s for s in inner if (s[0] + s[1]) / 2 > prev + 0.6 and abs((s[0] + s[1]) / 2 - e) < span]
        if not cand:
            raise SystemExit(f'pas de pause trouvée près de {e:.1f} s (scène {k + 1}) : générer scène par scène')
        best = min(cand, key=lambda s: abs((s[0] + s[1]) / 2 - e) - 1.5 * (s[1] - s[0]))
        cuts.append(best)
        prev = (best[0] + best[1]) / 2
    bounds = list(zip([head] + [c[1] for c in cuts], [c[0] for c in cuts] + [tail]))
    return [x[max(0, int((a - 0.06) * SR)): int((b + 0.12) * SR)] for a, b in bounds]


def build(job, pre):
    scenes = job['scenes']
    if all('audio' in s for s in scenes):
        clips = [trim(load(s['audio'], pre)) for s in scenes]
    else:
        clips = split(load(job['audio'], pre), [s['text'] for s in scenes])
    parts, ds = [], []
    for sc, seg in zip(scenes, clips):
        seg = seg.copy()
        fade = int(0.012 * SR)
        seg[:fade] *= np.linspace(0, 1, fade)
        seg[-fade:] *= np.linspace(1, 0, fade)
        d = round(max(LEAD + len(seg) / SR + TAIL, BASE.get(sc['type'], 5)), 2)
        pad = np.zeros(int(round(d * SR)), np.float32)
        lead = int(LEAD * SR)
        pad[lead: lead + len(seg)] = seg[: len(pad) - lead]
        parts.append(pad)
        ds.append(d)
    out = SITE / f"video/voix/{job['id']}.m4a"
    out.parent.mkdir(parents=True, exist_ok=True)
    raw = np.concatenate(parts).astype(np.float32).tobytes()
    src = ['ffmpeg', '-nostdin', '-hide_banner', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-']
    meas = subprocess.run(src + ['-af', f'{CHAIN},loudnorm=I=-16:TP=-1.5:LRA=7:print_format=json', '-f', 'null', '-'],
                          input=raw, capture_output=True).stderr.decode()
    m = json.loads(meas[meas.rindex('{'):meas.rindex('}') + 1])
    ln = (f"loudnorm=I=-16:TP=-1.5:LRA=7:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
          f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
    subprocess.run(src[:2] + ['-v', 'error', '-y'] + src[3:] + ['-af', f'{CHAIN},{ln},aresample={SR}', '-c:a', 'aac',
                   '-b:a', '128k', '-movflags', '+faststart', str(out)], input=raw, check=True)
    return {'audio': f"video/voix/{job['id']}.m4a", 'd': ds}


def save(entries):
    cur = {}
    if DATA.exists():
        txt = DATA.read_text(encoding='utf-8')
        cur = json.loads(txt[txt.index('{'): txt.rindex('}') + 1])
    cur.update(entries)
    body = ',\n'.join(f'  {json.dumps(k)}: {json.dumps(v, ensure_ascii=False)}' for k, v in sorted(cur.items()))
    DATA.write_text(
        '// Voix off des leçons animées (voix clonée du formateur, en darija) : piste et durée de chaque scène.\n'
        '// Généré par tools/hooked-academy/voix-off.py — ne pas modifier à la main.\n'
        f'export const VOIX = {{\n{body}\n}};\n', encoding='utf-8')


if __name__ == '__main__':
    args = sys.argv[1:]
    pre = JEUNE if '--jeune' in args else ''
    done = {}
    for f in [a for a in args if not a.startswith('--')]:
        job = json.loads(Path(f).read_text(encoding='utf-8'))
        done[job['id']] = build(job, pre)
        print(f"{job['id']} : {len(job['scenes'])} scènes, {sum(done[job['id']]['d']):.1f} s")
    if done:
        save(done)
