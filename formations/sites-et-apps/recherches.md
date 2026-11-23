# Recherches — ce qui a changé et ce qui compte (novembre 2026)

> Synthèse des recherches faites pour écrire la Formation Sites & Apps, avec les sources.
> Les chiffres viennent souvent d'éditeurs d'outils de sécurité : ils sont cités comme tels dans les leçons
> (« selon une analyse publiée en… »). À revérifier avant chaque nouvelle session de formation.

## 1. Le vibe coding en 2026

- **Origine** : Andrej Karpathy, février 2025 (« on décrit, l'IA écrit, on juge le résultat »). **Mot de l'année 2025**
  du dictionnaire Collins.
- **Ce qui a changé** : on ne cherche plus le « prompt magique ». Les pros parlent de **spec-driven development** (une
  spec courte, des critères testables) et de **context engineering** (CLAUDE.md / AGENTS.md, doc à jour, sessions courtes).
- **Outils de spec** très suivis : `github/spec-kit` (151 k étoiles), `Fission-AI/OpenSpec` (75 k).
- **Règle retenue pour la formation** : la rigueur suit le risque. Prototype libre, démo relue, production avec spec,
  tests et sécurité (argent, données personnelles, comptes, clés).
- **AGENTS.md** est devenu le format ouvert partagé par les agents (Linux Foundation / Agentic AI Foundation). Claude
  Code le lit aussi ; la bonne pratique : règles communes dans AGENTS.md, importées dans CLAUDE.md (`@AGENTS.md`).

## 2. Claude et Claude Code (vérifié dans la documentation officielle)

- **Skills** : `~/.claude/skills/<nom>/SKILL.md` (perso), `.claude/skills/<nom>/SKILL.md` (projet), dans un plugin
  (`/<plugin>:<skill>`). En-tête `name` + `description` (quoi + quand). Appel manuel `/nom`. claude.ai : Capacités
  (exécution de code) → Customize → Skills → Upload (ZIP) ; synchronisés avec Claude Code (`/skills`).
- **Plugins** : marketplace officiel `claude-plugins-official` ajouté par défaut ; `/plugin`, `/plugin install
  x@claude-plugins-official`, `/plugin marketplace add compte/depot`, portées user / project / local, `/reload-plugins`.
- **MCP** : `claude mcp add --transport http <nom> <url>`, `claude mcp add <nom> -- <commande>`, `--scope project`
  (`.mcp.json`), `/mcp` pour se connecter, `claude mcp list`. MCP Supabase officiel : `https://mcp.supabase.com/mcp`.
- **Installation** : `curl -fsSL https://claude.ai/install.sh | bash` ; Windows `irm https://claude.ai/install.ps1 | iex`.
- **Nouveautés récentes** (changelog novembre 2026) : mode auto, « Code Mode » expérimental, équipes d'agents
  (expérimental), hooks plus fins, `/fork` dans VS Code. Non enseignés en détail (trop mouvants) : la formation enseigne
  les briques stables (CLAUDE.md, mode plan, skills, plugins, MCP, sous-agents, hooks, sessions parallèles, web).

## 3. Git et GitHub

- **Git 3.0** se prépare : branche par défaut **main** et SHA-256 par défaut ; la formation configure déjà
  `init.defaultBranch main`.
- **GitHub** : Copilot agent et « Agent HQ » (Claude et Codex lancés depuis GitHub), application Copilot de bureau.
  Pour la formation : secret scanning + push protection, Dependabot, Actions (tests à chaque PR), Pages.
- Dépôts **déplacés** à connaître : React est maintenant `react/react`, React Native `react/react-native`, Prisma
  `prisma/orm`, Convex `convex/convex-backend`, la roadmap développeur `nilbuild/developer-roadmap`.

## 4. La pile web de 2026

React 19, Next.js 16 (Turbopack par défaut), Vite 8 (create-vite 9 vérifié en session réelle), Tailwind CSS 4
(configuration en CSS), shadcn/ui, TypeScript, Supabase. Hébergeurs : prix relevés en novembre 2026 (voir aide-mémoire).

**Supabase 2026** : nouvelles clés `sb_publishable_…` / `sb_secret_…` (les anciennes anon / service_role disparaissent
fin 2026) ; **une nouvelle table n'est plus exposée automatiquement à l'API** (par défaut sur les nouveaux projets depuis
le 30/05/2026, sur tous depuis le 30/10/2026) ; connexion par **passkeys** ; éditeur RLS assisté par IA.

## 5. Sécurité : pourquoi c'est le chapitre qui fait la différence

- **Analyses d'apps vibe-codées** (éditeurs de sécurité, 2026) : sur environ 31 000 apps analysées en août 2026, **57 %**
  des apps Supabase joignables laissaient lire leurs tables sans connexion ; d'autres analyses donnent 47 à 70 % de RLS
  manquante, et des centaines de clés (Supabase, OpenAI, Stripe) dans le code du navigateur.
- **Incident Moltbook** (février 2026, rapporté par Wiz) : environ 1,5 million de jetons d'API exposés par une base
  Supabase sans RLS.
- **OWASP Top 10 2025** : A01 Contrôle d'accès, A02 Configuration, A03 Chaîne d'approvisionnement (nouveau),
  A04 Cryptographie, A05 Injection, A06 Conception, A07 Authentification, A08 Intégrité, A09 Journalisation et alertes,
  A10 Conditions exceptionnelles (nouveau).
- **Chaîne d'approvisionnement** : le ver **Shai-Hulud** (septembre 2025, plus de 500 paquets npm, nouvelle vague en
  novembre 2025) ; le **slopsquatting** (paquets inventés par l'IA puis publiés par des pirates, ex. « react-codeshift »
  en janvier 2026) ; la faille **React2Shell** (CVE-2025-55182, décembre 2025, note 10/10) dans React et Next.js.
