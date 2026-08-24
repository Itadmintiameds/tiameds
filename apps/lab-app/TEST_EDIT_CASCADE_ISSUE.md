# Backend APIs Affected by Test Edit Cascading Bug

**Issue:** Editing a test's master data (name/price/category) in Test Management currently changes what is shown for **already-completed visits, bills, invoices, and reports** — even after they've been shared with the end user.

**Root cause:** Visit/order records only store `testIds` / `packageIds` (foreign keys) plus computed discount amounts. They do **not** store a snapshot of the test's `name`/`price` at the time the order/visit was created. Historical screens re-fetch the *live* test master row every time they render, so an edit in Test Management instantly cascades into old records.

---

## Quick List — All Endpoints (Method + Path)

**Test Master**
- GET `admin/lab/{labId}/tests`
- GET `admin/lab/tests?labId=&page=&size=`
- GET `admin/lab/{labId}/test/{testId}`
- POST `/admin/lab/{labId}/add`
- PUT `/admin/lab/{labId}/update/{testId}`
- DELETE `/admin/lab/{labId}/remove/{testId}`
- POST `/admin/lab/test/{labId}/csv/upload`
- GET `/admin/lab/{labId}/download`
- GET `super-admin/referance-and-test/test-price-list`
- GET `/super-admin/referance-and-test/testpricelist/download`

**Test Reference Ranges**
- GET `lab/test-reference/{labId}`
- GET `lab/test-reference?labId=&page=&size=`
- GET `lab/test-reference/{labId}/test?testName=`
- PUT `lab/test-reference/update`
- POST `lab/test-reference/add`
- DELETE `lab/test-reference/delete`
- GET `/lab/test-reference/{labId}/download`
- POST `/lab/test-reference/{labId}/csv/upload`
- GET `super-admin/referance-and-test/test-referance`

**Orders / Visits**
- POST `/lab/{labId}/add-patient`
- PUT `/lab/{labId}/update-patient-details/{patientId}`

**Packages**
- GET `/admin/lab/{labId}/packages`
- GET `/admin/lab/{labId}/packages/disabled`
- GET `/admin/lab/{labId}/package/{packageId}`
- POST `/admin/lab/{labId}/package`
- PUT `/admin/lab/{labId}/package/{packageId}`
- PATCH `/admin/lab/{labId}/package/{packageId}/enable`
- DELETE `/admin/lab/{labId}/package/{packageId}`

**Reports**
- POST `lab/{labId}/report`

---

## 1. Test Master CRUD (Test Management)

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `admin/lab/{labId}/tests` | List all tests (id, name, price, category) |
| GET | `admin/lab/tests?labId=&page=&size=` | Paginated test list |
| GET | `admin/lab/{labId}/test/{testId}` | **Fetch single live test — used across historical screens, see §3** |
| POST | `/admin/lab/{labId}/add` | Create new test |
| PUT | `/admin/lab/{labId}/update/{testId}` | **Edit test — the mutation causing the bug** |
| DELETE | `/admin/lab/{labId}/remove/{testId}` | Delete test |
| POST | `/admin/lab/test/{labId}/csv/upload` | Bulk create/update tests via CSV |
| GET | `/admin/lab/{labId}/download` | Export test price list |
| GET | `super-admin/referance-and-test/test-price-list` | Super-admin master price list |
| GET | `/super-admin/referance-and-test/testpricelist/download` | Export master price list |

## 2. Test Reference Ranges (feeds report normal ranges — same risk class)

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `lab/test-reference/{labId}` | List reference ranges |
| GET | `lab/test-reference?labId=&page=&size=` | Paginated reference ranges |
| GET | `lab/test-reference/{labId}/test?testName=` | Live lookup by test name |
| PUT | `lab/test-reference/update` | Edit reference range |
| POST | `lab/test-reference/add` | Add reference range |
| DELETE | `lab/test-reference/delete` | Delete reference range |
| GET | `/lab/test-reference/{labId}/download` | Export CSV |
| POST | `/lab/test-reference/{labId}/csv/upload` | Bulk upload |
| GET | `super-admin/referance-and-test/test-referance` | Master reference ranges |

## 3. High-Risk: Endpoints Used in BOTH Test Management AND Historical/Read-Only Screens

