import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Loader2, Send, UserPlus, Flame, Heart } from 'lucide-react';
import NavBar from '../components/NavBar.jsx';
import SiteFooter from '../components/SiteFooter.jsx';
import { api } from '../lib/api.js';
import { RESCUE, FLOOD } from '../lib/media.js';

const QUICK_LOCATIONS = [
  { label: 'Vile Parle', lat: 19.0995, lng: 72.8467 },
  { label: 'Bandra west', lat: 19.0596, lng: 72.8295 },
  { label: 'Dadar east', lat: 19.0186, lng: 72.8478 },
  { label: 'Chembur', lat: 19.0632, lng: 72.9000 },
  { label: 'Thane west', lat: 19.2183, lng: 72.9781 },
];

export default function FamilyRegister() {
  const [form, setForm] = useState({
    person_name: '',
    age: '',
    condition: '',
    lat: 19.0995,
    lng: 72.8467,
    primary_contact: '',
    secondary_contact: '',
  });
  const [registry, setRegistry] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const refresh = async () => {
    try {
      setRegistry(await api.listVulnerable());
    } catch { /* backend offline */ }
  };

  useEffect(() => { refresh(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.person_name || !form.condition || !form.primary_contact) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await api.registerVulnerable({
        person_name: form.person_name,
        age: form.age ? Number(form.age) : null,
        condition: form.condition,
        lat: Number(form.lat),
        lng: Number(form.lng),
        primary_contact: form.primary_contact,
        secondary_contact: form.secondary_contact || null,
      });
      setSuccess(res);
      setForm({ ...form, person_name: '', age: '', condition: '', primary_contact: '', secondary_contact: '' });
      refresh();
    } catch (err) {
      setError(err.message || 'Could not register. Is the backend running?');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper-50 text-ink-900">
      <NavBar />
      <section className="relative overflow-hidden border-b border-ink-100 bg-white">
        <div className="absolute inset-0 opacity-25">
          <img src={RESCUE.heli2} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-white/70" />
        </div>
        <div className="relative mx-auto max-w-[1100px] px-6 py-16">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-amber2-700">
            <Flame size={12} /> Family registry
          </div>
          <h1 className="mt-3 serif text-[48px] leading-[1.02] text-ink-900 sm:text-[64px]">
            Register the ones<br />who cannot run.
          </h1>
          <p className="mt-5 max-w-2xl text-ink-700">
            Elderly parents, bedridden patients, disabled residents, infants. When water rises,
            first responders see this layer first. Register once, and your family is never invisible.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-[1100px] px-6 py-12">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <form onSubmit={submit} className="panel-raised p-7 lg:col-span-7">
            <div className="flex items-center gap-2 text-base font-semibold text-ink-900">
              <UserPlus size={16} className="text-amber2-600" /> Add a person
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextInput label="Full name" value={form.person_name} onChange={(v) => setForm({ ...form, person_name: v })} />
              <TextInput label="Age" value={form.age} onChange={(v) => setForm({ ...form, age: v })} type="number" min="0" max="120" />
              <div className="sm:col-span-2">
                <Label>Condition or vulnerability</Label>
                <input
                  value={form.condition}
                  onChange={(e) => setForm({ ...form, condition: e.target.value })}
                  placeholder="Eg. bedridden after knee surgery, uses wheelchair, lives alone"
                  className="mt-1 w-full rounded-xl border border-ink-100 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-amber2-500"
                />
              </div>
              <TextInput label="Primary contact" value={form.primary_contact} onChange={(v) => setForm({ ...form, primary_contact: v })} placeholder="+91..." />
              <TextInput label="Secondary contact (optional)" value={form.secondary_contact} onChange={(v) => setForm({ ...form, secondary_contact: v })} placeholder="+91..." />
            </div>

            <div className="mt-5">
              <Label>Where do they live?</Label>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {QUICK_LOCATIONS.map((q) => (
                  <button
                    key={q.label}
                    type="button"
                    onClick={() => setForm({ ...form, lat: q.lat, lng: q.lng })}
                    className="rounded-full border border-ink-100 bg-white px-3 py-1 text-[11px] text-ink-700 hover:border-amber2-500/50"
                  >
                    {q.label}
                  </button>
                ))}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <TextInput label="Latitude" value={form.lat} onChange={(v) => setForm({ ...form, lat: v })} type="number" step="0.0001" />
                <TextInput label="Longitude" value={form.lng} onChange={(v) => setForm({ ...form, lng: v })} type="number" step="0.0001" />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full btn-amber py-3 text-sm disabled:opacity-60"
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              {submitting ? 'Registering' : 'Register with Pravaah'}
            </button>

            {success && (
              <div className="mt-4 rounded-xl border border-moss-500/40 bg-moss-500/10 p-3 text-sm text-moss-600">
                Added. {success.person_name} is now on the vulnerable layer with ID {success.id}.
                <Link to="/map" className="ml-2 underline">See the map</Link>
              </div>
            )}
            {error && (
              <div className="mt-4 rounded-xl border border-rust-500/40 bg-rust-500/10 p-3 text-sm text-rust-600">
                {error}
              </div>
            )}
          </form>

          <aside className="space-y-4 lg:col-span-5">
            <div className="overflow-hidden rounded-3xl shadow-card">
              <img src={FLOOD.streetFlood3} alt="Flooded neighbourhood" className="h-56 w-full object-cover" />
            </div>
            <div className="panel p-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-ink-900">
                <Users size={16} className="text-amber2-600" /> Registered ({registry.length})
              </div>
              <div className="mt-3 max-h-[320px] space-y-2 overflow-auto pr-1 text-[12.5px]">
                {registry.length === 0 && (
                  <div className="rounded-xl bg-paper-50 px-3 py-2 text-ink-500">
                    No one registered yet. Add a family member above.
                  </div>
                )}
                {registry.map((v) => (
                  <div key={v.id} className="rounded-xl border border-ink-100 bg-paper-50 px-3 py-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-ink-900">{v.person_name}</span>
                      {v.age && <span className="text-[11px] text-ink-500">Age {v.age}</span>}
                    </div>
                    <div className="mt-0.5 text-ink-700">{v.condition}</div>
                    <div className="mt-1 text-[11px] text-ink-400 font-mono">
                      {v.lat.toFixed(3)}, {v.lng.toFixed(3)} · {v.primary_contact}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="panel p-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-ink-900">
                <Heart size={16} className="text-amber2-600" /> Why this matters
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink-700">
                In the 2015 Chennai floods, over sixty per cent of elderly victims lived alone or
                with another elderly person. Rescuers often did not know they were there. Pravaah
                closes that gap, long before the water rises.
              </p>
            </div>
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
