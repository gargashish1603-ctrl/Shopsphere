import sqlite3
import json
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "shopsphere.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db(hash_password_func):
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        phone TEXT,
        address TEXT,
        created_at TEXT NOT NULL
    )
    """)
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT,
        description TEXT,
        price REAL NOT NULL,
        category TEXT,
        condition TEXT,
        location TEXT,
        images TEXT,
        seller_id TEXT,
        seller_name TEXT,
        status TEXT DEFAULT 'active',
        created_at TEXT NOT NULL
    )
    """)
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        buyer_id TEXT,
        buyer_name TEXT,
        buyer_email TEXT,
        seller_id TEXT,
        items TEXT,
        total REAL,
        shipping_address TEXT DEFAULT '',
        payment_method TEXT DEFAULT 'UPI',
        status TEXT DEFAULT 'placed',
        created_at TEXT NOT NULL
    )
    """)
    try:
        cursor.execute("ALTER TABLE orders ADD COLUMN shipping_address TEXT DEFAULT ''")
    except Exception:
        pass
    try:
        cursor.execute("ALTER TABLE orders ADD COLUMN payment_method TEXT DEFAULT 'UPI'")
    except Exception:
        pass

    # Ensure all product columns exist for complete persistence
    cursor.execute("PRAGMA table_info(products)")
    existing_product_cols = [c[1] for c in cursor.fetchall()]
    cols_to_add = [
        ("name", "TEXT DEFAULT ''"),
        ("stock", "INTEGER DEFAULT 10"),
        ("brand", "TEXT DEFAULT ''"),
        ("image", "TEXT DEFAULT ''"),
        ("rating", "REAL DEFAULT 5.0"),
        ("review_count", "INTEGER DEFAULT 0"),
    ]
    for col_name, col_def in cols_to_add:
        if col_name not in existing_product_cols:
            try:
                cursor.execute(f"ALTER TABLE products ADD COLUMN {col_name} {col_def}")
            except Exception:
                pass

    try:
        cursor.execute("UPDATE products SET name = title WHERE name IS NULL OR name = ''")
        cursor.execute("UPDATE products SET title = name WHERE title IS NULL OR title = ''")
    except Exception:
        pass

    conn.commit()

    # Seed default admin if not present
    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] == 0:
        now = datetime.utcnow().isoformat()
        demo_users = [
            ("u-admin", "ShopSphere Admin", "admin@shopsphere.com", hash_password_func("Admin123!"), "admin", "active", "+91 99999 00000", "Admin HQ, Bengaluru", now),
        ]
        cursor.executemany(
            "INSERT INTO users (id, name, email, password_hash, role, status, phone, address, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            demo_users
        )
        conn.commit()

    # Seed products if empty
    cursor.execute("SELECT COUNT(*) FROM products")
    if cursor.fetchone()[0] == 0:
        now = datetime.utcnow().isoformat()
        demo_products = [
            (
                "p-1",
                "Handcrafted Teakwood Armchair",
                "handcrafted-teakwood-armchair",
                "Mid-century inspired minimalist solid teakwood armchair with natural linen upholstery.",
                18500.0,
                "Furniture",
                "Like New",
                "Indiranagar, Bengaluru",
                json.dumps(["https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800&auto=format&fit=crop&q=80"]),
                "u-seller",
                "Artisan Woodworks",
                "active",
                now
            ),
            (
                "p-2",
                "Vintage Ceramic Pour-Over Set",
                "vintage-ceramic-pour-over-set",
                "Matte charcoal ceramic pour-over dripper with hand-thrown ceramic serving jug. Barely used.",
                2200.0,
                "Home & Kitchen",
                "Excellent",
                "Koramangala, Bengaluru",
                json.dumps(["https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80"]),
                "u-seller",
                "Artisan Woodworks",
                "active",
                now
            ),
            (
                "p-3",
                "Sony WH-1000XM4 Wireless Headphones",
                "sony-wh-1000xm4-wireless-headphones",
                "Industry-leading noise cancellation, 30-hour battery life. Complete with original travel case and box.",
                15999.0,
                "Electronics",
                "Good",
                "HSR Layout, Bengaluru",
                json.dumps(["https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80"]),
                "u-seller",
                "Artisan Woodworks",
                "active",
                now
            )
        ]
        cursor.executemany(
            "INSERT INTO products (id, title, slug, description, price, category, condition, location, images, seller_id, seller_name, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            demo_products
        )
        conn.commit()

    conn.close()
