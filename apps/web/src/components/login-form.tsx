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
    badge: 'Global Scope',
    desc: 'Unrestricted access across all campuses and departments',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
  },
  {
    role: 'Central Manager',
    email: 'manager.central@wms.local',
    badge: 'Central Campus',
    desc: 'Facility Manager for Central Campus (CAMPUS-01)',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  {
    role: 'West Manager',
    email: 'manager.west@wms.local',
    badge: 'West Campus',
    desc: 'Facility Manager for West Campus (CAMPUS-02)',
    color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  },
  {
    role: 'Teacher Sarah',
    email: 'teacher.sarah@wms.local',
    badge: 'Academic Team',
    desc: 'Teacher view scoped to Central Campus tasks',
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
];

export function LoginForm({ onLogin, loading, error }: LoginFormProps) {
  const [email, setEmail] = useState('admin@wms.local');
  const [password, setPassword] = useState('Password123!');
  const [selectedDemo, setSelectedDemo] = useState('admin@wms.local');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || loading) return;
    await onLogin(email, password);
  };

  const handleSelectAccount = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    setSelectedDemo(demoEmail);
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
            <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              <div className="flex items-center space-x-2 font-semibold">
                <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Authentication Notice</span>
              </div>
              <p className="mt-1 text-xs">{error}</p>
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
                onChange={(e) => {
                  setEmail(e.target.value);
                  setSelectedDemo('');
                }}
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
              className="w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-60 shadow-sm"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  <span>Authenticating...</span>
                </>
              ) : (
                'Sign in to WMS'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-zinc-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Select Test Demo Account:
              </span>
              <span className="text-[11px] text-zinc-400">Click to sign in</span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {DEMO_ACCOUNTS.map((acc) => {
                const isSelected = selectedDemo === acc.email;
                return (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => handleSelectAccount(acc.email)}
                    className={`flex items-center justify-between p-2.5 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                        : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-zinc-900 flex items-center space-x-2">
                        <span>{acc.role}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${acc.color}`}>
                          {acc.badge}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-500 font-mono mt-0.5">{acc.email}</div>
                    </div>
                    <span className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1">
                      <span>Log in</span>
                      <span>&rarr;</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
