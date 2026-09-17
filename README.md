# ProjectHub

A place for college students to showcase what they build. GitHub stores the code; ProjectHub gives the project a home, with screenshots, a description, technologies, teammates, and links to try it.

## Features

- Email/password registration, email verification, login, rotating refresh sessions, logout, and password recovery.
- Public student profiles with a bio, avatar URL, social links, projects, and real like totals.
- Owner-controlled project creation, editing, and deletion; registered student collaborators.
- Up to six Cloudinary screenshots per project, with a selectable gallery and cover image.
- Discovery with title/description/category/technology search; category, technology, semester, and owner filters; recent/popular sorting; server pagination.
- Like/unlike with database-enforced uniqueness.
- Public GitHub repository metadata, languages, stars, forks, and last update.
- OpenAI description suggestions that students review and edit before saving.
- Responsive interface with loading, empty, error, success, and disabled states.

The development database starts empty. There are no fabricated projects, accounts, statistics, or production API responses. Optional integrations fail with actionable messages when unconfigured.

## Tech stack

React 19, Vite, TypeScript, React Router, native Fetch, plain CSS, and Lucide icons on the frontend. Node.js, Express 5, PostgreSQL 17, Prisma 6, JWT, bcryptjs, Zod, Nodemailer/Gmail SMTP, Cloudinary, the GitHub REST API, and the official OpenAI Node SDK on the backend. Vitest, Supertest, and Playwright provide automated verification.

Prisma 6 is intentionally used with its stable schema-based connection configuration. The lockfile includes a patched `deepmerge-ts` override for Prisma's configuration dependency. There is no Redis, queue, OAuth, microservice, or production deployment configuration.

## Architecture

```text
React pages → API layer → Express routes → controllers → services
                                                        ↓
                                                   repositories
                                                        ↓
                                                   Prisma → PostgreSQL

Services → Nodemailer / Cloudinary / GitHub / OpenAI
```

Controllers parse input and format responses; services apply business rules; repositories own database queries. External integrations have focused service/provider modules. The frontend uses React context for the current user, in-memory access tokens, and local component state. API calls and refresh handling are centralized.

Access JWTs last 15 minutes; refresh JWTs last seven days and use HttpOnly, SameSite=Lax cookies. Refresh tokens rotate atomically, are hashed in PostgreSQL, and are revoked on logout/password reset. Each access token references a live session. Verification/reset emails contain random 256-bit tokens, hashed in the database and valid for 30 minutes. Links are consumed once. Requests have IP limits and email issuance has a one-minute account cooldown.

Profiles expose only public fields. Project owners are separate from team members. Technologies, screenshots, members, and likes are relational, with foreign keys, indexes, uniqueness, and appropriate cascading behavior. Uploaded screenshot IDs must belong to the current user and cannot be attached to somebody else's project.

## Project structure

```text
projecthub/                    # this repository (its folder name may differ)
├── client/
│   ├── src/
│   │   ├── api/               # typed API client and refresh handling
│   │   ├── components/        # cards, gallery inputs, feedback, team search
│   │   ├── hooks/             # auth context and abortable async loading
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── types/
│   │   └── styles.css
│   ├── tests/                 # browser journeys
│   └── .env.example
├── server/
│   ├── prisma/                # schema and committed initial migration
│   ├── src/
│   │   ├── config/
│   │   ├── lib/               # Prisma client and reusable email delivery
│   │   ├── middlewares/
│   │   ├── modules/           # auth, users, projects, likes, github, uploads
│   │   ├── utils/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── scripts/               # safe local env and test DB setup
│   ├── tests/                 # API integration and provider tests
│   ├── DESIGN.md
│   └── .env.example
├── docker-compose.yml
├── README.md
└── .gitignore
```

## Prerequisites

- Node.js **22.12 or later** and npm.
- Docker with the Compose plugin, running Linux containers.
- A Gmail account with an app password to deliver registration and reset emails.
- Optional Cloudinary and OpenAI credentials for uploads and AI writing.

The client and server run locally; Docker runs only PostgreSQL. Use **localhost** consistently in the browser so cookies, CORS, and email links agree.

## PostgreSQL setup

From the repository root:

```sh
docker compose up -d
docker compose ps
```

PostgreSQL is exposed at **localhost:5434** (container port 5432), avoiding the common local 5432 conflict. Development-only credentials are explicitly declared in Compose:

