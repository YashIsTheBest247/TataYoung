import { Link } from 'react-router-dom';
import {
  ArrowRight, Sparkles, MapPin, Camera, Route as RouteIcon,
  Users, Lock, Globe2, Siren, ChevronRight, Satellite, Phone,
  TriangleAlert, Flame, Megaphone, Quote, Clock, HeartHandshake,
} from 'lucide-react';
import NavBar from '../components/NavBar.jsx';
import SiteFooter from '../components/SiteFooter.jsx';
import CapabilityShowcase from '../components/CapabilityShowcase.jsx';
import { FLOOD, RESCUE } from '../lib/media.js';

export default function Landing() {
  return (
    <div className="min-h-screen overflow-x-hidden ribbon-light text-ink-900">
      <NavBar />
      <Hero />
      <ProblemGallery />
      <Headline />
      <CapabilityShowcase />
      <MapPreview />
      <StatsStrip />
      <StoriesStrip />
      <FeatureGrid />
      <ForWhom />
      <TechStrip />
      <CTABlock />
      <SiteFooter />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-10 px-6 pb-28 pt-6 lg:grid-cols-12 lg:gap-12 lg:pb-32 lg:pt-10">
        <div className="relative z-10 lg:col-span-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber2-500/40 bg-amber2-500/10 px-3 py-1 text-xs font-medium text-amber2-700">
            <TriangleAlert size={12} />
            Monsoon 2026, India
          </div>
          <h1 className="mt-6 serif text-[44px] leading-[0.98] tracking-tight text-ink-900 sm:text-[60px] lg:text-[76px]">
            The water<br />does not wait.
          </h1>
          <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-ink-700">
            Every monsoon, Indian cities drown while commuters guess which road is still a road.
            Pravaah is a live flood navigation layer that fuses satellite imagery, citizen photos
            verified by Gemini, and a routing engine that reshapes the city in seconds.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link to="/map" className="group flex items-center gap-2 rounded-full btn-amber px-5 py-3 text-sm">
              Open live map
              <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />
            </Link>
            <Link to="/report" className="flex items-center gap-2 rounded-full btn-ghost px-5 py-3 text-sm">
              <Camera size={16} /> Submit a report
            </Link>
          </div>
          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-ink-500">
            <TrustBit label="Satellite + crowd fusion" />
            <TrustBit label="Works on 2G and USSD" />
            <TrustBit label="Ambulance priority routing" />
          </div>
        </div>

        <div className="relative lg:col-span-5">
          <HeroCollage />
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0">
        <Ticker />
      </div>
    </section>
  );
}

function HeroCollage() {
  return (
    <div className="relative mx-auto aspect-[1/1] w-full max-w-[420px] overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-[58%] overflow-hidden rounded-[22px] shadow-raised ring-1 ring-ink-100">
        <img src={RESCUE.heli1} alt="Rescue helicopter above a flooded landscape" className="h-full w-full object-cover" />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-white">
          <span className="rounded-full bg-black/40 px-2 py-0.5 backdrop-blur">Live feed</span>
          <span className="font-mono">07:12</span>
        </div>
      </div>

      <div className="absolute bottom-[72px] left-0 h-[36%] w-[42%] overflow-hidden rounded-[18px] shadow-raised ring-1 ring-ink-100">
        <img src={FLOOD.streetFlood3} alt="Flooded street during monsoon" className="h-full w-full object-cover" />
      </div>

      <div className="absolute bottom-[72px] right-0 h-[32%] w-[38%] overflow-hidden rounded-[18px] shadow-raised ring-1 ring-ink-100">
        <img src={FLOOD.streetFlood5} alt="City under water" className="h-full w-full object-cover" />
      </div>

      <div className="absolute inset-x-6 bottom-0 rounded-2xl bg-white/95 p-3 shadow-raised ring-1 ring-ink-100 backdrop-blur">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-ink-900">
            <span className="h-2 w-2 animate-pulse rounded-full bg-moss-500" />
            Routing live
          </div>
          <span className="font-mono text-[10px] text-ink-500">Mumbai, 19.07° N</span>
        </div>
        <div className="mt-1 flex items-center gap-2 text-[11px] text-ink-700">
          <RouteIcon size={12} className="text-amber2-500" />
          Safe route found, 6 min detour via Mahim.
        </div>
      </div>
    </div>
  );
}

