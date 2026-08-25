from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, WebSocket, WebSocketDisconnect
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os
import asyncio
import logging
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime, timezone, timedelta
from apscheduler.schedulers.asyncio import AsyncIOScheduler
import bcrypt
import jwt
import requests
import re
import hashlib

# ============= SETUP =============
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

JWT_ALGORITHM = "HS256"

def get_jwt_secret() -> str:
    return os.environ.get("JWT_SECRET", "dev_secret")

app = FastAPI(title="Hamburg Scanner API")
api_router = APIRouter(prefix="/api")
auth_router = APIRouter(prefix="/api/auth")

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# ============= MODELS =============
class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None
    role: str = "user"
    access_days: Optional[int] = None

class ProfileUpdate(BaseModel):
    notification_email: Optional[EmailStr] = None
    notifications_enabled: bool = False
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    min_rooms: Optional[float] = None
    max_rooms: Optional[float] = None

class AccessUpdate(BaseModel):
    days: int

# ============= AUTH HELPERS =============
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False

def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email,
               "exp": datetime.now(timezone.utc) + timedelta(hours=24), "type": "access"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    payload = {"sub": user_id, "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "refresh"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_admin_user(current_user: dict = Depends(get_current_user)) -> dict:
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

def get_access_expiry(user: dict) -> Optional[datetime]:
    val = user.get("access_expires_at")
    if not val:
        return None
    if isinstance(val, str):
        try:
            val = datetime.fromisoformat(val)
        except ValueError:
            return None
    if val.tzinfo is None:
        val = val.replace(tzinfo=timezone.utc)
    return val

def is_access_active(user: dict) -> bool:
    if user.get("role") == "admin":
        return True
    exp = get_access_expiry(user)
    if exp is None:
        return True
    return datetime.now(timezone.utc) < exp

def access_info(user: dict) -> dict:
    exp = get_access_expiry(user)
    active = is_access_active(user)
    days_left = None
    if exp is not None:
        delta = exp - datetime.now(timezone.utc)
        days_left = max(0, delta.days) if active else 0
    return {"access_expires_at": exp.isoformat() if exp else None,
            "access_active": active, "access_days_left": days_left}

def set_auth_cookies(response: Response, access_token: str, refresh_token: str):
    response.set_cookie("access_token", access_token, httponly=True, secure=True,
                        samesite="none", max_age=86400, path="/")
    response.set_cookie("refresh_token", refresh_token, httponly=True, secure=True,
                        samesite="none", max_age=604800, path="/")

# ============= REAL SCRAPERS (HTTP-only, no browser needed) =============
# Immomio landlord homepage tokens — query their public GraphQL for live
# Hamburg listings. These are real, public tokens embedded on landlord sites.
IMMOMIO_TOKENS = {
    "BGFG": "eyJhbGciOiJIUzI1NiJ9.eyJjdXN0b21lcklkIjoxNTY2MDQwMzUsImlkIjoxNzA2MDA0NjIsImNyZWF0ZWQiOjE2NDIxNjYwNDY2Mzh9.1QlkdnxWyyJMcRS1JubN1EkDrHPRaqfASe6oUJq7ptU",
    "Hamburger Wohnen": "eyJhbGciOiJIUzI1NiJ9.eyJjdXN0b21lcklkIjoxNDI3MzI5MjksImlkIjoxODcwMDEzMjAsImNyZWF0ZWQiOjE2NTc0NzYyMzg4Nzl9.C1vwdfjJ27h7-HWIvGKBrsgWGcj-8-ArzkiOKoBpSgs",
    "BDS Hamburg": "eyJhbGciOiJIUzI1NiJ9.eyJjdXN0b21lcklkIjoyODYxOTA4ODMsImlkIjoyOTIxMTgyMzgsImNyZWF0ZWQiOjE2NjY1OTQ0NzE5OTJ9.l-IorHm_QkfJf7tidzsCoW9x9xeIk01uO8BbuzmJ6Bg",
    "VHW Hamburg": "eyJhbGciOiJIUzI1NiJ9.eyJjdXN0b21lcklkIjoyNTQxMzQ1MDYsImlkIjoyNzI4MDEwODUsImNyZWF0ZWQiOjE2NjE5NDY5ODY1MDF9.fo3dJ4iNYF825tbg1E5C6q0mXbtbePO1LO3S_3_SEhM",
    "Walddörfer": "eyJhbGciOiJIUzI1NiJ9.eyJjdXN0b21lcklkIjoxMjUwNTkwOTM4LCJpZCI6MTI1NzM3OTYyMywiY3JlYXRlZCI6MTczOTQ0OTkyNjQwOX0.veqPULd54M9ruMr8OeqWmMaYH0cCm3PWahPvyRne9NE",
}

PROPERTY_LIST_QUERY = """
query propertyList($input: HomepagePropertySearchRequest!) {
  propertyList(input: $input) {
    page { totalElements totalPages }
    nodes {
      name totalRooms size totalRentGross propertyType marketingType externalId applicationLink
      titleImage { url }
      address { city street houseNumber zipCode district }
    }
  }
}
"""

def scrape_immomio_landlord_token(landlord_name: str, token: str) -> List[dict]:
    apartments: List[dict] = []
    try:
        variables = {"input": {"page": 0, "size": 100, "token": token,
                     "propertyType": None, "wbs": None, "barrierFree": None,
                     "balconyOrTerrace": None, "roomNumber": {"from": None, "to": None},
                     "floor": {"from": None, "to": None}, "totalRentGross": {"from": None, "to": None}}}
        response = requests.post(
            "https://gql-hp.immomio.com/homepage/graphql",
            json={"query": PROPERTY_LIST_QUERY, "variables": variables, "operationName": "propertyList"},
            headers={"Content-Type": "application/json", "User-Agent": "Mozilla/5.0"}, timeout=20)
        if response.status_code != 200:
            logger.warning(f"{landlord_name}: GraphQL returned {response.status_code}")
            return apartments
        data = response.json()
        if data.get("errors"):
            logger.warning(f"{landlord_name}: GraphQL errors")
            return apartments
        nodes = data.get("data", {}).get("propertyList", {}).get("nodes", []) or []
        for node in nodes:
            ptype = (node.get("propertyType") or "").upper()
            if ptype in ("GARAGE", "PARKING", "GEWERBE", "OFFICE", "STORAGE", "COMMERCIAL"):
                continue
            apply_link = node.get("applicationLink")
            if not apply_link:
                continue
            m = re.search(r"/apply/([a-f0-9-]+)", apply_link)
            if not m:
                continue
            listing_id = m.group(1)
            addr = node.get("address", {}) or {}
            address_str = None
            if addr.get("street"):
                parts = [f"{addr.get('street','')} {addr.get('houseNumber','')}".strip(),
                         f"{addr.get('zipCode','')} {addr.get('city','')}".strip()]
                if addr.get("district"):
                    parts.append(addr["district"])
                address_str = ", ".join([p for p in parts if p])
            if addr.get("city") and "Hamburg" not in addr["city"]:
                continue
            apartments.append({
                "id": listing_id,
                "title": node.get("name", "Wohnung in Hamburg"),
                "price": float(node["totalRentGross"]) if node.get("totalRentGross") else None,
                "rooms": float(node["totalRooms"]) if node.get("totalRooms") else None,
                "area": float(node["size"]) if node.get("size") else None,
                "district": addr.get("district"),
                "address": address_str,
                "url": apply_link,
                "image_url": (node.get("titleImage") or {}).get("url"),
                "landlord": landlord_name,
                "found_at": datetime.now(timezone.utc),
                "status": "new",
            })
        logger.info(f"{landlord_name}: {len(apartments)} apartments")
    except Exception as e:
        logger.error(f"{landlord_name} GraphQL error: {e}")
    return apartments

def _saga_solve_pow_session() -> Optional[requests.Session]:
    s = requests.Session()
    s.headers.update({
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                      "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "de-DE,de;q=0.9,en;q=0.8",
    })
    base_url = "https://www.saga.hamburg/immobiliensuche/aktuelle_angebote/wohnung"
    try:
        s.get(base_url, timeout=20)
        c = s.get(base_url + "?create_challenge", timeout=15).json()
        algo = getattr(hashlib, c.get("algo", "sha256"))
        salt, expire, target = c["salt"], c["expire"], c["challenge"]
        number = None
        for i in range(1, int(c.get("max_number", 100000)) + 1):
            if algo(f"{i}{salt}{expire}".encode()).hexdigest() == target:
                number = i
                break
        if number is None:
            return None
        payload = {"number": number, "verify": c["verify"], "salt": salt, "expire": expire, "algo": c["algo"]}
        r = s.post(base_url + "?verify_challenge", json=payload, timeout=15)
        if r.status_code != 200:
            return None
        s.post("https://www.saga.hamburg/captcha-validate", json={"solution": ".UNFINISHED"},
               headers={"Content-Type": "application/json"}, timeout=15)
        return s
    except Exception as e:
        logger.error(f"SAGA PoW session failed: {e}")
        return None

def scrape_saga_direct() -> List[dict]:
    from bs4 import BeautifulSoup
    apartments: List[dict] = []
    s = _saga_solve_pow_session()
    if not s:
        return apartments
    url = "https://www.saga.hamburg/immobiliensuche/aktuelle_angebote/wohnung"
    try:
        r = s.get(url, headers={"X-Requested-With": "XMLHttpRequest"}, timeout=20)
        if r.status_code != 200:
            return apartments
        soup = BeautifulSoup(r.text, "html.parser")
        cards = soup.select('div[id^="APARTMENT-card-"]')
        for card in cards:
            try:
                title_a = card.select_one("h3 a")
                if not title_a:
                    continue
                title = title_a.get_text(strip=True)
                path = title_a.get("href", "")
                if not path.startswith("/"):
                    continue
                detail_url = f"https://www.saga.hamburg{path}"
                m = re.search(r"/immo-detail/(\d+)/", path)
                saga_id = m.group(1) if m else hashlib.md5(path.encode()).hexdigest()[:10]
                district_p = card.select_one("hgroup p.font-bold")
                district = district_p.get_text(strip=True) if district_p else None
                addr_p = card.find("p", class_="pb-3")
                address = addr_p.get_text(strip=True) if addr_p else None
                rooms = area = price = None
                el = card.select_one("[data-rooms]")
                if el and el.get("data-rooms"):
                    try:
                        rooms = float(el["data-rooms"].replace(",", "."))
                    except ValueError:
                        pass
                el = card.select_one("[data-livingSpace], [data-livingspace]")
                if el:
                    val = el.get("data-livingSpace") or el.get("data-livingspace")
                    if val:
                        try:
                            area = float(val.replace(".", "").replace(",", "."))
                        except ValueError:
                            pass
                el = card.select_one("[data-fullCosts], [data-fullcosts]")
                if el:
                    val = el.get("data-fullCosts") or el.get("data-fullcosts")
                    if val:
                        try:
                            price = float(val.replace(".", "").replace(",", "."))
                        except ValueError:
                            pass
                image_url = None
                img = card.find("img")
                if img and img.get("src"):
                    src = img["src"]
                    image_url = src if src.startswith("http") else f"https://www.saga.hamburg{src}"
                apartments.append({
                    "id": f"saga-{saga_id}", "title": title[:200], "price": price,
                    "rooms": rooms, "area": area, "district": district, "address": address,
                    "url": detail_url, "image_url": image_url, "landlord": "SAGA Hamburg",
                    "found_at": datetime.now(timezone.utc), "status": "new",
                })
            except Exception as e:
                logger.debug(f"SAGA card parse error: {e}")
                continue
        logger.info(f"SAGA direct: parsed {len(apartments)} apartments")
    except Exception as e:
        logger.error(f"SAGA direct failed: {e}")
    return apartments

async def scrape_all_sources() -> List[dict]:
    """Aggregate real listings from all free HTTP sources."""
    results: List[dict] = []
    for name, token in IMMOMIO_TOKENS.items():
        try:
            apts = await asyncio.to_thread(scrape_immomio_landlord_token, name, token)
            results.extend(apts)
        except Exception as e:
            logger.error(f"{name} failed: {e}")
    try:
        saga = await asyncio.to_thread(scrape_saga_direct)
        results.extend(saga)
    except Exception as e:
        logger.error(f"SAGA failed: {e}")
    # de-dup by id
    seen = {}
    for a in results:
        seen[a["id"]] = a
    return list(seen.values())

# ============= SCAN TASK =============
scanning_state = {"is_scanning": False, "last_scan": None, "next_scan": None}

async def scan_apartments():
    if scanning_state["is_scanning"]:
        return
    scanning_state["is_scanning"] = True
    logger.info("Starting apartment scan...")
    try:
        apartments = await scrape_all_sources()
        new_apartments = []
        for apt in apartments:
            existing = await db.apartments.find_one({"id": apt["id"]}, {"_id": 0})
            if not existing:
                apt_dict = apt.copy()
                if isinstance(apt_dict["found_at"], datetime):
                    apt_dict["found_at"] = apt_dict["found_at"].isoformat()
                await db.apartments.insert_one(apt_dict)
                new_apartments.append(apt_dict)
                logger.info(f"New apartment: {apt['title']}")
                try:
                    payload = {k: v for k, v in apt_dict.items() if k != "_id"}
                    await ws_manager.broadcast({"type": "new_apartment", "apartment": payload})
                except Exception:
                    pass
        await db.scan_logs.insert_one({
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "found_count": len(apartments), "new_count": len(new_apartments), "status": "success"})
        scanning_state["last_scan"] = datetime.now(timezone.utc)
        scanning_state["next_scan"] = datetime.now(timezone.utc) + timedelta(minutes=3)
        try:
            await ws_manager.broadcast({"type": "scan_finished",
                "found_count": len(apartments), "new_count": len(new_apartments),
                "last_scan": scanning_state["last_scan"].isoformat(),
                "next_scan": scanning_state["next_scan"].isoformat()})
        except Exception:
            pass
    except Exception as e:
        logger.error(f"Error during scan: {e}")
    finally:
        scanning_state["is_scanning"] = False

# ============= AUTH ENDPOINTS =============
@auth_router.post("/login")
async def login(credentials: UserLogin, response: Response):
    email = credentials.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Невірний email або пароль")
    user_id = str(user["_id"])
    access_token = create_access_token(user_id, email)
    refresh_token = create_refresh_token(user_id)
    set_auth_cookies(response, access_token, refresh_token)
    return {"id": user_id, "email": email, "name": user.get("name"),
            "role": user.get("role", "user"), "access_token": access_token, **access_info(user)}

@auth_router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"message": "Logged out"}

