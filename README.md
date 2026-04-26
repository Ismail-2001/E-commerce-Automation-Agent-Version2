<div align="center">

# 🤖 E-commerce MultiAgent

### The AI-Powered E-commerce Operating System

<br/>

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![DeepSeek AI](https://img.shields.io/badge/DeepSeek-Primary_AI-61DAFB?style=for-the-badge)](https://deepseek.com)
[![Google Gemini](https://img.shields.io/badge/Gemini-Vision-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![Recharts](https://img.shields.io/badge/Recharts-Analytics-FF6B6B?style=for-the-badge)](https://recharts.org)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Netlify](https://img.shields.io/badge/Deployed_on-Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](#license)

<br/>

> *"It's not just a dashboard. It's a digital workforce that never sleeps."*

**MultiAgent** is a next-generation e-commerce intelligence platform that deploys a **fleet of specialized AI agents** — pricing, supplier, marketing, recovery, inventory, and order intelligence — to autonomously optimize your store's revenue, inventory health, and customer relationships. Built with a multi-tenant Supabase backend, realtime data sync, voice-enabled chat, image analysis, and storefront connectors for Shopify & WooCommerce.

[**🚀 Features**](#-key-features) · [**🏗️ Architecture**](#-architecture) · [** Agents**](#-ai-agents) · [**⚡ Quick Start**](#-quick-start)

---

</div>

## 📌 The Problem

Running an e-commerce operation means drowning in operational overhead:

- **Abandoned carts** silently drain 70%+ of potential revenue — and no one sends the right email at the right time
- **Dead stock** ties up capital while **low stock** causes lost sales, both requiring constant manual monitoring
- **Pricing decisions** are gut-feel — no data-driven margin optimization across hundreds of SKUs
- **Supplier negotiations** are ad-hoc, leaving money on the table on every reorder
- **Marketing copy** is generic — one-size-fits-all ads that don't convert
- **Order communications** (VIP thank-yous, return risk outreach, shipping updates) are repetitive yet critical
- **Demand forecasting** is a spreadsheet exercise — no proactive stockout prediction
- **Business questions** ("What's my best-selling product this week?") require navigating 3 different tools to answer

**MultiAgent collapses all of this into a single, AI-native command center.**

---

## 🚀 Key Features

### 🏠 Executive Dashboard
A live command center with real-time KPIs, revenue analytics, and an AI briefing feed.

- **Time-aware greeting** — contextual morning/afternoon/evening welcome with executive summary
- **4 live KPI tiles** — Total Revenue, Active Orders, Low Stock Items, Cart Recovery Rate
- **Revenue AreaChart** — daily revenue trends for the past 7 days with hover tooltips
- **Live Agent Activity Feed** — a consolidated scroll of actions taken by every agent (Recovery, Inventory, Orders) with relative timestamps
- **Fallback mock feed** — works offline without Supabase configured

### 🛒 Abandoned Cart Recovery Agent
The revenue rescue engine.

- **Intelligent Detection** — automatically flags abandoned carts ranked by recovery potential with a live total of recoverable revenue
- **Adaptive Strategy** — carts >$100 get a unique 15% discount code; standard carts get FOMO-driven urgency copy
- **AI-Generated Email Drafts** — DeepSeek writes personalized, persuasive recovery emails with subject lines
- **One-Click Dispatch** — sends via Supabase Edge Function → Resend (with graceful offline simulation fallback)
- **Activity Logging** — every sent email is recorded to the `agent_activity` table for audit

### 📦 Inventory Commander
AI-driven stock optimization.

- **Visual Product Cards** — searchable list with stock-level badges, prices, and AI-analyzable entries
- **Hybrid AI Analysis** — rule-based classification (restock / dead_stock / ok) for instant response + DeepSeek for rich content generation
- **Auto-Generated Content** — vendor reorder emails for low stock, flash sale social copy for overstock
- **Inline Editing** — draft emails in a live textarea before sending

### 🧾 Smart Order Processor
AI-powered fulfillment intelligence.

- **VIP Recognition** — orders >$1,000 are flagged as VIP with auto-generated premium thank-you emails
- **Return Risk Management** — returned orders trigger empathetic feedback-request emails
- **Pending Order Alerts** — orders awaiting shipment get shipping-label reminder emails
- **Searchable Order Board** — filter by customer name or order ID with one-click AI analysis

### 💬 AutoAgent Chat (Voice-Enabled)
A multimodal AI chat interface with voice input and text-to-speech output.

- **Context-Aware** — the AI receives live inventory, order, and sales context with every query
- **JSON-Structured Responses** — the agent returns `{ text, ui_widget, widget_data }` for rich inline product/order cards
- **Voice Mode** — toggle speech recognition (Web Speech API) to speak questions; AI replies are auto-spoken via TTS
- **Suggestion Buttons** — clickable prompts for common queries: sales trends, low stock checks, refund drafts
- **Markdown Rendering** — supports GFM tables, lists, and code blocks in AI responses

### 📊 Demand Forecasting
Predictive stock planning using statistical modeling.

- **Linear Regression Trend Detection** — identifies rising, stable, and declining sales velocity per SKU
- **Exponential Moving Average (EMA)** — smooths noisy daily sales for accurate stockout prediction
- **Stockout Countdown** — calculates days until stockout with confidence scores based on R²
- **7-Day Bar Chart Forecast** — per-product visual projection with recommended reorder dates and quantities
- **Smart Sorting** — most urgent (nearest stockout) products appear first

### 🖼️ Product Image Analysis
Upload a product photo for AI-powered listing optimization.

- **Drag-and-Drop Upload** — supports JPG, PNG, WebP with live preview
- **Gemini Vision** — extracts product description, condition assessment, SEO keywords, suggested title, price, and category
- **Raw Mode Toggle** — switch between structured results and the raw AI output
- **One-Click Copy** — clipboard copy for any analysis result

### 🔗 Storefront Connector
Sync your live storefront into MultiAgent.

- **Shopify Admin REST API** — imports products and orders via access token
- **WooCommerce REST API** — imports via consumer key/secret with Basic Auth
- **Connection Test** — validates credentials before any data sync
- **Sync Results Dashboard** — shows imported product/order counts and any warnings

### 🧩 Multi-Agent Hub
A cross-agent intelligence dashboard with three specialized agents working in concert.

#### 💰 Pricing Agent
- Analyzes stock levels, demand velocity, and margin to recommend **price increases, decreases, or holds**
- Estimates monthly revenue impact for each suggestion
- Color-coded confidence scores and change percentages

#### 🚚 Supplier Agent
- Classifies products by supplier urgency: **critical reorder → high reorder → negotiate → stable**
- Auto-generates vendor negotiation emails with specific strategies (bulk discount, net-30 terms, consignment)
- Calculates estimated wholesale costs (40% of retail model)

#### 📢 Marketing Agent
- Auto-generates campaign briefs based on inventory status:
  - **Clearance** for overstock, **Flash Sale** for low stock, **New Arrival** for out-of-stock restocks, **Seasonal** for healthy inventory
- **AI Ad Copy Generator** — platform-specific copy (Instagram, Facebook, TikTok, Email) via DeepSeek
- Target audience segmentation and channel recommendations

### 🔐 Authentication & Multi-Tenancy
- **Supabase Auth** — email/password sign-up and sign-in with session persistence
- **Merchant Workspaces** — each user gets a dedicated merchant profile with a unique slug
- **Row-Level Security** — every database query is scoped to the user's merchant via RLS policies
- **Auto-Seeding** — new sign-ups get demo data pre-loaded (5 products, 5 orders, 3 carts, 7 days of sales)
- **Graceful Fallback** — if Supabase credentials aren't configured, the app runs entirely on mock data

---

## 🧠 AI Agents

MultiAgent deploys **8 specialized agents** across 3 domains:

| Agent | Domain | Purpose | AI Provider |
|---|---|---|---|
| **Recovery Agent** | Revenue | Abandoned cart email generation with value-based strategy | DeepSeek |
| **Inventory Agent** | Operations | Restock alerts + dead stock flash sale copy | DeepSeek |
| **Order Agent** | CRM | VIP thank-yous, return risk outreach, shipping updates | DeepSeek |
| **Chat Agent** | Analytics | Conversational business intelligence with rich widgets | DeepSeek |
| **Pricing Agent** | Revenue | Dynamic price optimization based on stock velocity | Rule-based + Random |
| **Supplier Agent** | Operations | Vendor reorder analysis + negotiation email drafting | DeepSeek |
| **Marketing Agent** | Growth | Campaign briefs + platform-specific ad copy | DeepSeek |
| **Image Agent** | Listing | Product photo analysis → SEO keywords + pricing hints | Gemini Vision |
| **Forecasting Engine** | Planning | Demand prediction via linear regression + EMA | Statistical |

### AI Provider Strategy

| Provider | Used For | Models |
|---|---|---|
| **DeepSeek** | Primary agent (all text generation, email drafts, ad copy, chat) | `deepseek-chat`, `deepseek-reasoner` |
| **Google Gemini** | Vision/image analysis, fallback general chat | `gemini-2.5-flash`, `gemini-2.5-flash-image` |

---

## 🛠️ Tech Stack

| Category | Technology | Purpose |
|---|---|---|
| **UI Framework** | React 19 | Concurrent rendering, modern hooks |
| **Language** | TypeScript 5.8 | Full type safety across all layers |
| **State Management** | Zustand 5.0 | Lightweight global store for auth + data |
| **AI — Primary** | DeepSeek API | Chat completions for all agent reasoning |
| **AI — Vision** | Google Gemini (`@google/genai`) | Product image analysis |
| **Database** | Supabase (PostgreSQL) | Multi-tenant RLS, realtime subscriptions, auth |
| **Email** | Resend (via Supabase Edge Function) | Recovery email delivery |
| **Charts** | Recharts 3.5 | Area charts, bar charts, responsive layouts |
| **Date Utils** | date-fns 4.1 | Time-ago formatting, date math |
| **Icons** | Lucide React 0.555 | Consistent SVG icon system |
| **Voice** | Web Speech API | Speech recognition + text-to-speech |
| **Build Tool** | Vite 6.2 | HMR dev server, optimized production builds |
| **Deployment** | Netlify | SPA with catch-all redirect |

---

## 🏗️ Architecture

MultiAgent follows a **strict services-layer / component-layer separation**. UI components never call AI directly — they delegate to purpose-built agent services.

```
MultiAgent Application
│
├── 🧩 UI Layer (components/)
│   ├── Layout.tsx            # App shell, sidebar nav, mobile menu, view router
│   ├── Auth.tsx              # Supabase auth (sign-up/sign-in) with branded UI
│   ├── Dashboard.tsx         # KPIs, revenue chart, live agent activity feed
│   ├── Inventory.tsx         # Product cards, AI analysis panel
│   ├── Orders.tsx            # Order board with AI classification panel
│   ├── RecoveryAgent.tsx     # Cart pipeline + AI email composer + send
│   ├── ChatAgent.tsx         # Multimodal chat with voice mode + rich widgets
│   ├── Forecasting.tsx       # Stockout predictions + 7-day bar charts
│   ├── ImageAnalysis.tsx     # Drag-and-drop upload + Gemini Vision results
│   ├── Connector.tsx         # Shopify/WooCommerce connection + sync
│   └── AgentHub.tsx          # Cross-agent dashboard (pricing + supplier + marketing)
│
├──  Agent Services Layer (services/)
│   ├── aiService.ts          # DeepSeek chat agent — JSON-structured responses
│   ├── geminiService.ts      # Gemini vision + general chat + strategic insights
│   ├── recoveryAgent.ts      # Cart value segmentation + recovery email generation
│   ├── inventoryAgent.ts     # Rule-based classification + vendor/email content generation
│   ├── orderAgent.ts         # VIP detection + retention email generation
│   ├── pricingAgent.ts       # Stock-velocity pricing optimization (rule-based)
│   ├── supplierAgent.ts      # Vendor analysis + negotiation email drafting
│   ├── marketingAgent.ts     # Campaign briefs + platform-specific ad copy
│   ├── forecastingService.ts # Linear regression + EMA demand prediction
│   ├── ecommerceConnector.ts # Shopify & WooCommerce API importers
│   └── emailService.ts       # Resend email via Supabase Edge Function
│
├── 📦 State Layer (stores/)
│   ├── authStore.ts          # Supabase auth session + merchant workspace
│   └── dataStore.ts          # Products, orders, carts, sales data + realtime sync
│
├──  Hooks (hooks/)
│   └── useVoice.ts           # Web Speech API — speech recognition + TTS
│
├── ️ Backend (supabase/)
│   ├── migrations/001_initial_schema.sql   # 8 tables, RLS, triggers, seed function
│   └── functions/send-recovery-email/      # Deno edge function → Resend
│
├── 📐 Shared Types
│   ├── types.ts              # Product, Order, Cart, ChatMessage, SalesData, ViewState
│   └── types/database.ts     # Supabase auto-generated type definitions
│
└── 🔧 Config
    ├── vite.config.ts        # Env injection (DEEPSEEK_API_KEY → process.env.API_KEY)
    ├── netlify.toml          # Build + SPA redirect config
    ├── tsconfig.json         # ES2022, strict mode, path aliases
    └── lib/supabase.ts       # Conditional Supabase client (real vs. no-op proxy)
```

### Data Flow

```
User Action (e.g., "Recover this cart")
        │
        ▼
  RecoveryAgent.tsx (UI)
        │
        ▼
  recoveryAgent.ts (Service)
  ├── Segments cart by value (> $100 = discount tier)
  ├── Builds prompt with customer name, items, strategy
  └── Calls DeepSeek API via fetch
        │
        ▼
  DeepSeek LLM Response
        │
        ▼
  Email draft displayed in UI textarea
        │
        ▼
  user clicks "Send" → emailService.ts → Supabase Edge Function → Resend
        │
        ▼
  Recovery logged to agent_activity table
```

### Multi-Tenancy Model

```
supabase.auth.users (owner)
    │
    └── merchants (1:1) — each user owns one merchant workspace
            │
            ├── products (N) — filtered by merchant_id via RLS
            ├── orders (N) — filtered by merchant_id via RLS
            ├── carts (N) — filtered by merchant_id via RLS
            ├── sales_data (N) — filtered by merchant_id via RLS
            └── agent_activity (N) — filtered by merchant_id via RLS
```

---

## ⚡ Quick Start

### Prerequisites

- **Node.js** `18+` and **npm** `9+`
- A **DeepSeek API Key** (get one at [platform.deepseek.com](https://platform.deepseek.com))
- *(Optional)* A **Google Gemini API Key** for image analysis ([ai.google.dev](https://ai.google.dev))
- *(Optional)* A **Supabase** project for live data, auth, and email ([supabase.com](https://supabase.com))

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Ismail-2001/E-commerce-MultiAgent.git
cd E-commerce-MultiAgent

# 2. Install all dependencies
npm install

# 3. Configure environment variables
```

Create a `.env` file in the project root:

```env
# Required — DeepSeek AI (Primary Agent)
DEEPSEEK_API_KEY=sk-your_deepseek_api_key_here

# Optional — Google Gemini (Image Analysis)
# Add your key to the Gemini service file as process.env.API_KEY

# Optional — Supabase (Auth + Live Data + Email)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Optional — Resend (Email Delivery, set via Supabase secrets)
# supabase secrets set RESEND_API_KEY=re_xxxxx
```

```bash
# 4. (Optional) Set up Supabase
# Run the migration: supabase/migrations/001_initial_schema.sql
# Deploy the edge function: supabase functions deploy send-recovery-email
# Set the secret: supabase secrets set RESEND_API_KEY=re_xxxxx

# 5. Start the development server
npm run dev
```

The app will be live at **`http://localhost:5173`** 🚀

### Available Scripts

| Script | Command | Description |
|---|---|---|
| **Dev Server** | `npm run dev` | Vite HMR dev server on port 5173 |
| **Production Build** | `npm run build` | TypeScript compile + Vite bundle |
| **Preview Build** | `npm run preview` | Locally serves the production bundle |

---

## 📂 Project Structure

```
E-commerce-MultiAgent/
│
├── components/              # 11 UI components
│   ├── Layout.tsx           # App shell, sidebar, mobile menu, nav state
│   ├── Auth.tsx             # Supabase auth (sign-up/sign-in)
│   ├── Dashboard.tsx        # KPIs, revenue chart, agent activity feed
│   ├── Inventory.tsx        # Product cards, AI analysis panel
│   ├── Orders.tsx           # Order board with AI classification
│   ├── RecoveryAgent.tsx    # Cart pipeline + email composer
│   ├── ChatAgent.tsx        # Multimodal chat + voice mode
│   ├── Forecasting.tsx      # Demand prediction + charts
│   ├── ImageAnalysis.tsx    # Image upload + Gemini analysis
│   ├── Connector.tsx        # Shopify/WooCommerce sync
│   └── AgentHub.tsx         # Pricing + Supplier + Marketing agents
│
├── services/                # 11 agent services
│   ├── aiService.ts         # DeepSeek chat — JSON-structured responses
│   ├── geminiService.ts     # Gemini vision + general chat
│   ├── recoveryAgent.ts     # Cart segmentation + recovery emails
│   ├── inventoryAgent.ts    # Stock analysis + content generation
│   ├── orderAgent.ts        # VIP detection + retention emails
│   ├── pricingAgent.ts      # Dynamic price optimization
│   ├── supplierAgent.ts     # Vendor analysis + negotiation emails
│   ├── marketingAgent.ts    # Campaign briefs + ad copy
│   ├── forecastingService.ts# Linear regression + EMA predictions
│   ├── ecommerceConnector.ts# Shopify & WooCommerce API connectors
│   └── emailService.ts      # Resend via Supabase Edge Function
│
├── stores/                  # Zustand state
│   ├── authStore.ts         # Auth session + merchant workspace
│   └── dataStore.ts         # Products, orders, carts + realtime sync
│
├── hooks/
│   └── useVoice.ts          # Web Speech API (recognition + TTS)
│
├── lib/
│   └── supabase.ts          # Conditional Supabase client
│
├── types/
│   └── database.ts          # Supabase type definitions
│
├── supabase/
│   ├── migrations/          # SQL schema + RLS + triggers + seed
│   └── functions/           # Edge function for email delivery
│
├── App.tsx                  # Root component + view router + auth/data init
├── types.ts                 # Shared interfaces (Product, Order, Cart...)
├── constants.ts             # Mock seed data
├── index.tsx                # React entry point
├── index.html               # HTML shell
├── vite.config.ts           # Vite build + env injection config
├── netlify.toml             # Netlify deployment config
└── package.json             # Dependencies and scripts
```

---

## 🌐 Deployment

### Deploy to Netlify

The project ships with a pre-configured `netlify.toml`.

**Via Netlify UI:**
1. Push to GitHub
2. Go to [Netlify](https://netlify.com) → **Add new site** → **Import from GitHub**
3. Select `E-commerce-MultiAgent` — Netlify auto-detects:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
4. Add environment variables:
   - `DEEPSEEK_API_KEY` (required)
   - `VITE_SUPABASE_URL` (optional)
   - `VITE_SUPABASE_ANON_KEY` (optional)
5. Click **Deploy** ✅

**Via Netlify CLI:**
```bash
npm install -g netlify-cli
netlify login
npm run build
netlify deploy --prod --dir=dist
```

### Supabase Setup (Optional but Recommended)

1. Create a project at [supabase.com](https://supabase.com)
2. Run the full migration: `supabase/migrations/001_initial_schema.sql`
3. Deploy the email edge function:
   ```bash
   supabase functions deploy send-recovery-email
   supabase secrets set RESEND_API_KEY=re_xxxxx
   ```
4. Copy your project URL and anon key into `.env`

---

##  Contributing

Contributions are welcome! To contribute:

1. **Fork** the repository
2. **Create** a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Commit** using [Conventional Commits](https://www.conventionalcommits.org/):
   ```bash
   git commit -m "feat: add shopify webhook sync"
   ```
4. **Push** and **open a Pull Request** against `main`

---

## 📄 License

Distributed under the **MIT License**.

---

<div align="center">

**Built to make autonomous commerce the default, not the exception.**

*If MultiAgent changed how you think about e-commerce operations, consider starring ⭐ the repo.*

Built with ❤️ by [Ismail Sajid](https://github.com/Ismail-2001)

</div>
