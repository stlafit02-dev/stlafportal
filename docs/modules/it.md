# IT department module

Technical reference for the IT department's area of the internal staff portal
(`STLAF.Client` + `stlaf.api`). Covers what exists, how access is gated, and where the code
lives — not a how-to-use-it guide.

The IT department has three gated sub-modules — **Ticketing**, **Asset Management**, and
**Gmail Management** — plus two public-facing pages that don't require login.

## Access control

Two layers — but note they aren't both enforced in both places:

1. **Department gate** — the `/it` route tree is wrapped in `DepartmentGuard department="IT"`
   (`STLAF.Client/src/common/components/DepartmentGuard.tsx`), which redirects away unless
   `user.role === "SuperAdmin"` or `user.department === "IT"`. **This is frontend-only** for
   these three controllers — `TicketingController`, `AssetManagementController`, and
   `GmailManagementController` do not apply any department-level `[Authorize]` policy
   themselves, only the module policies below. A direct API call from a non-IT account with
   the right module grant would succeed; only browser navigation to `/it/*` is department-gated.
2. **Module gate** — each sub-module requires its own module key: `it-ticketing`,
   `it-assets`, or `it-gmail`. This one *is* enforced on the backend: `[Authorize(Policy =
   "it-ticketing")]` etc. on the controller/actions (`ModuleRequirement` +
   `ModuleAuthorizationHandler`), mirrored on the frontend by `<ModuleGuard module="...">`
   wrapping the route element (UX only — hides nav/shows a message, doesn't secure anything).

A user passes a module gate if either:
- their role is `SuperAdmin` or `DeptAdmin` (bypasses all module checks — note the
  department gate above only bypasses for `SuperAdmin`, not `DeptAdmin`), **or**
- their `officePosition` claim has a matching row in the `ModuleAccessPositions` table
  (`module`, `officePosition`) — checked by `ModuleAuthorizationHandler.HandleRequirementAsync`
  (`stlaf.api/Identity/Policies/ModuleAuthorizationHandler.cs`).

**There is currently no admin UI to create/edit `ModuleAccessPositions` rows** —
`ModuleAccessController` (`stlaf.api/Identity/Controllers/ModuleAccessController.cs`) only
exposes a `GET /api/module-access` used by the frontend to build nav/route visibility. Grants
are managed directly in the database. The frontend's `ModuleGuard`
(`STLAF.Client/src/common/components/ModuleGuard.tsx`) re-implements the same
bypass/officePosition check purely for UX (hiding nav items, showing a "no access" message)
— it is **not** the real enforcement; the backend policy is.

Several endpoints are intentionally public (`[AllowAnonymous]`) with no gate at all —
backing the two public pages listed below. See Ticketing and Asset Management for which.

## Frontend routes

Defined in `STLAF.Client/src/App.tsx`.

| Path | Guard | Component |
|---|---|---|
| `/it-helpdesk` | none (public) | `ITHelpdeskPage` |
| `/assets/:assetTag` | none (public) | `AssetPublicPage` |
| `/it` | Department `IT` | `ItDashboard` → `ItOverviewPage` (index) |
| `/it/ticketing` | Module `it-ticketing` | `TicketingPage` |
| `/it/assets` | Module `it-assets` | `AssetManagementPage` |
| `/it/gmail` | — | redirects to `/it/gmail/accounts` |
| `/it/gmail/accounts` | Module `it-gmail` | `GwsAccountPage` |
| `/it/gmail/emails` | Module `it-gmail` | `EmailAccountPage` |
| `/it/gmail/app-passwords` | Module `it-gmail` | `AppPasswordPage` |
| `/it/leave/*` | Department `IT` | shared `LeaveRoutes` (not IT-specific, see leave module) |

Nav entries for IT are built in `STLAF.Client/src/common/navConfig.ts` →
`deptModuleNav("IT")`.

## Backend layout

```
stlaf.api/Departments/IT/
  Controllers/   AssetManagementController.cs, GmailManagementController.cs, TicketingController.cs
  Services/      AssetService.cs, GmailService.cs, TicketingService.cs (+ I*Service interfaces)
  Entities/      Asset.cs, AssetHistory.cs, Ticket.cs, GwsAccount.cs, EmailAccount.cs, AppPassword.cs
  DTOs/          AssetDto.cs, TicketDto.cs, GmailDto.cs
  BackgroundJobs/ AppPasswordCleanupService.cs
```

All controllers route under `api/it/...`.

---

## Ticketing

`api/it/tickets` (`TicketingController` / `ITicketingService`, `TicketingService`).

The only sub-module with a genuinely public surface: any employee — or anyone at the firm —
can submit and watch the open queue without logging in, at `/it-helpdesk`. IT staff work the
queue from `/it/ticketing`. There's also a portal self-service path for logged-in employees
using their own department dashboards.

**Entity** (`Ticket`): `TicketNumber`, `Name`, `CompanyEmail`, `ViberNumber?`, `Description`,
`Category`, `Priority`, `Status` (default `Open`), `Department` (requester's, free text),
`AssignedTo?` (IT staff user id), `SubmittedByEmployeeId?`, `DateSubmitted`, `UpdatedDate`,
`Remarks?`.

Status values used by the UI (`ITHelpdeskPage.tsx`): `Open`, `In Progress`, `On Hold`,
`Resolved`, `Closed`. Priority: `Low`, `Medium`, `High`, `Urgent`. Categories are free text in
the entity but the helpdesk form's dropdown offers: `Technical Support`,
`Network - Access / Issue`, `Account & Access`, `Installation / Setup`,
`Booking / Reservation`, `Email Services`, `Website Development`.

| Endpoint | Access |
|---|---|
| `POST /api/it/tickets` | Public (rate-limited: `public-submission` policy) |
| `GET /api/it/tickets/queue` | Public — open (non-closed) tickets |
| `GET /api/it/tickets/summary` | Public — status counts |
| `GET /api/it/tickets` | `it-ticketing` — full list incl. closed |
| `GET /api/it/tickets/staff` | `it-ticketing` — assignee dropdown options |
| `PATCH /api/it/tickets/{id}/status` | `it-ticketing` |
| `PATCH /api/it/tickets/{id}/remarks` | `it-ticketing` |
| `PATCH /api/it/tickets/{id}/assign` | `it-ticketing` |
| `DELETE /api/it/tickets/{id}` | `it-ticketing` |
| `GET /api/it/tickets/my-profile` | Any authenticated user — their own ticket-submitter profile |
| `GET /api/it/tickets/my` | Any authenticated user — their own submitted tickets |
| `POST /api/it/tickets/my` | Any authenticated user — submit from inside the portal |

`AssignedTo` was wired up later ("Phase 3b" per the entity comment) — worth checking current
behavior if working on assignment logic, the comment may be stale.

---

## Asset Management

`api/it/assets` (`AssetManagementController` / `AssetService`).

Tracks IT hardware inventory (laptops, desktops, phones, printers) including accessory
serials and a QR-code-based public lookup per asset, plus a per-asset history log (part
swaps/replacements).

**Entities**:
- `Asset` — `AssetTag` (e.g. `STLAF-LP-2026-001`), `DeviceName`, `Type`, `Brand`, `Model`,
  `Price`, `Status`, `Condition`, `AssignedTo?`, `PreviousUser?`, `SerialNumber`,
  `Department?`, `HasMouse/Keyboard/Monitor` + their serials, `Remarks?`, `CreatedByName`,
  `PurchaseDate?`, `Qr` (canonical string encoded into the QR image).
- `AssetHistory` — `AssetId` (FK), `PartComponent`, `SerialNumber?`, `DatePurchased?`,
  `DateOfReplacement`, `Notes?`.

UI dropdown values (`AssetFormModal.tsx`): Type — `Laptop`, `Desktop`, `Mobile Phone`,
`Printer`. Condition — `Brand New`, `Refurbished`, `Old`. Status — `Available`, `Assigned`,
`Under Repair`.

| Endpoint | Access |
|---|---|
| `GET /api/it/assets` | `it-assets` |
| `POST /api/it/assets` | `it-assets` |
| `PUT /api/it/assets/{id}` | `it-assets` |
| `DELETE /api/it/assets/{id}` | `it-assets` |
| `GET /api/it/assets/{assetId}/history` | `it-assets` |
| `POST /api/it/assets/history` | `it-assets` |
| `GET /api/it/assets/tag/{assetTag}` | **Public** — what an asset's QR code links to |

The QR flow: each asset gets a QR image (`QRCodeModal.tsx`) encoding a URL to
`/assets/:assetTag`, served by the public `AssetPublicPage` — anyone who scans a physical
asset's tag can see its public details without logging in.

---

## Gmail Management

`api/it/gmail` (`GmailManagementController` / `GmailService`), gated entirely at the
controller level (`[Authorize(Policy = "it-gmail")]`) — every action needs `it-gmail`.

Manages the firm's Google Workspace accounts, the individual email mailboxes under each,
and Gmail app passwords. Three tabs in the UI: **GWS Accounts**, **Email Accounts**, **App
Passwords**.

**Entities**:
- `GwsAccount` — `Name`, `MaxCapacity` (mailbox capacity for that workspace account).
- `EmailAccount` — `FullName`, `LocalGmail`, `Password`, `StlafEmail`, `OldUser?`, `Status`
  (default `Active`), `GwsAccountId` (FK), `Remarks?`, plus soft-delete/recycle fields below.
- `AppPassword` — `GwsAccountId` (FK), `AppPasswordValue`, `Month`, `Year`, `Notes?`.

**Email account lifecycle** (`GmailService.cs`) — two independent flags, don't confuse them:
- **Delete** (`Deleted`/`DeleteAt`) — soft-delete; deleted rows are excluded from all active
  queries (`.Where(e => !e.Deleted)`) but stay in the table.
- **Recycle** (`RecycleEmailAccountAsync`) — reassigns an existing local Gmail
  mailbox (`LocalGmail`) to a *new* person instead of creating a new mailbox: stashes the
  outgoing owner into `OldUser`/`OldStlafEmail`, overwrites `FullName`/`StlafEmail`/
  `Password` with the new owner's, sets `Status = "Active"`, `Recycled = true`,
  `RecycledAt = now`. It also clears the outgoing employee's `CompanyEmail` (matched by the
  email they're losing) and syncs the new employee's `CompanyEmail` by name
  (`SyncEmployeeCompanyEmailByNameAsync`).

| Endpoint | Notes |
|---|---|
| `GET/POST /api/it/gmail/accounts` | GWS accounts |
| `PUT /api/it/gmail/accounts/{id}` | |
| `GET/POST /api/it/gmail/emails` | Email accounts |
| `PUT /api/it/gmail/emails/{id}` | |
| `DELETE /api/it/gmail/emails/{id}` | Soft-delete (see above) |
| `POST /api/it/gmail/emails/{id}/recycle` | Reassign mailbox to a new owner (see above) |
| `GET/POST /api/it/gmail/app-passwords` | |
| `GET /api/it/gmail/registered-employees` | Active-employee options for linking an email account to a person |
| `POST /api/it/gmail/backfill-employee-emails` | One-off maintenance action — backfills `Employee.CompanyEmail` from existing email account records |

**Background job**: `AppPasswordCleanupService` (`stlaf.api/Departments/IT/BackgroundJobs`,
registered as a hosted service in `Program.cs`) sweeps every 6 hours and deletes expired app
passwords (`IGmailService.DeleteExpiredAppPasswordsAsync`) — app passwords are treated as
month/year-scoped, not permanent.

---

## Not covered here

`/it/leave/*` (My Leave, Overtime, Undertime, Approvals) is the shared cross-department leave
module, not IT-specific — see the leave module doc when it exists. "Submit Ticket" and
"Inquiries" nav actions available from other departments' dashboards route back into this
module's Ticketing endpoints and aren't duplicated per department.
