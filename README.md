# ProjectHub

A place to show people what you've been building.

hey! we're a team of three building ProjectHub for **Thirdspa**, a Hack Club event. It's a project showcase for students: put your screenshots, source code, demo, and teammates on one page, then explore what other people are making.

**Live demo:** `ADD_DEMO_URL` *(placeholder)*

[Run it locally](#run-it-locally) · [Screenshots](#a-look-around) · [Development guide](docs/DEVELOPMENT.md)

## What's the idea?

A repo tells you how a project works, but sometimes you just want to see what it does. ProjectHub puts that part up front. You can browse projects, open a demo, check out the code, and find the people behind it.

It works for solo projects and group builds. Each project has an owner who manages the page, with space to credit registered teammates too.

> **Our story:** [Add a few lines about what made the three of us want to build this.]

## A look around

The discovery page has search, category filters, and sorting by newest or most liked.

![ProjectHub discovery page with project cards and filters](docs/screenshots/discover.png)

The editor lets you add your description, screenshots, links, and team, with a preview as you type.

![Project editor with a draft and live card preview](docs/screenshots/project-editor.png)

These screenshots come from our browser layout tests and use sample projects. A fresh local database starts empty.

## What you can do

- **Share a project.** Add a description, category, semester, technologies, GitHub link, and demo link. Edit or delete it later.
- **Show it off.** Upload up to six screenshots. The first image becomes the cover.
- **Find something interesting.** Search projects, filter by category, technology, or semester, and sort by newest or most liked.
- **Give people credit.** Add registered teammates and visit their public profiles.
- **Leave a like.** Like a project, or remove your like later.
- **See repository details.** Public GitHub repos can show languages, stars, forks, and their last update.
- **Get help with a description.** An optional AI tool suggests a draft for you to review and edit before publishing.

Accounts use email verification, and there's a password reset flow for when you inevitably forget yours.

## What we used

| Part | Tools |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, React Router |
| Styling | Plain CSS and Lucide icons |
| Backend | Node.js, Express 5, TypeScript, Zod |
| Database | PostgreSQL 17 and Prisma 6 |
| Accounts | JWT sessions, bcryptjs, Nodemailer |
| Integrations | Cloudinary, GitHub REST API, OpenAI |
| Tests | Vitest, Supertest, Playwright |
| Local database | Docker Compose |

The frontend and backend are separate npm apps. Requests go from React to Express, through a service, and into PostgreSQL through Prisma. More details are in the [development guide](docs/DEVELOPMENT.md#architecture).

## Run it locally

### You'll need

- [Node.js](https://nodejs.org/) **22.12 or newer**, with npm.
- [Git](https://git-scm.com/downloads).
- [Docker](https://www.docker.com/products/docker-desktop/) with Compose and Linux containers enabled.
- A Gmail account with an app password for verification and reset emails. The app can start without it, but you need working email to finish signing up.

### 1. Clone the repo and start PostgreSQL

```sh
git clone https://github.com/swaznil/project1.git
cd project1
docker compose up -d
docker compose ps
```

Wait until PostgreSQL shows as healthy. Docker only runs the database; we'll start the app separately.

### 2. Set up the backend

From the repository root:

```sh
cd server
npm ci
npm run setup:env
npm run db:generate
npm run db:deploy
```

The setup command creates `server/.env` and `client/.env`, generates JWT secrets, and keeps any existing environment files.

Open `server/.env` and fill in your email settings:

```dotenv
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-google-app-password
SMTP_FROM=ProjectHub <your-email@gmail.com>
```

Use a [Google app password](https://support.google.com/accounts/answer/185833), not your regular password. Keep your `.env` files private; they're already ignored by Git.

Then, still inside `server/`:

```sh
npm run dev
```

The backend runs on port **5000**. Check it at [localhost:5000/api/v1/health](http://localhost:5000/api/v1/health).

### 3. Start the frontend

Open another terminal at the repository root:

```sh
cd client
npm ci
npm run dev
```

Open **[localhost:5173](http://localhost:5173)**. Use `localhost` consistently so login cookies and verification links work together.

### 4. Publish your first project

Register, open the verification email, verify your account, and log in. Click **Share a project**, fill in the details, and publish. The gallery starts empty, so your first project gets the whole place to itself :)

### Optional extras

Add these to `server/.env` and restart the backend:

| Feature | Variables | Without them |
| --- | --- | --- |
| Screenshots | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Publish without screenshots |
| AI drafts | `OPENAI_API_KEY`; optionally `OPENAI_MODEL` | Write the description yourself |
| Higher GitHub API limits | `GITHUB_TOKEN` | Public repo lookups work within the unauthenticated limit |

Uploads accept PNG, JPEG, or WebP, up to **5 MB each**. AI requests may cost money on your configured account. Service secrets belong in the backend environment, never in a `VITE_` variable.

The [configuration reference](docs/DEVELOPMENT.md#environment-variables) covers every setting.

## A few things under the hood

Some details aren't obvious from the screenshots:

- **Team membership and ownership are separate.** Being credited doesn't let you edit or delete someone else's project.
- **Uploads have owners too.** The backend checks that a screenshot belongs to the person attaching it.
- **Likes can't stack up from one account.** The database enforces one like per user per project.
- **Failed integrations shouldn't lose your draft.** Manual writing still works when AI is unavailable.
- **Long titles need room.** Browser layout tests check the gallery and editor at phone, tablet, and desktop widths.

More implementation notes are in [server/DESIGN.md](server/DESIGN.md).

> **Build story:** [Add a real bug we got stuck on, how we fixed it, and what we learned.]

## Builds and tests

Build the frontend from `client/`:

```sh
npm run build
```

The output goes to `client/dist/`. To compile and run the backend, use these inside `server/`:

```sh
npm run build
npm start
```

For backend tests, keep PostgreSQL running. From `server/`:

```sh
npm run db:test:setup
npm run typecheck
npm test
```

Then, from `client/`:

```sh
npm run typecheck
npx playwright install chromium
npm run test:e2e
```

Tests reset `projecthub_test`, so don't put anything you want to keep there. Run backend and browser tests one after the other because they share that database. External services are mocked in tests; real email delivery and uploads need your own credentials.

## If something isn't working

- **Database won't connect:** check `docker compose ps`. The local database uses port **5434**, not 5432.
- **No verification email:** check SMTP credentials, restart the backend, then use **Need a verification email?** on the login screen.
- **Frontend loads but requests fail:** make sure the backend is running on port 5000. `client/.env` should contain `VITE_API_URL=/api/v1`.
- **Port 5173 is busy:** stop the other process using it. Vite won't silently switch ports.
- **No projects:** a new database has no seed projects. Publish one after signing up.

To stop PostgreSQL, run `docker compose down` from the root. Your data stays in its Docker volume. Adding `-v` deletes that data.

For API routes, deployment considerations, and more troubleshooting, see the [development guide](docs/DEVELOPMENT.md).

## The team

Three of us, building this for Thirdspa.

- [Name / GitHub] — [what you worked on]
- [Name / GitHub] — [what you worked on]
- [Name / GitHub] — [what you worked on]

## AI disclosure

AI helped draft and reorganize this README using the repository as a reference.

**AI used during development:** [List the tools used, what they helped with, and roughly how much of the project involved AI.]

The app also has an optional OpenAI description-writing feature. It sends the project title, category, technologies, and rough description to OpenAI to suggest text. You choose whether to use that draft; it doesn't publish anything automatically.
