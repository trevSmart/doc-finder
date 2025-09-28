import type { DocumentInfo } from '../routes/home';
import { formatFileSize, getFileIcon } from '../routes/home';
import { useState, useEffect } from 'react';

interface DocumentCardProps {
  document: DocumentInfo;
  isSelected?: boolean;
  onClick?: () => void;
}

export function DocumentCard({ document, isSelected = false, onClick }: DocumentCardProps) {
  const [previewContent, setPreviewContent] = useState<string>('');
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  const icon = getFileIcon(document.extension);
  const formattedSize = formatFileSize(document.size);
  const formattedDate = document.lastModified.toLocaleDateString('ca-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  // Load preview content when component mounts
  useEffect(() => {
    const loadPreview = async () => {
      setIsLoadingPreview(true);
      try {
        if (document.type === 'image') {
          // For images, try to load the actual image
          const response = await fetch(`/api/preview-image?path=${encodeURIComponent(document.path)}`);
          if (response.ok) {
            const blob = await response.blob();
            const imageUrl = URL.createObjectURL(blob);
            setPreviewContent(imageUrl);
          } else {
            setPreviewContent('🖼️ Imatge');
          }
        } else if (document.extension === '.txt') {
          // For text files, try to read first few lines
          const response = await fetch(`/api/preview-document?path=${encodeURIComponent(document.path)}`);
          if (response.ok) {
            const text = await response.text();
            setPreviewContent(text.substring(0, 150) + (text.length > 150 ? '...' : ''));
          } else {
            setPreviewContent('📄 Document de text');
          }
        } else if (document.extension === '.md') {
          // For markdown files, get rendered HTML
          const response = await fetch(`/api/preview-markdown?path=${encodeURIComponent(document.path)}`);
          if (response.ok) {
            const html = await response.text();
            setPreviewContent(html);
          } else {
            setPreviewContent('📝 Document Markdown');
          }
        } else if (document.extension === '.pdf') {
          setPreviewContent('📋 Document PDF');
        } else {
          setPreviewContent('📄 Document');
        }
      } catch (error) {
        console.error('Error loading preview:', error);
        setPreviewContent('📄 Document');
      } finally {
        setIsLoadingPreview(false);
      }
    };

    loadPreview();
  }, [document.path, document.type, document.extension]);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex h-full flex-col rounded-2xl border border-gray-200/20 bg-white/80 p-6 text-left shadow-xl shadow-gray-900/20 backdrop-blur transition-all duration-300 hover:bg-gray-100/80 hover:shadow-gray-900/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-white/10 dark:bg-white/5 dark:shadow-slate-900/30 dark:hover:bg-white/10 dark:hover:shadow-slate-900/40 dark:focus-visible:ring-offset-slate-950 cursor-pointer ${
        isSelected
          ? "border-sky-400/70 bg-sky-500/10 shadow-sky-500/30 ring-2 ring-sky-400/50 scale-[1.02]"
          : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <span className={`text-3xl transition-colors duration-300 ${isSelected ? 'text-sky-200' : 'text-sky-300'}`} aria-hidden>
          {(() => {
            const IconComponent = icon;
            return <IconComponent className="h-8 w-8" />;
          })()}
        </span>
        <span className="text-xs font-medium text-gray-500 dark:text-white/50">
          {document.extension.toUpperCase()}
        </span>
      </div>

      <h3 className={`mt-4 text-lg font-semibold line-clamp-2 transition-colors duration-300 ${isSelected ? 'text-sky-100' : 'text-gray-900 dark:text-white'}`}>
        {document.name}
      </h3>

      <div className="mt-3 space-y-2 text-sm text-gray-600 dark:text-slate-300">
        <div className="flex items-center justify-between">
          <span className="text-gray-500 dark:text-white/60">Mida:</span>
          <span className="font-medium">{formattedSize}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-500 dark:text-white/60">Modificat:</span>
          <span className="font-medium">{formattedDate}</span>
        </div>
      </div>

      {/* Preview section */}
      <div className="mt-4 flex-1">
        <div className="h-20 rounded-lg border border-gray-200/20 bg-gray-50/50 p-3 overflow-hidden dark:border-white/10 dark:bg-white/5">
          {isLoadingPreview ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-pulse text-xs text-gray-400 dark:text-white/40">Carregant...</div>
            </div>
          ) : document.type === 'image' && previewContent.startsWith('blob:') ? (
            <div className="flex items-center justify-center h-full">
              <img
                src={previewContent}
                alt="Preview"
                className="max-h-full max-w-full object-contain rounded"
              />
            </div>
          ) : document.extension === '.md' && previewContent.startsWith('<') ? (
            <div
              className="text-xs text-gray-600 leading-relaxed prose prose-sm max-w-none dark:text-white/70 dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: previewContent }}
            />
          ) : (
            <div className="text-xs text-gray-600 leading-relaxed dark:text-white/70">
              {previewContent}
            </div>
          )}
        </div>
      </div>

    </button>
  );
}
