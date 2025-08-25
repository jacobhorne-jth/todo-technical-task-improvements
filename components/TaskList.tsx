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
  // Load up to 100 Tasks for this Space, sorted by title for a stable catalog view
  const { data: tasks, mutate } = useFindManyTask({
    where: { spaceId: props.spaceId },
    orderBy: { title: 'asc' },
    take: 100,
  });

  return (
    <ul className="flex flex-col gap-2 py-2">
      {(tasks ?? []).map((t: Task) => (
        <li key={t.id}>
          {/* Delegate per-item rendering to TaskComponent.
             After a child deletes an item, call parent onDeleted (if provided),
             then revalidate with mutate() to refresh the list from the server. */}
          <TaskComponent
            value={t}
            onDeleted={(id) => {
              props.onDeleted?.(id);
              void mutate(); // refresh the list after deletion
            }}
          />
        </li>
      ))}
      {/* Simple empty state when the space has no Tasks yet */}
      {(!tasks || tasks.length === 0) && (
        <li className="text-sm opacity-70">No tasks yet.</li>
      )}
    </ul>
  );
}
