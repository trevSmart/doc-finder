# Document Finder - Processos de Negoci Vodafone PYME

## 🎯 Què és?

Una interfície web cerqueable que et permet trobar processos de negoci per múltiples criteris:

- **Objecte de base de dades** (Account, Contact, Opportunity, etc.)
- **Integració** (EDRAS, Amdocs, Provider APIs, etc.)
- **Mecanisme** (Trigger, Batchable, OmniScript, etc.)
- **Tags** (framework, critical, problem, etc.)
- **Cerca de text lliure**

## 🚀 Com usar-ho

### 0. Prepara el client React

```bash
cd docs/doc-finder/react-app
npm install
npm run build        # genera el bundle a dist/
```

> Consell: durant el desenvolupament pots usar `npm run dev` (Vite) per tenir hot reload.

### Opció 1: Servidor Python (Recomanat)

```bash
cd docs/doc-finder/
python3 server.py
```

Això obrirà automàticament el navegador a `http://localhost:8082/doc-finder/react-app/dist/`.

### Opció 2: Servidor Node.js

```bash
cd docs/doc-finder/
npx http-server -p 8082 -c-1
```

Després obre manualment `http://localhost:8082/doc-finder/react-app/dist/`.

### Opció 3: Servidor PHP

```bash
cd docs/doc-finder/
php -S localhost:8082
```

i accedeix al mateix camí que a l'opció anterior.

## 🔍 Funcionalitats

### **Cerca Flexible**

- **Cerca de text**: Escriu qualsevol paraula clau
- **Filtres**: Per categoria, mecanisme, objecte, integració
- **Tags clicables**: Clica qualsevol tag per cercar per aquesta etiqueta

### **Captura Instantània de Documents**

- **Arrossega i deixa anar** qualsevol fitxer a la pàgina
- **Captura automàtica** a la carpeta `docs/doc-finder/documents/`
- **Feedback visual** amb estat de pujada i llistat de fitxers guardats o amb errors

### **Visualització**

- **Vista Grid**: Targetes amb diagrames
- **Vista Llista**: Llista compacta
- **Diagrames**: Clica a qualsevol diagrama per veure'l en pantalla completa

### **Afegir documents al vol**

- **Arrossega i deixa anar**: Pots arrossegar un fitxer damunt de qualsevol part de la pàgina; l'aplicació el pujarà automàticament.
- **Destí intel·ligent**: El servidor desa el fitxer a la carpeta de documents vinculada al `processes-database.json` actiu (respectant configuracions personalitzades via `VITE_DATABASE_URL`).
- **Validacions**: Es rebutgen duplicats i fitxers superiors a 15 MB; l'usuari rep un missatge de confirmació o error.

### **Informació Detallada**

- **Prioritat**: Critical, High, Medium
- **Complexitat**: Visualització del nivell de complexitat
- **Metadades**: Objectes, integracions, mecanismes
- **Documentació**: Enllaços a la documentació original

## 📊 Casos d'Ús

### 🔍 **Cerca per Objecte**

**Escenari**: Estàs treballant amb codi relacionat amb `Account`
**Acció**: Escriu "account" a la cerca o selecciona "Account" al filtre d'objectes
**Resultat**: Veuràs tots els processos relacionats amb Account

### 🔍 **Cerca per Integració**

**Escenari**: Reunió funcional sobre integració amb EDRAS
**Acció**: Escriu "edras" a la cerca o selecciona "EDRAS" al filtre d'integracions
**Resultat**: Veuràs tots els processos que integren amb EDRAS

### 🔍 **Cerca per Problema**

**Escenari**: Detectes un problema de recursió
**Acció**: Escriu "recursion" a la cerca o clica el tag "recursion"
**Resultat**: Veuràs el problema crític i les solucions

### 🔍 **Cerca per Mecanisme**

**Escenari**: Vols entendre com funcionen els triggers
**Acció**: Selecciona "Trigger" al filtre de mecanismes
**Resultat**: Veuràs tots els processos basats en triggers

## 🏗️ Arquitectura

### **Fitxers Principals**

- `react-app/` - Aplicació React + Vite (sources TSX/CSS)
- `react-app/public/processes-database.json` - es genera a partir de `../processes-database.json`
- `react-app/dist/` - Build estàtic que serveix el Document Finder
- `documents/` - Carpeta on es desen els fitxers arrossegats al Document Finder
- `processes-database.json` - Base de dades dels processos (fonte única)
- `server.py` - Servidor web Python
- `README.md` - Aquesta documentació

