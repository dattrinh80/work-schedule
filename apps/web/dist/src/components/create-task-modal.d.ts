import React from 'react';
import { CreateTaskDto, Facility, User } from '@wms/shared';
interface CreateTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (task: CreateTaskDto) => void;
    facilities: Facility[];
    users: User[];
    defaultFacilityId: string;
}
export declare function CreateTaskModal({ isOpen, onClose, onSubmit, facilities, users, defaultFacilityId, }: CreateTaskModalProps): React.JSX.Element | null;
export {};
