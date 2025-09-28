import type { Route } from "./+types/home";
import React, { useCallback, useState, useEffect } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent, SVGProps } from "react";
import { Button, Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import { DocumentCard } from "../components/DocumentCard";
import { ThemeSelector } from "../components/ThemeSelector";
import {
  DocumentIcon,
  DocumentTextIcon,
  PhotoIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";


// Define types and utilities locally
export interface DocumentInfo {
  id: string;
  name: string;
  path: string;
  extension: string;
  size: number;
  lastModified: Date;
  type: 'document' | 'image' | 'other';
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getFileIcon(extension: string): React.ComponentType<SVGProps<SVGSVGElement>> {
  const iconMap: Record<string, React.ComponentType<SVGProps<SVGSVGElement>>> = {
    '.pdf': DocumentIcon,
    '.doc': DocumentTextIcon,
    '.docx': DocumentTextIcon,
    '.txt': DocumentTextIcon,
    '.md': DocumentTextIcon,
    '.rtf': DocumentTextIcon,
    '.odt': DocumentTextIcon,
    '.jpg': PhotoIcon,
    '.jpeg': PhotoIcon,
    '.png': PhotoIcon,
    '.gif': PhotoIcon,
    '.bmp': PhotoIcon,
    '.svg': PhotoIcon
  };

  return iconMap[extension.toLowerCase()] || DocumentIcon;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "DocFinder - Troba i gestiona documents" },
    { name: "description", content: "La teva aplicació per trobar i gestionar documents" },
  ];
}

export async function loader() {
  try {
    const { readFileSync, readdirSync, statSync } = await import('fs');
    const { join, extname, basename } = await import('path');

    // Load config
    const configPath = join(process.cwd(), 'config.json');
    const configData = readFileSync(configPath, 'utf-8');
    const config = JSON.parse(configData);

    const documents: DocumentInfo[] = [];

    function scanDirectory(dirPath: string) {
      try {
        const items = readdirSync(dirPath);

        for (const item of items) {
          const fullPath = join(dirPath, item);
          const stats = statSync(fullPath);

          if (stats.isFile()) {
            const extension = extname(item).toLowerCase();

            if (config.supportedExtensions.includes(extension) && stats.size <= config.maxFileSize) {
              const document: DocumentInfo = {
                id: Buffer.from(fullPath).toString('base64').replace(/[+/=]/g, ''),
                name: basename(item, extension),
                path: fullPath,
                extension,
                size: stats.size,
                lastModified: stats.mtime,
                type: getDocumentType(extension)
              };

              documents.push(document);
            }
          } else if (stats.isDirectory() && config.scanSubdirectories) {
            scanDirectory(fullPath);
          }
        }
      } catch (error) {
        console.error(`Error scanning directory ${dirPath}:`, error);
      }
    }

    function getDocumentType(extension: string): 'document' | 'image' | 'other' {
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg'];
      const documentExtensions = ['.pdf', '.doc', '.docx', '.txt', '.md', '.rtf', '.odt'];

      if (imageExtensions.includes(extension)) {
        return 'image';
      } else if (documentExtensions.includes(extension)) {
        return 'document';
      } else {
        return 'other';
      }
    }

    scanDirectory(config.documentsPath);

    return { documents: documents.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime()) };
  } catch (error) {
    console.error('Error loading documents:', error);
    return { documents: [], error: 'Error al carregar els documents' };
  }
}

const ChevronDownIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M14.53 7.97a.75.75 0 0 0-1.06 0L10 11.47 6.53 7.97a.75.75 0 1 0-1.06 1.06l3.75 3.75a.75.75 0 0 0 1.06 0l3.75-3.75a.75.75 0 0 0 0-1.06Z" />
    </svg>
  );
};


const PREVIEW_MIN_WIDTH = 280;
const PREVIEW_MAX_WIDTH = 560;
const PREVIEW_GAP = 48; // 3rem

