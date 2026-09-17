import sqlite3
import json
import os
from datetime import datetime, timedelta
import bcrypt

DB_PATH = os.path.join(os.path.dirname(__file__), "shopsphere.db")

def hash_pw(pw: str) -> str:
    pwd_bytes = pw.encode("utf-8")
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")

def run_seed():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    now = datetime.utcnow()
    t_minus_3d = (now - timedelta(days=3)).isoformat()
    t_minus_2d = (now - timedelta(days=2)).isoformat()
    t_minus_1d = (now - timedelta(days=1)).isoformat()
    t_now = now.isoformat()

    # 1. New Users
    users_to_add = [
        # 2 Sellers
        (
            "u-seller-priya",
            "Priya Sharma",
            "priya.seller@shopsphere.com",
            hash_pw("Seller123!"),
            "seller",
            "active",
            "+91 98112 34567",
            "Shop 14, Brigade Gateway Campus, Malleshwaram, Bengaluru, Karnataka 560055",
            t_minus_3d
        ),
        (
            "u-seller-rohan",
            "Rohan Verma",
            "rohan.seller@shopsphere.com",
            hash_pw("Seller123!"),
            "seller",
            "active",
            "+91 97420 67890",
            "Studio 204, Powai Tech Quarter, Mumbai, Maharashtra 400076",
            t_minus_3d
        ),
        # 3 Buyers
        (
            "u-buyer-aarav",
            "Aarav Mehta",
            "aarav.mehta@gmail.com",
            hash_pw("Buyer123!"),
            "buyer",
            "active",
            "+91 98201 44552",
            "Flat 402, Sunshine Residency, HSR Layout Sector 2, Bengaluru 560102",
            t_minus_3d
        ),
        (
            "u-buyer-sneha",
            "Sneha Kulkarni",
            "sneha.kulkarni@gmail.com",
            hash_pw("Buyer123!"),
            "buyer",
            "active",
            "+91 98450 11223",
            "B-12, Green Glen Layout, Bellandur, Bengaluru 560103",
            t_minus_2d
        ),
        (
            "u-buyer-vikram",
            "Vikramaditya Rao",
            "vikram.rao@gmail.com",
            hash_pw("Buyer123!"),
            "buyer",
            "active",
            "+91 99002 88991",
            "Penthouse 8A, Prestige Shantiniketan, Whitefield, Bengaluru 560066",
            t_minus_1d
        )
    ]

    for u in users_to_add:
        cursor.execute("SELECT id FROM users WHERE LOWER(email) = LOWER(?)", (u[2],))
        if cursor.fetchone():
            cursor.execute("UPDATE users SET name=?, password_hash=?, role=?, status=?, phone=?, address=? WHERE LOWER(email)=LOWER(?)",
                           (u[1], u[3], u[4], u[5], u[6], u[7], u[2]))
        else:
            cursor.execute(
                "INSERT INTO users (id, name, email, password_hash, role, status, phone, address, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                u
            )

    # 2. 10 Professional Products
    products_to_add = [
        # Seller 1: Priya Sharma (EduTech & Stationery Hub)
        (
            "prod-casio-991cw",
            "Casio FX-991CW ClassWiz Scientific Calculator",
            "casio-fx-991cw-classwiz-scientific-calculator",
            "540+ functions, quad-color natural textbook display, QR code equation visualization, and dual solar/battery power. Approved for CBSE, JEE, and University examinations.",
            1595.0,
            "Calculators",
            "New",
            "Malleshwaram, Bengaluru",
            json.dumps(["https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=800&auto=format&fit=crop&q=80"]),
            "u-seller-priya",
            "EduTech & Stationery Hub (Priya Sharma)",
            "active",
            t_minus_3d,
            "Casio FX-991CW ClassWiz Scientific Calculator",
            18,
            "Casio",
            "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=800&auto=format&fit=crop&q=80",
            4.9,
            24
        ),
        (
            "prod-ti-30xs",
            "Texas Instruments TI-30XS MultiView Scientific Calculator",
            "texas-instruments-ti-30xs-multiview-scientific-calculator",
            "MultiView 4-line display showing simultaneous calculations and fraction-decimal conversions. Ergonomic non-slip grips and durable slide-on protective hard case.",
            2150.0,
            "Calculators",
            "New",
            "Malleshwaram, Bengaluru",
            json.dumps(["https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=800&auto=format&fit=crop&q=80"]),
            "u-seller-priya",
            "EduTech & Stationery Hub (Priya Sharma)",
            "active",
            t_minus_3d,
            "Texas Instruments TI-30XS MultiView Scientific Calculator",
            12,
            "Texas Instruments",
            "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=800&auto=format&fit=crop&q=80",
            4.8,
            16
        ),
        (
            "prod-parker-frontier",
            "Parker Frontier Matte Black Fountain Pen (Gold Trim)",
            "parker-frontier-matte-black-fountain-pen",
            "Iconic matte black epoxy resin finish with 23K gold plated trims. Precision-engineered stainless steel medium nib with twin-channel ink feed for effortless, fatigue-free note-taking.",
            899.0,
            "Pens & Stationery",
            "New",
            "Malleshwaram, Bengaluru",
            json.dumps(["https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=800&auto=format&fit=crop&q=80"]),
            "u-seller-priya",
            "EduTech & Stationery Hub (Priya Sharma)",
            "active",
            t_minus_3d,
            "Parker Frontier Matte Black Fountain Pen (Gold Trim)",
            25,
            "Parker",
            "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=800&auto=format&fit=crop&q=80",
            4.9,
            38
        ),
        (
            "prod-uniball-air",
            "Uni-ball Air Micro 0.5mm Rollerball Pen Pack (5 Pens)",
            "uni-ball-air-micro-rollerball-pen-pack",
            "Pressure-sensitive tip adapts to your writing angle. Fade-proof, tamper-proof and waterproof Super Ink formulation that doesn't bleed through student notebook pages.",
            450.0,
            "Pens & Stationery",
            "New",
            "Malleshwaram, Bengaluru",
            json.dumps(["https://images.unsplash.com/photo-1585336261026-78b1767c2957?w=800&auto=format&fit=crop&q=80"]),
            "u-seller-priya",
            "EduTech & Stationery Hub (Priya Sharma)",
            "active",
            t_minus_3d,
            "Uni-ball Air Micro 0.5mm Rollerball Pen Pack (5 Pens)",
            40,
            "Uni-ball",
            "https://images.unsplash.com/photo-1585336261026-78b1767c2957?w=800&auto=format&fit=crop&q=80",
            4.7,
            52
        ),
        (
            "prod-classmate-pulse",
            "Classmate Pulse Hardbound Spiral Notebook (300 Pages)",
            "classmate-pulse-hardbound-spiral-notebook",
            "Single line ruling, 70 GSM archival acid-free paper, perforated tear-off sheets, snag-free double spiral wire binding, and water-resistant protective poly cover.",
            260.0,
            "Notebooks",
            "New",
            "Malleshwaram, Bengaluru",
            json.dumps(["https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80"]),
            "u-seller-priya",
            "EduTech & Stationery Hub (Priya Sharma)",
            "active",
            t_minus_3d,
            "Classmate Pulse Hardbound Spiral Notebook (300 Pages)",
            50,
            "Classmate",
            "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80",
            4.8,
            64
        ),

        # Seller 2: Rohan Verma (Lumina Study & Living Co.)
        (
            "prod-rhodia-webbie",
            "Rhodia Webnotebook A5 Dot Grid Journal (Clairefontaine Vellum)",
            "rhodia-webnotebook-a5-dot-grid-journal",
            "Italian leatherette hardcover with embossed logo, expanding inner pocket, ribbon marker, and elastic closure. Super-smooth 90 GSM fountain pen friendly paper with zero feathering.",
            1299.0,
            "Notebooks",
            "New",
            "Powai, Mumbai",
            json.dumps(["https://images.unsplash.com/photo-1517842645767-c639042777db?w=800&auto=format&fit=crop&q=80"]),
            "u-seller-rohan",
            "Lumina Study & Living Co. (Rohan Verma)",
            "active",
            t_minus_3d,
            "Rhodia Webnotebook A5 Dot Grid Journal (Clairefontaine Vellum)",
            15,
            "Rhodia",
            "https://images.unsplash.com/photo-1517842645767-c639042777db?w=800&auto=format&fit=crop&q=80",
            5.0,
            19
        ),
        (
            "prod-philips-led-desk",
            "Philips EyeCare Smart LED Study Table Lamp (Touch Dimmer)",
            "philips-eyecare-smart-led-study-table-lamp",
            "Flicker-free CRI 95+ light with 5 color temperatures (2700K warm white to 6500K daylight study). Flexible 360-degree silicone gooseneck and integrated 10W fast USB device charger.",
            2499.0,
            "Table Lamps",
            "New",
            "Powai, Mumbai",
            json.dumps(["https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?w=800&auto=format&fit=crop&q=80"]),
            "u-seller-rohan",
            "Lumina Study & Living Co. (Rohan Verma)",
            "active",
            t_minus_3d,
            "Philips EyeCare Smart LED Study Table Lamp (Touch Dimmer)",
            14,
            "Philips",
            "https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?w=800&auto=format&fit=crop&q=80",
            4.9,
            41
        ),
        (
            "prod-nordic-wood-lamp",
            "Nordic Solid Beechwood Reading Table Lamp with Fabric Shade",
            "nordic-solid-beechwood-reading-table-lamp",
            "Handcrafted solid beechwood base with natural oatmeal linen lampshade. Provides soft, diffused ambient lighting ideal for late-night study sessions and dorm bedrooms.",
            1850.0,
            "Table Lamps",
            "New",
            "Powai, Mumbai",
            json.dumps(["https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80"]),
            "u-seller-rohan",
            "Lumina Study & Living Co. (Rohan Verma)",
            "active",
            t_minus_3d,
            "Nordic Solid Beechwood Reading Table Lamp with Fabric Shade",
            9,
            "Nordic Living",
            "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80",
            4.7,
            15
        ),
        (
            "prod-braun-digital-clock",
            "Braun Classic Digital Voice-Activated Alarm Clock (Temp Display)",
            "braun-classic-digital-voice-activated-alarm-clock",
            "High-contrast negative LCD screen with indoor temperature sensor, date display, crescendo alarm sound, integrated backlight snooze function, and quiet precision quartz circuitry.",
            1750.0,
            "Alarm Clocks",
            "New",
            "Powai, Mumbai",
            json.dumps(["https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=800&auto=format&fit=crop&q=80"]),
            "u-seller-rohan",
            "Lumina Study & Living Co. (Rohan Verma)",
            "active",
            t_minus_3d,
            "Braun Classic Digital Voice-Activated Alarm Clock (Temp Display)",
            20,
            "Braun",
            "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=800&auto=format&fit=crop&q=80",
            4.8,
            28
        ),
        (
            "prod-sunrise-wake-clock",
            "Aesthetic Sunrise Wake-Up Light & Digital Alarm Clock (FM Radio)",
            "aesthetic-sunrise-wake-up-light-alarm-clock",
            "Simulates natural 30-minute gradual sunrise to gently wake you up refreshed. 7 soothing nature sounds, dual alarms, tap-to-snooze, and ambient multi-color bedside lamp.",
            3200.0,
            "Alarm Clocks",
            "New",
            "Powai, Mumbai",
            json.dumps(["https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80"]),
            "u-seller-rohan",
            "Lumina Study & Living Co. (Rohan Verma)",
            "active",
            t_minus_3d,
            "Aesthetic Sunrise Wake-Up Light & Digital Alarm Clock (FM Radio)",
            11,
            "Lumina",
            "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80",
            4.9,
            33
        )
    ]

    for p in products_to_add:
        cursor.execute("SELECT id FROM products WHERE id = ?", (p[0],))
        if cursor.fetchone():
            cursor.execute("""
                UPDATE products SET title=?, slug=?, description=?, price=?, category=?, condition=?, location=?,
                images=?, seller_id=?, seller_name=?, status=?, name=?, stock=?, brand=?, image=?, rating=?, review_count=?
                WHERE id=?
            """, (p[1], p[2], p[3], p[4], p[5], p[6], p[7], p[8], p[9], p[10], p[11], p[13], p[14], p[15], p[16], p[17], p[18], p[0]))
        else:
            cursor.execute("""
                INSERT INTO products (id, title, slug, description, price, category, condition, location, images,
                seller_id, seller_name, status, created_at, name, stock, brand, image, rating, review_count)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, p)

    # 3. Real-life Transaction Orders
    orders_to_add = [
        # Order 1: Aarav Mehta buys Casio Calculator & Notebooks from Priya
        (
            "ord-1092a1",
            "u-buyer-aarav",
            "Aarav Mehta",
            "aarav.mehta@gmail.com",
            "u-seller-priya",
            json.dumps([
                {
                    "productId": "prod-casio-991cw",
                    "name": "Casio FX-991CW ClassWiz Scientific Calculator",
                    "image": "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=800&auto=format&fit=crop&q=80",
                    "price": 1595.0,
                    "quantity": 1
                },
                {
                    "productId": "prod-classmate-pulse",
                    "name": "Classmate Pulse Hardbound Spiral Notebook (300 Pages)",
                    "image": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80",
                    "price": 260.0,
                    "quantity": 2
                }
            ]),
            2115.0,
            "Flat 402, Sunshine Residency, HSR Layout Sector 2, Bengaluru 560102",
            "UPI (Google Pay)",
            "delivered",
            t_minus_2d
        ),
        # Order 2: Aarav Mehta buys Philips Desk Lamp & Braun Alarm Clock from Rohan
        (
            "ord-2041b3",
            "u-buyer-aarav",
            "Aarav Mehta",
            "aarav.mehta@gmail.com",
            "u-seller-rohan",
            json.dumps([
                {
                    "productId": "prod-philips-led-desk",
                    "name": "Philips EyeCare Smart LED Study Table Lamp (Touch Dimmer)",
                    "image": "https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?w=800&auto=format&fit=crop&q=80",
                    "price": 2499.0,
                    "quantity": 1
                },
                {
                    "productId": "prod-braun-digital-clock",
                    "name": "Braun Classic Digital Voice-Activated Alarm Clock (Temp Display)",
                    "image": "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=800&auto=format&fit=crop&q=80",
                    "price": 1750.0,
                    "quantity": 1
                }
            ]),
            4249.0,
            "Flat 402, Sunshine Residency, HSR Layout Sector 2, Bengaluru 560102",
            "Credit Card",
            "shipped",
            t_minus_1d
        ),
        # Order 3: Sneha Kulkarni buys Parker Pen & Rhodia Journal & Uni-ball from Priya
        (
            "ord-3055c8",
            "u-buyer-sneha",
            "Sneha Kulkarni",
            "sneha.kulkarni@gmail.com",
            "u-seller-priya",
            json.dumps([
                {
                    "productId": "prod-parker-frontier",
                    "name": "Parker Frontier Matte Black Fountain Pen (Gold Trim)",
                    "image": "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=800&auto=format&fit=crop&q=80",
                    "price": 899.0,
                    "quantity": 1
                },
                {
                    "productId": "prod-rhodia-webbie",
                    "name": "Rhodia Webnotebook A5 Dot Grid Journal (Clairefontaine Vellum)",
                    "image": "https://images.unsplash.com/photo-1517842645767-c639042777db?w=800&auto=format&fit=crop&q=80",
                    "price": 1299.0,
                    "quantity": 1
                },
                {
                    "productId": "prod-uniball-air",
                    "name": "Uni-ball Air Micro 0.5mm Rollerball Pen Pack (5 Pens)",
                    "image": "https://images.unsplash.com/photo-1585336261026-78b1767c2957?w=800&auto=format&fit=crop&q=80",
                    "price": 450.0,
                    "quantity": 1
                }
            ]),
            2648.0,
            "B-12, Green Glen Layout, Bellandur, Bengaluru 560103",
            "UPI (PhonePe)",
            "delivered",
            t_minus_2d
        ),
        # Order 4: Sneha Kulkarni buys Sunrise Wake-Up Light from Rohan
        (
            "ord-4019d4",
            "u-buyer-sneha",
            "Sneha Kulkarni",
            "sneha.kulkarni@gmail.com",
            "u-seller-rohan",
            json.dumps([
                {
                    "productId": "prod-sunrise-wake-clock",
                    "name": "Aesthetic Sunrise Wake-Up Light & Digital Alarm Clock (FM Radio)",
                    "image": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80",
                    "price": 3200.0,
                    "quantity": 1
                }
            ]),
            3200.0,
            "B-12, Green Glen Layout, Bellandur, Bengaluru 560103",
            "NetBanking",
            "packed",
            t_minus_1d
        ),
        # Order 5: Vikramaditya Rao buys TI-30XS Calculator & Parker Pen from Priya
        (
            "ord-5077e6",
            "u-buyer-vikram",
            "Vikramaditya Rao",
            "vikram.rao@gmail.com",
            "u-seller-priya",
            json.dumps([
                {
                    "productId": "prod-ti-30xs",
                    "name": "Texas Instruments TI-30XS MultiView Scientific Calculator",
                    "image": "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=800&auto=format&fit=crop&q=80",
                    "price": 2150.0,
                    "quantity": 1
                },
                {
                    "productId": "prod-parker-frontier",
                    "name": "Parker Frontier Matte Black Fountain Pen (Gold Trim)",
                    "image": "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=800&auto=format&fit=crop&q=80",
                    "price": 899.0,
                    "quantity": 2
                }
            ]),
            3948.0,
            "Penthouse 8A, Prestige Shantiniketan, Whitefield, Bengaluru 560066",
            "Cash on Delivery",
            "placed",
            t_now
        ),
        # Order 6: Vikramaditya Rao buys Nordic Table Lamp & Braun Clock from Rohan
        (
            "ord-6088f9",
            "u-buyer-vikram",
            "Vikramaditya Rao",
            "vikram.rao@gmail.com",
            "u-seller-rohan",
            json.dumps([
                {
                    "productId": "prod-nordic-wood-lamp",
                    "name": "Nordic Solid Beechwood Reading Table Lamp with Fabric Shade",
                    "image": "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80",
                    "price": 1850.0,
                    "quantity": 1
                },
                {
                    "productId": "prod-braun-digital-clock",
                    "name": "Braun Classic Digital Voice-Activated Alarm Clock (Temp Display)",
                    "image": "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=800&auto=format&fit=crop&q=80",
                    "price": 1750.0,
                    "quantity": 1
                }
            ]),
            3600.0,
            "Penthouse 8A, Prestige Shantiniketan, Whitefield, Bengaluru 560066",
            "UPI (Paytm)",
            "shipped",
            t_minus_1d
        )
    ]

    for o in orders_to_add:
        cursor.execute("SELECT id FROM orders WHERE id = ?", (o[0],))
        if cursor.fetchone():
            cursor.execute("""
                UPDATE orders SET buyer_id=?, buyer_name=?, buyer_email=?, seller_id=?, items=?, total=?,
                shipping_address=?, payment_method=?, status=? WHERE id=?
            """, (o[1], o[2], o[3], o[4], o[5], o[6], o[7], o[8], o[9], o[0]))
        else:
            cursor.execute("""
                INSERT INTO orders (id, buyer_id, buyer_name, buyer_email, seller_id, items, total,
                shipping_address, payment_method, status, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, o)

    conn.commit()
    conn.close()
    print("Seed complete successfully!")

if __name__ == "__main__":
    run_seed()
