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

    // Only allow image files for security
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
    const extension = path.toLowerCase().substring(path.lastIndexOf('.'));

    if (!allowedExtensions.includes(extension)) {
      return new Response('File type not supported for image preview', { status: 400 });
    }

    // Read the image file
    const imageBuffer = readFileSync(path);

    // Determine content type based on extension
    let contentType = 'image/jpeg';
    switch (extension) {
      case '.png':
        contentType = 'image/png';
        break;
      case '.gif':
        contentType = 'image/gif';
        break;
      case '.bmp':
        contentType = 'image/bmp';
        break;
      case '.webp':
        contentType = 'image/webp';
        break;
      case '.svg':
        contentType = 'image/svg+xml';
        break;
      default:
        contentType = 'image/jpeg';
    }

    return new Response(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
      }
    });

  } catch (error) {
    console.error('Error reading image preview:', error);
    return new Response('Failed to read image', { status: 500 });
  }
}
