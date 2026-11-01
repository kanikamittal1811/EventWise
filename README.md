# EventWise – GenAI-Powered Event Planning Assistant

> **SaaS Web Application engineered for weddings, milestones, festivals, and corporate celebrations.**  
> Powered by Google Gemini AI, Firebase Realtime Database, React, TypeScript, and Tailwind CSS.

---

## 1. Product Vision & Architecture

**Core value proposition:** *Tell us what you're planning. We'll help you plan everything else.*

EventWise replaces chaotic spreadsheets and scattered notes with an intelligent, centralized event planning workspace. Users can describe what they are planning in natural language and instantly receive complete, actionable blueprints—including multi-day function itineraries, deterministic budget allocations, vendor checklists, milestone deadlines, and aesthetic color palettes.

```
                    ┌───────────────────────────────────────────────┐
                    │               Client (React 18)               │
                    │  Vite + TypeScript + Tailwind CSS + Lucide    │
                    └───────────────┬───────────────┬───────────────┘
                                    │               │
       Direct Realtime Sync         │               │  Secure Server Proxy
       (Auth + RTDB Persistence)    │               │  (/api/gemini/...)
                                    ▼               ▼
          ┌───────────────────────────┐   ┌───────────────────────────┐
          │ Firebase Realtime Database│   │ Node.js / Express Server  │
          │  - Users & Profiles       │   │  - Google Gemini API      │
          │  - Events & Functions     │   │  - Structured Zod Output  │
          │  - Budgets & Expenses     │   │  - Budget Optimization    │
          │  - Tasks & Milestones     │   │  - Contextual Copilot     │
          │  - Guests & RSVPs         │   └───────────────────────────┘
          │  - Base64 Images (<= 1MB) │
          └───────────────────────────┘
```

---

## 2. Strict Technology & Architecture Rules

### 🚫 NO FIREBASE STORAGE
- **Firebase Realtime Database is the ONLY database and persistence layer.**
- All user-uploaded photos, decor references, and visual moodboards are persisted as **Base64 data URLs** under `/images/{imageId}` in Firebase Realtime Database.
- Strict **1 MB Base64 encoded ceiling** enforced client-side before any database write.
- Client-side Canvas downscaling: limits longest dimension to **1600px** and iteratively recompresses image quality until the payload is safely below 1 MB.
- Configurable quota limit of **20 images per event**.
- Image records are referenced by `imageId` in events to prevent redundant data loads.

### 🔒 Gemini API Key Security
- The Gemini API key is **never exposed in the frontend**.
- All Gemini calls route through the secure server layer (`server/index.ts`).
- All generative responses are parsed and validated with strict **Zod schemas**.
- All financial calculations (budgets, expenses, category totals, remaining balances) are computed deterministically in TypeScript, never hallucinated by AI.

---

## 3. Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 18, TypeScript, Vite |
| **Styling & Design System** | Tailwind CSS, Lucide React, Google Fonts (*Plus Jakarta Sans* & *Playfair Display*) |
| **Routing** | React Router v6 |
| **Forms & Validation** | React Hook Form, Zod |
| **Backend & Persistence** | Firebase Realtime Database, Firebase Authentication |
| **AI Engine** | Google Gemini API (`gemini-1.5-flash`), Structured JSON Output |
| **Testing** | Vitest (deterministic arithmetic, Zod schemas, image compression pipeline) |

---

## 4. Logical Database Structure

```
users/
  {uid}/
    profile: { uid, email, displayName, createdAt, preferences }

events/
  {eventId}/
    id
    ownerId
    name
    category
    description
    location
    eventDate
    endDate
    guestCount
    totalBudget
    currency
    theme
    status
    createdAt
    updatedAt

    functions/
      {functionId}/: { id, name, date, startTime, venue, description }

    budget/
      total
      categories/
        {categoryId}/: { id, name, allocatedAmount, color, notes }
      expenses/
        {expenseId}/: { id, categoryId, title, amount, paidAmount, status, dueDate, paidDate }

    vendors/
      {vendorId}/: { id, name, category, quotation, negotiatedPrice, bookingStatus, paymentStatus, contactName, phone }

    tasks/
      {taskId}/: { id, title, priority, status, dueDate, relativeDeadline, assigneeName }

    guests/
      {guestId}/: { id, name, category, rsvpStatus, plusOnes, dietaryPreferences, invitationSent }

    imageIndex/
      {imageId}/: { id, fileName, mimeType, sizeBytes, width, height, imageType, caption }

images/
  {imageId}/
    id
    ownerId
    eventId
    fileName
    mimeType
    base64Data      <-- Enforced <= 1 MB Base64 data URL
    sizeBytes
    width
    height
    imageType
    createdAt
```

