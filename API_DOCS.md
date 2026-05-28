# codeRED API Documentation

**Base URL:** `http://localhost:8080/api`  
**Auth:** All endpoints except `/auth/login` require a Bearer token in the `Authorization` header.  
**Database:** H2 in-memory (resets on restart). Console at `http://localhost:8080/h2-console`

---

## Authentication

### POST `/auth/login`
Login and receive a JWT token.

**Request body**
```json
{
  "email": "winnie@hsa.gov.sg",
  "password": "password123"
}
```

**Response `200`**
```json
{
  "token": "<jwt>",
  "role": "HSA",
  "name": "Winnie Koh",
  "email": "winnie@hsa.gov.sg",
  "hospitalId": null,
  "hospitalName": "Health Sciences Authority",
  "designation": "Blood Services Manager"
}
```

**Roles**
| Role | Email | Password |
|------|-------|----------|
| `HSA` | `winnie@hsa.gov.sg` | `password123` |
| `HOSPITAL_STAFF` | `winnieKoh@SGH.sg` | `password123` |

---

## Blood Stock

### GET `/blood-stock`
Returns blood stock data. HSA sees all hospitals grouped by code; Hospital Staff sees only their own hospital.

**HSA response**
```json
{
  "SGH": [
    {
      "id": 1,
      "hospital": { "id": 1, "code": "SGH", "name": "Singapore General Hospital" },
      "bloodType": "O_POSITIVE",
      "currentUnits": 320,
      "idealUnits": 400,
      "updatedAt": "2026-05-28T10:00:00"
    }
  ],
  "NUH": [ ... ]
}
```

**Hospital Staff response** — array of BloodStock objects for their hospital only.

---

### GET `/blood-stock/summary`
Returns a summary percentage for the dashboard KPI card.

**Response `200`**
```json
{
  "percentage": 85,
  "criticalTypeCount": 3,
  "totalUnits": 2580
}
```

---

### GET `/blood-stock/hospitals`
Returns list of all hospitals.

**Response `200`**
```json
[
  { "id": 1, "code": "SGH", "name": "Singapore General Hospital", "address": "Outram Rd" },
  { "id": 2, "code": "NUH", "name": "National University Hospital", "address": "..." }
]
```

---

### GET `/blood-stock/hospital/{code}`
Returns blood stock for a specific hospital by code (e.g. `SGH`, `NUH`, `KKH`, `CGH`, `NGH`, `TTSH`).

**Response `200`** — array of BloodStock objects.

---

## Blood Requests

### GET `/requests`
Returns blood requests. HSA sees all; Hospital Staff sees only their hospital's requests.

**Response `200`**
```json
[
  {
    "id": 1,
    "requestId": "REQ-2109",
    "requestingHospital": { "id": 1, "code": "SGH", "name": "Singapore General Hospital" },
    "bloodType": "O_NEGATIVE",
    "unitsRequested": 20,
    "priority": "CRITICAL",
    "status": "PENDING",
    "reason": "Multiple trauma cases due to major road accident.",
    "remarks": null,
    "neededBy": "2026-05-28T15:00:00",
    "requestedAt": "2026-05-28T10:43:00",
    "updatedAt": "2026-05-28T10:43:00",
    "requestedByName": "Dr. James Tan",
    "requestedByDesignation": "Head, Emergency Dept"
  }
]
```

**Blood type enum values:** `O_POSITIVE`, `O_NEGATIVE`, `A_POSITIVE`, `A_NEGATIVE`, `B_POSITIVE`, `B_NEGATIVE`, `AB_POSITIVE`, `AB_NEGATIVE`  
**Priority enum values:** `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`  
**Status enum values:** `PENDING`, `APPROVED`, `PREPARING`, `IN_TRANSIT`, `DELIVERED`, `COMPLETED`, `REJECTED`

---

### POST `/requests`
Create a new blood request. Hospital Staff only.

**Request body**
```json
{
  "bloodTypes": ["O-"],
  "units": 20,
  "priority": "CRITICAL",
  "neededBy": "2026-05-21T18:00:00",
  "remarks": "Emergency surgery cases"
}
```

**Response `200`** — created BloodRequest object.

---

### PATCH `/requests/{id}/status`
Update the status of a request. HSA only.

**Request body**
```json
{ "status": "APPROVED" }
```

**Response `200`** — updated BloodRequest object.

---

### GET `/requests/active-count`
Returns count of active requests for the current user's context.

**Response `200`**
```json
{ "count": 2 }
```

---

## Alerts

### GET `/alerts`
Returns active (non-dismissed) alerts. HSA sees all; Hospital Staff sees only alerts for their hospital.

**Response `200`**
```json
[
  {
    "id": 1,
    "title": "O- Shortage Predicted...",
    "message": "O- blood supply at SGH is predicted to fall below safe threshold within 3 days.",
    "priority": "CRITICAL",
    "hospital": { "id": 1, "code": "SGH", "name": "Singapore General Hospital" },
    "location": "SGH",
    "dismissed": false,
    "createdAt": "2026-05-28T08:00:00"
  }
]
```

---

### PATCH `/alerts/{id}/dismiss`
Dismiss an alert so it no longer appears.

**Response `200`** — empty body.

---

## Forecast

