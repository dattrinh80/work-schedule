import React from 'react';
import { CreateTaskDto } from '@wms/shared';
interface CreateTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (task: CreateTaskDto) => void;
    facilityId: string;
}
export declare function CreateTaskModal({ isOpen, onClose, onSubmit, facilityId }: CreateTaskModalProps): React.JSX.Element | null;
export {};
