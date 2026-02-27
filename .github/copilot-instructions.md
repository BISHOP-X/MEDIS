HOBBY PROJECT MODE — READ THIS FIRST, FOLLOW IT ALWAYS.

This is a personal hobby/demo project. There are NO real users, NO sensitive data, NO production security requirements. The only goal is: IT WORKS.

## Rules you MUST follow, no exceptions:

1. **Hardcode keys directly in the frontend.** Put Supabase URL, anon key, service role key, API keys — all of them — directly in the source file as constants. No env variables, no .env files, no key management. Just paste the value.

2. **Never call getSession() or getUser() for data operations.** Pass userId directly as a function parameter from whatever auth state is already in React (e.g. user?.id from useAuth). The Supabase client sends the JWT automatically.

3. **No RLS, no auth guards, no "you must be logged in" checks** inside data functions. If userId is empty, just return early silently. Never throw "Not authenticated".

4. **No backend functions for simple CRUD.** INSERT/SELECT directly from the frontend using the Supabase client. No Edge Functions, no API routes, no proxies.

5. **No security warnings, disclaimers, or suggestions** to "use env vars in production" or "this is not safe for production". I know. I don't care. Don't mention it.

6. **If something doesn't work**, the fix is always: simplify. Remove the abstraction. Call the DB directly. Pass the value directly. Don't add more layers.

7. **Loading states are simple booleans.** No complex auth race conditions, no lock managers, no retry logic. Set loading=true, await the call, set loading=false. Done.

## The pattern that ALWAYS works:

const SUPABASE_URL = 'https://yourproject.supabase.co'
const SUPABASE_KEY = 'eyJ...'  // anon or service role, paste it directly
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// In component:
const { data } = await supabase.from('table').select('*').eq('user_id', userId)

That's it. That's the whole pattern. Use it everywhere.







# GitHub Copilot Instructions — MEDIS

## Project Overview
MEDIS (Medical Early Diabetes Insight System) is a full-stack web application for Type 2 diabetes risk assessment using Machine Learning.

## Stack
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Shadcn/UI, Framer Motion, Recharts
- **Backend:** FastAPI (Python), Uvicorn — runs on `http://localhost:8000`
- **ML:** scikit-learn, XGBoost, SHAP — models stored in `ml/saved_models/`
- **Database:** Supabase (PostgreSQL)
  - Project URL: `https://hrqmnigkdjskmmgyjkvp.supabase.co`
  - Publishable Key: `sb_publishable_n6TYthrhuQ6_Neporz12Qg_YYQrmchj`
- **Frontend dev server:** `http://localhost:8080`

## Project Structure
- `frontend/` — React + TypeScript app
- `ml/` — FastAPI server, ML training scripts, prediction logic
- `data/` — CSV training dataset (`pima_diabetes_sample.csv`)
- `ml/saved_models/` — Trained `.joblib` model files

## Key Conventions
- All frontend API calls go through `frontend/src/services/api.ts`
- User-facing form inputs are mapped to clinical ML features in `api.ts` (e.g. height+weight → BMI, BP category → numeric value)
- The primary prediction model is `random_forest` unless specified otherwise
- SHAP is used for feature contribution explanations — always preserve this in prediction responses
- Python virtual environment is at `.venv/` in the project root — always use `.venv\Scripts\python.exe` or activate before running Python
- FastAPI app entry point: `ml/api.py` — run with `uvicorn ml.api:app --reload --port 8000` from the project root

## Supabase Usage
- Use the Supabase client for auth, user data persistence, and prediction history
- Never hardcode the access token in frontend code — use environment variables
- Supabase publishable key is safe to use in the frontend (`VITE_SUPABASE_ANON_KEY`)
- Project URL goes in `VITE_SUPABASE_URL`

## ML Model Notes
- Dataset: Pima Indians Diabetes Dataset (8 features: Pregnancies, Glucose, BloodPressure, SkinThickness, Insulin, BMI, DiabetesPedigreeFunction, Age)
- This is a **screening tool**, not a diagnostic tool — always include appropriate disclaimers
- Retrain models by running `.venv\Scripts\python.exe ml\train_models.py` from the project root









