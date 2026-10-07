'use client';

import React, { useState } from 'react';

export interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<void>;
  loading: boolean;
  error?: string | null;
}

export const DEMO_ACCOUNTS = [
  {
    role: 'Super Admin',
    email: 'admin@wms.local',
    badge: 'Global',
    desc: 'Unrestricted system access across all facilities',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
  },
  {
    role: 'Central Manager',
    email: 'manager.central@wms.local',
    badge: 'Central Campus',
    desc: 'Facility Manager for Campus 01',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  {
    role: 'West Manager',
    email: 'manager.west@wms.local',
    badge: 'West Campus',
    desc: 'Facility Manager for Campus 02',
    color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  },
  {
    role: 'Teacher Sarah',
    email: 'teacher.sarah@wms.local',
    badge: 'Academic',
    desc: 'Scoped teacher view at Central Campus',
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
];

export function LoginForm({ onLogin, loading, error }: LoginFormProps) {
  const [email, setEmail] = useState('admin@wms.local');
  const [password, setPassword] = useState('Password123!');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    onLogin(email, password);
  };

  const handleQuickSelect = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    onLogin(demoEmail, 'Password123!');
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex w-12 h-12 rounded-xl bg-indigo-600 items-center justify-center text-white font-bold text-xl shadow-md mb-3">
          W
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
          Work Management System
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Enterprise Multi-Facility Operations & Scheduling
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-zinc-200 sm:rounded-xl sm:px-10">
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start space-x-2 text-sm text-red-700">
              <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@wms.local"
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign in to WMS'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-zinc-100">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
              Quick Test Demo Accounts:
            </p>
            <div className="grid grid-cols-1 gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleQuickSelect(acc.email)}
                  className="flex items-center justify-between p-2 rounded-lg border border-zinc-100 hover:border-zinc-300 hover:bg-zinc-50 transition-colors text-left"
                >
                  <div>
                    <div className="text-xs font-semibold text-zinc-900 flex items-center space-x-2">
                      <span>{acc.role}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${acc.color}`}>
                        {acc.badge}
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-400">{acc.email}</div>
                  </div>
                  <span className="text-xs text-indigo-600 font-medium hover:underline">Select &rarr;</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
