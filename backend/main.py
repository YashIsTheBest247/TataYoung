"""Pravaah FastAPI backend.

Pravaah is an AI powered flood navigation service for Indian cities.
During urban flooding people have no reliable way to know which roads are
usable. Pravaah fuses satellite derived flood masks, crowdsourced citizen
reports (with Gemini vision verification) and a routing engine to produce
live safe routes, a community flood map and an SOS layer for the elderly
and the disabled.

Endpoints
    GET  /                       service metadata
    GET  /api/health             liveness
    GET  /api/zones              current flood zones (seeded + computed)
    GET  /api/reports            list recent citizen reports
    POST /api/reports            submit a report, optional photo analysed by Gemini
    POST /api/route              compute a safe route avoiding flooded zones
    POST /api/sos                broadcast an SOS from a vulnerable person
    GET  /api/sos                list active SOS pins (volunteers see this)
    POST /api/vulnerable         register an elderly or disabled person
    GET  /api/vulnerable         list registered vulnerable persons
    GET  /api/stats              dashboard summary metrics
    GET  /api/alerts             rolling live feed of recent events

Environment
    GEMINI_API_KEY   enables live photo verification and text analysis.
                     Without it, heuristic fallbacks keep the service
                     fully functional for a demo.
    GEMINI_MODEL     defaults to gemini-2.0-flash.
"""

from __future__ import annotations

import asyncio
import base64
import json
import math
import os
import re
import uuid
from collections import deque
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import Literal

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash").strip()

SELF_PING_URL = os.getenv("SELF_PING_URL", "").strip()
SELF_PING_INTERVAL = int(os.getenv("SELF_PING_INTERVAL", "12"))
CORS_ORIGINS = [
    o.strip() for o in os.getenv("CORS_ORIGINS", "*").split(",") if o.strip()
] or ["*"]

_client = None
if GEMINI_API_KEY:
    try:
        from google import genai  # type: ignore
        _client = genai.Client(api_key=GEMINI_API_KEY)
    except Exception as exc:  # pragma: no cover
        print(f"[pravaah] Gemini client init failed: {exc}")
        _client = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    task: asyncio.Task | None = None
    if SELF_PING_URL:
        task = asyncio.create_task(_self_ping_loop(SELF_PING_URL, SELF_PING_INTERVAL))
        print(f"[pravaah] self ping started, target={SELF_PING_URL} every {SELF_PING_INTERVAL}s")
    try:
        yield
    finally:
        if task:
            task.cancel()
            try:
                await task
            except asyncio.CancelledError:
                pass


async def _self_ping_loop(url: str, interval: int) -> None:
    """Keep a free tier backend awake by hitting its own health endpoint.

    On Render free plan the service sleeps after about fifteen minutes of
    inactivity. The small cost of pinging ourselves keeps it hot during a
    live demo window.
    """
    delay = max(5, interval)
    async with httpx.AsyncClient(timeout=10.0) as client:
        # Small initial delay so the first request happens after startup.
        await asyncio.sleep(2)
        while True:
            try:
                await client.get(url)
            except Exception as exc:
                print(f"[pravaah] self ping failed: {exc}")
            await asyncio.sleep(delay)


