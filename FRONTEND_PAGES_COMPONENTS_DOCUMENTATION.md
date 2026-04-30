# Frontend Documentation (Pages and Components)

This document covers the full frontend surface of the current codebase, excluding backend API contract documentation.

## Scope Covered

- All files in `client/src/pages`
- All files in `client/src/components/layout`
- All files in `client/src/components/views`
- All files in `client/src/components/ui`
- Supporting frontend modules used by pages/components:
  - `client/src/hooks`
  - `client/src/lib`
  - `client/src/components/charts`
  - `client/src/App.tsx`

## 1) App Shell and Routing

Primary entry: `client/src/App.tsx`

- Providers:
  - React Query provider (`queryClient`)
  - global tooltip provider
  - global toaster
- Layout wrapper:
  - `DashboardLayout` wraps all routes.
- Active route map:
  - `/` -> `DashboardHome`
  - `/collections` -> `CollectionPerformance`
  - `/defaulters` -> `DefaulterAnalytics`
  - `/concessions` -> `ConcessionsLosses`
  - `/demographics` -> `DemographicsOperations`
  - `/ai-insights` -> `AIInsights`
  - fallback -> `not-found`

## 2) Pages Inventory (`client/src/pages`)

### Active pages (routed)

- `DashboardHome.tsx`
  - Executive home view.
  - Shows KPI cards, defaulter hotspot map, AI insights panel.
  - Uses dashboard data plus AI insights fetch.
  - Note: current year is fixed to `2025-26` in this page.

- `CollectionPerformance.tsx`
  - Collection-focused analytics page.
  - Covers yearly and monthly collection trends, installment timelines, fee head views, late fee metrics, and operational stats.
  - Uses dashboard aggregate data with year filter.

- `DefaulterAnalytics.tsx`
  - Defaulter deep-dive page.
  - Includes defaulter KPIs, trend charts, segmentation by occupation/location/class, and detailed defaulter table.
  - Uses dashboard aggregate data with year filter.

- `ConcessionsLosses.tsx`
  - Concession and loss analysis.
  - Includes concession trends, concession type impact, and TC/dropout loss views.
  - Uses dashboard aggregate data with year filter.

- `DemographicsOperations.tsx`
  - Demographic and operations analytics.
  - Includes payment mode behavior, class-wise/outstanding operational cuts, delay bucket analysis, and related KPIs.
  - Uses dashboard aggregate data with year filter.

- `not-found.tsx`
  - Fallback page for unmatched routes.

### Legacy/unrouted pages (present in repo)

- `Dashboard.tsx`
  - Composite legacy dashboard that assembles multiple views (`ExecutiveOverview`, `DefaulterAnalysis`, `LeakageConcessions`, `AIInsights`).
  - Not currently routed in `App.tsx`.

- `ProfessionalDashboard.tsx`
  - Large multi-tab dashboard implementation with rich charting and broad summary content.
  - Not currently routed.

- `ProfessionalDashboard.Old.tsx`
  - Older variant of professional dashboard.
  - Not currently routed.

## 3) Layout Components (`client/src/components/layout`)

- `DashboardLayout.tsx`
  - Global app frame component.
  - Composes sidebar + main content container.
  - Used by all active routes.

- `Sidebar.tsx`
  - Navigation rail and route links.
  - Controls active page selection UX.
  - Includes system status section.

- `TopBar.tsx`
  - Header controls component (search/actions/profile style).
  - Currently not wired into active layout path.

## 4) View Components (`client/src/components/views`)

- `AIInsights.tsx`
  - Chat-like AI assistant interface.
  - Includes markdown rendering, optional chart rendering, export/email actions.
  - Routed directly at `/ai-insights`.

- `DefaulterLocationMap.tsx`
  - Geographic defaulter map visualization.
  - Reused in homepage and dashboard variants.

- `DefaultersTable.tsx`
  - Reusable defaulter table with search/filter/risk grouping options.
  - Used in defaulter analytics and dashboard variants.

- `ExecutiveOverview.tsx`
  - Executive summary view component.
  - Used by legacy `Dashboard.tsx`.

