# Implementation decisions

The workspace root is the ProjectHub repository. The client and server are independent npm applications.

Users have generated, stable public usernames. Public profile queries never return email, password hashes, tokens, or sessions. Projects have an owner distinct from registered team members. Technologies use normalized names and a relational many-to-many join. Screenshot records track the uploader and optional project so attaching somebody else's upload is rejected. Likes have a composite primary key.

Access JWTs last 15 minutes and stay in browser memory. Refresh JWTs last 7 days in HttpOnly, SameSite cookies and are rotated against hashed database records. JWT issuer, audience, algorithm and token kind are verified. Resetting a password removes sessions. Verification and password reset use random 256-bit email tokens, hashed at rest, expiring after 30 minutes; one token of each purpose per user. Atomic consumption prevents reuse. Mail requests have IP throttling and per-account cooldowns.

Routes: auth register / verify-email / resend-verification / login / refresh / logout / forgot-password / reset-password / me; users search / :username / me; projects list / create / :id read-update-delete / generate-description; nested project likes; uploads create-delete; GitHub repository metadata. Services enforce ownership; repositories alone query Prisma. Central middleware validates payloads and formats errors.

Frontend: discover; five authentication pages; project details and create/edit form; public profile and profile editor. Backend pagination applies to discovery and profiles. External integrations remain optional at startup, with explicit unavailable responses for missing configuration.

Verification order: schema and migrations, backend type checks and PostgreSQL-backed integration tests with external providers mocked, then frontend implementation, production builds, and browser checks.