function TrustBit({ label }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-1.5 w-1.5 rounded-full bg-amber2-500" />
      <span>{label}</span>
    </div>
  );
}

function Ticker() {
  const items = [
    'Andheri subway, water above 60 cm, impassable for cars',
    'Hindmata circle, no vehicles after 7 PM',
    'Kurla LBS, slow lane only, two feet of water',
    'Dadar TT, drains choked, expect delays',
    'Sion circle, two cars stranded, NDRF notified',
    'Bandra reclamation, caution for two wheelers',
  ];
  const row = [...items, ...items];
  return (
    <div className="relative border-y border-ink-100 bg-white/70 backdrop-blur">
      <div className="flex overflow-hidden">
        <div className="ticker-row flex min-w-max items-center gap-10 whitespace-nowrap py-3 pl-6 text-xs text-ink-700">
          {row.map((it, i) => (
            <span key={i} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-rust-500" />
              {it}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProblemGallery() {
  const tiles = [
    { img: FLOOD.streetFlood1, k: 'Then', title: 'Mumbai, 2005', body: '944 mm of rain in a single day. 500+ lives lost. Information failed before the water did.' },
    { img: FLOOD.streetFlood2, k: 'Still', title: 'Chennai, 2023', body: 'Entire neighbourhoods marooned. Elderly residents waited hours because nobody knew they lived alone.' },
    { img: FLOOD.streetFlood4, k: 'Again', title: 'Guwahati, 2024', body: 'Commuters trapped on an arterial road that Google Maps still marked as "fastest route".' },
  ];
  return (
    <section className="border-t border-ink-100 bg-paper-50 px-6 py-20">
      <div className="mx-auto max-w-[1280px]">
        <div className="flex items-end justify-between gap-6">
          <SectionHead eyebrow="The gap" title="A problem India refuses to let go of." />
          <p className="hidden max-w-sm text-sm text-ink-500 lg:block">
            Satellites see the city. Citizens see their street. Rescuers see nothing until someone calls.
            Pravaah closes that gap.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
          {tiles.map((t) => (
            <article key={t.title} className="group overflow-hidden rounded-3xl bg-white shadow-card card-hover">
              <div className="relative h-56 overflow-hidden">
                <img src={t.img} alt={t.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-black/0" />
                <span className="absolute bottom-3 left-4 rounded-full bg-white/85 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-ink-900 backdrop-blur">
                  {t.k}
                </span>
              </div>
              <div className="p-5">
                <h3 className="serif text-2xl text-ink-900">{t.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-600">{t.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Headline() {
  return (
    <section className="relative px-6 py-24">
      <div className="mx-auto max-w-[1100px]">
        <p className="serif text-3xl leading-[1.25] text-ink-800 sm:text-4xl lg:text-5xl">
          A commuter in Mumbai, a mother in Chennai, a farmer in Guwahati.
          Every monsoon, the same question. <span className="text-amber2-600">Which road is still a road?</span>
          <br /><br />
          Pravaah answers it, in three seconds, in seven languages, in time to turn the car around.
        </p>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: '01', Icon: Satellite, title: 'Satellite watches', body: 'Every Sentinel 2 pass is run through a flood mask model to find waterlogged neighbourhoods automatically.', img: FLOOD.streetFlood6 },
    { n: '02', Icon: Camera, title: 'Citizens confirm', body: 'A resident sends a photo through the Pravaah bot. Gemini vision confirms it is really a flood and estimates depth before anything is published.', img: FLOOD.streetFlood7 },
    { n: '03', Icon: RouteIcon, title: 'Routes reshape', body: 'The whole city reroutes around the new zone. Ambulances get a priority profile that keeps them on the fastest open corridor.', img: FLOOD.streetFlood8 },
    { n: '04', Icon: Siren, title: 'The invisible become visible', body: 'Elderly and disabled residents, pre registered by their families, show up for rescuers the moment water enters their locality.', img: RESCUE.heli2 },
  ];
  return (
    <section id="how" className="bg-white px-6 py-24">
      <div className="mx-auto max-w-[1280px]">
        <SectionHead eyebrow="How it works" title="From satellite to safe route in minutes." />
        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ n, Icon, title, body, img }) => (
            <div key={n} className="overflow-hidden rounded-3xl bg-paper-50 shadow-card card-hover">
              <div className="relative h-36 overflow-hidden">
                <img src={img} alt={title} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/50" />
                <div className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/90 text-amber2-600 shadow-card">
                  <Icon size={16} />
                </div>
                <span className="absolute bottom-2 right-3 font-mono text-xs text-white/90">{n}</span>
              </div>
              <div className="p-5">
                <h3 className="text-base font-semibold text-ink-900">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MapPreview() {
  return (
    <section className="relative px-6 py-24">
      <div className="mx-auto grid max-w-[1280px] items-center gap-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionHead eyebrow="Live demo" title="A full working map, right now." />
          <p className="mt-6 text-ink-700">
            Pravaah ships a working flood map today, seeded with real Mumbai monsoon hotspots.
            Submit a report, watch the map update, and ask Pravaah for a safe route from any point
            to any other point in the city.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/map" className="flex items-center gap-2 rounded-full btn-amber px-4 py-2 text-sm">
              Open live map <ArrowRight size={14} />
            </Link>
            <Link to="/report" className="flex items-center gap-2 rounded-full btn-ghost px-4 py-2 text-sm">
              <Camera size={14} /> Submit a report
            </Link>
          </div>
        </div>
        <div className="lg:col-span-7">
          <div className="panel-raised relative overflow-hidden">
            <div className="relative h-64 overflow-hidden">
              <img src={FLOOD.streetFlood5} alt="Live flood view" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/95" />
              <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs backdrop-blur">
                <MapPin size={13} className="text-amber2-500" /> Mumbai, Maharashtra
              </div>
              <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-moss-500/15 px-2 py-0.5 text-xs text-moss-600">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-moss-500" /> Live
              </div>
            </div>
            <div className="relative -mt-8 px-6 pb-6">
              <div className="grid grid-cols-3 gap-3 text-center">
                <PreviewTile k="8" v="active zones" />
                <PreviewTile k="4" v="high risk" tone="rust" />
                <PreviewTile k="3 s" v="route calc" tone="moss" />
              </div>
              <ul className="mt-5 space-y-2 text-[12.5px]">
                {[
                  ['Andheri subway, water above 60 cm', 'High', 'rust'],
                  ['Hindmata junction, waterlogged', 'High', 'rust'],
                  ['Dadar TT, slow traffic', 'Medium', 'amber'],
                  ['Powai lake road, choked drains', 'Medium', 'amber'],
                ].map(([t, p, tone]) => (
                  <li key={t} className="flex items-center justify-between rounded-xl border border-ink-100 bg-paper-50 px-3 py-2">
                    <span className="text-ink-800">{t}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      tone === 'rust' ? 'bg-rust-500/15 text-rust-600' : 'bg-amber2-500/15 text-amber2-700'
                    }`}>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PreviewTile({ k, v, tone = 'ink' }) {
  const palette = {
    ink: 'bg-paper-50 text-ink-900',
    rust: 'bg-rust-500/10 text-rust-600',
    moss: 'bg-moss-500/10 text-moss-600',
  }[tone];
  return (
    <div className={`${palette} rounded-2xl p-4`}>
      <div className="serif text-3xl">{k}</div>
      <div className="mt-0.5 text-[10px] uppercase tracking-widest opacity-80">{v}</div>
    </div>
  );
}

function StatsStrip() {
  const stats = [
    { k: '₹14,000 Cr', v: 'in average flood losses per Indian monsoon.' },
    { k: '500+', v: 'lives lost in the 2005 Mumbai deluge alone.' },
    { k: '48%', v: 'of Indians live in flood prone districts.' },
    { k: '3 s', v: 'median time for Pravaah to recompute a safe route.' },
  ];
  return (
    <section className="border-y border-ink-100 bg-white">
      <div className="mx-auto grid max-w-[1280px] grid-cols-2 gap-y-12 px-6 py-16 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.k} className="px-2">
            <div className="serif text-5xl text-amber2-600">{s.k}</div>
            <p className="mt-3 text-sm leading-snug text-ink-700">{s.v}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function StoriesStrip() {
  const stories = [
    {
      img: FLOOD.streetFlood3,
      name: 'Sunita Deshmukh',
      role: 'Office commuter, Dadar',
      quote: 'Pravaah told me not to leave the house that morning. My neighbour tried the same route and got stuck for seven hours.',
    },
    {
      img: RESCUE.heli3,
      name: 'Capt. Arvind Rao',
      role: 'NDRF, Mumbai battalion',
      quote: 'The vulnerable persons layer is the first time we have names on a map before we even enter the colony.',
    },
    {
      img: FLOOD.streetFlood2,
      name: 'Faizan Khan',
      role: 'Ambulance driver, 108 service',
      quote: 'The ambulance profile does not just save me five minutes. On some days it saves a patient.',
    },
  ];
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-[1280px]">
        <SectionHead eyebrow="From the field" title="Three people. One shared map." />
        <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {stories.map((s) => (
            <div key={s.name} className="overflow-hidden rounded-3xl bg-white shadow-card card-hover">
              <div className="relative h-52 overflow-hidden">
                <img src={s.img} alt={s.role} className="h-full w-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <div className="serif text-xl">{s.name}</div>
                  <div className="text-[11px] opacity-85">{s.role}</div>
                </div>
              </div>
              <div className="p-5">
                <Quote size={16} className="text-amber2-500" />
                <p className="mt-2 text-sm leading-relaxed text-ink-700">
                  {s.quote}
                </p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-6 text-xs text-ink-500">
          Portraits above represent typical users of Pravaah. Names are illustrative.
        </p>
      </div>
    </section>
  );
}

function FeatureGrid() {
  const feats = [
    { Icon: Satellite, title: 'Satellite flood masks', body: 'Sentinel 2 passes feed a UNet that labels waterlogged neighbourhoods every revisit.' },
    { Icon: Camera, title: 'Vision verified reports', body: 'Gemini confirms each citizen photo really shows flooding, and estimates water depth from a glance.' },
    { Icon: RouteIcon, title: 'Dynamic safe routing', body: 'Routes avoid every high severity zone, and surface a safest available fallback when nothing is clean.' },
    { Icon: Siren, title: 'Ambulance priority', body: 'A dedicated vehicle profile keeps ambulances on the fastest open corridor, with hospital pre notification.' },
    { Icon: Users, title: 'Vulnerable registry', body: 'Families pre register elderly or disabled residents. Rescuers see them the moment water enters their pin code.' },
    { Icon: Phone, title: 'IVR and 2G ready', body: 'A call in number returns a route by voice, so a feature phone user is not left in the dark.' },
    { Icon: Globe2, title: 'Seven Indian languages', body: 'Spoken and written output in English, Hindi, Marathi, Tamil, Telugu, Bengali, Gujarati.' },
    { Icon: Lock, title: 'Private by design', body: 'Reports are anonymous by default and photo EXIF is stripped before any model sees them.' },
  ];
  return (
    <section id="features" className="bg-paper-50 px-6 py-24">
      <div className="mx-auto grid max-w-[1280px] items-start gap-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionHead eyebrow="Features" title="Every piece a city needs for a wet Tuesday." />
          <p className="mt-5 max-w-md text-ink-600">
            Pravaah is a working stack, not a slide deck. Each capability below ships in version one.
          </p>
          <div className="mt-8 overflow-hidden rounded-3xl shadow-card">
            <img src={RESCUE.heli4} alt="Rescue team in flooded terrain" className="h-72 w-full object-cover" />
          </div>
        </div>
        <div className="lg:col-span-8">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {feats.map(({ Icon, title, body }) => (
              <div key={title} className="panel p-5 card-hover">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber2-500/10 text-amber2-600">
                  <Icon size={18} />
                </div>
                <h3 className="mt-5 text-base font-semibold text-ink-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-600">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ForWhom() {
  const personas = [
    {
      img: FLOOD.streetFlood1,
      tag: 'For commuters',
      title: 'Know before you leave the gate.',
      body: 'Open Pravaah before you start the car. Get the safest route, the expected delay and a clear go or wait call.',
    },
    {
      img: RESCUE.heli2,
      tag: 'For first responders',
      title: 'See the city as it actually is.',
      body: 'Fire, ambulance and NDRF teams get a priority routing profile, SOS pins, and the full vulnerable persons layer.',
    },
    {
      img: FLOOD.streetFlood8,
      tag: 'For families',
      title: 'Watch over the people you love.',
      body: 'Register your parents or grandparents once. Pravaah pings you the moment water enters their locality.',
    },
  ];
  return (
    <section id="who" className="bg-white px-6 py-24">
      <div className="mx-auto max-w-[1280px]">
        <SectionHead eyebrow="For communities" title="Built with real neighbourhoods in mind." />
        <div className="mt-14 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {personas.map((p) => (
            <div key={p.tag} className="overflow-hidden rounded-3xl bg-paper-50 shadow-card card-hover">
              <div className="relative h-56 overflow-hidden">
                <img src={p.img} alt={p.title} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
                <span className="absolute left-4 top-4 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-amber2-700 backdrop-blur">
                  {p.tag}
                </span>
              </div>
              <div className="p-7">
                <h3 className="serif text-[28px] leading-[1.08] text-ink-900">
                  {p.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-ink-700">{p.body}</p>
                <div className="mt-7 flex items-center gap-1 text-xs font-medium text-amber2-700">
                  Learn more <ChevronRight size={13} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TechStrip() {
  return (
    <section id="stack" className="relative overflow-hidden bg-ink-900 px-6 py-24 text-white">
      <div className="absolute inset-0 opacity-30">
        <img src={RESCUE.heli1} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-ink-900/80" />
      </div>
      <div className="relative mx-auto grid max-w-[1280px] grid-cols-1 items-start gap-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs">
            <Sparkles size={12} className="text-amber2-400" /> Under the hood
          </div>
          <h2 className="mt-6 serif text-[42px] leading-[1.05] text-paper-50 sm:text-[52px]">
            Satellite, crowd and Gemini. One calm pipeline.
          </h2>
          <p className="mt-5 max-w-md text-white/75">
            Pravaah is built around fusion. No single signal is enough. Satellite gives coverage,
            citizens give ground truth, Gemini gives judgement, OSRM gives the route.
          </p>
        </div>
        <div className="lg:col-span-7">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              ['Satellite flood mask', 'A UNet on Sentinel 2 bands updates coverage every revisit.'],
              ['Gemini vision', 'Confirms every citizen photo and estimates water depth from a glance.'],
              ['Rules engine', 'Deterministic blocks for danger phrases like open manhole or live wire.'],
              ['OSRM routing', 'Avoid high severity zones first, degrade to safest available when forced.'],
              ['Priority profiles', 'Ambulance and NDRF corridors keep emergency vehicles moving.'],
              ['Learning loop', 'Every verified report trains the next revision of the satellite model.'],
            ].map(([h, b]) => (
              <div key={h} className="rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur">
                <div className="text-sm font-semibold">{h}</div>
                <p className="mt-1 text-xs text-white/75">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CTABlock() {
  return (
    <section className="relative overflow-hidden bg-paper-50 px-6 py-24">
      <div className="relative mx-auto max-w-[1280px] overflow-hidden rounded-[32px] shadow-raised">
        <img src={RESCUE.heli4} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-ink-900/95 via-ink-900/80 to-amber2-700/70" />
        <div className="relative grid grid-cols-1 items-center gap-8 p-10 text-white sm:p-14 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-amber2-300">
              <Megaphone size={12} /> Monsoon pledge
            </div>
            <h2 className="mt-5 serif text-[46px] leading-[1.03] sm:text-[60px]">
              Monsoon starts in weeks.<br />Be ready for the city.
            </h2>
            <p className="mt-5 max-w-xl text-white/85">
              Open the live Mumbai map, test a route, submit a report with a photo, and watch Pravaah
              reshape the city in front of you.
            </p>
          </div>
          <div className="flex flex-col items-start gap-3 lg:col-span-4 lg:items-end">
            <Link to="/map" className="flex items-center gap-2 rounded-full btn-amber px-5 py-3 text-sm">
              Open live map <ArrowRight size={16} />
            </Link>
            <Link to="/family" className="text-xs text-white/85 hover:text-white">
              Register a vulnerable family member
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHead({ eyebrow, title }) {
  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.22em] text-amber2-700">
        <Flame size={12} /> {eyebrow}
      </div>
      <h2 className="mt-4 serif text-[42px] leading-[1.03] text-ink-900 sm:text-[56px]">
        {title}
      </h2>
    </div>
  );
}
