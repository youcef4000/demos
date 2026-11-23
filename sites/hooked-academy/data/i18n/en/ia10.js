// Traduction (en) du module ia10 — Ad strategy.
// Leçons ajoutées en novembre 2026 ; voir tools/hooked-academy/glossaire-i18n.md.
export default {
  "modules": {
    "ia10": {
      "title": "Ad strategy",
      "pitch": "Before generating: what to say, to whom, and how to hook. Desire, awareness level, market, structure, hook."
    }
  },
  "lessons": {
    "ia10-l1": {
      "title": "The dominant desire",
      "scenes": [
        {
          "kicker": "Ad strategy",
          "sub": "An ad speaks to one single desire"
        },
        {
          "title": "Say everything, or *aim true*",
          "left": {
            "title": "The ad that says everything",
            "items": [
              "Three benefits, none lands",
              "The customer doesn’t recognise himself"
            ]
          },
          "right": {
            "title": "The ad that aims at one desire",
            "items": [
              "One clear promise",
              "The customer thinks “that’s me”"
            ]
          }
        },
        {
          "title": "Find the desire *in 3 steps*",
          "items": [
            {
              "label": "List",
              "sub": "Every desire the product satisfies"
            },
            {
              "label": "Rank",
              "sub": "Which one drives the order most?"
            },
            {
              "label": "Write",
              "sub": "“My customer wants…” in one sentence"
            }
          ]
        },
        {
          "segments": [
            {
              "text": "For [product] sold at [price] to [audience], list 5 desires this product satisfies. Rank them from strongest to weakest at triggering a cash-on-delivery order. Write the first one as a sentence starting with “My customer wants…”."
            }
          ],
          "result": {
            "lines": [
              "1. Smell good from morning to night, no touch-ups",
              "2. Get compliments",
              "3. A beautiful bottle to give",
              "→ “My customer wants to smell good all day without thinking about it.”"
            ]
          }
        },
        {}
      ],
      "key": [
        "An ad aims at one dominant desire.",
        "That desire fits in one sentence: “My customer wants…”.",
        "Image, hook and script then serve that desire."
      ],
      "quiz": [
        {
          "q": "How many desires should an ad target first?",
          "a": [
            "Just one",
            "Three",
            "All of the product’s"
          ],
          "why": "One clear desire gets a reaction; several get diluted."
        }
      ],
      "todo": [
        "Pick a real product in your niche",
        "Paste the lesson prompt into ChatGPT with that product",
        "Keep the top-ranked desire and rewrite it in your own words",
        "Check: could a customer say “that’s exactly me”?",
        "Save the sentence in your product sheet: it will guide everything else"
      ],
      "res": [
        {
          "title": "Dominant desire sheet",
          "text": "Product: [  ]\nPrice and delivery: [  ]\nCustomer: [age, city, situation]\n\nPossible desires:\n1. [  ]\n2. [  ]\n3. [  ]\n\nThe dominant desire: “My customer wants [  ].”\nWhat the ad must show to prove it: [  ]"
        }
      ]
    },
    "ia10-l2": {
      "title": "The 5 levels of awareness",
      "scenes": [
        {
          "kicker": "Ad strategy",
          "sub": "Does your customer know he has a problem?"
        },
        {
          "title": "From coldest *to hottest*",
          "items": [
            {
              "label": "Unaware",
              "sub": "Talk about his situation"
            },
            {
              "label": "Problem-aware",
              "sub": "Show you understand"
            },
            {
              "label": "Solution-aware",
              "sub": "Why yours"
            },
            {
              "label": "Knows your product",
              "sub": "Proof, demonstration"
            },
            {
              "label": "Ready to buy",
              "sub": "The offer: price, delivery"
            }
          ]
        },
        {
          "title": "Same product, *two hooks*",
          "left": {
            "title": "Cold customer",
            "items": [
              "“Your eyes look tired",
              "even after 8 hours of sleep?”"
            ]
          },
          "right": {
            "title": "Hot customer",
            "items": [
              "“The cream you saw:",
              "delivered home, paid on receipt.”"
            ]
          }
        },
        {
          "segments": [
            {
              "text": "For [product], write a hook of fewer than 12 words for each of the 5 awareness levels: unaware, problem-aware, solution-aware, product-aware, ready to buy. Say who to show each version to."
            }
          ],
          "result": {
            "lines": [
              "Unaware · broad new audience",
              "Problem · related interests",
              "Ready to buy · visitors of your page (retargeting)"
            ]
          }
        },
        {}
      ],
      "key": [
        "The message changes with what the customer already knows.",
        "Cold customer: start from his situation or the problem.",
        "Hot customer: go straight to the offer."
      ],
      "quiz": [
        {
          "q": "For a customer who already knows your product, the ad should mostly…",
          "a": [
            "Explain the problem",
            "Give the offer and proof",
            "Talk about the brand in general"
          ],
          "why": "He’s ready: he needs the offer, proof and a clear CTA."
        }
      ],
      "todo": [
        "Take your product and your dominant-desire sentence",
        "Generate the 5 hooks with the lesson prompt",
        "Next to each hook, note the audience to show it to",
        "Keep the “cold customer” hook and the “hot customer” hook",
        "Add them to your library, under Hooks"
      ]
    },
    "ia10-l3": {
      "title": "Is your market saturated?",
      "scenes": [
        {
          "kicker": "Ad strategy",
          "sub": "When everyone promises the same thing"
        },
        {
          "title": "Three markets, *three strategies*",
          "items": [
            {
              "label": "New market",
              "sub": "Direct, strong promise"
            },
            {
              "label": "Promises everywhere",
              "sub": "A new mechanism: how it works"
            },
            {
              "label": "Saturated market",
              "sub": "An identity: for whom, what style"
            }
          ]
        },
        {
          "title": "Know where you stand *in 15 minutes*",
          "items": [
            "Open the Meta *Ad Library*",
            "Watch *10 competitor ads* for your product",
            "Note their main *promise*",
            "If they all say the same: *change angle*"
          ]
        },
        {
          "segments": [
            {
              "text": "Here are the promises of 5 competitor ads for [product]: [list]. Tell me if this market is new, full of identical promises, or saturated. Then suggest 3 angles: a stronger promise, a new mechanism, an identity."
            }
          ],
          "result": {
            "lines": [
              "Diagnosis: identical promises (“natural”, “effective”)",
              "Mechanism: “the formula that works while you sleep”",
              "Identity: “for mums who don’t have 5 minutes”"
            ]
          }
        },
        {}
      ],
      "key": [
        "First look at what competitors promise.",
        "New market: direct promise; promises everywhere: a new mechanism; saturated: an identity.",
        "A different angle beats a better image."
      ],
      "quiz": [
        {
          "q": "Every competitor ad promises “natural and effective”. What do you do?",
          "a": [
            "Promise the same thing louder",
            "Change angle: mechanism or identity",
            "Stop selling this product"
          ],
          "why": "When the promise is worn out, a new angle stands out."
        }
      ],
      "todo": [
        "Open the Meta Ad Library and search for your product",
        "Note the promise of 10 competitor ads",
        "Paste the 5 most frequent into the lesson prompt",
        "Choose the angle that suits you best among the 3 suggested",
        "Write it in your product sheet, under the dominant desire"
      ]
    },
    "ia10-l4": {
      "title": "6 script structures that sell",
      "scenes": [
        {
          "kicker": "Ad strategy",
          "sub": "Stop starting from scratch"
        },
        {
          "title": "The *6 structures*",
          "items": [
            {
              "label": "Problem → solution"
            },
            {
              "label": "Before / after"
            },
            {
              "label": "Testimonial"
            },
            {
              "label": "Objection handled"
            },
            {
              "label": "Demonstration"
            },
            {
              "label": "Comparison"
            }
          ]
        },
        {
          "title": "Which one *to choose*?",
          "items": [
            "The result is visible: *before / after* or *demonstration*",
            "The price scares: *objection handled*",
            "The product is well known: *comparison*",
            "Trust is missing: *testimonial*"
          ]
        },
        {
          "segments": [
            {
              "text": "Write the same 20-second script for [product] in 2 structures: before / after, then objection handled. Hook in the first 3 seconds, one idea per shot, cash-on-delivery CTA. Include the on-screen text."
            }
          ],
          "result": {
            "lines": [
              "Before / after · 0–3 s “My hair before… and after 7 days”",
              "Objection · 0–3 s “2,900 DA for a serum? Watch.”",
              "CTA · “Order now, you pay on delivery.”"
            ]
          }
        },
        {}
      ],
      "key": [
        "Six structures cover almost every ad: problem-solution, before/after, testimonial, objection, demonstration, comparison.",
        "The product and the customer’s fear choose the structure.",
        "Write two structures and test them."
      ],
      "quiz": [
        {
          "q": "Your product costs more than the competition. Which structure first?",
          "a": [
            "Objection handled",
            "Demonstration",
            "Testimonial"
          ],
          "why": "You answer “too expensive” head-on before it drives people away."
        }
      ],
      "todo": [
        "Choose the structure that fits your product with the checklist",
        "Generate the script in 2 structures with the lesson prompt",
        "Read them out loud: which sounds most natural?",
        "Keep both: you’ll test them against each other",
        "Save them in your library, under Scripts"
      ],
      "res": [
        {
          "title": "The 6 structures",
          "text": "PROBLEM → SOLUTION: the real problem · the product · the result · CTA\nBEFORE / AFTER: the before · the action · the after · CTA\nTESTIMONIAL: “I had…” · what I tried · what worked · CTA\nOBJECTION HANDLED: the objection said out loud · the proven answer · CTA\nDEMONSTRATION: the product in action, shot by shot · CTA\nCOMPARISON: the usual alternative · yours · the visible difference · CTA"
        }
      ]
    },
    "ia10-l5": {
      "title": "The 3-second hook",
      "scenes": [
        {
          "kicker": "Ad strategy",
          "sub": "It decides whether your ad gets watched"
        },
        {
          "title": "The first 3 *seconds*",
          "items": [
            {
              "label": "The image that stops",
              "sub": "0–1 s · movement, face, product in action"
            },
            {
              "label": "The line that hooks",
              "sub": "1–3 s · question, number, contradiction"
            },
            {
              "label": "The promise of more",
              "sub": "3 s · a reason to stay"
            }
          ]
        },
        {
          "title": "5 families of *hooks*",
          "items": [
            {
              "label": "Question",
              "sub": "“Still losing 20 min on…?”"
            },
            {
              "label": "Number",
              "sub": "“3 moves, 30 seconds”"
            },
            {
              "label": "Counter-intuitive",
              "sub": "“Stop buying…”"
            },
            {
              "label": "Before / after",
              "sub": "The contrast in one image"
            },
            {
              "label": "Point of view",
              "sub": "“POV: your delivery arrives”"
            }
          ]
        },
        {
          "segments": [
            {
              "text": "Write 10 hooks of fewer than 8 words for [product], 2 per family: question, number, counter-intuitive, before/after, point of view. For each, describe the image of the first 3 seconds. Then pick the 3 to test first and explain why."
            }
          ],
          "result": {
            "lines": [
              "“Your perfume gone by noon?” · close-up on the wrist",
              "“Stop re-spraying.” · bottle set down, hand refusing",
              "Test first: 1, 4, 7"
            ]
          }
        },
        {
          "text": "The hook decides if your ad is seen. *The rest decides if it sells.*"
        },
        {}
      ],
      "key": [
        "The first 3 seconds: an image that stops and a line that hooks.",
        "Five families: question, number, counter-intuitive, before/after, point of view.",
        "Write 10, test 3."
      ],
      "quiz": [
        {
          "q": "What should the first second of an ad do?",
          "a": [
            "Show the logo",
            "Stop the scroll with the image",
            "Give the price"
          ],
          "why": "Before reading, people look: the image must stop the thumb."
        }
      ],
      "todo": [
        "Generate 10 hooks with the lesson prompt",
        "Check that each one is under 8 words",
        "Keep the 3 the AI recommends, plus your favourite",
        "Plan the image of the first 3 seconds for each hook",
        "Save them in your library: they’ll feed your variants"
      ]
    }
  }
};
