import React from 'react';
import './globals.css';

export const metadata = {
  title: 'Work Management System (WMS)',
  description: 'Multi-facility enterprise operational task management platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-zinc-50">{children}</body>
    </html>
  );
}
