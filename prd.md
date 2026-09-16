# AgriTrace — Product Requirements Document

**Project:** Agri-Record & Traceability System for Small Producers  
**Project Type:** 2-Hour Hackathon MVP  
**Development Approach:** AI-assisted rapid development  
**Primary Stack:** Next.js + Supabase

---

## 1. Product Overview

AgriTrace is a mobile-first web application that enables small-scale farmers to digitally record agricultural activities from cultivation to sale and generate a unique QR code for each agricultural batch.

Consumers, retailers, and authorized organizations can scan the QR code to view product origin, cultivation history, harvest details, evidence photographs, GPS information, timestamps, and verification status.

The MVP must demonstrate one complete workflow:

```text
Farmer → Create Farm → Create Batch → Record Activities
→ GPS + Timestamp + Photo → Generate QR → Consumer Scans QR
→ Public Traceability Page → Product History + Evidence + Verification
```

---

## 2. Hackathon Objective and Scope

This is a **2-hour hackathon project**. The goal is a polished, functional prototype—not a production-scale agricultural ERP.

### Must-have features

- Batch creation
- Cultivation activity recording
- Automatic timestamps
- GPS capture
- Photo evidence
- Activity timeline
- Unique batch code
- QR code generation
- QR code scanning
- Public traceability page
- Verification status
- Audit/edit history

### Explicitly out of scope for the MVP

- Blockchain
- Machine learning
- AI chatbot
- IoT sensors
- Payment gateway
- Marketplace
- Complex authentication
- Government integrations
- Advanced analytics
- Advanced weather prediction
- Supply-chain optimization
- Multi-tenant enterprise architecture

---

## 3. Target Users

### Farmer

Can create farms and batches, record cultivation activities, upload evidence, capture GPS, generate QR codes, and track verification.

### Consumer

No account required. Can scan a QR code and view product origin, cultivation history, photographs, harvest details, location, and verification.

### Cooperative / Agricultural Officer

For the MVP, this role can be simulated with seeded data. It can review batches, add remarks, and mark batches as verified.

---

## 4. Core User Journeys

### Farmer

```text
Landing → Dashboard → Create Batch → Crop Information
→ Batch Created → Add Activity → GPS → Photo → Save
→ Repeat Activities → Generate QR → Display QR
```

### Consumer

```text
Scan QR → Extract Batch ID → Public Traceability Page
→ Product → Farm → Timeline → Evidence → Location → Verification
```

---

## 5. Technology Stack

| Layer | Technology |
|---|---|
| Development | Google Antigravity / Claude-assisted coding |
| Frontend | Next.js, React, TypeScript |
| Styling | Tailwind CSS, shadcn/ui, Lucide Icons |
| Backend | Next.js server-side functionality / API routes |
| Database | Supabase PostgreSQL |
| Storage | Supabase Storage |
| QR Generation | `qrcode.react` |
| QR Scanning | `html5-qrcode` |
| Maps | Leaflet + OpenStreetMap |
| Location | Browser Geolocation API |
| Deployment | Vercel |
| Version Control | GitHub |

---

## 6. Application Architecture

```text
                         AgriTrace
                            │
                 ┌──────────┴──────────┐
                 │                     │
           Farmer Interface     Consumer Interface
                 │                     │
                 ▼                     ▼
             Next.js App        Public Trace Page
                 │                     │
                 └──────────┬──────────┘
                            │
                     Supabase Backend
                            │
                ┌───────────┼───────────┐
                │           │           │
             PostgreSQL   Storage      Auth
                │           │
        ┌───────┼───────┐   └── Photos
        │       │       │
      Farms   Batches Activities
                         │
                    Audit Logs
                         │
                    Verification
```

---

## 7. Database Requirements

### `farmers`

```text
id
name
phone
email
created_at
```

### `farms`

```text
id
farmer_id
farm_name
village
district
state
latitude
longitude
created_at
```

Relationship:

```text
farmers.id → farms.farmer_id
```

### `batches`

```text
id
batch_code
farm_id
crop_name
variety
sowing_date
expected_harvest_date
harvest_date
quantity
unit
status
created_at
```

Relationship:

```text
farms.id → batches.farm_id
```

### `activities`

```text
id
batch_id
activity_type
description
activity_date
latitude
longitude
photo_url
created_at
```

Relationship:

```text
batches.id → activities.batch_id
```

### `verifications`

```text
id
batch_id
verified_by
organization
status
remarks
verified_at
```

Possible statuses:

```text
UNVERIFIED
PENDING
VERIFIED
```

### `audit_logs`

```text
id
batch_id
action
field_name
old_value
new_value
edited_by
created_at
```

