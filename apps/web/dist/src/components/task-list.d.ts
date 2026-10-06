import React from 'react';
import { Task, TaskStatus } from '@wms/shared';
interface TaskListProps {
    tasks: Task[];
    onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
    onOpenCreateModal: () => void;
    onSelectTask: (task: Task) => void;
    onDeleteTask: (taskId: string) => void;
}
export declare function TaskList({ tasks, onStatusChange, onOpenCreateModal, onSelectTask, onDeleteTask, }: TaskListProps): React.JSX.Element;
export {};