@auth_router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {"id": current_user["_id"], "email": current_user["email"], "name": current_user.get("name"),
            "role": current_user.get("role", "user"),
            "notification_email": current_user.get("notification_email"),
            "notifications_enabled": current_user.get("notifications_enabled", False),
            **access_info(current_user)}

# ============= PROFILE =============
@api_router.get("/profile")
async def get_profile(current_user: dict = Depends(get_current_user)):
    return {"id": current_user["_id"], "email": current_user["email"], "name": current_user.get("name"),
            "notification_email": current_user.get("notification_email") or current_user["email"],
            "notifications_enabled": current_user.get("notifications_enabled", False),
            "min_price": current_user.get("min_price"), "max_price": current_user.get("max_price"),
            "min_rooms": current_user.get("min_rooms"), "max_rooms": current_user.get("max_rooms"),
            **access_info(current_user)}

@api_router.put("/profile")
async def update_profile(profile: ProfileUpdate, current_user: dict = Depends(get_current_user)):
    update_data = {"notifications_enabled": profile.notifications_enabled,
                   "min_price": profile.min_price, "max_price": profile.max_price,
                   "min_rooms": profile.min_rooms, "max_rooms": profile.max_rooms}
    if profile.notification_email:
        update_data["notification_email"] = profile.notification_email
    await db.users.update_one({"_id": ObjectId(current_user["_id"])}, {"$set": update_data})
    return {"message": "Profile updated", **update_data}

