import { spawn } from "child_process";
import { existsSync } from "fs";

export async function action({ request }: { request: Request }) {
  try {
    const { path } = await request.json();

    if (!path || typeof path !== 'string') {
      return new Response(JSON.stringify({ error: 'Path is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if the file exists
    if (!existsSync(path)) {
      return new Response(JSON.stringify({ error: 'File not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Open the file with the system's default application
    // On macOS, use 'open' command
    const openCommand = process.platform === 'darwin' ? 'open' :
                       process.platform === 'win32' ? 'start' :
                       'xdg-open';

    const child = spawn(openCommand, [path], {
      detached: true,
      stdio: 'ignore'
    });

    child.unref();

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error opening document:', error);
    return new Response(JSON.stringify({ error: 'Failed to open document' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
