# QA Exploratory Agents — 3-Step Flow

A chain of three Claude Code subagents that take a bare URL and give you back a
QMetry-ready test suite, executed Playwright code, and an HTML report.

```
  URL  ──►  Agent 1            ──►  Agent 2                   ──►  Agent 3
            qa-explorer             qa-automation-engineer          qa-report-builder
            explores the app        writes + runs Playwright        builds report.html
            writes test cases       records real results            charts + percentages

            test-cases.csv          execution-results.json          report.html
            test-cases.json         PlaywrightTest/specs/<run-id>/   (charts, bugs, notes)
```

---

## Folder layout

```
D:\QaExploratoryAgents\
├─ agents\                        the 3 agent files — copy these into .claude\agents\
│    qa-explorer.md               Agent 1
│    qa-automation-engineer.md    Agent 2
│    qa-report-builder.md         Agent 3
├─ docs\
│    CONTRACTS.md                 file formats the 3 agents share — read this
├─ config\
│    target.example.json          copy to target.json and fill in
├─ outputs\<run-id>\              test cases, results, report, screenshots
└─ tests\PlaywrightTest\          the Playwright project — installed ONCE
     node_modules\                already installed, never reinstalled per run
     playwright.config.js         permanent
     helpers\target.js            permanent
     fixtures\auth.setup.js       permanent
     specs\<run-id>\              the only thing generated per run
```

`tests\PlaywrightTest\` is set up and stays set up. Every run adds one small
folder of `.spec.js` files under `specs\` and nothing else — no second copy of
node_modules, no repeated download.

## Before the first run

1. Create the folder `D:\QaExploratoryAgents\.claude\agents\` and copy the three
   files from `agents\` into it. Claude only loads subagents from `.claude\agents\`.
   In PowerShell:

   ```powershell
   mkdir "D:\QaExploratoryAgents\.claude\agents" -Force
   copy "D:\QaExploratoryAgents\agents\*.md" "D:\QaExploratoryAgents\.claude\agents\"
   ```

   (Put them in `C:\Users\<you>\.claude\agents\` instead if you want the three
   agents available in every project, not only this folder.)
2. Copy `config/target.example.json` to `config/target.json` and fill in the
   URL, credentials, and scope. `target.json` holds passwords — keep it local.
3. Make sure the Playwright MCP server is connected in Claude.
4. Open Claude Code with `D:\QaExploratoryAgents` as the working folder, so the
   agents are picked up.

The Playwright project in `tests\PlaywrightTest\` is already installed and uses
the Google Chrome on this machine, so there is nothing to install per run. If it
ever has to be rebuilt from scratch, that is one command, once:

```powershell
cd "D:\QaExploratoryAgents\tests\PlaywrightTest"
npm install
```

## How to run

**Step 1 — explore and write cases**

```
Use the qa-explorer agent on https://app.example.com — full app, log in as Project Manager.
```

Review `outputs/<run-id>/test-cases.csv` before moving on. This is the step
worth your time: if the cases are right, the rest follows.

**Step 2 — implement and execute**

```
Use the qa-automation-engineer agent on run <run-id>.
```

**Step 3 — report**

```
Use the qa-report-builder agent on run <run-id>.
```

**Or the whole chain in one go**

```
Run the full QA flow on https://app.example.com: qa-explorer, then
qa-automation-engineer, then qa-report-builder. Stop and show me the test cases
before executing.
```

Keeping the stop after Step 1 is recommended — reviewing 120 generated cases
after they have already run is more work than reviewing them before.

---

## What the flow deliberately does not do

- No performance, load, or response-time cases.
- No mobile or device cases. Desktop web only.
- No case that needs a database, log file, API call, or external system to
  verify — everything must be checkable on screen.
- No Jira push. Failures come back as **draft** bug reports in the four-section
  format; you review and approve before anything is filed.
- No production data changes. Agent 2 creates its own records with a
  `QA-AUTO-` prefix and does not delete records it did not create.

## Uploading to QMetry

`test-cases.csv` has exactly the eight columns QMetry expects, in order, and is
saved as UTF-8 with BOM so Arabic text imports correctly. Row order is the
intended execution order: all `[Smoke]` cases first, then High, Medium, Low.

## Changing the flow

Everything the agents do is in their three `.md` files — edit the wording and
the behaviour changes. If you change a file format, change `docs/CONTRACTS.md`
too, because all three agents read it.

`playwright.config.js`, `helpers/target.js` and `fixtures/auth.setup.js` inside
`tests\PlaywrightTest\` are shared by every run. Change them deliberately: a
change there affects every future run, not just the next one.

## Running the specs by hand

From `tests\PlaywrightTest\`:

```powershell
npx playwright test                          # newest run under specs\
$env:RUN_ID="pm-portal-2026-09-12-1430"; npx playwright test   # a specific run
npx playwright test specs\<run-id>\03-cart.spec.js             # one file
```

The first line of output says which run is executing:
`[qa-flow] run: <run-id>`.
