import { readFileSync, existsSync } from "fs";

// Simple markdown to HTML converter
function markdownToHtml(markdown: string): string {
  let html = markdown;

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-sm font-semibold text-white/90 mb-1">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="text-sm font-semibold text-white/90 mb-1">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 class="text-sm font-semibold text-white/90 mb-1">$1</h1>');

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white/90">$1</strong>');

  // Italic
  html = html.replace(/\*(.*?)\*/g, '<em class="italic text-white/80">$1</em>');

  // Code blocks
  html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-white/10 p-2 rounded text-xs font-mono text-white/70 overflow-x-auto"><code>$1</code></pre>');

  // Inline code
  html = html.replace(/`(.*?)`/g, '<code class="bg-white/10 px-1 rounded text-xs font-mono text-white/70">$1</code>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-sky-300 hover:text-sky-200 underline">$1</a>');

  // Lists
  html = html.replace(/^\* (.*$)/gim, '<li class="ml-2 text-white/70">• $1</li>');
  html = html.replace(/^- (.*$)/gim, '<li class="ml-2 text-white/70">• $1</li>');

  // Line breaks
  html = html.replace(/\n/g, '<br>');

  // Remove empty list items
  html = html.replace(/<li class="ml-2 text-white\/70"><br><\/li>/g, '');

  return html;
}

export async function loader({ request }: { request: Request }) {
  try {
    const url = new URL(request.url);
    const path = url.searchParams.get('path');

    if (!path || typeof path !== 'string') {
      return new Response('Path is required', { status: 400 });
    }

    // Check if the file exists
    if (!existsSync(path)) {
      return new Response('File not found', { status: 404 });
    }

    // Only allow markdown files
    if (!path.toLowerCase().endsWith('.md')) {
      return new Response('File type not supported for markdown preview', { status: 400 });
    }

    // Read the markdown file
    const markdown = readFileSync(path, 'utf-8');

    // Convert to HTML
    const html = markdownToHtml(markdown);

    // Return first 500 characters of rendered HTML
    const preview = html.substring(0, 500);

    return new Response(preview, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8'
      }
    });

  } catch (error) {
    console.error('Error reading markdown preview:', error);
    return new Response('Failed to read markdown', { status: 500 });
  }
}
