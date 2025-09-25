export type Language = 'ca' | 'es'

export interface Translations {
  // Navigation
  searchDocuments: string
  diagrams: string
  businessProcesses: string

  // Header
  knowledgeBase: string
  businessProcessesSubtitle: string
  back: string

  // Search & Filters
  searchPlaceholder: string
  allCategories: string
  allMechanisms: string
  allObjects: string
  allIntegrations: string
  allTags: string

  // Upload & drag-drop
  dropOverlayTitle: string
  dropOverlaySubtitle: string
  uploadingFile: string
  uploadTooManyFiles: string

  // Results
  resultsCount: string
  gridView: string
  listView: string
  noResults: string
  noResultsDescription: string

  // Process Details
  description: string
  category: string
  mechanism: string
  objects: string
  integrations: string
  priority: string
  complexity: string
  tags: string
  documentation: string
  viewDocumentation: string
  viewDiagram: string
  noDiagramAvailable: string

  // Sidebar
  mainNavigation: string
  categories: string
  mechanisms: string
  tagsFilter: string

  // Right Panel
  selectProcess: string
  minimizePanel: string
  closePanel: string
  tagManagement: string
  openTagManager: string
  hideTagManager: string
  tagManagerHint: string
  tagPlaceholder: string
  addTag: string
  noTags: string
  removeTag: string
  tagColorLabel: string
  presetColor: string
  customColor: string

  // Global Tag Manager
  manageTags: string

  // Modal
  close: string

  // Priority levels
  critical: string
  high: string
  medium: string
  low: string

  // Complexity levels
  highComplexity: string
  mediumComplexity: string
  lowComplexity: string

  // Categories
  architectural: string
  criticalIssues: string
  objectSpecific: string
  businessProcess: string
  interactiveProcess: string
  approval: string
  integration: string
  compliance: string

  // Mechanisms
  trigger: string
  batchable: string
  schedulable: string
  queueable: string
  omniscript: string
  approvalProcess: string
  platformEvents: string

  // Uploads
  dropzoneTitle: string
  dropzoneSubtitle: string
  uploading: string
  uploadSuccess: string
  uploadPartial: string
  uploadError: string
  savedFiles: string
  failedFiles: string
  refreshDatabase: string
}

