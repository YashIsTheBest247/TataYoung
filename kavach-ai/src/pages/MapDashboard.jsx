import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Radio, Siren, Users, Route as RouteIcon, Loader2, LocateFixed, AlertTriangle,
  Phone, Satellite, Flame, Home,
} from 'lucide-react';
import NavBar from '../components/NavBar.jsx';
import { api } from '../lib/api.js';

const MUMBAI_CENTER = [19.0760, 72.8777];

const ZONE_STYLE = {
  high:   { color: '#c1372b', weight: 2, fillColor: '#c1372b', fillOpacity: 0.3 },
  medium: { color: '#d9951f', weight: 2, fillColor: '#d9951f', fillOpacity: 0.25 },
  low:    { color: '#3d8c69', weight: 2, fillColor: '#3d8c69', fillOpacity: 0.2 },
};

function dotIcon(color, pulse = false) {
  const anim = pulse ? 'animation: ping 1.6s cubic-bezier(0,0,0.2,1) infinite;' : '';
  return L.divIcon({
    className: '',
    html: `<div style="position:relative;width:18px;height:18px;">
      <div style="position:absolute;inset:0;background:${color};border:2px solid #fff;border-radius:9999px;box-shadow:0 2px 6px rgba(0,0,0,0.25), 0 0 0 2px ${color}44;"></div>
      ${pulse ? `<div style="position:absolute;inset:-6px;border-radius:9999px;background:${color};opacity:0.4;${anim}"></div>` : ''}
    </div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

const RED_DOT = dotIcon('#c1372b');
const AMBER_DOT = dotIcon('#d9951f');
const MOSS_DOT = dotIcon('#3d8c69');
const SOS_DOT = dotIcon('#c1372b', true);
const PIN_DOT = dotIcon('#d9951f');

const SHELTER_ICON = L.divIcon({
  className: '',
  html: `<div style="display:flex;align-items:center;justify-content:center;width:24px;height:24px;background:#2d4870;border:2px solid #fff;border-radius:6px;box-shadow:0 2px 6px rgba(0,0,0,0.3);color:#fff;font-weight:700;font-size:12px;font-family:Inter,sans-serif;">S</div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

export default function MapDashboard() {
  const [zones, setZones] = useState([]);
  const [reports, setReports] = useState([]);
  const [sos, setSos] = useState([]);
  const [vulnerable, setVulnerable] = useState([]);
  const [shelters, setShelters] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState(null);
  const [showVuln, setShowVuln] = useState(true);
  const [showShelters, setShowShelters] = useState(true);
  const [routeState, setRouteState] = useState({
    origin: [19.1197, 72.8468],
    dest: [19.0176, 72.8562],
    plan: null,
    vehicle: 'car',
    picking: null,
    loading: false,
  });

  const refresh = async () => {
    try {
      const [z, r, s, v, sh, a, st] = await Promise.all([
        api.zones(), api.reports(30), api.listSos(), api.listVulnerable(),
        api.shelters(), api.alerts(20), api.stats(),
      ]);
      setZones(z); setReports(r); setSos(s); setVulnerable(v);
      setShelters(sh); setAlerts(a); setStats(st);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 10000);
    return () => clearInterval(t);
  }, []);

  const runRoute = async () => {
    setRouteState((s) => ({ ...s, loading: true }));
    try {
      const plan = await api.route({
        origin_lat: routeState.origin[0],
        origin_lng: routeState.origin[1],
        dest_lat: routeState.dest[0],
        dest_lng: routeState.dest[1],
        vehicle: routeState.vehicle,
      });
      setRouteState((s) => ({ ...s, plan, loading: false }));
    } catch {
      setRouteState((s) => ({ ...s, loading: false }));
    }
  };

  return (
    <div className="min-h-screen bg-paper-50 text-ink-900">
      <NavBar />
      <div className="mx-auto max-w-[1440px] px-4 pt-5 pb-10">
        <PageHead stats={stats} />

        <div className="mt-5 grid grid-cols-12 gap-4">
          <section className="col-span-12 xl:col-span-9">
            <div className="panel-raised relative h-[640px] overflow-hidden">
              <MapContainer
                center={MUMBAI_CENTER}
                zoom={12}
                scrollWheelZoom
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                  maxZoom={19}
                />
                <MapClickCapture
                  picking={routeState.picking}
                  onPick={(ll) => {
                    if (routeState.picking === 'origin') {
                      setRouteState((s) => ({ ...s, origin: ll, picking: null }));
                    } else if (routeState.picking === 'dest') {
                      setRouteState((s) => ({ ...s, dest: ll, picking: null }));
                    }
                  }}
                />

                {zones.map((z) => (
                  <Circle
                    key={z.id}
                    center={[z.lat, z.lng]}
                    radius={z.radius_m}
                    pathOptions={ZONE_STYLE[z.severity]}
                  >
                    <Popup>
                      <div className="min-w-[200px]">
                        <div className="text-xs uppercase tracking-widest text-amber2-700">Flood zone</div>
                        <div className="mt-1 text-sm font-semibold">{z.name}</div>
                        <div className="mt-1 text-xs">Severity: <span className="font-semibold">{z.severity}</span></div>
                        <div className="text-xs text-ink-500">Source: {z.source}</div>
                      </div>
                    </Popup>
                  </Circle>
                ))}

                {reports.map((r) => (
                  <Marker
                    key={r.id}
                    position={[r.lat, r.lng]}
                    icon={r.severity === 'high' ? RED_DOT : r.severity === 'medium' ? AMBER_DOT : MOSS_DOT}
                  >
                    <Popup>
                      <div className="min-w-[220px]">
                        <div className="text-xs uppercase tracking-widest text-amber2-700">Citizen report</div>
                        <div className="mt-1 text-sm">{r.description}</div>
                        <div className="mt-2 text-xs text-ink-500">
                          AI: {r.ai_summary} ({r.ai_engine})
                        </div>
                        {r.water_depth_cm != null && (
                          <div className="mt-1 text-xs">Estimated depth: {r.water_depth_cm} cm</div>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                ))}

                {sos.map((s) => (
                  <Marker key={s.id} position={[s.lat, s.lng]} icon={SOS_DOT}>
                    <Popup>
                      <div className="min-w-[200px]">
                        <div className="text-xs uppercase tracking-widest text-rust-600">SOS</div>
                        <div className="mt-1 text-sm font-semibold">{s.person_name}</div>
                        <div className="mt-1 text-xs">{s.condition}</div>
                        {s.contact && <div className="mt-1 text-xs">Contact: {s.contact}</div>}
                      </div>
                    </Popup>
                  </Marker>
                ))}

                {showVuln && vulnerable.map((v) => (
                  <Marker key={v.id} position={[v.lat, v.lng]} icon={PIN_DOT}>
                    <Popup>
                      <div className="min-w-[200px]">
                        <div className="text-xs uppercase tracking-widest text-amber2-700">Vulnerable</div>
                        <div className="mt-1 text-sm font-semibold">{v.person_name}</div>
                        <div className="mt-1 text-xs">{v.condition}</div>
                        {v.age && <div className="text-xs">Age {v.age}</div>}
                        <div className="mt-1 text-xs">Contact: {v.primary_contact}</div>
                      </div>
                    </Popup>
                  </Marker>
                ))}

                {showShelters && shelters.map((sh) => (
                  <Marker key={sh.id} position={[sh.lat, sh.lng]} icon={SHELTER_ICON}>
                    <Popup>
                      <div className="min-w-[240px]">
                        <div className="text-xs uppercase tracking-widest text-deepwater-600">Relief shelter</div>
                        <div className="mt-1 text-sm font-semibold">{sh.name}</div>
                        <div className="mt-1 text-xs text-ink-600">{sh.address}</div>
                        <div className="mt-2 flex items-center gap-3 text-xs">
                          <span><span className="font-semibold">{sh.capacity}</span> capacity</span>
                          {sh.contact && <span className="font-mono text-[11px]">{sh.contact}</span>}
                        </div>
                        {sh.amenities && (
                          <div className="mt-1 text-[11px] text-ink-600">Amenities: {sh.amenities}</div>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                ))}

                <Marker position={routeState.origin} icon={dotIcon('#d9951f')}>
                  <Popup>Origin</Popup>
                </Marker>
                <Marker position={routeState.dest} icon={dotIcon('#3d8c69')}>
                  <Popup>Destination</Popup>
                </Marker>

                {routeState.plan && (
                  <Polyline
                    positions={routeState.plan.polyline.map((p) => [p.lat, p.lng])}
                    pathOptions={{
                      color: routeState.plan.status === 'safe' ? '#3d8c69'
                        : routeState.plan.status === 'safest_available' ? '#d9951f'
                        : '#c1372b',
                      weight: 5,
                      opacity: 0.9,
                      dashArray: routeState.plan.status === 'blocked' ? '6 10' : null,
                    }}
                  />
                )}
              </MapContainer>

              <Legend
                showVuln={showVuln} setShowVuln={setShowVuln}
                showShelters={showShelters} setShowShelters={setShowShelters}
              />
            </div>
          </section>

          <aside className="col-span-12 space-y-4 xl:col-span-3">
            <RoutePanel routeState={routeState} setRouteState={setRouteState} onRun={runRoute} />
            <SosPanel refresh={refresh} />
            <LiveFeed alerts={alerts} />
          </aside>
        </div>
      </div>
    </div>
  );
}

function PageHead({ stats }) {
  return (
    <div className="flex flex-col items-start justify-between gap-4 pt-3 sm:flex-row sm:items-end">
      <div>
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-amber2-700">
          <Flame size={12} /> Live map
        </div>
        <h1 className="mt-2 serif text-[44px] leading-[1.02] text-ink-900 sm:text-[56px]">
          Mumbai, right now.
        </h1>
      </div>
      <div className="flex flex-wrap gap-2">
        <StatPill k="High risk" v={stats?.zones_high ?? '–'} tone="rust" Icon={AlertTriangle} />
        <StatPill k="Medium" v={stats?.zones_medium ?? '–'} tone="amber" Icon={Satellite} />
        <StatPill k="Reports" v={stats?.reports_total ?? '–'} tone="ink" Icon={Radio} />
        <StatPill k="SOS open" v={stats?.sos_open ?? '–'} tone="rust" Icon={Siren} />
        <StatPill k="Vulnerable" v={stats?.vulnerable_registered ?? '–'} tone="moss" Icon={Users} />
        <StatPill k="Shelters" v={stats?.shelters_total ?? '–'} tone="water" Icon={Home} />
      </div>
    </div>
  );
}

function StatPill({ k, v, tone, Icon }) {
  const palette = {
    rust: 'border-rust-500/30 bg-rust-500/10 text-rust-600',
    amber: 'border-amber2-500/30 bg-amber2-500/10 text-amber2-700',
    moss: 'border-moss-500/30 bg-moss-500/10 text-moss-600',
    ink: 'border-ink-100 bg-white text-ink-700',
    water: 'border-deepwater-500/30 bg-deepwater-500/10 text-deepwater-600',
  }[tone];
  return (
    <div className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${palette}`}>
      <Icon size={14} />
      <div className="leading-tight">
        <div className="text-[10px] uppercase tracking-widest opacity-80">{k}</div>
        <div className="font-mono text-base">{v}</div>
      </div>
    </div>
  );
}

function Legend({ showVuln, setShowVuln, showShelters, setShowShelters }) {
  return (
    <div className="absolute left-4 top-4 z-[500] space-y-1 rounded-2xl border border-ink-100 bg-white/95 p-3 text-[11px] text-ink-800 backdrop-blur shadow-card">
      <div className="mb-1 text-[10px] uppercase tracking-widest text-ink-400">Legend</div>
      <LegendRow color="#c1372b" label="High risk flood zone" />
      <LegendRow color="#d9951f" label="Medium risk zone" />
      <LegendRow color="#3d8c69" label="Low risk / safe" />
      <LegendRow color="#d9951f" label="Vulnerable person" />
      <div className="flex items-center gap-2">
        <span className="flex h-3 w-3 items-center justify-center rounded-sm bg-deepwater-500 text-[8px] font-bold text-white">S</span>
        <span>Relief shelter</span>
      </div>
      <label className="mt-2 flex items-center gap-2 text-ink-600">
        <input
          type="checkbox"
          checked={showVuln}
          onChange={(e) => setShowVuln(e.target.checked)}
          className="accent-amber2-500"
        />
        Show vulnerable layer
      </label>
      <label className="flex items-center gap-2 text-ink-600">
        <input
          type="checkbox"
          checked={showShelters}
          onChange={(e) => setShowShelters(e.target.checked)}
          className="accent-amber2-500"
        />
        Show shelters
      </label>
    </div>
  );
}

function LegendRow({ color, label }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
      <span>{label}</span>
    </div>
  );
}

function MapClickCapture({ picking, onPick }) {
  useMapEvents({
    click(e) {
      if (!picking) return;
      onPick([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

function RoutePanel({ routeState, setRouteState, onRun }) {
  const { plan, vehicle, picking, loading, origin, dest } = routeState;
  const toneCls = plan?.status === 'safe'
    ? 'border-moss-500/40 bg-moss-500/10 text-moss-600'
    : plan?.status === 'safest_available'
      ? 'border-amber2-500/40 bg-amber2-500/10 text-amber2-700'
      : plan?.status === 'blocked'
        ? 'border-rust-500/40 bg-rust-500/10 text-rust-600'
        : 'border-ink-100 bg-white text-ink-500';

  return (
    <div className="panel p-5">
      <div className="flex items-center gap-2 text-sm font-semibold text-ink-900">
        <RouteIcon size={16} className="text-amber2-600" /> Plan a safe route
      </div>
      <p className="mt-1 text-[11px] text-ink-500">
        Click a point on the map, then set it as origin or destination.
      </p>

      <div className="mt-4 space-y-2 text-xs">
        <CoordRow
          label="Origin"
          coord={origin}
          active={picking === 'origin'}
          onPick={() => setRouteState((s) => ({ ...s, picking: 'origin' }))}
        />
        <CoordRow
          label="Destination"
          coord={dest}
          active={picking === 'dest'}
          onPick={() => setRouteState((s) => ({ ...s, picking: 'dest' }))}
        />
      </div>

      <div className="mt-4 flex items-center gap-1 rounded-full bg-paper-50 p-1 text-[11px]">
        {['pedestrian', 'car', 'ambulance'].map((v) => (
          <button
            key={v}
            onClick={() => setRouteState((s) => ({ ...s, vehicle: v }))}
            className={`flex-1 rounded-full px-2 py-1 capitalize ${
              vehicle === v ? 'bg-amber2-500 text-ink-900 font-semibold' : 'text-ink-500'
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      <button
        onClick={onRun}
        disabled={loading}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-full btn-amber py-2 text-sm disabled:opacity-60"
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <RouteIcon size={14} />}
        {loading ? 'Routing' : 'Find safe route'}
      </button>

      {plan && (
        <div className={`mt-4 rounded-2xl border p-3 text-xs ${toneCls}`}>
          <div className="flex items-center justify-between">
            <div className="font-semibold capitalize">{plan.status.replace('_', ' ')}</div>
            <div className="font-mono">{plan.distance_km} km · {plan.duration_min} min</div>
          </div>
          <p className="mt-2 text-ink-700">{plan.advice}</p>
          {plan.avoided_zones.length > 0 && (
            <div className="mt-2 text-ink-600">
              Avoided: {plan.avoided_zones.join(', ')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CoordRow({ label, coord, active, onPick }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-ink-100 bg-paper-50 px-3 py-2">
      <div>
        <div className="text-[10px] uppercase tracking-widest text-ink-400">{label}</div>
        <div className="font-mono text-[11px] text-ink-800">
          {coord[0].toFixed(4)}, {coord[1].toFixed(4)}
        </div>
      </div>
      <button
        onClick={onPick}
        className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${
          active ? 'bg-amber2-500 text-ink-900' : 'bg-ink-900 text-paper-50'
        }`}
      >
        <LocateFixed size={11} /> Pick
      </button>
    </div>
  );
}

function SosPanel({ refresh }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ person_name: '', condition: '', contact: '' });
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (!form.person_name || !form.condition) return;
    setBusy(true);
    try {
      await api.sos({
        ...form,
        lat: 19.0760 + (Math.random() - 0.5) * 0.08,
        lng: 72.8777 + (Math.random() - 0.5) * 0.08,
      });
      setForm({ person_name: '', condition: '', contact: '' });
      setOpen(false);
      refresh();
    } finally { setBusy(false); }
  };
  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-ink-900">
          <Siren size={16} className="text-rust-600" /> Raise an SOS
        </div>
        <button
          onClick={() => setOpen((o) => !o)}
          className="rounded-full bg-rust-500/15 px-3 py-1 text-xs font-medium text-rust-600"
        >
          {open ? 'Close' : 'New'}
        </button>
      </div>
      {open && (
        <div className="mt-3 space-y-2 text-xs">
          <input
            placeholder="Person name"
            value={form.person_name}
            onChange={(e) => setForm({ ...form, person_name: e.target.value })}
            className="w-full rounded-xl border border-ink-100 bg-white px-3 py-2 text-ink-900 outline-none focus:border-amber2-500"
          />
          <input
            placeholder="Condition (eg. stranded on terrace)"
            value={form.condition}
            onChange={(e) => setForm({ ...form, condition: e.target.value })}
            className="w-full rounded-xl border border-ink-100 bg-white px-3 py-2 text-ink-900 outline-none focus:border-amber2-500"
          />
          <input
            placeholder="Contact (optional)"
            value={form.contact}
            onChange={(e) => setForm({ ...form, contact: e.target.value })}
            className="w-full rounded-xl border border-ink-100 bg-white px-3 py-2 text-ink-900 outline-none focus:border-amber2-500"
          />
          <button
            onClick={submit}
            disabled={busy}
            className="flex w-full items-center justify-center gap-1 rounded-full bg-rust-600 py-2 text-xs font-semibold text-paper-50 disabled:opacity-60"
          >
            <Phone size={12} /> {busy ? 'Sending' : 'Broadcast SOS'}
          </button>
        </div>
      )}
      {!open && (
        <p className="mt-2 text-[11px] text-ink-500">
          Visible on the map to volunteers and first responders.
        </p>
      )}
    </div>
  );
}

function LiveFeed({ alerts }) {
  return (
    <div className="panel p-5">
      <div className="flex items-center gap-2 text-sm font-semibold text-ink-900">
        <Radio size={16} className="text-amber2-600" /> Live feed
      </div>
      <div className="mt-3 max-h-[260px] space-y-2 overflow-auto pr-1 text-[12px]">
        {alerts.length === 0 && (
          <div className="rounded-xl bg-paper-50 px-3 py-2 text-ink-500">
            Waiting for signal.
          </div>
        )}
        {alerts.map((a) => (
          <div key={a.id} className="rounded-xl border border-ink-100 bg-paper-50 px-3 py-2">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-ink-400">
              <span>{a.kind}</span>
              <span className="font-mono">{new Date(a.ts).toLocaleTimeString()}</span>
            </div>
            <div className="mt-1 text-ink-800">{a.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
