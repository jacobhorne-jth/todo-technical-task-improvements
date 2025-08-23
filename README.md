# SENS Technical Task – Feature Progress + Status

- Cloned repo
- installed dependencies
- updated `.env` file to connect to supabase
- verified working on localhost

## How to run my fork locally
1. Clone my repo
2. Create a `.env` file based on `.env.example` (see below).
3. Generate & sync:
   ```bash
   npm run generate
   npm run db:push
   npm run dev
   ```

`.env` example:
```text
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<random 32-byte base64 secret>

# Connection pooler (used because was having restricted network issues)
DATABASE_URL="postgresql://postgres.<PROJECT_REF>:<DB_PASSWORD>@<POOLER_HOST>:5432/postgres

GITHUB_ID=
GITHUB_SECRET=
```
