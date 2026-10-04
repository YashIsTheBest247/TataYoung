import { FLOOD, RESCUE } from '../lib/media.js';

const CAPS = [
  {
    headline: ['Flood ', 'Autopilot'],
    pills: [FLOOD.streetFlood5, RESCUE.heli2],
    pillsAlt: ['Flooded city street', 'Rescue helicopter in action'],
    tagline: ['Pick the kind of city you live in, and Pravaah finds what is flooding in it, ', 'verifies it, ', 'maps it, routes around it, and tells the people who must know.'],
    card: {
      image: FLOOD.streetFlood3,
      alt: 'Live flood view of an Indian street',
      eyebrow: 'What it does',
      heading: 'Two ways in, one shared map.',
      body: [
        'Let Pravaah run on its own, and it scans every satellite pass of your city, confirms each report with Gemini, and publishes a live flood map that routes the whole city around the risk.',
        'Or let citizens send what they see. A photo on WhatsApp arrives at Pravaah, gets a vision check, gains a severity, and reaches the map and the rescuers in the same minute.',
      ],
    },
  },
  {
    headline: ['Route ', 'Architect'],
    pills: [FLOOD.streetFlood7, FLOOD.streetFlood8],
    pillsAlt: ['Rainy intersection', 'Street with rising water'],
    tagline: ['Tell Pravaah where you are, where you need to be, and what you are driving. ', 'A safe route arrives in three seconds, with the exact zones it avoids and the exact minute of delay.'],
    card: {
      image: RESCUE.heli3,
      alt: 'Rescue team flying over flooded land',
      eyebrow: 'How it routes',
      heading: 'Three profiles, one calm pipeline.',
      body: [
        'Pedestrians get the gentlest route, cars get a balance of speed and safety, and ambulances get a dedicated corridor the general traffic never sees.',
        'When no clean path exists, Pravaah does not pretend. It returns a safest available plan with a clear warning, or a blocked status that tells you to delay the trip.',
      ],
    },
  },
  {
    headline: ['Family ', 'Shield'],
    pills: [FLOOD.streetFlood1, RESCUE.heli4],
    pillsAlt: ['Flooded colony', 'Volunteer boat in high water'],
    tagline: ['Register an elderly parent, a bedridden patient or a disabled resident once, ', 'and the next monsoon they are never invisible to the people who come to help.'],
    card: {
      image: FLOOD.streetFlood4,
      alt: 'Residential area under water',
      eyebrow: 'Why it matters',
      heading: 'The people who cannot run get seen.',
      body: [
        'In the Chennai 2015 floods, over sixty per cent of elderly victims lived alone or with another elderly person. Rescuers often did not know they were there until it was too late.',
        'Pravaah holds that list, with consent, and surfaces it only to the local control room during an active event, with a full audit trail of who viewed what and when.',
      ],
    },
  },
];

export default function CapabilityShowcase() {
  return (
    <section className="bg-paper-50 px-6 py-28">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-32">
        {CAPS.map((c, i) => (
          <Block key={i} {...c} />
        ))}
      </div>
    </section>
  );
}

function Block({ headline, pills, pillsAlt, tagline, card }) {
  return (
    <article className="flex flex-col items-center">
      <h2 className="serif text-center text-[64px] leading-[1.02] tracking-tight text-ink-900 sm:text-[88px] lg:text-[104px]">
        {headline[0]}<span className="italic text-amber2-700">{headline[1]}</span>
      </h2>

      <div className="mt-10 flex w-full max-w-[780px] items-center gap-6">
        <Pill src={pills[0]} alt={pillsAlt[0]} align="left" />
        <p className="serif flex-1 text-center text-[22px] leading-[1.35] text-ink-800 sm:text-[26px]">
          {tagline[0]}
          <span className="italic text-amber2-700">{tagline[1]}</span>
          {tagline[2] || ''}
        </p>
        <Pill src={pills[1]} alt={pillsAlt[1]} align="right" />
      </div>

      <div className="mt-14 w-full overflow-hidden rounded-[28px] border border-ink-100 bg-white shadow-raised">
        <div className="grid grid-cols-1 gap-0 lg:grid-cols-5">
          <div className="relative lg:col-span-3">
            <img src={card.image} alt={card.alt} className="h-72 w-full object-cover lg:h-full" />
          </div>
          <div className="flex flex-col justify-center p-8 lg:col-span-2 lg:p-10">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-ink-400">
              {card.eyebrow}
            </div>
            <h3 className="mt-4 serif text-[32px] leading-[1.1] text-ink-900 sm:text-[38px]">
              {card.heading}
            </h3>
            <div className="mt-6 space-y-4 text-[15px] leading-[1.7] text-ink-700">
              {card.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function Pill({ src, alt, align }) {
  const shift = align === 'left' ? '-translate-y-2' : 'translate-y-2';
  return (
    <div className={`relative hidden h-20 w-20 shrink-0 overflow-hidden rounded-full ring-4 ring-paper-50 shadow-raised sm:block ${shift}`}>
      <img src={src} alt={alt} className="h-full w-full object-cover" />
    </div>
  );
}
