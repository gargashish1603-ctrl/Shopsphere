import json
import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr

from database import get_db, init_db
from auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
    get_current_user_optional,
    require_admin,
    require_seller_or_admin,
)

from fastapi.responses import RedirectResponse

app = FastAPI(title="ShopSphere API", version="1.0.0")

# Allow CORS for local frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", include_in_schema=False)
def root():
    return RedirectResponse(url="/docs")

@app.on_event("startup")
def startup():
    init_db(hash_password)

# --- Models ---
class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str = "buyer"  # "buyer" or "seller"

class LoginRequest(BaseModel):
    email: str
    password: str
    role: Optional[str] = None

class StatusUpdateRequest(BaseModel):
    status: str  # "active" or "suspended"

class ProductCreate(BaseModel):
    id: Optional[str] = None
    name: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = ""
    price: float = 0.0
    stock: Optional[int] = 10
    category: Optional[str] = "Other"
    condition: Optional[str] = "New"
    brand: Optional[str] = ""
    location: Optional[str] = "Online"
    image: Optional[str] = ""
    images: Optional[List[str]] = []
    sellerId: Optional[str] = None
    sellerName: Optional[str] = None
    rating: Optional[float] = 5.0
    reviewCount: Optional[int] = 0
    status: Optional[str] = "active"

class ProductStatusUpdate(BaseModel):
    status: str

class OrderCreate(BaseModel):
    items: List[dict]
    totalAmount: float
    shippingAddress: str = ""
    paymentMethod: str = "UPI"
    sellerId: Optional[str] = None

# --- Auth Routes ---
@app.post("/api/auth/register")
def register(req: RegisterRequest):
    role = req.role.lower().strip()
    if role not in ("buyer", "seller", "admin"):
        role = "buyer"

    email = req.email.strip().lower()
    if not email or "@" not in email:
        raise HTTPException(status_code=400, detail="A valid email address is required")
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    if not req.name.strip():
        raise HTTPException(status_code=400, detail="Name is required")

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM users WHERE LOWER(email) = ?", (email,))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="An account with this email already exists")

    user_id = f"u-{uuid.uuid4().hex[:8]}"
    pwd_hash = hash_password(req.password)
    now = datetime.utcnow().isoformat()

    cursor.execute(
        "INSERT INTO users (id, name, email, password_hash, role, status, phone, address, created_at) VALUES (?, ?, ?, ?, ?, 'active', '', '', ?)",
        (user_id, req.name.strip(), email, pwd_hash, role, now)
    )
    conn.commit()
    conn.close()

    token = create_access_token({"sub": user_id, "role": role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "name": req.name.strip(),
            "email": email,
            "role": role,
            "status": "active",
            "createdAt": now
        }
    }

@app.post("/api/auth/login")
def login(req: LoginRequest):
    email = req.email.strip().lower()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, name, email, password_hash, role, status, phone, address, created_at FROM users WHERE LOWER(email) = ?",
        (email,)
    )
    user = cursor.fetchone()
    conn.close()

    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if user["status"] == "suspended":
        raise HTTPException(status_code=403, detail="Your account has been suspended by an administrator")

    user_role = user["role"]
    token = create_access_token({"sub": user["id"], "role": user_role})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "role": user_role,
            "status": user["status"],
            "phone": user["phone"] or "",
            "address": user["address"] or "",
            "createdAt": user["created_at"]
        }
    }

@app.get("/api/auth/me")
def me(current_user: dict = Depends(get_current_user)):
    return {
        "user": {
            "id": current_user["id"],
            "name": current_user["name"],
            "email": current_user["email"],
            "role": current_user["role"],
            "status": current_user["status"],
            "phone": current_user["phone"] or "",
            "address": current_user["address"] or "",
            "createdAt": current_user["created_at"]
        }
    }

# --- Admin Routes ---
@app.get("/api/admin/users")
def get_all_users(admin: dict = Depends(require_admin)):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, email, role, status, phone, address, created_at FROM users ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [
        {
            "id": r["id"],
            "name": r["name"],
            "email": r["email"],
            "role": r["role"],
            "status": r["status"],
            "phone": r["phone"] or "",
            "address": r["address"] or "",
            "createdAt": r["created_at"]
        }
        for r in rows
    ]

@app.patch("/api/admin/users/{user_id}/status")
def update_user_status(user_id: str, req: StatusUpdateRequest, admin: dict = Depends(require_admin)):
    if user_id == admin["id"]:
        raise HTTPException(status_code=400, detail="Cannot change your own admin status")

    new_status = req.status.lower().strip()
    if new_status not in ("active", "suspended"):
        raise HTTPException(status_code=400, detail="Invalid status value")

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET status = ? WHERE id = ?", (new_status, user_id))
    conn.commit()
    conn.close()
    return {"message": f"User status updated to {new_status}"}

