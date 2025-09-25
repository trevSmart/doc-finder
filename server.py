#!/usr/bin/env python3
"""
Servidor web intel·ligent per la Base de Coneixement de Processos de Negoci
Vodafone PYME Salesforce

Característiques:
- Detecta si el servidor ja està funcionant
- Obre nova pestanya o dona focus a pestanya existent
- Gestió intel·ligent del navegador
"""

import http.server
import json
import socketserver
import os
import webbrowser
import subprocess
import time
import email.message
import io
from http import HTTPStatus
from pathlib import Path
from urllib.parse import unquote

# Configuració
PORT = 8082
DIRECTORY = Path(__file__).parent.parent  # Serveix des de docs/

# Llegir DOCUMENTS_DIRECTORY des de la variable d'entorn si està definida
DOCUMENTS_DIRECTORY_ENV = os.environ.get('DOCUMENTS_DIRECTORY')
if DOCUMENTS_DIRECTORY_ENV:
    DOCUMENTS_DIRECTORY = Path(DOCUMENTS_DIRECTORY_ENV)
else:
    DOCUMENTS_DIRECTORY = DIRECTORY / 'doc-finder' / 'documents'

REACT_DIST_INDEX = DIRECTORY / 'doc-finder' / 'react-app' / 'dist' / 'index.html'
DOC_FINDER_PATH = '/doc-finder/react-app/dist/' if REACT_DIST_INDEX.exists() else '/doc-finder/index.html'

def check_server_running():
    """Verifica si el servidor doc-finder ja està funcionant en qualsevol port"""
    try:
        import subprocess

        # Buscar processos doc-finder actius
        result = subprocess.run([
            'ps', 'aux'
        ], capture_output=True, text=True, timeout=2)

        if result.returncode == 0:
            lines = result.stdout.split('\n')
            for line in lines:
                if 'python' in line and 'server.py' in line and 'doc-finder' in line:
                    return True
        return False
    except:
        return False

def kill_existing_servers():
    """Mata totes les instàncies prèvies del servidor doc-finder, independentment del port"""
    try:
        import subprocess
        import signal

        # Buscar tots els processos Python que executin server.py del doc-finder
        result = subprocess.run([
            'ps', 'aux'
        ], capture_output=True, text=True, timeout=3)

        if result.returncode == 0:
            lines = result.stdout.split('\n')
            doc_finder_pids = []
            current_pid = os.getpid()
            parent_pid = os.getppid()

            for line in lines:
                # Buscar processos que executin server.py del doc-finder
                if 'python' in line and 'doc-finder' in line:
                    parts = line.split()
                    if len(parts) >= 2:
                        try:
                            pid = int(parts[1])
                            if pid in (current_pid, parent_pid):
                                # Evitar matar el procés actual o el pare que el va iniciar
                                continue
                            doc_finder_pids.append(pid)
                        except (ValueError, IndexError):
                            continue

            if doc_finder_pids:
                print(f"🔍 Trobats {len(doc_finder_pids)} processos doc-finder: {doc_finder_pids}")

                # Eliminar processos de forma més robusta
                for pid in doc_finder_pids:
                    try:
                        # Primer intentar SIGTERM (més suau)
                        os.kill(pid, signal.SIGTERM)
                        print(f"🔄 Enviat SIGTERM al processe doc-finder {pid}")

                        # Esperar un moment perquè el processe es tanqui
                        time.sleep(0.5)

                        # Verificar si encara existeix
                        try:
                            os.kill(pid, 0)  # No mata, només verifica
                            # Si arriba aquí, el processe encara existeix, usar SIGKILL
                            os.kill(pid, signal.SIGKILL)
                            print(f"💀 Processe doc-finder {pid} eliminat amb SIGKILL")
                        except ProcessLookupError:
                            print(f"✅ Processe doc-finder {pid} eliminat correctament")

                    except (ProcessLookupError, PermissionError) as e:
                        print(f"⚠️  No s'ha pogut eliminar el processe doc-finder {pid}: {e}")

                # Esperar un moment més per assegurar que tots els processos s'han tancat
                time.sleep(2)
                print("✅ Tots els processos doc-finder eliminats")
                print("🚀 Continuant amb l'execució del servidor nou...")

            else:
                print("✅ Cap processe doc-finder anterior trobat")

        else:
            print("⚠️  No s'ha pogut llistar processos")

    except subprocess.TimeoutExpired:
        print("⚠️  Timeout buscant processos anteriors")
    except Exception as e:
        print(f"⚠️  Error eliminant processos anteriors: {e}")

    # Sempre continuar amb l'execució
    print("🔄 Procedint amb l'inici del servidor...")

