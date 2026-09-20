# ProjectHub team plan

Goal: Swap, Sam, and Sus learn the complete project by building and explaining their own parts, keeping the same features and architecture.

**Starting point:** this repository already contains the implementation and its Git history. Keep that history and acknowledge the starting code/help. Use the milestones below for a genuine learning rebuild in a separate workspace, or for real improvements to the existing code. Do not delete/re-add unchanged files, invent authors/dates, or make empty commits to simulate development. The `feat` messages below apply when you actually implement that feature; on the existing project, describe the actual fix, test, or documentation change instead. Reading unchanged code needs no commit.

## 1. Ownership and workload

| Person | Primary responsibility | Planned checkpoints | Reviews |
| --- | --- | --- | --- |
| Swap | App shell, discovery, project screens, profile UI, responsive styling | 3 branches, 6 commits | Sus's work |
| Sam | Database, Express foundation, authentication, project/profile/like APIs | 3 branches, 6 commits | Swap's work |
| Sus | Browser auth/API wiring, uploads, GitHub/AI integration, browser tests | 3 branches, 6 commits | Sam's work |

These are equal-sized responsibility tracks, not a promise of equal hours. Sam's auth/database work is heavier early; Sus's integration work and Swap's editor work are heavier later. At each round's demo, move one unfinished subtask to whoever has capacity and record that handoff in the PR. Pair when useful and credit actual contributions; commit count is not a score.

## 2. Before coding together

1. Each person uses their own clone, Git account, name, and verified email. Follow `README.md` to run the project locally.
2. Read `README.md` and `server/DESIGN.md` together. Trace one request: page -> API client -> route -> controller -> service -> repository -> PostgreSQL.
3. Agree on the existing API shapes in `README.md` and `client/src/types/index.ts`: response envelopes, fields, validation, pagination, auth cookies, and error messages.
4. If rebuilding, retain the original as a reference and record its origin in the new workspace's README. Bootstrap only the configuration needed for each milestone; do not import the whole implementation and present staged copies as newly written work.
5. Start each round after the previous round is merged. Within a round, work in parallel against the agreed API contract; wait for dependencies before the integrated demo.

Paths below are relative to the repository root. `modules/auth/*`, for example, means that module's existing controller, service, repository, routes, and validation files. **Create files only where absent in a rebuild; otherwise edit the existing files.**

## 3. Round 1 — foundation and working login

### Swap — `codex/swap-01-shell`

- **Commit 1:** `chore(client): scaffold React app and shared layout` — `client/package.json`, `client/package-lock.json`, `client/tsconfig.json`, `client/vite.config.ts`, `client/index.html`, `client/public/favicon.svg`, `client/src/main.tsx`, `client/src/App.tsx`, `client/src/layouts/Layout.tsx`, `client/src/styles.css`. Build a runnable shell; initially register only implemented screens.
- **Commit 2:** `feat(ui): add reusable feedback and project card components` — `client/src/components/Avatar.tsx`, `Feedback.tsx`, `ProjectCard.tsx`, `Pagination.tsx`, plus their styles. Use the agreed project/user types; avoid links to unfinished routes in the merged UI.
- **Done/explain:** shell works on desktop/mobile; explain props, routing, component reuse, and loading/empty/error states.

### Sam — `codex/sam-01-server-auth`

- **Commit 1:** `chore(server): configure Express and PostgreSQL persistence` — `docker-compose.yml`, `.gitignore`, `server/package.json`, `server/package-lock.json`, `server/tsconfig.json`, `server/.env.example`, `server/src/config/env.ts`, `lib/prisma.ts`, `app.ts`, `server.ts`, `middlewares/error.ts`, `middlewares/limits.ts`, `utils/errors.ts`, `utils/validation.ts`, `server/prisma/schema.prisma`, `server/prisma/migrations/`. Define the shared data model and a working health endpoint; mount only implemented routes.
- **Commit 2:** `feat(auth): implement verified accounts and rotating sessions` — `server/src/modules/auth/*`, `server/src/lib/mail.ts`, `server/src/utils/tokens.ts`, `server/src/middlewares/auth.ts`, auth mounting in `app.ts`. Include verification, resend, login, refresh, logout, and password recovery, with relevant cases in `server/tests/api.test.ts`.
- **Done/explain:** register -> verify -> login -> refresh -> logout; reset invalidates sessions. Explain hashing, cookie vs access token, and single-use tokens. Sus provides the test harness below before API checks run.

### Sus — `codex/sus-01-client-auth`

