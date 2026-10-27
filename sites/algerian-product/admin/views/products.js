// Produits : liste, ordre, visibilité, mise en avant, et fiche complète en plusieurs langues.
import { esc } from '../../store.js';
import { productVisual, ART_KEYS, illustration } from '../../art.js';
import { S, ml, field, bind, openDrawer, closeDrawer, toast, confirmDo, compressImage, t, tf, emptyML, move } from '../ui.js';

const INCOTERMS = ['EXW', 'FCA', 'FOB', 'CFR', 'CIF', 'DAP', 'DDP'];

export default function products(el) {
  let filter = 'all';
  let q = '';
  const D = S.draft;
  const sector = (id) => D.sectors.find((s) => s.id === id);

  function render() {
    const list = D.products
      .map((p, i) => ({ p, i }))
      .filter(({ p }) => filter === 'all' || p.sector === filter)
      .filter(({ p }) => !q || JSON.stringify(p.name).toLowerCase().includes(q.toLowerCase()));
    el.innerHTML = `
      <div class="bar">
        <input class="bar__search" type="search" placeholder="Rechercher un produit" value="${esc(q)}" id="pq">
        <select id="pf" class="bar__select"><option value="all">Toutes les filières (${D.products.length})</option>${D.sectors.map((s) => `<option value="${s.id}"${s.id === filter ? ' selected' : ''}>${esc(tf(s.name))} (${D.products.filter((p) => p.sector === s.id).length})</option>`).join('')}</select>
        <button class="b b--primary" type="button" id="padd">+ Ajouter un produit</button>
      </div>
      <p class="hint">Glissez l’ordre avec les flèches ; l’œil masque un produit du site, l’étoile le met en avant sur l’accueil. Les textes s’éditent dans la langue choisie en haut (${S.lang.toUpperCase()}).</p>
      <ul class="plist">${list
        .map(
          ({ p, i }) => `<li class="prow${p.visible === false ? ' is-hidden' : ''}" data-i="${i}">
          <div class="prow__v">${productVisual(p, sector(p.sector))}</div>
          <div class="prow__t"><b>${esc(t(p.name)) || '<em>Sans nom</em>'}</b><small>${esc(t(sector(p.sector)?.name))} · ${esc(t(D.regions.find((r) => r.id === p.region)?.name))}</small></div>
          <div class="prow__a">
            <button type="button" class="ib" data-act="up" title="Monter">↑</button><button type="button" class="ib" data-act="down" title="Descendre">↓</button>
            <button type="button" class="ib${p.featured ? ' is-on' : ''}" data-act="feat" title="Mettre en avant sur l’accueil">★</button>
            <button type="button" class="ib${p.visible !== false ? ' is-on' : ''}" data-act="vis" title="Visible sur le site">${p.visible !== false ? '◉' : '○'}</button>
            <button type="button" class="b b--ghost b--sm" data-act="edit">Modifier</button>
          </div></li>`
        )
        .join('')}</ul>`;
    el.querySelector('#pq').addEventListener('input', (e) => {
      q = e.target.value;
      clearTimeout(render.t);
      render.t = setTimeout(() => {
        render();
        const i = el.querySelector('#pq');
        i.focus();
        i.setSelectionRange(q.length, q.length);
      }, 200);
    });
    el.querySelector('#pf').addEventListener('change', (e) => ((filter = e.target.value), render()));
    el.querySelector('#padd').addEventListener('click', () => {
      const p = {
        id: `produit-${Date.now().toString(36)}`, sector: filter !== 'all' ? filter : D.sectors[0].id, art: 'appliance', color: '#2f4a43', image: '', visible: false, featured: false,
        region: D.regions[0].id, place: emptyML(), name: emptyML(), short: emptyML(), desc: emptyML(), formats: [], specs: [], certs: [], hs: '', moq: emptyML(), leadtime: emptyML(), incoterms: ['EXW', 'FOB'], order: D.products.length,
      };
      D.products.push(p);
      S.onChange();
      edit(D.products.length - 1);
    });
    el.querySelector('.plist').addEventListener('click', (e) => {
      const b = e.target.closest('[data-act]');
      if (!b) return;
      const i = Number(b.closest('[data-i]').dataset.i);
      const p = D.products[i];
      if (b.dataset.act === 'edit') return edit(i);
      if (b.dataset.act === 'up' || b.dataset.act === 'down') move(D.products, i, b.dataset.act === 'up' ? -1 : 1);
      if (b.dataset.act === 'feat') p.featured = !p.featured;
      if (b.dataset.act === 'vis') p.visible = p.visible === false;
      S.onChange();
      render();
    });
  }

  function edit(i) {
    const p = D.products[i];
    const base = `products.${i}`;
    const regions = D.regions.map((r) => [r.id, tf(r.name)]);
    const html = `
      <div class="pe">
        <div class="pe__preview" id="pe-prev"></div>
        <div class="pe__fields">
          <div class="fgrid">
            ${ml(`${base}.name`, 'Nom du produit', { wide: true })}
            ${ml(`${base}.short`, 'Accroche (une ligne)', { wide: true, max: 70 })}
            ${ml(`${base}.desc`, 'Description', { textarea: true, rows: 5, wide: true })}
            ${field(`${base}.sector`, 'Filière', { options: D.sectors.map((s) => [s.id, tf(s.name)]) })}
            ${field(`${base}.region`, 'Région (wilaya)', { options: regions })}
            ${ml(`${base}.place`, 'Lieu d’origine précis', { wide: true })}
            ${field(`${base}.visible`, 'Visible sur le site', { type: 'checkbox' })}
            ${field(`${base}.featured`, 'Mis en avant sur l’accueil', { type: 'checkbox' })}
          </div>
          <h4 class="ftitle">Visuel</h4>
          <div class="visual-pick">
            <label class="upload"><input type="file" accept="image/*" id="pe-img"><span>${p.image ? 'Remplacer la photo' : 'Ajouter une photo'}</span><small>Compressée automatiquement (WebP, 1 200 px)</small></label>
            ${p.image ? '<button type="button" class="b b--ghost b--sm" id="pe-noimg">Revenir à l’illustration</button>' : ''}
            <label class="f f--color"><span>Couleur</span><input type="color" data-path="${base}.color" value="${esc(p.color || '#333333')}"></label>
          </div>
          <div class="artgrid" id="pe-art">${ART_KEYS.map((k) => `<button type="button" data-art="${k}" aria-pressed="${k === p.art}" title="${k}">${illustration(k)}</button>`).join('')}</div>
          <h4 class="ftitle">Conditionnements & formats</h4>
          <div class="rows" id="pe-formats"></div>
          <button type="button" class="b b--ghost b--sm" id="pe-addf">+ Ajouter un format</button>
          <h4 class="ftitle">Spécifications</h4>
          <div class="rows" id="pe-specs"></div>
          <button type="button" class="b b--ghost b--sm" id="pe-adds">+ Ajouter une spécification</button>
          <h4 class="ftitle">Certifications disponibles</h4>
          <div class="checks">${Object.entries(D.certs).map(([k, v]) => `<label><input type="checkbox" data-cert="${k}" ${(p.certs || []).includes(k) ? 'checked' : ''}> ${esc(tf(v))}</label>`).join('')}</div>
          <h4 class="ftitle">Logistique</h4>
          <div class="fgrid">
            ${ml(`${base}.moq`, 'Commande minimale')}
            ${ml(`${base}.leadtime`, 'Délai indicatif')}
            ${field(`${base}.hs`, 'Code SH (douane)', { help: 'Ex. 0804.10 pour les dattes' })}
            <div class="f"><span>Incoterms proposés</span><div class="checks checks--row">${INCOTERMS.map((k) => `<label><input type="checkbox" data-inco="${k}" ${(p.incoterms || []).includes(k) ? 'checked' : ''}> ${k}</label>`).join('')}</div></div>
          </div>
          <div class="dactions"><a class="b b--ghost" href="../produit.html?id=${encodeURIComponent(p.id)}&preview=1" target="_blank" rel="noopener">Aperçu de la fiche ↗</a><button type="button" class="b b--ghost" id="pe-dup">Dupliquer</button><button type="button" class="b b--danger" id="pe-del">Supprimer</button></div>
        </div>
      </div>`;
    const body = openDrawer(tf(p.name) || 'Nouveau produit', html, { onClose: render, wide: true });
    const prev = () => (body.querySelector('#pe-prev').innerHTML = `<div class="pe__card">${productVisual(p, sector(p.sector))}<b>${esc(t(p.name)) || 'Sans nom'}</b><small>${esc(t(p.short))}</small></div>`);
    const listRows = () => {
      body.querySelector('#pe-formats').innerHTML = (p.formats || []).map((f, k) => `<div class="row1">${ml(`${base}.formats.${k}.label`, `Format ${k + 1}`)}<button type="button" class="ib" data-rmf="${k}" title="Retirer">✕</button></div>`).join('') || '<p class="muted">Aucun format.</p>';
      body.querySelector('#pe-specs').innerHTML = (p.specs || []).map((s, k) => `<div class="row2">${ml(`${base}.specs.${k}.k`, 'Caractéristique')}${ml(`${base}.specs.${k}.v`, 'Valeur')}<button type="button" class="ib" data-rms="${k}" title="Retirer">✕</button></div>`).join('') || '<p class="muted">Aucune spécification.</p>';
    };
    listRows();
    prev();
    bind(body, prev);
    body.addEventListener('click', async (e) => {
      const a = e.target.closest('[data-art]');
      if (a) {
        p.art = a.dataset.art;
        body.querySelectorAll('[data-art]').forEach((b) => b.setAttribute('aria-pressed', String(b === a)));
        S.onChange();
        prev();
      }
      const rf = e.target.closest('[data-rmf]');
      if (rf) (p.formats.splice(Number(rf.dataset.rmf), 1), S.onChange(), listRows());
      const rs = e.target.closest('[data-rms]');
      if (rs) (p.specs.splice(Number(rs.dataset.rms), 1), S.onChange(), listRows());
    });
    body.querySelector('#pe-addf').addEventListener('click', () => {
      (p.formats ||= []).push({ label: emptyML() });
      S.onChange();
      listRows();
    });
    body.querySelector('#pe-adds').addEventListener('click', () => {
      (p.specs ||= []).push({ k: emptyML(), v: emptyML() });
      S.onChange();
      listRows();
    });
    body.addEventListener('change', (e) => {
      if (e.target.dataset.cert) {
        const k = e.target.dataset.cert;
        p.certs = e.target.checked ? [...new Set([...(p.certs || []), k])] : (p.certs || []).filter((x) => x !== k);
        S.onChange();
      }
      if (e.target.dataset.inco) {
        const k = e.target.dataset.inco;
        p.incoterms = INCOTERMS.filter((x) => (x === k ? e.target.checked : (p.incoterms || []).includes(x)));
        S.onChange();
      }
    });
    body.querySelector('#pe-img').addEventListener('change', async (e) => {
      const f = e.target.files[0];
      if (!f) return;
      try {
        p.image = await compressImage(f);
        S.onChange();
        toast('Photo ajoutée.', 'ok');
        edit(i);
      } catch {
        toast('Image illisible.', 'err');
      }
    });
    body.querySelector('#pe-noimg')?.addEventListener('click', () => {
      p.image = '';
      S.onChange();
      edit(i);
    });
    body.querySelector('#pe-dup').addEventListener('click', () => {
      const c = structuredClone(p);
      c.id = `${p.id}-copie`;
      c.visible = false;
      Object.keys(c.name).forEach((k) => c.name[k] && (c.name[k] += ' (copie)'));
      D.products.splice(i + 1, 0, c);
      D.products.forEach((x, k) => (x.order = k));
      S.onChange();
      toast('Produit dupliqué (masqué tant que vous ne l’affichez pas).', 'ok');
      edit(i + 1);
    });
    body.querySelector('#pe-del').addEventListener('click', () => {
      if (!confirmDo(`Supprimer « ${tf(p.name)} » ?`)) return;
      D.products.splice(i, 1);
      D.products.forEach((x, k) => (x.order = k));
      D.film.forEach((f) => f.product === p.id && (f.product = ''));
      S.onChange();
      closeDrawer();
      toast('Produit supprimé.');
    });
  }

  render();
}
