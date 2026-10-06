'use client';

import React from 'react';
import { User, Role } from '@wms/shared';

export interface NavbarProps {
  currentUser: User | null;
  facilityName: string;
  onLogout?: () => void;
}

export function Navbar({ currentUser, facilityName, onLogout }: NavbarProps) {
  return (
    <header className="bg-white border-b border-zinc-200 sticky top-0 z-10 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
            W
          </div>
          <span className="font-bold text-zinc-900 text-lg tracking-tight">
            WMS Enterprise
          </span>
        </div>
        <span className="text-zinc-300">|</span>
        <div className="flex items-center space-x-2 bg-zinc-50 border border-zinc-200 px-3 py-1 rounded-md text-xs font-medium text-zinc-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Branch: {facilityName}</span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {currentUser && (
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-sm font-semibold text-zinc-900">
                {currentUser.fullName}
              </div>
              <div className="text-xs text-zinc-500">{currentUser.role}</div>
            </div>
            <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-semibold flex items-center justify-center text-sm border border-indigo-200">
              {currentUser.fullName.charAt(0)}
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                className="text-xs text-zinc-500 hover:text-zinc-900 ml-2 px-2 py-1 border border-zinc-200 rounded"
              >
                Sign out
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