---

## 8. Batch and Activity Requirements

### Batch Code

Every batch must have a unique human-readable identifier:

```text
AGRI-2026-001
AGRI-2026-002
AGRI-2026-003
```

Database UUIDs may be used internally, but the visible identifier should be the batch code.

### Supported Activities

```text
Sowing
Fertilizer Application
Pesticide Application
Irrigation
Weeding
Pest Management
Harvest
Packaging
Transportation
```

### Activity Evidence

Each activity should support:

- Description
- Activity date
- Timestamp
- GPS coordinates
- Optional photograph

Use:

```javascript
navigator.geolocation.getCurrentPosition()
```

Capture:

```text
latitude
longitude
accuracy
timestamp
```

If location permission is denied, allow saving without GPS.

---

## 9. Required Application Pages

| Route | Purpose |
|---|---|
| `/` | Landing page |
| `/dashboard` | Farmer dashboard |
| `/batch/new` | Create batch |
| `/batch/[id]` | Batch details, activities, QR, audit |
| `/scan` | Consumer QR scanner |
| `/trace/[batchCode]` | Public traceability page |

---

## 10. Page Requirements

### Landing Page — `/`

Display:

```text
AGRI-TRACE

From Farm to Consumer.
Every Product. Every Story.

Digital agricultural records and QR-powered
product traceability for small producers.

[ Farmer Dashboard ]    [ Scan Product ]

Farm → Record → Verify → Scan → Trust
```

### Farmer Dashboard — `/dashboard`

Display:

- Total batches
- Active crops
- Harvested batches
- Verified batches
- Recent batches
- Create New Batch button

Example:

```text
AgriTrace
Farmer Dashboard

Welcome, Ravi

Total Batches       12
Active Crops         4
Harvested            8
Verified             6

Recent Batches

Tomato
AGRI-2026-001
Green Valley Farm
Growing

[View Batch]

[+ Create New Batch]
```

### Create Batch — `/batch/new`

Fields:

```text
Crop
Variety
Farm
Sowing Date
Expected Harvest Date
Quantity
Unit
```

Supported units:

```text
kg
tonnes
litres
pieces
boxes
```

On submission:

1. Validate input.
2. Generate a unique batch code.
3. Save to Supabase.
4. Redirect to `/batch/[id]`.

### Batch Details — `/batch/[id]`

Display crop, variety, batch code, farm, location, status, cultivation timeline, activity evidence, verification, and audit history.

Primary actions:

```text
+ Add Activity
Generate QR
```

Example:

```text
CULTIVATION JOURNEY

● Seeds Sown
  10 June 2026

● Organic Fertilizer Applied
  25 June 2026

● Irrigation
  5 July 2026

● Pest Management
  20 July 2026

● Harvest
  15 September 2026
```

### QR Scanner — `/scan`

Use `html5-qrcode`.

After scanning:

```text
QR → Extract URL → Extract batchCode → /trace/[batchCode]
```

No consumer login is required.

### Public Traceability — `/trace/[batchCode]`

This is the most important consumer-facing page. It should feel like a digital product certificate.

Show:

```text
✓ VERIFIED PRODUCT

TOMATO

Batch
AGRI-2026-001

Green Valley Farm
Thiruvananthapuram, Kerala
```

Also show:

- Crop
- Variety
- Quantity
- Sowing date
- Harvest date
- Production timeline
- Evidence photographs
- Farm location
- Verification
- Traceability completeness

---

## 11. QR Code Requirements

Every batch must have a QR code containing the public traceability URL:

```text
https://YOUR-DOMAIN/trace/AGRI-2026-001
```

Use `qrcode.react`.

Provide where practical:

```text
[ Download QR ]
[ Print QR ]
```

The QR must open the public traceability page.

---

## 12. Production Timeline

Each activity should display:

```text
Activity
Description
Date
Time
GPS
Photo
```

Example:

```text
PRODUCTION JOURNEY

✓ Sowing
  10 Jun 2026
  Seeds planted

✓ Fertilizer Application
  25 Jun 2026
  Organic compost applied

✓ Irrigation
  5 Jul 2026
  Field irrigation

✓ Pest Management
  20 Jul 2026

✓ Harvest
  15 Sep 2026
  100 kg harvested
```

Activities may expand/collapse to show additional evidence.

---

## 13. Photo Evidence

Use Supabase Storage.

Bucket:

```text
activity-photos
```

Recommended path:

```text
activity-photos/
    AGRI-2026-001/
        fertilizer-001.jpg
```

Store the resulting URL/reference in:

```text
activities.photo_url
```

If upload becomes a blocker, allow the activity to be saved without a photo.

---

