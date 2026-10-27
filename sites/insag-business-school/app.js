(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- programmes (contenus repris d'insag.edu.dz) ---------- */
  const PROGS = [
    { id: 'global', fam: 'management', famLabel: 'Management', mono: 'G', c1: '#3d6ef5', c2: '#0d2470',
      t: 'Global MBA', sub: 'Management opérationnel et stratégique',
      p: 'Une vision globale de l\'entreprise : leadership, stratégie et innovation.',
      rythme: '12 à 15 mois · 3 jours par mois (sam., dim., lun.)', campus: 'Alger · Constantine',
      partner: 'Collège de Paris (Ascencia Business School)', admission: 'Bac+4, diplôme supérieur, expérience professionnelle, entretien de motivation', reco: 'RNCP · WES' },
    { id: 'digital', fam: 'digital', famLabel: 'Marketing digital', mono: 'D', c1: '#4cc9f0', c2: '#2453d6',
      t: 'MBA Marketing Digital & Business', sub: 'Marketing digital, e-business, transformation digitale',
      p: 'Construit sur 25 ans d\'expérience du business digital et du management.',
      rythme: '18 mois · 3 jours par mois (sam., dim., lun.)', campus: 'Alger · Hydra',
      partner: 'Business school partenaire, Paris', admission: 'Bac+4 ou diplôme supérieur + validation des acquis professionnels', reco: 'Titre RNCP' },
    { id: 'rh', fam: 'rh', famLabel: 'Ressources humaines', mono: 'RH', c1: '#2bb3c0', c2: '#0f5d7a',
      t: 'MBA Ressources Humaines', sub: 'Gestion stratégique du capital humain',
      p: 'Développement organisationnel et nouvelles tendances RH, pour les leaders RH.',
      rythme: 'Format executive', campus: 'Alger · Hydra', partner: 'IGS-RH Paris', admission: 'Bac+4 et expérience professionnelle', reco: 'RNCP · WES' },
    { id: 'finance', fam: 'finance', famLabel: 'Assurance & Finance', mono: 'F', c1: '#1e3a8a', c2: '#071a52',
      t: 'EMBA Finance', sub: 'Stratégie financière d\'entreprise',
      p: 'Marchés financiers et gestion de portefeuille, pour consolider une expertise finance.',
      rythme: 'Format executive', campus: 'Alger · Hydra', partner: 'Business school partenaire, Paris', admission: 'Bac+4 et expérience professionnelle', reco: 'RNCP · WES' },
    { id: 'entrepreneur', fam: 'management', famLabel: 'Management', mono: 'E', c1: '#f0455b', c2: '#8f1d4a',
      t: 'MBA Management & Entrepreneuriat', sub: 'Entrepreneurial & Startups',
      p: 'Pour les entrepreneurs et les cadres : leadership, gestion de projets, innovation.',
      rythme: 'Format executive', campus: 'Alger · Hydra', partner: 'Business school partenaire, Paris', admission: 'Bac+4 et expérience professionnelle', reco: 'RNCP · WES' },
    { id: 'assurance', fam: 'finance', famLabel: 'Assurance & Finance', mono: 'A', c1: '#7b44c4', c2: '#3b2a91',
      t: 'Master Manager des Assurances', sub: 'Avec l\'ESA, École Supérieure d\'Assurances de Paris',
      p: 'Gestion des risques, souscription et réassurance, régulation et conformité, Big Data et IA.',
      rythme: 'Format executive', campus: 'Alger · Hydra', partner: 'ESA Paris', admission: 'Bac+4 et expérience professionnelle', reco: 'Diplôme ESA Paris' },
    { id: 'bachelor', fam: 'finance', famLabel: 'Assurance & Finance', mono: 'B', c1: '#a259d9', c2: '#5b2a91',
      t: 'Bachelor en assurance', sub: 'Avec l\'ESA Paris',
      p: 'Les fondamentaux des métiers de l\'assurance, pour entrer dans le secteur.',
      rythme: 'Nous consulter', campus: 'Alger · Hydra', partner: 'ESA Paris', admission: 'Nous consulter', reco: 'Diplôme ESA Paris' },
    { id: 'islamique', fam: 'finance', famLabel: 'Assurance & Finance', mono: 'FI', c1: '#0f8a6a', c2: '#0b4f45',
      t: 'Double diplôme Finance islamique', sub: 'Avec Financia Business School et le BIBF (Bahreïn)',
      p: 'Un double diplôme international pour un secteur en pleine croissance en Algérie.',
      rythme: 'Nous consulter', campus: 'Alger', partner: 'Financia Business School · BIBF Bahreïn', admission: 'Nous consulter', reco: 'Double diplôme international' },
    { id: 'hospitality', fam: 'secteur', famLabel: 'Hôtellerie', mono: 'H', c1: '#e0a321', c2: '#9a5a12',
      t: 'Executive MBA Hospitality Management', sub: 'Avec l\'ESHRA Alger et Keyce Tourisme',
      p: 'Une approche multidimensionnelle de la gestion hôtelière, adaptée aux défis du secteur.',
      rythme: 'Format executive', campus: 'Alger', partner: 'ESHRA Alger · Keyce Tourisme (Collège de Paris)', admission: 'Bac+4 et expérience professionnelle', reco: 'Executive MBA' },
    { id: 'sante', fam: 'secteur', famLabel: 'Santé', mono: 'S', c1: '#20b38a', c2: '#0d6b6b',
      t: 'MBA Management de la Santé', sub: 'Le management appliqué à la santé',
      p: 'Pour les cadres des établissements et entreprises de santé qui veulent piloter.',
      rythme: 'Format executive', campus: 'Alger · Hydra', partner: 'Business school partenaire, Paris', admission: 'Bac+4 et expérience professionnelle', reco: 'RNCP · WES' }
  ];
  const byId = Object.fromEntries(PROGS.map(p => [p.id, p]));

  /* ---------- apparitions ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
      e.target.dispatchEvent(new CustomEvent('reveal'));
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  const watch = (el) => {
    const sibs = [...el.parentElement.children].filter(n => n.classList.contains('reveal'));
    el.style.transitionDelay = (Math.max(0, sibs.indexOf(el)) % 6) * 70 + 'ms';
    io.observe(el);
  };

  /* ---------- nav, menu, bouton flottant ---------- */
  const nav = $('#nav'), burger = $('#burger'), drawer = $('#drawer'), fab = $('.fab');
  const hero = $('.hero');
  burger.addEventListener('click', () => {
    const open = burger.getAttribute('aria-expanded') !== 'true';
    burger.setAttribute('aria-expanded', open);
    drawer.hidden = !open;
    nav.classList.toggle('is-solid', !open && scrollY > hero.offsetHeight - 80);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  drawer.addEventListener('click', (e) => {
    if (e.target.closest('a')) { burger.setAttribute('aria-expanded', 'false'); drawer.hidden = true; document.body.style.overflow = ''; }
  });

  /* ---------- altimètre de carrière ---------- */
  const alti = $('.alti'), altiFill = $('#alti-fill'), altiVal = $('#alti-val'), altiSteps = $$('.alti__steps li');
  let ticking = false;
  const onScroll = () => {
    ticking = false;
    const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    const k = max > 0 ? Math.min(1, y / max) : 0;
    nav.classList.toggle('is-solid', y > hero.offsetHeight - 80 && burger.getAttribute('aria-expanded') !== 'true');
    fab.classList.toggle('is-on', y > hero.offsetHeight * 0.7 && y < max - 600);
    alti.classList.toggle('is-on', y > 200);
    altiFill.style.height = (k * 100).toFixed(1) + '%';
    altiVal.textContent = (Math.round(k * 400) * 10).toLocaleString('fr-FR');
    const lvl = Math.min(3, Math.floor(k * 4));
    altiSteps.forEach((li, i) => li.classList.toggle('is-on', i === lvl));
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* ---------- ciel interactif : des points qui montent ---------- */
  const sky = $('#sky'), ctx = sky.getContext('2d');
  let W = 0, H = 0, pts = [], running = false, last = 0;
  const ptr = { x: -9999, y: -9999, live: 0 };
  const resize = () => {
    const dpr = Math.min(2, devicePixelRatio || 1);
    W = sky.clientWidth; H = sky.clientHeight;
    sky.width = W * dpr; sky.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(Math.min(460, (W * H) / 2600));
    pts = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.12, vy: -(0.08 + Math.random() * 0.32),
      r: Math.random() * 1.5 + 0.4, a: Math.random() * 0.5 + 0.2, tw: Math.random() * 6.28
    }));
    if (!running) draw(performance.now(), true);
  };
  const draw = (t, still) => {
    ctx.clearRect(0, 0, W, H);
    // sans interaction, le « curseur » se promène tout seul
    let px = ptr.x, py = ptr.y;
    if (t - ptr.live > 2500) {
      px = W * (0.62 + 0.25 * Math.sin(t / 3100));
      py = H * (0.42 + 0.22 * Math.sin(t / 2300 + 1));
    }
    const near = [];
    for (const p of pts) {
      if (!still) {
        p.x += p.vx; p.y += p.vy;
        if (p.y < -6) { p.y = H + 6; p.x = Math.random() * W; }
        if (p.x < -6) p.x = W + 6; else if (p.x > W + 6) p.x = -6;
      }
      const dx = p.x - px, dy = p.y - py, d = Math.hypot(dx, dy);
      let a = p.a * (0.7 + 0.3 * Math.sin(t / 700 + p.tw)), r = p.r;
      if (d < 170) {
        near.push(p);
        const f = 1 - d / 170;
        a = Math.min(1, a + f * 0.8); r += f * 1.6;
        if (!still) { p.x += dx / (d || 1) * f * 0.6; p.y += dy / (d || 1) * f * 0.6; }
      }
      ctx.beginPath();
      ctx.fillStyle = `rgba(${d < 170 ? '255,214,110' : '170,220,255'},${a})`;
      ctx.arc(p.x, p.y, r, 0, 6.283);
      ctx.fill();
    }
    ctx.lineWidth = 0.8;
    for (let i = 0; i < near.length; i++) {
      const p = near[i];
      const d0 = Math.hypot(p.x - px, p.y - py);
      ctx.strokeStyle = `rgba(76,201,240,${(1 - d0 / 170) * 0.55})`;
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(p.x, p.y); ctx.stroke();
      for (let j = i + 1; j < near.length; j++) {
        const q = near[j], d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < 70) {
          ctx.strokeStyle = `rgba(255,255,255,${(1 - d / 70) * 0.25})`;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
        }
      }
    }
  };
  const loop = (t) => {
    if (!running) return;
    if (t - last > 15) { draw(t, false); last = t; }
    requestAnimationFrame(loop);
  };
  hero.addEventListener('pointermove', (e) => {
    const b = sky.getBoundingClientRect();
    ptr.x = e.clientX - b.left; ptr.y = e.clientY - b.top; ptr.live = performance.now();
    if (reduced) draw(performance.now(), true);
  }, { passive: true });
  hero.addEventListener('pointerdown', (e) => {
    const b = sky.getBoundingClientRect();
    ptr.x = e.clientX - b.left; ptr.y = e.clientY - b.top; ptr.live = performance.now();
  }, { passive: true });
  hero.addEventListener('pointerleave', () => { ptr.live = 0; });
  new IntersectionObserver(([e]) => {
    if (reduced) return;
    if (e.isIntersecting && !running) { running = true; requestAnimationFrame(loop); }
    else if (!e.isIntersecting) running = false;
  }).observe(hero);
  addEventListener('resize', () => { clearTimeout(resize.t); resize.t = setTimeout(resize, 150); });
  resize();

  /* ---------- compteurs ---------- */
  $$('[data-count]').forEach(el => {
    const to = +el.dataset.count, plain = 'plain' in el.dataset;
    const from = plain ? to - 40 : 0;
    const fmt = (n) => plain ? String(n) : n.toLocaleString('fr-FR');
    const stat = el.closest('.reveal');
    stat.addEventListener('reveal', () => {
      if (reduced) return;
      const t0 = performance.now(), dur = 1600;
      const step = (t) => {
        const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 4);
        el.textContent = fmt(Math.round(from + (to - from) * e));
        if (k < 1) requestAnimationFrame(step);
      };
      el.textContent = fmt(from);
      requestAnimationFrame(step);
    }, { once: true });
  });

  /* ---------- cartes programmes ---------- */
  const cards = $('#cards');
  cards.innerHTML = PROGS.map(p => `
    <li class="pcard reveal" data-fam="${p.fam}" style="--c1:${p.c1};--c2:${p.c2}">
      <div class="pcard__in">
        <div class="pcard__face pcard__front" data-mono="${p.mono}">
          <span class="pcard__fam">${p.famLabel}</span>
          <h3 class="pcard__t">${p.t}</h3>
          <i class="pcard__bar"></i>
          <p class="pcard__p">${p.sub}</p>
          <span class="pcard__more"><i>↻</i> Rythme, campus, admission</span>
        </div>
        <div class="pcard__face pcard__back">
          <h4>${p.t}</h4>
          <dl>
            <div><dt>Rythme</dt><dd>${p.rythme}</dd></div>
            <div><dt>Campus</dt><dd>${p.campus}</dd></div>
            <div><dt>Partenaire</dt><dd>${p.partner}</dd></div>
            <div><dt>Admission</dt><dd>${p.admission}</dd></div>
          </dl>
          <a class="btn" href="#candidature" data-prog="${p.id}">Candidater</a>
        </div>
      </div>
      <button type="button" class="pcard__hit" aria-label="Voir le détail : ${p.t}"></button>
    </li>`).join('');
  cards.addEventListener('click', (e) => {
    const hit = e.target.closest('.pcard__hit');
    if (hit) hit.parentElement.classList.toggle('is-flipped');
    const go = e.target.closest('[data-prog]');
    if (go) setProg(go.dataset.prog);
  });
  $$('.filter').forEach(b => b.addEventListener('click', () => {
    $$('.filter').forEach(x => { x.classList.toggle('is-on', x === b); x.setAttribute('aria-selected', x === b); });
    const f = b.dataset.f;
    $$('.pcard').forEach(c => {
      c.classList.toggle('is-out', f !== 'all' && c.dataset.fam !== f);
      c.classList.remove('is-flipped');
      c.classList.add('is-in');
    });
  }));

  /* ---------- quiz ---------- */
  const answers = {};
  const steps = $$('#quiz-card .q'), bar = $('#quiz-bar'), back = $('#quiz-back');
  let cur = 0;
  const show = (i) => {
    cur = i;
    steps.forEach(s => s.classList.toggle('is-on', +s.dataset.step === i));
    bar.style.width = (i / 3 * 100) + '%';
    back.hidden = i === 0 || i === 3;
  };
  const pick = () => {
    const d = answers.domaine, xp = answers.xp;
    const map = { management: 'global', finance: 'finance', assurance: 'assurance', digital: 'digital', rh: 'rh', sante: 'sante', hotel: 'hospitality', startup: 'entrepreneur' };
    let id = map[d] || 'global';
    if (d === 'assurance' && xp === 'junior') id = 'bachelor';
    return byId[id];
  };
  const result = () => {
    const p = pick();
    $('#res-title').textContent = p.t;
    $('#res-pitch').textContent = p.p;
    const campus = answers.campus === 'constantine' ? 'Constantine' : 'Alger · Hydra';
    $('#res-facts').innerHTML = [
      ['Rythme', p.rythme], ['Votre campus', campus], ['Partenaire', p.partner], ['Reconnaissance', p.reco]
    ].map(([k, v]) => `<li><b>${k}</b>${v}</li>`).join('');
    let note = '';
    if (answers.xp === 'junior' && p.id !== 'bachelor') note = 'L\'admission en MBA demande une expérience professionnelle validée par le conseil pédagogique. Parlons-en lors de votre entretien.';
    else if (answers.campus === 'constantine' && p.id !== 'global') note = 'À Constantine, le Global MBA ouvre deux rentrées par an. Pour ce programme, l\'admission vous indique la prochaine session la plus proche.';
    else if (answers.xp === 'senior') note = 'Plus de 10 ans d\'expérience : votre parcours peut être valorisé par la validation des acquis professionnels.';
    $('#res-note').textContent = note;
    $('#res-go').dataset.prog = p.id;
    setProg(p.id, answers.campus);
  };
  $('#quiz-card').addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    $$(`.chip[data-k="${chip.dataset.k}"]`).forEach(c => c.classList.toggle('is-picked', c === chip));
    answers[chip.dataset.k] = chip.dataset.v;
    setTimeout(() => { if (cur === 2) result(); show(cur + 1); }, 260);
  });
  back.addEventListener('click', () => show(Math.max(0, cur - 1)));
  $('#quiz-reset').addEventListener('click', () => { $$('#quiz-card .chip').forEach(c => c.classList.remove('is-picked')); show(0); });

  /* ---------- rythme : 3 jours par mois ---------- */
  const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  const calGrid = $('#cal-grid'), calMonth = $('#cal-month');
  const now = new Date();
  let calY = now.getFullYear(), calM = now.getMonth();
  const renderCal = (animate) => {
    calMonth.textContent = `${MONTHS[calM]} ${calY}`;
    const first = new Date(calY, calM, 1).getDay();
    const days = new Date(calY, calM + 1, 0).getDate();
    // séance : 2e samedi du mois, puis dimanche et lundi
    const sat = 1 + ((6 - first + 7) % 7) + 7;
    const cls = [sat, sat + 1, sat + 2];
    let html = '';
    for (let i = 0; i < first; i++) html += '<span class="is-empty"></span>';
    for (let d = 1; d <= days; d++) {
      const dow = (first + d - 1) % 7;
      const we = dow === 5 || dow === 6; // week-end algérien : vendredi et samedi
      const c = cls.includes(d);
      html += `<span class="${we ? 'is-we' : ''}${c ? ' is-c' : ''}${c && !we ? ' is-w' : ''}">${d}</span>`;
    }
    calGrid.innerHTML = html;
    const lit = $$('.is-c', calGrid);
    const on = () => lit.forEach((s, i) => setTimeout(() => {
      s.classList.add('is-class');
      if (s.classList.contains('is-w')) s.classList.add('is-work');
    }, reduced ? 0 : 250 + i * 220));
    if (animate) on(); else calGrid.addEventListener('reveal', on, { once: true });
  };
  $('#cal-prev').addEventListener('click', () => { calM--; if (calM < 0) { calM = 11; calY--; } renderCal(true); });
  $('#cal-next').addEventListener('click', () => { calM++; if (calM > 11) { calM = 0; calY++; } renderCal(true); });
  const cal = $('.cal');
  renderCal(false);
  cal.addEventListener('reveal', () => calGrid.dispatchEvent(new CustomEvent('reveal')));
  const range = $('#r-range');
  const setRange = () => {
    const m = +range.value;
    $('#r-label').textContent = m + ' mois';
    $('#r-months').textContent = m;
    $('#r-total').textContent = m * 3;
  };
  range.addEventListener('input', setRange);
  setRange();

  /* ---------- tampons de reconnaissance ---------- */
  const stamps = $$('.stamp');
  $('.passport').addEventListener('reveal', () => stamps.forEach((s, i) => setTimeout(() => s.classList.add('is-in'), reduced ? 0 : 300 + i * 380)));
  stamps.forEach(s => s.addEventListener('click', () => {
    s.classList.remove('is-in');
    setTimeout(() => s.classList.add('is-in'), 160);
    if (navigator.vibrate) navigator.vibrate(18);
  }));

  /* ---------- campus ---------- */
  const CAMPUS = {
    alger: { name: 'Campus d\'Alger', addr: '57, rue Abri Arezki (rue Chenoua), Hydra',
      tel: ['+213 (0) 23 48 01 01', '+213 (0) 770 24 18 55', '+213 (0) 770 51 20 64', '+213 (0) 770 76 11 65'],
      progs: 'Tous les programmes : Global MBA, MBA spécialisés, Master et Bachelor en assurance.',
      map: 'https://www.google.com/maps/search/?api=1&query=INSAG+Business+School+Hydra+Alger' },
    constantine: { name: 'Campus de Constantine', addr: '74, avenue Kadour Boumeddous, Constantine',
      tel: ['+213 (0) 770 73 49 00', '+213 (0) 770 73 29 00'],
      progs: 'Global MBA avec le Collège de Paris : 4ᵉ promotion lancée, deux rentrées par an.',
      map: 'https://www.google.com/maps/search/?api=1&query=74+avenue+Kadour+Boumeddous+Constantine' }
  };
  const sw = $('.campus__switch');
  const setCampus = (k) => {
    const c = CAMPUS[k];
    $$('.cs').forEach(b => { b.classList.toggle('is-on', b.dataset.c === k); b.setAttribute('aria-selected', b.dataset.c === k); });
    sw.classList.toggle('is-c', k === 'constantine');
    $$('.pin').forEach(p => p.classList.toggle('is-on', p.classList.contains('pin--' + k)));
    $('#c-name').textContent = c.name;
    $('#c-addr').textContent = c.addr;
    $('#c-tel').innerHTML = c.tel.map(t => `<li><a href="tel:${t.replace('(0)', '').replace(/[^\d+]/g, '')}">${t}</a></li>`).join('');
    $('#c-progs').textContent = c.progs;
    $('#c-map').href = c.map;
  };
  $$('.cs').forEach(b => b.addEventListener('click', () => setCampus(b.dataset.c)));
  $$('.pin').forEach(p => p.addEventListener('click', () => setCampus(p.classList.contains('pin--alger') ? 'alger' : 'constantine')));
  setCampus('alger');

  /* ---------- candidature ---------- */
  const form = $('#form'), fsteps = $$('.fs', form), dots = $$('.form__steps i', form);
  const fProg = $('#f-prog'), fCampus = $('#f-campus');
  fProg.innerHTML = PROGS.map(p => `<option value="${p.id}">${p.t}</option>`).join('');
  function setProg(id, campus) {
    if (byId[id]) fProg.value = id;
    if (campus) fCampus.value = campus;
  }
  $('#res-go').addEventListener('click', (e) => setProg(e.currentTarget.dataset.prog, answers.campus));
  let fstep = 0;
  const goStep = (i) => {
    fstep = i;
    fsteps.forEach(s => s.classList.toggle('is-on', +s.dataset.fs === i));
    dots.forEach((d, j) => d.classList.toggle('is-on', j <= i));
  };
  form.addEventListener('click', (e) => {
    if (!e.target.closest('[data-next]')) return;
    const req = $$('[required]', fsteps[fstep]);
    let ok = true;
    req.forEach(inp => { const bad = !inp.value.trim(); inp.classList.toggle('is-bad', bad); if (bad) ok = false; });
    if (ok) goStep(fstep + 1);
    else req.find(i => i.classList.contains('is-bad')).focus();
  });
  // créneaux : les 6 prochains jours ouvrés (dimanche → jeudi)
  const slots = $('#slots'), days = [];
  for (let d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1); days.length < 6; d.setDate(d.getDate() + 1)) {
    if (d.getDay() !== 5 && d.getDay() !== 6) days.push(new Date(d));
  }
  slots.innerHTML = days.map((d, i) => `<button type="button" class="slot${i === 0 ? ' is-picked' : ''}" data-i="${i}"><b>${d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' })}</b>${i % 2 ? '14 h 00' : '10 h 00'}</button>`).join('');
  slots.addEventListener('click', (e) => {
    const s = e.target.closest('.slot');
    if (s) $$('.slot', slots).forEach(x => x.classList.toggle('is-picked', x === s));
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const s = $('.slot.is-picked', slots);
    const name = form.nom.value.trim().split(' ')[0] || '';
    $('#done-txt').textContent = `Merci ${name} : entretien demandé pour le ${s ? s.querySelector('b').textContent + ' à ' + s.lastChild.textContent : 'prochain créneau'}, programme ${byId[fProg.value].t}, campus ${fCampus.value === 'constantine' ? 'de Constantine' : 'd\'Alger'}. L'admission vous rappelle pour confirmer.`;
    goStep(3);
  });

  /* ---------- lancement des apparitions ---------- */
  $$('.reveal').forEach(watch);
  [cal, $('.passport'), $('.campus__map')].forEach(el => { if (!el.classList.contains('reveal')) io.observe(el); });
})();
