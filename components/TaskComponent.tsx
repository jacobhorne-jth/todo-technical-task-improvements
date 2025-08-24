import { TrashIcon } from '@heroicons/react/24/outline';
import { useDeleteTask } from '@lib/hooks';
import type { Task } from '@prisma/client';

type Props = {
  value: Task;
  optimistic?: boolean;
  onDeleted?: (id: string) => void; 
};

export default function TaskComponent({ value, optimistic, onDeleted }: Props) {
  const { trigger: deleteTask } = useDeleteTask({ optimisticUpdate: true });

  const onDelete = async () => {
    try {
      await deleteTask({ where: { id: value.id } });
      onDeleted?.(value.id);
    } catch (e) {
      // Uses onDelete: Restrict for Todo.task, so fails if any Todo references this Task
      alert('Cannot delete: this task is used by an existing todo.');
    }
  };

  return (
    <div className="border rounded-lg px-4 py-3 shadow-sm flex items-start justify-between w-full lg:w-[480px]">
      <div className="min-w-0">
        <div className="text-base font-medium truncate">{value.title}</div>
        {value.description && (
          <div className="text-sm opacity-70 truncate">{value.description}</div>
        )}
      </div>
      <TrashIcon
        className={`w-5 h-5 ${
          optimistic ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 cursor-pointer'
        }`}
        onClick={() => {
          !optimistic && onDelete();
        }}
      />
    </div>
  );
}
