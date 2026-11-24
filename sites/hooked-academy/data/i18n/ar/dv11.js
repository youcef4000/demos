// Traduction (ar) du module dv11 — الموشن ديزاين للويب.
// Titres, présentation et points essentiels ; les scènes restent en français pour l'instant (voir i18n-check.mjs).
export default {
  "modules": {
    "dv11": {
      "title": "الموشن ديزاين للويب",
      "pitch": "التحريك بنية واضحة: CSS الحديث، GSAP وLenis، Lottie وRive وSpline وThree.js، الفيديو بالكود، وأفضل مواقع الإلهام."
    }
  },
  "lessons": {
    "dv11-l1": {
      "title": "مبادئ التحريك الجيد",
      "key": [
        "تحريك واحد = نية واحدة (توجيه، تأكيد، سرد).",
        "150–300 ميلي ثانية للواجهة، 400–800 لقسم كامل؛ ease-out للدخول.",
        "حرّك transform وopacity؛ واحترم prefers-reduced-motion."
      ]
    },
    "dv11-l2": {
      "title": "التحريك بـ CSS الحديث",
      "key": [
        "ظهور مرتبط بالتمرير بـ CSS فقط: الكلمة التي تطلبها هي « animation-timeline: view() ».",
        "انتقال تلاشٍ بين الصفحات دون JavaScript: « View Transitions ».",
        "تحقّق من caniuse.com، ابقَ سليمًا دون حركة، واختبر على Safari."
      ]
    },
    "dv11-l3": {
      "title": "GSAP وScrollTrigger وLenis",
      "key": [
        "GSAP مجاني مع إضافاته (ScrollTrigger وSplitText…)؛ اطلب إصدارًا مثبّتًا على الـ CDN (gsap@3.15.0).",
        "اطلب gsap.matchMedia() لاحترام تقليل الحركة.",
        "ScrollTrigger وSplitText وLenis (تمرير ناعم) والـ timelines: المفردات التي تعطيها لوكيلك."
      ]
    },
    "dv11-l4": {
      "title": "Lottie وRive وSpline وThree.js",
      "key": [
        "Lottie (رسوم)، Rive (تفاعلي)، Spline (ثلاثي الأبعاد دون كود)، Unicorn Studio (WebGL)، Three.js (ثلاثي الأبعاد بالكود).",
        "الثلاثي الأبعاد: للحظات المهمة، يُحمَّل عند الحاجة، وصورة بديلة على الهاتف.",
        "تحقّق دائمًا من وزن الصفحة (تبويب Network)."
      ]
    },
    "dv11-l5": {
      "title": "الفيديو المصنوع بالكود",
      "key": [
        "Remotion (React ← MP4)، HyperFrames (HTML ← MP4)، تسجيل الشاشة للعروض.",
        "قالب واحد + بيانات = عشرات الفيديوهات (كتالوج، لغات، أسعار).",
        "خدمة تُباع للمتاجر الإلكترونية؛ ودروس Hooked تستعمل المبدأ نفسه."
      ]
    },
    "dv11-l6": {
      "title": "الإلهام: أفضل المواقع المختارة",
      "key": [
        "المعارض: Awwwards وRecent (Godly سابقًا) وMotionsites وCodrops وMobbin وLand-book وLapa Ninja وCodePen.",
        "استلهم إيقاعًا أو فكرة؛ ولا تنسخ كودًا أو صورًا أو نصوصًا أبدًا.",
        "تحقّق من رخص الخطوط والصور والتحريكات ومقاطع الكود."
      ]
    }
  }
};
