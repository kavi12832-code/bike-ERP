# AKASH Bajaj — Django Backend

Multi-tenant REST API for the AKASH Bajaj React app: Django 6 + DRF, PostgreSQL, JWT auth,
Swagger/OpenAPI docs, request and audit logging. **All app data lives here**: the frontend has no
built-in data and loads everything from this API after login.

## Quick start (Windows / PowerShell)

```powershell
cd backend
python -m venv .venv
.venv\Scripts\pip install -r requirements.txt
copy .env.example .env          # then set DB_PASSWORD, DB_PORT and DJANGO_SECRET_KEY

# create the database once (PostgreSQL 18 on port 5433 shown)
& "C:\Program Files\PostgreSQL\18\bin\createdb.exe" -U postgres -p 5433 bike_erp

.venv\Scripts\python manage.py migrate
.venv\Scripts\python manage.py seed_demo                  # new tenant "bike-erp" with demo data
.venv\Scripts\python manage.py runserver 8030
```

Then, in `frontend/.env.local`, set `VITE_API_BASE_URL=http://localhost:8030/api/v1` and run `npm run dev` there.
The frontend requires the backend; without it, it shows a "Backend not configured" screen.

Demo accounts: every directory email (e.g. `rajesh.varma@akashbajaj.com`) with password `password123`
(development only). Users whose role requires 2FA get the code step: with `DJANGO_DEBUG=true` the demo code
`123456` works; with DEBUG off they must use an authenticator app (enrolled at first login).

| URL | What |
|---|---|
| http://localhost:8030/api/docs/ | Swagger UI (click **Authorize**, paste the `access` token) |
| http://localhost:8030/api/redoc/ | ReDoc |
| http://localhost:8030/admin/ | Django admin |

### Updating an existing database

After pulling new code: `migrate`, then `seed_demo --add-missing`. It only **adds** demo records, collections and
staff accounts that don't exist yet. Your own records stay, and existing accounts keep their passwords.
(`seed_demo --reset` deletes the tenant and starts over.)

## Security

| Area | What is enforced |
|---|---|
| Tokens | Access token (15 min) is kept in browser memory only. The refresh token (7 days) is an **httpOnly, SameSite=Lax cookie** (`Secure` when DEBUG is off), rotated on every use, with old ones blacklisted. Logout blacklists it. |
| CSRF | Cookie endpoints (`/auth/refresh/`, `/auth/logout/`) require the `X-Requested-With: XMLHttpRequest` header. CORS allows only `CORS_ALLOWED_ORIGINS`. |
| Login | Per-IP rate limit (10/min) plus **account lockout** after 5 wrong passwords (15 min, HTTP 423). Generic "invalid email or password" message. |
| 2FA | Authenticator-app TOTP (RFC 6238) via `/auth/2fa/setup/` + `/auth/2fa/confirm/`. The fixed demo code is accepted only when `DEMO_OTP_ENABLED` (defaults to DEBUG). |
| Passwords | scrypt hashing; validators for length ≥ 10, common passwords, numeric-only and similarity to user details. |
| Locking | An admin lock or deactivation in Admin > Users also ends that user's open sessions. Admins cannot lock or demote themselves. |
| Authorization | Every request is tenant-scoped from the JWT. Writes are role-checked per endpoint and per collection module (see below). |
| Headers | With DEBUG off: HTTPS redirect, HSTS, secure cookies, `nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: same-origin`. |
| Seeding | `seed_demo` refuses the default demo password when DEBUG is off (set `DEMO_USER_PASSWORD`). |

## How the frontend stores data

- **Tables:** customers, leads, quotations, bookings, sales orders, vehicles, parts, job cards, appointments, bays,
  invoices, notifications, branches, and users (the staff directory = real login accounts).
