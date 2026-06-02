# Expense Tracker

Next.js 14, PostgreSQL, Prisma, shadcn/ui ve NextAuth ile gider takip uygulaması.

## Özellikler

- Gider, kategori ve abonelik CRUD
- Dashboard istatistikleri ve grafikler
- Dark/Light tema (next-themes)
- NextAuth Credentials ile giriş
- SMTP abonelik hatırlatmaları (nodemailer)
- Docker Compose ile tek komutla kurulum
- GitHub Actions CI/CD

## Hızlı Başlangıç (Docker)

```bash
cp .env.example .env
# .env dosyasında NEXTAUTH_SECRET ve SMTP ayarlarını düzenleyin
docker compose up --build
```

Uygulama: http://localhost:3000

Container başlarken otomatik olarak `prisma migrate deploy` ve `prisma db seed` çalışır.

## Varsayılan Admin

| Alan | Değer |
|------|-------|
| Kullanıcı adı | `admin` |
| Şifre | `admin123` |

> **Uyarı:** İlk girişten sonra varsayılan şifreyi değiştirmeniz önerilir. Kayıt (register) özelliği yoktur.

## Yerel Geliştirme

```bash
npm install
cp .env.example .env
# PostgreSQL çalışıyor olmalı
npx prisma migrate dev
npx prisma db seed
npm run dev
```

## Ortam Değişkenleri

`.env.example` dosyasına bakın. Gerekli değişkenler:

- `DATABASE_URL`
- `NEXTAUTH_URL`, `NEXTAUTH_SECRET`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
- `CRON_SECRET`

## Cron — Abonelik Hatırlatmaları

```bash
curl -X POST http://localhost:3000/api/cron/subscription-reminders \
  -H "Authorization: Bearer $CRON_SECRET"
```

Günlük tetikleme için sistem cron veya GitHub Actions scheduled workflow kullanılabilir.

## API

| Metod | Rota | Auth |
|-------|------|------|
| GET | `/api/health` | Hayır |
| GET | `/api/dashboard/stats` | Evet |
| CRUD | `/api/expenses` | Evet |
| CRUD | `/api/categories` | Evet |
| CRUD | `/api/subscriptions` | Evet |
| POST | `/api/cron/subscription-reminders` | Bearer CRON_SECRET |

## Teknoloji

- Next.js 14 App Router + TypeScript
- PostgreSQL 16 + Prisma
- NextAuth.js v4 (Credentials)
- shadcn/ui + Tailwind CSS
- Recharts, Zod, bcryptjs, nodemailer

## Lisans

MIT
