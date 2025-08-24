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

  // search within this Space as the user types
  const { data: tasks } = useFindManyTask({
    where: q.trim()
      ? { spaceId, title: { contains: q.trim(), mode: 'insensitive' } }
      : { spaceId },
    orderBy: { title: 'asc' },
    take: 10,
  });

  const list = tasks ?? [];
  const exact = list.find(
    t => t.title.trim().toLowerCase() === q.trim().toLowerCase()
  );
  const canCreate = q.trim().length > 0 && !exact;

  const { trigger: createTask, isMutating } = useCreateTask();

  function pick(t: { id: string; title: string }) {
    onChange(t.id);
    setQ(t.title);
    setOpen(false);
  }

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
      // If you added @@unique([spaceId, title]) this will error on duplicates
      console.error('Create task failed', err);
      alert('Could not create task. It may already exist in this space.');
    }
  }

  // Enter to create (if no exact match) or pick first result
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
        onBlur={() => setTimeout(() => setOpen(false), 120)} // let clicks register
        autoComplete="off"
      />

      {/* Suggestions dropdown */}
      {open && list.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full rounded-xl border bg-white shadow">
          {list.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                className="w-full text-left px-3 py-2 hover:bg-gray-50"
                onMouseDown={(e) => e.preventDefault()} // avoid blur before click
                onClick={() => pick(t)}
              >
                {t.title}{t.description ? ` — ${t.description}` : ''}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Create when there's no exact match */}
      {canCreate && (
        <button
          type="button"
          className="btn btn-sm mt-2"
          onMouseDown={(e) => e.preventDefault()} // keep focus so onClick fires
          onClick={createNew}
          disabled={isMutating}
        >
          Create “{q.trim()}”
        </button>
      )}
    </div>
  );
}
