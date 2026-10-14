// Traduction (en) du module m5 — Produire sans IA : vidéo, image, carrousel.
export default {
  modules: {
    m5: {
      title: 'Produce without AI: video, image, carousel',
      pitch: 'The basics in CapCut and Canva, before you add AI.',
    },
  },
  lessons: {
    'm5-l1': {
      title: 'Edit a video ad in CapCut',
      scenes: [
        { sub: 'Pacing · captions · music' },
        {
          title: 'The 5-step workflow',
          clips: [{ label: 'Hook' }, { label: 'Problem' }, { label: 'Product' }, { label: 'Proof' }, { label: 'CTA' }],
          tracks: [{ label: 'Captions' }, { label: 'Music' }],
          steps: [{ label: 'Import your footage' }, { label: 'Cut the dead air' }, { label: 'Order Hook → CTA' }, { label: 'Auto captions' }, { label: 'Music at −20 dB' }],
        },
        { label: 'a new shot every 2 to 3 seconds' },
        {
          title: 'Before you export',
          items: ['The hook shows *from the 1st frame*', 'Captions readable, centered', 'The product appears within 5 seconds', 'The CTA is written *and* spoken'],
        },
        {},
      ],
      key: ['Import, cut the dead air, order from Hook to CTA, add captions, add music.', 'A change on screen every 2 to 3 seconds.', 'The CTA must be written on screen and spoken in the voice-over.'],
      quiz: [{ q: 'How often do you change shots?', a: ['Every 2 to 3 seconds', 'Every 15 seconds', 'Never'], why: 'A fast pace holds attention.' }],
    },
    'm5-l2': {
      title: 'A Canva image that converts',
      scenes: [
        { sub: 'Hierarchy · contrast · one message' },
        {
          title: 'One image = 5 layers',
          layers: [
            { label: 'The background', sub: 'Solid color or simple set' },
            { label: 'The product', sub: 'Sharp, well lit' },
            { label: 'The headline', sub: '6 words max' },
            { label: 'The proof', sub: 'Delivery, guarantee…' },
            { label: 'The CTA', sub: 'A visible button' },
          ],
        },
        {
          title: 'Too much info kills the message',
          left: { title: 'Cluttered', items: ['5 colors, 4 fonts', '3 messages at once'] },
          right: { title: 'Readable', items: ['2 colors, 1 font', 'Just one message'] },
        },
        { text: 'If people don’t get your image in *1 second*, it’s too busy.' },
        {},
      ],
      key: ['Five layers: background, product, headline, proof, CTA.', 'Two colors, one font, just one message.', 'The one-second test: people must get the image instantly.'],
      quiz: [{ q: 'How many messages in an image ad?', a: ['Just one', 'Three', 'As many as possible'], why: 'A clear message reads in one second.' }],
    },
    'm5-l3': {
      title: 'Build a carousel slide by slide',
      scenes: [
        { sub: 'A story in 5 slides' },
        {
          title: 'The 5-slide structure',
          frames: [
            { label: 'Hook', sub: 'The promise or the question', dur: 'slide 1' },
            { label: 'Problem', sub: 'What the customer goes through', dur: 'slide 2' },
            { label: 'Solution', sub: 'The product', dur: 'slide 3' },
            { label: 'Proof', sub: 'Demo, guarantee', dur: 'slide 4' },
            { label: 'CTA', sub: 'What to do next', dur: 'slide 5' },
          ],
        },
        {
          title: 'The carousel rules',
          items: ['Slide 1 must make people want to *swipe*', 'One idea per slide', 'The same style on every slide', 'The CTA on the *last* one'],
        },
        {},
      ],
      key: ['Five slides: hook, problem, solution, proof, CTA.', 'Slide 1 must make people want to swipe.', 'One idea per slide, a consistent style, the CTA at the end.'],
      quiz: [{ q: 'Where do you put the CTA in a carousel?', a: ['On the first slide', 'On the last slide', 'Nowhere'], why: 'The last slide wraps up and drives action.' }],
    },
    'm5-l4': {
      title: 'Export without losing quality',
      scenes: [
        { sub: 'The right settings' },
        {
          title: 'The settings to remember',
          items: [
            { label: '1080 × 1920', sub: 'Vertical, in high definition' },
            { label: '30 fps', sub: 'Smooth and lightweight' },
            { label: 'MP4 · H.264', sub: 'Accepted everywhere' },
          ],
        },
        { items: [{ use: '1080 × 1920 px' }, { use: '1080 × 1350 px' }, { use: '1080 × 1080 px' }] },
        {
          title: 'Final check',
          items: ['Watch the video *all the way through* on your phone', 'Test it *with the sound off*', 'Proofread all your text', 'Name the file: product-hook-version'],
        },
        {},
      ],
      key: ['Video: 1080 × 1920, 30 fps, MP4 (H.264).', 'Images: 1080 × 1920, 1080 × 1350 or 1080 × 1080, depending on the format.', 'Always check on a phone, with the sound off, and name your versions.'],
      quiz: [{ q: 'What resolution for a vertical video?', a: ['1080 × 1920', '640 × 480', '1920 × 1080'], why: '1080 wide, 1920 tall: vertical HD.' }],
    },
  },
};
