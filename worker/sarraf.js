// Sarraf — carnet vocal du cambiste : le seul code serveur de l'application (sites/sarraf/).
// Rien n'est enregistré ici : le mémo arrive, est transcrit (ElevenLabs), décortiqué (Claude), et repart.
// Les mémos, fiches et soldes restent dans le téléphone (IndexedDB).
//
//   GET  /sarraf/api/etat     → ce qui est configuré (clés présentes, modèle)
//   POST /sarraf/api/analyse  → multipart : audio (fichier) ou texte, date (ISO), contacts (JSON)
//
// Secrets du Worker (Cloudflare → Worker demos → Settings → Variables and Secrets) :
//   SARRAF_CODE          code d'accès saisi une fois dans l'application (obligatoire)
//   ELEVENLABS_API_KEY   transcription des mémos vocaux (darija, français, arabe)
//   ANTHROPIC_API_KEY    lecture du mémo : sommes, taux, contacts, reste à régler
//   SARRAF_MODELE        facultatif, modèle Claude (claude-opus-5-5 par défaut)

const ORIGINES = ['https://demos.bornzstudio.com', 'https://youcef4000.github.io'];
const MODELE = 'claude-opus-5-5';
const AUDIO_MAX = 25 * 1024 * 1024;
const TEXTE_MAX = 8000;

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

/** Comparaison en temps constant des empreintes : la durée ne dit rien du code tapé. */
async function memeCode(a, b) {
  const enc = new TextEncoder();
  const [x, y] = await Promise.all([a, b].map((s) => crypto.subtle.digest('SHA-256', enc.encode(s))));
  const u = new Uint8Array(x);
  const v = new Uint8Array(y);
  let diff = 0;
  for (let i = 0; i < u.length; i++) diff |= u[i] ^ v[i];
  return diff === 0;
}

export async function sarraf(request, env) {
  const url = new URL(request.url);
  const origin = request.headers.get('origin');
  const cors = origin && origin !== url.origin && ORIGINES.includes(origin);
  if (request.method === 'OPTIONS') {
    if (!cors) return new Response(null, { status: 403 });
    return new Response(null, {
      status: 204,
      headers: {
        'access-control-allow-origin': origin,
        'access-control-allow-methods': 'GET, POST',
        'access-control-allow-headers': 'content-type, x-sarraf-code',
        'access-control-max-age': '600',
        vary: 'Origin',
      },
    });
  }
  let res;
  try {
    res = await route(request, url, env);
  } catch (e) {
    console.error(e);
    res = json({ error: 'serveur' }, 500);
  }
  if (!cors) return res;
  const h = new Headers(res.headers);
  h.set('access-control-allow-origin', origin);
  h.append('vary', 'Origin');
  return new Response(res.body, { status: res.status, headers: h });
}

async function route(request, url, env) {
  const chemin = url.pathname.replace(/^\/sarraf\/api\//, '');
  if (!env.SARRAF_CODE) return json({ error: 'non_configure' }, 503);
  const code = request.headers.get('x-sarraf-code') || '';
  if (!code || !(await memeCode(code, env.SARRAF_CODE))) return json({ error: 'code' }, 401);

  if (chemin === 'etat' && request.method === 'GET') {
    return json({
      ok: true,
      transcription: Boolean(env.ELEVENLABS_API_KEY),
      analyse: Boolean(env.ANTHROPIC_API_KEY),
      modele: env.SARRAF_MODELE || MODELE,
    });
  }
  if (chemin === 'analyse' && request.method === 'POST') return analyse(request, env);
  return json({ error: 'introuvable' }, 404);
}

async function analyse(request, env) {
  let form;
  try {
    form = await request.formData();
  } catch {
    return json({ error: 'requete' }, 400);
  }
  const audio = form.get('audio');
  let texte = String(form.get('texte') || '').trim().slice(0, TEXTE_MAX);
  const date = String(form.get('date') || new Date().toISOString());
  let contacts = [];
  try {
    contacts = JSON.parse(String(form.get('contacts') || '[]'))
      .filter((c) => typeof c === 'string')
      .map((c) => c.slice(0, 60))
      .slice(0, 300);
  } catch {}

  let langue = null;
  if (audio && typeof audio === 'object' && audio.size) {
    if (audio.size > AUDIO_MAX) return json({ error: 'audio_trop_long' }, 413);
    if (!env.ELEVENLABS_API_KEY) return json({ error: 'transcription_non_configuree' }, 503);
    const t = await transcrire(audio, env);
    if (t.error) return json(t, 502);
    texte = t.texte;
    langue = t.langue;
  }
  if (!texte) return json({ error: 'memo_vide', transcription: '', langue }, 422);
  if (!env.ANTHROPIC_API_KEY) return json({ transcription: texte, langue, analyse: null, erreur_analyse: 'analyse_non_configuree' });

  const a = await decortiquer(texte, date, contacts, env);
  if (a.error) return json({ transcription: texte, langue, analyse: null, erreur_analyse: a.error });
  return json({ transcription: texte, langue, analyse: a.analyse, modele: a.modele });
}

/* ------------------------- transcription ------------------------- */

async function transcrire(audio, env) {
  const fd = new FormData();
  fd.append('model_id', 'scribe_v2');
  fd.append('file', audio, audio.name || 'memo.webm');
  fd.append('tag_audio_events', 'false');
  let r;
  try {
    r = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
      method: 'POST',
      headers: { 'xi-api-key': env.ELEVENLABS_API_KEY },
      body: fd,
    });
  } catch {
    return { error: 'transcription_reseau' };
  }
  if (!r.ok) {
    console.error('elevenlabs', r.status, (await r.text()).slice(0, 500));
    return { error: r.status === 401 ? 'cle_elevenlabs' : r.status === 429 ? 'transcription_occupee' : 'transcription' };
  }
  const d = await r.json();
  return { texte: String(d.text || '').trim(), langue: d.language_code || null };
}

