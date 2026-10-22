// En-têtes de sécurité des pages de Hooked Academy (CSP par page). Mêmes règles que sites/_headers.
// Scripts : ceux du site, et des bibliothèques précises de cdn.jsdelivr.net (versions fixées, chemins exacts) :
// une injection ne pourrait pas charger un autre fichier du CDN.

const CDN = ['gsap@3.15.0', 'lenis@1.3.26', 'three@0.186.1'].map((p) => `https://cdn.jsdelivr.net/npm/${p}/`).join(' ');
// Scripts écrits dans app/index.html (thème clair/sombre, carte d'import de three.js)
const APP_INLINE = "'sha256-EmMgDuSPsf8i/G1gESH9kQacuzGnGtwDYsmwL0Z5Stg=' 'sha256-BPESV3/Fk0pDTWIPlYtNDpxzro/i1ly6tFS2HFNkJLo='";

const csp = ({ script = '', frameAncestors = "'self'", frames = "'self'", form = "'self'" } = {}) =>
  [
    "default-src 'self'",
    `script-src 'self' ${CDN}${script ? ` ${script}` : ''}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob:",
    "media-src 'self' blob:",
    "connect-src 'self'",
    `frame-src ${frames}`,
    "worker-src 'self'",
    "manifest-src 'self'",
    "base-uri 'none'",
    `form-action ${form}`,
    "object-src 'none'",
    `frame-ancestors ${frameAncestors}`,
  ].join('; ');

const PERMS = 'camera=(), microphone=(), geolocation=(), payment=(), usb=()';

/** En-têtes propres au fichier demandé (chemin depuis la racine du site, ex. « /admin/index.html »). */
export function headersFor(rel) {
  if (rel === '/index.html') return { 'content-security-policy': csp(), 'permissions-policy': PERMS };
  if (rel.startsWith('/app/') && rel.endsWith('.html')) return { 'content-security-policy': csp({ script: APP_INLINE }), 'permissions-policy': PERMS };
  if (rel.startsWith('/admin/') && rel.endsWith('.html'))
    return { 'content-security-policy': csp({ frameAncestors: "'none'" }), 'permissions-policy': 'camera=(), microphone=(self), geolocation=(), payment=(), usb=()', 'x-frame-options': 'DENY' };
  if (rel.startsWith('/motion/') && rel.endsWith('.html')) return { 'content-security-policy': csp({ frames: "'none'", form: "'none'" }) };
  if (rel.endsWith('.html')) return { 'content-security-policy': csp(), 'permissions-policy': PERMS };
  return {};
}
