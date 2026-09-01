# HR Admin department module

Technical reference for the HR Admin department's area of the internal staff portal
(`STLAF.Client` + `stlaf.api`). Covers what exists, how access is gated, and where the code
lives — not a how-to-use-it guide. Same format as [`it.md`](./it.md).

HR Admin has four gated sub-modules — **Employees**, **Leave Settings**, **Medical
Certificates**, and **Reports** — plus it *configures* the Leave/Overtime/Undertime system
that every employee in every department uses for self-service, which is documented here too
since HR Admin owns it, even though the request/approval endpoints themselves aren't
department-gated (see Access control).

## Access control

Same two-layer shape as IT (see `it.md` for the general model), with one extra wrinkle:

1. **Department gate** — `/hr-admin` is wrapped in `DepartmentGuard department="HRAdmin"`,
   frontend-only, same as every other department.
2. **Module gate** — `hr-employees`, `hr-leave-settings`, `hr-medical-certificates`,
   `hr-reports`. Backend-enforced via `[Authorize(Policy = "...")]` + `ModuleRequirement`.
3. **The wrinkle**: `LeaveController`, `OvertimeController`, and `UndertimeController` are
   *not* HR-only. Their controller-level policy is a bare `[Authorize]` — any authenticated
   employee, regardless of department, can hit `my-requests`, `requests` (submit their own),
   and the `am-i-*-approver` checks. Only the configuration/approval-admin actions on those
   same controllers require a module policy:
   - `hr-leave-settings` — leave types, approvers, notification/SMTP config, employee leave
     credits (all on `LeaveController`, see below).
   - `hr-medical-certificates` — verifying certificates (`LeaveController` again — medical
     certificates live under `api/leave`, not their own controller).
   - Overtime's `partners` endpoints (who signs off at the partner stage) use
     `[Authorize(Policy = "HRAdmin")]` — the **department** policy, not a module — so
     assigning overtime partners requires being in HR Admin specifically (or
     `SuperAdmin`/`DeptAdmin`), not just holding some module grant.

## Frontend routes

Defined in `STLAF.Client/src/App.tsx`.

| Path | Guard | Component |
|---|---|---|
| `/hr-admin` | Department `HRAdmin` | `HrDashboard` → `HrOverviewPage` (index) |
| `/hr-admin/employees` | Module `hr-employees` | `EmployeesPage` |
| `/hr-admin/leave-settings` | Module `hr-leave-settings` | `LeaveSettingsPage` |
| `/hr-admin/medical-certificates` | Module `hr-medical-certificates` | `MedicalVerificationsPage` |
| `/hr-admin/reports` | Module `hr-reports` | `ReportsPage` |
| `/hr-admin/leave/*` | Department `HRAdmin` | shared `LeaveRoutes` (My Leave/Overtime/Undertime/Approvals — every department mounts these, not HR-specific) |

Nav entries built in `STLAF.Client/src/common/navConfig.ts` → `deptModuleNav("HRAdmin")`.

## Backend layout

```
stlaf.api/Departments/HRAdmin/
  Controllers/  EmployeeController.cs (class EmployeesController), LeaveController.cs,
                OvertimeController.cs, UndertimeController.cs, ReportController.cs (class ReportsController)
  Services/     EmployeeService.cs, LeaveService.cs, OvertimeService.cs, UndertimeService.cs,
                ReportService.cs (+ I*Service interfaces)
  Entities/     Employee.cs, EmployeeCategory.cs, EmployeeLeaveCredit.cs, LeaveRequest.cs,
                LeaveType.cs, LeaveApprover.cs, LeaveNotificationSetting.cs,
                MedicalCertificate.cs, OvertimeRequest.cs, OvertimePartner.cs,
                UndertimeReqeust.cs (file name has a typo; the class inside is UndertimeRequest)
  DTOs/         HrDto.cs, LeaveDto.cs, OvertimeDto.cs, UndertimeDto.cs, ReportDto.cs
```

Route prefixes: employees under `api/hr`, leave (+ medical certs) under `api/leave`,
overtime under `api/overtime`, undertime under `api/undertime`, reports under
`api/hr/reports`.

---

## Employees

`api/hr` (`EmployeesController` / `EmployeeService`), all actions `hr-employees`.

