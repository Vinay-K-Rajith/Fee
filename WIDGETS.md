# Widgets Documentation

## Overview
This document details all frontend widgets (components) organized by functional domain, including component sizing, structure, and backend logic connections. Each widget is designed following a first-principles approach to ensure modularity, reusability, and clear data flow.

---

## Core Design Principles

1. **Component Hierarchy**: Atomic → Molecular → Organisms
2. **Data Flow**: Backend API → React Query (caching) → Component State
3. **Sizing Convention**: Tailwind CSS with min-height/min-width constraints
4. **Backend Integration**: RESTful API endpoints with optional year filtering

---

## 1. INPUT WIDGETS

### Input
**File**: `client/src/components/ui/input.tsx`
- **Size**: h-9 (36px) | w-full
- **Padding**: px-3 py-1
- **Border**: rounded-md
- **Backend Connection**: Direct form state → API payloads
- **Use Case**: Text input fields for filtering, searching, data entry
- **State Management**: Controlled via React state or form libraries

### Field
**File**: `client/src/components/ui/field.tsx`
- **Size**: Variable (wraps around inputs)
- **Purpose**: Wrapper component for labeled form fields
- **Backend Connection**: Passes value to parent form submission handlers
- **Structure**:
  - Contains Label + Input + validation messages
  - Manages field-level error states

### Form
**File**: `client/src/components/ui/form.tsx`
- **Size**: Full-width container
- **Backend Connection**:
  - Submits form data to `/api/*` endpoints
  - Handles success/error states
  - Triggers data re-validation on backend
- **Use Case**: Multi-field data entry with validation
- **Query Integration**: Uses React Query mutations for submission

### Textarea
**File**: `client/src/components/ui/textarea.tsx`
- **Size**: min-h-24 | w-full
- **Purpose**: Multi-line text input
- **Backend Connection**: Similar to Input, posts text data to backend

### Select
**File**: `client/src/components/ui/select.tsx`
- **Size**: h-9 | w-full (adjustable)
- **Purpose**: Dropdown selection (e.g., year filter: 2023-24, 2024-25, 2025-26)
- **Backend Connection**:
  - Selected value passed as query parameter: `?year=2024-25`
  - Triggers API refetch via React Query
  - Example endpoint: `/api/kpi/summary?year=2024-25`

### Checkbox
**File**: `client/src/components/ui/checkbox.tsx`
- **Size**: w-4 h-4
- **Purpose**: Boolean toggles (e.g., filter multiple statuses)
- **Backend Connection**: Multiple checked values → API query array params

### Radio Group
**File**: `client/src/components/ui/radio-group.tsx`
- **Size**: w-4 h-4 (radio dot)
- **Purpose**: Mutually exclusive selections (e.g., collection mode)
- **Backend Connection**: Selected radio value passed as single parameter

### Toggle
**File**: `client/src/components/ui/toggle.tsx`
- **Size**: min-h-9 px-3
- **Purpose**: On/off state for UI controls
- **Backend Connection**: Optional; primarily UI state management

### Toggle Group
**File**: `client/src/components/ui/toggle-group.tsx`
- **Size**: min-h-9 per toggle
- **Purpose**: Multiple toggle options (e.g., view mode: List/Grid)
- **Backend Connection**: Selected option stored in URL or component state

### Slider
**File**: `client/src/components/ui/slider.tsx`
- **Size**: h-2 (track) | w-full
- **Purpose**: Range selection (e.g., filter balance amount range)
- **Backend Connection**: Value sent as query params: `?minBalance=0&maxBalance=50000`

### Input OTP
**File**: `client/src/components/ui/input-otp.tsx`
- **Size**: h-9 per digit | variable width
- **Purpose**: One-time password entry (future: 2FA)
- **Backend Connection**: Validates OTP via `/api/verify-otp` endpoint

### Input Group
**File**: `client/src/components/ui/input-group.tsx`
- **Size**: Wraps multiple inputs (h-9 + spacing)
- **Purpose**: Groups related inputs (e.g., date range: From / To)
- **Backend Connection**: All grouped values sent together as single API call

---

## 2. DISPLAY WIDGETS

### Card
**File**: `client/src/components/ui/card.tsx`
- **Size**: Min-width 240px | responsive (full-width on mobile)
- **Structure**:
  - `Card`: Base container (rounded-xl | border | bg-card | shadow)
  - `CardHeader`: p-6 (padding)
  - `CardContent`: p-6
  - `CardFooter`: p-6 (typically action buttons)
