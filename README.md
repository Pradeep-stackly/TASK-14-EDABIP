# EDABIP - Organization, Workspace & User Management Platform

A standalone full-stack module built using **React.js, Node.js, Express.js, MySQL, and JWT Authentication**, inspired by the Enterprise Data Analytics & Business Intelligence Platform (EDABIP) requirements.

This project lets organizations sign up, create workspaces, add users to those workspaces, and assign each user a role scoped to that workspace — the foundation layer for a multi-tenant analytics platform.

---

## Project Overview

EDABIP is a secure, multi-tenant module where:

- Any user can sign up and create an organization (they become that organization's admin)
- An Organization Admin creates workspaces under their organization
- An Organization Admin adds users to a workspace and assigns them a role
- Access is scoped by role, both at the platform level and at the workspace level

The project includes:

- React.js frontend
- Node.js and Express.js backend
- MySQL database
- JWT-based authentication
- Role-Based Access Control
- Protected API routes
- Responsive dashboard UI

This is a **completely standalone project** — its own repository, own database, own server, own client, own login. It does not depend on, share a database with, or call into any other project.

---

## Tech Stack

### Frontend

- React.js
- JavaScript
- Bootstrap
- Axios
- Recharts
- HTML5
- CSS3
- Vite

### Backend

- Node.js
- Express.js
- JWT Authentication
- MySQL2

### Tools

- Postman
- Git & GitHub

---

## Roles

- **Platform Admin** — full access across every organization (`is_platform_admin` flag on `users`; seeded account: `admin@edabip.com`)
- **Organization Admin** — whoever created an organization (`organizations.created_by`); can create/edit/delete that organization's workspaces and manage its members
- **Analyst** — workspace-level role, assigned per member in `workspace_users`
- **Viewer** — workspace-level role, read-only

---

## Database Schema

**`users`**

| Column            | Type                    | Notes                     |
| ----------------- | ------------------------ | -------------------------- |
| id                | INT, PK, auto-increment  |                            |
| full_name         | VARCHAR(100)             | required                   |
| email             | VARCHAR(100)             | required, **unique**        |
| password          | VARCHAR(255)             | bcrypt hashed               |
| is_platform_admin | BOOLEAN                  | default `FALSE`             |
| created_at        | TIMESTAMP                | default current timestamp   |

**`organizations`**

| Column            | Type                       | Notes                        |
| ----------------- | -------------------------- | ----------------------------- |
| id                | INT, PK, auto-increment    |                               |
| organization_name | VARCHAR(150)               | required, **unique**           |
| industry          | VARCHAR(100)               | required                      |
| company_size      | VARCHAR(50)                | required                      |
| email             | VARCHAR(100)                | required, validated           |
| contact_number    | VARCHAR(20)                 | required, validated           |
| status            | ENUM('Active','Inactive')   | default `Active`               |
| created_by        | INT, FK → users(id)         | the organization's admin       |
| created_at        | TIMESTAMP                   | default current timestamp      |

**`workspaces`**

| Column          | Type                       | Notes                                  |
| --------------- | -------------------------- | --------------------------------------- |
| id              | INT, PK, auto-increment    |                                         |
| organization_id | INT, FK → organizations(id) | cascade delete                          |
| workspace_name  | VARCHAR(150)                | required                                |
| description     | TEXT                         | optional                                |
| status          | ENUM('Active','Inactive')    | default `Active`                         |
| created_at      | TIMESTAMP                    | default current timestamp                |
|                 |                              | unique on (`organization_id`, `workspace_name`) |

**`workspace_users`**

| Column       | Type                              | Notes                              |
| ------------ | ---------------------------------- | ----------------------------------- |
| id           | INT, PK, auto-increment            |                                     |
| workspace_id | INT, FK → workspaces(id)            | cascade delete                      |
| user_id      | INT, FK → users(id)                 | cascade delete                      |
| role         | ENUM('Admin','Analyst','Viewer')    | default `Viewer`                     |
| joined_date  | DATE                                 | default current date                 |
|              |                                     | unique on (`workspace_id`, `user_id`) |

---

## API Documentation

All endpoints below (except auth) require `Authorization: Bearer <token>`,
using the token returned by `/auth/login`.

| Method | Endpoint                | Access                              | Description                                                       |
| ------ | ------------------------- | ------------------------------------ | -------------------------------------------------------------------- |
| POST   | `/auth/register`          | Public                               | Create an account                                                    |
| POST   | `/auth/login`             | Public                               | Log in and receive a JWT                                             |
| GET    | `/dashboard`               | Any logged-in user                   | Summary cards + chart data                                           |
| POST   | `/organizations`           | Any logged-in user                   | Create an organization (creator becomes its admin)                    |
| GET    | `/organizations`           | Platform Admin (all), others (own)   | List organizations; filter by `status`, `search`                      |
| GET    | `/organizations/:id`       | Any logged-in user                   | Get a single organization                                             |
| PUT    | `/organizations/:id`       | Organization Admin, Platform Admin    | Update an organization                                                 |
| DELETE | `/organizations/:id`       | Organization Admin, Platform Admin    | Delete an organization (cascades to its workspaces)                     |
| POST   | `/workspaces`              | Organization Admin, Platform Admin    | Create a workspace under an organization                                |
| GET    | `/workspaces`              | Platform Admin (all), others (own)   | List workspaces; filter by `organization_id`, `status`, `search`         |
| GET    | `/workspaces/:id`          | Any logged-in user                   | Get a single workspace                                                  |
| PUT    | `/workspaces/:id`          | Organization Admin, Platform Admin    | Update a workspace                                                       |
| DELETE | `/workspaces/:id`          | Organization Admin, Platform Admin    | Delete a workspace (cascades to its memberships)                          |
| POST   | `/workspaces/users`        | Organization Admin, Platform Admin    | Add a user to a workspace with a role                                     |
| PUT    | `/workspaces/users/:id`    | Organization Admin, Platform Admin    | Change a member's role                                                     |
| DELETE | `/workspaces/users/:id`    | Organization Admin, Platform Admin    | Remove a member from a workspace                                            |
| GET    | `/workspaces/:id/users`    | Any logged-in user                   | List a workspace's members                                                  |

---

## Business Rules Enforced

- Organization names must be unique across the platform.
- Workspace names only need to be unique **within their own organization**
  (the same name is fine in two different organizations).
- A user cannot be added to the same workspace twice (unique constraint on
  `workspace_id` + `user_id`).
- Only the Organization Admin (the organization's creator) or the Platform
  Admin can create, update, or delete that organization's workspaces, and
  can add/change/remove workspace members.
- Email and contact number are validated with simple format checks on both
  create and update, with friendly error messages returned to the client.

---

## Frontend Components

- `OrganizationForm.jsx` — create/edit an organization
- `OrganizationTable.jsx` — searchable/filterable organizations list with
  Workspaces/Edit/Delete actions
- `WorkspaceForm.jsx` — create/edit a workspace under an organization
- `WorkspaceTable.jsx` — searchable/filterable workspaces list with
  Members/Edit/Delete actions
- `WorkspaceUsers.jsx` — add a member to a workspace and view its member list
- `RoleManagement.jsx` — per-member role dropdown + remove button, used
  inside `WorkspaceUsers.jsx`
- `OrganizationDashboard.jsx` — KPI cards (Total Organizations/Active
  Organizations/Total Workspaces/Active Users/Total Workspace Members) plus
  Organizations by Industry, Users by Role, and Workspaces Created per Month
  charts (uses a generic `RatingChart` component built on Recharts)

---

## Organization → Workspace Workflow

```text
User Signs Up / Logs In
     ↓
User Creates an Organization (becomes that org's Admin)
     ↓
Organization Admin Creates Workspaces
     ↓
Organization Admin Adds Users to a Workspace with a Role
     ↓
Analysts/Viewers Work Within Their Assigned Workspaces
     ↓
Dashboard & Charts Updated
```

---

## Folder Structure

```txt
EDABIP/
│
├── client/
│   ├── public/
│   │   └── favicon.svg
│   │
│   └── src/
│       ├── components/
│       │   ├── OrganizationForm.jsx
│       │   ├── OrganizationTable.jsx
│       │   ├── WorkspaceForm.jsx
│       │   ├── WorkspaceTable.jsx
│       │   ├── WorkspaceUsers.jsx
│       │   ├── RoleManagement.jsx
│       │   ├── OrganizationDashboard.jsx
│       │   └── RatingChart.jsx
│       │
│       ├── context/
│       │   └── AuthContext.jsx
│       │
│       ├── pages/
│       │   ├── Dashboard.jsx
│       │   └── Login.jsx
│       │
│       ├── services/
│       │   └── api.js
│       │
│       ├── App.jsx
│       ├── App.css
│       ├── main.jsx
│       └── index.css
│
├── server/
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── organizationController.js
│   │   └── workspaceController.js
│   │
│   ├── middleware/
│   │   └── authMiddleware.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── organizationRoutes.js
│   │   └── workspaceRoutes.js
│   │
│   ├── services/
│   │   └── workspaceService.js
│   │
│   ├── database.sql
│   ├── server.js
│   └── .env
│
├── Postman/
│   └── EDABIP.postman_collection.json
│
└── README.md
```

---

## Setup Instructions

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd EDABIP
   ```

2. **Set up the database**

   ```bash
   cd server
   mysql -u root -p < database.sql
   ```

   `database.sql` creates the `edabip_db` database itself (no need to create
   it first), sets up every table (`users`, `organizations`, `workspaces`,
   `workspace_users`), and seeds demo data. It's safe to re-run the whole file.

3. **Configure environment variables**

   A `.env` file is already included in `server/` with default local values
   (`PORT=5002`, MySQL credentials, `JWT_SECRET`). Update the database
   credentials to match your local MySQL setup.

4. **Install dependencies and start the backend**

   ```bash
   cd server
   npm install
   npm run dev
   ```

   The API runs on `http://localhost:5002`.

5. **Install dependencies and start the frontend**

   ```bash
   cd client
   npm install
   npm run dev
   ```

6. **Log in**

   Use one of the seeded accounts (password for all of them is `Passw0rd!`):

   | Email                     | Role                          |
   | -------------------------- | ------------------------------ |
   | admin@edabip.com           | Platform Admin                 |
   | karthik@brightsoft.com     | Organization Admin (BrightSoft) |
   | divya@nexawave.com         | Organization Admin (NexaWave)   |
   | arjun@brightsoft.com       | Regular user (Analyst on one workspace) |

   Or click "New organization? Create an account" on the login screen to
   sign up and create your own organization.
