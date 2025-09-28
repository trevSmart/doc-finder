# DocFinder - AI Agent Context

## Project Overview

DocFinder is a document finder application built with Next.js 15.5.4, TypeScript, and Tailwind CSS. The application provides a modern interface for document management and search functionality.

## Tech Stack

- **Framework**: Next.js 15.5.4 with Turbopack
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4.0
- **UI Components**: Tailwind Plus Elements (Headless UI components)
- **Icons**: Heroicons
- **Development**: Hot reload with Turbopack

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with LayoutWrapper and SettingsProvider
│   ├── page.tsx            # Home page with document listing and file grid
│   ├── settings/
│   │   └── page.tsx        # Settings page with stacked layout
│   ├── globals.css         # Global styles
│   └── favicon.png         # App favicon
├── components/
│   ├── LayoutWrapper.tsx   # Main layout wrapper
│   ├── Navigation.tsx      # Top navigation bar
│   ├── SidebarNavigation.tsx # Left sidebar navigation
│   ├── ThemeToggle.tsx     # Dark/light mode toggle
│   └── FileDetailsDrawer.tsx # File details drawer component
├── contexts/
│   └── SettingsContext.tsx # React Context for settings management with localStorage
├── hooks/
│   └── useFileList.ts      # Custom hook for file listing functionality
└── types/
    └── file.ts             # TypeScript interfaces for file management
```

## Key Features

### Navigation System
- **Top Navigation**: Search bar, theme toggle, notifications, user menu
- **Sidebar Navigation**: Home, Documents, Folders, Search, Profile, Settings
- **Responsive Design**: Mobile-friendly with collapsible sidebar

### Settings Page
- **Layout**: Settings Screens variant "Stacked" from Tailwind CSS Plus
- **Sections**: Profile, Document Sources, Search Settings, Language and Dates
- **Content**: Profile management, document sources (Google Drive, Dropbox, Local folder), search settings, language/date preferences
- **Persistence**: Settings saved to localStorage automatically
- **Inline Editing**: Edit fields directly with Save/Cancel functionality

### Document Management
- **File Listing**: Displays files and folders from configured local path
- **File Grid**: Tailwind CSS Grid Lists variant "Contact cards with small portraits"
- **File Cards**: Two-section cards with content area and action buttons
- **File Details**: Click on files to open drawer with detailed information
- **Document Count**: Shows "(X found)" next to the folder path
- **File Types**: Supports files and directories with appropriate icons and badges
- **Actions**: View and Download buttons for files (folders are view-only)

### UI Components
- **FileDetailsDrawer**: Slide-out drawer for file information with dynamic content
- **File Grid**: Tailwind CSS Grid Lists with contact card layout
- **File Cards**: Two-section cards with badges, icons, and action buttons
- **Theme Toggle**: Dark/light mode switching
- **Responsive Design**: Mobile-first approach with 1/2/3 column grid

## Development Setup

### Prerequisites
- Node.js (latest LTS)
- npm or yarn

### Installation
```bash
npm install
npm run dev
```

### Development Server
- **Default Port**: 3000 (falls back to 3005 if occupied)
- **URL**: http://localhost:3005
- **Hot Reload**: Enabled with Turbopack

## Component Architecture

### LayoutWrapper
- Manages sidebar state
- Provides consistent layout structure
- Handles responsive behavior

### Navigation Components
- **Navigation.tsx**: Top bar with search and user menu
- **SidebarNavigation.tsx**: Left sidebar with main navigation
- Both support dark/light themes

### Settings Page
- Uses Tailwind Plus Elements for UI components
- Implements stacked layout pattern
- Includes form elements and navigation

## Styling System

### Tailwind CSS
- Custom configuration in `tailwind.config.js`
- Dark mode support with `dark:` prefix
- Responsive design with mobile-first approach

### Tailwind Plus Elements
- Headless UI components for accessibility
- No JavaScript framework dependencies
- Works with any modern stack

## Current State

### Working Features
- ✅ Home page with document listing and file grid
- ✅ Settings page with full layout and persistence
- ✅ Navigation system (top + sidebar)
- ✅ Theme toggle (dark/light mode)
- ✅ Responsive design
- ✅ File details drawer with dynamic content
- ✅ Document count display
- ✅ File/folder grid with click interactions
- ✅ Settings persistence with localStorage
- ✅ Inline editing for settings fields
- ✅ Routing between pages

### Navigation Routes
- `/` - Home page
- `/settings` - Settings page
- Other routes are placeholders (`#`)