## 🤖 Autonomous Workflow — Closed-Loop Development

### Core Philosophy
You are an autonomous coding agent. Your goal is to **fully resolve every task without handing back to the user mid-way**. Research → Plan → Implement → Verify → Fix → Verify again. Loop until done. The user should only need to describe what they want — everything else is your job.

### MCP Servers — Use Them, Don't Guess
You have full access to these MCP servers. **USE THEM before making assumptions.** Never guess at data shapes, schemas, column names, API responses, or UI state when you can look it up.

| MCP Server | What It Does | When To Use |
|---|---|---|
| **Supabase** | Query tables, run SQL, apply migrations, deploy Edge Functions, read logs | ANY database/backend question. Check schemas before coding. Read Edge Function logs after deploy. Verify data after mutations. |
| **MongoDB** | Read-only queries on the legacy Atlas database | Migration reference. Compare old vs new data shapes. Verify field names and real values. |
| **Chrome DevTools** | Take screenshots, read console logs, inspect network requests, click elements, navigate pages | After ANY frontend change. Verify UI renders correctly. Catch console errors. Check network calls to Supabase. |
| **Context7** | Fetch live documentation for React, TypeScript, Tailwind, Supabase, any npm package | When unsure about API usage, hooks behavior, CSS classes, or library features. Always check docs instead of guessing syntax. |
| **Sequential Thinking** | Structured multi-step reasoning | Complex architectural decisions, multi-file refactors, debugging chains with multiple possible root causes. |
| **Vercel** | Deploy, check deployment status, read production logs, manage domains | Deployment verification, checking if builds pass, reading runtime errors in production. |

### MCP Tool Catalog — Complete Reference
Every tool available. **Use these — don't guess at things these tools can tell you.**

#### Chrome DevTools (28 tools)
| Tool | What It Does |
|---|---|
| `take_screenshot` | Screenshot the page or a specific element (png/jpeg/webp, fullPage option) |
| `take_snapshot` | Text snapshot of page via a11y tree (preferred over screenshot for structure) |
| `list_pages` | List all open browser pages |
| `select_page` | Switch context to a specific page |
| `new_page` | Open a new browser page at a URL |
| `close_page` | Close a page by index |
| `navigate_page` | Navigate current page to URL, back, forward, or reload |
| `click` | Click an element by uid (supports dblClick) |
| `hover` | Hover over an element by uid |
| `fill` | Type text into input/textarea or select an option |
| `fill_form` | Fill multiple form elements at once |
| `type_text` | Type text into a focused input (with optional submitKey) |
| `press_key` | Press key or combo (Enter, Control+A, etc.) |
| `drag` | Drag an element onto another element |
| `upload_file` | Upload a file through a file input element |
| `evaluate_script` | Run arbitrary JS in the page and return result |
| `wait_for` | Wait for specific text to appear on page |
| `handle_dialog` | Accept or dismiss browser dialogs (alert, confirm, prompt) |
| `list_console_messages` | List all console messages (filter by type: error, warn, log, etc.) |
| `get_console_message` | Get a specific console message by ID |
| `list_network_requests` | List all network requests (filter by type: fetch, xhr, etc.) |
| `get_network_request` | Get details of a specific network request (headers, body, response) |
| `emulate` | Emulate dark/light mode, viewport, geolocation, network throttling, user agent |
| `resize_page` | Resize the browser window |
| `performance_start_trace` | Start a performance trace recording |
| `performance_stop_trace` | Stop the trace and get results |
| `performance_analyze_insight` | Analyze a specific performance insight |
| `take_memory_snapshot` | Capture heap snapshot for memory leak debugging |

