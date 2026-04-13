<div align="center">

# 🤖 AutoAgent
### The AI-Powered E-commerce Operating System

<br/>

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-AI_Core-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![Recharts](https://img.shields.io/badge/Recharts-Analytics-FF6B6B?style=for-the-badge)](https://recharts.org)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Netlify](https://img.shields.io/badge/Deployed_on-Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://autonomous-operation-platform.netlify.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](./LICENSE)

<br/>

> *"It's not just a dashboard. It's a digital workforce that never sleeps."*

**AutoAgent** is a next-generation e-commerce intelligence platform that deploys a fleet of specialized AI agents to autonomously manage inventory, recover abandoned revenue, process orders intelligently, and answer business questions through a conversational multimodal interface.

[**🌐 Live Demo**](https://autonomous-operation-platform.netlify.app) · [**🚀 Features**](#-key-features) · [**🏗️ Architecture**](#-architecture) · [**⚡ Quick Start**](#-quick-start)

---

</div>

## 📌 The Problem

Running an e-commerce operation means drowning in operational overhead:

- **Abandoned carts** silently drain 70%+ of potential revenue — and no one sends the right email at the right time
- **Dead stock** ties up capital while **low stock** causes lost sales, both requiring constant manual monitoring
- **Order communications** (VIP thank-yous, return risk outreach, shipping updates) are repetitive yet critical
- **Business questions** ("What's my best-selling product this week?") require navigating 3 different tools to answer

**AutoAgent collapses all of this into a single, AI-native command center.**

---

## 🚀 Key Features

### 🛒 Abandoned Cart Recovery Agent
The revenue rescue engine. AutoAgent continuously monitors cart activity and triggers intelligent recovery sequences:

- **Intelligent Detection**: Automatically flags carts that have gone cold, ranked by recovery potential
- **Adaptive Strategy based on cart value**:
  - **High-Value Carts (> $100)** → Generates a personalized, exclusive **15% discount code** to overcome hesitation
  - **Standard Carts** → Crafts urgency-driven copy focused on product value and FOMO
- **One-Click Dispatch**: Drafts a complete, personalized recovery email and sends it instantly — no copy-paste needed
- **Recovery Tracking**: Carts are tagged `recovered` once actioned, giving a clean pipeline view

### 📦 Inventory Commander
Transforms passive inventory tables into an active intelligence layer:

- **Dead Stock Analysis**: Flags products with declining velocity and automatically drafts **Flash Sale** campaigns to liquidate stock and free up cash flow
- **Low Stock Alerts**: Detects SKUs approaching critical thresholds and generates ready-to-send **vendor reorder requests** with quantity recommendations
- **Visual Product Cards**: Rich, interactive card UI replaces static tables — each card shows stock level, status badge, last sold date, and available actions at a glance
- **Stock Status Classification**: Products are continuously classified as `In Stock` / `Low Stock` / `Out of Stock` based on live inventory data

### 🧾 Smart Order Processor
Turns order fulfillment into a relationship-building engine:

- **VIP Recognition**: Detects high Lifetime Value (LTV) customers — defined by multi-item, high-value orders — and auto-drafts personalized **"Thank You"** notes to deepen loyalty
- **Return Risk Management**: When a return is processed, AutoAgent proactively drafts a retention email designed to address the likely root cause and reduce churn
- **Fulfillment Updates**: Automates shipping status communications for pending and in-transit orders, keeping customers informed without manual effort
- **Order Status Board**: Full order panel with status filters (`Pending`, `Shipped`, `Delivered`, `Returned`) and one-click AI actions on each

### 💬 AutoAgent Command Center
A multimodal AI chat interface that acts as your always-on business analyst:

- **Context-Aware Conversations**: The AI has full awareness of your live inventory levels, order statuses, and sales trends — ask it anything
- **Rich UI Widgets**: Unlike generic chatbots, AutoAgent renders **visual Product Cards**, **Order Summaries**, and **Action Buttons** directly inside the chat thread — results you can act on, not just read
- **Agentic Tool Calls**: The AI can query inventory, flag orders for action, and surface recommendations all within a single conversation turn
- **Markdown Rendering**: Responses support full GFM (tables, code blocks, lists) via `react-markdown` + `remark-gfm`

### 📊 Executive Briefing Room
The command center home screen:

- **Weekly Revenue Chart**: Recharts-powered bar graph showing daily revenue and units sold for the past 7 days
- **KPI Strip**: Live counters for Total Revenue, Orders Processed, Active Alerts, and Recovery Rate
- **Alert Feed**: Consolidated live feed of inventory warnings and cart recovery opportunities across the store

---

## 🛠️ Tech Stack

| Category | Technology | Version | Purpose |
|---|---|---|---|
| **UI Framework** | React | `19.2` | Component-based UI with concurrent rendering |
| **Language** | TypeScript | `5.8` | Full type safety across agents, services, and UI |
| **AI Core** | Google Gemini (`@google/genai`) | `1.30` | LLM powering all agent reasoning and generation |
| **Database** | Supabase (`@supabase/supabase-js`) | `2.91` | PostgreSQL backend for real-time data persistence |
| **State Management** | Zustand | `5.0` | Lightweight global state for UI and data layers |
| **Charts** | Recharts | `3.5` | Declarative, composable analytics visualizations |
| **Date Utilities** | date-fns | `4.1` | Lightweight, tree-shakeable date handling |
| **Icons** | Lucide React | `0.555` | Consistent, accessible SVG icon system |
| **Markdown** | react-markdown + remark-gfm | `10.x` | Rich text rendering in the chat interface |
| **Build Tool** | Vite | `6.2` | Sub-second HMR dev server and optimized builds |
| **Deployment** | Netlify | — | Zero-config static site delivery with CDN |

---

## 🏗️ Architecture

AutoAgent is built on a **services-layer + component-layer** separation. UI components never call the AI directly — they delegate to purpose-built agent services that encapsulate all business logic and LLM prompting.

```
AutoAgent Application
│
├── 🧩 UI Layer (components/)
│   ├── Layout.tsx           # App shell, sidebar navigation, view router
│   ├── Dashboard.tsx        # Executive Briefing Room — KPIs, charts, alerts
│   ├── Inventory.tsx        # Inventory Commander — product cards, stock alerts
│   ├── Orders.tsx           # Smart Order Processor — order board, VIP actions
│   ├── RecoveryAgent.tsx    # Abandoned Cart Recovery — cart pipeline, email drafts
│   └── ChatAgent.tsx        # AutoAgent Command Center — multimodal AI chat, widgets
│
├── 🤖 Agent Services Layer (services/)
│   ├── geminiService.ts     # Gemini API client — base LLM call abstraction
│   ├── aiService.ts         # General AI service — chat routing, context injection
│   ├── recoveryAgent.ts     # Cart recovery logic — value segmentation, email generation
│   ├── inventoryAgent.ts    # Inventory intelligence — dead stock, reorder drafting
│   └── orderAgent.ts        # Order intelligence — VIP detection, retention emails
│
├── 📐 Shared Types (types.ts)
│   └── Product, Order, Cart, ChatMessage, SalesData, ViewState
│
└── 📊 Mock Data (constants.ts)
    └── MOCK_PRODUCTS, MOCK_ORDERS, MOCK_CARTS, SALES_DATA
```

### Data Flow

```
User Action (e.g., "Recover this cart")
        │
        ▼
  UI Component (RecoveryAgent.tsx)
        │
        ▼
  Agent Service (recoveryAgent.ts)
  ├── Segments cart by value (> $100 = VIP tier)
  ├── Builds context-rich prompt with cart data
  └── Calls Gemini API via geminiService.ts
        │
        ▼
  Gemini LLM Response
        │
        ▼
  Parsed & Typed Output → Rendered in UI
  (Email draft displayed, action button activated)
```

---

## ⚡ Quick Start

### Prerequisites

- **Node.js** `18+` and **npm** `9+`
- A **Google Gemini API Key** (free tier available at [ai.google.dev](https://ai.google.dev))
- *(Optional)* A **Supabase** project for real data persistence

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Ismail-2001/E-commerce-Automation-Agent.git
cd E-commerce-Automation-Agent

# 2. Install all dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
# Required — Google Gemini AI Core
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Optional — Supabase for real data persistence
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

```bash
# 4. Start the development server
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

```text
E-commerce-Automation-Agent/
│
├── components/
│   ├── Layout.tsx           # App shell, sidebar, navigation state
│   ├── Dashboard.tsx        # Home — KPIs, Recharts revenue graph, alerts
│   ├── Inventory.tsx        # Product cards, stock status, AI actions
│   ├── Orders.tsx           # Order board with status filters and AI tools
│   ├── RecoveryAgent.tsx    # Cart recovery pipeline and email composer
│   └── ChatAgent.tsx        # Multimodal AI chat with rich widget rendering
│
├── services/
│   ├── geminiService.ts     # Base Gemini API client and call abstraction
│   ├── aiService.ts         # Context-aware AI routing for the chat interface
│   ├── recoveryAgent.ts     # Cart segmentation + recovery email generation
│   ├── inventoryAgent.ts    # Dead stock detection + reorder request drafting
│   └── orderAgent.ts        # VIP detection + retention email generation
│
├── App.tsx                  # Root component and view state management
├── types.ts                 # Shared TypeScript interfaces (Product, Order, Cart...)
├── constants.ts             # Mock seed data for development
├── index.tsx                # React DOM entry point
├── index.html               # HTML shell
├── netlify.toml             # Netlify deployment configuration
├── vite.config.ts           # Vite build and plugin configuration
└── package.json             # Dependencies and scripts
```

---

## 🌐 Deployment

### Deploy to Netlify (Recommended)

The project ships with a pre-configured `netlify.toml`. Deployment is one command.

**Via Netlify UI:**
1. Push to GitHub
2. Go to [Netlify](https://netlify.com) → **Add new site** → **Import from GitHub**
3. Select your fork — Netlify auto-detects the build config:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
4. Add environment variables in **Site Settings → Environment Variables**
5. Click **Deploy** ✅

**Via Netlify CLI:**
```bash
npm install -g netlify-cli
netlify login
npm run build
netlify deploy --prod --dir=dist
```

---

## 🔮 Roadmap

### ✅ Phase 1 — Core Platform (Complete)
- [x] Agentic cart recovery with adaptive value-based strategy
- [x] Inventory dead stock detection and flash sale drafting
- [x] Low stock alerts with reorder request generation
- [x] VIP order recognition and personalized outreach
- [x] Return risk retention email automation
- [x] Multimodal AI chat with rich UI widgets
- [x] Recharts analytics dashboard with weekly revenue data
- [x] Netlify deployment with CI/CD

### 🔨 Phase 2 — Live Data (Next)
- [ ] **Supabase Integration**: Replace mock data with live PostgreSQL database
- [ ] **Real-time Subscriptions**: Use Supabase Realtime for live inventory updates
- [ ] **Email Service**: Connect **Resend** or **SendGrid** to actually send recovery emails
- [ ] **Auth**: User authentication for multi-merchant workspaces

### 📋 Phase 3 — Advanced Intelligence (Planned)
- [ ] **Voice Mode**: Speak to your store using the Web Speech API
- [ ] **Product Image Analysis**: Upload product photos for AI-powered listing suggestions
- [ ] **Demand Forecasting**: Predict stock needs based on sales velocity trends
- [ ] **Shopify / WooCommerce Connector**: Plug into real storefronts via API

### 🔭 Phase 4 — Multi-Agent Expansion (Vision)
- [ ] Independent pricing agent for dynamic price optimization
- [ ] Supplier management agent for automated vendor negotiations
- [ ] Marketing agent for ad copy generation and campaign briefing
- [ ] Cross-agent collaboration for end-to-end autonomous operations

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. **Fork** the repository
2. **Create** a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Commit** using [Conventional Commits](https://www.conventionalcommits.org/):
   ```bash
   git commit -m "feat: add shopify connector service"
   ```
4. **Push** and **open a Pull Request** against `main`

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](./LICENSE) for details.

---

<div align="center">

**Built to make autonomous commerce the default, not the exception.**

*If AutoAgent changed how you think about e-commerce operations, consider starring ⭐ the repo.*

[![GitHub Stars](https://img.shields.io/github/stars/Ismail-2001/E-commerce-Automation-Agent?style=social)](https://github.com/Ismail-2001/E-commerce-Automation-Agent)

Built with ❤️ by [Ismail Sajid](https://github.com/Ismail-2001)

</div>
