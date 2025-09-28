export type MarkdownPreview = { type: 'markdown'; content: string }
export type JsonPreview = { type: 'json'; content: string }
export type TextPreview = { type: 'txt'; content: string }
export type ExcelPreview = { type: 'excel'; content: unknown[][] }
export type CsvPreview = { type: 'csv'; content: string }
export type DocxPreview = { type: 'docx'; content: string }
export type PptxSlide = {
  slideNumber: number
  title: string
  content: string
  notes: string
}
export type PptxPreview = { type: 'pptx'; content: PptxSlide[]; totalSlides?: number }
export type PptxErrorPreview = { type: 'pptx-error'; error: string }
export type ImagePreview = { type: 'image'; url: string }
export type BinaryPreview = { type: 'binary'; mimeType: string; size?: number }

export type PreviewResponse =
  | MarkdownPreview
  | JsonPreview
  | TextPreview
  | ExcelPreview
  | CsvPreview
  | DocxPreview
  | PptxPreview
  | PptxErrorPreview
  | ImagePreview
  | BinaryPreview
  | { type: string; content?: unknown; error?: string }
