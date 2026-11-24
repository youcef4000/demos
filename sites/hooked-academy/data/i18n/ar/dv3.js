// Traduction (ar) du module dv3 — جولة في المنصات.
// Titres, présentation et points essentiels ; les scènes restent en français pour l'instant (voir i18n-check.mjs).
export default {
  "modules": {
    "dv3": {
      "title": "جولة في المنصات",
      "pitch": "Claude وClaude Code وCodex وGitHub وSupabase ومنصات الاستضافة ومولّدات التطبيقات: أين تنقر ولماذا."
    }
  },
  "lessons": {
    "dv3-l1": {
      "title": "Claude.ai: المحادثة، المشاريع، الـ artifacts، الـ skills، الموصّلات",
      "key": [
        "Claude.ai: المحادثة، المشاريع، الـ artifacts، الـ skills، الموصّلات، الذاكرة.",
        "مشروع لكل زبون: تعليمات + ملفات = سياق دائم.",
        "الـ artifacts: نموذج قابل للمشاركة برابط في دقائق."
      ]
    },
    "dv3-l2": {
      "title": "Claude Code: الوكيل الذي يبني معك",
      "key": [
        "Claude Code: تطبيق سطح المكتب (تبويب Code)، claude.ai/code (سحابة + GitHub)، الهاتف.",
        "/init، وضع الخطة، /clear، /compact، الرجوع للخلف، /mcp، /plugin، /skills.",
        "اقرأ قبل القبول، لا كلمة مرور في المحادثة أبدًا، ودائمًا داخل مجلد المشروع."
      ]
    },
    "dv3-l3": {
      "title": "Codex: الوكيل الآخر",
      "key": [
        "Codex: وكيل البرمجة من OpenAI، مضمَّن مع ChatGPT Plus؛ تطبيق سطح مكتب، سحابة مرتبطة بـ GitHub، هاتف.",
        "يقرأ Codex ملف AGENTS.md كما يقرأ Claude Code ملف CLAUDE.md.",
        "نفس المنهجية مع الاثنين؛ ويمكن لوكيل أن يراجع عمل الآخر."
      ]
    },
    "dv3-l4": {
      "title": "Git وGitHub: الجولة",
      "key": [
        "المستودع: Code وCommits وBranches وPull requests وIssues وActions وPages وSettings.",
        "تعديل ← commit ← push ← نشر تلقائي.",
        "الأمان: المصادقة الثنائية، فحص الأسرار وحماية الـ push، مستودعات الزبائن خاصة، منظمة احترافية."
      ]
    },
    "dv3-l5": {
      "title": "Supabase: الجولة",
      "key": [
        "Supabase: Table Editor وSQL Editor وAuthentication وStorage وEdge Functions وAdvisors وAPI Keys وLogs.",
        "المجاني: مشروعان نشطان، ≈ 500 ميغابايت، إيقاف مؤقت بعد 7 أيام دون نشاط؛ Pro ≈ 25 دولارًا شهريًا.",
        "الأمان يُضبط: RLS على كل جدول، Advisors، المفتاح السري في الخادم فقط."
      ]
    },
    "dv3-l6": {
      "title": "Vercel وNetlify وCloudflare وRailway: الجولة",
      "key": [
        "المبدأ المشترك: New project ← استيراد من GitHub ← المتغيرات ← Deploy؛ كل push يعيد النشر.",
        "Pages (العروض)، Cloudflare/Netlify (المواقع)، Vercel (Next.js، الخطة المجانية غير تجارية)، Railway/Render (الخوادم).",
        "دائمًا حدّ للإنفاق على الخدمات المحسوبة حسب الاستهلاك."
      ]
    },
    "dv3-l7": {
      "title": "Lovable وBolt وv0 وReplit: مولّدات التطبيقات",
      "key": [
        "Lovable (بسيط، Supabase)، Bolt (سريع، هاتف)، v0 (واجهات React)، Replit (الكل في مكان واحد).",
        "الفخاخ: الرصيد، كود فوضوي، أمان غير مضمون.",
        "الحلول: طلبات دقيقة، GitHub منذ البداية، مراجعة بـ Claude Code."
      ]
    }
  }
};
