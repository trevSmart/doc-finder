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
│   ├── api/
│   │   ├── files/
│   │   │   └── route.ts    # API endpoint for file listing
│   │   └── file-preview/
│   │       └── route.ts    # API endpoint for file preview content
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Home page with document listing and file grid
│   ├── settings/
│   │   └── page.tsx        # Settings page with stacked layout
│   ├── globals.css         # Global styles
│   └── favicon.png         # App favicon
├── components/
│   ├── LayoutWrapper.tsx   # Main layout wrapper with resizable sidebar
│   ├── Navigation.tsx      # Top navigation bar
│   ├── SidebarNavigation.tsx # Left sidebar navigation
│   ├── ThemeToggle.tsx     # Dark/light mode toggle
│   ├── FileDetailsSidebar.tsx # File details sidebar component
│   ├── FilePreview.tsx     # File preview component with multiple formats
│   └── TagSelector.tsx     # Tag selection component for file tagging
├── contexts/
│   ├── SettingsContext.tsx # React Context for settings management
│   ├── FileDetailsContext.tsx # Context for file details sidebar state
│   ├── SearchContext.tsx   # Context for search functionality with debouncing
│   ├── FileTagsContext.tsx # Context for file-specific tag management
│   ├── TagContext.tsx      # Context for global tag definitions
│   ├── FileListContext.tsx # Context for file list state management
│   └── FilePreviewContext.tsx # Context for file preview state
├── hooks/
│   ├── useFileList.ts      # Custom hook for file listing functionality
│   ├── useResizableSidebar.ts # Hook for resizable sidebar functionality
│   └── useResizableRightSidebar.ts # Hook for right sidebar resizing
├── types/
│   ├── file.ts             # TypeScript interfaces for file management
│   ├── filePreview.ts      # TypeScript interfaces for file preview
│   ├── tag.ts              # TypeScript interfaces for tag management
│   └── pptx2json.d.ts      # TypeScript declarations for PPTX parsing
└── utils/
    └── fileUtils.ts        # Utility functions for file operations
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
- **File Listing**: Displays files and folders from configured local path via API
- **File Grid**: Tailwind CSS Grid Lists variant "Contact cards with small portraits"
- **File Cards**: Two-section cards with content area and action buttons
- **File Details**: Click on files to open sidebar with detailed information
- **Document Count**: Shows "(X found)" next to the folder path
- **File Types**: Supports files and directories with appropriate icons and badges
- **Actions**: View and Download buttons for files (folders are view-only)
- **File Preview**: Supports preview for images, PDFs, Markdown, JSON, and text files
- **Resizable Sidebar**: Sidebar can be resized with mouse drag, width persisted in localStorage

### UI Components
- **FileDetailsSidebar**: Slide-out sidebar for file information with dynamic content
- **FilePreview**: Component for previewing different file types (images, PDFs, Markdown, JSON, text)
- **File Grid**: Tailwind CSS Grid Lists with contact card layout
- **File Cards**: Two-section cards with badges, icons, and action buttons
- **Theme Toggle**: Dark/light mode switching
- **Responsive Design**: Mobile-first approach with 1/2/3 column grid
- **Resizable Sidebar**: Interactive sidebar with drag-to-resize functionality

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
- **Default Port**: 3000 (falls back to available port if occupied)
- **URL**: http://localhost:3005 (current)
- **Hot Reload**: Enabled with Turbopack

## Component Architecture

### LayoutWrapper
- Manages sidebar state and resizable functionality
- Provides consistent layout structure
- Handles responsive behavior
- Integrates FileDetailsContext and SearchContext providers

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
- ✅ File details sidebar with dynamic content
- ✅ Document count display
- ✅ File/folder grid with click interactions
- ✅ Settings persistence with localStorage
- ✅ Inline editing for settings fields
- ✅ Routing between pages
- ✅ File preview system (images, PDFs, Markdown, JSON, text)
- ✅ Resizable sidebar with localStorage persistence
- ✅ API endpoints for file listing and preview
- ✅ Search functionality with debouncing
- ✅ File type detection and categorization
- ✅ File utilities for size formatting and type checking
- ✅ Tag management system with persistence
- ✅ File tagging functionality
- ✅ Search by tags (name and color)

### Navigation Routes
- `/` - Home page
- `/settings` - Settings page
- `/tags` - Tags management page
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
- Updated FileDetailsSidebar to accept dynamic file data
- Added inline editing for settings fields
- Removed combobox demo from home page
- Added file/folder click interactions
- Implemented Tailwind CSS Grid Lists "Contact cards with small portraits" variant
- Added View/Download action buttons for files
- Enhanced file cards with badges and circular icons
- **NEW**: Added API endpoints for file listing and preview
- **NEW**: Implemented FilePreview component with support for multiple file types
- **NEW**: Added FileDetailsContext for managing sidebar state
- **NEW**: Added SearchContext with debounced search functionality
- **NEW**: Created useResizableSidebar hook for interactive sidebar resizing
- **NEW**: Added fileUtils with comprehensive file type detection and formatting
- **NEW**: Enhanced file categorization with proper MIME types and extensions
- **NEW**: Implemented smooth transitions for FileDetailsSidebar (slide in/out from right)
- **NEW**: Removed overlay/backdrop from FileDetailsSidebar to allow continued work on main content
- **NEW**: Added tag management system with TagContext and TagSelector component
- **NEW**: Implemented file tagging functionality with FileTagsContext
- **NEW**: Added tags management page with create, edit, and delete capabilities
- **NEW**: Enhanced search functionality to include tag name and color search
- **NEW**: Added tag persistence to localStorage with automatic save/load