- **Backend Connection**: Receives aggregated data object from API
- **Use Case**: KPI metric display, summary information
- **Example**:
  ```
  Data Flow: /api/kpi/summary → useKPISummary() → Card displays totalFeeCollection
  ```

### Badge
**File**: `client/src/components/ui/badge.tsx`
- **Size**: px-2.5 py-0.5 | text-xs
- **Purpose**: Status labels (Active, TC, Dropout, Defaulter)
- **Backend Connection**: Receives `currentStatus` from student/collection records
- **Variants**: default, secondary, destructive (for critical states)

### Alert
**File**: `client/src/components/ui/alert.tsx`
- **Size**: p-4 | rounded-md | full-width
- **Purpose**: Inline notifications (warnings, errors, info)
- **Backend Connection**: Triggered on API errors or validation failures
- **Example**: "Cheque Bounce Detected" when chequeBounces > 0

### Alert Dialog
**File**: `client/src/components/ui/alert-dialog.tsx`
- **Size**: Modal overlay | 400px width (configurable)
- **Purpose**: Confirmation dialogs before critical actions
- **Backend Connection**: 
  - Confirms destructive actions (data deletion, status update)
  - On confirm: triggers API mutation
  - Example: "Confirm mark as defaulter" → PATCH `/api/student/:id`

### Table
**File**: `client/src/components/ui/table.tsx`
- **Size**: Full-width | responsive (horizontal scroll on mobile)
- **Structure**:
  - `Table`: Base wrapper
  - `TableHeader`: th elements with borders
  - `TableBody`: td elements
  - `TableFooter`: Summary row (optional)
- **Backend Connection**:
  - Receives array from API: `/api/defaulters/analysis` → defaulterList
  - Each row represents one database record
  - Typical table rows: 50-100 per page (pagination handles overflow)
- **Columns Map** (example for defaulters):
  | admissionNo | name | className | balance |
  | Reference to student record | From collection data | From class field | Dynamic calculation |

### Pagination
**File**: `client/src/components/ui/pagination.tsx`
- **Size**: h-9 buttons | 24px gap
- **Purpose**: Navigate through paginated data
- **Backend Connection**:
  - Query params: `?page=1&limit=50`
  - API returns `{ data: [...], total: 1234, page: 1 }`
  - Component re-requests data on page change

### Breadcrumb
**File**: `client/src/components/ui/breadcrumb.tsx`
- **Size**: h-6 | px-2 per item
- **Purpose**: Navigation hierarchy (not currently used in core pages)
- **Backend Connection**: Can link to filtered views

### Skeleton
**File**: `client/src/components/ui/skeleton.tsx`
- **Size**: Matches target widget size (h-9 for inputs, h-48 for cards)
- **Purpose**: Loading placeholders while data fetches
- **Backend Connection**: Shown during React Query loading state
- **Example**: 3 CardSkeleton components displayed while `/api/kpi/summary` loads

### Empty
**File**: `client/src/components/ui/empty.tsx`
- **Size**: h-64 | full-width container
- **Purpose**: Display when no data matches filters
- **Backend Connection**: Shown when API returns empty array
- **Message**: "No defaulters found for this filter"

---

## 3. NAVIGATION & LAYOUT WIDGETS

### Sidebar
**File**: `client/src/components/layout/Sidebar.tsx`
- **Size**: w-64 (fixed) | h-screen
- **Purpose**: Main navigation container
- **Structure**:
  - Logo section (h-16)
  - Navigation menu items
  - User profile section (bottom)
- **Backend Connection**: 
  - No direct API calls
  - Links to different pages that trigger their own API calls
  - Highlights active page based on URL

### TopBar
**File**: `client/src/components/layout/TopBar.tsx`
- **Size**: h-16 | full-width
- **Purpose**: Header with title, user info, logout
- **Backend Connection**: 
  - Displays user name (from session/auth)
  - Logout triggers API call: `POST /api/logout`

### DashboardLayout
**File**: `client/src/components/layout/DashboardLayout.tsx`
- **Size**: h-screen (full viewport)
- **Structure**:
  - Sidebar (left) + Main content (right)
  - Main content: p-6 to p-8 padding
  - Max-width: max-w-7xl (1280px) for readability
