import { TrashIcon } from '@heroicons/react/24/outline';
import { useDeleteTodo, useUpdateTodo } from '@lib/hooks';
import { Todo, User, Task } from '@prisma/client';
import { ChangeEvent } from 'react';
import Avatar from './Avatar';
import TimeInfo from './TimeInfo';

type Props = {
    //include Task in the values
    value: Todo & { owner: User; task: Task | null };
    optimistic?: boolean;
};

export default function TodoComponent({ value, optimistic }: Props) {
    const { trigger: updateTodo } = useUpdateTodo({ optimisticUpdate: true });
    const { trigger: deleteTodo } = useDeleteTodo({ optimisticUpdate: true });

    const onDeleteTodo = () => {
        void deleteTodo({ where: { id: value.id } });
    };

    const toggleCompleted = (completed: boolean) => {
        if (completed === !!value.completedAt) {
            return;
        }
        void updateTodo({
            where: { id: value.id },
            data: { completedAt: completed ? new Date() : null },
        });
    };

    return (
        <div className="border rounded-lg px-8 py-4 shadow-lg flex flex-col items-center w-full lg:w-[480px]">
            <div className="flex justify-between w-full mb-4">
                <h3
                    className={`text-xl line-clamp-1 ${
                        value.completedAt ? 'line-through text-gray-400 italic' : 'text-gray-700'
                    }`}
                >
                     {/* use task title instead of todo.title */}
                     {/*{value.task?.title ?? <span className="opacity-50">Untitled task</span>}*/}
                    {value.task?.title}
                    {optimistic && <span className="loading loading-spinner loading-sm ml-1"></span>}
                </h3>
                <div className="flex">
                    <input
                        type="checkbox"
                        className="checkbox mr-2"
                        checked={!!value.completedAt}
                        disabled={optimistic}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => toggleCompleted(e.currentTarget.checked)}
                    />
                    <TrashIcon
                        className={`w-6 h-6 ${
                            optimistic ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 cursor-pointer'
                        }`}
                        onClick={() => {
                            !optimistic && onDeleteTodo();
                        }}
                    />
                </div>
            </div>

            {value.task?.description && (
                <div className="w-full mb-3 text-sm text-gray-600">{value.task.description}</div>
                )}

                    <div className="flex justify-end w-full space-x-2">
                        <TimeInfo value={value} />
                        <Avatar user={value.owner} size={18} />
                    </div>
                </div>
    );
}
