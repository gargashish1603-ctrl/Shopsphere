# ShopSphere Marketplace 🛍️

A modern, high-performance full-stack e-commerce marketplace platform built with **React, TypeScript, Vite, FastAPI, and SQLite**. 

Featuring multi-role authentication (Buyer, Seller, Admin), interactive drag-and-drop media uploading, real-time order processing, seller studio, and an administrative control console.

---

## 📑 Table of Contents
- [Tech Stack](#-tech-stack)
- [Default Admin Credentials](#-default-admin-credentials)
- [Project Architecture](#-project-architecture)
- [Prerequisites](#-prerequisites)
- [Quick Start Guide](#-quick-start-guide)
  - [1. Running the Backend (FastAPI)](#1-running-the-backend-fastapi)
  - [2. Running the Frontend (Vite + React)](#2-running-the-frontend-vite--react)
- [Key Features](#-key-features)
- [API Documentation](#-api-documentation)
- [Troubleshooting & FAQs](#-troubleshooting--faqs)

---

## 🚀 Tech Stack

- **Frontend**:
  - React 18 & TypeScript
  - Vite for ultra-fast HMR and bundling
  - Tailwind CSS with custom glassmorphism design system
  - Lucide React icons
  - Wouter (lightweight declarative routing)
- **Backend**:
  - FastAPI (Python 3.10+)
  - SQLite (`shopsphere.db`) with automatic schema migration
  - Uvicorn ASGI server
  - PyJWT & Passlib / Bcrypt for token-based authentication
  - Pydantic v2 data models & validation

---

## 🔐 Default Admin Credentials

When the database is initialized, a default administrator account is automatically provisioned:

| Field | Value |
| :--- | :--- |
| **Admin Email / ID** | `admin@shopsphere.com` |
| **Password** | `Admin123!` |
| **Role** | `admin` |
| **Admin Console URL** | [http://localhost:5173/admin](http://localhost:5173/admin) |
| **Sign-in URL** | [http://localhost:5173/login](http://localhost:5173/login) |

---

## 📁 Project Architecture

```text
ShopSphere-Marketplace/
├── artifacts/
│   └── shopsphere/                 # React frontend application
│       ├── src/
│       │   ├── App.tsx             # Main routes & views (Shop, ProductDetail, Seller, Admin)
│       │   ├── contexts/
│       │   │   └── MarketplaceContext.tsx  # Global state & API sync engine
│       │   └── services/
│       │       └── mockStore.ts    # Types, interfaces & fallback services
│       ├── vite.config.ts          # Vite configuration with /api backend proxy
│       └── package.json
├── backend/                        # FastAPI backend application
│   ├── main.py                     # API routes (auth, products, orders, admin)
│   ├── database.py                 # SQLite database connection & migrations
│   ├── auth.py                     # JWT token generation & role verification
│   ├── requirements.txt            # Python dependencies
│   └── shopsphere.db               # SQLite database file
├── package.json                    # Workspace root scripts
└── README.md                       # Project documentation
```

---

## 📋 Prerequisites

Before running the project locally, ensure you have:
1. **Node.js** (v18.0.0 or higher) - [Download Node.js](https://nodejs.org/)
2. **pnpm** (recommended) or `npm`
   ```powershell
   npm install -g pnpm
   ```
3. **Python** (v3.10 or higher) - [Download Python](https://www.python.org/)

---

## ⚡ Quick Start Guide (Running on D: Drive)

> 💡 **Recommended Directory**: `D:\ShopSphere-Marketplace` (Provides 170+ GB of free storage and contains the pre-configured virtual environment).

### 1. Running the Backend (FastAPI)

Open a PowerShell terminal and run:

```powershell
# Step 1: Switch to D: Drive and enter backend folder
D:
cd \ShopSphere-Marketplace\backend

# Step 2: (One-time) Allow script execution in your PowerShell session
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

# Step 3: Activate the virtual environment
.\venv\Scripts\Activate.ps1
# (You will see `(venv)` appear at the start of your prompt)

# Step 4: Install/update dependencies (fastapi, uvicorn, reportlab, etc.)
pip install -r requirements.txt

# Step 5: Start the FastAPI server with auto-reload
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

The backend server is now running at:
- **API Base**: `http://127.0.0.1:8000`
- **Interactive Swagger Docs**: `http://127.0.0.1:8000/docs`

#### 🛠️ Common Errors & How to Avoid Them:
1. **`The term '.\venv\Scripts\Activate.ps1' is not recognized`**:
   - **Cause**: You were on `C:\...` where `venv` wasn't created, or hadn't navigated to `D:\ShopSphere-Marketplace\backend`.
   - **Fix**: Type `D:` and `cd \ShopSphere-Marketplace\backend`. If creating a new venv from scratch, run `python -m venv venv` first.
2. **`ModuleNotFoundError: No module named 'fastapi'`**:
   - **Cause**: You ran `uvicorn` without activating the `venv` first, causing Windows to fall back to your global Python (which doesn't have FastAPI installed).
   - **Fix**: Ensure `(venv)` appears before running `uvicorn`, or invoke it directly using `.\venv\Scripts\python.exe -m uvicorn main:app --reload`.
3. **`File ...\Activate.ps1 cannot be loaded because running scripts is disabled`**:
   - **Fix**: Run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` in PowerShell before activating.

---

### 2. Running the Frontend (Vite + React)

Open a **second** terminal window in the root directory:

```powershell
# From the project root:
pnpm dev
```

*(Alternatively, if running directly from `artifacts/shopsphere`:)*
```powershell
cd artifacts/shopsphere
pnpm install
pnpm dev
```

The frontend development server will start at:
👉 **[http://localhost:5173](http://localhost:5173)**

> **Note**: Vite is preconfigured to automatically proxy requests from `http://localhost:5173/api/*` directly to `http://127.0.0.1:8000/api/*`, so you don't need to configure CORS or custom URLs.

---

## ✨ Key Features

### 1. Drag & Drop Photos / Media Uploader
- **Interactive Dropzone**: Sellers can drag and drop multiple image files (`PNG`, `JPG`, `WebP`, `GIF`, `SVG`) or browse files directly from their device.
- **Immediate Local Preview**: Utilizes `FileReader` Data URLs for zero-latency preview and storage.
- **Cover Photo Chooser**: Any uploaded photo can be marked as the primary listing cover photo with one click.
- **Multi-Photo Buyer Gallery**: Buyers can view multiple high-resolution photos on product detail pages via interactive thumbnail selectors.

### 2. Universal Real-Time Persistence
- Every product listing, order, and moderation change is written directly to SQLite and kept in sync across all active tabs, buyer sessions, and the admin dashboard.

### 3. Role-Based Authentication
- Choose **Buyer** or **Seller** on the registration page.
- Role-gated views:
  - Buyers: browse, wishlist, bag, order tracking.
  - Sellers: Seller Studio, inventory metrics, listing creation & edit.
  - Admins: global sales metrics, user suspension/activation, listing approval/rejection.

### 4. Admin Management Console
- **Sales Pulse & Analytics**: Live revenue, orders, and listing counts.
- **Listing Moderation**: Approve or reject newly submitted listings before or while live.
- **User Governance**: View all registered accounts and activate or suspend accounts with one click.

---

## 📡 API Documentation

Once the backend is running, visit **[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)** for the interactive Swagger UI.

### Key Endpoints:
- `POST /api/auth/register` - Create new buyer/seller account
- `POST /api/auth/login` - Authenticate and obtain JWT access token
- `GET /api/auth/me` - Retrieve authenticated user profile
- `GET /api/products` - Fetch active catalog (or all products with `?include_all=true` for admin)
- `POST /api/products` - Create or update a product listing
- `PATCH /api/products/{id}/status` - Update product moderation status (`active` / `rejected`)
- `DELETE /api/products/{id}` - Delete product listing
- `GET /api/orders` - List orders (filtered by buyer ID or all for admin)
- `POST /api/orders` - Place a new order
- `GET /api/admin/users` - List all registered platform users
- `PATCH /api/admin/users/{id}/status` - Suspend or activate a user account

---

## 🛠️ Troubleshooting & FAQs

#### Q: "Port 8000 is already in use"
If port 8000 is occupied, terminate any existing Uvicorn processes:
```powershell
# Windows PowerShell:
Get-Process python -ErrorAction SilentlyContinue | Stop-Process -Force
```
Then rerun `uvicorn main:app --host 127.0.0.1 --port 8000`.

#### Q: "My changes aren't persisting across different browsers"
Ensure that both the backend (`http://127.0.0.1:8000`) and the frontend (`http://localhost:5173`) are actively running. The frontend communicates with the backend via Vite's proxy.
