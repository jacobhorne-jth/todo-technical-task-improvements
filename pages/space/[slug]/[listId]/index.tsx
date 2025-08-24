import { PlusIcon } from '@heroicons/react/24/outline';
import { useCreateTodo, useFindManyTodo } from '@lib/hooks';
import { List, Space } from '@prisma/client';
import BreadCrumb from 'components/BreadCrumb';
import TodoComponent from 'components/Todo';
import WithNavBar from 'components/WithNavBar';
import { GetServerSideProps } from 'next';
import { ChangeEvent, KeyboardEvent, useState } from 'react';
import { getEnhancedPrisma } from 'server/enhanced-db';

//import taskselect component
import TaskSelect from 'components/TaskSelect';



type Props = {
    space: Space;
    list: List;
};

export default function TodoList(props: Props) {
    //use taskId instead of title
    //const [title, setTitle] = useState('');
    const [taskId, setTaskId] = useState('');
    
    const { trigger: createTodo } = useCreateTodo({ optimisticUpdate: true });

    const { data: todos } = useFindManyTodo(
        {
            where: { listId: props.list.id },
            include: {
                owner: true,
                //include task when loading todos
                task: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        },
        { keepPreviousData: true }
    );

    const _createTodo = () => {
        if (!taskId) return;
        void createTodo({
            data: {
                list: { connect: { id: props.list.id } },
                //use the selected task
                task: { connect: { id: taskId } },
            },
        });
        //change to task instead of title
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
                <div className="flex items-center gap-2 mt-2">
                    <div className="w-72">
                        <TaskSelect
                        spaceId={props.space.id}
                        value={taskId}
                        onChange={setTaskId}
                        />
                    </div>
                    <button
                        onClick={_createTodo}
                        disabled={!taskId}
                        className="rounded-xl border px-3 py-2 disabled:opacity-50"
                        title={!taskId ? 'Pick a task first' : 'Add todo'}
                    >
                        <PlusIcon className="w-6 h-6 text-gray-500" />
                    </button>
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