- **Backend Connection**: 
  - Wraps all pages
  - Doesn't fetch data itself; children handle API calls

### Sheet (Drawer)
**File**: `client/src/components/ui/sheet.tsx`
- **Size**: w-72 (mobile) to w-96 (desktop) | h-screen
- **Purpose**: Slide-out panel (e.g., filter panel)
- **Backend Connection**: 
  - Filter selections update URL query params
  - Query param change triggers API refetch
  - Example: Sheet filter → select year → URL: `?year=2024-25` → API refetch

### Dialog
**File**: `client/src/components/ui/dialog.tsx`
- **Size**: w-96 (default) | rounded-lg
- **Purpose**: Modal overlays for detailed data, forms
- **Backend Connection**:
  - Can contain forms that POST/PATCH data
  - On success, closes dialog and refetches parent data
  - Example: "Edit Student Status" dialog → PATCH `/api/student/:id` → refetch defaulter list

### Drawer
**File**: `client/src/components/ui/drawer.tsx`
- **Size**: w-full (mobile) | h-auto
- **Purpose**: Mobile-optimized side panel
- **Backend Connection**: Same as Sheet (filter selections)

### Dropdown Menu
**File**: `client/src/components/ui/dropdown-menu.tsx`
- **Size**: 160px min-width | auto height
- **Purpose**: Context menus (e.g., actions on table row)
- **Backend Connection**:
  - Items trigger API calls (delete, export, duplicate)
  - Example: "Export as CSV" → `GET /api/defaulters/export?format=csv`

### Context Menu
**File**: `client/src/components/ui/context-menu.tsx`
- **Size**: 160px | auto height
- **Purpose**: Right-click menus
- **Backend Connection**: Similar to dropdown, triggers data mutations

### Navigation Menu
**File**: `client/src/components/ui/navigation-menu.tsx`
- **Size**: h-10 per item | full-width container
- **Purpose**: Horizontal navigation tabs
- **Backend Connection**:
  - Tabs filter view (e.g., "Collection", "Defaulters", "Concessions")
  - Tab change updates URL and triggers different API endpoint
  - Example: Click "Concessions" tab → URL: `/concessions?year=2024-25` → fetch `/api/concessions/analysis?year=2024-25`

### Menubar
**File**: `client/src/components/ui/menubar.tsx`
- **Size**: h-10 | full-width
- **Purpose**: Menu bar for application-level options
- **Backend Connection**: Similar to dropdown, triggers page-level actions

---

## 4. BUTTON & ACTION WIDGETS

### Button
**File**: `client/src/components/ui/button.tsx`
- **Size Variants**:
  - `default`: min-h-9 | px-4 py-2
  - `sm`: min-h-8 | px-3 | text-xs
  - `lg`: min-h-10 | px-8
  - `icon`: h-9 w-9 (square icon-only)
- **Variants**: default, destructive, outline, secondary, ghost, link
- **Backend Connection**:
  - `onClick` handler triggers API calls or form submission
  - Example: "Export" button → triggers `/api/export` mutation
  - Can be disabled during API loading state
- **Usage**:
  - Primary action: default variant
  - Destructive action (delete): destructive variant
  - Secondary action (cancel): secondary variant

### Button Group
**File**: `client/src/components/ui/button-group.tsx`
- **Size**: h-9 | gap-0 (flush buttons)
- **Purpose**: Related buttons in a group
- **Backend Connection**: Each button triggers different API endpoint
- **Example**: "Previous Month | Current Month | Next Month"

### Toggle (Action)
**File**: `client/src/components/ui/toggle.tsx`
- **Size**: min-h-9 | px-3
- **Purpose**: Sticky button state (e.g., "Favorite", "Pin")
- **Backend Connection**:
  - Toggle on: `PUT /api/student/:id/favorite`
  - Toggle off: `DELETE /api/student/:id/favorite`

---

## 5. MODAL & OVERLAY WIDGETS

### Dialog (Modal)
**File**: `client/src/components/ui/dialog.tsx`
- **Size**: w-96 | rounded-lg | shadow-lg
- **Purpose**: Focused task in overlay
- **Backend Connection**:
  - Can contain forms
  - On submit: post data to API
  - On close: optionally refetch parent data

### Alert Dialog
**File**: `client/src/components/ui/alert-dialog.tsx`
- **Size**: w-full max-w-md | centered
- **Purpose**: Confirmation dialogs
- **Backend Connection**: "Confirm" button triggers destructive API operation

