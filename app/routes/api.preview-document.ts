import { readFileSync, existsSync } from "fs";

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

    // Only allow text files for security
    const allowedExtensions = ['.txt', '.md', '.json', '.js', '.ts', '.jsx', '.tsx', '.css', '.html', '.xml', '.csv'];
    const extension = path.toLowerCase().substring(path.lastIndexOf('.'));

    if (!allowedExtensions.includes(extension)) {
      return new Response('File type not supported for preview', { status: 400 });
    }

    // Read the file content
    const content = readFileSync(path, 'utf-8');

    // Return first 500 characters
    const preview = content.substring(0, 500);

    return new Response(preview, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8'
      }
    });

  } catch (error) {
    console.error('Error reading document preview:', error);
    return new Response('Failed to read document', { status: 500 });
  }
}
