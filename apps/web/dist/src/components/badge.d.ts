import React from 'react';
import { TaskPriority, TaskStatus } from '@wms/shared';
export declare function StatusBadge({ status }: {
    status: TaskStatus;
}): React.JSX.Element;
export declare function PriorityBadge({ priority }: {
    priority: TaskPriority;
}): React.JSX.Element;