### Popover
**File**: `client/src/components/ui/popover.tsx`
- **Size**: w-80 | max-h-96
- **Purpose**: Contextual information popup
- **Backend Connection**: Can trigger lazy data fetch on open
- **Example**: Hover over defaulter name → popover shows full payment history

### Hover Card
**File**: `client/src/components/ui/hover-card.tsx`
- **Size**: w-80 | auto height
- **Purpose**: Rich preview on hover
- **Backend Connection**: Lazy loads detailed data on hover
- **Example**: Hover over admission number → shows student snapshot

### Tooltip
**File**: `client/src/components/ui/tooltip.tsx`
- **Size**: max-w-xs | px-2 py-1
- **Purpose**: Brief helper text
- **Backend Connection**: None (static text)
- **Example**: Tooltip on "Collection Rate" icon explains the metric

---

## 6. DATA VISUALIZATION WIDGETS

### Chart
**File**: `client/src/components/ui/chart.tsx`
- **Size**: h-80 (default) | w-full
- **Backend Connection**:
  - Receives array of data points from API
  - Example: `/api/performance/monthly` → renders 12-point line chart
- **Supported Chart Types**:
  - Line Chart: Trend over time (monthly collection rate)
  - Bar Chart: Comparison across categories (defaulters by occupation)
  - Pie Chart: Proportional breakdown (payment mode distribution)
  - Area Chart: Stacked comparison (income vs expenses)
- **Data Flow**:
  ```
  API Response: [
    { month: 'Apr', totalExpected: 100000, totalCollected: 85000, collectionRate: 85 },
    { month: 'May', totalExpected: 110000, totalCollected: 95000, collectionRate: 86.4 },
    ...
  ]
  ↓
  useMonthlyPerformance() hook
  ↓
  Chart renders with custom formatters
  ```

### Chart Utils (Formatter)
**File**: `client/src/components/charts/chartUtils.tsx`
- **Purpose**: Centralized formatting for chart values
- **Functions**:
  - `formatValue()`: Converts number to appropriate format (%, ₹, count)
  - `formatCompactValue()`: Shortens large numbers (₹1.2L, ₹5Cr, 23k)
  - `CustomBarLabel()`: Renders values on bars
  - `CustomBarLabelVertical()`: Renders values at bar ends
- **Backend Connection**: Interprets field names from API to determine format
  - Field name contains "Rate" → format as percentage
  - Field name contains "Balance" → format as currency
  - Field name contains "Count" → format as integer

---

## 7. FEEDBACK & STATUS WIDGETS

### Progress
**File**: `client/src/components/ui/progress.tsx`
- **Size**: h-2 | w-full
- **Purpose**: Visual indicator of progress (e.g., collection rate vs benchmark)
- **Backend Connection**: Receives `current / max` values from API
- **Example**: Progress = (collected / netExpected) * 100

### Spinner
**File**: `client/src/components/ui/spinner.tsx`
- **Size**: w-6 h-6 (default) | w-4 h-4 (small)
- **Purpose**: Loading indicator
- **Backend Connection**:
  - Shown during `useQuery` loading state
  - Disappears when data arrives or error occurs

### Toast / Toaster
**File**: `client/src/components/ui/toast.tsx` & `toaster.tsx`
- **Size**: w-96 | h-auto | px-4 py-3
- **Purpose**: Non-blocking notifications
- **Backend Connection**:
  - On API error: show error toast with message
  - On API success: show success confirmation
  - Example: "Student marked as defaulter" (success) / "Failed to update" (error)
- **Positioning**: Bottom-right corner

### Sonner (Advanced Toast)
**File**: `client/src/components/ui/sonner.tsx`
- **Size**: Similar to Toast
- **Purpose**: Enhanced toast with actions
- **Backend Connection**: Same as Toast, plus can include "Undo" action linked to API

---

## 8. TEXT & TYPOGRAPHY WIDGETS

### Label
**File**: `client/src/components/ui/label.tsx`
- **Size**: h-6 | text-sm
- **Purpose**: Form field labels
- **Backend Connection**: None (static)
- **Usage**: Pair with Input or Textarea via `htmlFor` attribute

### Separator
**File**: `client/src/components/ui/separator.tsx`
- **Size**: h-px | w-full
- **Purpose**: Visual divider between sections
- **Backend Connection**: None (static)