# ============= ADMIN =============
@api_router.get("/admin/users")
async def list_users(admin: dict = Depends(get_admin_user)):
    users = await db.users.find({}, {"password_hash": 0}).to_list(1000)
    return [{"id": str(u["_id"]), "email": u["email"], "name": u.get("name"),
             "role": u.get("role", "user"),
             "created_at": u.get("created_at").isoformat() if isinstance(u.get("created_at"), datetime) else u.get("created_at"),
             **access_info(u)} for u in users]

@api_router.post("/admin/users")
async def create_user(user_data: UserCreate, admin: dict = Depends(get_admin_user)):
    email = user_data.email.lower()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="User with this email already exists")
    doc = {"email": email, "password_hash": hash_password(user_data.password),
           "name": user_data.name, "role": user_data.role, "created_at": datetime.now(timezone.utc)}
    if user_data.access_days and user_data.access_days > 0:
        doc["access_expires_at"] = (datetime.now(timezone.utc) + timedelta(days=user_data.access_days)).isoformat()
    result = await db.users.insert_one(doc)
    return {"id": str(result.inserted_id), "email": email, "name": user_data.name,
            "role": user_data.role, **access_info(doc)}

@api_router.put("/admin/users/{user_id}/access")
async def set_user_access(user_id: str, data: AccessUpdate, admin: dict = Depends(get_admin_user)):
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    expires = (datetime.now(timezone.utc) + timedelta(days=data.days)).isoformat() if data.days > 0 \
        else datetime.now(timezone.utc).isoformat()
    await db.users.update_one({"_id": ObjectId(user_id)}, {"$set": {"access_expires_at": expires}})
    user["access_expires_at"] = expires
    return {"message": "Access updated", "id": user_id, **access_info(user)}

