// Envoi des e-mails VALIDÉS (boîte d'envoi) par la boîte du cabinet, en SMTP.
// Appelé uniquement par la route « valider et envoyer » du noyau, après le clic d'un membre du cabinet.
let transport;

async function obtenirTransport() {
  if (transport) return transport;
  const { SMTP_HOTE, SMTP_PORT, SMTP_UTILISATEUR, SMTP_MOT_DE_PASSE } = process.env;
  if (!SMTP_HOTE || !SMTP_UTILISATEUR || !SMTP_MOT_DE_PASSE) return null;
  const { default: nodemailer } = await import('nodemailer');
  const port = Number(SMTP_PORT) || 465;
  transport = nodemailer.createTransport({ host: SMTP_HOTE, port, secure: port === 465, auth: { user: SMTP_UTILISATEUR, pass: SMTP_MOT_DE_PASSE }, requireTLS: port !== 465 });
  return transport;
}

export async function envoyerEmail(envoi) {
  const t = await obtenirTransport();
  if (!t) return { ok: false, erreur: 'messagerie du cabinet non configurée (SMTP_HOTE, SMTP_UTILISATEUR, SMTP_MOT_DE_PASSE dans .env)' };
  try {
    const r = await t.sendMail({
      from: process.env.SMTP_EXPEDITEUR || process.env.SMTP_UTILISATEUR,
      to: envoi.destinataire,
      subject: envoi.objet || 'Message du cabinet',
      text: envoi.corps,
      headers: { 'X-Cabinet-Envoi': envoi.id },
    });
    return { ok: true, idMessage: r.messageId };
  } catch (e) {
    return { ok: false, erreur: e.message };
  }
}