export default function Home({ loaderData }: Route.ComponentProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentInfo | null>(null);
  const [previewWidth, setPreviewWidth] = useState(320);
  const [sidebarPreviewContent, setSidebarPreviewContent] = useState<string>('');
  const [isLoadingSidebarPreview, setIsLoadingSidebarPreview] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const documents = loaderData?.documents || [];
  const error = loaderData?.error;

  const previewOpen = selectedDocument !== null;

  const handlePreviewResizeStart = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!previewOpen) return;

      event.preventDefault();
      event.stopPropagation();

      const startX = event.clientX;
      const startWidth = previewWidth;

      const handleMove = (moveEvent: PointerEvent) => {
        const delta = startX - moveEvent.clientX;
        const tentativeWidth = startWidth + delta;
        const clampedWidth = Math.min(
          Math.max(tentativeWidth, PREVIEW_MIN_WIDTH),
          PREVIEW_MAX_WIDTH,
        );
        setPreviewWidth(clampedWidth);
      };

      const handleEnd = () => {
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        window.removeEventListener("pointermove", handleMove);
        window.removeEventListener("pointerup", handleEnd);
        window.removeEventListener("pointercancel", handleEnd);
      };

      document.body.style.cursor = "ew-resize";
      document.body.style.userSelect = "none";

      window.addEventListener("pointermove", handleMove);
      window.addEventListener("pointerup", handleEnd);
      window.addEventListener("pointercancel", handleEnd);
    },
    [previewOpen, previewWidth],
  );

  const layoutOffsets = {
    "--docfinder-left-offset": sidebarOpen ? "calc(18rem + 2rem)" : "0px",
    "--docfinder-right-offset": previewOpen
      ? `calc(${previewWidth}px + ${PREVIEW_GAP}px)`
      : "0px",
  } as CSSProperties;

  const handleDocumentSelect = (doc: DocumentInfo) => {
    const newSelectedDocument = selectedDocument?.id === doc.id ? null : doc;
    setSelectedDocument(newSelectedDocument);

    // Trigger drawer open/close based on selection
    if (newSelectedDocument) {
      const drawer = window.document.getElementById('preview-drawer') as HTMLDialogElement;
      if (drawer) {
        drawer.showModal();
      }
    } else {
      const drawer = window.document.getElementById('preview-drawer') as HTMLDialogElement;
      if (drawer) {
        drawer.close();
      }
    }
  };

  // Load preview content for sidebar when document is selected
  useEffect(() => {
    const loadSidebarPreview = async () => {
      if (!selectedDocument) {
        setSidebarPreviewContent('');
        return;
      }

      setIsLoadingSidebarPreview(true);
      try {
        if (selectedDocument.type === 'image') {
          // For images, try to load the actual image
          const response = await fetch(`/api/preview-image?path=${encodeURIComponent(selectedDocument.path)}`);
          if (response.ok) {
            const blob = await response.blob();
            const imageUrl = URL.createObjectURL(blob);
            setSidebarPreviewContent(imageUrl);
          } else {
            setSidebarPreviewContent('🖼️ Imatge');
          }
        } else if (selectedDocument.extension === '.txt') {
          // For text files, try to read first few lines
          const response = await fetch(`/api/preview-document?path=${encodeURIComponent(selectedDocument.path)}`);
          if (response.ok) {
            const text = await response.text();
            setSidebarPreviewContent(text.substring(0, 500) + (text.length > 500 ? '...' : ''));
          } else {
            setSidebarPreviewContent('📄 Document de text');
          }
        } else if (selectedDocument.extension === '.md') {
          // For markdown files, get rendered HTML
          const response = await fetch(`/api/preview-markdown?path=${encodeURIComponent(selectedDocument.path)}`);
          if (response.ok) {
            const html = await response.text();
            setSidebarPreviewContent(html);
          } else {
            setSidebarPreviewContent('📝 Document Markdown');
          }
        } else if (selectedDocument.extension === '.pdf') {
          setSidebarPreviewContent('📋 Document PDF');
        } else {
          setSidebarPreviewContent('📄 Document');
        }
      } catch (error) {
        console.error('Error loading sidebar preview:', error);
        setSidebarPreviewContent('📄 Document');
      } finally {
        setIsLoadingSidebarPreview(false);
      }
    };

    loadSidebarPreview();
  }, [selectedDocument]);

  const handleOpenDocument = async (document: DocumentInfo) => {
    try {
      // Try to open the document using the system's default application
      const response = await fetch('/api/open-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path: document.path }),
      });

      if (!response.ok) {
        throw new Error('Failed to open document');
      }
    } catch (error) {
      console.error('Error opening document:', error);
      // Fallback: show a message to the user
      alert(`No es pot obrir el document automàticament. Ruta: ${document.path}`);
    }
  };

  const handleCopyPath = async (doc: DocumentInfo) => {
    try {
      await navigator.clipboard.writeText(doc.path);
      // Show a brief success message
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Error copying path:', error);
      // Fallback: show the path in an alert
      alert(`Ruta del document: ${doc.path}`);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-white text-gray-900 dark:bg-slate-950 dark:text-slate-100">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_95%_at_50%_5%,#e0e7ff_0%,rgba(255,255,255,0.92)_45%,#f8fafc_100%)] opacity-90 dark:bg-[radial-gradient(120%_95%_at_50%_5%,#312e81_0%,rgba(15,23,42,0.92)_45%,#020617_100%)] dark:opacity-90"
      />

      <aside
        id="docfinder-sidebar"
        aria-hidden={!sidebarOpen}
        className={`fixed left-0 top-6 bottom-6 z-30 flex w-72 transform flex-col rounded-r-3xl border border-gray-200/20 border-l-transparent bg-white/80 px-6 py-8 shadow-2xl shadow-gray-900/20 backdrop-blur transition-transform duration-500 ease-out dark:border-white/10 dark:bg-white/5 dark:shadow-slate-900/40 ${sidebarOpen ? "translate-x-0 pointer-events-auto" : "-translate-x-full pointer-events-none"}`}
      >
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-600 dark:text-white/60">
            Navegació
          </p>
          <Button
            type="button"
            tabIndex={sidebarOpen ? 0 : -1}
            onClick={() => setSidebarOpen(false)}
            className="inline-flex items-center justify-center rounded-full border border-gray-200/20 bg-gray-100/50 p-2 text-gray-700 transition hover:bg-gray-200/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-white/20 dark:bg-white/10 dark:text-white/80 dark:hover:bg-white/15 dark:focus-visible:ring-white/70 dark:focus-visible:ring-offset-slate-950"
          >
            <XMarkIcon className="h-4 w-4" />
          </Button>
        </div>

        <nav className="mt-8 space-y-3 text-sm/6 text-gray-600 dark:text-white/70">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-white/60">
              Tema
            </p>
            <ThemeSelector />
          </div>
        </nav>

        <div className="mt-10 rounded-2xl border border-dashed border-gray-200/20 bg-gray-50/50 p-4 text-xs leading-5 text-gray-500 dark:border-white/20 dark:bg-white/5 dark:text-white/60">
          <p className="font-semibold text-gray-700 dark:text-white/80">Consell ràpid</p>
          <p className="mt-2">
            Organitza les teves carpetes amb etiquetes per trobar els documents en segons.
          </p>
        </div>
      </aside>

      {/* Drawer component for document preview */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-gray-900/50 transition-opacity duration-500 ease-in-out"
            onClick={() => setSelectedDocument(null)}
          />

          {/* Drawer panel */}
          <div className="absolute inset-0 pl-10 focus:outline-none sm:pl-16">
            <div
              className="group/dialog-panel ml-auto block size-full max-w-md transform transition duration-500 ease-in-out"
              style={{ width: previewWidth }}
            >
              {/* Resize handle */}
              <div
                role="presentation"
                onPointerDown={handlePreviewResizeStart}
                className="absolute right-0 top-0 flex h-full w-3 translate-x-3 cursor-ew-resize items-center justify-center z-20"
              >
                <span className="pointer-events-none h-16 w-1 rounded-full bg-white/40 opacity-70 transition group-hover:opacity-100" />
              </div>

              <div className="relative flex h-full flex-col overflow-y-auto bg-white shadow-xl dark:bg-gray-800 dark:after:absolute dark:after:inset-y-0 dark:after:left-0 dark:after:w-px dark:after:bg-white/10">
                {/* Header */}
                <div className="px-4 py-6 sm:px-6">
                  <div className="flex items-start justify-between">
                    <h2 id="slide-over-heading" className="text-base font-semibold text-gray-900 dark:text-white">
                      {selectedDocument ? `${selectedDocument.name}${selectedDocument.extension}` : 'Document Details'}
                    </h2>
                    <div className="ml-3 flex h-7 items-center">
                      <button
                        type="button"
                        onClick={() => setSelectedDocument(null)}
                        className="relative rounded-md text-gray-400 hover:text-gray-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:hover:text-white dark:focus-visible:outline-indigo-500"
                      >
                        <span className="absolute -inset-2.5" />
                        <span className="sr-only">Close panel</span>
                        <XMarkIcon className="h-6 w-6" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Main content */}
                <div className="flex-1">
                  {selectedDocument ? (
                    <div className="pb-1 sm:pb-6">
                      <div>
                        {/* Document preview image */}
                        <div className="relative h-40 sm:h-56">
                          {selectedDocument.type === 'image' && sidebarPreviewContent.startsWith('blob:') ? (
                            <img
                              src={sidebarPreviewContent}
                              alt={selectedDocument.name}
                              className="absolute size-full object-cover"
                            />
                          ) : (
                            <div className="absolute size-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                              <div className="text-6xl text-gray-400 dark:text-gray-500">
                                {React.createElement(getFileIcon(selectedDocument.extension), { className: "h-16 w-16" })}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Document info */}
                        <div className="mt-6 px-4 sm:mt-8 sm:flex sm:items-end sm:px-6">
                          <div className="sm:flex-1">
                            <div>
                              <div className="flex items-center">
                                <h3 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
                                  {selectedDocument.name}
                                </h3>
                                <span className="ml-2.5 inline-block size-2 shrink-0 rounded-full bg-green-400">
                                  <span className="sr-only">Available</span>
                                </span>
                              </div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {formatFileSize(selectedDocument.size)}
                              </p>
                            </div>

                            {/* Action buttons */}
                            <div className="mt-5 flex flex-wrap space-y-3 sm:space-y-0 sm:space-x-3">
                              <button
                                type="button"
                                onClick={() => handleOpenDocument(selectedDocument)}
                                className="inline-flex w-full shrink-0 items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:flex-1 dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
                              >
                                Open
                              </button>
                              <button
                                type="button"
                                onClick={() => handleCopyPath(selectedDocument)}
                                className={`inline-flex w-full flex-1 items-center justify-center rounded-md px-3 py-2 text-sm font-semibold shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 ${
                                  copySuccess
                                    ? 'bg-green-600 text-white hover:bg-green-500'
                                    : 'bg-white text-gray-900 inset-ring inset-ring-gray-300 hover:bg-gray-50 dark:bg-white/10 dark:text-gray-100 dark:shadow-none dark:inset-ring-white/5 dark:hover:bg-white/20'
                                }`}
                              >
                                {copySuccess ? 'Copied!' : 'Copy Path'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Document details */}
                      <div className="px-4 pt-5 pb-5 sm:px-0 sm:pt-0">
                        <dl className="space-y-8 px-4 sm:space-y-6 sm:px-6">
                          <div>
                            <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:shrink-0 dark:text-gray-400">Type</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 dark:text-white">
                              {selectedDocument.extension.toUpperCase()} Document
                            </dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:shrink-0 dark:text-gray-400">Last Modified</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 dark:text-white">
                              <time dateTime={selectedDocument.lastModified.toISOString()}>
                                {selectedDocument.lastModified.toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </time>
                            </dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:shrink-0 dark:text-gray-400">Size</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 dark:text-white">
                              {formatFileSize(selectedDocument.size)}
                            </dd>
                          </div>
                          {selectedDocument.type === 'image' && (
                            <>
                              <div>
                                <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:shrink-0 dark:text-gray-400">Dimensions</dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 dark:text-white">4032 x 3024</dd>
                              </div>
                              <div>
                                <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:shrink-0 dark:text-gray-400">Resolution</dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 dark:text-white">72 x 72</dd>
                              </div>
                            </>
                          )}
                        </dl>
                      </div>

                      {/* Preview section for non-image documents */}
                      {selectedDocument.type !== 'image' && (
                        <div className="px-4 pt-5 pb-5 sm:px-0 sm:pt-0">
                          <div>
                            <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:shrink-0 dark:text-gray-400 mb-4">Preview</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 dark:text-white">
                              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 max-h-32 overflow-y-auto dark:border-gray-700 dark:bg-gray-800">
                                {isLoadingSidebarPreview ? (
                                  <div className="flex items-center justify-center h-16">
                                    <div className="animate-pulse text-sm text-gray-400 dark:text-gray-500">
                                      Loading preview...
                                    </div>
                                  </div>
                                ) : selectedDocument.extension === '.md' && sidebarPreviewContent.startsWith('<') ? (
                                  <div
                                    className="text-sm leading-relaxed prose prose-sm max-w-none dark:prose-invert"
                                    dangerouslySetInnerHTML={{ __html: sidebarPreviewContent }}
                                  />
                                ) : (
                                  <div className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                                    {sidebarPreviewContent}
                                  </div>
                                )}
                              </div>
                            </dd>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-1 items-center justify-center px-4">
                      <p className="max-w-xs text-center text-sm text-gray-500 dark:text-gray-400">
                        Select a document to view details.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <main
        style={layoutOffsets}
        className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-3 py-12 transition-[padding] duration-500 ease-out sm:px-4 lg:pl-[var(--docfinder-left-offset)] lg:pr-[var(--docfinder-right-offset)]"
      >
        <div className="flex justify-start">
          <Button
            type="button"
            onClick={() => setSidebarOpen((open) => !open)}
            aria-expanded={sidebarOpen}
            aria-controls="docfinder-sidebar"
            className="inline-flex items-center gap-2 rounded-full border border-gray-200/20 bg-white/80 px-4 py-2 text-xs font-semibold text-gray-700 shadow-sm shadow-gray-900/20 transition hover:bg-gray-100/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-white/20 dark:bg-white/5 dark:text-white/80 dark:shadow-slate-900/40 dark:hover:bg-white/10 dark:focus-visible:ring-white/80 dark:focus-visible:ring-offset-slate-950"
          >
            {sidebarOpen ? "Amaga menú" : "Mostra menú"}
          </Button>
        </div>

        <div className="relative mx-auto mt-8 max-w-5xl text-center">
          <div className="mt-16">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white text-center mb-8">
              {documents.length} documents.
            </h2>

            {error ? (
              <div className="text-center py-8">
                <p className="text-red-400 mb-4">{error}</p>
                <Button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200/20 bg-white/80 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100/80 dark:border-white/20 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10"
                >
                  Tornar a intentar
                </Button>
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">📁</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Cap document trobat
                </h3>
                <p className="text-gray-600 dark:text-slate-300 mb-6">
                  Afegeix documents a la carpeta configurada per començar
                </p>
                <Button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200/20 bg-white/80 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100/80 dark:border-white/20 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10"
                >
                  Actualitzar
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {documents.map((document: DocumentInfo) => (
                  <DocumentCard
                    key={document.id}
                    document={document}
                    isSelected={selectedDocument?.id === document.id}
                    onClick={() => handleDocumentSelect(document)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="mt-20 mx-auto max-w-2xl text-left">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white text-center">
              Preguntes freqüents
            </h2>

            <div className="mt-8 mx-auto w-full max-w-lg divide-y divide-gray-200/20 rounded-xl bg-gray-50/50 dark:divide-white/5 dark:bg-white/5">
              <Disclosure as="div" className="p-6" defaultOpen>
                <DisclosureButton className="group flex w-full items-center justify-between">
                  <span className="text-sm/6 font-medium text-gray-900 group-data-hover:text-gray-700 dark:text-white dark:group-data-hover:text-white/80">
                    Com funciona la cerca de documents?
                  </span>
                  <ChevronDownIcon className="size-5 fill-gray-500 transition-transform duration-300 group-data-open:rotate-180 group-data-hover:fill-gray-400 dark:fill-white/60 dark:group-data-hover:fill-white/50" />
                </DisclosureButton>
                <DisclosurePanel className="mt-2 text-sm/5 text-gray-600 dark:text-white/50">
                  Utilitzem algorismes avançats d'indexació i cerca per trobar documents basant-nos en el contingut, metadades i etiquetes. Pots cercar per paraules clau, tipus de document o data.
                </DisclosurePanel>
              </Disclosure>

              <Disclosure as="div" className="p-6">
                <DisclosureButton className="group flex w-full items-center justify-between">
                  <span className="text-sm/6 font-medium text-gray-900 group-data-hover:text-gray-700 dark:text-white dark:group-data-hover:text-white/80">
                    Quins tipus de documents suporta?
                  </span>
                  <ChevronDownIcon className="size-5 fill-gray-500 transition-transform duration-300 group-data-open:rotate-180 group-data-hover:fill-gray-400 dark:fill-white/60 dark:group-data-hover:fill-white/50" />
                </DisclosureButton>
                <DisclosurePanel className="mt-2 text-sm/5 text-gray-600 dark:text-white/50">
                  Suportem PDF, Word, Excel, PowerPoint, imatges, textos i molts altres formats. També podem extreure text d'imatges utilitzant OCR.
                </DisclosurePanel>
              </Disclosure>

              <Disclosure as="div" className="p-6">
                <DisclosureButton className="group flex w-full items-center justify-between">
                  <span className="text-sm/6 font-medium text-gray-900 group-data-hover:text-gray-700 dark:text-white dark:group-data-hover:text-white/80">
                    És segur pujar els meus documents?
                  </span>
                  <ChevronDownIcon className="size-5 fill-gray-500 transition-transform duration-300 group-data-open:rotate-180 group-data-hover:fill-gray-400 dark:fill-white/60 dark:group-data-hover:fill-white/50" />
                </DisclosureButton>
                <DisclosurePanel className="mt-2 text-sm/5 text-gray-600 dark:text-white/50">
                  Sí, utilitzem xifratge de dades i protocols de seguretat avançats. Els teus documents es mantenen privats i només tu pots accedir-hi.
                </DisclosurePanel>
              </Disclosure>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}