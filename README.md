# Pantagon Items

A fullstack web application for tracking items you buy and sell, calculating daily cost burn rates, and analyzing your spending patterns.

## 🌟 Features

- **Dashboard Analytics**: View total items, owned/sold counts, and daily burn rate
- **Visual Charts**: Bar charts by group, pie charts by category
- **Item Management**: Create, edit, delete, and view detailed item information
- **Advanced Filtering**: Filter by status, group, category, and search by name
- **Cost Calculations**: Automatic calculation of:
  - Days held
  - Real cost (buy price + extra costs)
  - Daily cost burn rate
  - Profit/loss for sold items
- **Dark Mode**: Auto-detect system preference with manual toggle
- **PWA Support**: Install on mobile devices for offline access
- **Responsive Design**: Mobile-first, works on all devices

## 🛠 Tech Stack

- **Frontend**: React + Vite + TypeScript
- **Styling**: TailwindCSS (with dark mode)
- **Database**: Supabase (PostgreSQL)
- **Charts**: Recharts
- **Routing**: React Router v7
- **Backend API**: Cloudflare Workers (optional proxy)
- **Deployment**: Cloudflare Pages
- **PWA**: Vite PWA Plugin + Workbox

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd pantagon-items
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

4. **Set up Supabase Database**
   
   The app expects a table named `pantagon_items` with the following schema:
   
   ```sql
   CREATE TABLE pantagon_items (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     name TEXT NOT NULL,
     category TEXT,
     group_name TEXT,
     buy_date DATE NOT NULL,
     buy_price DECIMAL NOT NULL,
     extra_cost DECIMAL DEFAULT 0,
     sell_date DATE,
     sell_price DECIMAL,
     status TEXT DEFAULT 'owned' CHECK (status IN ('owned', 'sold')),
     purchase_source TEXT,
     warranty_expire_date DATE,
     reason_to_sell TEXT,
     note TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   
   -- Auto-update updated_at trigger
   CREATE OR REPLACE FUNCTION update_updated_at_column()
   RETURNS TRIGGER AS $$
   BEGIN
     NEW.updated_at = NOW();
     RETURN NEW;
   END;
   $$ language 'plpgsql';
   
   CREATE TRIGGER update_pantagon_items_updated_at 
     BEFORE UPDATE ON pantagon_items 
     FOR EACH ROW 
     EXECUTE FUNCTION update_updated_at_column();
   ```

5. **Run development server**
   ```bash
   pnpm dev
   ```

   Visit `http://localhost:5173`

## 🚀 Deployment

### Frontend (Cloudflare Pages)

1. **Build the project**
   ```bash
   pnpm build
   ```

2. **Deploy to Cloudflare Pages**
   ```bash
   npx wrangler pages deploy dist
   ```

   Or connect your GitHub repository to Cloudflare Pages for automatic deployments.

3. **Set environment variables** in Cloudflare Pages dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### Backend API (Cloudflare Workers) - Optional

The app can work with direct Supabase calls, but you can also deploy the optional API proxy:

1. **Set secrets**
   ```bash
   cd worker
   npx wrangler secret put SUPABASE_URL
   npx wrangler secret put SUPABASE_ANON_KEY
   ```

2. **Deploy worker**
   ```bash
   npx wrangler deploy
   ```

3. **Update frontend** to use worker API by setting:
   ```
   VITE_API_URL=https://your-worker.workers.dev
   ```

## 📱 PWA Installation

The app is installable as a Progressive Web App:

1. Visit the deployed URL on your mobile device
2. Tap "Add to Home Screen" (iOS) or "Install" (Android)
3. Use the app offline with cached data

**Note**: Replace placeholder icons at `/public/icon-192.png` and `/public/icon-512.png` with your own branded icons.

## 🗂 Project Structure

```
pantagon-items/
├── public/
│   ├── manifest.json        # PWA manifest
│   ├── icon-192.png         # App icon (192x192)
│   └── icon-512.png         # App icon (512x512)
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── FilterChip.tsx
│   │   ├── Input.tsx
│   │   ├── Layout.tsx
│   │   ├── Navbar.tsx
│   │   └── Select.tsx
│   ├── pages/              # Route pages
│   │   ├── Dashboard.tsx
│   │   ├── ItemsList.tsx
│   │   ├── ItemDetails.tsx
│   │   ├── AddItem.tsx
│   │   └── EditItem.tsx
│   ├── lib/                # Third-party configs
│   │   └── supabase.ts
│   ├── types/              # TypeScript types
│   │   └── database.types.ts
│   ├── utils/              # Utility functions
│   │   ├── calculations.ts
│   │   └── helpers.ts
│   ├── App.tsx             # Main app with routes
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles (Tailwind)
├── worker/                 # Cloudflare Worker API
│   └── index.ts
├── wrangler.toml           # Worker config
├── vite.config.ts          # Vite + PWA config
├── tailwind.config.js      # Tailwind config
└── package.json
```

## 🧮 Cost Calculation Logic

### Days Held
- **If not sold**: `today - buy_date`
- **If sold**: `sell_date - buy_date`

### Real Cost
```
real_cost = buy_price + extra_cost
```

### Daily Cost Burn Rate
- **For owned items**: `real_cost / days_held`
- **For sold items**: `real_cost / days_held` (average daily cost)

### Profit/Loss
```
profit = sell_price - buy_price
```

### Dashboard Daily Burn Rate
Sum of all items' daily cost: `Σ(real_cost / days_held)`

## 📄 License

MIT

## 👤 Author

Built with ❤️ for tracking your stuff

---

**Note**: Make sure to set up Row Level Security (RLS) policies in Supabase for production use.

# pantagon-superapp
