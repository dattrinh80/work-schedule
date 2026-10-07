'use client';

import React, { useState } from 'react';
import { User, Role, Facility, ActiveScope } from '@wms/shared';
import {
  Building2,
  ChevronDown,
  Search,
  Bell,
  LogOut,
  Menu,
} from 'lucide-react';

export interface NavbarProps {
  currentUser: User | null;
  facilityName: string;
  facilities?: Facility[];
  activeScope?: ActiveScope;
  onScopeChange?: (scope: ActiveScope) => void;
  onLogout?: () => void;
  onToggleMobileSidebar?: () => void;
}

export function Navbar({
  currentUser,
  facilityName,
  facilities = [],
  activeScope = { facilityId: 'ALL' },
  onScopeChange,
  onLogout,
  onToggleMobileSidebar,
}: NavbarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

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

  const currentInitials = currentUser?.fullName
    ? currentUser.fullName
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <header className="bg-surface border-b border-border-default sticky top-0 z-30 h-16 px-4 lg:px-6 flex items-center justify-between">
      {/* Left: Brand Identity with PNG Logo + Campus Selector */}
      <div className="flex items-center space-x-3 lg:space-x-5">
        {onToggleMobileSidebar && (
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            className="p-1.5 rounded-control text-text-secondary hover:text-text-primary hover:bg-surface-secondary lg:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Aqua Logo Image */}
        <div className="flex items-center">
          <img
            src="/assets/aqua/02_WMS_Enterprise_Aqua_Logo.png"
            alt="WMS Enterprise"
            className="h-8 w-auto object-contain"
          />
        </div>

        <div className="h-5 w-[1px] bg-border-default hidden sm:block" />

        {/* Scope / Branch Selector */}
        {isGlobalAdmin ? (
          <div className="relative inline-flex items-center">
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-control border border-border-default bg-surface hover:bg-surface-secondary transition-colors shadow-subtle text-xs text-text-primary">
              <Building2 className="w-3.5 h-3.5 text-text-secondary shrink-0" />
              <select
                value={activeScope.facilityId}
                onChange={handleScopeSelect}
                className="bg-transparent font-medium text-text-primary focus:outline-none cursor-pointer pr-4 appearance-none text-xs"
              >
                <option value="ALL">All Facilities (Global)</option>
                {facilities.map((fac) => (
                  <option key={fac.id} value={fac.id}>
                    {fac.name} ({fac.code})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-text-muted absolute right-2.5 pointer-events-none" />
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-control border border-border-default bg-surface text-xs font-medium text-text-secondary shadow-subtle">
            <Building2 className="w-3.5 h-3.5 text-text-muted shrink-0" />
            <span>{facilityName}</span>
          </div>
        )}
      </div>

      {/* Right: Search icon, Notifications, User Avatar */}
      <div className="flex items-center space-x-2 lg:space-x-4">
        {/* Search trigger icon */}
        <button
          type="button"
          className="p-2 rounded-control text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors"
          title="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Notifications */}
        <button
          type="button"
          className="relative p-2 rounded-control text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-surface" />
        </button>

        <div className="h-5 w-[1px] bg-border-default" />

        {/* Current User Profile Pill */}
        {currentUser && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center space-x-2.5 p-1 rounded-control hover:bg-surface-secondary transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-aqua-soft text-aqua-primary font-bold flex items-center justify-center text-xs border border-aqua-soft shadow-subtle shrink-0">
                {currentInitials.slice(0, 1)}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-semibold text-text-primary leading-tight">
                  {currentUser.fullName}
                </div>
                <div className="text-[11px] text-text-muted font-medium tracking-wide">
                  {currentUser.role.replace('_', ' ')}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-text-muted hidden sm:block" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-surface rounded-card border border-border-default shadow-dropdown py-1.5 z-40 text-xs">
                <div className="px-3 py-2 border-b border-border-subtle">
                  <div className="font-semibold text-text-primary">{currentUser.fullName}</div>
                  <div className="text-text-muted truncate">{currentUser.email}</div>
                </div>
                {onLogout && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-rose-600 hover:bg-rose-50 font-medium transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign out</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
