# ProjectHub

A place to show people what you've been building.

ProjectHub is a student project showcase built for **Thirdspace**. It brings screenshots, source code, demos, and the people behind a project onto one page, so you can see what something does before digging into its repo.

**Live demo:** `ADD_DEMO_URL` *(placeholder)*

## A look around

Browse projects by category, technology, or semester.

![Project discovery with search, filters, and project cards](docs/screenshots/discover.png)

Add your project details and see a preview as you type.

![Project editor and live card preview](docs/screenshots/project-editor.png)

These screenshots use sample projects from browser tests. A fresh database starts empty.

## What it does

- Publish, edit, and delete your own projects.
- Upload up to six screenshots: PNG, JPEG, or WebP, up to 5 MB each.
- Search projects and sort by newest or most liked.
- Create a public profile, credit registered teammates, and like projects.
- Show languages, stars, forks, and update dates from public GitHub repositories.
- Register with email verification and recover forgotten passwords.
- Optionally generate a description draft, review it, and edit it before publishing.

## How it's built

| Part | Tools |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, React Router |
| Styling | Plain CSS, Lucide icons |
| Backend | Node.js, Express 5, Zod |
| Database | PostgreSQL 17, Prisma 6 |
| Accounts | JWT, bcryptjs, Nodemailer |
| Integrations | Cloudinary, GitHub REST API, OpenAI |
| Testing | Vitest, Supertest, Playwright |

The client and server are separate npm apps. Express routes pass requests through services and repositories, with Prisma handling database queries.

A few implementation details matter: only owners can change projects, credited teammates don't get editing access, and the database allows one like per account per project. Browser tests check layouts at phone, tablet, and desktop sizes.

## Run it locally

### 1. Prerequisites

Install [Node.js](https://nodejs.org/) **22.12+**, [Git](https://git-scm.com/downloads), and [Docker](https://www.docker.com/products/docker-desktop/) with Compose and Linux containers enabled.

You'll also need working SMTP credentials to complete email verification. The example below uses Gmail.

### 2. Clone and start the database

```sh
git clone https://github.com/swaznil/project1.git
cd project1
docker compose up -d
docker compose ps
```

Wait for PostgreSQL to show as healthy. It runs on `localhost:5434`; Docker runs only the database.

### 3. Set up the backend

From the repository root:

```sh
cd server
npm ci
npm run setup:env
npm run db:generate
npm run db:deploy
```

The setup script creates both `.env` files and generates JWT secrets without overwriting existing files. Database settings already match Docker Compose.

Edit `server/.env`:

```dotenv
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-google-app-password
SMTP_FROM=ProjectHub <your-email@gmail.com>
```

Use a [Google app password](https://support.google.com/accounts/answer/185833), not your normal password. Keep `.env` files private.

Still in `server/`, start the API:

```sh
npm run dev
```

Check [localhost:5000/api/v1/health](http://localhost:5000/api/v1/health).

### 4. Start the frontend

Open another terminal **at the repository root**:

```sh
cd client
npm ci
npm run dev
```

Visit **[localhost:5173](http://localhost:5173)**. Register, verify your email, log in, and choose **Share a project**.

Use `localhost` consistently. The generated client configuration uses `VITE_API_URL=/api/v1`; Vite proxies requests to port 5000.

### Optional integrations

Set these in `server/.env`, then restart the backend:

| Feature | Variables |
| --- | --- |
| Screenshots | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` |
| AI drafts | `OPENAI_API_KEY`, optionally `OPENAI_MODEL` |
| Higher GitHub API limits | `GITHUB_TOKEN` |

Without these, you can still publish text-only projects and write descriptions yourself. Public GitHub lookups work without a token within the unauthenticated limit. AI requests may incur charges. Never put service secrets in `VITE_` variables.

## Builds and tests

Build the frontend from `client/`:

```sh
npm run build
```

Output goes to `client/dist/`. Build and run the backend from `server/`:

```sh
npm run build
npm start
```

With PostgreSQL running, prepare the test database and run backend checks from `server/`:

```sh
npm run db:test:setup
npm run typecheck
npm test
```

Then run browser checks from `client/`:

```sh
npm run typecheck
npx playwright install chromium
npm run test:e2e
```

Tests clear `projecthub_test`. Run the suites sequentially because they share it. Playwright starts its own servers on ports 5001 and 5174. External services are mocked; real email delivery and uploads need separate verification.

## Troubleshooting

- **Database connection fails:** check `docker compose ps` and port 5434.
- **No verification email:** fix SMTP settings, restart the backend, and request another verification email from the login screen.
- **API requests fail:** check port 5000 and `VITE_API_URL=/api/v1`.
- **Port 5173 is busy:** stop the conflicting process; Vite won't switch ports automatically.

Stop PostgreSQL with `docker compose down`. Data stays in its volume; adding `-v` deletes it.
