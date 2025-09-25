# Document Finder React Client

Aplicació React + Vite encarregada de renderitzar el cercador de documentació de Vodafone PYME.

## Scripts principals

```bash
npm install        # Instal·la dependències
npm run dev        # Entorn local amb hot reload (http://localhost:5173/)
npm run build      # Genera el bundle a dist/
npm run preview    # Previsualització del build (necessita el bundle generat)
npm run sync:data  # Copia processes-database.json al directori public/
```

> `npm run build` executa automàticament `sync:data` per garantir que la base de dades estigui actualitzada.

## Estructura

- `src/` components i estils (TypeScript + CSS)
- `public/` recursos estàtics (inclou `processes-database.json`)
- `dist/` resultat del build (ignorat al VCS)
- `scripts/sync-data.mjs` sincronitza la base de dades compartida

## Notes

- El servidor Python (`docs/doc-finder/server.py`) serveix el contingut generat a `dist/`.
- Si no hi ha bundle disponible, el servidor avisa i ofereix la versió legacy basada en `index.html`.
- Pots definir `VITE_DATABASE_URL` per indicar una ubicació alternativa del fitxer `processes-database.json` tant en desenvolupament com en build.
- Pots arrossegar qualsevol fitxer damunt de l'aplicació per afegir-lo a la carpeta de documents activa (la que conté el `processes-database.json` carregat). El servidor rebutja fitxers duplicats i límits superiors a 15 MB.
- Guarda preferències d'usuari (vista, filtres, estats dels panells) a `localStorage`.
- Per modificar dades de negoci, edita `../processes-database.json` i torna a executar `npm run build`.
