import {
  IDocumentExtractor,
  ExtractionResult,
} from '@domain/interfaces/document-extractor';

const SUPPORTED_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/tiff',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/markdown',
];

export class NodeDocumentExtractor implements IDocumentExtractor {
  private openaiApiKey: string;

  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY ?? '';
  }

  async extract(content: Buffer, mimeType: string): Promise<ExtractionResult> {
    if (!this.isSupported(mimeType)) {
      return {
        success: false,
        error: `Unsupported MIME type: ${mimeType}`,
        text: '',
        tables: [],
        metadata: {
          usedOcr: false,
          mimeType,
          extractedAt: new Date(),
        },
      };
    }

    try {
      if (mimeType === 'application/pdf') {
        return await this.extractPdf(content, mimeType);
      }

      if (mimeType.startsWith('image/')) {
        return await this.extractImage(content, mimeType);
      }

      if (mimeType === 'text/plain' || mimeType === 'text/markdown') {
        return this.extractText(content, mimeType);
      }

      if (mimeType.includes('wordprocessingml')) {
        return await this.extractDocx(content, mimeType);
      }

      return {
        success: false,
        error: `No handler for MIME type: ${mimeType}`,
        text: '',
        tables: [],
        metadata: { usedOcr: false, mimeType, extractedAt: new Date() },
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Extraction failed: ${error.message}`,
        text: '',
        tables: [],
        metadata: { usedOcr: false, mimeType, extractedAt: new Date() },
      };
    }
  }

  private async extractPdf(content: Buffer, mimeType: string): Promise<ExtractionResult> {
    const { PDFParse } = await import('pdf-parse');
    const parser = new PDFParse({ data: new Uint8Array(content) });
    const textResult = await parser.getText();

    const text = textResult.text?.trim() || '';
    const numPages = textResult.pages?.length;

    // If PDF has no text (scanned document), try OCR via OpenAI vision
    if (text.length < 50) {
      console.log('[NodeExtractor] PDF has little text, attempting OCR via OpenAI vision');
      await parser.destroy();
      return this.extractImage(content, 'image/png');
    }

    await parser.destroy();

    return {
      success: true,
      text,
      tables: [],
      metadata: {
        pageCount: numPages,
        usedOcr: false,
        mimeType,
        extractedAt: new Date(),
      },
    };
  }

  private async extractImage(content: Buffer, mimeType: string): Promise<ExtractionResult> {
    if (!this.openaiApiKey) {
      return {
        success: false,
        error: 'OpenAI API key not configured for OCR',
        text: '',
        tables: [],
        metadata: { usedOcr: true, mimeType, extractedAt: new Date() },
      };
    }

    const base64Content = content.toString('base64');
    const imageMime = mimeType.startsWith('image/') ? mimeType : 'image/png';

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'Voce e um OCR especializado em documentos imobiliarios brasileiros. Extraia TODO o texto visivel do documento, preservando a estrutura. Retorne apenas o texto extraido, sem comentarios adicionais.',
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Extraia todo o texto deste documento.' },
              {
                type: 'image_url',
                image_url: { url: `data:${imageMime};base64,${base64Content}` },
              },
            ],
          },
        ],
        temperature: 0.1,
        max_tokens: 4096,
      }),
      signal: AbortSignal.timeout(60000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `OpenAI vision API error: ${errorText}`,
        text: '',
        tables: [],
        metadata: { usedOcr: true, mimeType, extractedAt: new Date() },
      };
    }

    const data = await response.json();
    const extractedText = data.choices?.[0]?.message?.content || '';

    return {
      success: true,
      text: extractedText,
      tables: [],
      metadata: {
        usedOcr: true,
        mimeType,
        extractedAt: new Date(),
        ocrConfidence: 0.8,
      },
    };
  }

  private extractText(content: Buffer, mimeType: string): ExtractionResult {
    return {
      success: true,
      text: content.toString('utf-8'),
      tables: [],
      metadata: {
        usedOcr: false,
        mimeType,
        extractedAt: new Date(),
      },
    };
  }

  private async extractDocx(content: Buffer, mimeType: string): Promise<ExtractionResult> {
    // Basic DOCX extraction: DOCX is a ZIP containing XML.
    // For a lightweight approach, extract the raw XML text content.
    try {
      const { default: AdmZip } = await import('adm-zip');
      const zip = new AdmZip(content);
      const docXml = zip.readAsText('word/document.xml');

      // Strip XML tags to get text
      const text = docXml
        .replace(/<w:p[^>]*>/g, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .trim();

      return {
        success: true,
        text,
        tables: [],
        metadata: { usedOcr: false, mimeType, extractedAt: new Date() },
      };
    } catch {
      return {
        success: false,
        error: 'Failed to extract text from DOCX file',
        text: '',
        tables: [],
        metadata: { usedOcr: false, mimeType, extractedAt: new Date() },
      };
    }
  }

  isSupported(mimeType: string): boolean {
    return SUPPORTED_MIME_TYPES.includes(mimeType.toLowerCase());
  }

  getSupportedMimeTypes(): string[] {
    return [...SUPPORTED_MIME_TYPES];
  }
}