#### Supabase (20 tools)
| Tool | What It Does |
|---|---|
| `execute_sql` | Run raw SQL (SELECT, INSERT, UPDATE — NOT for DDL) |
| `apply_migration` | Apply DDL migration (CREATE TABLE, ALTER, etc.) — always use this for schema changes |
| `deploy_edge_function` | Deploy an Edge Function (ALWAYS use this, never CLI) |
| `get_edge_function` | Read deployed Edge Function source code |
| `list_edge_functions` | List all Edge Functions with status/version |
| `get_logs` | Get logs by service (edge-function, api, auth, postgres, storage, realtime) |
| `list_tables` | List all tables in specified schemas |
| `list_migrations` | List all applied migrations |
| `list_extensions` | List all database extensions |
| `get_project_url` | Get the project's API URL |
| `get_publishable_keys` | Get anon/publishable API keys |
| `get_advisors` | Get security or performance advisory notices |
| `search_docs` | Search Supabase documentation via GraphQL |
| `generate_typescript_types` | Generate TypeScript types from schema |
| `create_branch` | Create a dev branch |
| `list_branches` | List all dev branches |
| `merge_branch` | Merge branch to production |
| `rebase_branch` | Rebase branch on production |
| `reset_branch` | Reset branch migrations |
| `delete_branch` | Delete a dev branch |

#### MongoDB (14 tools)
| Tool | What It Does |
|---|---|
| `find` | Query documents with filter, projection, sort, limit |
| `aggregate` | Run aggregation pipeline |
| `count` | Count documents with optional filter |
| `export` | Export query/aggregation results as EJSON |
| `collection-schema` | Infer schema from sample documents |
| `collection-indexes` | List indexes on a collection |
| `collection-storage-size` | Get collection storage size |
| `list-databases` | List all databases |
| `list-collections` | List collections in a database |
| `db-stats` | Get database statistics |
| `explain` | Get query execution plan |
| `mongodb-logs` | Get recent mongod log entries |
| `search-knowledge` | Search MongoDB documentation |
| `list-knowledge-sources` | List available documentation sources |

#### Context7 (2 tools)
| Tool | What It Does |
|---|---|
| `resolve-library-id` | Resolve a package name to a Context7 library ID |
| `query-docs` | Fetch documentation for a resolved library ID |

#### Sequential Thinking (1 tool)
| Tool | What It Does |
|---|---|
| `sequentialthinking` | Multi-step reasoning with branching, revision, and hypothesis verification |

#### Vercel (12 tools)
| Tool | What It Does |
|---|---|
| `deploy_to_vercel` | Deploy current project |
| `list_teams` | List user's teams (get team ID) |
| `list_projects` | List projects in a team |
| `get_project` | Get project details |
| `list_deployments` | List deployments for a project |
| `get_deployment` | Get specific deployment details |
| `get_deployment_build_logs` | Read build logs (debug failed deploys) |
| `get_runtime_logs` | Read runtime logs (console.log, errors in production) |
| `get_access_to_vercel_url` | Get temporary shareable link for protected deployments |
| `web_fetch_vercel_url` | Fetch a Vercel URL with auth |
| `check_domain_availability_and_price` | Check domain availability and pricing |
| `search_vercel_documentation` | Search Vercel docs |

### Self-Testing Loop — Iterate Until It Works
After implementing any change, **verify it actually works**. Do NOT mark a task as done based on "it should work" — prove it.

1. **After code edits**: Run `get_errors` to check for TypeScript/lint errors. If errors exist, fix them and check again. Loop until zero errors.
2. **After frontend changes**: Use Chrome DevTools MCP to:
   - Take a screenshot to verify the UI renders correctly
   - Check the browser console for errors (React warnings, failed fetches, undefined references)
   - Inspect network requests to verify Supabase calls succeed (no 401s, 500s, or malformed payloads)
   - If ANY issue is found → fix it → re-verify. Loop until clean.
3. **After Edge Function changes**: Deploy, then check Supabase logs via MCP for errors. Make a test call if possible. Verify the response shape matches what the frontend expects.
4. **After database migrations**: Run a SELECT query via Supabase MCP to verify the table/column/function was created correctly. Check row counts if migrating data.

**The loop:** `Edit → Check Errors → Fix → Check Errors → (repeat until 0 errors) → Verify in Chrome → Fix UI issues → Verify again → Done`