## Development Notes

### Hydration Issues
- Resolved by implementing client-side mounting pattern
- Uses `useState` and `useEffect` to prevent SSR/client mismatches

### Port Configuration
- Development server automatically uses available port
- Currently running on port 3007 (3000 was occupied)

### Code Quality
- TypeScript for type safety
- ESLint configuration
- Consistent code formatting
- Component-based architecture

## AI Agent Guidelines

### Autonomous Testing Capabilities
- **Playwright MCP Server**: The agent has access to a Playwright MCP server for autonomous browser testing
- **Direct Testing**: Can automatically test features by navigating to the application and interacting with UI elements
- **Real-time Validation**: Can verify implementations work correctly in the browser without manual intervention
- **Screenshot Capture**: Can take screenshots to document UI changes and verify visual implementations
- **Interactive Testing**: Can click buttons, fill forms, and test user workflows autonomously

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
11. **Test implementations autonomously** using the Playwright MCP server when possible
12. **Verify UI changes** with screenshots and interactive testing

### Common Tasks
- Adding new pages: Create in `src/app/` directory
- Adding components: Place in `src/components/`
- Styling: Use Tailwind classes, prefer existing patterns
- Navigation: Update `SidebarNavigation.tsx` and `Navigation.tsx`
- State management: Use React hooks, consider context for global state
- File management: Use `useFileList` hook and `FileItem` types
- Settings: Use `useSettings` hook from `SettingsContext`
- Tag management: Use `useTags` hook from `TagContext`
- File tagging: Use `useFileTags` hook from `FileTagsContext`
- Adding new file types: Update `FileItem` interface in `src/types/file.ts`
- Adding new settings: Update `Settings` interface in `SettingsContext.tsx`
- Adding new tag properties: Update `Tag` interface in `src/types/tag.ts`

### File Locations
- **Main layout**: `src/app/layout.tsx`
- **Home page**: `src/app/page.tsx`
- **Settings**: `src/app/settings/page.tsx`
- **Tags**: `src/app/tags/page.tsx`
- **Navigation**: `src/components/Navigation.tsx`, `src/components/SidebarNavigation.tsx`
- **Settings Context**: `src/contexts/SettingsContext.tsx`
- **Tag Context**: `src/contexts/TagContext.tsx`
- **File Tags Context**: `src/contexts/FileTagsContext.tsx`
- **File List Hook**: `src/hooks/useFileList.ts`
- **File Types**: `src/types/file.ts`
- **Tag Types**: `src/types/tag.ts`
- **Styles**: `src/app/globals.css`

## Dependencies

### Core
- `next`: 15.5.4
- `react`: 19.1.0
- `react-dom`: 19.1.0
- `typescript`: ^5

### UI & Styling
- `tailwindcss`: ^4.1.13
- `@headlessui/react`: ^2.2.9
- `@heroicons/react`: ^2.2.0
- `@tailwindplus/elements`: ^1.0.14
- `react-markdown`: ^10.1.0

### Development
- `@types/node`: ^20
- `@types/react`: ^19
- `@types/react-dom`: ^19
- `eslint`: ^9
- `eslint-config-next`: 15.5.4

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
- **API Integration**: Uses `/api/files` endpoint for real file system access
- **States**: Loading, error, and success states handled
- **Count Display**: Shows "(X found)" when files are available
- **File Preview**: `/api/file-preview` endpoint serves file content for previews
- **File Utils**: Comprehensive file type detection, MIME types, and size formatting

### Sidebar Transitions
- **FileDetailsSidebar**: Smooth slide-in/out transitions from the right (300ms)
- **No Overlay**: Sidebar doesn't block interaction with main content or left sidebar
- **Transition States**: Manages entering, open, leaving, and closed states
- **CSS Transforms**: Uses `translate-x-full` and `translate-x-0` for smooth animations
- **Non-blocking**: Allows continued work on main content while sidebar is open

### Component Patterns
- **Client Components**: Use `'use client'` directive for interactive components
- **Hydration Safety**: Implement `mounted` state to prevent SSR/client mismatches
- **Dynamic Content**: FileDetailsSidebar accepts `file` prop for dynamic data
- **Responsive Design**: Grid layouts adapt to screen size (1/2/3 columns)
- **Grid Lists**: Use Tailwind CSS Grid Lists patterns for file cards
- **Action Buttons**: Implement View/Download actions for files only
- **Context Providers**: Multiple contexts for different feature areas
- **Custom Hooks**: Reusable logic for file management and UI interactions
- **API Integration**: Server-side file system access through Next.js API routes

### Data Flow
1. Settings stored in localStorage via SettingsContext
2. Home page reads local folder path from settings
3. useFileList hook fetches files via `/api/files` endpoint
4. File grid displays files with count and previews
5. Clicking files opens FileDetailsSidebar with details
6. FilePreview component loads content via `/api/file-preview` endpoint
7. SearchContext manages search state with debouncing
8. FileDetailsContext manages sidebar open/close state
9. useResizableSidebar manages sidebar width with localStorage persistence
10. FileDetailsSidebar transitions managed with CSS transforms and state management
11. TagContext manages global tag definitions with localStorage persistence
12. FileTagsContext manages file-specific tag assignments
13. Search functionality includes tag name and color filtering
14. TagSelector component provides UI for assigning tags to files

---

*Last updated: January 2025*
*Project version: 0.1.0*