### KBD (Keyboard)
**File**: `client/src/components/ui/kbd.tsx`
- **Size**: px-1.5 py-0.5 | text-xs
- **Purpose**: Display keyboard shortcuts
- **Backend Connection**: None (static)

---

## 9. LIST & GROUPING WIDGETS

### Accordion
**File**: `client/src/components/ui/accordion.tsx`
- **Size**: w-full | variable height per section
- **Purpose**: Expandable sections of content
- **Backend Connection**:
  - Each section can contain data from API
  - Example: Accordion for each defaulter type, lazy-loads details on expand
- **Structure**:
  - `AccordionItem`: Single expandable section
  - `AccordionTrigger`: Click area (h-10)
  - `AccordionContent`: Expanded content (p-4)

### Collapsible
**File**: `client/src/components/ui/collapsible.tsx`
- **Size**: w-full | variable height
- **Purpose**: Show/hide content block
- **Backend Connection**: Similar to accordion, can toggle detailed view
- **Example**: "Show Payment History" collapsible triggers lazy fetch

### Command (Search/Filter)
**File**: `client/src/components/ui/command.tsx`
- **Size**: w-96 | h-auto | rounded-lg
- **Purpose**: Searchable dropdown/command palette
- **Backend Connection**:
  - Search input queries API for matches
  - Example: Student search → `/api/search/students?q=Raj Kumar`
  - Results displayed in list format
  - On select: Navigate to student detail page or trigger action

### Item (List Item)
**File**: `client/src/components/ui/item.tsx`
- **Size**: h-auto | px-3 py-2 | full-width
- **Purpose**: Single item in a list
- **Backend Connection**: Represents one record from API array
- **Used In**: Table rows, dropdown items, search results

---

## 10. UTILITY & LAYOUT WIDGETS

### Aspect Ratio
**File**: `client/src/components/ui/aspect-ratio.tsx`
- **Purpose**: Maintain aspect ratio for responsive content
- **Backend Connection**: None (layout utility)
- **Use Case**: Chart containers maintain 16:9 ratio across screen sizes

### Resizable
**File**: `client/src/components/ui/resizable.tsx`
- **Size**: Configurable by user drag
- **Purpose**: User-draggable panel resizing
- **Backend Connection**: Can persist resize preference to localStorage/API
- **Example**: Adjustable dashboard panel widths

### Scroll Area
**File**: `client/src/components/ui/scroll-area.tsx`
- **Size**: Full parent | h-400 (configurable)
- **Purpose**: Styled scrollable container
- **Backend Connection**: 
  - Wraps long tables or lists
  - Can implement virtual scrolling for 1000+ rows
  - Infinite scroll pattern: load more data on scroll-to-bottom

### Carousel
**File**: `client/src/components/ui/carousel.tsx`
- **Size**: w-full | variable height
- **Purpose**: Image/content carousel
- **Backend Connection**: Can fetch image URLs from API
- **Example**: Student photo gallery carousel (if feature exists)

### Avatar
**File**: `client/src/components/ui/avatar.tsx`
- **Size**: w-10 h-10 (default)
- **Purpose**: User/student profile picture
- **Backend Connection**: 
  - `src` URL from API user profile
  - Falls back to initials if no image
- **Usage**: TopBar user avatar, student list avatars

---

## 11. DATA INPUT PATTERNS

### Filter Pattern (Form Inputs → Query Params → API Refetch)
```
User Flow:
1. User clicks year dropdown (Select component)
2. Selected value: "2024-25"
3. Component updates URL: ?year=2024-25
4. React Router triggers route change
5. Parent component detects queryParam change
6. useKPISummary(yearFilter) hook re-runs
7. API call: GET /api/kpi/summary?year=2024-25
8. Data fetches, charts/cards re-render
```

### Pagination Pattern
```
User Flow:
1. Table displays page 1 of results (50 items)
2. User clicks "Next" button (Pagination component)
3. URL updates: ?page=2
4. Table component re-queries API: GET /api/defaulters?page=2&limit=50
5. New data loads, table scrolls to top
```

### Form Submission Pattern
```
User Flow:
1. User fills form fields (Input, Textarea, Select)
2. User clicks "Submit" button (Button component)
3. Form validation runs
4. If valid: Button disabled, Spinner shown
5. Form data POSTed: POST /api/student/create { name, className, ... }
6. Backend processes, returns { success: true, id: 123 }
7. Toast shows success message
8. Dialog closes, parent page refetches data
9. New student appears in list
```

