# Documentació de Triggers - Índex

Aquest directori conté tota la documentació tècnica dels triggers de Salesforce del projecte Vodafone PYME.

## 📄 Fitxers Disponibles

### 📊 Diagrames i Fluxos

- **trigger-flowcharts.md** - Diagrames de flux originals dels triggers (amb errors de sintaxi)
- **trigger-flowcharts-fixed.md** - Versió corregida amb diagrames funcionals
- **trigger-flows-documentation.md** - Documentació detallada dels fluxos de triggers

### 📋 Resums i Guies

- **trigger-summary-table.md** - Taula resum de tots els triggers del sistema
- **README-TRIGGERS.md** - Guia d'ús i configuració dels triggers

## 🎯 Ús Recomanat

### Per Desenvolupadors Nous

1. Comença per `trigger-summary-table.md` per una vista general
2. Llegeix `README-TRIGGERS.md` per entendre els conceptes bàsics
3. Consulta `trigger-flowcharts-fixed.md` per veure els diagrames funcionals
4. Usa `trigger-flows-documentation.md` per detalls tècnics específics

### Per Arquitectes

1. Analitza `trigger-summary-table.md` per entendre l'arquitectura global
2. Revisa `trigger-flows-documentation.md` per entendre les interaccions
3. Consulta els diagrames PNG a `../diagrams/` per visualitzar els fluxos

### Per QA/Testing

1. Usa `trigger-summary-table.md` per identificar triggers a provar
2. Consulta `trigger-flows-documentation.md` per entendre els casos de prova
3. Revisa `trigger-flowcharts-fixed.md` per identificar fluxos complexos

## 🔧 Manteniment

- **Actualitzacions**: Quan es modifiquin triggers, actualitzar la documentació corresponent
- **Diagrames**: Mantenir sincronitzats els diagrames markdown amb els PNG
- **Versions**: Mantenir sempre la versió `-fixed` com a referència principal

## 📊 Estadístiques del Sistema

- **Total Triggers**: 37 triggers
- **Patrons Principals**: GSP_MetadataTriggerHandler (23 triggers)
- **Problemes Crítics**: Asset Trigger amb recursió infinita
- **Diagrames Generats**: 14 diagrames (9 originals + 5 corregits)

---

_Última actualització: Setembre 2024_
_Projecte: Vodafone PYME Sales Force Consolidation_
