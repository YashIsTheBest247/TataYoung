"""Pravaah data layer.

Two backends are provided and selected at startup based on environment:

- SupabaseStore: durable Postgres storage via the Supabase SDK, used when
  SUPABASE_URL and SUPABASE_KEY are both set.
- InMemoryStore: deque + dict storage, used when Supabase is not configured.

Both expose the same methods so the FastAPI handlers never branch on the
backend. The in memory store seeds itself with Mumbai monsoon hotspots; the
Supabase store expects the SQL schema in supabase_schema.sql to have been
applied, which also seeds the same hotspots.
"""

from __future__ import annotations

import json
import os
import uuid
from collections import deque
from datetime import datetime, timezone
from typing import Any, Protocol


SEED_SHELTERS: list[dict[str, Any]] = [
    {"id": "S-BKC-01",  "name": "MMRDA Grounds BKC",       "address": "Bandra Kurla Complex, Bandra East",
     "lat": 19.0674, "lng": 72.8697, "capacity": 1200, "contact": "+91 22 2659 0000",
     "amenities": "Food, water, medical, mobile charging"},
    {"id": "S-DADR-01", "name": "Shivaji Park Shelter",    "address": "Dadar West",
     "lat": 19.0273, "lng": 72.8396, "capacity": 800,  "contact": "+91 22 2446 1000",
     "amenities": "Food, water, basic first aid"},
    {"id": "S-ANDH-01", "name": "Andheri Sports Complex",  "address": "Veera Desai Road, Andheri West",
     "lat": 19.1361, "lng": 72.8267, "capacity": 900,  "contact": "+91 22 2634 5000",
     "amenities": "Food, water, medical, blankets"},
    {"id": "S-WORL-01", "name": "NSCI Dome Worli",         "address": "Dr. Annie Besant Road, Worli",
     "lat": 18.9908, "lng": 72.8156, "capacity": 1500, "contact": "+91 22 2492 5000",
     "amenities": "Food, water, medical, mobile charging, pets allowed"},
    {"id": "S-POWA-01", "name": "IIT Bombay Open Ground",  "address": "Powai",
     "lat": 19.1334, "lng": 72.9133, "capacity": 600,  "contact": "+91 22 2572 2545",
     "amenities": "Food, water, student volunteers"},
    {"id": "S-GHAT-01", "name": "Ghatkopar Community Hall","address": "Ghatkopar East",
     "lat": 19.0863, "lng": 72.9091, "capacity": 500,  "contact": "+91 22 2510 0000",
     "amenities": "Food, water"},
]


