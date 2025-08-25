import * as React from 'react';
import { useCreateTask, useFindManyTask } from '@lib/hooks';

type Props = {
  spaceId: string;
  onCreated?: (taskId: string) => void;
};

export default function TaskQuickAdd(props: Props) {
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');

  //for error checking for the unique tasks constraint
  const [error, setError] = React.useState('');

  const { trigger: createTask, isMutating } = useCreateTask();


  //load tasks in this space
  const { data: tasks } = useFindManyTask({ where: { spaceId: props.spaceId }, take: 200 });


  //checks only for exact matches, different caps = different tasks, only checks title
  const trimmed = title.trim();
  const existsExact = React.useMemo(
    () => (tasks ?? []).some(t => (t.title ?? '').trim() === trimmed),
    [tasks, trimmed]
  );
  const canCreate = trimmed.length > 0 && !existsExact;



  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');


    const t = trimmed;
    if (!t || !canCreate) return;

    try {
      const created = await createTask({
        data: {
          title: t,
          ...(description.trim() ? { description: description.trim() } : {}),
          space: { connect: { id: props.spaceId } }, // ownerId comes from @default(auth().id)
        },
      });

      if (created?.id) props.onCreated?.(created.id);
      setTitle('');
      setDescription('');
    } catch (err: unknown) {
      // if two clicks race, Prisma throws P2002; show a friendly message
      const message =
        (typeof err === 'object' && err !== null && 'message' in err)
          ? String((err as { message?: unknown }).message)
          : '';
      const msg =
        message.includes('P2002')
          ? 'A task with this exact title already exists in this space.'
          : 'Could not create task. Please try again.';
      setError(msg);
    }
  }

  return (
    <form onSubmit={(e) => { void submit(e); }} className="flex items-center gap-2">
        
      <input
        className="input input-bordered w-56"
        placeholder="New task title…"
        value={title}
        onChange={(e) => setTitle(e.currentTarget.value)}
      />

      <input
        className="input input-bordered w-72"
        placeholder="(optional) description…"
        value={description}
        onChange={(e) => setDescription(e.currentTarget.value)}
      />

      <button
        className="btn btn-primary"
        disabled={!canCreate || isMutating}
        title={!trimmed ? 'Enter a title' : existsExact ? 'Task already exists' : 'Add Task'}
        type="submit"
      >
        Add Task
      </button>

      {existsExact && trimmed && (
        <p className="text-sm text-error ml-2">A task named “{trimmed}” already exists.</p>
      )}
      {!!error && <p className="text-sm text-error ml-2">{error}</p>}
    </form>
  );
}
