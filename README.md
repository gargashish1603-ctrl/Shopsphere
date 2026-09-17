# ShopSphere Marketplace 🛍️

A full-stack e-commerce marketplace built with **React, Vite, Tailwind CSS, FastAPI, and SQLite**.

---

## ⚡ Quick Start (Running Locally)

You will need **two terminal windows**: one for the Backend and one for the Frontend.

### Prerequisites
- **Node.js** (v18+)
- **pnpm** (`npm install -g pnpm`)
- **Python** (v3.10+)

---

### 1️⃣ Backend (FastAPI + SQLite)

Open your **first terminal** and navigate to `backend`:

```bash
cd backend
```

1. **Create and activate a virtual environment:**
   - **macOS / Linux:**
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```
   - **Windows (PowerShell):**
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   - **Windows (Command Prompt):**
     ```cmd
     python -m venv venv
     .\venv\Scripts\activate.bat
     ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Start the backend server:**
   ```bash
   uvicorn main:app --host 127.0.0.1 --port 8000 --reload
   ```

> 🟢 **Backend URLs:**
> - API Base: **http://127.0.0.1:8000**
> - Swagger Docs: **http://127.0.0.1:8000/docs**

---

### 2️⃣ Frontend (React + Vite)

Open a **second terminal** in the project root (`Shopsphere-main`):

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

   *(If prompted about ignored build scripts like esbuild, approve them once with:)*
   ```bash
   pnpm approve-builds --all
   ```

2. **Start the development server:**
   ```bash
   pnpm dev
   ```

> 🟢 **Frontend URL:**
> - Web App: **http://localhost:5173**
>
> *(Vite automatically proxies `/api` calls directly to the FastAPI server at `127.0.0.1:8000`)*

---

## 🔐 Default Demo Accounts

Use any of these pre-seeded accounts to log in:

| Role | Email | Password | Access / Notes |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@shopsphere.com` | `Admin123!` | Full control console (`/admin`), user moderation, metrics |
| **Seller** | `priya.seller@shopsphere.com` | `Seller123!` | Seller studio, inventory management, product listings |
| **Buyer** | `aarav.mehta@gmail.com` | `Buyer123!` | Product catalog, cart, checkout, order tracking |

---

## 🛠️ Project Structure

```text
Shopsphere/
├── artifacts/
│   └── shopsphere/       # React + Vite frontend application
├── backend/              # FastAPI Python backend & SQLite database
│   ├── main.py           # API route handlers
│   ├── database.py       # SQLite connection & schema initialization
│   ├── auth.py           # JWT authentication & password hashing
│   └── shopsphere.db     # SQLite database
├── lib/                  # Shared types and API client utilities
├── package.json          # Root workspace configuration
└── pnpm-workspace.yaml   # pnpm workspace configuration
```
