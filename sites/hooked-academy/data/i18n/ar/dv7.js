// Traduction (ar) du module dv7 — الخلفية وSupabase.
// Titres, présentation et points essentiels ; les scènes restent en français pour l'instant (voir i18n-check.mjs).
export default {
  "modules": {
    "dv7": {
      "title": "الخلفية وSupabase",
      "pitch": "فهم الخلفية، تصميم الجداول، الربط، إدارة الحسابات، الحماية بـ RLS، والأخطاء التي يرتكبها كل مبتدئ."
    }
  },
  "lessons": {
    "dv7-l1": {
      "title": "ما هي الخلفية (backend)؟",
      "key": [
        "الخلفية تتحقق (من، ماذا، الحق، التوفر) قبل الحفظ.",
        "المصادقة = من أنت؟ التفويض = هل يحق لك؟ الاثنان إلزاميان.",
        "الأفعال: GET قراءة، POST إنشاء، PATCH تعديل، DELETE حذف."
      ]
    },
    "dv7-l2": {
      "title": "تصميم الجداول",
      "key": [
        "جدول لكل نوع من الأشياء؛ وعلاقات (references) بين الجداول.",
        "الأنواع: text وnumeric (الأسعار) وtimestamptz (التواريخ) وboolean وuuid.",
        "المخطط بـ SQL مُتتبَّع (migrations)، وقيود not null / check / references."
      ]
    },
    "dv7-l3": {
      "title": "ربط الموقع بـ Supabase",
      "key": [
        "createClient(URL، المفتاح publishable)؛ select / insert / update؛ عالج error دائمًا.",
        "Publishable (anon سابقًا) في المتصفح، آمن مع RLS؛ Secret (service_role سابقًا) في الخادم فقط.",
        "منذ 2026 لم يعد الجدول الجديد مكشوفًا للـ API تلقائيًا: تحقّق من هذا الإعداد."
      ]
    },
    "dv7-l4": {
      "title": "حسابات المستخدمين (Auth)",
      "key": [
        "الطرق: بريد + كلمة مرور، رابط سحري، Google، passkeys.",
        "signUp وsignInWithOtp وsignInWithOAuth وgetUser.",
        "الإعدادات: عناوين إعادة التوجيه، رسائل بالفرنسية، SMTP في الإنتاج، جدول profiles."
      ]
    },
    "dv7-l5": {
      "title": "RLS: الدرس الأهم",
      "key": [
        "RLS مفعّل على كل جدول دون استثناء؛ سياسة لكل إجراء (select وinsert وupdate وdelete).",
        "(select auth.uid()) = user_id: كل واحد يرى وينشئ أسطره فقط.",
        "اختبر بحسابين؛ تحليل في أغسطس 2026 وجد 57 % من تطبيقات Supabase المبنية بالـ vibe coding مقروءة دون تسجيل الدخول."
      ]
    },
    "dv7-l6": {
      "title": "الملفات وEdge Functions وClaude متصلًا بـ Supabase",
      "key": [
        "Storage: حاويات عامة (الصور) أو خاصة (الوثائق) بقواعدها.",
        "Edge Functions: كود خادم يحفظ الأسرار؛ تحقّق دائمًا قبل التنفيذ.",
        "MCP لـ Supabase: claude mcp add --transport http supabase https://mcp.supabase.com/mcp؛ قراءة فقط على البيانات الحقيقية."
      ]
    },
    "dv7-l7": {
      "title": "أخطاء الخلفية الاثنا عشر عند المبتدئين",
      "key": [
        "لا تثق بالمتصفح أبدًا: الأسعار والأدوار والمعرّفات يُعاد التحقق منها في الخادم.",
        "تحديد عدد الطلبات، webhooks موقّعة، تحقق (Zod)، معالجة غير مكررة، أخطاء دون تفاصيل.",
        "timestamptz، migrations مُتتبَّعة، قاعدة اختبار منفصلة، نسخ احتياطية مُختبَرة."
      ]
    }
  }
};
