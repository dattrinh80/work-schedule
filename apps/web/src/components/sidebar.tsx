'use client';

import React from 'react';
import {
  Home,
  ClipboardList,
  GraduationCap,
  Users,
  Calendar,
  Building2,
  BarChart2,
  Settings,
  HelpCircle,
  X,
} from 'lucide-react';

interface SidebarProps {
  currentTab?: string;
  onSelectTab?: (tab: string) => void;
  isOpenOnMobile?: boolean;
  onCloseMobile?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const MAIN_NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'operational-tasks', label: 'Operational Tasks', icon: ClipboardList },
  { id: 'academic', label: 'Academic', icon: GraduationCap },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'scheduling', label: 'Scheduling', icon: Calendar },
  { id: 'facilities', label: 'Facilities', icon: Building2 },
  { id: 'reports', label: 'Reports', icon: BarChart2 },
];

const SECONDARY_NAV_ITEMS: NavItem[] = [
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'help', label: 'Help', icon: HelpCircle },
];

export function Sidebar({
  currentTab = 'operational-tasks',
  onSelectTab,
  isOpenOnMobile = false,
  onCloseMobile,
}: SidebarProps) {
  const renderItem = (item: NavItem) => {
    const isActive = currentTab === item.id;
    const Icon = item.icon;

    return (
      <button
        key={item.id}
        type="button"
        onClick={() => {
          onSelectTab?.(item.id);
          onCloseMobile?.();
        }}
        className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-control text-xs font-semibold transition-all relative ${
          isActive
            ? 'bg-aqua-soft text-aqua-primary shadow-subtle'
            : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary'
        }`}
      >
        {/* Subtle active indicator bar on left border */}
        {isActive && (
          <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-aqua-primary rounded-r-md" />
        )}
        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-aqua-primary' : 'text-text-muted'}`} />
        <span className="truncate">{item.label}</span>
      </button>
    );
  };

  const content = (
    <div className="w-56 lg:w-60 bg-surface h-full flex flex-col border-r border-border-default select-none">
      <div className="flex-1 overflow-y-auto px-3.5 py-5 flex flex-col justify-between">
        <nav className="space-y-1">
          {MAIN_NAV_ITEMS.map(renderItem)}
        </nav>

        <div className="pt-4 border-t border-border-subtle mt-6">
          <nav className="space-y-1">
            {SECONDARY_NAV_ITEMS.map(renderItem)}
          </nav>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop fixed sidebar */}
      <aside className="hidden lg:block shrink-0 sticky top-16 h-[calc(100vh-4rem)] z-10">
        {content}
      </aside>

      {/* Mobile drawer with backdrop */}
      {isOpenOnMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-surface z-10 shadow-2xl">
            <div className="p-4 border-b border-border-default flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-900">Navigation</span>
              <button
                type="button"
                onClick={onCloseMobile}
                className="p-1 rounded-md text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{content}</div>
          </div>
        </div>
      )}
    </>
  );
}