### **Estructura de Dades**

```json
{
  "id": "unique-identifier",
  "name": "Nom del Procés",
  "description": "Descripció detallada",
  "tags": ["tag1", "tag2"],
  "objects": ["Object1", "Object2"],
  "integrations": ["Integration1"],
  "mechanism": "Trigger|Batchable|OmniScript|...",
  "category": "Architectural|Business Process|...",
  "diagram": "diagram-file.png",
  "documentation": "path/to/docs.md",
  "priority": "critical|high|medium",
  "complexity": "high|medium|low"
}
```

## 🔧 Personalització

### **Afegir Nous Processos**

1. Edita `processes-database.json`
2. Afegeix/actualitza els arrays de `processes`, `categories`, `mechanisms`, `objects`, `integrations`
3. Executa `npm run sync:data` o `npm run build` des de `react-app/`
4. Refresca la pàgina web

### **Capturar Documents via Drag & Drop**

1. Obre el Document Finder (`python3 server.py`)
2. Arrossega fitxers des del teu escriptori a qualsevol punt de la interfície
3. Verifica el resum de pujada (fitxers guardats i ubicació relativa)
4. Consulta els fitxers a `docs/doc-finder/documents/`

### **Configurar la ruta de la base de dades**

- Per defecte, l'app carrega `processes-database.json` des del mateix directori on es publica el bundle (`dist/`).
- Si necessites servir-lo des d'una altra ubicació, defineix la variable d'entorn `VITE_DATABASE_URL` abans d'executar `npm run dev` o `npm run build` (per exemple `VITE_DATABASE_URL=/static/data/processes.json`).
- Durant l'execució, la configuració té preferència sobre la ruta predeterminada.

### **Modificar Estils i Funcionalitats**

- Actualitza els components a `react-app/src/**`
- Estils globals a `react-app/src/index.css` i `src/App.css`
- Components principals:
  - `Sidebar.tsx`, `FiltersPanel.tsx`, `ProcessResults.tsx`
  - `RightPanel.tsx` (detalls amb mida i estat persistents)
  - `DiagramModal.tsx`
- Executa `npm run dev` per validar canvis en temps real

## 📁 Estructura de Fitxers

```
docs/
├── doc-finder/                 # Document Finder - Interfície web cerqueable
│   ├── index.html              # Versió legacy (mantinguda per referència)
│   ├── processes-database.json # Base de dades dels processos
│   ├── react-app/              # Nova aplicació React (Vite + TypeScript)
│   ├── server.py               # Servidor web Python
│   └── README.md               # Aquesta documentació
├── diagrams/                   # Diagrames PNG
│   ├── 01-Asset-Trigger-Recursion-Infinita.png
│   ├── 02-Patron-GSP-MetadataTriggerHandler-23-Triggers.png
│   └── ...
└── ...
```

## 🎨 Característiques de la Interfície

### **Disseny Responsiu**

- Funciona en desktop, tablet i mòbil
- Adaptació automàtica de la vista grid/llista

### **Experiència d'Usuari**

- Cerca en temps real
- Filtres combinables
- Tags clicables
- Diagrames en modal
- Informació contextual

### **Rendiment**

- Carregament ràpid
- Cerca instantània
- Imatges optimitzades

## 🔄 Manteniment

### **Actualitzar Processos**

1. Modifica `processes-database.json`
2. Refresca la pàgina web
3. Verifica que els diagrames es carreguen correctament

### **Afegir Diagrames**

1. Afegeix el PNG a `docs/diagrams/`
2. Actualitza la referència a `processes-database.json`
3. Verifica que la ruta sigui correcta

### **Backup**

- Fes còpia de `processes-database.json` abans de modificar-lo
- Mantén els diagrames originals segurs

## 🚀 Futurs Millores

### **Funcionalitats Potencials**

- [ ] Cerca avançada amb operadors booleans
- [ ] Exportació de resultats a PDF/Excel
- [ ] Historial de cerques
- [ ] Favorits/marcadors
- [ ] Comentaris i notes personals
- [ ] Integració amb Git per versionat
- [ ] API REST per integració externa

### **Millores Tècniques**

- [ ] Base de dades SQLite per millor rendiment
- [ ] Cache de cerques
- [ ] Compressió d'imatges
- [ ] PWA (Progressive Web App)
- [ ] Mode offline

---

**Creat**: Gener 2025
**Projecte**: Vodafone PYME Sales Force Consolidation
**Versió**: 1.0