- **Agents IA et MCP** : injection de prompt, « tool poisoning », dizaines de CVE sur des serveurs MCP début 2026 ;
  d'où les règles « lire les permissions, sources de confiance, minimum de droits ».

## 6. Inspiration : la sélection

| Site | Pour |
|---|---|
| **Awwwards** | Les sites primés (souvent expérimentaux) |
| **Recent** (recent.design, ex-Godly) | Les sites les plus créatifs, avec aperçus animés |
| **Motionsites** (motionsites.ai) | Bibliothèque de prompts, fonds animés et modèles prêts pour Lovable, Cursor, Claude |
| **Codrops** | Effets créatifs expliqués avec leur code |
| **Mobbin**, **Refero** | Écrans d'applications réelles (UX) |
| **Land-book**, **Lapa Ninja**, **One Page Love** | Landing pages par secteur |
| **SiteInspire**, **Minimal Gallery** | Sites sobres et élégants |
| **CodePen** | Expériences front à étudier |
| **CSS Design Awards** | Concours, alternative à Awwwards |

## 7. Les meilleurs dépôts GitHub par domaine (étoiles relevées le 23/11/2026)

| Domaine | Dépôt | Étoiles | Pour |
|---|---|---|---|
| Apprendre | `codecrafters-io/build-your-own-x` | 565 k | Reconstruire des outils pour comprendre |
| Apprendre | `freeCodeCamp/freeCodeCamp` | 460 k | Le cursus gratuit le plus suivi |
| Apprendre | `nilbuild/developer-roadmap` | 373 k | Les feuilles de route par métier |
| Apprendre | `practical-tutorials/project-based-learning` | 290 k | Apprendre par projets |
| Apprendre | `public-apis/public-apis` | 501 k | Des API gratuites pour s'entraîner |
| Claude / agents | `obra/superpowers` | 325 k | Skills et méthode pour agents de code |
| Claude / agents | `anthropics/skills` | 199 k | Les skills officiels |
| Claude / agents | `anthropics/claude-code` | 157 k | Claude Code (issues, changelog) |
| Claude / agents | `github/spec-kit` | 151 k | Développement guidé par les specs |
| Claude / agents | `punkpeye/awesome-mcp-servers` | 98 k | Annuaire de serveurs MCP |
| Claude / agents | `upstash/context7` | 65 k | Doc à jour des librairies pour l'IA |
| Claude / agents | `hesreallyhim/awesome-claude-code` | 59 k | Ressources Claude Code |
| Claude / agents | `anthropics/claude-plugins-official` | 48 k | Marketplace officiel de plugins |
| Claude / agents | `microsoft/playwright-mcp` | 40 k | Claude pilote un navigateur |
| Git | `github/gitignore` | 176 k | Modèles de .gitignore |
| Git | `jesseduffield/lazygit` | 84 k | Git en interface terminal |
| Git | `firstcontributions/first-contributions` | 57 k | Première contribution open source |
| Git | `k88hudson/git-flight-rules` | 43 k | Que faire quand Git tourne mal |
| Front | `react/react` | 253 k | React |
| Front | `vercel/next.js` | 144 k | Next.js |
| Front | `shadcn-ui/ui` | 129 k | Composants à copier |
| Front | `tailwindlabs/tailwindcss` | 99 k | Tailwind CSS |
| Front | `vitejs/vite` | 84 k | Vite |
| Front | `colinhacks/zod` | 44 k | Validation des données |
| Front | `magicuidesign/magicui` | 23 k | Composants animés |
| Backend | `n8n-io/n8n` | 212 k | Automatisations |
| Backend | `supabase/supabase` | 115 k | Base, auth, fichiers |
| Backend | `appwrite/appwrite` | 59 k | Alternative à Supabase |
| Backend | `prisma/orm` | 48 k | ORM |
| Backend | `drizzle-team/drizzle-orm` | 36 k | ORM léger |
| Backend | `honojs/hono` | 33 k | Petit framework serveur |
| Backend | `better-auth/better-auth` | 31 k | Authentification |
| Motion | `mrdoob/three.js` | 119 k | 3D |
| Motion | `heygen-com/hyperframes` | 89 k | Vidéos en HTML |
| Motion | `remotion-dev/remotion` | 75 k | Vidéos en React |
| Motion | `juliangarnier/anime` | 75 k | Animations JS légères |
| Motion | `motiondivision/motion` | 35 k | Motion (ex-Framer Motion) |
| Motion | `greensock/GSAP` | 31 k | GSAP |
| Motion | `darkroomengineering/lenis` | 17 k | Défilement doux |
| Héberger | `awesome-selfhosted/awesome-selfhosted` | 340 k | Tout ce qui s'héberge soi-même |
| Héberger | `louislam/uptime-kuma` | 95 k | Surveillance auto-hébergée |
| Héberger | `caddyserver/caddy` | 79 k | Serveur web à HTTPS automatique |
| Héberger | `coollabsio/coolify` | 66 k | Le « Railway » sur ton VPS |
| Héberger | `umami-software/umami` | 40 k | Statistiques respectueuses |
| Sécurité | `aquasecurity/trivy` | 40 k | Scanner de failles |
| Sécurité | `OWASP/CheatSheetSeries` | 34 k | Les fiches de sécurité de référence |
| Sécurité | `gitleaks/gitleaks` | 31 k | Détecter les secrets dans Git |
| Sécurité | `trufflesecurity/trufflehog` | 30 k | Détecter les secrets |
| Sécurité | `semgrep/semgrep` | 18 k | Analyse de code |
| Sécurité | `juice-shop/juice-shop` | 15 k | Application volontairement vulnérable (s'entraîner) |
| Sécurité | `google/osv-scanner` | 12 k | Failles des dépendances |
| Qualité | `microsoft/playwright` | 101 k | Tests de navigateur |
| Qualité | `GoogleChrome/lighthouse` | 31 k | Audit qualité |
| Qualité | `vitest-dev/vitest` | 17 k | Tests unitaires |
| Mobile | `react/react-native` | 127 k | Apps natives |
| Mobile | `expo/expo` | 54 k | Apps natives simplifiées |
| Mobile | `ionic-team/capacitor` | 17 k | Emballer une app web |
| Design | `excalidraw/excalidraw` | 136 k | Schémas |
| Design | `penpot/penpot` | 63 k | Alternative open source à Figma |

> `pocketbase/pocketbase` (62 k) apparaît **archivé** sur GitHub en novembre 2026 : à éviter pour un nouveau projet.

## Sources

- Claude Code — [skills](https://code.claude.com/docs/en/skills), [plugins](https://code.claude.com/docs/en/discover-plugins),
  [MCP](https://code.claude.com/docs/en/mcp), [installation](https://code.claude.com/docs/en/setup),
  [changelog](https://code.claude.com/docs/en/changelog) ; skills dans claude.ai :
  [support Claude](https://support.claude.com/en/articles/12512180-using-skills-in-claude)
- AGENTS.md : [InfoWorld](https://infoworld.com/article/4224410/claude-code-now-also-accepts-instructions-in-openais-agents-md-format.html),
  [Socket](https://socket.dev/blog/agents-md-gains-traction-as-an-open-format-for-ai-coding-agents)
- Vibe coding : [Wikipedia](https://en.wikipedia.org/wiki/Vibe_coding),
  [The Register (Collins)](https://www.theregister.com/2025/11/06/vibe_coding_escape_the_clutches/),
  [SitePoint](https://www.sitepoint.com/vibe-coding-2026-complete-guide/)
- Sécurité : [OWASP Top 10 2025](https://owasp.org/Top10/2025/0x00_2025-Introduction/),
  [Vibe-eval, août 2026](https://vibe-eval.com/updates/vibe-coding-security-monthly-aug-2026/),
  [Symbiotic Security](https://www.symbioticsec.ai/blog/we-scanned-1-072-vibe-coded-apps-98-had-security-flaws),
  [SupaExplorer](https://supaexplorer.com/cybersecurity-insight-report-january-2026),
  [Socket — slopsquatting](https://socket.dev/glossary/slopsquatting), [Socket — Shai-Hulud](https://socket.dev/glossary/shai-hulud.md),
  [React2Shell](https://react2shell.com/), [Microsoft — MCP 2026](https://techcommunity.microsoft.com/blog/microsoft-security-blog/the-state-of-mcp-security-in-2026/4531327),
  [CSA — MCP](https://labs.cloudsecurityalliance.org/agentic/agentic-mcp-security-best-practices/)
- Supabase : [pricing](https://supabase.com/pricing), [pause des projets](https://supabase.com/docs/guides/platform/free-project-pausing.md),
  [nouvelles clés](https://supabase.com/docs/guides/getting-started/migrating-to-new-api-keys),
  [MCP](https://supabase.com/docs/guides/ai-tools/mcp.md), [changelog](https://supabase.com/changelog)
- Hébergement : [Railway](https://docs.railway.com/pricing/plans), [Render](https://render.com/docs/free),
  [Vercel fair use](https://vercel.com/docs/limits/fair-use-policy)
- Git : [Breaking changes Git 3.0](https://git-scm.com/docs/BreakingChanges.html) ; GitHub :
  [Agent HQ](https://www.i-programmer.info/news/105-artificial-intelligence/18651-github-adds-claude-and-codex-to-agent-hq.html)
- Pile 2026 : [FocusReactive — Vite vs Next.js](https://focusreactive.com/blog/vite-vs-nextjs-when-to-use-which-an-honest-comparison/),
  [shadcn/ui — Tailwind v4](https://ui.shadcn.com/docs/tailwind-v4)
- Générateurs : [Technically](https://technically.dev/posts/vibe-coding-tool-comparison) ; inspiration :
  [Motionsites (Product Hunt)](https://www.producthunt.com/products/motionsites), [Recent (ex-Godly)](https://uiuxshowcase.com/resources/recent-design-best-web-design-inspiration/)
- Paiement Algérie : [Chargily Pay V2](https://dev.chargily.com/)
- Étoiles GitHub : API de recherche GitHub, relevé du 23/11/2026.
