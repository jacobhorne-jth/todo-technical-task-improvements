//IMPORTANT
//use TaskSelectAndCreate now instead
//this file is for just selecting from a simple dropdown
import * as React from 'react';
import { useFindManyTask } from 'lib/hooks';

type Props = {
  spaceId: string;
  value?: string;
  onChange: (taskId: string) => void;
};

export default function TaskSelect(props: Props) {
  const { data: tasks } = useFindManyTask({
    where: { spaceId: props.spaceId },
    orderBy: { title: 'asc' },
    take: 100,
  });

  return (
    <select
      className="w-full rounded-xl border px-3 py-2"
      value={props.value ?? ''}
      onChange={(e) => props.onChange(e.target.value)}
    >
      <option value="" disabled>Select a task or create one…</option>
      {(tasks ?? []).map((t) => (
        <option key={t.id} value={t.id}>
          {t.title}{t.description ? ` — ${t.description}` : ''}
        </option>
      ))}
    </select>
  );
}
