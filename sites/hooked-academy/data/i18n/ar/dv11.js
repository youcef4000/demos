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
        "animation-timeline: view(): تحريك مرتبط بالتمرير بـ CSS فقط.",
        "@view-transition { navigation: auto; }: انتقالات بين الصفحات دون JavaScript.",
        "تحقّق على caniuse.com، ابقَ سليمًا دون تحريك، واختبر على Safari."
      ]
    },
    "dv11-l3": {
      "title": "GSAP وScrollTrigger وLenis",
      "key": [
        "GSAP مجاني بإضافاته كلها (ScrollTrigger وSplitText…)؛ نسخة مثبّتة على الـ CDN (gsap@3.15.0).",
        "gsap.matchMedia() لاحترام prefers-reduced-motion.",
        "ScrollTrigger وSplitText وLenis (تمرير ناعم) والخطوط الزمنية."
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
