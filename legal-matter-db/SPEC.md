# Legal Firm Matter Management Database — Full Spec

## How to Use This File
This is the complete context document for the CLI session on Windows. Open this file and reference it when starting a new Claude Code CLI session with MCP-Access connected.

---

## Environment
- Database file: `C:\Mac\Home\Documents\Database1.accdb` (open in Access before starting)
- MCP-Access: registered as `access` server in `C:\Users\landonsmith\.claude.json`
- MCP-Access repo: `C:\MCP-Access\access_mcp_server.py`
- Python: `C:\Users\landonsmith\AppData\Local\Python\pythoncore-3.14-64\python.exe`
- Registry key set: `HKCU\Software\Microsoft\Office\16.0\Access\Security` → `AccessVBOM = 1`

---

## Recommended First Steps (Every CLI Session)
```
1. Confirm Access is open with Database1.accdb loaded
2. Run access_export_structure → full snapshot of all objects
3. Run access_vbe_search_all → read all existing VBA before touching anything
4. Read frmMatterTypeStatus VBA first — it is the WORKING reference implementation
5. Do not change anything until inspection is complete
```

---

## Database Schema

### tblMatters (Main Table)
| Field | Type | Notes |
|---|---|---|
| Matter # | AutoNumber | Primary Key |
| Client Name | Text | FK → tblClients |
| Client # | Number | |
| Matter Name | Text | |
| Matter Type | Text | FK → tblMatterTypes |
| Loan Type | Text | FK → tblLoanTypes |
| Project Name | Text | Optional |
| AM Contact | Text | Account Manager |
| Assigned Attorney | Text | |
| Date Active | Date | When matter was opened |
| Current Status | Text | Updated by attorney |
| Status Date | Date | **MISSING — must be added before Report 9** |
| Fee Quote | Currency | |
| WIP | Currency | Work-in-progress |
| JL WIP | Currency | JL-specific WIP |
| Invoiced Y/N | Boolean | |
| Invoice Amount | Currency | |
| Invoice Date | Date | |
| Paid Y/N | Boolean | |
| Closed Status | Text | FK → tblClosedStatuses |
| Date Closed | Date | Null if matter is open |

> ⚠️ Run this before building Report 9:
> `ALTER TABLE tblMatters ADD COLUMN [Status Date] DATETIME`

### Lookup Tables
| Table | PK Field | Count |
|---|---|---|
| tblClients | Client Name | 21 clients |
| tblMatterTypes | Matter Type | 25 types |
| tblLoanTypes | Loan Type | 10 types |
| tblClosedStatuses | Closed Status | Approved, Denied, Withdrawn |

---

## Existing Objects (verify with access_export_structure)

### Queries
- qryMasterReport, qryMasterAttyReport
- qryClientOpen, qryClientClosed
- qryAttorneyOpen, qryAttorneyClosed
- qryMasterWIP, qryAttorneyWIP, qryLauttWIP
- qryInvoice, qryAgedStatus, qryProjectStatus
- qryMatterTypeOpen, qryMatterTypeClosed

### Reports
- rptMasterReport (working)
- rptMasterAttyReport, rptMasterWIP, rptAttyWIP, rptLauttWIP
- rptInvoice, rptAgedStatus, rptProjectStatus
- rptClientOpen, rptClientClosed (subreports — used by frmClientTracking)
- rptAttorneyOpen, rptAttorneyClosed (subreports — used by frmAttorneyTracking)
- rptMatterTypeOpen, rptMatterTypeClosed (subreports — used by frmMatterTypeStatus)

### Forms
| Form | Status | Notes |
|---|---|---|
| frmDashboard | ✅ Working | Main menu, 11 buttons |
| frmParamClient | ✅ Working | Parameter selection |
| frmParamAttorney | ✅ Working | Parameter selection |
| frmParamAttyWIP | ✅ Working | Parameter selection |
| frmParamProject | ✅ Working | Parameter selection |
| frmParamMatterType | ✅ Working | Parameter selection |
| frmMatterTypeStatus | ✅ Working | **Use as reference implementation** |
| frmClientTracking | ❌ Broken | Subreport filter not passing |
| frmAttorneyTracking | ❌ Broken | Subreport filter not passing |

### VBA Module
- modReportGeneration (simplified — opens reports)

---

## Known Bugs & Root Cause Analysis

### frmClientTracking + frmAttorneyTracking (PRIMARY ISSUE)