def find_free_port(start_port=8082, max_attempts=20):
    """Troba un port lliure començant des del port especificat"""
    import socket

    for port in range(start_port, start_port + max_attempts):
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind(('', port))
                print(f"✅ Port {port} disponible")
                return port
        except OSError:
            print(f"⏳ Port {port} ocupat, provant següent...")
            continue

    print(f"❌ No s'ha trobat cap port lliure entre {start_port} i {start_port + max_attempts - 1}")
    return None

def find_doc_finder_port():
    """Troba el port actual del servidor doc-finder actiu"""
    try:
        import subprocess

        # Buscar processos doc-finder actius i extreure el port dels arguments
        result = subprocess.run([
            'ps', 'aux'
        ], capture_output=True, text=True, timeout=2)

        if result.returncode == 0:
            lines = result.stdout.split('\n')
            for line in lines:
                if 'python' in line and 'server.py' in line and 'doc-finder' in line:
                    # Buscar el port en la línia del processe
                    # El port pot estar en diferents formats, provem de trobar-lo
                    import re
                    port_match = re.search(r':(\d+)', line)
                    if port_match:
                        return int(port_match.group(1))
        return None
    except:
        return None

def get_browser_tabs():
    """Obté les pestanyes obertes del navegador (només Chrome/Safari)"""
    try:
        # Per macOS amb Chrome (timeout més curt)
        result = subprocess.run([
            'osascript', '-e',
            'tell application "Google Chrome" to get URL of every tab of every window'
        ], capture_output=True, text=True, timeout=2)

        if result.returncode == 0:
            urls = result.stdout.strip().split(', ')
            return [url.strip() for url in urls if url.strip()]
    except:
        pass

    try:
        # Per macOS amb Safari (timeout més curt)
        result = subprocess.run([
            'osascript', '-e',
            'tell application "Safari" to get URL of every tab of every window'
        ], capture_output=True, text=True, timeout=2)

        if result.returncode == 0:
            urls = result.stdout.strip().split(', ')
            return [url.strip() for url in urls if url.strip()]
    except:
        pass

    return []

def focus_existing_tab():
    """Dona focus a la pestanya existent del Document Finder"""
    # Trobar el port actual del servidor doc-finder
    current_port = find_doc_finder_port()
    if not current_port:
        return False

    try:
        # Per Chrome (timeout més curt)
        subprocess.run([
            'osascript', '-e',
            f'tell application "Google Chrome" to set active tab index of front window to (first tab whose URL contains "localhost:{current_port}/doc-finder")'
        ], timeout=2)
        return True
    except:
        pass

    try:
        # Per Safari (timeout més curt)
        subprocess.run([
            'osascript', '-e',
            f'tell application "Safari" to set current tab of front window to (first tab whose URL contains "localhost:{current_port}/doc-finder")'
        ], timeout=2)
        return True
    except:
        pass

    return False