app = FastAPI(title="Pravaah API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# In memory state. Replace with Postgres + PostGIS in production.
# ---------------------------------------------------------------------------

ALERTS: deque = deque(maxlen=100)


def _alert(kind: str, text: str, extra: dict | None = None) -> None:
    ALERTS.appendleft({
        "id": uuid.uuid4().hex[:8].upper(),
        "ts": datetime.now(timezone.utc).isoformat(),
        "kind": kind,
        "text": text,
        **(extra or {}),
    })


# Seed data for Mumbai during a monsoon day. Coordinates are approximate.
# Each zone is a circle: lat, lng, radius in metres, severity, source.
SEED_ZONES: list[dict] = [
    {"id": "Z-ANDH-01", "lat": 19.1197, "lng": 72.8468, "radius_m": 650,
     "severity": "high", "name": "Andheri subway", "source": "satellite+reports"},
    {"id": "Z-KURL-01", "lat": 19.0728, "lng": 72.8826, "radius_m": 900,
     "severity": "high", "name": "Kurla LBS stretch", "source": "satellite"},
    {"id": "Z-SION-01", "lat": 19.0472, "lng": 72.8632, "radius_m": 500,
     "severity": "medium", "name": "Sion circle", "source": "reports"},
    {"id": "Z-DADR-01", "lat": 19.0176, "lng": 72.8562, "radius_m": 420,
     "severity": "medium", "name": "Dadar TT", "source": "reports"},
    {"id": "Z-HIND-01", "lat": 19.0459, "lng": 72.8395, "radius_m": 700,
     "severity": "high", "name": "Hindmata junction", "source": "satellite+reports"},
    {"id": "Z-BAND-01", "lat": 19.0596, "lng": 72.8295, "radius_m": 350,
     "severity": "medium", "name": "Bandra reclamation", "source": "reports"},
    {"id": "Z-WORL-01", "lat": 18.9930, "lng": 72.8176, "radius_m": 400,
     "severity": "low", "name": "Worli sea face", "source": "satellite"},
    {"id": "Z-POWA-01", "lat": 19.1176, "lng": 72.9060, "radius_m": 800,
     "severity": "medium", "name": "Powai lake road", "source": "reports"},
]

ZONES: dict[str, dict] = {z["id"]: dict(z) for z in SEED_ZONES}
REPORTS: deque = deque(maxlen=500)
SOS: dict[str, dict] = {}
VULNERABLE: dict[str, dict] = {}

for z in SEED_ZONES:
    _alert("zone", f"{z['name']} marked {z['severity']} risk", {"zone_id": z["id"]})


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

Severity = Literal["low", "medium", "high"]
VehicleType = Literal["pedestrian", "car", "ambulance"]


class ReportIn(BaseModel):
    lat: float
    lng: float
    description: str = Field(..., min_length=1, max_length=600)
    water_depth_cm: int | None = Field(default=None, ge=0, le=400)
    severity_hint: Severity | None = None
    reporter_name: str | None = None
    photo_base64: str | None = None  # data URI or raw base64


class ReportOut(BaseModel):
    id: str
    created_at: str
    lat: float
    lng: float
    description: str
    water_depth_cm: int | None
    severity: Severity
    confidence: int
    verified: bool
    reporter_name: str | None
    ai_summary: str
    ai_engine: Literal["gemini", "heuristic"]


class RouteRequest(BaseModel):
    origin_lat: float
    origin_lng: float
    dest_lat: float
    dest_lng: float
    vehicle: VehicleType = "car"


class RoutePoint(BaseModel):
    lat: float
    lng: float


class RouteResponse(BaseModel):
    polyline: list[RoutePoint]
    distance_km: float
    duration_min: int
    avoided_zones: list[str]
    status: Literal["safe", "safest_available", "blocked"]
    advice: str


class SosIn(BaseModel):
    lat: float
    lng: float
    person_name: str
    condition: str
    contact: str | None = None


class VulnerableIn(BaseModel):
    person_name: str
    age: int | None = None
    condition: str
    lat: float
    lng: float
    primary_contact: str
    secondary_contact: str | None = None


# ---------------------------------------------------------------------------
# Geo helpers
# ---------------------------------------------------------------------------

EARTH_R = 6371000.0


def haversine(a_lat: float, a_lng: float, b_lat: float, b_lng: float) -> float:
    phi1 = math.radians(a_lat)
    phi2 = math.radians(b_lat)
    d_phi = math.radians(b_lat - a_lat)
    d_lam = math.radians(b_lng - a_lng)
    a = math.sin(d_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(d_lam / 2) ** 2
    return 2 * EARTH_R * math.asin(math.sqrt(a))


def point_in_zone(lat: float, lng: float, zone: dict) -> bool:
    return haversine(lat, lng, zone["lat"], zone["lng"]) <= zone["radius_m"]


def nearest_zone(lat: float, lng: float) -> tuple[dict | None, float]:
    best = None
    best_d = float("inf")
    for z in ZONES.values():
        d = haversine(lat, lng, z["lat"], z["lng"]) - z["radius_m"]
        if d < best_d:
            best_d = d
            best = z
    return best, best_d


# ---------------------------------------------------------------------------
# Report analysis
# ---------------------------------------------------------------------------

DEPTH_HINTS = [
    (re.compile(r"knee\s*deep|above\s*knee", re.I), 60),
    (re.compile(r"waist\s*deep", re.I), 100),
    (re.compile(r"ankle\s*deep|up\s*to\s*ankle", re.I), 15),
    (re.compile(r"(\d{2,3})\s*(cm|centimetre|centimeter)", re.I), None),
    (re.compile(r"(\d(?:\.\d)?)\s*(ft|feet|foot)", re.I), None),
]


def heuristic_report(text: str, depth_cm: int | None, hint: Severity | None) -> dict:
    t = text.lower()
    inferred = depth_cm

    for pat, fixed in DEPTH_HINTS:
        m = pat.search(t)
        if not m:
            continue
        if fixed is not None:
            inferred = inferred or fixed
            break
        value = float(m.group(1))
        unit = m.group(2).lower() if m.lastindex and m.lastindex >= 2 else ""
        if "ft" in unit or "foot" in unit or "feet" in unit:
            inferred = int(value * 30)
        else:
            inferred = int(value)
        break

    danger_words = any(w in t for w in [
        "stuck", "swept", "drowning", "trapped", "car floating", "manhole open",
        "live wire", "electric", "flowing fast", "current",
    ])

    if hint:
        severity = hint
    elif (inferred and inferred >= 60) or danger_words:
        severity = "high"
    elif (inferred and inferred >= 25) or any(w in t for w in ["waterlogged", "flooded", "water on road"]):
        severity = "medium"
    else:
        severity = "low"

    summary = (
        f"Citizen reports flooding"
        + (f" around {inferred} cm" if inferred else "")
        + (". Danger signals present." if danger_words else ".")
    )
    return {
        "severity": severity,
        "confidence": 60,
        "verified": False,
        "water_depth_cm": inferred,
        "ai_summary": summary,
        "ai_engine": "heuristic",
    }


GEMINI_REPORT_PROMPT = """You are Pravaah, a flood field intelligence agent for Indian cities.

Given a short field report from a citizen (and possibly a photo), produce a strict JSON object:
{
  "severity": "low" | "medium" | "high",
  "confidence": integer 0 to 100,
  "verified": boolean (true if the photo clearly shows flooding on a road),
  "water_depth_cm": integer or null,
  "ai_summary": "one or two sentences describing what is on the ground, in simple words"
}

Guidance:
- Knee deep is around 50 to 70 cm. Waist deep is 90 to 110 cm. Above waist is high severity.
- If the photo shows a dry road, mark severity low and verified false, and say the report could not be confirmed.
- Fast flowing water, open manholes, sparking wires or stranded vehicles mean high severity.
- Return ONLY JSON. No markdown fences, no commentary.
"""


def gemini_report(text: str, depth_cm: int | None, photo_b64: str | None) -> dict | None:
    if _client is None:
        return None
    try:
        from google.genai import types  # type: ignore

        parts: list = [f"{GEMINI_REPORT_PROMPT}\n\nCitizen text: {text}\nUser estimate (cm): {depth_cm}"]
        if photo_b64:
            raw = photo_b64
            if raw.startswith("data:"):
                raw = raw.split(",", 1)[-1]
            try:
                data = base64.b64decode(raw)
                parts.append(types.Part.from_bytes(data=data, mime_type="image/jpeg"))
            except Exception:
                pass

        resp = _client.models.generate_content(model=GEMINI_MODEL, contents=parts)
        raw = (resp.text or "").strip()
        if raw.startswith("```"):
            raw = re.sub(r"^```(?:json)?\s*", "", raw)
            raw = re.sub(r"\s*```$", "", raw)
        data = json.loads(raw)
        sev = data.get("severity", "low")
        if sev not in ("low", "medium", "high"):
            sev = "low"
        return {
            "severity": sev,
            "confidence": int(max(0, min(100, data.get("confidence", 65)))),
            "verified": bool(data.get("verified", False)),
            "water_depth_cm": data.get("water_depth_cm"),
            "ai_summary": str(data.get("ai_summary", "")).strip() or "Analysed by Pravaah.",
            "ai_engine": "gemini",
        }
    except Exception as exc:  # pragma: no cover
        print(f"[pravaah] Gemini report failed: {exc}")
        return None


def ingest_zone_from_report(rep: dict) -> None:
    """Create or strengthen a zone near a citizen report."""
    near, dist = nearest_zone(rep["lat"], rep["lng"])
    if near and dist < 400:
        order = {"low": 0, "medium": 1, "high": 2}
        if order[rep["severity"]] > order[near["severity"]]:
            near["severity"] = rep["severity"]
            near["source"] = (near.get("source", "") + "+reports").strip("+")
            _alert("zone_upgrade", f"{near['name']} upgraded to {near['severity']} after new report", {"zone_id": near["id"]})
        return
    new_id = f"Z-RPT-{len(ZONES) + 1:03d}"
    ZONES[new_id] = {
        "id": new_id,
        "lat": rep["lat"],
        "lng": rep["lng"],
        "radius_m": 250 if rep["severity"] != "high" else 450,
        "severity": rep["severity"],
        "name": "Reported flooding",
        "source": "reports",
    }
    _alert("zone_new", f"New flooded area reported near {rep['lat']:.3f}, {rep['lng']:.3f}", {"zone_id": new_id})


# ---------------------------------------------------------------------------
# Routing
# ---------------------------------------------------------------------------

def _offset(lat: float, lng: float, meters_n: float, meters_e: float) -> tuple[float, float]:
    d_lat = meters_n / 111320.0
    d_lng = meters_e / (111320.0 * math.cos(math.radians(lat)))
    return lat + d_lat, lng + d_lng


def segment_crosses_zone(a_lat: float, a_lng: float, b_lat: float, b_lng: float, z: dict) -> bool:
    # Sample along segment and check containment.
    steps = max(6, int(haversine(a_lat, a_lng, b_lat, b_lng) / 60))
    for i in range(steps + 1):
        t = i / steps
        lat = a_lat + (b_lat - a_lat) * t
        lng = a_lng + (b_lng - a_lng) * t
        if point_in_zone(lat, lng, z):
            return True
    return False


def crossed_zones(path: list[tuple[float, float]], severities: set[str]) -> list[dict]:
    hits = []
    for z in ZONES.values():
        if z["severity"] not in severities:
            continue
        if any(segment_crosses_zone(path[i][0], path[i][1], path[i + 1][0], path[i + 1][1], z)
               for i in range(len(path) - 1)):
            hits.append(z)
    return hits


def plan_route(origin: tuple[float, float], dest: tuple[float, float], vehicle: VehicleType):
    avoid: set[str] = {"high"}
    if vehicle in ("pedestrian", "car"):
        avoid.add("medium")

    # Start with a 2 point straight path, then route around zones with up to
    # three waypoints perpendicular to the leg.
    path = [origin, dest]
    avoided_names: list[str] = []
    for _ in range(6):
        hits = crossed_zones(path, avoid)
        if not hits:
            break
        z = hits[0]
        avoided_names.append(z["name"])
        # Pick a waypoint offset perpendicular to the straight leg.
        a_lat, a_lng = origin
        b_lat, b_lng = dest
        mid_lat = (a_lat + b_lat) / 2
        mid_lng = (a_lng + b_lng) / 2
        dx = b_lng - a_lng
        dy = b_lat - a_lat
        norm = math.sqrt(dx * dx + dy * dy) or 1
        # Perpendicular unit vector in degrees.
        px = -dy / norm
        py = dx / norm
        offset_m = z["radius_m"] * 1.6
        # Decide left/right based on which side of z the straight line is on.
        side = 1 if (dx * (z["lat"] - a_lat) - dy * (z["lng"] - a_lng)) > 0 else -1
        wp_lat, wp_lng = _offset(
            mid_lat, mid_lng,
            meters_n=side * py * offset_m,
            meters_e=side * px * offset_m,
        )
        path = [origin, (wp_lat, wp_lng), dest]
        if len(crossed_zones(path, avoid)) >= len(hits):
            # Could not improve. Try opposite side.
            wp_lat, wp_lng = _offset(
                mid_lat, mid_lng,
                meters_n=-side * py * offset_m,
                meters_e=-side * px * offset_m,
            )
            path = [origin, (wp_lat, wp_lng), dest]

    final_hits = crossed_zones(path, avoid)
    status = "safe" if not final_hits else ("safest_available" if len(final_hits) < 2 else "blocked")

    distance_m = sum(
        haversine(path[i][0], path[i][1], path[i + 1][0], path[i + 1][1])
        for i in range(len(path) - 1)
    )
    speed_mps = 1.3 if vehicle == "pedestrian" else (6.9 if vehicle == "car" else 8.3)
    duration_min = int(distance_m / speed_mps / 60) + 1

    advice_map = {
        "safe": "This route avoids all flagged flood zones. Normal travel is OK.",
        "safest_available": "This is the safest route we found right now, but one flagged zone could not be avoided fully. Travel only if essential, and go slow.",
        "blocked": "Multiple flooded stretches lie on every reasonable route. Please delay the trip and watch Pravaah for updates.",
    }

    return {
        "polyline": [RoutePoint(lat=p[0], lng=p[1]) for p in path],
        "distance_km": round(distance_m / 1000.0, 2),
        "duration_min": duration_min,
        "avoided_zones": avoided_names,
        "status": status,
        "advice": advice_map[status],
    }


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/")
def root():
    return {
        "service": "Pravaah",
        "version": "0.1.0",
        "gemini_enabled": _client is not None,
        "model": GEMINI_MODEL if _client else None,
        "city": "Mumbai",
    }


@app.get("/api/health")
def health():
    return {"ok": True, "ts": datetime.now(timezone.utc).isoformat()}


@app.get("/api/zones")
def list_zones():
    return {"items": list(ZONES.values())}


@app.get("/api/reports")
def list_reports(limit: int = 30):
    return {"items": list(REPORTS)[:limit]}


@app.post("/api/reports", response_model=ReportOut)
def create_report(req: ReportIn):
    analysis = gemini_report(req.description, req.water_depth_cm, req.photo_base64) \
        or heuristic_report(req.description, req.water_depth_cm, req.severity_hint)

    rec = {
        "id": uuid.uuid4().hex[:8].upper(),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "lat": req.lat,
        "lng": req.lng,
        "description": req.description,
        "reporter_name": req.reporter_name,
        **analysis,
    }
    REPORTS.appendleft(rec)
    ingest_zone_from_report(rec)
    _alert("report", f"New citizen report at {req.lat:.3f}, {req.lng:.3f}, severity {rec['severity']}", {"report_id": rec["id"]})
    return rec


@app.post("/api/route", response_model=RouteResponse)
def route(req: RouteRequest):
    plan = plan_route(
        (req.origin_lat, req.origin_lng),
        (req.dest_lat, req.dest_lng),
        req.vehicle,
    )
    _alert("route", f"Route computed, status {plan['status']}", {})
    return plan


@app.post("/api/sos")
def create_sos(req: SosIn):
    sid = uuid.uuid4().hex[:8].upper()
    SOS[sid] = {
        "id": sid,
        "created_at": datetime.now(timezone.utc).isoformat(),
        **req.model_dump(),
        "status": "open",
    }
    _alert("sos", f"SOS from {req.person_name}, condition: {req.condition}", {"sos_id": sid})
    return SOS[sid]


@app.get("/api/sos")
def list_sos():
    return {"items": list(SOS.values())}


@app.post("/api/vulnerable")
def register_vulnerable(req: VulnerableIn):
    vid = uuid.uuid4().hex[:8].upper()
    VULNERABLE[vid] = {
        "id": vid,
        "created_at": datetime.now(timezone.utc).isoformat(),
        **req.model_dump(),
    }
    _alert("vulnerable", f"Registered {req.person_name}, {req.condition}", {"vulnerable_id": vid})
    return VULNERABLE[vid]


@app.get("/api/vulnerable")
def list_vulnerable():
    return {"items": list(VULNERABLE.values())}


@app.get("/api/stats")
def stats():
    severities = {"low": 0, "medium": 0, "high": 0}
    for z in ZONES.values():
        severities[z["severity"]] = severities.get(z["severity"], 0) + 1
    return {
        "zones_total": len(ZONES),
        "zones_high": severities["high"],
        "zones_medium": severities["medium"],
        "zones_low": severities["low"],
        "reports_total": len(REPORTS),
        "sos_open": sum(1 for s in SOS.values() if s["status"] == "open"),
        "vulnerable_registered": len(VULNERABLE),
    }


@app.get("/api/alerts")
def list_alerts(limit: int = 30):
    return {"items": list(ALERTS)[:limit]}


# ---------------------------------------------------------------------------
# Chatbot
# ---------------------------------------------------------------------------

CHAT_SYSTEM = """You are Pravaah, a calm, friendly flood safety assistant for Indian cities.
You help residents, commuters, and first responders during monsoon flooding.

Scope:
- Flood safety, evacuation, which roads to avoid, how to help elderly or disabled residents.
- How to use Pravaah features: live map, submitting a report, registering vulnerable family members, raising SOS.
- Indian emergency numbers: 112 (ERSS), 108 (ambulance), 1077 (district disaster), 1930 (cyber crime).
- Short, specific, kind. No disclaimers. Use plain English with Hindi words where natural.

If asked something unrelated to floods, safety or Pravaah, politely steer back.
Keep replies under 90 words unless the user clearly wants more detail.
"""


class ChatTurn(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(..., min_length=1, max_length=2000)


class ChatRequest(BaseModel):
    history: list[ChatTurn] = Field(default_factory=list, max_length=20)
    message: str = Field(..., min_length=1, max_length=1200)


class ChatResponse(BaseModel):
    reply: str
    engine: Literal["gemini", "fallback"]


FALLBACK_HINTS = [
    (re.compile(r"stuck|trap|strand|help", re.I),
        "If you or someone else is stranded, dial 112 right now. Share your exact location. Move to the highest safe floor. Switch off the main power if water is near sockets. I can also help you raise an SOS inside Pravaah, which pins you on the live map."),
    (re.compile(r"route|road|safe|way", re.I),
        "Open the Live Map, pick an origin and destination and tap Find Safe Route. Pravaah avoids every high severity flood zone first. If no clean path exists, it will tell you clearly."),
    (re.compile(r"report|submit|photo|flood", re.I),
        "Tap Report in the top nav, drop a pin or use my location, add a short description and ideally a photo. Pravaah uses Gemini to verify the photo and estimate water depth, then updates the live map for everyone."),
    (re.compile(r"family|elderly|parent|vulnerable|wheelchair|bedridden", re.I),
        "Open Family, add your relative with their condition and primary contact. During an active flood event, rescuers near their locality see them first. Your data stays with you and the local control room."),
    (re.compile(r"112|108|1930|helpline|number", re.I),
        "India emergency numbers: 112 for any emergency, 108 for ambulance, 1077 for district disaster cell, 1930 for cyber crime. Save them in your phone today."),
    (re.compile(r"what\s+is\s+pravaah|what\s+does\s+pravaah|about\s+pravaah", re.I),
        "Pravaah is a live flood navigation layer for Indian cities. It fuses satellite imagery, citizen photos verified by Gemini, and a routing engine so you always know which road is still a road."),
]


def fallback_chat(message: str) -> str:
    for pat, resp in FALLBACK_HINTS:
        if pat.search(message):
            return resp
    return ("I am Pravaah, your flood safety helper. Ask me about safe routes, submitting a report, "
            "registering an elderly family member, or what to do if you are stranded. "
            "During a real emergency, dial 112.")


def gemini_chat(message: str, history: list[ChatTurn]) -> str | None:
    if _client is None:
        return None
    try:
        parts = [CHAT_SYSTEM]
        for turn in history[-8:]:
            parts.append(f"{turn.role.upper()}: {turn.content}")
        parts.append(f"USER: {message}")
        parts.append("ASSISTANT:")
        prompt = "\n\n".join(parts)
        resp = _client.models.generate_content(model=GEMINI_MODEL, contents=prompt)
        text = (resp.text or "").strip()
        if not text:
            return None
        # Strip leading role prefix if the model included it.
        text = re.sub(r"^(assistant|pravaah)\s*:\s*", "", text, flags=re.I)
        return text
    except Exception as exc:  # pragma: no cover
        print(f"[pravaah] Gemini chat failed: {exc}")
        return None


@app.post("/api/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    reply = gemini_chat(req.message, req.history)
    if reply:
        return {"reply": reply, "engine": "gemini"}
    return {"reply": fallback_chat(req.message), "engine": "fallback"}
