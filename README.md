# SENS Technical Task – Feature Progress + Status


**Live deployed vercel:** https://todo-technical-task-improvements.vercel.app/

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
- added editing for todos, can view and select Task from list
- added access policies enforcing unique tasks per space
  - and different access for editing and deleting tasks if admin/owner
- added type to select task, changed previous task selection
- updated theme to match sens website
- used sens background image and logo
- documentation: expanded README with run steps, environment setup, deploy notes, and a thorough test plan

___

# How to Run Locally

Requirements
- Node 18+
- A Postgres URL (Supabase works great; use the pooler host for best reliability)

**.env example**
```text
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<32-byte random string>

# Use your own connection string; pooler host recommended.
DATABASE_URL="postgresql://postgres.<PROJECT_REF>:<DB_PASSWORD>@<POOLER_HOST>:5432/postgres?pgbouncer=true&connection_limit=1&sslmode=require"

# Optional providers if you enable them:
GITHUB_ID=
GITHUB_SECRET=
```

**Install & start**
```text
npm install
npm run generate      # ZenStack plugins + Prisma client
npm run db:push       # sync schema to DB
npm run dev           # http://localhost:3000
```

**Sign in**

Use the app’s sign-in page. If you don’t see a default Space after logging in, sign out and sign back in (the default Space is created during sign-in if none exists). You can also click “create a new one”.

___


# Feature walkthrough

**1. Create a Task**

- Use the two inputs at the top (“New task title…”, optional description).

- Add button is disabled for empty titles or exact duplicates (UI check).

- DB also enforces uniqueness per Space; if two clients race, a friendly message appears.

**2. Pick a Task while creating a Todo**

- Start typing in the search/typeahead (“Search tasks… (or type a new one)”).

- Choose a match or press Enter to create a new Task if there’s no exact match.

- Click + (or the Add button) to create the Todo from the selected Task.

**3. Edit an existing Todo**

- On the Todo card, click Change task to switch the linked Task. The card updates immediately.

**4. Manage Tasks**

- Click Show tasks / Hide tasks to toggle the catalog.

- Delete an unused Task from the list. If the Task is referenced by any Todo, deletion is blocked with a clear message.

___

# Files of interest (app)

- `components/AddTask.tsx` – inline Task creator with duplicate prevention and error handling.

- `components/TaskSelectAndCreate.tsx` – typeahead selector with inline create-on-enter.

- `components/TaskList.tsx` – renders the Space’s Task catalog.

- `components/TaskComponent.tsx` – single Task row with guarded delete.

- `components/Todo.tsx` – Todo card shows Task title/description and supports “Change task”.

- `pages/space/[slug]/[listId]/index.tsx` – main page integrating AddTask, TaskList, and TaskSelectAndCreate; Todo creation connects to selected Task.

**Data model**

- `schema.zmodel` – Task model, Todo relation, uniqueness & permissions.

**Styling**

- `tailwind.config.js` – DaisyUI sens theme with SENS-inspired colors.

___


# IMPORTANT

# In-depth Test Plan

**A. Setup & Auth**

- Start app, sign in, ensure a default Space is present (or create one).

- Confirm you can create a List in the Space and navigate to /space/[slug]/[listId].

**B. Task creation & uniqueness**

**1. Create unique Task**

- Title: “Do Homework”; optional description: “Complete and turn in homework”.

- Expect: Task appears; typeahead finds it; Task is selectable.

**2. Exact duplicate (same Space)**

- Try creating “Do Homework” again (same exact casing).

- UI: Add button disabled with “already exists” message.

- API: If two browsers click at once, second fails with P2002 → friendly toast/alert shown.

**3. Different description, same title**

- Allowed (design choice was title uniqueness per space only).

**4. Case behavior**

- UI duplicate check is exact (case-sensitive). DB uniqueness is also case-sensitive by default.

**C. Create Todo from Task**

1. Without selecting a Task, the Add Todo button is disabled and shows tooltip.

2. Search for a Task; select it; click Add:

- Expect: a new Todo appears at the top.

- Card renders Task title and description (not Todo title).

- Owner avatar + relative time still work.

**D. Edit an existing Todo**

1. On a Todo card, click Change task → TaskSelect opens.

2. Pick another Task; expect card updates to show the new Task’s title/description.

3. Verify persistence by refresh or querying DB; todo.taskId changes accordingly.

**E. Task deletion**

1. Unused Task

- Delete from TaskList; expect it disappears immediately.

- If it was selected in the make-Todo area, selection clears.

2. Task referenced by a Todo

- Attempt delete; expect alert “Cannot delete: this task is used by an existing todo.” (FK restriction).

- Task remains.

**F. Permissions (spot checks)**

- From a non-member session (if you have one handy), verify Tasks/Todos of that Space are not readable.

- From an ordinary member vs. owner/admin, verify update/delete rules on Tasks.

**G. Keyboard & UX ergonomics**

- In the search box:

  - Enter with no exact match → creates Task.

  - Enter with matches available → picks the first match.

  - Clicking outside closes suggestions; clicks inside don’t blur prematurely.

___

# Summary

- Implemented reusable Task model and rewired Todo to reference it.

- Enforced uniqueness per Space and safe deletes via FK restriction.

- Built a practical UX: quick add, searchable typeahead with inline create, show/hide catalog, and edit-todo relink.

- Kept permissions aligned with Space membership and roles.

- Theming brings a light SENS-inspired look while retaining the original structure.
