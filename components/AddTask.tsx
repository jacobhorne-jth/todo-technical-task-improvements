import * as React from 'react';
import { useCreateTask } from '@lib/hooks';

type Props = {
  spaceId: string;
  onCreated?: (taskId: string) => void;
};

export default function TaskQuickAdd(props: Props) {
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  
  const { trigger: createTask, isMutating } = useCreateTask();



  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;

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
  }

  return (
    <form onSubmit={submit} className="flex items-center gap-2">
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
      <button className="btn" disabled={!title.trim() || isMutating} type="submit">
        Add Task
      </button>
    </form>
  );
}