- **Collections API:** `/api/v1/collections/<module>.<name>/`. Everything else (approvals, HR, accounting,
  settings, catalogues, and the records each page used to hardcode) is stored as tenant-scoped JSON records. Access
  depends on the module prefix:

  | Module | Read | Write |
  |---|---|---|
  | `admin.*` | Super Admin | Super Admin |
  | `hr.*` | Super Admin, Accountant | Super Admin, Accountant |
  | `accounting.*`, `gst.*` | everyone | Accountant |
  | `config.*`, `catalog.*` | everyone | Super Admin (catalog: + Inventory Manager) |
  | `approvals.requests` | everyone | everyone; **server sets the requester and decider from the JWT and blocks self-approval** |
  | others | everyone | everyone in the tenant |

  Records are limited to 64 KB, collections to 5,000 records, and every write is in the audit log.
- The frontend's sync engine (`frontend/src/store/sync.js`) sends only the changes. If the server rejects one, the
  user sees why and the screen reloads server data.

## Business rules enforced server-side

- **Invoices.** Numbers are gap-free per tenant (`VI/2627/00001`). Posted invoices are immutable except payment
  fields. `DELETE` returns 405; cancel with a credit note.
- **Approvals.** Dual control, as above.
- **Bays.** An occupied bay cannot be overwritten. Moving a job card frees its previous bay.
- **Chassis.** Double allocation is blocked on both the allocate endpoint and a plain update.
- **Job cards and appointments.** Required fields, phone and registration formats, delivery after check-in, slot
  capacity, no Sundays, no past slots.

## Pagination, sorting and indexes

- Every list endpoint is paginated: `?page=2&pageSize=25` (default 50, max 500). Responses include `count`,
  `page`, `pageSize`, `totalPages`, `next`, `previous` and `results`. Collections paginate when `page` or
  `pageSize` is given; without them they return the full list, which the app's startup load uses.
- Sort with `?ordering=` (e.g. `-booking_date`, `customer_name`), filter with the listed fields (e.g. `?status=`), and
  search with `?search=`. The primary key is always the final tie-breaker, so pages never repeat or skip rows.
- Composite indexes start with `tenant` and cover each screen's filters and sorts, for example:
  - bookings by status and date;
  - job cards by stage, registration or appointment;
  - appointments by day and slot;
  - invoices by date, status or type;
  - vehicles by status and branch.

  See `apps/erp/migrations/0004_query_indexes.py`.

## Deleting records

| Record | On delete |
|---|---|
| Booking | Releases any allocated chassis. Delivered bookings cannot be deleted (cancel instead). |
| Job card | Frees its bay and reopens the appointment it came from. Completed, billed cards cannot be deleted. |
| Appointment | Allowed until it becomes a job card. After that, edit or delete the job card instead. |

## Logs

| Where | What |
|---|---|
| `logs/app.log` | App, auth, audit and error events (rotating, 5 × 5 MB) |
| `logs/requests.log` | One line per API call: method, path, status, latency, user, tenant |
| `GET /api/v1/request-logs/` | Same data, queryable. Shown on the dashboard |
| `GET /api/v1/audit-logs/` | Business audit trail with before/after values. Read-only |

Prune old request logs with `python manage.py prune_logs --days 30`. Audit logs are never pruned.

## Demo data

`backend/fixtures/demo_seed.json` is produced by `npm run export:seed` (in `frontend`) from the demo seed and the
page fixtures (`frontend/src/data/fixtures/pageCollections.js`). The running app never imports those files.
`seed_demo` shifts all dates so the export day becomes today.

## Tests

```powershell
$env:DB_ENGINE="sqlite"; .venv\Scripts\python manage.py test tests
```

The suite covers:
- auth: JWT, cookie refresh, rotation, logout, lockout, TOTP, the production 2FA rules, weak passwords and
  directory locks;
- data: tenant isolation, the collections API (roles, size limits), invoice and chassis rules, dual control,
  job cards and appointments;
- operations: seeding without data loss, the dashboard, logging, and Swagger.
