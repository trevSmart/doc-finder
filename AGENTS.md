# DocFinder - Agent Context Guide

## Project Overview

DocFinder is a React-based web application for scanning, organizing, and managing local documents. It provides a modern dark-themed interface with a grid-based document viewer and detailed preview functionality.

## Architecture

### Tech Stack
- **Frontend**: React 19 + TypeScript
- **Framework**: React Router v7 (SSR enabled)
- **Styling**: Tailwind CSS v4
- **UI Components**: Headless UI
- **Build Tool**: Vite
- **Runtime**: Node.js

### Project Structure
```
docfinder/
├── app/
│   ├── routes/
│   │   ├── home.tsx          # Landing page with feature cards
│   │   └── documents.tsx     # Document grid with sidebar preview
│   ├── components/
│   │   └── DocumentCard.tsx  # Individual document card component
│   └── root.tsx              # App root component
├── config.json               # Document scanning configuration
├── documents/                # Default documents folder
└── public/                   # Static assets
```

## Core Functionality

### Document Scanning
- **Location**: `app/routes/documents.tsx` (loader function)
- **Config**: `config.json` defines scan parameters
- **Process**: Server-side file system scanning using Node.js `fs` module
- **Supported Formats**: PDF, DOC, DOCX, TXT, MD, RTF, ODT
- **Features**: Recursive subdirectory scanning, file size limits, metadata extraction

### Configuration System
```json
{
  "documentsPath": "/path/to/documents",
  "supportedExtensions": [".pdf", ".doc", ".docx", ".txt", ".md", ".rtf", ".odt"],
  "maxFileSize": 10485760,
  "scanSubdirectories": true
}
```

### UI Components

#### DocumentCard
- **Purpose**: Display individual document information
- **Props**: `document`, `isSelected`, `onClick`
- **Features**: File icon, name, size, modification date, selection state

#### Sidebar Preview
- **Location**: `app/routes/documents.tsx`
- **Features**: Resizable width, document details, file actions
- **State**: `selectedDocument`, `previewWidth`, `previewOpen`

## Key Data Structures

### DocumentInfo Interface
```typescript
interface DocumentInfo {
  id: string;           // Base64 encoded file path
  name: string;         // File name without extension
  path: string;         // Full file system path
  extension: string;    // File extension
  size: number;         // File size in bytes
  lastModified: Date;   // Modification timestamp
  type: 'document' | 'image' | 'other';
}
```

## Routing

### Routes Configuration
- **Home**: `/` - Feature showcase with navigation
- **Documents**: `/documents` - Document grid with sidebar
- **SSR**: Server-side rendering enabled for document scanning

### Navigation Flow
1. Landing page (`/`) shows feature cards
2. "Veure documents" button navigates to `/documents`
3. Document selection opens sidebar preview
4. Sidebar can be resized and closed

## Styling System

### Design Language
- **Theme**: Dark slate background with blue accents
- **Cards**: Rounded corners, glassmorphism effect, hover states
- **Sidebar**: Slide-in animation, resizable handle
- **Typography**: Inter font family, consistent spacing

### Key CSS Classes
- `bg-slate-950` - Main background
- `border-white/10` - Subtle borders
- `bg-white/5` - Card backgrounds
- `text-sky-300` - Accent colors
- `backdrop-blur` - Glassmorphism effects

## Development Workflow

### Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run typecheck` - TypeScript validation

### File Modifications
- **Config Changes**: Edit `config.json` for document paths
- **UI Updates**: Modify components in `app/components/`
- **Route Changes**: Update `app/routes.ts` for new pages
- **Styling**: Use Tailwind classes, avoid custom CSS

## Common Tasks

### Adding New Document Types
1. Update `supportedExtensions` in `config.json`
2. Add icon mapping in `getFileIcon()` function
3. Update type detection in `getDocumentType()` function

### Modifying UI Layout
- **Grid**: Change `grid-cols-*` classes in documents.tsx
- **Sidebar**: Adjust `PREVIEW_MIN_WIDTH` and `PREVIEW_MAX_WIDTH`
- **Cards**: Modify `DocumentCard.tsx` component

### Debugging Issues
- **Scanning**: Check file permissions and path validity
- **UI**: Verify Tailwind classes and component props
- **Types**: Run `npm run typecheck` for TypeScript errors

## Security Considerations

- **File Access**: Server-side scanning only, no client-side file system access
- **Path Validation**: Config paths should be validated for security
- **File Size**: Configurable limits prevent memory issues
- **Extensions**: Whitelist approach for supported file types

## Performance Notes

- **SSR**: Document scanning happens server-side for better performance
- **Lazy Loading**: Components load only when needed
- **Memory**: Large file collections may need pagination
- **Caching**: Consider implementing document metadata caching

## Integration Points

### External Systems
- **File System**: Direct Node.js `fs` module usage
- **Configuration**: JSON file-based configuration
- **Build**: Vite-based build system with React Router

### Future Extensions
- **Search**: Full-text search capabilities
- **OCR**: Image text extraction
- **Cloud Storage**: Remote document sources
- **User Management**: Multi-user document access
