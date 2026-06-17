# codeRED

codeRED is a national blood supply coordination platform built for Singapore's Health Sciences Authority (HSA). It gives HSA coordinators a real-time operational view of blood stock across Singapore's hospital network, enables Singapore Red Cross (SRC) field teams to mobilize donors where they're needed, and uses AI-powered forecasting to predict shortages before they become crises.

---

## Features

**HSA Portal**
- Live blood stock dashboard across 6 hospitals × 8 blood types with status indicators
- KPI cards for critical blood types, expiring units, and active alerts
- 30–60 day demand forecasting with AI-generated early warning signals
- Blood type analytics drilldown and expiry tracking
- Send priority alerts directly to SRC staff

**SRC Portal**
- Receive and respond to HSA alerts
- Donor information and demographic insights
- Donation drive planning, management, and editing
- Targeted donor outreach campaigns
- Geographic hotspot analysis with interactive maps
- Blood bank performance metrics and AI-recommended drive suggestions

**Admin**
- User account management with role-based access control (HSA, SRC_STAFF, ADMIN)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18.3, Vite, Tailwind CSS, Ionic React |
| Charts / Maps | Recharts, Leaflet + React-Leaflet |
| Animation | Framer Motion |
| Backend | Spring Boot 3.2.5 (Java 21) |
| Security | Spring Security + JWT |
| Database | PostgreSQL (Supabase) |
| ORM | Spring Data JPA + Hibernate |
| Caching | Caffeine (Spring Cache) |
| Email | Spring Mail (Gmail SMTP) |
| AI | Google Gemini API (gemini-2.0-flash-lite) |
| Build | Maven (backend), npm/Vite (frontend) |

---

## Project Structure

```
codeRED/
├── frontend/          # React + Vite SPA
│   └── src/
│       ├── pages/
│       │   ├── hsa/       # HSA dashboard, forecasting, alerts
│       │   └── src/       # SRC home, drives, outreach, hotspots
│       ├── components/    # Shared UI components and layouts
│       ├── context/       # Auth context
│       └── api/           # Axios wrapper
└── backend/           # Spring Boot API
    └── src/main/java/com/codered/
        ├── controller/    # REST endpoints
        ├── service/       # Business logic
        ├── repository/    # JPA repositories
        ├── model/         # JPA entities
        ├── dto/           # Request/response objects
        ├── config/        # Security, cache, data seeder
        └── security/      # JWT filter, UserDetailsService
```

---

## Getting Started

### Prerequisites

- Java 21+
- Maven 3.6+
- Node.js 18+
- PostgreSQL (or a Supabase project)

### Backend

```bash
cd backend

# Set required environment variables (see Configuration section below)

mvn clean install
mvn spring-boot:run
# API available at http://localhost:8080
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# App available at http://localhost:5173
```

In development, Vite proxies all `/api/*` requests to `http://localhost:8080`.

---

## Configuration

Set the following environment variables before running the backend.

| Variable | Description |
|---|---|
| `SPRING_DATASOURCE_URL` | PostgreSQL JDBC connection URL |
| `SPRING_DATASOURCE_USERNAME` | Database username |
| `SPRING_DATASOURCE_PASSWORD` | Database password |
| `JWT_SECRET` | JWT signing key (minimum 32 characters) |
| `JWT_EXPIRATION` | Token TTL in milliseconds (default: `86400000`) |
| `CORS_ALLOWED_ORIGINS` | Comma-separated list of allowed frontend origins |
| `SPRING_MAIL_USERNAME` | Gmail SMTP sender address |
| `SPRING_MAIL_PASSWORD` | Gmail app password |
| `GEMINI_API_KEY` | Google Gemini API key |

---

## API

Full REST API reference is documented in [API_DOCS.md](API_DOCS.md).

Key endpoint groups:

| Group | Base Path |
|---|---|
| Auth | `POST /api/auth/login` |
| Blood Stock | `/api/blood-stock` |
| Alerts | `/api/alerts` |
| Forecast | `/api/forecast` |
| Donors | `/api/donors` |
| Donation Drives | `/api/drives` |
| Donor Outreach | `/api/donor-outreach` |
| Hotspots | `/api/hotspots` |
| Users | `/api/users` |

Authentication uses JWT bearer tokens. Include the token in the `Authorization: Bearer <token>` header for all protected routes.

---

## Design

Design system, color palette, typography, and component guidelines are documented in [DESIGN.md](DESIGN.md).

Product strategy, user roles, and UX principles are in [PRODUCT.md](PRODUCT.md).

---

## Roles

| Role | Access |
|---|---|
| `HSA` | Blood stock dashboard, forecasting, send alerts to SRC |
| `SRC_STAFF` | SRC portal — alerts, donor info, drives, outreach, hotspots |
| `ADMIN` | User management |