## 14. Farm Location

Use:

```text
Leaflet
OpenStreetMap
```

Display an interactive map when coordinates are available.

Example:

```text
FARM LOCATION

[ Interactive Map ]

8.5241° N
76.9366° E

Thiruvananthapuram, Kerala
```

If the map becomes a blocker, show coordinates and a clean location card.

---

## 15. Verification

Display:

```text
VERIFICATION

✓ Farm Registered
✓ Production Records Available
✓ Harvest Recorded
✓ Evidence Available

VERIFIED BY

Green Farmers Cooperative

Verified:
16 September 2026
```

Use a prominent:

```text
✓ VERIFIED
```

badge.

For the MVP, verification can be represented by seeded/demo data.

---

## 16. Traceability Completeness

Display a deterministic completeness indicator.

Example:

```text
TRACEABILITY COMPLETENESS

██████████████████░░

90%
```

Possible components:

```text
Farm information
Crop information
Sowing record
Cultivation records
GPS evidence
Photo evidence
Harvest record
Verification
```

Formula:

```text
completed components / total components × 100
```

This is not an ML model.

---

## 17. Audit History

Show:

```text
AUDIT HISTORY

16 Sep 2026 — Activity Added
15 Sep 2026 — Harvest Recorded
20 Jul 2026 — Pest Management Added
25 Jun 2026 — Fertilizer Record Added
```

For edits:

```text
Activity Description Changed

Old:
Chemical fertilizer

New:
Organic compost

Edited:
16 Sep 2026, 09:42
```

Whenever important batch/activity data is edited, create an audit log.

---

## 18. Validation Rules

### Batch

```text
Quantity > 0
Crop is required
Farm is required
Sowing date is required
```

### Dates

```text
Harvest date cannot be before sowing date.
Expected harvest cannot be before sowing date.
```

### Activity

```text
Activity type is required.
Activity date is required.
```

---

## 19. Error Handling

### Batch Not Found

```text
Batch Not Found

This QR code does not correspond
to a registered agricultural batch.
```

### Location Denied

```text
Location unavailable.

You can continue without GPS evidence.
```

### Photo Upload Failure

```text
Photo upload failed.

The activity can still be saved.
```

### QR Scanner Failure

Provide an image-upload fallback if feasible.

---

## 20. Demo Dataset

### Farmer

```text
Name: Ravi Kumar
Farm: Green Valley Farm
Location: Thiruvananthapuram, Kerala
```

### Batch

```text
Crop: Tomato
Variety: Anagha
Batch: AGRI-2026-001
Quantity: 100 kg
```

### Activities

```text
10 June 2026 — Sowing
25 June 2026 — Organic Fertilizer Application
5 July 2026 — Irrigation
20 July 2026 — Pest Management
15 September 2026 — Harvest
```

### Verification

```text
Organization: Green Farmers Cooperative
Status: VERIFIED
Date: 16 September 2026
```

Include realistic sample photographs if needed.

---

## 21. Crop Reference Data

Do not spend hackathon time downloading a large agricultural dataset.

Use a small static crop master:

```text
Tomato
Banana
Rice
Pepper
Coconut
Brinjal
Chilli
Cucumber
Ginger
Turmeric
Tapioca
```

Example:

```typescript
{
  name: "Tomato",
  category: "Vegetable",
  unit: "kg"
}
```

Potential future sources:

- FAOSTAT — crop/agricultural reference data
- OpenStreetMap/Nominatim — location/geocoding
- Open-Meteo — weather

These integrations must not block the MVP.

---

## 22. Responsive Design

The application must be mobile-first.

Priority:

```text
Mobile → Tablet → Desktop
```

Requirements:

- Large touch-friendly buttons
- Simple forms
- Responsive cards
- Clear navigation
- Avoid dense desktop-only layouts

---

## 23. Visual Design Direction

The application should look like a modern agricultural technology startup.

### Design characteristics

- Minimal
- Premium
- Clean
- Trustworthy
- Modern
- Agricultural
- Professional

### UI direction

- Earth/green-inspired visual language
- Soft cards
- Subtle borders
- Rounded corners
- Clean typography
- Clear icons
- Strong visual hierarchy

Avoid:

- Excessive gradients
- Neon colors
- Complicated animations
- Generic dashboard templates
- Crowded screens

---

## 24. Navigation

### Desktop

```text
AgriTrace

Dashboard
Batches
Scan
```

### Mobile

```text
Home
Batches
Scan
Profile
```

The QR scanner should be easily accessible.

---

## 25. Security Requirements

For the MVP:

- Never expose Supabase service-role keys to the browser.
- Use environment variables.
- Public trace pages must expose only intended product information.
- Do not expose farmer phone/email publicly.
- Validate batch IDs server-side.
- Full authentication and RLS can be expanded later.

---

## 26. Performance Requirements

Keep the application lightweight.

Avoid unnecessary dependencies.

Do not introduce:

```text
Redux
GraphQL
Microservices
Complex state-management libraries
```

Use standard React/Next.js state management where sufficient.

---

## 27. Two-Hour Implementation Schedule

| Time | Work |
|---|---|
| 0–15 min | Next.js setup, Supabase connection, schema, seed data |
| 15–35 min | Dashboard, Create Batch, Batch Details |
| 35–60 min | Activity recording, timeline, GPS, photo upload |
| 60–80 min | QR generation and public traceability page |
| 80–95 min | QR scanner, map, verification |
| 95–110 min | Audit history, validation, mobile polish |
| 110–120 min | End-to-end testing and demo preparation |

**When time is nearly exhausted, stop adding features.**

A working end-to-end flow is more valuable than additional unfinished features.

---

## 28. MVP Definition of Done

The MVP is complete when this workflow works:

```text
1. Open application
        ↓
2. Open Farmer Dashboard
        ↓
3. Create Tomato batch
        ↓
4. System generates AGRI-2026-001
        ↓
5. Add Sowing activity
        ↓
6. Capture GPS
        ↓
7. Upload a photo
        ↓
8. Add Fertilizer activity
        ↓
9. Add Harvest activity
        ↓
10. Generate QR
        ↓
11. Open QR Scanner
        ↓
12. Scan QR
        ↓
13. Consumer Traceability Page opens
        ↓
14. Consumer sees farm
        ↓
15. Consumer sees crop
        ↓
16. Consumer sees timeline
        ↓
17. Consumer sees photos
        ↓
18. Consumer sees GPS/map
        ↓
19. Consumer sees verification
        ↓
20. Audit history is visible
```

If this workflow works, **stop adding features**.

---

## 29. Future Scope

### Version 2

- Offline-first farmer application
- Multi-language support
- Malayalam interface
- Farmer authentication
- Cooperative accounts
- Agricultural officer accounts
- Advanced verification
- Weather integration
- Crop disease information

### Version 3

- AI-assisted agricultural records
- Crop yield prediction
- Anomaly detection
- Automated fraud detection
- Supply-chain tracking
- Market integration
- Digital certificates
- IoT sensor integration

### Version 4

- National agricultural traceability network
- Government integrations
- Export certification
- Advanced supply-chain provenance
- Cross-organization verification

---

## 30. Final Instruction for Claude

Act as the **lead full-stack engineer and UI/UX engineer** for this project.

First inspect the existing project structure.

Then:

1. Set up the project if necessary.
2. Install the required dependencies.
3. Create the Supabase schema.
4. Create seed/demo data.
5. Build the pages described above.
6. Implement the complete farmer → batch → activity → QR → consumer workflow.
7. Test every major flow.
8. Fix runtime and TypeScript errors.
9. Ensure mobile responsiveness.
10. Keep the UI polished and hackathon-ready.

**Do not stop after creating mock screens.**

The application must use real Supabase data flow wherever specified.

If an external integration becomes a blocker, implement a clean fallback rather than allowing it to block the MVP.

The final result should be a **working, deployable, visually polished AgriTrace MVP suitable for a 2-hour hackathon demonstration.**

### Priority when time is limited

```text
QR traceability
      ↓
Batch creation
      ↓
Activity timeline
      ↓
Supabase
      ↓
GPS / photo evidence
      ↓
Verification
      ↓
Audit history
      ↓
UI polish
      ↓
Everything else
```

---

## 31. Hackathon Demo Scenario

Imagine a consumer buying a packet of locally produced tomatoes.

The farmer has registered:

```text
Tomato
Batch AGRI-2026-001
```

The farmer records:

```text
Sowing
Fertilization
Irrigation
Pest Management
Harvest
```

Each record can contain:

```text
Timestamp
GPS
Photo
```

The system generates a QR code.

The QR is printed or attached to the product.

The consumer scans it and immediately sees:

```text
WHERE WAS IT PRODUCED?
        ↓
WHAT CROP IS IT?
        ↓
WHAT HAPPENED DURING CULTIVATION?
        ↓
WHEN WAS IT HARVESTED?
        ↓
WHERE DID IT COME FROM?
        ↓
HAS IT BEEN VERIFIED?
```

This demonstrates the core value proposition:

```text
DIGITAL FARM RECORD
        +
EVIDENCE
        +
TRACEABILITY
        +
QR
        +
VERIFICATION
```

---

**End of PRD**