```text
User: projecthub
Password: projecthub
Database: projecthub
```

The named `projecthub_data` volume preserves data between restarts. `docker compose down` stops the database without removing the volume. Do not use `down -v` unless you intend to erase the local database.

## Server setup

```sh
cd server
npm install
npm run setup:env
npx prisma generate
npx prisma migrate deploy
npm run dev
```

`setup:env` creates both local `.env` files if absent and generates independent random JWT secrets. It never overwrites existing files. **Before registering**, fill `SMTP_USER` and `SMTP_PASS` in `server/.env`, then restart the server. The API runs at [localhost:5000/api/v1](http://localhost:5000/api/v1/health).

The committed migration is enough for a fresh database. When changing the schema, create and apply a new migration with:

```sh
npx prisma migrate dev --name describe_your_change
```

For a compiled backend:

```sh
npm run build
npm start
```

The server binds to loopback for local development. Production hosting is deliberately outside this project; review hosting, TLS, proxy, and cookie configuration before deploying.

## Client setup

Open a second terminal:

```sh
cd client
npm install
npm run dev
```

Visit [localhost:5173](http://localhost:5173). The environment file is created by `server`'s setup command. It contains:

```dotenv
VITE_API_URL=/api/v1
```

Vite proxies `/api` to the backend at `http://localhost:5000`, so local browser requests are same-origin and work whether the machine resolves loopback as IPv4 or IPv6. Vite's port is fixed to 5173. If it is already occupied, stop the conflicting process or change the Vite port, `CLIENT_URL`, and email links together. For a production build, configure the web server to proxy `/api` to the backend, or set `VITE_API_URL` to the public API URL before building. The client can also be built with `npm run build` and served with `npm run preview`; configure the backend `CLIENT_URL` for the preview origin if using that mode.

## Gmail / Nodemailer setup

1. Enable 2-Step Verification on the Gmail account used to send mail.
2. Create a Google **App Password** for this application. App passwords may be unavailable on managed accounts or accounts with certain security policies.
3. Configure the server environment:

```dotenv
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-sending-account@gmail.com
SMTP_PASS=your-google-app-password
SMTP_FROM=ProjectHub <your-sending-account@gmail.com>
```

Use an app password, not your normal Google password. Port 465 uses implicit TLS; port 587 uses STARTTLS. Never commit this file. Reference: [Google's app-password instructions](https://support.google.com/accounts/answer/185833).

Registration creates an unverified user and sends a verification link. The recipient opens the link and clicks **Verify email**, then logs in with their password. If SMTP was unavailable during registration, the account remains unverified; configure SMTP and use **Need a verification email?** on the login screen. Forgot-password and resend responses stay generic to avoid revealing whether an account exists. No tokens are printed to application logs.

## Cloudinary setup

Create a Cloudinary account and copy the cloud name, API key, and API secret into the server environment. Uploads use the server-side SDK, so no unsigned upload preset or client-side secret is needed.

```dotenv
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

Uploads accept PNG, JPEG, or WebP, validate image signatures, and cap each file at 5 MB. Cloudinary limits dimensions to 1920×1920 while preserving aspect ratio. Images are stored under `projecthub/<user-id>`; PostgreSQL stores their URLs, public IDs, dimensions, ownership, and project relation. The first screenshot becomes the cover. Removing a screenshot from the project form takes effect when the project is saved. Detached upload records/assets are retained, allowing safe project edits; the authenticated upload DELETE API permanently deletes an owned asset. Cancelled drafts may leave unattached uploads, which can be removed with that API or Cloudinary's console.

Without credentials, publishing without screenshots still works; the upload control reports configuration is unavailable.

## GitHub API

Paste a public repository URL such as `https://github.com/owner/repository`. The server validates the URL and requests repository metadata and languages from `https://api.github.com`. No GitHub OAuth is used.

`GITHUB_TOKEN` is optional and can improve the upstream API rate limit. Private repositories remain unsupported even if the configured token can access them. Invalid, missing, private, rate-limited, and unavailable repositories produce clear messages without breaking the rest of the showcase.

## OpenAI

Configure `OPENAI_API_KEY` and optionally `OPENAI_MODEL` (default `gpt-4.1-mini`). The official Node SDK calls the [Responses API](https://developers.openai.com/api/reference/resources/responses/methods/create). The request contains the title, category, technology list, and rough description, with `store: false`. No project is saved automatically.

Write a title and at least ten characters of rough description, choose **Generate with AI**, review the suggested text, and choose **Use this draft**. You can continue editing before publishing. Provider timeouts/failures and missing configuration are shown inline; manual writing remains available. Real requests may incur OpenAI charges; automated tests do not consume credits.

## Environment variables

All server configuration lives in `server/.env`. Real secrets and local environments are ignored by Git.

| Variable | Purpose / development default |
| --- | --- |
| `NODE_ENV` | `development`; `production` enables secure refresh cookies |
| `PORT` | API port, `5000` |
| `CLIENT_URL` | Allowed browser origin and email-link origin, `http://localhost:5173` |
| `DATABASE_URL` | `postgresql://projecthub:projecthub@localhost:5434/projecthub?schema=public` |
| `TEST_DATABASE_URL` | Same connection with database `projecthub_test` |
| `JWT_ACCESS_SECRET` | Random access-token signing secret, at least 32 characters |
| `JWT_REFRESH_SECRET` | Different random refresh-token signing secret, at least 32 characters |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `465` |
| `SMTP_USER` | Sending Gmail address |
| `SMTP_PASS` | Gmail app password |
| `SMTP_FROM` | Optional sender label/address; defaults to SMTP user |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary server API key |
| `CLOUDINARY_API_SECRET` | Cloudinary server API secret |
| `GITHUB_API_URL` | `https://api.github.com` |
| `GITHUB_TOKEN` | Optional server GitHub token |
| `OPENAI_API_KEY` | Optional OpenAI key |
| `OPENAI_MODEL` | `gpt-4.1-mini`, configurable for your account |
| `VITE_API_URL` | Client-only variable in `client/.env`; `/api/v1` for the local Vite proxy |

Do not put any service secret in a `VITE_` variable; those values are public browser configuration.

## API reference

Base path: `/api/v1`. Success: `{ "success": true, "data": ... }`. Errors: `{ "success": false, "message": "..." }`, with validation details when appropriate. No stack traces or database errors are exposed. Protected endpoints accept `Authorization: Bearer <accessToken>`; refresh/logout use the cookie.

| Method | Path | Behavior |
| --- | --- | --- |
| GET | `/health` | API liveness |
| POST | `/auth/register` | `{name,email,password}`; send verification |
| POST | `/auth/verify-email` | `{token}`; consume email token |
| POST | `/auth/resend-verification` | `{email}` |
| POST | `/auth/login` | `{email,password}`; access token, user, refresh cookie |
| POST | `/auth/refresh` | Rotate cookie and return access token/user |
| POST | `/auth/logout` | Revoke session and clear cookie |
| POST | `/auth/forgot-password` | `{email}`; generic response |
| POST | `/auth/reset-password` | `{token,password}`; revoke existing sessions |
| GET | `/auth/me` | Current account (protected) |
| GET | `/users?search=Sam` | Verified users by name/username (protected) |
| GET | `/users/:username` | Public profile and totals |
| PATCH | `/users/me` | Edit current profile (protected) |
| GET | `/projects/options` | Controlled categories and published technologies |
| GET | `/projects` | Paginated discovery |
| POST | `/projects` | Publish project (protected) |
| GET | `/projects/:id` | Project and gallery/team; personal like status if authenticated |
| PATCH | `/projects/:id` | Partial owner-only update |
| DELETE | `/projects/:id` | Owner-only deletion |
| POST / DELETE | `/projects/:id/like` | Like/unlike (protected, idempotent) |
| POST | `/projects/generate-description` | Suggest text for a new project (protected) |
| POST | `/projects/:id/generate-description` | Suggest text for an existing project (owner-only) |
| GET | `/github/repository?url=...` | Public repository metadata |
| POST | `/uploads` | Multipart field `image`, owned upload (protected) |
| DELETE | `/uploads/:id` | Permanently remove owned Cloudinary image (protected) |

Discovery parameters: `search`, `category`, `technology`, `semester`, `owner` (username), `sort=recent|popular`, `page` (default 1), `limit` (default 12, maximum 24). The result includes `items`, `total`, `page`, and `pages`.

Project bodies include `title`, `description`, `category`, `semester`, `githubUrl`, `demoUrl`, `technologies` (names), `memberIds` (registered verified user UUIDs), and `screenshotIds` (owned upload UUIDs). Technologies are normalized to lowercase. Semester is 1–12, description is 20–10,000 characters, and title is 3–100 characters. Up to 15 technologies, 12 collaborators, and 6 screenshots are allowed. Only HTTP(S) links are accepted.

## Testing

The backend was built and verified before the frontend. API tests run against **real PostgreSQL** in a separate `projecthub_test` database. They refuse any other database name and clear that test database. Never point tests at valuable data. Do not run backend integration tests and browser tests simultaneously, as they share the test database.

```sh
# From server/, with Docker PostgreSQL already running
npm run db:test:setup
npm run typecheck
npx prisma validate
npm test
```

Coverage includes registration, duplicates, credential validation, verified-account enforcement, expiring/single-use links, resend cooldown, password reset, refresh replay, logout revocation, profile updates, project CRUD and ownership, team membership, screenshot ownership, search/filter/pagination, likes/uniqueness, upload validation, rate limits, structured errors, and external-provider success/failure. Email, GitHub, Cloudinary, and OpenAI are mocked in tests.

Browser journeys use the actual React UI, Express application, Prisma repositories, and test PostgreSQL database. The **test-only** server harness supplies controlled email, image, GitHub, and AI providers; it is excluded from the production build and guarded to the test database. Browser tests cover the complete student journey, password recovery, and mobile overflow checks.

```sh
# From client/ (install server dependencies and prepare test DB first)
npx playwright install chromium
npm run test:e2e
npm run build
```

Playwright automatically starts the test backend on 5001 and Vite on 5174 and stops both after testing. Screenshots and failure traces go to ignored `client/test-results/`.

### Live integration verification

Automated checks do not prove delivery to a real Gmail inbox, storage in your Cloudinary account, or successful billing/model access on your OpenAI account. Configure those credentials, restart the backend, then use this flow to verify your account configuration:

1. Register, receive the Gmail message, open the verification link, and verify.
2. Log in, edit the profile, and create a project.
3. Upload screenshots, add a public GitHub repository, and generate/review a description.
4. Publish, search/filter for the project, like it, and view the author profile.
5. Edit the project, remove a screenshot, reload to confirm persistence, and log out.
6. Request a reset email and confirm the old password/session no longer works.

## Development commands

| Directory | Command | Purpose |
| --- | --- | --- |
| Root | `docker compose up -d` | Start local PostgreSQL |
| Root | `docker compose ps` | Check database health |
| Root | `docker compose down` | Stop PostgreSQL, retain data |
| Server | `npm run setup:env` | Create local configuration safely |
| Server | `npm run dev` | Watch TypeScript backend |
| Server | `npm run build` / `npm start` | Compile/run backend |
| Server | `npm run typecheck` | Check source and tests |
| Server | `npm run db:generate` | Generate Prisma client |
| Server | `npm run db:migrate -- --name change_name` | Create/apply migration |
| Server | `npm run db:deploy` | Apply committed migrations |
| Server | `npm run db:test:setup` | Create/migrate isolated test database |
| Server | `npm test` | Backend suite |
| Client | `npm run dev` | Vite development server |
| Client | `npm run typecheck` | Frontend TypeScript check |
| Client | `npm run build` | Production bundle |
| Client | `npm run preview` | Local production-bundle preview |
| Client | `npm run test:e2e` | Browser journeys |

## Troubleshooting

- **Cannot reach ProjectHub:** start the backend and database; confirm the three ports and `VITE_API_URL`.
- **Database connection refused:** check `docker compose ps`, wait for health, and confirm host port 5434.
- **Account created but email failed:** fix Gmail credentials, restart, and request a new verification link; do not register the same address again.
- **Unexpected logout or cookie problems:** use localhost consistently and keep `CLIENT_URL` aligned with Vite. Development uses non-secure cookies on HTTP; production requires HTTPS.
- **AI or upload unavailable:** add the corresponding credentials and restart. Normal project editing still works.
- **GitHub rate limit:** wait for the limit to reset or configure a server-side token.
- **No projects:** this is intentional for a new database. Create and publish your own first project.

Google Fonts enhance typography; local sans-serif fallbacks keep the interface usable when fonts cannot load.
