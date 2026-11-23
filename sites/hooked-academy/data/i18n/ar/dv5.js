// Traduction (ar) du module dv5 — Git وGitHub.
// Titres, présentation et points essentiels ; les scènes restent en français pour l'instant (voir i18n-check.mjs).
export default {
  "modules": {
    "dv5": {
      "title": "Git وGitHub",
      "pitch": "الحفظ، الرجوع للخلف، العمل بالفروع، حماية الأسرار، إيجاد أفضل المستودعات، النشر التلقائي."
    }
  },
  "lessons": {
    "dv5-l1": {
      "title": "Git ببساطة",
      "key": [
        "Git = نقاط حفظ (commits) يمكن الرجوع إليها.",
        "الدورة: تعديل ← git add ← git commit ← git push.",
        "رسالة الـ commit تقول ما الذي تغيّر."
      ]
    },
    "dv5-l2": {
      "title": "تطبيق · أول مستودع لك",
      "key": [
        "git init -b main وgit status وgit add . وgit commit -m \"…\" وgit log --oneline.",
        "« ?? » = ملف غير متتبَّع؛ بعد الـ commit يصبح محفوظًا.",
        "إلى GitHub: git remote add origin … ثم git push -u origin main (أو gh repo create … --push)."
      ]
    },
    "dv5-l3": {
      "title": "تطبيق · الفروع والدمج والرجوع للخلف",
      "key": [
        "git checkout -b <فرع> للتجربة، git merge للدمج.",
        "git revert يلغي commit بإضافة commit معاكس: يبقى السجل كاملًا.",
        "Pull request = فرع يُراجَع قبل الدمج؛ معاينة لكل فرع على Vercel وNetlify وCloudflare."
      ]
    },
    "dv5-l4": {
      "title": "تطبيق · الأسرار: .gitignore و.env",
      "key": [
        "المفاتيح في .env المذكور في .gitignore؛ وملف .env.example ينشر الأسماء فقط.",
        "التحقق: git check-ignore -v .env وgit ls-files وgit grep.",
        "مفتاح منشور: ألغِه وأنشئ مفتاحًا جديدًا؛ حذف الـ commit لا يكفي."
      ]
    },
    "dv5-l5": {
      "title": "إيجاد أفضل مستودعات GitHub",
      "key": [
        "المرشحات: stars:>500 وpushed:>date وtopic: وlicense:mit وarchived:false؛ gh search repos.",
        "مراجع: shadcn-ui/ui وsupabase/supabase وanthropics/skills وgithub/spec-kit وOWASP/CheatSheetSeries.",
        "قبل الاستعمال: الرخصة، الصيانة الحديثة، النقاشات النشطة، تدقيق بـ Claude."
      ]
    },
    "dv5-l6": {
      "title": "GitHub Actions وPages: النشر التلقائي",
      "key": [
        "git push ← GitHub Actions ← بناء الموقع ← على الإنترنت خلال دقيقة إلى دقيقتين.",
        "ملف .github/workflows/*.yml يصف الروبوت (المُشغِّل، الخطوات).",
        "الـ Actions تنشر وتختبر وتتحقق من الأمان وترسل تقارير."
      ]
    }
  }
};
