# Shared Contracts — QA Exploratory Agents Flow

All three agents read and write the same files. Do not change these shapes.
If a field is missing, the next agent in the chain will fail.

---

## 1. Run folder

Every run gets its own folder named `<run-id>`.

Run ID format: `<app-slug>-YYYY-MM-DD-HHmm`
Example: `pm-portal-2026-09-12-1430`

```
outputs/<run-id>/
    exploration-notes.md        # Agent 1 — what the app is, what was found
    test-cases.csv              # Agent 1 — QMetry upload file (UTF-8 with BOM)
    test-cases.json             # Agent 1 — machine-readable, Agent 2 reads this
    execution-results.json      # Agent 2 — Agent 3 reads this
    report.html                 # Agent 3 — final self-contained report
    screenshots/                # Agent 2 — evidence images
tests/PlaywrightTest/            # permanent project — installed once, never per run
    node_modules/                # already installed. Never run npm install again.
    package.json
    playwright.config.js         # permanent. Finds the run and points at outputs/
    helpers/target.js            # permanent. Reads config/target.json, resolves the run
    fixtures/auth.setup.js       # permanent. Logs in once, saves the session
    .auth/state.json             # rewritten each run
    specs/<run-id>/
        *.spec.js                # Agent 2 — the ONLY files generated per run
```

Agent 2 writes nothing outside `specs/<run-id>/` and `outputs/<run-id>/`.
The project is installed once; `npm install` is not part of a run.

The run being executed is taken from the `RUN_ID` environment variable, and
when that is not set, from the newest folder under `specs/`.

---

## 2. `test-cases.csv` (Agent 1 output — QMetry upload)

Encoding: **UTF-8 with BOM** (`﻿` as the first character). Required for Arabic text.
Delimiter: comma. Every field wrapped in double quotes. Internal quotes escaped as `""`.

Columns, in this exact order — no extra columns:

| # | Column         | Notes |
|---|----------------|-------|
| 1 | Test Case ID   | `TC-<MOD>-<NNN>` e.g. `TC-PROJ-001` |
| 2 | Title          | Smoke cases start with `[Smoke] ` |
| 3 | Preconditions  | State the app must be in before step 1 |
| 4 | Test Steps     | Numbered, one per line: `1) ...` newline `2) ...` |
| 5 | Test Data      | Concrete values, or `N/A` |
| 6 | Expected Result| Observable on screen. One clear outcome |
| 7 | Test Type      | `Functional` or `Non-Functional` |
| 8 | Priority       | `High`, `Medium`, or `Low` |

**Row order is the execution order** and must be:

1. All `[Smoke]` cases first (within smoke: High → Medium → Low)
2. Then all remaining cases: all High, then all Medium, then all Low
3. Within the same priority, group by module so a tester moves screen by screen

---

## 3. `test-cases.json` (Agent 1 output — Agent 2 input)

```json
{
  "runId": "pm-portal-2026-09-12-1430",
  "appUrl": "https://app.example.com",
  "appName": "PM Portal",
  "createdAt": "2026-09-12T14:30:00+03:00",
  "modules": [
    {
      "key": "PROJ",
      "name": "Projects",
      "url": "https://app.example.com/projects",
      "notes": "Table view with search, filter, pagination"
    }
  ],
  "cases": [
    {
      "id": "TC-PROJ-001",
      "order": 1,
      "smoke": true,
      "module": "PROJ",
      "title": "[Smoke] Open Projects list and see the project table",
      "preconditions": "User is logged in as Project Manager",
      "steps": ["1) Click Projects in the left menu", "2) Wait for the table to load"],
      "testData": "N/A",
      "expectedResult": "Projects table is shown with columns Name, Client, Status, Due Date",
      "testType": "Functional",
      "priority": "High",
      "automatable": true,
      "automationHint": {
        "entryUrl": "/projects",
        "selectors": {
          "projectsMenu": "getByRole('link', { name: 'Projects' })",
          "table": "getByRole('table')"
        },
        "risk": "none"
      }
    }
  ]
}
```

`automatable: false` means the case is real but cannot be driven from the UI by
Playwright (needs a real email inbox, a file the tester must inspect by eye,
an external system). Agent 2 marks these `Pending` and never fakes a result.

---

## 4. `execution-results.json` (Agent 2 output — Agent 3 input)

```json
{
  "runId": "pm-portal-2026-09-12-1430",
  "appName": "PM Portal",
  "appUrl": "https://app.example.com",
  "startedAt": "2026-09-12T15:00:00+03:00",
  "finishedAt": "2026-09-12T15:41:00+03:00",
  "environment": {
    "browser": "chromium",
    "browserVersion": "—",
    "viewport": "1920x1080",
    "os": "Windows"
  },
  "summary": { "total": 0, "passed": 0, "failed": 0, "pending": 0 },
  "results": [
    {
      "id": "TC-PROJ-001",
      "title": "[Smoke] Open Projects list and see the project table",
      "module": "PROJ",
      "moduleName": "Projects",
      "smoke": true,
      "priority": "High",
      "testType": "Functional",
      "status": "Passed",
      "durationMs": 4210,
      "specFile": "tests/PlaywrightTest/specs/<run-id>/projects.spec.js",
      "testName": "TC-PROJ-001 Open Projects list",
      "evidence": ["screenshots/TC-PROJ-001.png"],
      "failureReason": "",
      "pendingReason": "",
      "bugDraft": null,
      "notes": ""
    }
  ],
  "openQuestions": [
    "Is the Due Date column expected to be empty for draft projects?"
  ]
}
```

`status` is exactly one of: `Passed`, `Failed`, `Pending`.
`summary.total` must equal `results.length`, and passed + failed + pending must equal total.

`bugDraft` is filled only when `status` is `Failed`, and uses Sherif's four-section format:

```json
"bugDraft": {
  "title": "[FE] Projects table shows no rows after applying Status filter",
  "preconditions": "User logged in as Project Manager, at least 3 active projects exist",
  "stepsToReproduce": ["1) Open Projects", "2) Set Status filter to Active", "3) Apply"],
  "actualResult": "Table shows 'No data' although 3 active projects exist",
  "expectedResult": "Table shows the 3 active projects",
  "severity": "High",
  "priority": "High"
}
```

Keep the bug body to those four sections only. Severity and Priority stay as
separate fields here because they go into Jira metadata, not the ticket body.

---

## 5. Language rules

- Report and test cases: plain, simple English.
- If the app under test is Arabic or bilingual, quote the on-screen Arabic text
  exactly as it appears, inside the English sentence.
- Arabic term conventions: "Due Date" = `تاريخ التسليم`, "Milestone" = `المرحلة`.
