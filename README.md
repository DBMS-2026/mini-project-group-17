# 🏙️ NexusEstate

> **NexusEstate** is a next-generation, full-stack PropTech platform that leverages Machine Learning to revolutionize real estate discovery. By integrating AI-driven desirability scoring, real-time price anomaly detection, and smart similarity recommendations, NexusEstate helps buyers, renters, and investors make data-backed decisions.

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Scikit-learn](https://img.shields.io/badge/Scikit--Learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)

</div>

---

## ✨ Features

### 🧠 AI & Machine Learning Integration
- **Smart Sorting & Desirability Scoring**: Ranks properties based on a dynamic algorithm evaluating user-selected amenities (Pool, Gym, Clubhouse) and proximity to transit (Metro, Bus, Highway).
- **Price Anomaly & Fraud Detection**: Uses an `Isolation Forest` machine learning model to flag artificially inflated or suspiciously low property listings.
- **Similar Property Recommendations**: Suggests alternative properties using a multi-dimensional nearest-neighbor search based on price, area, and BHK.
- **Real-time AI Validation**: The search bar queries the ML model to ensure users only search within supported data-rich cities.

### 💻 Full-Stack Architecture
- **Interactive UI**: Built with Next.js and Tailwind CSS for a highly responsive, modern, and aesthetic user experience.
- **Robust Relational Database**: PostgreSQL backend storing highly detailed schemas (over 30 data points per property, including RERA status, facing, and distances).
- **Authentic Data Source**: Pre-seeded with over 1,250 genuine property listings sourced from a Kaggle 25-City Indian Housing dataset.
- **Secure Authentication**: Custom JWT email authentication paired with Google OAuth integration.

---

## 🛠️ Technology Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | Next.js 15, React, Tailwind CSS, Zustand, Lucide React |
| **Backend API** | Node.js, Express, Socket.io (WebSockets) |
| **Database** | PostgreSQL (`pg` module) |
| **AI Microservice** | Python, FastAPI, Scikit-Learn, Pandas, Joblib |

---

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed on your machine:
- [Node.js](https://nodejs.org/en/) (v18+)
- [Python](https://www.python.org/downloads/) (3.9+)
- [PostgreSQL](https://www.postgresql.org/download/) (v14+)

### 1. Database Setup
1. Open pgAdmin or your terminal and create a database named `nexusestate`.
2. Navigate to the `backend` directory and install dependencies:
   ```bash
   cd backend
   npm install
   ```
3. Run the database seed script to populate the Kaggle dataset:
   ```bash
   node import_csv_to_db.js
   ```

### 2. Python AI Microservice
1. Navigate to the `ai-service` directory:
   ```bash
   cd ai-service
   ```
2. Install the required Python packages:
   ```bash
   pip install fastapi uvicorn pandas scikit-learn joblib
   ```
3. Start the FastAPI server (Runs on port 8000):
   ```bash
   uvicorn main:app --reload
   ```

### 3. Node.js Backend Server
1. Open a new terminal, navigate to the `backend` directory.
2. Start the Express server (Runs on port 5000):
   ```bash
   npm run dev
   ```

### 4. Next.js Frontend
1. Open a new terminal, navigate to the `frontend` directory:
   ```bash
   cd frontend
   npm install
   ```
2. Start the development server (Runs on port 3000):
   ```bash
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000) in your browser!

---

## 📁 Project Structure

```text
DBMS_Project/
├── ai-service/              # Python FastAPI Microservice
│   ├── main.py              # ML Endpoints (Fraud detection, Ranking)
│   ├── fraud_pipeline.pkl   # Pre-trained ML Model
│   └── kaggle_indian_housing_25_cities.csv # Raw Dataset
├── backend/                 # Node.js Express Server
│   ├── controllers/         # API Route Handlers
│   ├── models/              # PostgreSQL Queries (PropertyModel, etc.)
│   ├── routes/              # Express API Routes
│   └── import_csv_to_db.js  # DB Seeding Script
└── frontend/                # Next.js App
    ├── src/app/             # Pages & Routing
    ├── src/components/      # Reusable React Components (Hero, Cards)
    ├── src/lib/             # API Fetch functions & Utilities
    └── src/store/           # Zustand State Management
```

---

## 🤝 Contributing
Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License
Distributed under the MIT License. See `LICENSE` for more information.
