// Traduction (ar) du module dv12 — طوّر Claude.
// Titres, présentation et points essentiels ; les scènes restent en français pour l'instant (voir i18n-check.mjs).
export default {
  "modules": {
    "dv12": {
      "title": "طوّر Claude",
      "pitch": "CLAUDE.md وAGENTS.md، الـ skills، الـ plugins، MCP والموصّلات، الوكلاء الفرعيون، الـ hooks والجلسات المتوازية."
    }
  },
  "lessons": {
    "dv12-l1": {
      "title": "CLAUDE.md وAGENTS.md: ذاكرة المشاريع",
      "key": [
        "~/.claude/CLAUDE.md (شخصي)، CLAUDE.md المشروع، AGENTS.md (معيار مفتوح يقرأه Claude Code أيضًا).",
        "القواعد المشتركة في AGENTS.md، تُستورَد في CLAUDE.md بـ @AGENTS.md.",
        "سطر إضافي لكل خطأ متكرر؛ قواعد قابلة للتحقق؛ أقل من 100 سطر."
      ]
    },
    "dv12-l2": {
      "title": "تطبيق · إنشاء skill وتثبيتها",
      "key": [
        "الـ skill = مجلد فيه SKILL.md (+ قوالب، سكربتات)؛ ~/.claude/skills/ (شخصي) أو .claude/skills/ (المشروع).",
        "الترويسة: name وdescription (ماذا ومتى)؛ Claude يحمّلها وحده أو عبر /الاسم.",
        "claude.ai: القدرات (تنفيذ الكود) ← Customize ← Skills ← Upload (ZIP)؛ متزامنة مع Claude Code."
      ]
    },
    "dv12-l3": {
      "title": "الـ plugins: قدرات خارقة بأمر واحد",
      "key": [
        "/plugin (الكتالوج)، /plugin install <plugin>@claude-plugins-official، /plugin marketplace add، /reload-plugins.",
        "النطاقات: user (~/.claude/settings.json)، project (.claude/settings.json)، local (.claude/settings.local.json).",
        "الـ plugin قد ينفّذ كودًا: اقرأ التفاصيل، مصادر موثوقة، أزل ما لا تستعمله."
      ]
    },
    "dv12-l4": {
      "title": "MCP والموصّلات: ربط Claude بأدواتك",
      "key": [
        "أدوات MCP مفيدة: Supabase وGitHub وPlaywright وContext7 وFigma وSentry.",
        "claude mcp add --transport http <name> <url>؛ claude mcp add <name> -- <command>؛ --scope project؛ /mcp؛ claude mcp list.",
        "أدنى صلاحيات: قراءة فقط، مشروع واحد، لا مفتاح بنص واضح؛ والموصّلات في claude.ai."
      ]
    },
    "dv12-l5": {
      "title": "طرق عمل متقدمة: وكلاء فرعيون وhooks وجلسات متوازية",
      "key": [
        "الوكلاء الفرعيون (/agents)، الـ hooks (/hooks)، جلسات متوازية على فروع، claude.ai/code و@claude على GitHub.",
        "hook من نوع PostToolUse + matcher \"Edit|Write\": إجراء تلقائي بعد كل تعديل.",
        "/install-github-app لاستدعاء @claude في GitHub؛ claude -p للسكربتات والـ Actions."
      ]
    }
  }
};