def smart_browser_open():
    """Obre el navegador de forma intel·ligent"""
    url = f'http://localhost:{PORT}{DOC_FINDER_PATH}'
    print(f"🔗 URL a obrir: {url}")

    if not REACT_DIST_INDEX.exists():
        print("ℹ️  No s'ha trobat la build React. S'usarà la versió legacy (index.html).")

    # Verificar si ja hi ha una pestanya oberta del doc-finder
    print("🔍 Buscant pestanyes existents...")
    tabs = get_browser_tabs()
    doc_finder_tabs = [tab for tab in tabs if 'localhost:' in tab and ('doc-finder' in tab or 'diagrams' in tab or 'business-processes' in tab)]

    if doc_finder_tabs:
        print(f"🔍 Pestanya existent trobada: {doc_finder_tabs[0]}")
        if focus_existing_tab():
            print("✅ Focus donat a la pestanya existent")
            return True
        else:
            print("⚠️  No s'ha pogut donar focus, obrint nova pestanya...")

    # Si no hi ha pestanya o no s'ha pogut donar focus, obrir nova
    print("🌐 Obrint nova pestanya...")
    print(f"🔗 URL completa: {url}")
    try:
        print("🔄 Cridant webbrowser.open()...")
        webbrowser.open(url)
        print("✅ webbrowser.open() executat sense errors")
        print("🌐 Nova pestanya oberta")
        return True
    except Exception as e:
        print(f"❌ Error obrint navegador: {e}")
        print(f"❌ Tipus d'error: {type(e).__name__}")
        return False

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Afegir headers CORS per permetre carregar recursos locals
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(HTTPStatus.NO_CONTENT)
        self.end_headers()

    def do_GET(self):
        # Gestió especial per processes-database.json
        if self.path == '/processes-database.json':
            self._serve_database_file()
            return

        # Gestió especial per processes-database.json en el directori doc-finder
        if self.path == '/doc-finder/react-app/dist/processes-database.json':
            self._serve_database_file()
            return

        # Gestió normal per altres fitxers
        super().do_GET()

    def _serve_database_file(self):
        """Serveix el fitxer processes-database.json des de la ubicació personalitzada"""
        try:
            db_path = DOCUMENTS_DIRECTORY / 'processes-database.json'

            # Si no existeix, crear-lo amb dades inicials
            if not db_path.exists():
                print(f"📝 Base de dades no trobada a {db_path}, creant-la...")
                self._create_initial_database(db_path)

            with open(db_path, 'rb') as f:
                content = f.read()

            self.send_response(HTTPStatus.OK)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Content-Length', str(len(content)))
            self.end_headers()
            self.wfile.write(content)

        except Exception as e:
            self.send_error(HTTPStatus.INTERNAL_SERVER_ERROR, f"Error llegint base de dades: {e}")

    def _init_database(self):
        """Crea o reinicialitza la base de dades buida a la ruta configurada"""
        try:
            db_path = DOCUMENTS_DIRECTORY / 'processes-database.json'
            self._create_initial_database(db_path)

            payload = {
                'status': 'ok',
                'path': str(db_path),
            }
            body = json.dumps(payload, ensure_ascii=False).encode('utf-8')
            self.send_response(HTTPStatus.CREATED)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        except Exception as e:
            self.send_error(HTTPStatus.INTERNAL_SERVER_ERROR, f"Error inicialitzant base de dades: {e}")

    def _update_database_after_upload(self):
        """Actualitza la base de dades després de pujar documents"""
        try:
            import subprocess
            import os

            # Trobar el directori arrel del projecte (on està sfdx-project.json)
            current_dir = Path(__file__).parent
            project_root = current_dir.parent.parent  # docs/doc-finder -> docs -> projecte

            # Verificar que existeix sfdx-project.json
            if not (project_root / 'sfdx-project.json').exists():
                print("⚠️  No s'ha trobat sfdx-project.json, saltant actualització de base de dades")
                return

            # Executar el script de generació de base de dades
            script_path = project_root / 'scripts' / 'generate-doc-database.py'
            if script_path.exists():
                print("🔄 Actualitzant base de dades després de pujar documents...")
                result = subprocess.run([
                    'python3', str(script_path)
                ], cwd=str(project_root), capture_output=True, text=True, timeout=30)

                if result.returncode == 0:
                    print("✅ Base de dades actualitzada correctament")

                    # Copiar la base de dades al directori de documents
                    source_db = project_root / 'docs' / 'doc-finder' / 'processes-database.json'
                    target_db = DOCUMENTS_DIRECTORY / 'processes-database.json'

                    if source_db.exists():
                        import shutil
                        shutil.copy2(source_db, target_db)
                        print(f"✅ Base de dades copiada a {target_db}")

                        # Sincronitzar amb l'aplicació React
                        react_app_dir = project_root / 'docs' / 'doc-finder' / 'react-app'
                        if react_app_dir.exists():
                            sync_result = subprocess.run([
                                'npm', 'run', 'sync:data'
                            ], cwd=str(react_app_dir), capture_output=True, text=True, timeout=10)

                            if sync_result.returncode == 0:
                                print("✅ Sincronització React completada")
                            else:
                                print(f"⚠️  Error en sincronització React: {sync_result.stderr}")
                else:
                    print(f"⚠️  Error actualitzant base de dades: {result.stderr}")
            else:
                print("⚠️  Script de generació de base de dades no trobat")

        except subprocess.TimeoutExpired:
            print("⚠️  Timeout actualitzant base de dades")
        except Exception as e:
            print(f"⚠️  Error actualitzant base de dades: {e}")

    def _create_initial_database(self, db_path):
        """Crea una base de dades inicial buida"""
        try:
            # Assegurar que el directori existeix
            db_path.parent.mkdir(parents=True, exist_ok=True)

            # Base de dades inicial buida
            initial_db = {
                "categories": [],
                "integrations": [],
                "mechanisms": [],
                "objects": [],
                "tags": [],
                "tagColors": {},
                "processes": []
            }

            # Escriure el fitxer
            with open(db_path, 'w', encoding='utf-8') as f:
                json.dump(initial_db, f, ensure_ascii=False, indent=2)

            print(f"✅ Base de dades inicial creada a {db_path}")

        except Exception as e:
            print(f"❌ Error creant base de dades inicial: {e}")
            raise

    def _should_handle_upload(self) -> bool:
        path = self.path.rstrip('/')
        return path.endswith('api/upload')

    def _write_json(self, status: HTTPStatus, payload: dict) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _normalise_filename(self, filename: str) -> str:
        candidate = Path(filename).name.strip()
        return candidate or 'fitxer-sense-nom'

    def _next_available_name(self, filename: str) -> Path:
        # Utilitzar DOCUMENTS_DIRECTORY si està configurat, sinó utilitzar el directori per defecte
        if DOCUMENTS_DIRECTORY_ENV:
            target_dir = DOCUMENTS_DIRECTORY
        else:
            target_dir = DOCUMENTS_DIRECTORY

        target_dir.mkdir(parents=True, exist_ok=True)
        target = target_dir / filename
        if not target.exists():
            return target

        stem = target.stem
        suffix = target.suffix
        counter = 1
        while True:
            candidate = target_dir / f"{stem}-{counter}{suffix}"
            if not candidate.exists():
                return candidate
            counter += 1

    def _parse_multipart_form_data(self, content_type: str):
        """Parse multipart/form-data without using deprecated cgi module"""
        # Extract boundary from content-type header
        boundary = None
        for part in content_type.split(';'):
            part = part.strip()
            if part.startswith('boundary='):
                boundary = part[9:]  # Remove 'boundary='
                break

        if not boundary:
            raise ValueError("No boundary found in Content-Type")

        # Read the content length
        content_length = int(self.headers.get('Content-Length', '0'))
        if content_length == 0:
            return []

        # Read the raw data
        raw_data = self.rfile.read(content_length)

        # Split by boundary
        boundary_bytes = f'--{boundary}'.encode('utf-8')
        parts = raw_data.split(boundary_bytes)

        files = []
        for part in parts:
            if not part.strip():
                continue

            # Split headers and body
            if b'\r\n\r\n' in part:
                headers_raw, body = part.split(b'\r\n\r\n', 1)
            elif b'\n\n' in part:
                headers_raw, body = part.split(b'\n\n', 1)
            else:
                continue

            # Parse headers
            headers = {}
            for line in headers_raw.decode('utf-8', errors='ignore').split('\n'):
                line = line.strip()
                if ':' in line:
                    key, value = line.split(':', 1)
                    headers[key.strip().lower()] = value.strip()

            # Check if this is a file field
            content_disposition = headers.get('content-disposition', '')
            if 'filename=' in content_disposition:
                # Extract filename
                filename_start = content_disposition.find('filename="') + 10
                filename_end = content_disposition.find('"', filename_start)
                if filename_start > 9 and filename_end > filename_start:
                    filename = content_disposition[filename_start:filename_end]

                    # Create a file-like object
                    file_obj = io.BytesIO(body)
                    file_obj.filename = filename
                    files.append(file_obj)

        return files

    def do_POST(self):
        # Endpoint per inicialitzar la base de dades
        if self.path.rstrip('/') == '/api/init-database':
            self._init_database()
            return

        if not self._should_handle_upload():
            self.send_error(HTTPStatus.NOT_FOUND, "Endpoint no trobat")
            return

        content_type = self.headers.get('Content-Type', '')
        if 'multipart/form-data' not in content_type:
            self._write_json(
                HTTPStatus.BAD_REQUEST,
                {
                    'saved': [],
                    'errors': [
                        {
                            'name': 'request',
                            'reason': 'Content-Type ha de ser multipart/form-data',
                        }
                    ],
                },
            )
            return

        try:
            files = self._parse_multipart_form_data(content_type)
        except Exception as error:  # noqa: BLE001 - capturem qualsevol error d'anàlisi
            self._write_json(
                HTTPStatus.BAD_REQUEST,
                {
                    'saved': [],
                    'errors': [
                        {
                            'name': 'request',
                            'reason': f'No s\'ha pogut processar la petició: {error}',
                        }
                    ],
                },
            )
            return
        if not files:
            self._write_json(
                HTTPStatus.BAD_REQUEST,
                {
                    'saved': [],
                    'errors': [
                        {
                            'name': 'request',
                            'reason': 'No s\'ha rebut cap fitxer',
                        }
                    ],
                },
            )
            return

        saved: list[dict[str, object]] = []
        errors: list[dict[str, str]] = []

        for file_obj in files:
            if not hasattr(file_obj, 'filename') or not file_obj.filename:
                continue

            filename = self._normalise_filename(str(file_obj.filename))

            try:
                data = file_obj.read()
                if not data:
                    errors.append({'name': filename, 'reason': 'El fitxer és buit'})
                    continue

                target_path = self._next_available_name(filename)
                with open(target_path, 'wb') as destination:
                    destination.write(data)

                saved.append(
                    {
                        'originalName': filename,
                        'storedName': target_path.name,
                        'size': len(data),
                        'directory': str(target_path),
                    }
                )
            except Exception as error:  # noqa: BLE001 - evitar perdre informació de l'error
                errors.append({'name': filename, 'reason': str(error)})

        # Actualitzar la base de dades si s'han pujat documents correctament
        if saved and not errors:
            self._update_database_after_upload()

        status = HTTPStatus.CREATED if saved and not errors else HTTPStatus.OK
        self._write_json(
            status,
            {
                'saved': saved,
                'errors': errors,
            },
        )

