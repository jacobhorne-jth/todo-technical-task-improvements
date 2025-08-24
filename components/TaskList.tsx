// components/TaskList.tsx
import * as React from 'react';
import { useFindManyTask } from '@lib/hooks';
import type { Task } from '@prisma/client';
import TaskComponent from './TaskComponent';

type Props = {
  spaceId: string;
  onDeleted?: (id: string) => void;
};

export default function TaskList(props: Props) {
  const { data: tasks, mutate } = useFindManyTask({
    where: { spaceId: props.spaceId },
    orderBy: { title: 'asc' },
    take: 100,
  });

  return (
    <ul className="flex flex-col gap-2 py-2">
      {(tasks ?? []).map((t: Task) => (
        <li key={t.id}>
          <TaskComponent
            value={t}
            onDeleted={async (id) => {
              props.onDeleted?.(id);
              await mutate(); // refresh the list after deletion
            }}
          />
        </li>
      ))}
      {(!tasks || tasks.length === 0) && (
        <li className="text-sm opacity-70">No tasks yet.</li>
      )}
    </ul>
  );
}
