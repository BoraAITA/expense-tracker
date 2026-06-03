#!/bin/sh
set -e
echo "Running Prisma migrations..."
npx prisma migrate deploy
echo "Seeding database..."
node scripts/seed-runner.mjs || echo "Seed failed (non-fatal)"
echo "Starting Next.js..."
exec node server.js
