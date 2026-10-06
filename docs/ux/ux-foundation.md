# WMS UX Foundation Baseline

Version: 1.0.0
Date: 2026-10-06
Status: APPROVED

## 1. Design Principles
1. **Clarity & Efficiency**: High density information display without clutter. Clear priority indicators and overdue alerts.
2. **Context Awareness**: Persistent facility badge in header showing the active branch context.
3. **Responsive & Fast**: Keyboard navigation friendly, instant feedback on state changes.

## 2. Color Tokens & Theme
- **Primary / Brand**: Slate / Indigo (`#4F46E5` primary, `#4338CA` active)
- **Neutral Grays**: Zinc palette (`#FAFAFA` bg, `#F4F4F5` cards, `#09090B` foreground)
- **Status Badges**:
  - `NEW`: Gray (`bg-zinc-100 text-zinc-800 border-zinc-200`)
  - `ASSIGNED`: Sky (`bg-sky-50 text-sky-700 border-sky-200`)
  - `IN_PROGRESS`: Blue (`bg-blue-50 text-blue-700 border-blue-200`)
  - `BLOCKED`: Orange (`bg-amber-50 text-amber-700 border-amber-200`)
  - `PENDING_REVIEW`: Purple (`bg-purple-50 text-purple-700 border-purple-200`)
  - `COMPLETED`: Green (`bg-emerald-50 text-emerald-700 border-emerald-200`)
  - `CANCELLED`: Rose (`bg-rose-50 text-rose-700 border-rose-200`)
  - `OVERDUE`: Red (`bg-red-100 text-red-800 border-red-300 font-semibold`)

## 3. Core Layout Structure
- **App Shell**:
  - Top Navigation Bar: App Logo, Facility Selector, Search trigger, User Avatar & Role badge, Logout button.
  - Sidebar: Dashboard, Tasks (All, My Tasks, By Facility), Calendar, Organization (Facilities, Teams), Reports, Settings.
  - Main Canvas: Header with title + action buttons ("Create Task"), followed by filters, metrics row, and data table / grid.
- **Task Creation Modal**:
  - Modal with Title, Description, Facility dropdown, Assignment Target (User / Team / Department), Priority, Due Date.
