#!/bin/sh
set -e
echo "Running Prisma migrations..."
npx prisma migrate deploy
echo "Seeding database (idempotent)..."
npx prisma db seed || true
echo "Starting Next.js..."
exec node server.js