---

## 12. BACKEND API MAPPING

### Core Endpoint Groups

#### KPI & Summary (`/api/kpi/*`)
- **Endpoint**: `GET /api/kpi/summary?year=2024-25`
- **Component**: Card widgets displaying metrics
- **Data Fields**: totalFeeCollection, collectionRate, totalDefaulters, etc.
- **Cache**: 5 minutes (via React Query)
- **Filter Param**: `?year=2023-24|2024-25|2025-26|All Years`

#### Performance Analysis (`/api/performance/*`)
- **Endpoints**:
  - `GET /api/performance/yearly` → Chart (Line/Bar)
  - `GET /api/performance/monthly?year=2024-25` → Chart (Bar/Area)
- **Components**: LineChart, BarChart
- **Data Structure**: Array of { month, totalExpected, totalCollected, collectionRate, ... }
- **Cache**: 5 minutes

#### Defaulter Analysis (`/api/defaulters/*`)
- **Endpoints**:
  - `GET /api/defaulters/analysis?year=2024-25` → Comprehensive analysis
  - `GET /api/defaulters/occupation?year=2024-25` → Occupational breakdown
  - `GET /api/defaulters/location?year=2024-25` → Geographic breakdown
  - `GET /api/defaulters/class?year=2024-25` → Class-wise breakdown
- **Components**: Table, BarChart (occupation/location), ClassChart
- **Data Structure**: 
  - occupationWise: Array of { occupation, defaulterCount, defaulterRate, ... }
  - locationWise: Array of { location, defaulterCount, totalBalance, ... }
  - classWise: Array of { className, defaulterCount, totalBalance, ... }
  - defaulterList: Array of { admissionNo, name, balance, ... }
- **Cache**: 5 minutes

#### Concession Analysis (`/api/concessions/*`)
- **Endpoint**: `GET /api/concessions/analysis?year=2024-25`
- **Components**: Card (metrics), PieChart (concession type distribution)
- **Data Fields**: totalConcession, studentsWithConcession, concessionRate, concessionTypeWise
- **Cache**: 5 minutes

#### Payment Mode Analysis (`/api/payment-modes/*`)
- **Endpoint**: `GET /api/payment-modes/analysis?year=2024-25`
- **Components**: PieChart, BarChart (payment mode distribution)
- **Data Structure**: Array of { paymentMode, transactionCount, totalAmount, ... }
- **Cache**: 5 minutes

#### Benchmarks (`/api/benchmarks`)
- **Endpoint**: `GET /api/benchmarks`
- **Components**: Progress bars, Metric cards
- **Data Fields**: collectionRateBenchmark (85%), defaulterRateBenchmark (15%), etc.
- **Cache**: 30 minutes (static reference data)

---

## 13. COMPONENT SIZE REFERENCE TABLE

| Component | Width | Height | Padding | Use Case |
|-----------|-------|--------|---------|----------|
| Input | w-full | h-9 | px-3 py-1 | Text entry |
| Button (default) | auto | min-h-9 | px-4 py-2 | Primary action |
| Button (sm) | auto | min-h-8 | px-3 | Secondary action |
| Button (lg) | auto | min-h-10 | px-8 | Featured action |
| Card | 240px+ | auto | p-6 | Data container |
| Badge | auto | auto | px-2.5 py-0.5 | Status label |
| Table | w-full | auto | - | Data grid |
| Chart | w-full | h-80 | p-4 | Data visualization |
| Dialog | w-96 | auto | p-6 | Modal |
| Toast | w-96 | auto | px-4 py-3 | Notification |
| Sidebar | w-64 | h-screen | - | Navigation |
| Spinner | w-6 h-6 | - | - | Loading |
| Progress | w-full | h-2 | - | Progress bar |
| Pagination | auto | h-9 | - | Navigation |
| Sheet | w-72/96 | h-screen | p-4 | Side panel |
| Accordion | w-full | auto | - | Expandable section |

---

## 14. RENDERING PERFORMANCE CONSIDERATIONS

