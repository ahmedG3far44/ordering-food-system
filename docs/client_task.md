# Frontend Implementation Plan: Food Ordering System

## 🛠 Technical Foundation
- **Core**: React 19, TypeScript, Tailwind CSS v4, `react-router-dom`.
- **State**: Zustand for Auth (JWT/Role) and Cart (single-restaurant constraint).
- **API**: Axios with interceptors for JWT injection and 401 unauthorized redirection.
- **Data**: TanStack Query for caching and optimistic updates.

## 📅 Implementation Phases

### Phase 1: Infrastructure & Types
- [ ] Project initialization and Tailwind 4 configuration.
- [ ] Definition of strict TS interfaces mirroring the Prisma schema.
- [ ] Setup of the API client (Axios instance) and global state stores (Zustand).

### Phase 2: Identity & Access (RBAC)
- [ ] Implement `/login` and `/register` pages with role-toggle.
- [ ] Create `ProtectedRoute` and `RoleGuard` components for access control.
- [ ] Implement Auth state persistence and JWT handling.

### Phase 3: Customer Journey (The Marketplace)
- [ ] **Home (`/`)**: Restaurant listing grid with editorial design.
- [ ] **Restaurant (`/restaurant/:id`)**: Menu display and item selection.
- [ ] **Cart System**: Logic for single-restaurant constraint and local state management.
- [ ] **Checkout (`/checkout`)**: Order review and "Place Order" integration.
- [ ] **Order History (`/orders`)**: User dashboard for tracking orders.

### Phase 4: Owner's Command Center
- [ ] **Dashboard (`/owner/dashboard`)**: Order management board with status updates.
- [ ] **Menu Management (`/owner/menu`)**: Interface to manage `MenuItems`.
- [ ] **Order Details (`/owner/orders/:id`)**: Detailed view for owner order processing.

### Phase 5: Polish & Mocking
- [ ] **Mock API**: Integration of mock data for testing logic.
- [ ] **Responsiveness**: Mobile-first optimization across all screens.
- [ ] **UX/UI**: Skeleton loaders, toast notifications, and page transitions.

## 🚩 Milestones
- **M1**: Infrastructure & Auth Flow complete.
- **M2**: Marketplace & Cart logic functional.
- **M3**: Transaction & Order History complete.
- **M4**: Owner Suite operational.
- **M5**: Final Design Audit & Responsive Polish.