@app.get("/api/admin/stats")
def get_admin_stats(admin: dict = Depends(require_admin)):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM users")
    total_users = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM users WHERE role = 'seller'")
    total_sellers = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM users WHERE role = 'buyer'")
    total_buyers = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM products")
    total_products = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*), COALESCE(SUM(total), 0) FROM orders")
    order_row = cursor.fetchone()
    total_orders = order_row[0]
    total_revenue = order_row[1]
    conn.close()

    return {
        "totalUsers": total_users,
        "totalSellers": total_sellers,
        "totalBuyers": total_buyers,
        "totalProducts": total_products,
        "totalOrders": total_orders,
        "totalRevenue": total_revenue
    }

# --- Products Routes ---
@app.get("/api/products")
def get_products(include_all: bool = False, user: Optional[dict] = Depends(get_current_user_optional)):
    conn = get_db()
    cursor = conn.cursor()
    is_admin = user and user.get("role") == "admin"
    if include_all or is_admin:
        cursor.execute("SELECT * FROM products ORDER BY created_at DESC")
    else:
        cursor.execute("SELECT * FROM products WHERE status != 'rejected' ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    result = []
    for r in rows:
        images = []
        try:
            images = json.loads(r["images"]) if r["images"] else []
        except Exception:
            images = []
        
        row_keys = r.keys()
        primary_image = (r["image"] if ("image" in row_keys and r["image"]) else "") or (images[0] if images else "https://images.pexels.com/photos/9095/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=900")
        name = (r["name"] if ("name" in row_keys and r["name"]) else "") or (r["title"] if "title" in row_keys and r["title"] else "Unnamed Product")
        stock = int(r["stock"]) if ("stock" in row_keys and r["stock"] is not None) else 10
        brand = r["brand"] if ("brand" in row_keys and r["brand"]) else ""
        rating = float(r["rating"]) if ("rating" in row_keys and r["rating"] is not None) else 5.0
        review_count = int(r["review_count"]) if ("review_count" in row_keys and r["review_count"] is not None) else 0

        result.append({
            "id": r["id"],
            "name": name,
            "title": name,
            "slug": r["slug"] if ("slug" in row_keys and r["slug"]) else name.lower().replace(" ", "-")[:40],
            "description": r["description"] or "",
            "price": float(r["price"] or 0),
            "stock": stock,
            "category": r["category"] or "Other",
            "condition": r["condition"] or "New",
            "brand": brand,
            "location": r["location"] if ("location" in row_keys and r["location"]) else "Online",
            "image": primary_image,
            "images": images if images else [primary_image],
            "sellerId": r["seller_id"] or "",
            "sellerName": r["seller_name"] or "ShopSphere Seller",
            "rating": rating,
            "reviewCount": review_count,
            "status": r["status"] or "active",
            "createdAt": r["created_at"]
        })
    return result

@app.post("/api/products")
def create_or_update_product(req: ProductCreate, user: Optional[dict] = Depends(get_current_user_optional)):
    prod_name = (req.name or req.title or "New Listing").strip()
    prod_id = req.id if (req.id and req.id.strip()) else f"p-{uuid.uuid4().hex[:8]}"
    slug = prod_name.lower().replace(" ", "-")[:40]
    now = datetime.utcnow().isoformat()
    
    current_user_id = user.get("id") if user else "u-seller"
    current_user_name = user.get("name") if user else "ShopSphere Seller"
    seller_id = req.sellerId or current_user_id
    seller_name = req.sellerName or current_user_name
    
    images_list = req.images if req.images else []
    primary_img = req.image or (images_list[0] if images_list else "https://images.pexels.com/photos/9095/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=900")
    if not images_list and primary_img:
        images_list = [primary_img]
        
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, created_at FROM products WHERE id = ?", (prod_id,))
    existing = cursor.fetchone()
    
    if existing:
        cursor.execute("""
            UPDATE products 
            SET title = ?, name = ?, slug = ?, description = ?, price = ?, stock = ?, category = ?, condition = ?, brand = ?, location = ?, image = ?, images = ?, seller_id = ?, seller_name = ?, status = ?
            WHERE id = ?
        """, (
            prod_name, prod_name, slug, req.description or "", float(req.price), int(req.stock or 10),
            req.category or "Other", req.condition or "New", req.brand or "", req.location or "Online",
            primary_img, json.dumps(images_list), seller_id, seller_name, req.status or "active", prod_id
        ))
        created_at = existing["created_at"]
    else:
        cursor.execute("""
            INSERT INTO products (id, title, name, slug, description, price, stock, category, condition, brand, location, image, images, seller_id, seller_name, rating, review_count, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            prod_id, prod_name, prod_name, slug, req.description or "", float(req.price), int(req.stock or 10),
            req.category or "Other", req.condition or "New", req.brand or "", req.location or "Online",
            primary_img, json.dumps(images_list), seller_id, seller_name, float(req.rating or 5.0), int(req.reviewCount or 0),
            req.status or "active", now
        ))
        created_at = now
        
    conn.commit()
    conn.close()
    
    return {
        "id": prod_id,
        "name": prod_name,
        "title": prod_name,
        "slug": slug,
        "description": req.description or "",
        "price": float(req.price),
        "stock": int(req.stock or 10),
        "category": req.category or "Other",
        "condition": req.condition or "New",
        "brand": req.brand or "",
        "location": req.location or "Online",
        "image": primary_img,
        "images": images_list,
        "sellerId": seller_id,
        "sellerName": seller_name,
        "rating": float(req.rating or 5.0),
        "reviewCount": int(req.reviewCount or 0),
        "status": req.status or "active",
        "createdAt": created_at
    }

@app.patch("/api/products/{prod_id}/status")
def update_product_status(prod_id: str, req: ProductStatusUpdate, user: Optional[dict] = Depends(get_current_user_optional)):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE products SET status = ? WHERE id = ?", (req.status.lower().strip(), prod_id))
    conn.commit()
    conn.close()
    return {"message": f"Product status updated to {req.status}", "id": prod_id, "status": req.status}

@app.delete("/api/products/{prod_id}")
def delete_product(prod_id: str, user: Optional[dict] = Depends(get_current_user_optional)):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM products WHERE id = ?", (prod_id,))
    conn.commit()
    conn.close()
    return {"message": "Product removed", "id": prod_id}

# --- Orders Routes ---
@app.get("/api/orders")
def get_orders(user: Optional[dict] = Depends(get_current_user_optional)):
    conn = get_db()
    cursor = conn.cursor()
    if not user or user.get("role") in ("admin", "seller"):
        cursor.execute("SELECT * FROM orders ORDER BY created_at DESC")
    else:
        cursor.execute("SELECT * FROM orders WHERE buyer_id = ? ORDER BY created_at DESC", (user.get("id"),))
    rows = cursor.fetchall()
    conn.close()
    return [
        {
            "id": r["id"],
            "buyerId": r["buyer_id"] or "",
            "buyerName": r["buyer_name"] or "ShopSphere Buyer",
            "items": json.loads(r["items"]) if r["items"] else [],
            "totalAmount": float(r["total"] or 0),
            "shippingAddress": r["shipping_address"] if "shipping_address" in r.keys() else "",
            "paymentMethod": r["payment_method"] if "payment_method" in r.keys() else "UPI",
            "status": r["status"] or "placed",
            "createdAt": r["created_at"]
        }
        for r in rows
    ]

@app.post("/api/orders")
def create_order(req: OrderCreate, user: Optional[dict] = Depends(get_current_user_optional)):
    order_id = f"ord-{uuid.uuid4().hex[:8]}"
    now = datetime.utcnow().isoformat()
    conn = get_db()
    cursor = conn.cursor()
    
    buyer_id = user.get("id") if user else "u-guest"
    buyer_name = user.get("name") if user else "Valued Buyer"
    buyer_email = user.get("email") if user else "buyer@shopsphere.com"
    
    cursor.execute(
        "INSERT INTO orders (id, buyer_id, buyer_name, buyer_email, seller_id, items, total, shipping_address, payment_method, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'placed', ?)",
        (order_id, buyer_id, buyer_name, buyer_email, req.sellerId or "", json.dumps(req.items), req.totalAmount, req.shippingAddress, req.paymentMethod, now)
    )
    conn.commit()
    conn.close()
    return {
        "id": order_id,
        "buyerId": buyer_id,
        "buyerName": buyer_name,
        "items": req.items,
        "totalAmount": req.totalAmount,
        "shippingAddress": req.shippingAddress,
        "paymentMethod": req.paymentMethod,
        "status": "placed",
        "createdAt": now
    }

@app.patch("/api/orders/{order_id}/status")
def update_order_status(order_id: str, req: StatusUpdateRequest, user: Optional[dict] = Depends(get_current_user_optional)):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE orders SET status = ? WHERE id = ?", (req.status.lower().strip(), order_id))
    conn.commit()
    conn.close()
    return {"message": f"Order status updated to {req.status}", "id": order_id, "status": req.status}
