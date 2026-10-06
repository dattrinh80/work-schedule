import React from 'react';
import { User } from '@wms/shared';
export interface NavbarProps {
    currentUser: User | null;
    facilityName: string;
    onLogout?: () => void;
}
export declare function Navbar({ currentUser, facilityName, onLogout }: NavbarProps): React.JSX.Element;
