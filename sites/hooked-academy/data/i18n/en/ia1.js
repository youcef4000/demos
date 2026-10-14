// Traduction (en) du module ia1 — Prompting : parler à l’IA.
export default {
  modules: {
    ia1: {
      title: 'Prompting: talking to AI',
      pitch: 'The skill every other one depends on: writing instructions AI understands.',
    },
  },
  lessons: {
    'ia1-l1': {
      title: 'What is a prompt?',
      scenes: [
        { sub: 'And why most of them are bad' },
        { text: 'A prompt is an *instruction*. AI doesn’t guess: it *completes*.' },
        {
          title: 'Vague or specific?',
          left: { title: 'Vague prompt', text: '“Make me an ad for my perfume.”', items: ['For whom? What format?', 'Generic result'] },
          right: {
            title: 'Specific prompt',
            text: '“You’re a copywriter. Write 3 eight-word hooks for a TikTok perfume video. Audience: women 25-35 in Algiers, friendly insider tone.”',
            items: ['Role, audience, format, tone', 'Usable result'],
          },
        },
        { text: 'The quality of the answer depends on the quality of *the question*.' },
        {},
      ],
      key: [
        'A prompt is an instruction: AI completes what you give it, it doesn’t guess.',
        'A vague prompt gets you a generic result.',
        'Role, audience, format and tone make the result usable.',
      ],
      quiz: [
        {
          q: 'Why does a vague prompt give a bad result?',
          a: ['AI fills the gaps with generic choices', 'AI is broken', 'You have to pay more'],
          why: 'Without details, AI goes for the most common options.',
        },
      ],
    },
    'ia1-l2': {
      title: 'The structure of a good prompt',
      scenes: [
        { sub: 'Role · Context · Task · Format · Constraints' },
        { parts: [{ t: 'Role' }, { t: 'Context' }, { t: 'Task' }, { t: 'Format' }, { t: 'Limits' }], result: { t: 'Pro prompt' } },
        {
          title: 'Example, block by block',
          segments: [
            { text: 'You’re an e-commerce copywriter in Algeria.', tag: 'Role' },
            { text: 'I sell an anti-frizz serum at 2,900 DA, delivery to 58 wilayas.', tag: 'Context' },
            { text: 'Write a 20-second video script.', tag: 'Task' },
            { text: 'Format: Hook / Body / CTA, with the on-screen text.', tag: 'Format' },
            { text: 'Simple Darija, no medical claims.', tag: 'Limits' },
          ],
          result: {
            lines: [
              'HOOK — “Is humidity ruining your hair?”',
              'BODY — 2 drops in the morning… frizz under control till evening.',
              'CTA — “Order now, cash on delivery.”',
            ],
          },
        },
        { title: 'Tips', items: ['Give an *example* of what you want', 'Ask for *several versions*', 'Say what you *don’t want*'] },
        {},
      ],
      key: [
        'Five blocks: Role, Context, Task, Format, Constraints.',
        'Give an example, ask for several versions, say what you don’t want.',
        'Context (product, price, audience, delivery) makes all the difference.',
      ],
      quiz: [
        { q: '“Write a 20-second script” fits which block?', a: ['Role', 'Task', 'Format'], why: 'It’s what AI has to do: the task.' },
        { q: '“No medical claims” is…', a: ['A constraint', 'A role', 'Context'], why: 'A limit AI has to respect.' },
      ],
      res: [
        {
          title: 'RCTFC template',
          text: 'Role: You’re [role].\nContext: [product, price, audience, city, delivery, what makes it different].\nTask: [what you want].\nFormat: [list, table, Hook/Body/CTA, number of versions].\nConstraints: [tone, language, length, what not to say].',
        },
      ],
    },
    'ia1-l3': {
      title: 'Prompts for hooks, scripts and ad copy',
      scenes: [
        { sub: 'Ask for 10, keep 1' },
        {
          segments: [{ text: 'Here’s my script. Give me 10 different hooks, ranked from strongest to weakest, and explain in one sentence why #1 works.' }],
          result: {
            lines: [
              '1. “Everyone makes this mistake with their perfume…”',
              '2. “3 seconds, and you smell the difference”',
              '3. “Why doesn’t your perfume last?”',
              '→ #1 sparks curiosity without promising anything false.',
            ],
          },
        },
        {
          title: 'Three texts AI can draft',
          items: [
            { label: 'Hooks', sub: '10 variations to test' },
            { label: 'Scripts', sub: 'Timed Hook / Body / CTA' },
            { label: 'Ad copy', sub: 'Primary text, headline, description' },
          ],
        },
        { text: 'AI writes the first draft. *You* choose, fix and sign off.' },
        {},
      ],
      key: [
        'Always ask for several versions (10 hooks), ranked and explained.',
        'Three texts: hooks, timed scripts, ad copy.',
        'AI writes the first draft; you choose and fix it.',
      ],
      quiz: [
        {
          q: 'How many hooks should you ask AI for?',
          a: ['Just one', 'Several (10, for example)', 'None'],
          why: 'More options, better odds of finding the right one.',
        },
      ],
      res: [
        {
          title: 'Prompt — Meta ad copy',
          text: 'You’re a Meta ads expert. For [product] sold at [price] with [delivery/payment], write 3 versions of: primary text (max 125 characters), headline (max 40 characters), description (max 30 characters). Tone: [tone], language: [language]. No claims that can’t be verified.',
        },
      ],
    },
    'ia1-l4': {
      title: 'The image prompt',
      scenes: [
        { sub: 'Describing a photo that doesn’t exist' },
        { parts: [{ t: 'Subject' }, { t: 'Setting' }, { t: 'Lighting' }, { t: 'Framing' }, { t: 'Style' }], result: { t: 'Image' } },
        {
          segments: [
            { text: 'Amber perfume bottle, gold cap,', tag: 'Subject' },
            { text: 'resting on black marble,', tag: 'Setting' },
            { text: 'soft light coming from the left,', tag: 'Lighting' },
            { text: 'close-up, slight low angle,', tag: 'Framing' },
            { text: 'luxury product photo, 4:5 format.', tag: 'Style' },
          ],
        },
        {
          title: 'Classic mistakes',
          items: [{ t: 'Writing “beautiful quality image”' }, { t: 'Forgetting the format' }, 'Describe the *light* like a photographer', 'Just one idea per image'],
        },
        {},
      ],
      key: [
        'Subject, setting, lighting, framing, style — and always the format.',
        '“Beautiful quality image” means nothing: describe what you can see.',
        'Generate several images and pick the best.',
      ],
      quiz: [
        {
          q: 'Which one is a good image prompt element?',
          a: ['“Beautiful image”', '“Soft light coming from the left”', '“Very quality”'],
          why: 'A precise description of the light changes the whole look.',
        },
      ],
      res: [
        {
          title: 'Image prompt template',
          text: '[Precise subject: product, material, color], [action or position], [setting], [lighting: direction, softness, time of day], [framing: shot, angle, focal length], [style: product photo, lifestyle, editorial], format [4:5 / 9:16 / 1:1].',
        },
      ],
    },
    'ia1-l5': {
      title: 'The video prompt',
      scenes: [
        { sub: 'Adding movement and time' },
        { parts: [{ t: 'Starting image' }, { t: 'Action' }, { t: 'Camera' }, { t: 'Duration' }], result: { t: 'Video shot' } },
        {
          segments: [
            { text: 'Starting from the bottle image:', tag: 'Start' },
            { text: 'a drop slides down the glass,', tag: 'Action' },
            { text: 'slow push-in toward the cap,', tag: 'Camera' },
            { text: '5 seconds, warm mood.', tag: 'Duration' },
          ],
        },
        { text: 'One shot = *one* action and *one* camera move.' },
        {},
      ],
      key: [
        'Starting image + action + camera move + duration.',
        'One shot = one action and one camera move.',
        'Starting from an approved image gives you more control than text alone.',
      ],
      quiz: [
        {
          q: 'How many camera moves per shot?',
          a: ['One', 'Three', 'As many as possible'],
          why: 'One intention per shot, otherwise the result gets messy.',
        },
      ],
    },
    'ia1-l6': {
      title: 'Iterate and build your library',
      scenes: [
        { sub: 'Fix it instead of starting over' },
        {
          loopLabel: 'Repeat until you get the right result',
          title: 'The iteration loop',
          nodes: [{ label: 'Prompt' }, { label: 'Result' }, { label: 'Diagnosis', sub: 'What’s off?' }, { label: 'Fix', sub: 'One variable only' }],
        },
        { text: 'Change *one variable* at a time.', sub: 'Otherwise you won’t know what improved the result.' },
        { title: 'Your prompt library', items: [{ label: 'Hooks' }, { label: 'Scripts' }, { label: 'Packshots' }, { label: 'Video shots' }] },
        {},
      ],
      key: [
        'Loop: prompt → result → diagnosis → fix.',
        'Change only one variable at a time.',
        'Save every prompt that works in a library sorted by use.',
      ],
      quiz: [
        {
          q: 'Why change only one variable at a time?',
          a: ['To know what improved the result', 'Because it’s mandatory', 'To go faster'],
          why: 'Otherwise you can’t tell which change worked.',
        },
      ],
    },
  },
};