- **Commit 1:** `chore(dev): add local setup and API test harness` — `server/scripts/setup-env.mjs`, `setup-test-db.mjs`, `server/vitest.config.ts`, `server/tsconfig.tests.json`, `server/tests/setup.ts`, `client/.env.example`, `client/src/types/index.ts`. Coordinate package scripts with Sam; types follow the agreed contract.
- **Commit 2:** `feat(auth-ui): connect account forms and session state` — `client/src/api/http.ts`, auth methods in `client/src/api/index.ts`, `client/src/hooks/useAuth.tsx`, `client/src/pages/Auth.tsx`. After Swap's shell lands, add the provider, auth routes, and protection in `client/src/App.tsx`; coordinate navigation changes with Swap.
- **Done/explain:** forms handle errors, refresh restores a session, logout clears it; explain context, request retries, and why secrets stay on the server.

**Integration order:** Sam's foundation + Sus's setup/types + Swap's shell first; then server auth and browser auth. If one checkpoint is needed early, open a smaller PR for it from the same branch. Finish the round with a real browser login demo.

## 4. Round 2 — publish and discover projects

### Swap — `codex/swap-02-projects`

- **Commit 1:** `feat(discover): add project search filters and pagination` — `client/src/pages/Discover.tsx`, `client/src/hooks/useLoad.ts`, `client/src/components/ProjectCard.tsx`, `Pagination.tsx`, discovery styles, and the discovery route in `App.tsx`. Use Sus's project API methods.
- **Commit 2:** `feat(project-ui): add project editor and detail views` — `client/src/pages/ProjectEditor.tsx`, `ProjectDetails.tsx`, `client/src/components/TeamPicker.tsx`, project styles, and project routes in `App.tsx`. Start with manual descriptions and projects without screenshots; wire Sus's picker once ready.
- **Done/explain:** create -> discover -> open -> edit -> delete works; explain controlled forms, query parameters, cancellation, and owner controls.

### Sam — `codex/sam-02-core-api`

- **Commit 1:** `feat(projects): add validated project CRUD and discovery` — `server/src/modules/projects/projects.controller.ts`, `projects.service.ts`, `projects.repository.ts`, `projects.routes.ts`, `projects.validation.ts`, project mounting in `server/src/app.ts`, project cases in `server/tests/api.test.ts`. Include team/screenshot ownership checks, search, filters, sorting, pagination, and options.
- **Commit 2:** `feat(users): add profiles member search and project likes` — `server/src/modules/users/*`, `server/src/modules/likes/*`, like wiring in `projects.routes.ts`, user mounting in `app.ts`, profile/like cases in `server/tests/api.test.ts`.
- **Done/explain:** another user cannot edit/delete a project or attach somebody else's images; duplicate likes are prevented. Explain joins, validation, ownership, and database constraints.

### Sus — `codex/sus-02-uploads`

- **Commit 1:** `feat(client-api): add typed project profile and upload requests` — non-AI/non-GitHub methods in `client/src/api/index.ts`, any agreed additions to `client/src/types/index.ts`. Land this early so Swap can connect the screens.
- **Commit 2:** `feat(uploads): add owned screenshot uploads and selection` — `server/src/modules/uploads/*`, upload mounting in `server/src/app.ts`, `client/src/components/ScreenshotPicker.tsx`. Add focused cases in **new** `server/tests/uploads.test.ts`; reuse the test setup. Coordinate picker props with Swap, who wires it into the editor.
- **Done/explain:** valid images upload; invalid/oversized files and another user's assets are rejected; cover selection persists. Explain multipart data and Cloudinary vs database ownership.

**Integration order:** typed requests -> core APIs -> project screens; uploads can proceed alongside core APIs once Round 1's schema exists. Demo with two accounts to prove ownership and likes, not just the happy path.

## 5. Round 3 — integrations, profiles, and release checks

### Swap — `codex/swap-03-profile-polish`

- **Commit 1:** `feat(profile-ui): add public profiles editing and likes` — `client/src/pages/Profile.tsx`, `client/src/components/LikeButton.tsx`, profile routes in `App.tsx`, like wiring in `ProjectCard.tsx` and `ProjectDetails.tsx`, related styles.
- **Commit 2:** `feat(project-ui): connect repository previews and AI drafts` — wire Sus's `RepositoryInfo.tsx` and API methods into `ProjectEditor.tsx` / `ProjectDetails.tsx`; finish `ScreenshotPicker.tsx` wiring and responsive states in `styles.css`. Keep AI suggestions editable and require explicit acceptance.
- **Done/explain:** profile edits and like counts persist; editor stays usable when providers fail; keyboard controls and narrow screens work. Explain derived state and suggested vs saved content.

### Sam — `codex/sam-03-api-verification`

- **Commit 1:** `test(api): cover session ownership and rate-limit edge cases` — `server/tests/api.test.ts`, `server/tests/limits.test.ts`, and targeted backend fixes if tests reveal defects. Cover expired/reused tokens, refresh replay, unauthenticated writes, invalid membership, and pagination boundaries; do not duplicate existing coverage just to create a commit.
- **Commit 2:** `docs(api): document data model and backend request flows` — `server/DESIGN.md`, backend/API/testing portions of `README.md`. Describe actual schema relations, validation, session lifecycle, and test setup from your own understanding.
- **Done/explain:** server checks pass; walk both teammates through one successful write and one rejected request, including the database effect.

