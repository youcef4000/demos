# Check-list de livraison

> À cocher avant d'annoncer « c'est en ligne » au client.

## Fonctionnement
- [ ] Chaque page s'ouvre, chaque lien et chaque bouton marche
- [ ] Formulaires testés : le message arrive vraiment (et pas en spam)
- [ ] Boutons WhatsApp (`https://wa.me/213…`) et téléphone (`tel:`) testés depuis un téléphone
- [ ] Testé sur un vrai téléphone Android **et** un iPhone (Chrome et Safari)
- [ ] Testé en 4G (pas seulement en Wi-Fi)

## Qualité
- [ ] Lighthouse mobile ≥ 90 (performance, accessibilité, bonnes pratiques, SEO)
- [ ] Images en WebP, compressées, avec `alt`
- [ ] Aucune erreur rouge dans la Console (F12)
- [ ] `prefers-reduced-motion` respecté
- [ ] Textes relus (fautes, numéros, horaires, prix)

## Partage et référencement
- [ ] `<title>`, `description`, Open Graph et image 1200 × 630
- [ ] Aperçu vérifié (opengraph.xyz, envoi WhatsApp de test)
- [ ] Favicon et icône d'app
- [ ] Search Console + sitemap envoyé
- [ ] Fiche Google Business Profile reliée au site

## Sécurité
- [ ] HTTPS actif (cadenas)
- [ ] Aucune clé secrète dans le code ni dans le dépôt
- [ ] Supabase : RLS activée sur **chaque** table, testée avec deux comptes
- [ ] 2FA activée sur les comptes (hébergeur, domaine, Supabase, GitHub)
- [ ] `Content-Security-Policy` (en-tête ou balise `<meta>`)

## Légal
- [ ] Mentions légales
- [ ] Politique de confidentialité (si collecte de données)
- [ ] Licences des polices, images, icônes vérifiées

## Propriété et accès
- [ ] Nom de domaine **au nom du client**, renouvellement automatique activé
- [ ] Hébergement et Supabase au nom du client (toi invité comme collaborateur)
- [ ] Dépôt GitHub transféré ou partagé selon le contrat
- [ ] Mots de passe transmis de façon sûre (jamais par message en clair)

## Après la mise en ligne
- [ ] Surveillance (UptimeRobot) active
- [ ] Statistiques installées
- [ ] Sauvegarde de la base programmée et testée
- [ ] Guide d'utilisation remis + formation de 30 min faite
- [ ] Offre de maintenance proposée
- [ ] Demande d'avis **réel** et de recommandation après 2 semaines