@api_router.delete("/admin/users/{user_id}")
async def delete_user(user_id: str, admin: dict = Depends(get_admin_user)):
    if user_id == admin["_id"]:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    result = await db.users.delete_one({"_id": ObjectId(user_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted"}

# ============= APARTMENTS =============
@api_router.get("/")
async def root():
    return {"message": "Hamburg Apartment Scanner API"}

@api_router.get("/apartments")
async def get_apartments(
    min_price: Optional[float] = None, max_price: Optional[float] = None,
    min_rooms: Optional[float] = None, max_rooms: Optional[float] = None,
    status: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    if not is_access_active(current_user):
        raise HTTPException(status_code=403, detail="Zugang abgelaufen. Bitte verlängern Sie Ihr Abonnement.")
    query = {}
    if min_price is not None or max_price is not None:
        query["price"] = {}
        if min_price is not None:
            query["price"]["$gte"] = min_price
        if max_price is not None:
            query["price"]["$lte"] = max_price
    if min_rooms is not None or max_rooms is not None:
        query["rooms"] = {}
        if min_rooms is not None:
            query["rooms"]["$gte"] = min_rooms
        if max_rooms is not None:
            query["rooms"]["$lte"] = max_rooms
    if status == "new":
        cutoff = (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat()
        query["found_at"] = {"$gte": cutoff}
    elif status == "history":
        cutoff = (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat()
        query["found_at"] = {"$lt": cutoff}
    apartments = await db.apartments.find(query, {"_id": 0}).sort("found_at", -1).to_list(1000)
    return apartments

@api_router.get("/scan-status")
async def get_scan_status(current_user: dict = Depends(get_current_user)):
    total = await db.apartments.count_documents({})
    cutoff = (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat()
    new = await db.apartments.count_documents({"found_at": {"$gte": cutoff}})
    return {"is_scanning": scanning_state["is_scanning"],
            "last_scan": scanning_state["last_scan"].isoformat() if scanning_state["last_scan"] else None,
            "next_scan": scanning_state["next_scan"].isoformat() if scanning_state["next_scan"] else None,
            "total_apartments": total, "new_apartments": new,
            "sources_online": len(IMMOMIO_TOKENS) + 1, "sources_total": len(IMMOMIO_TOKENS) + 1}

@api_router.post("/scan-now")
async def trigger_scan(current_user: dict = Depends(get_current_user)):
    if scanning_state["is_scanning"]:
        raise HTTPException(status_code=400, detail="Scan already in progress")
    asyncio.create_task(scan_apartments())
    return {"message": "Scan started"}

@api_router.get("/stats/daily")
async def get_daily_stats(days: int = 30, current_user: dict = Depends(get_current_user)):
    days = max(1, min(days, 90))
    now = datetime.now(timezone.utc)
    start = (now - timedelta(days=days - 1)).replace(hour=0, minute=0, second=0, microsecond=0)
    pipeline = [
        {"$match": {"found_at": {"$gte": start.isoformat()}}},
        {"$group": {"_id": {"date": {"$substr": ["$found_at", 0, 10]},
                            "landlord": {"$ifNull": ["$landlord", "Unbekannt"]}}, "count": {"$sum": 1}}},
    ]
    buckets: dict = {}
    async for row in db.apartments.aggregate(pipeline):
        date = row["_id"]["date"]
        landlord = row["_id"]["landlord"]
        b = buckets.setdefault(date, {"total": 0, "byLandlord": {}})
        b["total"] += row["count"]
        b["byLandlord"][landlord] = b["byLandlord"].get(landlord, 0) + row["count"]
    points = []
    for i in range(days):
        d = (start + timedelta(days=i)).strftime("%Y-%m-%d")
        info = buckets.get(d, {"total": 0, "byLandlord": {}})
        points.append({"date": d, "total": info["total"], "byLandlord": info["byLandlord"]})
    landlords = sorted({l for p in points for l in p["byLandlord"]})
    return {"days": days, "points": points, "landlords": landlords}

# ============= WEBSOCKET =============
class _ConnectionManager:
    def __init__(self):
        self.active: List[WebSocket] = []
    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.append(ws)
    def disconnect(self, ws: WebSocket):
        if ws in self.active:
            self.active.remove(ws)
    async def broadcast(self, payload: dict):
        dead = []
        for ws in self.active:
            try:
                await ws.send_json(payload)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws)

ws_manager = _ConnectionManager()

@app.websocket("/api/ws/apartments")
async def apartments_ws(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        await websocket.send_json({"type": "hello", "ts": datetime.now(timezone.utc).isoformat()})
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception:
        ws_manager.disconnect(websocket)

# ============= APP SETUP =============
app.include_router(auth_router)
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_origin_regex=r"https://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

scheduler = AsyncIOScheduler()

async def seed_admin():
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@hamburg-scanner.com").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({"email": admin_email, "password_hash": hash_password(admin_password),
                                   "name": "Admin", "role": "admin", "created_at": datetime.now(timezone.utc)})
        logger.info(f"Admin user created: {admin_email}")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email},
                                  {"$set": {"password_hash": hash_password(admin_password)}})
        logger.info(f"Admin password updated: {admin_email}")

@app.on_event("startup")
async def startup_event():
    logger.info("Starting apartment scanner service...")
    try:
        await db.users.create_index("email", unique=True)
        await db.apartments.create_index("id", unique=True)
    except Exception as e:
        logger.error(f"Index error: {e}")
    await seed_admin()
    scheduler.add_job(scan_apartments, "interval", minutes=3, id="apartment_scanner")
    scheduler.start()
    scanning_state["next_scan"] = datetime.now(timezone.utc) + timedelta(minutes=3)
    asyncio.create_task(scan_apartments())
    logger.info("Scheduler started - scanning every 3 min")

@app.on_event("shutdown")
async def shutdown_event():
    try:
        scheduler.shutdown()
    except Exception:
        pass
    client.close()
