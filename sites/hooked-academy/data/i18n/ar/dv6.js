// Traduction (ar) du module dv6 — النشر على الإنترنت.
// Titres, présentation et points essentiels ; les scènes restent en français pour l'instant (voir i18n-check.mjs).
export default {
  "modules": {
    "dv6": {
      "title": "النشر على الإنترنت",
      "pitch": "GitHub Pages وVercel وNetlify وCloudflare وRailway وRender واسم النطاق والـ DNS: على الإنترنت ببضع نقرات."
    }
  },
  "lessons": {
    "dv6-l1": {
      "title": "أنواع الاستضافة",
      "key": [
        "ثابت (Pages وCloudflare وNetlify وVercel)، PaaS (Railway وRender)، BaaS (Supabase).",
        "الشجرة: بلا خادم ← ثابت؛ بيانات ← + Supabase؛ خادم ← Railway/Render؛ زبون ← حسابات باسمه.",
        "التكلفة الإجمالية: حلول قابلة للنقل، حسابات باسم الزبون، حدود للإنفاق."
      ]
    },
    "dv6-l2": {
      "title": "تطبيق · GitHub Pages خطوة بخطوة",
      "key": [
        "مستودع عام ← Settings ← Pages ← Deploy from a branch ← main / (root) ← Save، أو طلب واحد لوكيلك.",
        "العنوان: compte.github.io/depot؛ يُعاد النشر مع كل push خلال دقيقة إلى دقيقتين.",
        "مسارات نسبية في كل مكان: الموقع يعيش في مجلد فرعي (قاعدة تُكتب في CLAUDE.md)."
      ]
    },
    "dv6-l3": {
      "title": "Vercel وNetlify وCloudflare Pages",
      "key": [
        "Vercel (Next.js، الخطة المجانية غير تجارية)، Netlify (رصيد)، Cloudflare Pages (سخية).",
        "استيراد من GitHub ← اكتشاف البناء ← المتغيرات ← على الإنترنت؛ عنوان معاينة لكل فرع.",
        "VITE_ وNEXT_PUBLIC_ = عام: لا مفتاح سري بهذه البادئة أبدًا."
      ]
    },
    "dv6-l4": {
      "title": "تطبيق · خادم على الإنترنت عبر Railway",
      "key": [
        "يُنشئ وكيلك الـ API ويختبرها بنفسه (عنوان الصحة، 404 للباقي) ويجهّزها لـ Railway.",
        "Railway: New Project ← Deploy from GitHub ← Variables ← Generate Domain ← حدّ للإنفاق.",
        "Railway: تجربة 5 $، Free بـ 1 $ شهريًا، Hobby بـ 5 $ شهريًا؛ Render: يدخل في سبات بعد ~15 دقيقة، وتُحذف قاعدته المجانية بعد 30 يومًا."
      ]
    },
    "dv6-l5": {
      "title": "اسم النطاق والـ DNS",
      "key": [
        "الشراء: Cloudflare Registrar وNamecheap وPorkbun؛ نطاق .dz عبر مسجّل معتمد من NIC.dz.",
        "الـ DNS: A (عنوان IP)، CNAME (اسم آخر)، TXT (التحقق، SPF)، MX (البريد).",
        "للزبون: النطاق باسمه، تجديد تلقائي، التحقق من حسابات التواصل، الـ DNS في Cloudflare."
      ]
    }
  }
};