---

## 5. Firebase Security Rules (`database.rules.json`)

Deploy these rules to Firebase Realtime Database:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth != null && auth.uid === $uid",
        ".write": "auth != null && auth.uid === $uid",
        "profile": {
          ".validate": "newData.hasChildren(['uid', 'email', 'displayName', 'createdAt'])"
        }
      }
    },
    "userEvents": {
      "$uid": {
        ".read": "auth != null && auth.uid === $uid",
        ".write": "auth != null && auth.uid === $uid"
      }
    },
    "events": {
      ".indexOn": ["ownerId", "eventDate"],
      "$eventId": {
        ".read": "auth != null && (data.child('ownerId').val() === auth.uid || data.child('collaborators/' + auth.uid).exists())",
        ".write": "auth != null && (!data.exists() || data.child('ownerId').val() === auth.uid || data.child('collaborators/' + auth.uid + '/role').val() === 'editor')",
        ".validate": "newData.hasChildren(['id', 'ownerId', 'name', 'category', 'eventDate', 'totalBudget'])"
      }
    },
    "images": {
      ".indexOn": ["ownerId", "eventId"],
      "$imageId": {
        ".read": "auth != null && (data.child('ownerId').val() === auth.uid || root.child('events/' + data.child('eventId').val() + '/collaborators/' + auth.uid).exists() || root.child('events/' + data.child('eventId').val() + '/ownerId').val() === auth.uid)",
        ".write": "auth != null && (!data.exists() || data.child('ownerId').val() === auth.uid)",
        ".validate": "newData.hasChildren(['id', 'ownerId', 'eventId', 'base64Data', 'sizeBytes', 'mimeType', 'width', 'height', 'imageType']) && newData.child('sizeBytes').val() <= 1048576"
      }
    }
  }
}
```

---

## 6. Environment Setup

Create `.env` in the root directory:

```bash
# Frontend Firebase Web SDK (Realtime Database ONLY)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_APP_ID=your_firebase_app_id

# Server-Side Gemini Configuration (Never expose to frontend!)
GEMINI_API_KEY=your_google_gemini_api_key
GEMINI_MODEL=gemini-1.5-flash
PORT=3001
```

*Note:* If Firebase environment variables are omitted, EventWise automatically runs in **Offline / Demo Mode** with local reactive state and demo storage, enabling instant out-of-the-box evaluation.

---

## 7. Available Scripts

| Command | Action |
|---|---|
| `npm run dev` | Runs backend Gemini proxy server (port 3001) & Vite frontend (port 5173) concurrently |
| `npm run server` | Starts only the Node/Express Gemini backend server |
| `npm run vite` | Starts only the Vite frontend dev server |
| `npm test` | Executes unit tests via Vitest (calculations, Zod schemas, image compression) |
| `npm run build` | Compiles TypeScript and builds production assets to `/dist` |
| `npm run preview` | Previews the production build locally |

---

## 8. Definition of Done Checklist

- [x] Register and log in with email/password, Google auth, and Demo one-click sign in.
- [x] Create events manually or through GenAI natural language prompt (*"Plan a 3-day wedding in Jaipur for 200 people with ₹20 lakh budget"*).
- [x] Receive structured AI-generated plan (functions, category allocations, tasks, theme, vendor tips).
- [x] Deterministic budget manager with category allocations, real-time expense tracking, and AI budget optimization.
- [x] Vendor manager with quotation vs negotiated price comparison, status tracking, and contact details.
- [x] Timeline and task checklist with priority badges, deadline recalculation, and AI milestone generator.
- [x] Guest management with RSVP tracking, party size, dietary preference summaries, and invitation tracker.
- [x] Creative Studio with client-side image compression, 1 MB Base64 validation, and Realtime Database storage.
- [x] AI concept generator with theme descriptions and one-click HEX color swatch copying.
- [x] AI invitation card and WhatsApp announcement generator with one-click clipboard copy.
- [x] Live context-aware AI Copilot drawer maintaining real-time awareness of active event metrics.
- [x] Production build passes cleanly with zero errors.
- [x] Comprehensive unit tests pass with 100% success rate.

