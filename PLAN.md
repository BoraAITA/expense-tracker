# Expense Tracker — Uygulama Planı

Next.js 14 App Router, PostgreSQL, Prisma, shadcn/ui, Docker, NextAuth ve SMTP bildirimleri ile tam kapsamlı gider takip uygulaması.

---

## Teknoloji Yığını

| Katman | Teknoloji |
|--------|-----------|
| Framework | Next.js 14 (App Router) + TypeScript |
| Veritabanı | PostgreSQL 16 |
| ORM | Prisma |
| UI | shadcn/ui + Tailwind CSS |
| Auth | NextAuth.js v4 — Credentials provider |
| E-posta | nodemailer (SMTP) |
| Tema | next-themes (dark/light) |
| Konteyner | Docker + Docker Compose |
| CI/CD | GitHub Actions |

---

## 1. Dosya Yapısı

```
expense-tracker/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── public/
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                    # Dashboard özeti
│   │   │   ├── expenses/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/edit/page.tsx
│   │   │   ├── categories/
│   │   │   │   └── page.tsx
│   │   │   ├── subscriptions/
│   │   │   │   └── page.tsx
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts
│   │   │   ├── expenses/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   ├── categories/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   ├── subscriptions/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   ├── dashboard/
│   │   │   │   └── stats/route.ts
│   │   │   ├── cron/
│   │   │   │   └── subscription-reminders/route.ts
│   │   │   └── health/
│   │   │       └── route.ts
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   └── providers.tsx
│   ├── components/
│   │   ├── ui/                             # shadcn bileşenleri
│   │   ├── layout/
│   │   │   ├── app-sidebar.tsx
│   │   │   ├── header.tsx
│   │   │   ├── theme-toggle.tsx
│   │   │   └── user-menu.tsx
│   │   ├── auth/
│   │   │   └── login-form.tsx
│   │   ├── expenses/
│   │   │   ├── expense-table.tsx
│   │   │   ├── expense-form.tsx
│   │   │   └── expense-filters.tsx
│   │   ├── categories/
│   │   │   ├── category-list.tsx
│   │   │   └── category-form-dialog.tsx
│   │   ├── subscriptions/
│   │   │   ├── subscription-table.tsx
│   │   │   └── subscription-form.tsx
│   │   ├── dashboard/
│   │   │   ├── stats-cards.tsx
│   │   │   ├── monthly-chart.tsx
│   │   │   └── recent-expenses.tsx
│   │   └── shared/
│   │       ├── data-table.tsx
│   │       ├── confirm-dialog.tsx
│   │       ├── loading-spinner.tsx
│   │       └── empty-state.tsx
│   ├── lib/
│   │   ├── auth.ts                         # NextAuth config
│   │   ├── prisma.ts                       # Prisma singleton
│   │   ├── mail.ts                         # nodemailer wrapper
│   │   ├── validators/
│   │   │   ├── expense.ts
│   │   │   ├── category.ts
│   │   │   └── subscription.ts
│   │   └── utils.ts
│   ├── hooks/
│   │   ├── use-expenses.ts
│   │   └── use-toast.ts
│   ├── types/
│   │   ├── next-auth.d.ts
│   │   └── index.ts
│   └── middleware.ts
├── scripts/
│   └── docker-entrypoint.sh                # migrate + seed + start
├── .env.example
├── .dockerignore
├── .eslintrc.json
├── .gitignore
├── components.json                         # shadcn config
├── docker-compose.yml
├── Dockerfile
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
├── PLAN.md
└── README.md
```

---

## 2. Prisma Şeması

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  ADMIN
  USER
}

enum SubscriptionInterval {
  MONTHLY
  YEARLY
  WEEKLY
}

enum SubscriptionStatus {
  ACTIVE
  PAUSED
  CANCELLED
}

model User {
  id            String         @id @default(cuid())
  username      String         @unique
  passwordHash  String
  name          String?
  email         String?        @unique
  role          Role           @default(USER)
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  expenses      Expense[]
  subscriptions Subscription[]
  categories    Category[]
}

model Category {
  id        String    @id @default(cuid())
  name      String
  color     String    @default("#6366f1")
  icon      String?
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  expenses  Expense[]

  @@unique([userId, name])
  @@index([userId])
}

model Expense {
  id          String    @id @default(cuid())
  title       String
  amount      Decimal   @db.Decimal(12, 2)
  description String?
  date        DateTime  @default(now())
  userId      String
  categoryId  String?
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  category    Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([userId, date])
  @@index([categoryId])
}

