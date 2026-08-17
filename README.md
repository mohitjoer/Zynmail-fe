# ⚡ Zynmail Frontend (`Zynmail-fe`)

The modern web application for **Zynmail**, built with Next.js 16 App Router, React 19, Tailwind CSS, shadcn/ui, and Better Auth.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **UI & Runtime**: [React 19](https://react.dev/), [Bun](https://bun.sh/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/)
- **Icons & Motion**: [Lucide React](https://lucide.dev/), [Framer Motion](https://www.framer.com/motion/)
- **Authentication**: [Better Auth](https://better-auth.com/) with MongoDB Adapter
- **State Management**: React Context (`EmailContext`, `ThemeContext`), [Zustand](https://zustand.docs.pmnd.rs/)

---

## 📁 Directory Structure

```text
Zynmail-fe/
├── src/
│   ├── app/                      # App Router routes
│   │   ├── (auth)/               # Signin & Signup split-screen views
│   │   ├── api/auth/[...all]/    # Better Auth route handlers
│   │   ├── home/                 # Main inbox & email detail view
│   │   ├── automations/          # AI workflow canvas & visual node blocks
│   │   ├── settings/             # User profile, security & Gmail preferences
│   │   ├── layout.tsx            # Root layout with dark mode default
│   │   └── globals.css           # Design tokens, variables & utilities
│   │
│   ├── components/
│   │   ├── ui/                   # shadcn/ui primitives (card, button, input, dialog, etc.)
│   │   ├── email/                # EmailList, EmailRow, EmailDetail, ComposeModal
│   │   ├── layout/               # Header, Sidebar, RightSidebar (Ask Zyn AI panel)
│   │   ├── auth/                 # AuthHeroVisual (gradient & typography visual)
│   │   └── automations/          # Workflow canvas & node connectors
│   │
│   ├── context/
│   │   ├── EmailContext.tsx      # Email synchronization, folders, & active state
│   │   └── ThemeContext.tsx      # Dark / Light theme provider (defaults to Dark)
│   │
│   ├── lib/
│   │   ├── auth.ts               # Better Auth server configuration with MongoDB adapter
│   │   ├── auth-client.ts        # Better Auth React client hooks (signIn, signUp, useSession)
│   │   ├── mongodb.ts            # Cached MongoDB MongoClient instance
│   │   └── api.ts                # Typed client for FastAPI backend endpoints
│   │
│   └── types/                    # TypeScript interfaces for Email, User, Folders
│
├── .env.example                  # Environment variables template
├── next.config.ts                # API rewrite proxy to FastAPI backend (port 8000)
└── package.json
```

---

## 🚀 Getting Started

### 1. Install Dependencies

Using [Bun](https://bun.sh/):

```bash
bun install
```

### 2. Environment Configuration

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in the required values:

```env
BETTER_AUTH_SECRET="your_random_32_char_secret_key"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

MONGODB_URI="mongodb+srv://<user>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority"
MONGODB_DB_NAME="zynmail"

GOOGLE_CLIENT_ID="your_google_client_id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
```

### 3. Run Development Server

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Available Scripts

| Script | Command | Description |
|---|---|---|
| **Dev** | `bun run dev` | Starts the Next.js development server with Turbopack |
| **Build** | `bun run build` | Builds the production bundle and optimizes routes |
| **Start** | `bun run start` | Runs the compiled production build |
| **Type Check** | `bun x tsc --noEmit` | Runs the TypeScript compiler in dry-run mode |
| **Lint** | `bun run lint` | Runs ESLint checks |

---

## 🔌 API & Backend Proxying

In `next.config.ts`, non-auth API calls (`/api/emails/*`, `/api/user/*`, etc.) are automatically proxied to the FastAPI backend running at `http://127.0.0.1:8000`:

- Better Auth endpoints (`/api/auth/*`) are handled directly by Next.js.
- Backend API endpoints are forwarded transparently to FastAPI.