**`GET admin/lab/{labId}/test/{testId}` is the root-cause read path.** It returns the *live* test master row and is called from every screen that renders a historical bill/invoice/report — not just from test management:

- Bill page (historical, read-only)
- Patients dashboard bill view (historical)
- Printed invoice (historical, shared document)
- Patient details view (historical)
- Cancel-visit dialog (historical)
- Visit details (historical)
- Lab report list (collected/completed) (historical)

`GET admin/lab/{labId}/tests` has the same dual-use pattern — used both for "current price list" when creating/editing an order, and as the backing data for test management list screens.

**Conclusion:** any `PUT /admin/lab/{labId}/update/{testId}` that mutates the row returned by `GET /admin/lab/{labId}/test/{testId}` immediately changes what every historical bill/invoice/report displays, because none of them read a stored per-visit snapshot — they re-resolve `name`/`price` from the live master row on every render.

## 4. Order / Visit Endpoints (where the fix needs to land)

| Method | Endpoint | Notes |
|---|---|---|
| POST | `/lab/{labId}/add-patient` | Visit payload sends `testIds` + `{id, discountAmount, discountPercent, finalPrice}` only — **no `testName`/base `price` snapshot** |
| PUT | `/lab/{labId}/update-patient-details/{patientId}` | Also re-fetches live test list on edit, pulling current master prices instead of originally billed values |

- Billing totals (`totalAmount`, `netAmount`, `discount`) ARE snapshotted numerically at creation time, so the aggregate bill total does not change.
- But the **line-item test name and unit price** shown when reconstructing that bill DO change, since they're re-fetched live rather than read from a stored snapshot. This is an inconsistency: total is frozen, line items are not.

## 5. Packages (tests bundled — identical cascade risk)

| Method | Endpoint | Notes |
|---|---|---|
| GET | `/admin/lab/{labId}/packages` | List packages |
| GET | `/admin/lab/{labId}/packages/disabled` | List disabled packages |
| GET | `/admin/lab/{labId}/package/{packageId}` | Live package fetch — used in bill/invoice/cancel-visit screens, same pattern as `getTestById` |
| POST | `/admin/lab/{labId}/package` | Create package |
| PUT | `/admin/lab/{labId}/package/{packageId}` | Edit package price/testIds — same cascading risk as `updateTest` |
| PATCH | `/admin/lab/{labId}/package/{packageId}/enable` | Enable/disable package |
| DELETE | `/admin/lab/{labId}/package/{packageId}` | Delete package |

## 6. Reports (Lower Risk — Already Snapshotted Correctly)

`POST lab/{labId}/report` stores `testName`, `testCategory`, `referenceRange`, `referenceDescription`, `unit`, `enteredValue` directly on the report row at creation time. This is good practice and **not** implicated in the cascading bug for report content.

**Caveat to check with backend:** the "Edit report" flow re-fetches reference range live by test name while filling/editing. Confirm this only applies to draft/unsigned reports — if it can be used to reopen an already-signed report, it's a smaller version of the same bug.

---

## Highest-Priority Endpoints to Fix

1. **`PUT /admin/lab/{labId}/update/{testId}`** — the write path. Should not retroactively affect past visits/bills/invoices.
2. **`GET /admin/lab/{labId}/test/{testId}`** — the read path. Historical screens should stop using this to "re-hydrate" test name/price for completed visits.
3. **`GET /admin/lab/{labId}/package/{packageId}`** and **`PUT /admin/lab/{labId}/package/{packageId}`** — identical pattern for health packages.
4. **`POST /lab/{labId}/add-patient`** and **`PUT /lab/{labId}/update-patient-details/{patientId}`** — need to persist a snapshot of test name/price at order time so downstream views don't need to live-fetch test master data.

## Recommended Fix Direction

Choose one:

- **(a) Snapshot approach:** Add `testName` / `price` / `category` snapshot fields to the visit/order/bill line items at creation time. Frontend historical screens read those stored fields instead of calling `getTestById` / `getHealthPackageById`.
- **(b) Versioning approach:** Version the test master table (effective-dated rows). Editing a test creates a new version rather than mutating the row that old `testId` foreign keys point to; historical records keep resolving to the version that was active when they were created.

Either fix must also cover packages, since they share the identical live-refetch pattern.
