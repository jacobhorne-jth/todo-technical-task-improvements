import * as React from 'react';
import { useFindManyTask, useCreateTask } from '@lib/hooks';

type Props = {
  spaceId: string;
  value?: string;                      // currently selected taskId
  onChange: (taskId: string) => void;  // notify parent when picked/created
};

export default function TaskSelectWithCreate({ spaceId, value, onChange }: Props) {
  const [q, setQ] = React.useState('');
  const [open, setOpen] = React.useState(false);

  // Live query for Tasks in this Space.
  // If there's a search string, filter by title (case-insensitive); otherwise fetch recent tasks.
  const { data: tasks } = useFindManyTask({
    where: q.trim()
      ? { spaceId, title: { contains: q.trim(), mode: 'insensitive' } }
      : { spaceId },
    orderBy: { title: 'asc' },
    take: 10,
  });

  const list = tasks ?? [];
  // Detect an exact title match (normalized for trim + lower case) to decide if "Create" should be shown/enabled.
  const exact = list.find(
    t => t.title.trim().toLowerCase() === q.trim().toLowerCase()
  );
  const canCreate = q.trim().length > 0 && !exact;

  // Mutation for creating a Task in this Space.
  const { trigger: createTask, isMutating } = useCreateTask();

  // Select an existing Task: inform parent via onChange, mirror its title in the input, and close dropdown.
  function pick(t: { id: string; title: string }) {
    onChange(t.id);
    setQ(t.title);
    setOpen(false);
  }

  // Create a brand-new Task (title only) in the current Space, then auto-select it.
  async function createNew() {
    const title = q.trim();
    if (!title) return;
    try {
      const created = await createTask({
        data: { title, space: { connect: { id: spaceId } } },
        select: { id: true, title: true },
      });
      if (created?.id) {
        onChange(created.id);     // auto-select the new task
        setQ(created.title);
        setOpen(false);
      }
    } catch (err) {
      // If a unique constraint exists (e.g., @@unique([spaceId, title])), this will throw for duplicates.
      console.error('Create task failed', err);
      alert('Could not create task. It may already exist in this space.');
    }
  }

  // Keyboard UX: Enter creates when no exact match; otherwise picks the first result.
  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      if (canCreate && !isMutating) {
        e.preventDefault();
        void createNew();
      } else if (list[0]) {
        e.preventDefault();
        pick(list[0]);
      }
    }
  }

  return (
    <div className="relative">
      <input
        className="input input-bordered w-full"
        placeholder="Search tasks… (or type a new one)"
        value={q}
        onChange={(e) => { setQ(e.currentTarget.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        onBlur={() => setTimeout(() => setOpen(false), 120)} // let clicks register before dropdown closes
        autoComplete="off"
      />

      {/* Suggestions dropdown: anchored under the input; simple list of Task titles (+ descriptions inline) */}
      {open && list.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full rounded-xl border bg-white shadow">
          {list.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                className="w-full text-left px-3 py-2 hover:bg-gray-50"
                onMouseDown={(e) => e.preventDefault()} // avoid input blur before click fires
                onClick={() => pick(t)}
              >
                {t.title}{t.description ? ` — ${t.description}` : ''}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Create CTA appears only when there's text and no exact title match */}
      {canCreate && (
        <button
          type="button"
          className="btn btn-sm mt-2"
          onMouseDown={(e) => e.preventDefault()} // keep focus so onClick reliably fires
          onClick={createNew}
          disabled={isMutating}
        >
          Create “{q.trim()}”
        </button>
      )}
    </div>
  );
}
