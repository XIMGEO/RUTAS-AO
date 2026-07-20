import http.server
import socketserver
import threading
import time
from pathlib import Path

from playwright.sync_api import sync_playwright

PORT = 8000
ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / 'GeoportalAO_Rutas.pdf'

class SilentHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        return

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)


def run_server():
    with socketserver.TCPServer(('127.0.0.1', PORT), SilentHandler) as httpd:
        httpd.serve_forever()


def main():
    server_thread = threading.Thread(target=run_server, daemon=True)
    server_thread.start()
    print(f'Serving {ROOT} at http://127.0.0.1:{PORT}')
    time.sleep(1)

    url = f'http://127.0.0.1:{PORT}/export_pdf_geoportal.html'
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto(url, wait_until='networkidle')
        page.wait_for_selector('.page', timeout=30000)
        page.pdf(path=str(OUTPUT), format='A4', print_background=True)
        browser.close()

    print(f'PDF generado en: {OUTPUT}')

if __name__ == '__main__':
    main()
