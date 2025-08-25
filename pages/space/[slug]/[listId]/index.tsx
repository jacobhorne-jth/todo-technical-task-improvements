import { PlusIcon } from '@heroicons/react/24/outline';
import { useCreateTodo, useFindManyTodo } from '@lib/hooks';
import { List, Space } from '@prisma/client';
import BreadCrumb from 'components/BreadCrumb';
import TodoComponent from 'components/Todo';
import WithNavBar from 'components/WithNavBar';
import { GetServerSideProps } from 'next';
import { useState } from 'react';
import { getEnhancedPrisma } from 'server/enhanced-db';

// import task selection UI (replaces plain title input for Todos)
// NOTE: I switched from a dropdown to a typeahead-style selector that can also create.
 //import TaskSelect from 'components/TaskSelect';
import TaskSelectAndCreate from 'components/TaskSelectAndCreate';

// quick-add and manage the space’s Task catalog
import AddTask from 'components/AddTask';
import TaskList from 'components/TaskList';




type Props = {
    space: Space;
    list: List;
};

export default function TodoList(props: Props) {
    // STATE CHANGE: Todos are now created from a Task, so we track a taskId instead of a free-text title.
    //const [title, setTitle] = useState('');
    const [taskId, setTaskId] = useState('');
    // NEW: toggle for showing/hiding the Task catalog (avoid clutter)
    const [showTasks, setShowTasks] = useState(false);

    
    const { trigger: createTodo } = useCreateTodo({ optimisticUpdate: true });

    const { data: todos } = useFindManyTodo(
        {
            where: { listId: props.list.id },
            include: {
                owner: true,
                // NEW: include the linked Task so the card can show task.title/description
                task: true,
                // NEW: include list.spaceId so the selector knows which Tasks to query for this space
                list: { select: { spaceId: true } },
            },
            orderBy: {
                createdAt: 'desc',
            },
        },
        { keepPreviousData: true }
    );

    const _createTodo = () => {
        // GUARD: require a Task selection before creating a Todo
        if (!taskId) return;
        void createTodo({
            data: {
                list: { connect: { id: props.list.id } },
                // CHANGE: instead of persisting a title, connect the Todo to the chosen Task
                task: { connect: { id: taskId } },
            },
        });
        // RESET: clear task selection after creating a Todo
        setTaskId('');
    };

    if (!props.space || !props.list) {
        return <></>;
    }

    return (
        <WithNavBar>
            <div className="px-8 py-2">
                <BreadCrumb space={props.space} list={props.list} />
            </div>
            <div className="container w-full flex flex-col items-center py-12 mx-auto">
                <h1 className="text-2xl font-semibold mb-4">{props.list?.title}</h1>

                {/* NEW: Inline Task creator. When a Task is created, auto-select it for quick Todo creation. */}
                <div className="mb-3">
                    <AddTask spaceId={props.space.id} onCreated={setTaskId} />
                </div>


                {/* NEW: Show/Hide the Task catalog to keep the screen clean.
                   aria-expanded for a11y; type="button" avoids accidental form submit. */}
                <button
                        type="button"
                        aria-expanded={showTasks}
                        onClick={() => setShowTasks((v) => !v)}
                        className="btn btn-sm btn-ghost"
                        >
                        {showTasks ? 'Hide tasks' : 'Show tasks'}
                        </button>
                
                {/* NEW: Optional Task list (with delete). Clears selection if a selected Task gets deleted. */}
                <div className="mt-6 w-full flex flex-col items-center">
                    <div className="w-full lg:w-[480px]">
                        
                        {/* Only render when show tasks is toggled on. TaskList will revalidate itself after deletes. 
                        onDeleted clears the currently selected task if it was removed. */}
                        {showTasks && (
                        <div className="mt-2">
                            <TaskList
                            spaceId={props.space.id}
                            onDeleted={(id) => {
                                if (taskId === id) setTaskId('');
                            }}
                            />
                        </div>
                        )}
                    </div>
                    </div>


                {/* NEW: “Make a Todo” from a Task using a searchable, creatable selector */}
                <div className="mt-10 w-full flex flex-col items-center">
                <h2 className="text-sm font-semibold tracking-wide text-gray-600 uppercase mb-2">
                    Make a Todo
                </h2>

                <div className="flex items-center gap-2 w-full lg:w-[480px]">
                    <div className="flex-1">
                    {/* CHANGE: switched to TaskSelectAndCreate (type-to-search + create inline) */}
                    <TaskSelectAndCreate
                        spaceId={props.space.id}
                        value={taskId}
                        onChange={setTaskId}
                    />
                    </div>

                    {/* ACTION: Create the Todo by connecting the selected Task */}
                    <button
                    onClick={_createTodo}
                    disabled={!taskId}
                    className="rounded-xl border px-3 py-2 disabled:opacity-50"
                    title={!taskId ? 'Pick a task first' : 'Add todo'}
                    >
                    <PlusIcon className="w-6 h-6 text-gray-500" />
                    </button>
                </div>
                </div>



                <ul className="flex flex-col space-y-4 py-8 w-11/12 md:w-auto">
                    {todos?.map((todo) => (
                        <TodoComponent key={todo.id} value={todo} optimistic={todo.$optimistic} />
                    ))}
                </ul>
            </div>
        </WithNavBar>
    );
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ req, res, params }) => {
    const db = await getEnhancedPrisma({ req, res });
    const space = await db.space.findUnique({
        where: { slug: params!.slug as string },
    });
    if (!space) {
        return {
            notFound: true,
        };
    }

    const list = await db.list.findUnique({
        where: { id: params!.listId as string },
    });
    if (!list) {
        return {
            notFound: true,
        };
    }

    return {
        props: { space, list },
    };
};
