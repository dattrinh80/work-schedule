import React from 'react';
import { Task, TaskStatus } from '@wms/shared';
interface TaskListProps {
    tasks: Task[];
    onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
    onOpenCreateModal: () => void;
}
export declare function TaskList({ tasks, onStatusChange, onOpenCreateModal }: TaskListProps): React.JSX.Element;
export {};
