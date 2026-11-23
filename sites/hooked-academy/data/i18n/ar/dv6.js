// Traduction (ar) du module dv6 — النشر على الإنترنت.
// Titres, présentation et points essentiels ; les scènes restent en français pour l'instant (voir i18n-check.mjs).
export default {
  "modules": {
    "dv6": {
      "title": "النشر على الإنترنت",
      "pitch": "GitHub Pages وVercel وNetlify وCloudflare وRailway وRender، اسم النطاق، الـ DNS، والـ VPS للمحترفين."
    }
  },
  "lessons": {
    "dv6-l1": {
      "title": "أنواع الاستضافة",
      "key": [
        "ثابتة (Pages وCloudflare وNetlify وVercel)، PaaS (Railway وRender)، BaaS (Supabase)، VPS (+ Coolify).",
        "الشجرة: بلا خادم ← ثابتة؛ بيانات ← + Supabase؛ خادم ← Railway/Render؛ تطبيقات كثيرة ← VPS.",
        "التكلفة الكاملة: حلول قابلة للنقل، حسابات باسم الزبون، حدود للإنفاق."
      ]
    },
    "dv6-l2": {
      "title": "تطبيق · GitHub Pages خطوة بخطوة",
      "key": [
        "مستودع عام ← Settings ← Pages ← Deploy from a branch ← main / (root) ← Save.",
        "العنوان: account.github.io/repo؛ يُعاد النشر مع كل push خلال دقيقة إلى دقيقتين.",
        "مسارات نسبية (./css/style.css): الموقع يعيش داخل مجلد فرعي."
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
      "title": "تطبيق · خادم حقيقي على Railway أو Render",
      "key": [
        "الخادم يستمع على process.env.PORT؛ مسار للصحة؛ 404 لكل ما عداه.",
        "الاختبار محليًا: npm start ثم curl -i localhost:3000/api/sante ← 200 {\"ok\":true}.",
        "Railway: تجربة بـ 5 دولارات، Free بدولار شهريًا، Hobby بـ 5 دولارات؛ Render: نوم بعد ~15 دقيقة، والقاعدة المجانية تُحذف بعد 30 يومًا. دائمًا حدّ للإنفاق."
      ]
    },
    "dv6-l5": {
      "title": "اسم النطاق والـ DNS",
      "key": [
        "الشراء: Cloudflare Registrar وNamecheap وPorkbun؛ نطاق .dz عبر مسجّل معتمد من NIC.dz.",
        "الـ DNS: A (عنوان IP)، CNAME (اسم آخر)، TXT (التحقق، SPF)، MX (البريد).",
        "للزبون: النطاق باسمه، تجديد تلقائي، التحقق من حسابات التواصل، الـ DNS في Cloudflare."
      ]
    },
    "dv6-l6": {
      "title": "المستوى المحترف: VPS وDocker وCaddy وCoolify",
      "key": [
        "VPS (5–20 دولارًا شهريًا) + Docker (صندوق لكل تطبيق) + Caddy (HTTPS تلقائي)؛ Coolify أو Dokploy للواجهة.",
        "Caddyfile: domain { reverse_proxy localhost:3000 }.",
        "المسؤوليات: مفاتيح SSH، جدار ناري 22/80/443، تحديثات، نسخ احتياطية خارج الخادم."
      ]
    }
  }
};