### Never Delete, Never Destroy
- **NEVER DROP a full database** — not in Supabase, not in MongoDB, not anywhere. Period.
- **NEVER truncate a production table** without explicit user confirmation and a backup plan.
- **NEVER delete user data** unless the user specifically requests it for a specific record.
- **Schema changes MUST go through migrations** (`mcp_supabase_apply_migration`) — never use `execute_sql` for DDL.
- **NEVER overwrite an entire file** when a targeted edit will do. Prefer `replace_string_in_file` over `create_file` for existing files.

### Never Assume — Always Verify
- **Don't guess column names** → Query the table schema via Supabase MCP
- **Don't guess API response shapes** → Read the Edge Function source code or check Supabase logs
- **Don't guess if a UI element renders** → Take a Chrome screenshot
- **Don't guess if old code had a feature** → Read the old codebase in `old-activeStore/`
- **Don't guess data values** → Run a SELECT query on live data
- **Don't guess library APIs** → Fetch docs via Context7 MCP
- If you discover something that contradicts what you expected, **stop and note it** before proceeding.

### Code Quality Standards
- **Root causes only** — never apply surface-level patches or band-aids. Find WHY it broke, not just what silences the error.
- **No temporary fixes** — if you write a workaround, it becomes permanent. Do it right the first time.
- **Senior engineer bar** — before finishing, ask yourself: "Would a staff engineer approve this code?" If not, refactor.
- **Keep functions small** — single responsibility. If a function does 3 things, split it.
- **DRY** — if the same logic appears twice, extract it. Shared utilities go in `lib/` or `utils/`.
- **No dead code** — don't leave commented-out code, unused imports, or TODO/FIXME debt without good reason.

### Self-Review Before Completion
Before presenting any non-trivial change to the user:
1. **Challenge your own work** — mentally review the diff. Look for edge cases, missing error handling, and unintended side effects.
2. **Ask: "Is there a more elegant way?"** — if the implementation feels hacky or over-complicated, step back and consider a cleaner approach.
3. **Check for regressions** — verify that related pages, components, and imports still work. Don't just test the changed file.
4. **Verify naming and consistency** — do new functions/variables follow existing patterns in the codebase?
5. **If you realize mid-implementation that the approach is wrong** — stop, discard the bad path, and re-implement correctly. Sunk cost is not a reason to keep bad code.

### Error Resolution — Don't Stop, Don't Ask
When you encounter an error:
1. **Read the full error message** — don't skim
2. **Identify the root cause** — don't apply surface-level patches
3. **Fix it** — make the actual correction
4. **Verify the fix** — re-run the check that caught the error
5. **If it's still broken** → go back to step 1. Loop up to 5 iterations.
6. **If 3+ iterations fail on the same approach** → the approach itself is wrong. Step back, re-architect, and try a fundamentally different solution.
7. **Only ask the user** if after 5 genuine fix attempts the issue requires information you truly cannot discover (API keys, business logic decisions, credentials).

### Subagent Strategy
- Use subagents for **research-heavy tasks** — keep the main context window clean
- Use subagents for **parallel exploration** — e.g., searching old codebase while checking Supabase schema
- One task per subagent for focused execution
- Subagent results should be concise — actionable findings only

### Plan Before Building
For any task with 3+ steps or architectural implications:
1. Use the todo list tool to break the task into specific, checkable steps
2. Mark each step in-progress before starting, completed immediately after finishing
3. If something goes wrong mid-plan, **stop and re-plan** — don't keep pushing a broken approach
4. For complex features, write a brief spec (requirements, edge cases, approach) before coding

### Progress Visibility
- For multi-step tasks, give brief progress updates so the user knows what's happening
- Don't go silent during long operations — confirm what was done and what's next
- When a task takes an unexpected turn (error, discovery, re-plan), explain why
- After completing all work, give a concise factual summary — not a wall of text

### Post-Change Checklist
After completing any user request, mentally verify:
- [ ] Zero TypeScript errors (`get_errors`)
- [ ] No console errors in Chrome (if frontend change)
- [ ] Network requests succeed (if wiring/API change)
- [ ] UI looks correct (Chrome screenshot if visual change)
- [ ] No regressions in related functionality
- [ ] Changes committed with a descriptive message


