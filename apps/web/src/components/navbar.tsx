'use client';

import React from 'react';
import { User, Role, Facility, ActiveScope } from '@wms/shared';

export interface NavbarProps {
  currentUser: User | null;
  facilityName: string;
  facilities?: Facility[];
  activeScope?: ActiveScope;
  onScopeChange?: (scope: ActiveScope) => void;
  onLogout?: () => void;
}

export function Navbar({
  currentUser,
  facilityName,
  facilities = [],
  activeScope = { facilityId: 'ALL' },
  onScopeChange,
  onLogout,
}: NavbarProps) {
  const isGlobalAdmin =
    currentUser?.role === Role.SUPER_ADMIN || currentUser?.role === Role.ADMIN;

  const handleScopeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'ALL') {
      onScopeChange?.({ facilityId: 'ALL', facilityName: 'All Facilities' });
    } else {
      const found = facilities.find((f) => f.id === val);
      onScopeChange?.({
        facilityId: val,
        facilityName: found ? found.name : 'Unknown Campus',
      });
    }
  };

  return (
    <header className="bg-white border-b border-zinc-200 sticky top-0 z-10 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            W
          </div>
          <span className="font-bold text-zinc-900 text-lg tracking-tight">
            WMS Enterprise
          </span>
        </div>
        <span className="text-zinc-300">|</span>

        {/* Scope Switcher Component */}
        {isGlobalAdmin ? (
          <div className="flex items-center space-x-2 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-900">
            <span className="text-indigo-600 font-semibold">Scope:</span>
            <select
              value={activeScope.facilityId}
              onChange={handleScopeSelect}
              className="bg-transparent font-semibold text-indigo-900 focus:outline-none cursor-pointer pr-2"
            >
              <option value="ALL">🌐 All Facilities (Global)</option>
              {facilities.map((fac) => (
                <option key={fac.id} value={fac.id}>
                  🏫 {fac.name} ({fac.code})
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="flex items-center space-x-2 bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-700">
            <svg
              className="w-3.5 h-3.5 text-zinc-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <span>Branch: <strong className="text-zinc-900">{facilityName}</strong></span>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-4">
        {currentUser && (
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-sm font-semibold text-zinc-900">
                {currentUser.fullName}
              </div>
              <div className="text-xs text-zinc-500 font-medium">
                {currentUser.role.replace('_', ' ')}
              </div>
            </div>
            <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm border border-indigo-200 shadow-sm">
              {currentUser.fullName.charAt(0)}
            </div>
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="text-xs font-medium text-zinc-600 hover:text-red-700 hover:bg-red-50 ml-2 px-2.5 py-1.5 border border-zinc-200 hover:border-red-200 rounded-lg transition-colors flex items-center space-x-1"
                title="Sign out of current account"
              >
                <span>Sign out</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