**Entity** (`Employee`): `CompanyId`, `CategoryId` (FK `EmployeeCategory`), `FirstName`,
`MiddleName?`, `LastName`, `MobileNumber?`, `Age`, `Sex`, `Bday`, `Nationality`,
`Department` (free text, not a FK), `OfficePosition`, `PersonalEmail?`, `CompanyEmail?`,
`StartDate`, `EmergencyContactName?`, `EmergencyContactNumber?`, `Status` (default
`Active`), `UserId?` (FK to the login `User`, nullable).

`EmployeeCategory`: `Name`, `Code` (int) — used in Company ID generation.

**Creating an employee does more than insert a row** (`EmployeeService.CreateEmployeeAsync`):
1. Generates a `CompanyId` as `{yy}-{category.Code}{sequence:D4}` (e.g. `26-30047`) unless
   `ManualCompanyId` is supplied, and rejects the request if that ID is already taken (by
   another employee or as a `User.Username`).
2. Creates a login `User` row alongside the `Employee` row: `Username`/`Email` = the
   `CompanyId` (not a real email — there's no email account yet), password hashed from a
   **hardcoded default `"stlaf2026"`**, role `Employee`, `IsActive` mirrors `dto.Status`.
3. If the Company ID was auto-generated (not manual), it **automatically files an urgent IT
   ticket** via `ITicketingService.CreateAsync` — category `Email & Communications`, priority
   `Urgent` — asking IT to create the new hire's email account. See the IT module doc,
   Ticketing section. This is the one place HR and IT are wired directly together in code.

`DeleteEmployeeAsync` is a **hard delete** — removes the `Employee` row and, if linked,
their `User` login row too. Not a deactivation; `Status = "Inactive"` (settable via
`UpdateEmployee`) is the non-destructive alternative.

| Endpoint | Notes |
|---|---|
| `GET/POST /api/hr/categories` | Employee categories (for Company ID prefixes) |
| `GET/POST /api/hr/employees` | |
| `PUT /api/hr/employees/{id}` | Rejects if `Bday >= StartDate` |
| `DELETE /api/hr/employees/{id}` | Hard delete, cascades to the login `User` (see above) |

---

## Leave

`api/leave` (`LeaveController` / `LeaveService`). Self-service actions are open to any
authenticated employee; configuration actions need `hr-leave-settings` (see Access control).

**Entities**:
- `LeaveType` — `Name`, `DefaultCredits`, `RequiresMedicalAfterDays?` — if set, a leave
  request of this type spanning more than that many days requires a medical certificate
  (drives the medical-certificate blocking flow below).
- `LeaveRequest` — `EmployeeId`, `LeaveTypeId`, `StartDate`, `EndDate`, `Days`, `Reason`,
  `Status` (`Pending`/`Approved`/`Rejected`), decision fields
  (`DecidedByEmployeeId`/`DecisionNotes`/`DecidedAt`), **retraction** fields
  (`RetractionReason`, `RetractionRequestedAt`, `RetractionDecidedBy*`) — an
  already-submitted request can be retracted, which itself goes through a decision, not an
  unconditional cancel — and `IsPaid` (default `true`).
- `LeaveApprover` — one row per `Department`, pointing at the `Employee` who approves that
  department's leave requests. **Also used by Undertime** — see that section.
- `EmployeeLeaveCredit` — per-employee, per-`LeaveType` credit balance, settable
  individually by HR (overrides `LeaveType.DefaultCredits`).
- `LeaveNotificationSetting` — which `SmtpSender` (entity defined outside this department)
  leave notification emails go out from.

**Medical certificate blocking**: `GET /api/leave/medical-block-status` tells the client
whether the current employee is blocked from further action — presumably from submitting
new leave — until a required certificate is uploaded/verified
(`HasBlockingMedicalCertificateAsync`). `MedicalCertificate` rows go
`PendingUpload → PendingVerification → Verified`/`Rejected`, store the file in **Google
Drive** (`DriveFileId`/`DriveFileUrl`, not Backblaze B2 like the client portal), and are
capped at 3.5 MB, PDF only, enforced in the controller before it ever reaches the service.

| Endpoint | Access |
|---|---|
| `GET /api/leave/my-profile`, `/types`, `/my-balances`, `/my-requests` | Any authenticated user |
| `POST /api/leave/requests` | Any authenticated user — submit own request |
| `GET /api/leave/am-i-approver`, `/pending-approvals` | Any authenticated user (returns false/empty if not an approver) |
| `POST /api/leave/requests/{id}/decide` | Any authenticated user who *is* the department's approver |
| `POST /api/leave/requests/{id}/request-retraction` | Any authenticated user — request to retract own submitted request |
| `GET /api/leave/pending-retractions`, `POST .../decide-retraction` | Approver |
| `GET /api/leave/medical-block-status`, `/my-medical-certificates` | Any authenticated user |
| `POST /api/leave/medical-certificates/{id}/upload` | Any authenticated user — the certificate owner |
| `GET /api/leave/medical-certificates/pending`, `POST .../verify` | `hr-medical-certificates` |
| `POST/PUT /api/leave/types` | `hr-leave-settings` |
| `GET/POST /api/leave/approvers` | `hr-leave-settings` |
| `GET/PUT /api/leave/notification-setting` | `hr-leave-settings` |
| `GET/POST/DELETE /api/leave/smtp-senders`, `POST .../test` | `hr-leave-settings` |
| `GET/PUT /api/leave/employees/{employeeId}/credits` | `hr-leave-settings` |
| `POST /api/leave/test-file-storage` | `hr-leave-settings` — sanity-checks the file storage connection |

---

## Overtime

`api/overtime` (`OvertimeController` / `OvertimeService`). Self-service actions open to any
authenticated employee.

**Two-stage approval**, per the entity's own status comment: `Pending → PendingPartnerApproval
→ Approved`/`Rejected`. Department approval and partner approval are tracked with separate
fields (`DeptDecidedBy*` / `PartnerDecidedBy*`) and separate decide endpoints.

**Entities**:
- `OvertimeRequest` — `EmployeeId`, `Date`, `StartTime`/`EndTime` (`TimeOnly`), `Hours`,
  `Reason`, `Status`, plus the two decision-stage field sets above.
- `OvertimePartner` — one row per `Department`, pointing at the `Employee` who is that
  department's partner-stage approver. Separate from `LeaveApprover` (department-level
  leave approver) — a department can have a different person for each role.

| Endpoint | Access |
|---|---|
| `GET /api/overtime/my-requests`, `POST /requests` | Any authenticated user |
| `GET /api/overtime/am-i-dept-approver`, `/pending-dept-approvals` | Any authenticated user |
| `POST /api/overtime/requests/{id}/decide-dept` | The department approver |
| `GET /api/overtime/am-i-partner`, `/pending-partner-approvals` | Any authenticated user |
| `POST /api/overtime/requests/{id}/decide-partner` | The partner-stage approver |
| `GET/POST /api/overtime/partners` | `HRAdmin` **department** policy (not a module — see Access control) |

---

## Undertime

`api/undertime` (`UndertimeController` / `UndertimeService`). Single-stage approval —
simpler than Overtime, no partner stage.

**Entity** (`UndertimeRequest`, in a file literally named `UndertimeReqeust.cs`):
`EmployeeId`, `Date`, `StartTime`/`EndTime`, `Hours`, `Reason`, `Status`
(`Pending`/`Approved`/`Rejected`), decision fields.

**Reuses `LeaveApprover`** for who can approve — `IsApproverAsync` checks the same
`LeaveApprovers` table Leave uses, keyed by the employee's department. There is no separate
"undertime approver" concept; whoever is set as a department's leave approver approves that
department's undertime requests too.

| Endpoint | Access |
|---|---|
| `GET /api/undertime/my-requests`, `POST /requests` | Any authenticated user |
| `GET /api/undertime/am-i-approver`, `/pending-approvals` | Any authenticated user |
| `POST /api/undertime/requests/{id}/decide` | The department's leave approver (shared with Leave) |

---

## Reports

`api/hr/reports` (`ReportsController` / `ReportService`), `hr-reports`.

One endpoint: `GET /api/hr/reports/leave-overtime?from=&to=&department=` — generates and
streams back an `.xlsx` (via ClosedXML) named `Leave-Overtime-Report-{date}.xlsx`. No
undertime data in this report despite the name only covering leave + overtime.

---

## Not covered here

Leave/Overtime/Undertime's *self-service* pages (My Leave, My Overtime, My Undertime,
Approvals) are mounted under every department's own `/*/leave/*` route tree via the shared
`LeaveRoutes` component — they aren't part of `/hr-admin` and aren't duplicated per
department in this doc. HR Admin's role is configuring the system (leave types, approvers,
partners, credits, notification settings) and the Employees/Reports/Medical-Certificates
admin screens documented above.
