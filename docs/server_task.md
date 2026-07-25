# Food Ordering System Implementation Plan

## Phase 1: Foundation & Infrastructure
- [x] **Milestone 1: Project Bootstrap**
    - Initialize TypeScript, Express, and project structure.
    - Configure Prisma with PostgreSQL connection.
- [x] **Milestone 2: Data Modeling**
    - Implement `schema.prisma` with all 5 core entities.
    - Run initial migrations and seed basic data.
- [x] **Milestone 3: Global Middleware**
    - Implement centralized error handler.
    - Setup basic request logging.

## Phase 2: Authentication & Identity
- [x] **Milestone 1: User Management**
    - Implement `POST /api/auth/register` and `POST /api/auth/login`.
    - Integrate password hashing (bcrypt) and JWT generation.
- [x] **Milestone 2: Security Layer**
    - Create `authMiddleware` to verify JWTs and attach user context to `req`.
    - Implement Role-Based Access Control (RBAC) middleware for `CUSTOMER` vs `RESTAURANT_OWNER`.

## Phase 3: Restaurant & Menu Services
- [x] **Milestone 1: Restaurant Discovery**
    - Implement `GET /api/restaurants` and `GET /api/restaurants/:id/menu`.
- [x] **Milestone 2: Menu Management**
    - Implement `POST /api/restaurants/:id/menu` (Owner only).
    - Add input validation using Zod for menu item payloads.

## Phase 4: Order Lifecycle (Core Engine)
- [x] **Milestone 1: Order Creation**
    - Implement `POST /api/orders` using `prisma.$transaction` to ensure atomicity.
    - Implement server-side price calculation logic.
- [x] **Milestone 2: Order Tracking**
    - Implement `GET /api/orders` with role-based filtering.
    - Implement `GET /api/orders/:id` for detailed views.
- [x] **Milestone 3: Status Management**
    - Implement `PATCH /api/orders/:id/status` (Owner only).

## Phase 5: Quality Assurance & Hardening
- [x] **Milestone 1: Validation Audit**
    - Ensure all endpoints have strict Zod schema validation.
- [x] **Milestone 2: Testing & Optimization**
    - Conduct integration tests for the full order flow.
    - Run final linting and type-checking.