/* ---------------------------- analyse ---------------------------- */

const SYSTEME = `Tu tiens le carnet d'un cambiste algérien (achat et vente de devises, surtout l'euro, contre des dinars).
Juste après chaque appel, il enregistre un mémo vocal où il raconte ce qui a été conclu. Tu reçois la transcription
automatique de ce mémo : français, darija algérienne (en lettres arabes ou latines) ou un mélange des deux. La transcription
peut contenir des fautes, surtout sur les nombres et les prénoms.

Ton travail : décortiquer le mémo en opérations, sans rien inventer.

Une opération = un sens (« achat » : il reçoit des devises et paie des dinars ; « vente » : il donne des devises et reçoit
des dinars), une devise, un montant en devise, un taux en dinars pour 1 unité de devise, et la personne en face.
Un mémo peut contenir plusieurs opérations (il achète chez l'un et revend à l'autre, ou plusieurs ventes).
Mots fréquents : chrit / ch'rit / شريت / dit = j'ai acheté ; bi3t / بعت / vendu / ba3t = j'ai vendu ;
m3a / مع / avec / chez / de / عند = la personne ; b / ب / à / le taux / السعر = le prix ; euro / الأورو / douro = euro.

Comment les Algériens comptent l'argent (essentiel) :
- Les dinars se disent souvent en centimes : « 1 million » / melyoun / مليون = 10 000 DA ; « 1 milliard » / melyar /
  مليار = 10 000 000 DA ; « mya alf » / مية ألف (100 000 centimes) = 1 000 DA ; « alf » seul pour des dinars = 10 DA.
  Si la personne dit clairement « dinars » ou « DA » avec un nombre écrit comme une somme en dinars, garde-le tel quel.
- Les montants en devises se disent directement : « khamsa alaf euro » = 5 000 € ; « alf euro » = 1 000 €.
- Le taux peut être donné pour 1 € (ex. 258 ou 258,5), pour 100 € (ex. 25 800 DA, ou « 2 millions 580 » en centimes
  = 25 800 DA les 100 €) : ramène toujours le taux à des dinars pour 1 unité de devise.
- S'il donne le total en dinars plutôt que le taux, calcule le taux (total ÷ montant) et dis-le dans « a_verifier ».
- S'il donne à la fois taux et total et qu'ils ne collent pas, garde le taux, et signale l'écart dans « a_verifier ».

Reste à régler : si une partie n'est pas encore payée ou livrée (« ba9i », « reste », « il me doit », « crédit »,
« ghodwa ykhallasni », « avance »), mets le montant restant dans « reste » et son unité dans « reste_unite »
(« DA » pour des dinars, « DEVISE » pour la devise de l'opération). Si tout est réglé ou si rien n'est dit, reste = null.
Pour une avance, le reste est ce qui n'a pas encore été versé.

Personnes : écris le prénom ou le surnom tel qu'il a été dit, avec une majuscule. Si c'est manifestement une personne de la
liste des contacts connus (même prénom mal transcrit, surnom courant comme Krimo pour Karim), utilise exactement le nom de la
liste. Personne nommée → contact = null.

Frais : commission d'un intermédiaire (samsar), transport, etc., en dinars, dans « frais_da ».
Échéance : date de règlement promise (« ghodwa » = demain, « nhar el khmis » = jeudi prochain…), calculée à partir de la
date du mémo, au format AAAA-MM-JJ.

Pour chaque opération, « entendu » reprend mot pour mot les mots de la transcription d'où viennent le montant et le taux :
il pourra comparer. Tout doute (nombre peu clair, taux inhabituel, sens achat/vente ambigu, personne incertaine,
conversion de centimes) va dans « a_verifier », en phrases courtes en français. Si un élément n'est pas dit, mets null :
ne devine jamais un nombre.

« resume » : une phrase courte en français qui dit l'essentiel. « texte_fr » : le mémo rendu fidèlement en français clair
(s'il est déjà en français, corrige seulement la transcription).`;

