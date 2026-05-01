# NexusEstate — PropTech Platform

A full-stack monorepo for the **NexusEstate** property management and lease swap platform. Built with Next.js, Node.js, and two Python microservices.

---

## 🏗️ Architecture

```
NexusEstate/
├── frontend/          Next.js 14 + TypeScript + Tailwind    [PORT 3000]
├── backend/           Node.js Express + Socket.io + JWT      [PORT 3001]
├── swap-engine/       Python FastAPI — Graph Cycle Detection  [PORT 8001]
├── ai-service/        Python FastAPI — ML Valuation & Fraud   [PORT 8000]
├── nexusestate.sql    Shared PostgreSQL schema
└── docker-compose.yml Orchestrates all services + DB
```

### Service Responsibilities

| Service | Tech | Purpose |
|---|---|---|
| **frontend** | Next.js 14, TypeScript, TailwindCSS | User interface — property listings, swap board, AI valuation dashboard |
| **backend** | Node.js, Express, Socket.io, PostgreSQL | Auth (JWT), CRUD for properties/swaps, ACID-compliant swap execution, real-time notifications |
| **swap-engine** | Python, FastAPI | Recursive graph traversal to detect valid multi-party lease swap cycles (Bellman-Ford variant) |
| **ai-service** | Python, FastAPI, scikit-learn | ML property valuation (RandomForest, 45MB model trained on 100k Indian housing rows), fraud detection (IsolationForest), desirability scoring |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- Python 3.11+
- PostgreSQL 16
- Docker & Docker Compose (optional but recommended)

### Option A — Docker (Recommended)

```bash
# 1. Copy environment template
cp .env.example .env
# Edit .env with your DB password and JWT secret

# 2. Start all services
docker compose up --build
```

All 4 services + PostgreSQL will start automatically.

### Option B — Manual (Local Dev)

**1. Database**
```bash
psql -U postgres -c "CREATE DATABASE nexusestate;"
psql -U postgres -d nexusestate -f nexusestate.sql
```

**2. Backend**
```bash
cd backend
npm install
cp ../.env.example .env   # edit as needed
npm run dev               # runs on port 3001
```

**3. Swap Engine**
```bash
cd swap-engine
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

**4. AI Service**
```bash
cd ai-service
pip install -r requirements.txt
# Models are pre-trained (.pkl files included)
uvicorn main:app --reload --port 8000
```

**5. Frontend**
```bash
cd frontend
npm install
npm run dev               # runs on port 3000
```

---

## 🤖 ML Models (ai-service)

The AI service ships with three pre-trained scikit-learn models:

| Model File | Algorithm | Purpose |
|---|---|---|
| `valuation_model.pkl` | RandomForest Regressor | Predict true market price from property features |
| `fraud_model.pkl` | IsolationForest | Detect anomalous/fraudulent listings |
| `fraud_pipeline.pkl` | Pipeline (OHE + IF) | End-to-end fraud scoring pipeline |

**Training data:** 100,000 rows across 25 Indian cities (Kaggle Indian Housing dataset, augmented).

To retrain: `cd ai-service && python train_model.py`

---

## 📡 API Endpoints

### Backend (port 3001)
| Method | Path | Description |
|---|---|---|
| GET | `/health` | Health check |
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | Login (returns JWT) |
| GET | `/api/properties` | List properties |
| POST | `/api/swaps/match` | Find matching swaps |
| POST | `/api/swaps/execute` | Execute ACID multi-party swap |
| POST | `/api/cycles/detect` | Bridge → Python swap engine |

### Swap Engine (port 8001)
| Method | Path | Description |
|---|---|---|
| GET | `/health` | Health check |
| POST | `/api/cycles/detect` | Detect swap cycles in graph |

### AI Service (port 8000)
| Method | Path | Description |
|---|---|---|
| POST | `/predict` | Property valuation |
| POST | `/analyze-fraud` | Fraud/anomaly detection |
| POST | `/desirability-score` | Amenity + proximity score |
| POST | `/similar-properties` | Similar property suggestions |

---

## 🗃️ Database

Schema: `nexusestate.sql` — initialize once and mount into Docker via `docker-compose.yml`.

Key tables: `Users`, `Properties`, `Swap_Requests`, `Successful_Swaps`, `Swap_Log_Entries`

---

## 👥 Team

Built as a collaborative DBMS project. Frontend + Swap Engine by primary team. Node.js Backend + AI Service by collaborator.