export const translations: Record<Language, Translations> = {
  ca: {
    // Navigation
    searchDocuments: 'Cerca Documents',
    diagrams: 'Diagrames',
    businessProcesses: 'Processos de Negoci',

    // Header
    knowledgeBase: 'Base de Coneixement',
    businessProcessesSubtitle: 'Processos de Negoci Vodafone PYME',
    back: 'Tornar',

    // Search & Filters
    searchPlaceholder: 'Cerca per nom, descripció, objecte, integració, mecanisme...',
    allCategories: 'Totes les categories',
    allMechanisms: 'Tots els mecanismes',
    allObjects: 'Tots els objectes',
    allIntegrations: 'Totes les integracions',
    allTags: 'Totes les etiquetes',

    // Upload & drag-drop
    dropOverlayTitle: 'Deixa anar el fitxer per incorporar-lo',
    dropOverlaySubtitle: 'L\'arxiu es desarà automàticament a la carpeta de documents activa',
    uploadingFile: 'Pujant fitxer…',
    uploadTooManyFiles: 'Només pots arrossegar un fitxer cada vegada',

    // Results
    resultsCount: 'de',
    gridView: 'Grid',
    listView: 'Llista',
    noResults: 'No s\'han trobat resultats',
    noResultsDescription: 'Prova amb altres criteris de cerca.',

    // Process Details
    description: 'Descripció',
    category: 'Categoria:',
    mechanism: 'Mecanisme:',
    objects: 'Objectes:',
    integrations: 'Integracions:',
    priority: 'Prioritat:',
    complexity: 'Complexitat:',
    tags: 'Tags:',
    documentation: 'Documentació:',
    viewDocumentation: 'Veure documentació',
    viewDiagram: 'Veure diagrama',
    noDiagramAvailable: 'No hi ha diagrama disponible',

    // Sidebar
    mainNavigation: 'Navegació Principal',
    categories: 'Categories',
    mechanisms: 'Mecanismes',
    tagsFilter: 'Etiquetes',

    // Right Panel
    selectProcess: 'Selecciona un procés per veure la seva documentació.',
    minimizePanel: 'Minimitzar panell',
    closePanel: 'Tancar panell',
    tagManagement: 'Gestió d\'etiquetes',
    openTagManager: 'Gestiona etiquetes',
    hideTagManager: 'Amaga gestor d\'etiquetes',
    tagManagerHint: 'Afegeix, elimina o assigna colors a les etiquetes del procés.',
    tagPlaceholder: 'Afegeix o selecciona una etiqueta',
    addTag: 'Afegeix',
    noTags: 'Sense etiquetes assignades',
    removeTag: 'Elimina etiqueta',
    tagColorLabel: 'Color de l\'etiqueta',
    presetColor: 'Color suggerit',
    customColor: 'Color personalitzat',

    // Global Tag Manager
    manageTags: 'Gestiona etiquetes',

    // Modal
    close: 'Tancar',

    // Priority levels
    critical: 'critical',
    high: 'high',
    medium: 'medium',
    low: 'low',

    // Complexity levels
    highComplexity: 'high',
    mediumComplexity: 'medium',
    lowComplexity: 'low',

    // Categories
    architectural: 'Architectural',
    criticalIssues: 'Critical Issues',
    objectSpecific: 'Object-Specific',
    businessProcess: 'Business Process',
    interactiveProcess: 'Interactive Process',
    approval: 'Approval',
    integration: 'Integration',
    compliance: 'Compliance',

    // Mechanisms
    trigger: 'Trigger',
    batchable: 'Batchable',
    schedulable: 'Schedulable',
    queueable: 'Queueable',
    omniscript: 'OmniScript',
    approvalProcess: 'Approval Process',
    platformEvents: 'Platform Events',

    // Uploads
    dropzoneTitle: 'Deixa anar els fitxers per capturar-los',
    dropzoneSubtitle: 'Els guardarem automàticament a la carpeta de documents activa',
    uploading: 'Pujant fitxers...',
    uploadSuccess: 'Tots els fitxers s\'han guardat correctament.',
    uploadPartial: 'Alguns fitxers s\'han pogut guardar, revisa els errors.',
    uploadError: 'No s\'ha pogut guardar cap fitxer.',
    savedFiles: 'Fitxers guardats',
    failedFiles: 'Fitxers amb errors',
    refreshDatabase: 'Refrescar base de dades',
  },
  es: {
    // Navigation
    searchDocuments: 'Buscar Documentos',
    diagrams: 'Diagramas',
    businessProcesses: 'Procesos de Negocio',

    // Header
    knowledgeBase: 'Base de Conocimiento',
    businessProcessesSubtitle: 'Procesos de Negocio Vodafone PYME',
    back: 'Volver',

    // Search & Filters
    searchPlaceholder: 'Buscar por nombre, descripción, objeto, integración, mecanismo...',
    allCategories: 'Todas las categorías',
    allMechanisms: 'Todos los mecanismos',
    allObjects: 'Todos los objetos',
    allIntegrations: 'Todas las integraciones',
    allTags: 'Todas las etiquetas',

    // Upload & drag-drop
    dropOverlayTitle: 'Suelta el archivo para incorporarlo',
    dropOverlaySubtitle: 'El fichero se guardará automáticamente en la carpeta de documentos activa',
    uploadingFile: 'Subiendo archivo…',
    uploadTooManyFiles: 'Solo puedes arrastrar un archivo cada vez',

    // Results
    resultsCount: 'de',
    gridView: 'Cuadrícula',
    listView: 'Lista',
    noResults: 'No se encontraron resultados',
    noResultsDescription: 'Prueba con otros criterios de búsqueda.',

    // Process Details
    description: 'Descripción',
    category: 'Categoría:',
    mechanism: 'Mecanismo:',
    objects: 'Objetos:',
    integrations: 'Integraciones:',
    priority: 'Prioridad:',
    complexity: 'Complejidad:',
    tags: 'Etiquetas:',
    documentation: 'Documentación:',
    viewDocumentation: 'Ver documentación',
    viewDiagram: 'Ver diagrama',
    noDiagramAvailable: 'No hay diagrama disponible',

    // Sidebar
    mainNavigation: 'Navegación Principal',
    categories: 'Categorías',
    mechanisms: 'Mecanismos',
    tagsFilter: 'Etiquetas',

    // Right Panel
    selectProcess: 'Selecciona un proceso para ver su documentación.',
    minimizePanel: 'Minimizar panel',
    closePanel: 'Cerrar panel',
    tagManagement: 'Gestión de etiquetas',
    openTagManager: 'Gestionar etiquetas',
    hideTagManager: 'Ocultar gestor de etiquetas',
    tagManagerHint: 'Añade, elimina o asigna colores a las etiquetas del proceso.',
    tagPlaceholder: 'Añade o selecciona una etiqueta',
    addTag: 'Añadir',
    noTags: 'Sin etiquetas asignadas',
    removeTag: 'Eliminar etiqueta',
    tagColorLabel: 'Color de la etiqueta',
    presetColor: 'Color sugerido',
    customColor: 'Color personalizado',

    // Global Tag Manager
    manageTags: 'Gestionar etiquetas',

    // Modal
    close: 'Cerrar',

    // Priority levels
    critical: 'crítico',
    high: 'alto',
    medium: 'medio',
    low: 'bajo',

    // Complexity levels
    highComplexity: 'alta',
    mediumComplexity: 'media',
    lowComplexity: 'baja',

    // Categories
    architectural: 'Arquitectural',
    criticalIssues: 'Problemas Críticos',
    objectSpecific: 'Específico de Objeto',
    businessProcess: 'Proceso de Negocio',
    interactiveProcess: 'Proceso Interactivo',
    approval: 'Aprobación',
    integration: 'Integración',
    compliance: 'Cumplimiento',

    // Mechanisms
    trigger: 'Trigger',
    batchable: 'Procesable por Lotes',
    schedulable: 'Programable',
    queueable: 'En Cola',
    omniscript: 'OmniScript',
    approvalProcess: 'Proceso de Aprobación',
    platformEvents: 'Eventos de Plataforma',

    // Uploads
    dropzoneTitle: 'Suelta los ficheros para capturarlos',
    dropzoneSubtitle: 'Los guardaremos automáticamente en la carpeta de documentos activa',
    uploading: 'Subiendo ficheros...',
    uploadSuccess: 'Todos los ficheros se han guardado correctamente.',
    uploadPartial: 'Algunos ficheros se han guardado, revisa los errores.',
    uploadError: 'No se ha podido guardar ningún fichero.',
    savedFiles: 'Ficheros guardados',
    failedFiles: 'Ficheros con errores',
    refreshDatabase: 'Refrescar base de datos',
  },
}