SEED_ZONES: list[dict[str, Any]] = [
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


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class Store(Protocol):
    name: str
    def list_zones(self) -> list[dict]: ...
    def upsert_zone(self, zone: dict) -> None: ...
    def list_reports(self, limit: int) -> list[dict]: ...
    def add_report(self, report: dict) -> dict: ...
    def list_sos(self) -> list[dict]: ...
    def add_sos(self, sos: dict) -> dict: ...
    def list_vulnerable(self) -> list[dict]: ...
    def add_vulnerable(self, v: dict) -> dict: ...
    def list_alerts(self, limit: int) -> list[dict]: ...
    def add_alert(self, kind: str, text: str, extra: dict | None = None) -> None: ...
    def list_shelters(self) -> list[dict]: ...


# ---------------------------------------------------------------------------
# In memory implementation
# ---------------------------------------------------------------------------

class InMemoryStore:
    name = "memory"

    def __init__(self) -> None:
        self._zones: dict[str, dict] = {z["id"]: dict(z) for z in SEED_ZONES}
        self._shelters: dict[str, dict] = {s["id"]: dict(s) for s in SEED_SHELTERS}
        self._reports: deque = deque(maxlen=500)
        self._sos: dict[str, dict] = {}
        self._vulnerable: dict[str, dict] = {}
        self._alerts: deque = deque(maxlen=100)
        for z in SEED_ZONES:
            self.add_alert("zone", f"{z['name']} marked {z['severity']} risk", {"zone_id": z["id"]})

    def list_zones(self) -> list[dict]:
        return list(self._zones.values())

    def upsert_zone(self, zone: dict) -> None:
        self._zones[zone["id"]] = dict(zone)

    def list_reports(self, limit: int) -> list[dict]:
        return list(self._reports)[:limit]

    def add_report(self, report: dict) -> dict:
        rec = {**report}
        rec.setdefault("created_at", _now_iso())
        self._reports.appendleft(rec)
        return rec

    def list_sos(self) -> list[dict]:
        return list(self._sos.values())

    def add_sos(self, sos: dict) -> dict:
        rec = {**sos}
        rec.setdefault("created_at", _now_iso())
        rec.setdefault("status", "open")
        self._sos[rec["id"]] = rec
        return rec

    def list_vulnerable(self) -> list[dict]:
        return list(self._vulnerable.values())

    def add_vulnerable(self, v: dict) -> dict:
        rec = {**v}
        rec.setdefault("created_at", _now_iso())
        self._vulnerable[rec["id"]] = rec
        return rec

    def list_alerts(self, limit: int) -> list[dict]:
        return list(self._alerts)[:limit]

    def add_alert(self, kind: str, text: str, extra: dict | None = None) -> None:
        self._alerts.appendleft({
            "id": uuid.uuid4().hex[:8].upper(),
            "ts": _now_iso(),
            "kind": kind,
            "text": text,
            "extra": extra or {},
        })

    def list_shelters(self) -> list[dict]:
        return list(self._shelters.values())


# ---------------------------------------------------------------------------
# Supabase implementation
# ---------------------------------------------------------------------------

class SupabaseStore:
    name = "supabase"

    def __init__(self, url: str, key: str) -> None:
        from supabase import create_client  # type: ignore
        self.client = create_client(url, key)
        # Ensure seed zones exist. The SQL schema inserts them idempotently,
        # but this is a safety net for projects that forgot to run the SQL.
        self._ensure_seed()

    def _ensure_seed(self) -> None:
        try:
            res = self.client.table("zones").select("id").limit(1).execute()
            if not res.data:
                self.client.table("zones").upsert(SEED_ZONES).execute()
                for z in SEED_ZONES:
                    self.add_alert("zone", f"{z['name']} marked {z['severity']} risk", {"zone_id": z["id"]})
        except Exception as exc:
            print(f"[pravaah] supabase seed failed: {exc}")
        try:
            res = self.client.table("shelters").select("id").limit(1).execute()
            if not res.data:
                self.client.table("shelters").upsert(SEED_SHELTERS).execute()
        except Exception as exc:
            print(f"[pravaah] supabase shelter seed failed: {exc}")

    def list_zones(self) -> list[dict]:
        res = self.client.table("zones").select("*").execute()
        return res.data or []

    def upsert_zone(self, zone: dict) -> None:
        payload = {k: v for k, v in zone.items() if k in {
            "id", "lat", "lng", "radius_m", "severity", "name", "source",
        }}
        self.client.table("zones").upsert(payload).execute()

    def list_reports(self, limit: int) -> list[dict]:
        res = (self.client.table("reports")
               .select("*")
               .order("created_at", desc=True)
               .limit(limit)
               .execute())
        return res.data or []

    def add_report(self, report: dict) -> dict:
        payload = {k: v for k, v in report.items() if k in {
            "id", "lat", "lng", "description", "water_depth_cm", "severity",
            "confidence", "verified", "reporter_name", "ai_summary", "ai_engine",
        }}
        res = self.client.table("reports").insert(payload).execute()
        return (res.data or [report])[0]

    def list_sos(self) -> list[dict]:
        res = (self.client.table("sos")
               .select("*")
               .order("created_at", desc=True)
               .execute())
        return res.data or []

    def add_sos(self, sos: dict) -> dict:
        payload = {k: v for k, v in sos.items() if k in {
            "id", "lat", "lng", "person_name", "condition", "contact", "status",
        }}
        payload.setdefault("status", "open")
        res = self.client.table("sos").insert(payload).execute()
        return (res.data or [sos])[0]

    def list_vulnerable(self) -> list[dict]:
        res = (self.client.table("vulnerable")
               .select("*")
               .order("created_at", desc=True)
               .execute())
        return res.data or []

    def add_vulnerable(self, v: dict) -> dict:
        payload = {k: val for k, val in v.items() if k in {
            "id", "person_name", "age", "condition", "lat", "lng",
            "primary_contact", "secondary_contact",
        }}
        res = self.client.table("vulnerable").insert(payload).execute()
        return (res.data or [v])[0]

    def list_alerts(self, limit: int) -> list[dict]:
        res = (self.client.table("alerts")
               .select("*")
               .order("ts", desc=True)
               .limit(limit)
               .execute())
        rows = res.data or []
        for r in rows:
            raw = r.get("extra")
            if isinstance(raw, str):
                try:
                    r["extra"] = json.loads(raw)
                except Exception:
                    r["extra"] = {}
        return rows

    def add_alert(self, kind: str, text: str, extra: dict | None = None) -> None:
        payload = {
            "id": uuid.uuid4().hex[:8].upper(),
            "kind": kind,
            "text": text,
            "extra": extra or {},
        }
        try:
            self.client.table("alerts").insert(payload).execute()
        except Exception as exc:
            print(f"[pravaah] supabase add_alert failed: {exc}")

    def list_shelters(self) -> list[dict]:
        res = self.client.table("shelters").select("*").execute()
        return res.data or []


# ---------------------------------------------------------------------------
# Factory
# ---------------------------------------------------------------------------

def build_store() -> Store:
    url = os.getenv("SUPABASE_URL", "").strip()
    key = os.getenv("SUPABASE_KEY", "").strip() or os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip()
    if url and key:
        try:
            store = SupabaseStore(url, key)
            print(f"[pravaah] data store: supabase ({url})")
            return store
        except Exception as exc:
            print(f"[pravaah] supabase init failed, falling back to memory: {exc}")
    print("[pravaah] data store: in memory (volatile)")
    return InMemoryStore()