**Symptom:** Subreports show no data when a parameter is selected.

**Three approaches already tried and failed:**
1. TempVars — Access did not recognize in query SQL, prompted for manual input
2. `Forms!frmClientTracking!txtClientName` in query — worked for frmMatterTypeStatus but failed silently here; subreports loaded before form control was populated
3. Public VBA function `GetClientFilter()` — returned no data; variable appeared to reset before query ran

**Most likely root cause:**
The `.Requery` call was written as `Me.subClientOpen.Requery` — this is **wrong**. The correct syntax in Access is `Me.subClientOpen.Form.Requery`. This threw a compile error "Method or data member not found" and the fix was never applied.

**Known control names:**
- frmClientTracking subreport controls: `subClientOpen`, `subClientClosed`
- frmAttorneyTracking subreport controls: likely `subAttorneyOpen`, `subAttorneyClose` (verify with access_list_controls)
- frmMatterTypeStatus subreport controls: unknown — inspect first to get exact names

**Fix pattern (based on working frmMatterTypeStatus):**
- User selects parameter from dropdown, then clicks a button to generate
- Button click VBA reads combo value, requeries subreports using `Me.subXxx.Form.Requery`
- Queries reference the form combo via `Forms!frmClientTracking!<comboname>`
- Combo box name on frmClientTracking: unknown — check with access_list_controls
- Combo box name on frmAttorneyTracking: unknown — check with access_list_controls

---

## 11 Reports — Full Specifications

### Report 1: Master Report
- No parameters — button opens directly
- Exclude: Date Closed is populated
- Group by Client Name, sort by Date Active ASC
- Fields: Client Name, Client #, Matter #, Matter Name, Matter Type, AM Contact, Assigned Attorney, Date Active, Current Status, Fee Quote, WIP, JL WIP
- Subtotals: matter count + WIP total per Client Name group

### Report 2: Master Attorney Report
- No parameters — button opens directly
- Exclude: Date Closed is populated
- Group by Assigned Attorney, sort by Date Active ASC
- Fields: Client Name, Client #, Matter #, Matter Name, Matter Type, AM Contact, Date Active, Current Status, Fee Quote, WIP, JL WIP
- Subtotals: matter count + WIP total per attorney group

### Report 3: Client Tracking Report ❌ BROKEN
- Parameter: Client Name (dropdown from tblClients)
- Two tabs: Open Matters / Closed Matters
- Open tab: Date Closed IS NULL, sort Date Active DESC
  - Fields: Date Active, Matter Name, Matter Type, Loan Type, AM Contact, Assigned Attorney, Current Status, Fee Quote, Invoiced Y/N, Invoice Amount, Invoice Date, Paid Y/N
- Closed tab: Date Closed IS NOT NULL, sort Date Active DESC
  - Same fields + Closed Status, Date Closed

### Report 4: Attorney Tracking Report ❌ BROKEN
- Parameter: Assigned Attorney (dropdown — distinct values from tblMatters)
- Two tabs: Open Matters / Closed Matters
- Open tab: Date Closed IS NULL, sort Date Active ASC
  - Fields: Client Name, Client #, Matter #, Matter Name, Matter Type, AM Contact, Date Active, Current Status, Fee Quote, WIP
- Closed tab: Date Closed IS NOT NULL, sort Date Active ASC
  - Same fields + Invoiced Y/N, Invoice Amount, Invoice Date, Paid Y/N, Closed Status, Date Closed

### Report 5: Master WIP Tracking Report
- No parameters — button opens directly
- Exclude: Invoiced Y/N = No
- Sort by WIP DESC
- Fields: Client Name, Client #, Matter #, Matter Name, Matter Type, Date Active, Current Status, Fee Quote, WIP, JL WIP, Invoiced Y/N, Invoice Amount, Invoice Date, Closed Status, Date Closed

### Report 6: Attorney WIP Tracking Report
- Parameter: Assigned Attorney (dropdown)
- Exclude: Paid Y/N = No (show only paid matters)
- Sort by WIP DESC
- Fields: Client Name, Client #, Matter #, Matter Name, Matter Type, Date Active, Current Status, Fee Quote, WIP, JL WIP, Invoiced Y/N, Invoice Amount, Invoice Date, Closed Status, Date Closed
- Total: WIP grand total at end of report

