// Traduction (ar) du module dv5 — الحفظ مع GitHub.
// Titres, présentation et points essentiels ; les scènes restent en français pour l'instant (voir i18n-check.mjs).
export default {
  "modules": {
    "dv5": {
      "title": "الحفظ مع GitHub",
      "pitch": "الحفظ، الرجوع للخلف، التجربة بلا مخاطرة، حماية الأسرار والنشر التلقائي: بمجرد أن تطلب ذلك من وكيلك."
    }
  },
  "lessons": {
    "dv5-l1": {
      "title": "Git ببساطة",
      "key": [
        "Git = نقاط حفظ (commits) يمكن الرجوع إليها؛ وكيلك يستخدمه نيابة عنك.",
        "الدورة: تطلب ← تختبر ← الوكيل ينشئ الـ commit ← ثم يرسله (push) إلى GitHub.",
        "رسالة الـ commit تقول ما الذي تغيّر."
      ]
    },
    "dv5-l2": {
      "title": "تطبيق · أول مستودع لك دون أي أمر",
      "key": [
        "الطلب 1: « حوّل هذا المجلد إلى مستودع واحفظ أول نسخة »، مع التحقق من الأسرار.",
        "الطلب 2: « أنشئ مستودعًا خاصًا على GitHub وأرسل المشروع »؛ الربط بنقرة واحدة على Authorize.",
        "تحقّق على GitHub: الملفات، تبويب Commits، لا ملف .env، المستودع خاص."
      ]
    },
    "dv5-l3": {
      "title": "تطبيق · التجربة والدمج والرجوع للخلف",
      "key": [
        "فرع للتجربة دون لمس النسخة الرئيسية؛ ندمجه إن أعجبنا.",
        "للإلغاء، اطلب « revert »: يضيف الوكيل حفظًا معاكسًا ويبقى السجل كاملًا.",
        "Pull request = فرع يُراجَع قبل الدمج؛ معاينة لكل فرع على Vercel وNetlify وCloudflare."
      ]
    },
    "dv5-l4": {
      "title": "تطبيق · الأسرار: لا تنشر مفتاحًا أبدًا",
      "key": [
        "المفاتيح في .env الذي يتجاهله Git؛ وملف .env.example ينشر الأسماء فقط.",
        "اطلب التحقق: .env متجاهَل، ولا سرّ في الملفات ولا في السجل.",
        "مفتاح منشور: ألغِه وأنشئ مفتاحًا جديدًا؛ حذف الـ commit لا يكفي."
      ]
    },
    "dv5-l5": {
      "title": "إيجاد أفضل مستودعات GitHub",
      "key": [
        "مرشّحات البحث: stars:>500 وpushed:>تاريخ وtopic: وlicense:mit وarchived:false؛ أو اطلب البحث من وكيلك.",
        "مراجع: shadcn-ui/ui وsupabase/supabase وanthropics/skills وgithub/spec-kit وOWASP/CheatSheetSeries.",
        "قبل الاستخدام: الترخيص، صيانة حديثة، issues نشطة، تدقيق بواسطة Claude."
      ]
    },
    "dv5-l6": {
      "title": "GitHub Actions وPages: النشر التلقائي",
      "key": [
        "Push ← GitHub Actions ← بناء الموقع ← على الإنترنت خلال دقيقة إلى دقيقتين.",
        "يكتب وكيلك ملف الروبوت (.github/workflows) بطلب واحد، ويشرح لك ما يفعله.",
        "الـ Actions تنشر وتختبر وتتحقق من الأمان وترسل تقارير."
      ]
    }
  }
};