model Subscription {
  id           String               @id @default(cuid())
  name         String
  amount       Decimal              @db.Decimal(12, 2)
  interval     SubscriptionInterval @default(MONTHLY)
  status       SubscriptionStatus   @default(ACTIVE)
  nextDueDate  DateTime
  reminderDays Int                  @default(3)
  userId       String
  user         User                 @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt    DateTime             @default(now())
  updatedAt    DateTime             @updatedAt

  @@index([userId, status])
  @@index([nextDueDate])
}
```

### Seed (`prisma/seed.ts`)

- Varsayılan admin: `username: admin`, `password: admin123` (bcrypt hash)
- Örnek kategoriler: Yemek, Ulaşım, Faturalar, Eğlence
- Kayıt (register) endpoint’i **yok**; sadece seed ile kullanıcı oluşturulur

---

## 3. API Rotaları

| Metod | Rota | Açıklama | Auth |
|-------|------|----------|------|
| `GET/POST` | `/api/auth/[...nextauth]` | NextAuth oturum / giriş | Kısmi |
| `GET` | `/api/health` | DB bağlantı kontrolü | Hayır |
| `GET` | `/api/dashboard/stats` | Özet istatistikler, grafik verisi | Evet |
| `GET` | `/api/expenses` | Liste (filtre: tarih, kategori, arama) | Evet |
| `POST` | `/api/expenses` | Yeni gider | Evet |
| `GET` | `/api/expenses/[id]` | Tek gider | Evet |
| `PATCH` | `/api/expenses/[id]` | Güncelle | Evet |
| `DELETE` | `/api/expenses/[id]` | Sil | Evet |
| `GET` | `/api/categories` | Kategori listesi | Evet |
| `POST` | `/api/categories` | Yeni kategori | Evet |
| `PATCH` | `/api/categories/[id]` | Güncelle | Evet |
| `DELETE` | `/api/categories/[id]` | Sil (ilişkili giderlerde categoryId null) | Evet |
| `GET` | `/api/subscriptions` | Abonelik listesi | Evet |
| `POST` | `/api/subscriptions` | Yeni abonelik | Evet |
| `PATCH` | `/api/subscriptions/[id]` | Güncelle | Evet |
| `DELETE` | `/api/subscriptions/[id]` | Sil | Evet |
| `POST` | `/api/cron/subscription-reminders` | Yaklaşan abonelik e-postaları | `CRON_SECRET` |

### Ortak API Kuralları

- Tüm korumalı rotalarda `getServerSession(authOptions)` kontrolü
- Kaynaklar `userId` ile scope edilir (başka kullanıcının verisine erişim 404)
- İstek gövdeleri Zod ile doğrulanır
- Hata formatı: `{ error: string, details?: ZodIssue[] }`

### Kayıt Yok

- `/api/auth/register` veya benzeri **oluşturulmayacak**
- Yeni kullanıcı yalnızca manuel seed veya doğrudan DB ile eklenebilir

---

## 4. Bileşen Ağacı

```
RootLayout
├── ThemeProvider (next-themes)
├── SessionProvider (next-auth)
└── Toaster

(auth)/login
└── LoginForm
    ├── Input (username)
    ├── Input (password)
    └── Button

(dashboard)/layout
├── AppSidebar
│   ├── NavLink → Dashboard
│   ├── NavLink → Expenses
│   ├── NavLink → Categories
│   ├── NavLink → Subscriptions
│   └── NavLink → Settings
├── Header
│   ├── ThemeToggle
│   └── UserMenu (logout)
└── {children}

Dashboard (page)
├── StatsCards (toplam, bu ay, abonelikler)
├── MonthlyChart (recharts)
└── RecentExpenses

Expenses (page)
├── ExpenseFilters
└── ExpenseTable
    └── Row actions → Edit / Delete (ConfirmDialog)

Expenses/new & [id]/edit
└── ExpenseForm
    ├── title, amount, date, category (Select), description

Categories (page)
├── CategoryList
└── CategoryFormDialog (create/edit)

Subscriptions (page)
├── SubscriptionTable
└── SubscriptionForm (Sheet/Dialog)

Settings (page)
├── SMTP test (opsiyonel admin bilgi)
└── Profil görüntüleme (salt okunur)
```

### shadcn/ui Bileşenleri (kurulacak)

`button`, `input`, `label`, `card`, `table`, `dialog`, `sheet`, `select`, `dropdown-menu`, `avatar`, `badge`, `separator`, `skeleton`, `toast`, `form`, `calendar`, `popover`, `tabs`, `sidebar` (veya custom sidebar)

---

## 5. Docker Kurulumu

### `Dockerfile`

```dockerfile
# Stage 1: deps
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Stage 2: build
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 3: runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY scripts/docker-entrypoint.sh ./docker-entrypoint.sh

