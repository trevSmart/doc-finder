declare module 'pptx2json' {
  export class Pptx2Json {
    toJson(buffer: Buffer): Promise<{
      slides?: Array<{
        title?: string
        content?: string
        notes?: string
      }>
    }>
  }
}
