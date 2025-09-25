#!/usr/bin/env python3
import os
import threading
import time

import webview

import server


def run_server():
    # Ensure browser is suppressed when running inside desktop app
    os.environ['SUPPRESS_BROWSER'] = 'true'
    server.start_server()


def main():
    server_thread = threading.Thread(target=run_server, daemon=True)
    server_thread.start()

    # Small delay to let the server initialize the port
    time.sleep(2.0)

    # Use the dynamically updated values from the server module
    url = f"http://localhost:{server.PORT}{server.DOC_FINDER_PATH}"
    window = webview.create_window('DocFinder', url)
    webview.start()


if __name__ == '__main__':
    main()