### Sus — `codex/sus-03-integrations-e2e`

- **Commit 1:** `feat(integrations): add GitHub metadata and AI description drafts` — `server/src/modules/github/*`, `server/src/modules/projects/ai.service.ts`, `client/src/components/RepositoryInfo.tsx`, GitHub/AI methods in `client/src/api/index.ts`, `server/tests/github.test.ts`, **new** `server/tests/ai.test.ts`. Coordinate GitHub mounting in `app.ts` and AI endpoints in `projects.controller.ts` / `projects.routes.ts` with Sam. Include missing-config and provider-error behavior.
- **Commit 2:** `test(e2e): verify student journey recovery and mobile layouts` — `server/tests/e2e-server.ts`, `client/playwright.config.ts`, `client/tests/flows.spec.ts`, `client/tests/layout.spec.ts`; coordinate test scripts with package owners. Verify real app journeys using mocked providers and the isolated test database.
- **Done/explain:** register through publish/edit/like/logout, recovery, and mobile checks pass. Explain provider mocks and what still requires live-account verification.

**Integration order:** Sus's provider/API commit -> Swap's integration wiring -> Sus's browser tests. Sam verifies the final integrated backend. Run API and browser suites sequentially because they share the test database.

## 6. Branch and commit routine

Use **one branch per person per round**, not one branch per file or commit. Each branch normally contains the two checkpoints listed above; smaller meaningful commits are fine. No fixed daily commit quota.

Example for Swap, from the repository root with a clean working tree:

```sh
git switch main
git pull --ff-only origin main
git switch -c codex/swap-01-shell
# Implement one complete checkpoint, then run its checks.
git status --short
git diff
git add client/src/main.tsx client/src/App.tsx client/src/layouts/Layout.tsx
# Add the other intended files explicitly too; inspect the complete staged change.
git diff --cached
git commit -m "chore(client): scaffold React app and shared layout"
git push -u origin codex/swap-01-shell
```

- Before committing: the change does one explainable thing, the relevant checks pass, and only intended files are staged. Never commit `.env`, credentials, `node_modules`, builds, or test output. Include package/lockfile changes together when dependencies change.
- When another PR lands, commit your work first, then run `git fetch origin` and `git merge origin/main` on your feature branch. Resolve conflicts together with the file owner and rerun affected checks; never blindly choose all of one side.
- Open a PR to `main`: **what changed / files and behavior / checks run / one thing learned**. The assigned reviewer must run or inspect it and ask the author to explain one request path.
- Merge only runnable, reviewed checkpoints. Use a merge commit if you want the individual learning commits preserved. After merge, start the next branch from updated `main`.
- Use your real identity and normal timestamps. Add a co-author trailer only for someone who actually helped write the change. Adjust the example message to match the actual diff.

## 7. Avoid conflicts and finish fairly

| Shared file | Coordinator / rule |
| --- | --- |
| `client/src/styles.css`, `App.tsx`, `ProjectEditor.tsx` | Swap; Sus schedules auth wiring after the shell, then hands routing back |
| `client/src/api/*`, `client/src/types/index.ts` | Sus; agree contract changes with Sam before UI use |
| `server/src/app.ts`, project routes/controller, schema/migrations | Sam; Sus coordinates integration edits after Sam's current changes merge |
| Package files and lockfiles | Swap for client, Sam for server; Sus requests required scripts/dependencies |
| `server/tests/api.test.ts` | Sam; Sus keeps provider/upload cases in separate files |
| `README.md` | Sam edits backend sections; Swap supplies UI notes; Sus supplies setup/provider notes after Sam merges |
| `TEAM_PLAN.md` | Round reviewer updates completed milestones and handoffs in one PR |

Keep the committed initial migration intact in this repository; actual schema changes get a new migration. In a fresh rebuild, generate its initial migration from the schema rather than manually copying a timestamped folder.

**Checks before each PR:** frontend changes: `npm --prefix client run typecheck` and `npm --prefix client run build`; backend changes: `npm --prefix server run typecheck`, `npm --prefix server run build`, and relevant API tests. For schema changes, run `npx prisma validate` from `server/` and verify migrations on the isolated test database.

**Final checks:** with Docker running and dependencies installed, run `npm --prefix server run db:test:setup`, then `npm --prefix server test`, then `npm --prefix client run test:e2e` (install Playwright Chromium first per README). Test setup clears `projecthub_test`; never use valuable data. Finish with both production builds and README's live-provider checklist when credentials are available. Record unavailable live checks honestly.

**Learning rule:** before a PR merges, its author gives a five-minute explanation without reading the source line by line: input, state, request, validation, storage, response, and failure behavior. At the end, Swap explains an API flow, Sam explains a UI flow, and Sus explains the complete publish flow. Everyone should be able to run and demonstrate the whole project.