export const getTranslation = (language: Language, key: keyof Translations): string => {
  return translations[language][key]
}

// Funciones para traducir valores de la base de datos
export const translateValue = (language: Language, value: string): string => {
  const valueMap: Record<string, keyof Translations> = {
    // Categories
    'Architectural': 'architectural',
    'Critical Issues': 'criticalIssues',
    'Object-Specific': 'objectSpecific',
    'Business Process': 'businessProcess',
    'Interactive Process': 'interactiveProcess',
    'Approval': 'approval',
    'Integration': 'integration',
    'Compliance': 'compliance',

    // Mechanisms
    'Trigger': 'trigger',
    'Batchable': 'batchable',
    'Schedulable': 'schedulable',
    'Queueable': 'queueable',
    'OmniScript': 'omniscript',
    'Approval Process': 'approvalProcess',
    'Platform Events': 'platformEvents',

    // Priority levels
    'critical': 'critical',
    'high': 'high',
    'medium': 'medium',
    'low': 'low',

    // Complexity levels
    'highComplexity': 'highComplexity',
    'mediumComplexity': 'mediumComplexity',
    'lowComplexity': 'lowComplexity',
  }

  const translationKey = valueMap[value]
  if (translationKey) {
    return getTranslation(language, translationKey)
  }

  // Si no hay traducción específica, devolver el valor original
  return value
}