RUN chmod +x docker-entrypoint.sh && chown -R nextjs:nodejs /app
USER nextjs
EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]
```

`next.config.js`: `output: 'standalone'` gerekli.

### `scripts/docker-entrypoint.sh`

```bash
#!/bin/sh
set -e
echo "Running Prisma migrations..."
npx prisma migrate deploy
echo "Seeding database (idempotent)..."
npx prisma db seed || true
echo "Starting Next.js..."
exec node server.js
```

### `docker-compose.yml`

```yaml
services:
  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-expense}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-expense_secret}
      POSTGRES_DB: ${POSTGRES_DB:-expense_tracker}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-expense}"]
      interval: 5s
      timeout: 5s
      retries: 5

  app:
    build: .
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER:-expense}:${POSTGRES_PASSWORD:-expense_secret}@postgres:5432/${POSTGRES_DB:-expense_tracker}
      NEXTAUTH_URL: ${NEXTAUTH_URL:-http://localhost:3000}
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      SMTP_HOST: ${SMTP_HOST}
      SMTP_PORT: ${SMTP_PORT:-587}
      SMTP_USER: ${SMTP_USER}
      SMTP_PASS: ${SMTP_PASS}
      SMTP_FROM: ${SMTP_FROM:-noreply@expense.local}
      CRON_SECRET: ${CRON_SECRET}
    depends_on:
      postgres:
        condition: service_healthy

volumes:
  postgres_data:
```

### Ortam Değişkenleri (`.env.example`)

```env
DATABASE_URL="postgresql://expense:expense_secret@localhost:5432/expense_tracker"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

POSTGRES_USER=expense
POSTGRES_PASSWORD=expense_secret
POSTGRES_DB=expense_tracker

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@example.com

CRON_SECRET=your-cron-secret
```

---

## 6. GitHub Actions CI/CD

### `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  lint-and-build:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: expense_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    env:
      DATABASE_URL: postgresql://test:test@localhost:5432/expense_test
      NEXTAUTH_SECRET: ci-test-secret
      NEXTAUTH_URL: http://localhost:3000

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: npm

      - run: npm ci
      - run: npx prisma generate
      - run: npx prisma migrate deploy
      - run: npm run lint
      - run: npm run build
```

### `.github/workflows/deploy.yml` (örnek)

```yaml
name: Deploy

on:
  push:
    branches: [main, master]

jobs:
  deploy:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/master'
    steps:
      - uses: actions/checkout@v4

      - name: Login to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ secrets.REGISTRY_URL }}
          username: ${{ secrets.REGISTRY_USER }}
          password: ${{ secrets.REGISTRY_PASSWORD }}

      - name: Build and push
        uses: docker/build-push-action@v6
        with:
          context: .
          push: true
          tags: ${{ secrets.REGISTRY_URL }}/expense-tracker:latest

      # Hedef sunucuya SSH veya cloud provider deploy adımı buraya eklenir