const nul = (t) => ({ anyOf: [t, { type: 'null' }] });

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['operations', 'frais_da', 'frais_note', 'echeance', 'resume', 'texte_fr', 'a_verifier'],
  properties: {
    operations: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['sens', 'devise', 'montant', 'taux', 'contact', 'reste', 'reste_unite', 'entendu', 'remarque'],
        properties: {
          sens: { type: 'string', enum: ['achat', 'vente'] },
          devise: { type: 'string', enum: ['EUR', 'USD', 'GBP', 'CAD', 'CHF', 'TRY', 'AED', 'SAR', 'CNY'] },
          montant: nul({ type: 'number' }),
          taux: nul({ type: 'number' }),
          contact: nul({ type: 'string' }),
          reste: nul({ type: 'number' }),
          reste_unite: nul({ type: 'string', enum: ['DA', 'DEVISE'] }),
          entendu: { type: 'string' },
          remarque: nul({ type: 'string' }),
        },
      },
    },
    frais_da: nul({ type: 'number' }),
    frais_note: nul({ type: 'string' }),
    echeance: nul({ type: 'string', format: 'date' }),
    resume: { type: 'string' },
    texte_fr: { type: 'string' },
    a_verifier: { type: 'array', items: { type: 'string' } },
  },
};

async function decortiquer(texte, date, contacts, env) {
  const jour = new Date(date);
  const quand = Number.isNaN(jour.getTime())
    ? date
    : jour.toLocaleString('fr-FR', { timeZone: 'Africa/Algiers', dateStyle: 'full', timeStyle: 'short' });
  const message = [
    `Date du mémo : ${quand} (heure d'Alger).`,
    `Contacts connus : ${contacts.length ? contacts.join(' · ') : 'aucun pour l’instant'}.`,
    '',
    'Transcription du mémo :',
    '"""',
    texte,
    '"""',
  ].join('\n');
  const modele = env.SARRAF_MODELE || MODELE;
  let r;
  try {
    r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2026-10-21',
        // Si un filtre de sécurité refuse la demande, l'API la relance d'elle-même sur le modèle de secours conseillé
        'anthropic-beta': 'server-side-fallback-2026-07-01',
      },
      body: JSON.stringify({
        model: modele,
        max_tokens: 16000,
        fallbacks: 'default',
        output_config: { effort: 'medium', format: { type: 'json_schema', schema: SCHEMA } },
        system: SYSTEME,
        messages: [{ role: 'user', content: message }],
      }),
    });
  } catch {
    return { error: 'analyse_reseau' };
  }
  if (!r.ok) {
    console.error('anthropic', r.status, (await r.text()).slice(0, 500));
    return { error: r.status === 401 ? 'cle_anthropic' : r.status === 429 || r.status === 529 ? 'analyse_occupee' : 'analyse' };
  }
  const d = await r.json();
  if (d.stop_reason === 'refusal') return { error: 'analyse_refusee' };
  if (d.stop_reason === 'max_tokens') return { error: 'analyse_incomplete' };
  const bloc = (d.content || []).find((b) => b.type === 'text');
  try {
    return { analyse: JSON.parse(bloc.text), modele: d.model };
  } catch {
    return { error: 'analyse_illisible' };
  }
}