### Lazy Loading Pattern
```typescript
// Load data only when component mounts or filter changes
const { data, isLoading } = useDefaulterAnalysis(yearFilter);

// Render skeleton during loading
if (isLoading) return <Skeleton />;

// Render data or empty state
if (!data?.defaulterList?.length) return <Empty />;
return <Table data={data.defaulterList} />;
```

### Virtual Scrolling (For Tables > 500 rows)
- Use `react-window` library to render only visible rows
- Backend API should support `limit` and `offset` query params
- Example: `GET /api/defaulters/list?offset=0&limit=50`

### Memoization
- Memoize Chart components to prevent re-renders on parent state change
- Use `useMemo()` for expensive calculations (aggregations)
- Use `useCallback()` for event handlers passed to child components

---

## 15. RESPONSIVE DESIGN BREAKPOINTS

All components use Tailwind CSS responsive prefixes:

| Breakpoint | Width | Prefix | Example |
|-----------|-------|--------|---------|
| Mobile | < 640px | sm: | `w-full sm:w-96` |
| Tablet | 640px - 1024px | md: | `p-4 md:p-6` |
| Desktop | 1024px+ | lg: | `w-64 lg:w-96` |

**Key Component Adjustments**:
- **Sidebar**: Hidden on mobile (overlay via Sheet)
- **Card**: Full-width on mobile, grid layout on desktop
- **Table**: Horizontal scroll on mobile, full table on desktop
- **Dialog**: Full-screen on mobile, centered w-96 on desktop
- **Chart**: h-64 on mobile, h-80 on desktop

---

## 16. ACCESSIBILITY STANDARDS

All widgets follow WCAG 2.1 Level AA:

- **Keyboard Navigation**: All interactive elements tab-accessible
- **ARIA Labels**: Semantic HTML with `aria-label`, `aria-describedby`
- **Color Contrast**: Text meets 4.5:1 contrast ratio minimum
- **Focus Indicators**: Visible focus rings on all buttons/inputs
- **Error Messages**: Associated with form fields via `aria-invalid`

---

## 17. STATE MANAGEMENT FLOW

```
Global State:
- Year Filter (from URL ?year=2024-25)
- Auth Status (user login state)

Component State (React Query):
- Dashboard data cache (5 min TTL)
- Defaulter analysis cache (5 min TTL)
- Performance charts cache (5 min TTL)

Local Component State:
- Form field values (Input controlled state)
- Modal open/close state (Dialog isOpen)
- Pagination current page (Pagination currentPage)
- Sort order (Table header click)

State Updates Trigger:
1. User interaction (click, type, select)
2. URL parameter change (?year=2024-25)
3. API response arrival (data refetch)
4. Component mount/unmount
```

---

## 18. ERROR HANDLING & FALLBACKS

### API Error Handling
```typescript
const { data, error, isError } = useKPISummary(yearFilter);

if (isError) {
  return (
    <Alert variant="destructive">
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{error?.message}</AlertDescription>
    </Alert>
  );
}
```

### Component Fallbacks
- **Loading**: Skeleton components
- **Empty**: Empty state component with message
- **Error**: Alert component with retry button
- **Network Offline**: Toast notification with sync status

---

## 19. QUICK COMPONENT SELECTION GUIDE

**Need to display:**
- Single metric? → **Card**
- Trend over time? → **LineChart** or **AreaChart**
- Comparison across categories? → **BarChart**
- Proportional breakdown? → **PieChart**
- Multiple records? → **Table**
- Filter/search data? → **Select**, **Input**, **Command**
- Confirm action? → **AlertDialog**
- Quick notification? → **Toast**
- Show/hide details? → **Accordion** or **Collapsible**
- Loading state? → **Skeleton**
- No results? → **Empty**

---

## 20. DEVELOPMENT WORKFLOW

### Adding New Widget
1. Create component in `/client/src/components/ui/ComponentName.tsx`
2. Export from index or directly import in parent
3. Add TypeScript interface for props
4. Style using Tailwind utility classes
5. Test responsive behavior (mobile/tablet/desktop)
6. Document component API (props, variants, sizes)
7. Add to this WIDGETS.md document

### Connecting to Backend
1. Identify required API endpoint
2. Check if hook exists in `/client/src/hooks/use-api.ts`
3. If not, create new React Query hook: `useNewData(filters?)`
4. Import hook in component
5. Handle loading, error, and success states
6. Pass data to presentation components

---

**Last Updated**: April 19, 2026  
**Version**: 1.0  
**Component Count**: 51 widgets