```

**CI adımları:** checkout → Node 20 → `npm ci` → `prisma generate` → `prisma migrate deploy` (test DB) → `lint` → `build`

**Deploy:** Docker image build/push; sunucuda `docker compose pull && docker compose up -d` (secrets ile).

---

## 7. Kimlik Doğrulama ve Tema

### NextAuth (Credentials)

```typescript
// src/lib/auth.ts — özet
CredentialsProvider({
  credentials: { username, password },
  authorize: async (creds) => {
    const user = await prisma.user.findUnique({ where: { username: creds.username } });
    if (!user || !await bcrypt.compare(creds.password, user.passwordHash)) return null;
    return { id: user.id, name: user.name, email: user.email, role: user.role };
  },
})
session: { strategy: "jwt" }
callbacks: { jwt, session } // role session'a aktarılır
pages: { signIn: "/login" }
```

### Middleware (`src/middleware.ts`)

- `/login` hariç `(dashboard)` rotaları korunur
- Oturum yoksa `/login?callbackUrl=...` yönlendirmesi

### Dark/Light Mode

- `next-themes` + `class` stratejisi (`dark` sınıfı `<html>` üzerinde)
- `ThemeToggle` header’da
- shadcn CSS değişkenleri `globals.css` içinde light/dark tanımlı

---

## 8. SMTP Bildirimleri

### `src/lib/mail.ts`

- nodemailer transporter (env’den SMTP ayarları)
- `sendSubscriptionReminder(email, subscription)` şablonu
- Hata durumunda log; uygulama çökmez

### Cron / Hatırlatıcı

- `POST /api/cron/subscription-reminders`
- Header: `Authorization: Bearer ${CRON_SECRET}`
- `nextDueDate` ≤ bugün + `reminderDays` ve `status: ACTIVE` olan abonelikler
- Kullanıcının `email` alanı doluysa mail gönder
- Üretimde harici cron (GitHub Actions scheduled, sistem cron) ile günlük tetikleme

---

## 9. Uygulama Fazları (Sıralı)

### Faz 0 — Proje İskeleti
1. `npx create-next-app@14` (App Router, TS, Tailwind, ESLint)
2. shadcn/ui init ve temel bileşenlerin eklenmesi
3. `next-themes`, `providers.tsx`, tema toggle
4. `.env.example`, `.gitignore`, klasör yapısının oluşturulması

### Faz 1 — Veritabanı
1. Prisma kurulumu, şema (User, Category, Expense, Subscription)
2. İlk migration
3. `seed.ts`: admin/admin123 (bcrypt), örnek kategoriler
4. `lib/prisma.ts` singleton

### Faz 2 — Kimlik Doğrulama
1. NextAuth Credentials provider (`lib/auth.ts`)
2. `[...nextauth]/route.ts`
3. `middleware.ts` — korumalı rotalar
4. Login sayfası ve `LoginForm`
5. Kayıt akışı **eklenmez**

### Faz 3 — API Katmanı
1. Zod şemaları (`lib/validators/*`)
2. Expenses CRUD API
3. Categories CRUD API
4. Subscriptions CRUD API
5. Dashboard stats API
6. Health endpoint

### Faz 4 — UI / Dashboard
1. Dashboard layout (sidebar, header)
2. Ana sayfa: stats, chart, recent expenses
3. Expenses listesi, filtreler, form (new/edit)
4. Categories yönetimi
5. Subscriptions yönetimi
6. Settings sayfası (minimal)

### Faz 5 — E-posta ve Cron
1. `lib/mail.ts` + nodemailer
2. Subscription reminder API
3. E-posta şablonu (HTML basit)
4. Dokümantasyon: cron kurulumu

### Faz 6 — Docker
1. `Dockerfile` (multi-stage, standalone)
2. `docker-entrypoint.sh` (migrate deploy + seed)
3. `docker-compose.yml` (app + postgres, healthcheck)
4. `next.config.js` → `output: 'standalone'`
5. Yerel test: `docker compose up --build`

### Faz 7 — CI/CD ve Dokümantasyon
1. `.github/workflows/ci.yml`
2. `.github/workflows/deploy.yml` (registry + deploy iskeleti)
3. `README.md`: kurulum, env, Docker, varsayılan admin uyarısı
4. Son kontrol: lint, build, manuel smoke test

---

## 10. Güvenlik Kontrol Listesi

- [ ] Şifreler bcrypt ile hash (min cost 10)
- [ ] `NEXTAUTH_SECRET` üretimde güçlü ve gizli
- [ ] API’lerde userId scope zorunlu
- [ ] Cron endpoint `CRON_SECRET` ile korunmalı
- [ ] Varsayılan admin şifresi README’de “ilk girişte değiştirin” uyarısı
- [ ] `.env` git’e eklenmemeli
- [ ] SQL injection: Prisma parametreli sorgular
- [ ] CSRF: NextAuth varsayılan koruması

---

## 11. Bağımlılıklar (özet)

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "@prisma/client": "^5.0.0",
    "next-auth": "^4.24.0",
    "bcryptjs": "^2.4.3",
    "nodemailer": "^6.9.0",
    "zod": "^3.23.0",
    "next-themes": "^0.3.0",
    "recharts": "^2.12.0",
    "date-fns": "^3.6.0",
    "class-variance-authority": "...",
    "clsx": "...",
    "tailwind-merge": "...",
    "lucide-react": "..."
  },
  "devDependencies": {
    "prisma": "^5.0.0",
    "typescript": "^5.0.0",
    "@types/node": "...",
    "@types/react": "...",
    "@types/bcryptjs": "...",
    "@types/nodemailer": "..."
  },
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

---

## 12. Başarı Kriterleri

| Kriter | Doğrulama |
|--------|-----------|
| Docker tek komutla ayağa kalkar | `docker compose up --build` → http://localhost:3000 |
| DB otomatik init | Container log’unda `migrate deploy` + seed |
| Admin girişi | `admin` / `admin123` ile login |
| Kayıt yok | Register route/UI yok |
| CRUD | Gider, kategori, abonelik tam işlev |
| Tema | Dark/light geçişi kalıcı (localStorage) |
| CI | Push/PR’da lint + build yeşil |
| SMTP | Cron çağrısında test maili (env doluysa) |

---

*Bu plan, uygulamanın sıfırdan üretim ortamına kadar tüm bileşenlerini kapsar. Geliştirme sırası Faz 0 → Faz 7 şeklinde izlenmelidir.*