- `DefaulterAnalysis.tsx`
  - Defaulter segmentation and risk behavior view component.
  - Used by legacy `Dashboard.tsx`.

- `LeakageConcessions.tsx`
  - Revenue leakage and concession-focused summary view.
  - Used by legacy `Dashboard.tsx`.

- `ActionCommandCenter.tsx`
  - Action/recommendation control center style view.
  - Present in codebase; not wired in active route flow.

## 5) Chart Utilities (`client/src/components/charts`)

- `chartUtils.tsx`
  - Shared chart tooltip and label helpers.
  - Provides reusable formatting and label components for chart consistency.

## 6) Hooks Layer (`client/src/hooks`)

- `use-api.ts`
  - Main data hooks for frontend analytics pages.
  - Exposes dashboard and domain hooks plus formatting helpers.
  - Most active pages consume `useDashboard(...)` and derive page-specific views from the returned model.

- `use-mobile.tsx`
  - Media-query/mobile detection utility hook.
  - Used by responsive UI patterns.

- `use-toast.ts`
  - Local toast state management hook used by toast UI.

## 7) Shared Lib Layer (`client/src/lib`)

- `types.ts`
  - Canonical frontend types for KPI, performance, defaulters, concessions, losses, extended analysis, and dashboard composite model.

- `queryClient.ts`
  - React Query configuration and fetch handling conventions.

- `utils.ts`
  - Shared helper utilities (`cn` class merge utility etc.).

## 8) UI Component Library (`client/src/components/ui`)

These are reusable primitives/wrappers used across pages and views.

### Core primitives

- `button.tsx`
- `input.tsx`
- `textarea.tsx`
- `label.tsx`
- `badge.tsx`
- `card.tsx`
- `table.tsx`
- `skeleton.tsx`
- `spinner.tsx`
- `separator.tsx`
- `progress.tsx`
- `empty.tsx`
- `item.tsx`
- `field.tsx`
- `kbd.tsx`

### Form and selection controls

- `checkbox.tsx`
- `radio-group.tsx`
- `switch.tsx`
- `toggle.tsx`
- `toggle-group.tsx`
- `select.tsx`
- `slider.tsx`
- `input-group.tsx`
- `input-otp.tsx`
- `form.tsx`
- `calendar.tsx`

### Overlay/navigation/interaction

- `dialog.tsx`
- `alert-dialog.tsx`
- `drawer.tsx`
- `sheet.tsx`
- `popover.tsx`
- `hover-card.tsx`
- `tooltip.tsx`
- `dropdown-menu.tsx`
- `context-menu.tsx`
- `menubar.tsx`
- `navigation-menu.tsx`
- `command.tsx`
- `breadcrumb.tsx`
- `tabs.tsx`
- `accordion.tsx`
- `collapsible.tsx`
- `scroll-area.tsx`

### Layout and composition helpers

- `sidebar.tsx` (generic reusable sidebar primitive)
- `resizable.tsx`
- `aspect-ratio.tsx`
- `carousel.tsx`
- `pagination.tsx`

### Feedback/toast/chart wrappers

- `alert.tsx`
- `toast.tsx`
- `toaster.tsx`
- `sonner.tsx`
- `chart.tsx`

## 9) Current State Observations (Non-API)

- Active routing is clean and centered around five analytics pages plus AI page.
- There is a legacy dashboard track (`Dashboard.tsx`, `ProfessionalDashboard*.tsx`) that is currently not routed.
- Some components are present but not in active flow (`TopBar`, `ActionCommandCenter`).
- Design system usage is strong through reusable UI primitives; some style logic remains duplicated in large page files.
- Homepage year is currently fixed, while other pages allow year selection, creating potential cross-page context mismatch.

## 10) Suggested Next Documentation Split (Optional)

If needed, this can be split into two docs for handoff:

- `FRONTEND_ACTIVE_FLOW_DOCUMENTATION.md`
  - Only routed pages and active components.
- `FRONTEND_LEGACY_COMPONENTS_DOCUMENTATION.md`
  - Unrouted pages/components and cleanup candidates.
