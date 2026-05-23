# Inventory Reservation System

A full-stack inventory reservation system built using:

- Next.js
- TypeScript
- Prisma ORM
- PostgreSQL
- Supabase

## Features

- Product listing
- Warehouse inventory management
- Reserve stock
- Confirm reservations
- Cancel reservations
- Automatic stock updates
- Reservation countdown timer
- REST APIs
- Dynamic routing

## Tech Stack

- Next.js App Router
- Prisma
- Supabase PostgreSQL
- Tailwind CSS
- Axios

## Setup

```bash
npm install
npm run dev
```

## Database

Prisma ORM connected with Supabase PostgreSQL.

## APIs

- GET /api/products
- GET /api/warehouses
- POST /api/reservations
- GET /api/reservations/:id
- POST /api/reservations/:id/confirm
- POST /api/reservations/:id/release