### GET `/forecast`
Returns demand forecast data for the Forecasting page. (Mock data — static.)

**Response `200`**
```json
{
  "predictedPeakDemand": 1580,
  "peakDate": "May 24, 2026",
  "highRiskPeriod": "May 22 - May 25",
  "highRiskDays": 3,
  "expectedShortfall": 230,
  "forecastAccuracy": 87,
  "chartData": [
    { "date": "May 14", "actual": 900, "forecast": 920, "upper": 1100, "lower": 740 },
    { "date": "May 21", "forecast": 1200, "upper": 1400, "lower": 1000 }
  ],
  "byBloodType": [
    { "bloodType": "O+", "currentSupply": 620, "supplyPct": 87, "status": "Good" },
    { "bloodType": "O-", "currentSupply": 90,  "supplyPct": 20, "status": "High Risk" }
  ],
  "demandDrivers": [
    { "name": "Seasonality", "description": "Higher demand this month", "change": 26 }
  ],
  "earlyWarning": {
    "message": "Possible Shortage of O- Blood in 3 days",
    "confidence": 87,
    "recommendation": "Allocate 20-30 units to high need hospitals..."
  }
}
```

---

## Hotspots

### GET `/hotspots`
Returns donor hotspot data. (Mock data — static.)

**Response `200`**
```json
{
  "mostActiveAgeGroup": "31-50 Years Old",
  "mostActiveAgeGroupPct": 52,
  "activeHotspots": 20,
  "highestDonorZone": "Central (Outram)",
  "highestDonorZoneCount": 1726,
  "insights": [
    {
      "name": "Ang Mo Kio Hotspot",
      "color": "red",
      "potentialDonors": 627,
      "ageGroup": "31-50 Years Old",
      "recommendation": "Deploy community donation drive at Ang Mo Kio Community Club"
    }
  ],
  "communityDrives": [
    { "name": "Community Drive @ Boon Lay MRT...", "donors": 3948, "lastDrive": "11-12 November 2025" }
  ],
  "ageGroupData": [
    { "month": "Feb", "total": 800, "age16to30": 300, "age31to50": 350, "above50": 150 }
  ]
}
```

---

## Blood Allocation (HSA only)

### GET `/allocation/inventory`
Returns national blood inventory totals grouped by blood type.

**Response `200`**
```json
{
  "totalStock": 2580,
  "byType": {
    "O+": 320,
    "O-": 220,
    "A+": 420,
    "A-": 80,
    "B+": 135,
    "B-": 180,
    "AB+": 300,
    "AB-": 80
  }
}
```

---

### GET `/allocation/donor-hospitals/{requestId}`
Returns a list of potential donor hospitals for a given request, with stock levels and safe transfer limits.

**Response `200`**
```json
[
  {
    "hospitalId": 2,
    "hospitalName": "National University Hospital",
    "hospitalCode": "NUH",
    "distance": "7 km",
    "stock": 80,
    "stockPct": 28,
    "safeToTransfer": "Caution",
    "maxSafeTransfer": 24
  }
]
```

**`safeToTransfer` values:** `Yes` (≥70%), `Caution` (40–69%), `No` (<40%)

---

### POST `/allocation/approve`
Approve a blood allocation plan.

**Request body**
```json
{
  "requestId": 1,
  "allocations": {
    "2": 10,
    "3": 5,
    "4": 5
  }
}
```

**Response `200`**
```json
{
  "status": "success",
  "message": "Blood units have been allocated and dispatch notification sent"
}
```

---

## Transfers

### GET `/transfers`
Returns outbound blood transfers for the current hospital (Hospital Staff only).

**Response `200`**
```json
[
  {
    "id": 1,
    "transferId": "TRF-2025-3001",
    "donorHospital": { "id": 1, "code": "SGH", "name": "Singapore General Hospital" },
    "receivingHospital": { "id": 2, "code": "NUH", "name": "National University Hospital" },
    "bloodType": "O_POSITIVE",
    "units": 20,
    "priority": "CRITICAL",
    "status": "PENDING",
    "purposeNotes": "Urgent Transfer for surgery",
    "requestedPickupDate": "2026-05-28T11:00:00",
    "estimatedDelivery": "2026-05-28T12:00:00",
    "createdAt": "2026-05-28T10:00:00",
    "updatedAt": "2026-05-28T10:00:00"
  }
]
```

---

### PATCH `/transfers/{id}/acknowledge`
Acknowledge an incoming transfer request.

**Response `200`** — updated BloodTransfer object with `status: "ACKNOWLEDGED"`.

---

## Error Responses

| Status | Meaning |
|--------|---------|
| `401` | Missing or invalid JWT token |
| `403` | Authenticated but insufficient role |
| `404` | Resource not found |
| `500` | Server error |

```json
{ "timestamp": "...", "status": 401, "error": "Unauthorized", "path": "/api/requests" }
```

---

## Seed Credentials (Dev Only)

| Role | Email | Password | Hospital |
|------|-------|----------|----------|
| HSA | `winnie@hsa.gov.sg` | `password123` | — |
| Hospital Staff | `winnieKoh@SGH.sg` | `password123` | SGH |
| Hospital Staff | `james.tan@SGH.sg` | `password123` | SGH |
