# SENS Technical Task – Feature Progress + Status

- Cloned repo
- installed dependencies
- updated `.env` file to connect to supabase
- verified working on localhost

- added Task model (title, description, owner field, space relation)
- updated Todo model to reference Task with taskId, removed title
- TaskSelect dropdown for choosing tasks, creating a Todo now connects to selected Task
- included task in the Todo query and updated the Todo card to show Task title + description
- added Task creation using two fields for title and description, created Task auto-selects in the picker
- added TaskList with show and hide button toggle and ability to delete tasks
  - message blocking from deleting if existing Todo uses Task that you are trying to delete


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