def start_server():
    """Inicia el servidor web intel·ligent"""
    global PORT

    print("🧹 Netejant instàncies prèvies...")
    kill_existing_servers()

    # Trobar un port lliure
    print("🔍 Buscant port lliure...")
    free_port = find_free_port(PORT)
    if free_port is None:
        print("❌ No s'ha pogut trobar cap port lliure")
        print("🔄 Esperant 2 segons i tornant a intentar...")
        time.sleep(2)
        free_port = find_free_port(PORT)
        if free_port is None:
            print("❌ Encara no s'ha pogut trobar cap port lliure")
            return

    PORT = free_port  # Actualitzar el port global
    print(f"🚀 Iniciant nou servidor al port {PORT}...")
    print("📋 Configurant servidor web...")
    os.chdir(DIRECTORY)

    print("🌐 Creant servidor HTTP...")
    print("🔄 Iniciant servidor web (això pot trigar uns segons)...")
    with socketserver.TCPServer(("", PORT), CustomHTTPRequestHandler) as httpd:
        print(f"🚀 Servidor web iniciat!")
        print(f"📁 Directori: {DIRECTORY}")
        print(f"📂 Documents Directory: {DOCUMENTS_DIRECTORY}")
        if DOCUMENTS_DIRECTORY_ENV:
            print(f"🔧 Utilitzant DOCUMENTS_DIRECTORY de variable d'entorn: {DOCUMENTS_DIRECTORY_ENV}")
        else:
            print(f"🔧 Utilitzant DOCUMENTS_DIRECTORY per defecte")
        print(f"🗄️  Base de dades: {DOCUMENTS_DIRECTORY}/processes-database.json")
        print(f"🌐 URL base: http://localhost:{PORT}")
        print(f"📋 Document Finder: http://localhost:{PORT}{DOC_FINDER_PATH}")
        print(f"🖼️  Diagrames: http://localhost:{PORT}/diagrams/")
        print("\n💡 Prem Ctrl+C per aturar el servidor")
        print("=" * 60)

        # Obrir navegador de forma intel·ligent (amb delay més llarg)
        print("🔍 Gestionant navegador...")
        import threading
        def delayed_browser_open():
            time.sleep(2.0)  # Esperar 2 segons perquè el servidor estigui completament iniciat
            print("🌐 Intentant obrir navegador...")
            result = smart_browser_open()
            if result:
                print("✅ Navegador obert correctament")
            else:
                print("❌ Error obrint navegador")
        threading.Thread(target=delayed_browser_open, daemon=True).start()

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Servidor aturat per l'usuari")
            httpd.shutdown()

if __name__ == "__main__":
    start_server()