### Report 7: Lautt WIP Report
- No parameters — button opens directly
- Exclude: Date Closed is populated
- Exclude client names "Bernard Financial" and "M&T Bank" (exact names in tblClients)
- Show only: JL WIP < 20% of Fee Quote
- Group by Client Name, sort by Date Active ASC
- Fields: Client Name, Client #, Matter #, Matter Name, Matter Type, Assigned Attorney, Date Active, Current Status, Fee Quote, WIP, JL WIP
- Note: "M&T Bank" is the correct name — earlier docs said "M&T Deals" which was a transcription error

### Report 8: Invoice Report
- No parameters — button opens directly
- Filter: Invoiced Y/N = Yes AND Paid Y/N = No
- Sort: Invoice Amount DESC, then Invoice Date
- Fields: Date Active, Matter Name, Matter Type, AM Contact, Assigned Attorney, Current Status, Fee Quote, Invoice Amount, Invoice Date, Closed Status, Date Closed
- Email: DEFERRED — do not build yet

### Report 9: Aged Current Status Report
- No parameters — button opens directly
- ⚠️ Requires Status Date field added to tblMatters first
- Exclude: Date Closed is populated
- Include only: Status Date IS NULL OR Status Date <= Date()-7
- Group by Assigned Attorney
- Sort: Status Date ASC with NULLs at TOP (most neglected first)
  - Use: `IIF(ISNULL([Status Date]),0,1)` as sort key, then Status Date ASC
- Fields: Client Name, Client #, Matter #, Matter Name, Matter Type, AM Contact, Date Active, Current Status, Status Date, Fee Quote, WIP
- Email: DEFERRED — do not build yet

### Report 10: Project Status Report
- Parameter: Project Name (dropdown — distinct non-null values from tblMatters)
- Group by Client Name, sort by Date Active ASC
- Fields: Client Name, Client #, Matter #, Matter Name, AM Contact, Assigned Attorney, Date Active, Current Status, Fee Quote, WIP, JL WIP

### Report 11: Matter Type Status Report ✅ WORKING
- Parameter: Matter Type (dropdown from tblMatterTypes)
- Group by Client Name
- Two tabs: Open / Closed (frmMatterTypeStatus — works correctly, use as reference)
- Open tab: Date Closed IS NULL, sort Date Active DESC
  - Fields: Date Active, Matter Name, Loan Type, AM Contact, Assigned Attorney, Current Status, Fee Quote, Invoiced Y/N, Invoice Amount, Invoice Date, Paid Y/N
- Closed tab: Date Closed IS NOT NULL, sort Date Active DESC
  - Same fields + Closed Status, Date Closed

---

## Build Sequence

**Phase 1 — Inspect (read-only, no changes)**
1. `access_export_structure` → full object list
2. `access_vbe_search_all` → all existing VBA
3. `access_list_controls` on frmMatterTypeStatus → get exact control/combo names
4. `access_vbe_get_proc` → read button click handler on frmMatterTypeStatus
5. `access_list_controls` on frmClientTracking → get exact control names
6. `access_list_controls` on frmAttorneyTracking → get exact control names

**Phase 2 — Fix frmClientTracking (Report 3)**
1. Fix qryClientOpen / qryClientClosed to correctly reference form combo
2. Fix button VBA to use `Me.subClientOpen.Form.Requery` + `Me.subClientClosed.Form.Requery`
3. Verify with access_screenshot

**Phase 3 — Fix frmAttorneyTracking (Report 4)**
- Same pattern as Phase 2

**Phase 4 — Add Status Date field**
- `ALTER TABLE tblMatters ADD COLUMN [Status Date] DATETIME`

**Phase 5 — Fix/verify remaining reports (1, 2, 5, 6, 7, 8, 9, 10)**
- Check each query matches spec above
- Fix grouping, sort, filter issues
- Build Report 9 after Status Date field is confirmed present

**Phase 6 — Smoke test all 11 reports**

**Deferred (do not build yet)**
- Email integration for Reports 8 & 9
- Split database (backend/frontend separation)

---

## Important Notes
- Do NOT rebuild from scratch — structure, relationships, and most reports are correct
- frmMatterTypeStatus is the working reference — inspect it before touching anything
- "M&T Bank" is correct client name (not "M&T Deals")
- Report 6 filter: exclude Paid Y/N = No (show only paid)
- Report 7: Assigned Attorney = selected from dropdown, NOT current Windows user
- Multi-user split DB: deferred until testing complete
- No mobile requirement — Access desktop Windows only
