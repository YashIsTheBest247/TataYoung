import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Upload, Camera, Loader2, Send, CheckCircle2, AlertTriangle, MapPin, Flame } from 'lucide-react';
import NavBar from '../components/NavBar.jsx';
import SiteFooter from '../components/SiteFooter.jsx';
import { api, readFileAsDataUrl } from '../lib/api.js';
import { FLOOD } from '../lib/media.js';

const QUICK_LOCATIONS = [
  { label: 'Andheri subway', lat: 19.1197, lng: 72.8468 },
  { label: 'Dadar TT', lat: 19.0176, lng: 72.8562 },
  { label: 'Kurla LBS Road', lat: 19.0728, lng: 72.8826 },
  { label: 'Sion circle', lat: 19.0472, lng: 72.8632 },
  { label: 'Hindmata junction', lat: 19.0459, lng: 72.8395 },
  { label: 'Powai lake road', lat: 19.1176, lng: 72.9060 },
];

export default function ReportFlood() {
  const [form, setForm] = useState({
    lat: 19.1197,
    lng: 72.8468,
    description: '',
    water_depth_cm: '',
    reporter_name: '',
  });
  const [photo, setPhoto] = useState(null);
  const [photoData, setPhotoData] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const useLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (p) => setForm((f) => ({ ...f, lat: p.coords.latitude, lng: p.coords.longitude })),
      () => {},
    );
  };

  const handlePhoto = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPhoto(f);
    const url = await readFileAsDataUrl(f);
    setPhotoData(url);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.description.trim()) return;
    setSubmitting(true);
    setError(null);
    setResult(null);
    try {
      const payload = {
        lat: Number(form.lat),
        lng: Number(form.lng),
        description: form.description,
        water_depth_cm: form.water_depth_cm ? Number(form.water_depth_cm) : null,
        reporter_name: form.reporter_name || null,
        photo_base64: photoData || null,
      };
      const res = await api.submitReport(payload);
      setResult(res);
    } catch (err) {
      setError(err.message || 'Could not submit report. Is the backend running?');
    } finally {
      setSubmitting(false);
    }
  };

  const toneCls = {
    high:   'border-rust-500/40 bg-rust-500/10 text-rust-600',
    medium: 'border-amber2-500/40 bg-amber2-500/10 text-amber2-700',
    low:    'border-moss-500/40 bg-moss-500/10 text-moss-600',
  }[result?.severity ?? 'low'];

  return (
    <div className="min-h-screen bg-paper-50 text-ink-900">
      <NavBar />
      <section className="relative overflow-hidden border-b border-ink-100 bg-white">
        <div className="absolute inset-0 opacity-30">
          <img src={FLOOD.streetFlood7} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-white/70" />
        </div>
        <div className="relative mx-auto max-w-[1100px] px-6 py-16">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-amber2-700">
            <Flame size={12} /> Report
          </div>
          <h1 className="mt-3 serif text-[48px] leading-[1.02] text-ink-900 sm:text-[64px]">
            Tell the city what you see.
          </h1>
          <p className="mt-5 max-w-2xl text-ink-700">
            A single verified photo can reroute thousands of commuters and reach a stranded family
            faster. Pravaah uses Gemini to confirm each report before it hits the live map.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-[1100px] px-6 py-12">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <form onSubmit={submit} className="panel-raised p-7 lg:col-span-7">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-ink-900">Submit a report</h2>
              <button
                type="button"
                onClick={useLocation}
                className="flex items-center gap-1 rounded-full chip px-3 py-1 text-[11px]"
              >
                <MapPin size={12} /> Use my location
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <Label>Where is this?</Label>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {QUICK_LOCATIONS.map((q) => (
                    <button
                      key={q.label}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, lat: q.lat, lng: q.lng }))}
                      className="rounded-full border border-ink-100 bg-white px-3 py-1 text-[11px] text-ink-700 hover:border-amber2-500/50 hover:bg-paper-50"
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <TextInput
                    label="Latitude"
                    value={form.lat}
                    onChange={(v) => setForm({ ...form, lat: v })}
                    type="number" step="0.0001"
                  />
                  <TextInput
                    label="Longitude"
                    value={form.lng}
                    onChange={(v) => setForm({ ...form, lng: v })}
                    type="number" step="0.0001"
                  />
                </div>
              </div>

              <div>
                <Label>What do you see?</Label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={4}
                  placeholder="Example: Water above the knee at the Andheri subway. Traffic has stopped. A two wheeler is stuck."
                  className="mt-2 w-full resize-none rounded-xl border border-ink-100 bg-white px-3 py-2.5 text-sm text-ink-900 outline-none focus:border-amber2-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <TextInput
                  label="Approx depth (cm, optional)"
                  value={form.water_depth_cm}
                  onChange={(v) => setForm({ ...form, water_depth_cm: v })}
                  type="number" min="0" max="400"
                />
                <TextInput
                  label="Your name (optional)"
                  value={form.reporter_name}
                  onChange={(v) => setForm({ ...form, reporter_name: v })}
                />
              </div>

              <div>
                <Label>Photo (optional, verified by Gemini)</Label>
                <label className="mt-2 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-ink-200 bg-white px-4 py-6 text-sm text-ink-500 hover:border-amber2-500/50">
                  {photoData ? (
                    <img src={photoData} alt="preview" className="h-16 w-16 rounded-lg object-cover" />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-paper-50 text-ink-400">
                      <Camera size={22} />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-1 text-ink-900">
                      <Upload size={13} /> {photo ? photo.name : 'Upload a photo'}
                    </div>
                    <div className="text-[11px] text-ink-500">
                      JPG or PNG, under 4 MB. EXIF is stripped server side.
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhoto}
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-full btn-amber py-3 text-sm disabled:opacity-60"
              >
                {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                {submitting ? 'Submitting' : 'Submit report'}
              </button>
            </div>
          </form>

          <aside className="space-y-4 lg:col-span-5">
            <div className="panel p-6">
              <div className="text-[11px] uppercase tracking-widest text-amber2-700">What happens next</div>
              <ol className="mt-4 space-y-3 text-sm">
                <Step n="1" t="Pravaah verifies">
                  Gemini checks the photo and the text to confirm this is a real flood and estimate depth.
                </Step>
                <Step n="2" t="The zone updates">
                  Your report either lifts a nearby zone or creates a new one if nothing was there yet.
                </Step>
                <Step n="3" t="The city reroutes">
                  Every active route in that area reroutes within seconds. Vulnerable residents get a flag.
                </Step>
              </ol>
            </div>

            <div className="overflow-hidden rounded-3xl shadow-card">
              <img src={FLOOD.streetFlood6} alt="Field conditions" className="h-56 w-full object-cover" />
            </div>

            {result && (
              <div className={`rounded-2xl border p-5 ${toneCls}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    {result.verified ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                    Report {result.id}
                  </div>
                  <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] uppercase">
                    {result.ai_engine}
                  </span>
                </div>
                <div className="mt-3 text-sm text-ink-800">
                  Severity: <span className="font-semibold capitalize">{result.severity}</span>
                  {result.water_depth_cm != null && (
                    <> · Depth estimate {result.water_depth_cm} cm</>
                  )}
                </div>
                <p className="mt-2 text-xs text-ink-800">{result.ai_summary}</p>
                <div className="mt-4 text-right">
                  <Link to="/map" className="text-xs underline">See it on the live map</Link>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-2xl border border-rust-500/40 bg-rust-500/10 p-4 text-xs text-rust-600">
                {error}
              </div>
            )}
          </aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function Label({ children }) {
  return (
    <div className="text-[11px] font-medium uppercase tracking-widest text-ink-400">
      {children}
    </div>
  );
}

function TextInput({ label, value, onChange, type = 'text', ...rest }) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-ink-100 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-amber2-500"
        {...rest}
      />
    </label>
  );
}

function Step({ n, t, children }) {
  return (
    <li className="flex gap-3">
      <div className="flex h-7 w-7 flex-none items-center justify-center rounded-full border border-amber2-500/40 bg-amber2-500/10 font-mono text-[11px] text-amber2-700">
        {n}
      </div>
      <div>
        <div className="font-semibold text-ink-900">{t}</div>
        <p className="mt-0.5 text-xs text-ink-600">{children}</p>
      </div>
    </li>
  );
}