### Recent Changes
- Fixed hydration mismatch in SidebarNavigation
- Removed duplicate header from settings page
- Updated navigation links to proper routes
- Implemented client-side mounting for consistency
- Added SettingsContext with localStorage persistence
- Implemented document listing with file grid
- Added document count display
- Created useFileList hook for file management
- Updated FileDetailsDrawer to accept dynamic file data
- Added inline editing for settings fields
- Removed combobox demo from home page
- Added file/folder click interactions
- Implemented Tailwind CSS Grid Lists "Contact cards with small portraits" variant
- Added View/Download action buttons for files
- Enhanced file cards with badges and circular icons

## Development Notes

### Hydration Issues
- Resolved by implementing client-side mounting pattern
- Uses `useState` and `useEffect` to prevent SSR/client mismatches

### Port Configuration
- Development server automatically uses available port
- Currently running on port 3005 (3000 was occupied)

### Code Quality
- TypeScript for type safety
- ESLint configuration
- Consistent code formatting
- Component-based architecture

## AI Agent Guidelines

### When Working on This Project
1. **Always use TypeScript** for new components
2. **Follow existing patterns** for component structure
3. **Use Tailwind CSS** for styling (avoid custom CSS)
4. **Implement responsive design** (mobile-first)
5. **Test both light and dark themes**
6. **Maintain accessibility** with proper ARIA labels
7. **Use existing UI components** from Tailwind Plus Elements
8. **Use client-side mounting** for components with hooks to avoid hydration issues
9. **Implement persistence** using localStorage for user settings
10. **Follow the established file structure** (contexts/, hooks/, types/)

### Common Tasks
- Adding new pages: Create in `src/app/` directory
- Adding components: Place in `src/components/`
- Styling: Use Tailwind classes, prefer existing patterns
- Navigation: Update `SidebarNavigation.tsx` and `Navigation.tsx`
- State management: Use React hooks, consider context for global state
- File management: Use `useFileList` hook and `FileItem` types
- Settings: Use `useSettings` hook from `SettingsContext`
- Adding new file types: Update `FileItem` interface in `src/types/file.ts`
- Adding new settings: Update `Settings` interface in `SettingsContext.tsx`

### File Locations
- **Main layout**: `src/app/layout.tsx`
- **Home page**: `src/app/page.tsx`
- **Settings**: `src/app/settings/page.tsx`
- **Navigation**: `src/components/Navigation.tsx`, `src/components/SidebarNavigation.tsx`
- **Settings Context**: `src/contexts/SettingsContext.tsx`
- **File List Hook**: `src/hooks/useFileList.ts`
- **File Types**: `src/types/file.ts`
- **Styles**: `src/app/globals.css`

## Dependencies

### Core
- `next`: ^15.5.4
- `react`: ^18.3.1
- `typescript`: ^5.6.3

### UI & Styling
- `tailwindcss`: ^4.0.0
- `@headlessui/react`: ^2.2.0
- `@heroicons/react`: ^2.2.0

### Development
- `@types/node`: ^22.10.2
- `@types/react`: ^18.3.17
- `eslint`: ^9.17.0

## Environment

- **Node.js**: Latest LTS
- **Package Manager**: npm
- **Build Tool**: Turbopack (Next.js)
- **Type Checking**: TypeScript
- **Linting**: ESLint
- **Formatting**: Prettier (if configured)

## Key Implementation Details

### Settings Management
- **Context**: `SettingsContext.tsx` provides global settings state
- **Persistence**: Automatically saves to localStorage on changes
- **Default Values**: Configured in `defaultSettings` object
- **Updates**: Use `updateProfile`, `updateDocumentSources`, `updateLanguageAndDates` functions

### File Management
- **Hook**: `useFileList.ts` handles file listing logic
- **Types**: `FileItem` interface defines file structure
- **Mock Data**: Currently uses simulated file data
- **States**: Loading, error, and success states handled
- **Count Display**: Shows "(X found)" when files are available

### Component Patterns
- **Client Components**: Use `'use client'` directive for interactive components
- **Hydration Safety**: Implement `mounted` state to prevent SSR/client mismatches
- **Dynamic Content**: FileDetailsDrawer accepts `file` prop for dynamic data
- **Responsive Design**: Grid layouts adapt to screen size (1/2/3 columns)
- **Grid Lists**: Use Tailwind CSS Grid Lists patterns for file cards
- **Action Buttons**: Implement View/Download actions for files only

### Data Flow
1. Settings stored in localStorage via SettingsContext
2. Home page reads local folder path from settings
3. useFileList hook fetches files based on path
4. File grid displays files with count
5. Clicking files opens drawer with details

---

*Last updated: January 2025*
*Project version: 0.3.0*
