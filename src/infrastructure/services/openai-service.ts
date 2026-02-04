import {
  IAIService,
  AIAnalysisInput,
  AIAnalysisResult,
} from '@domain/interfaces/ai-service';
import { RiskLevel } from '@domain/entities/diagnosis';
import { AIReasoningTier } from '@domain/types/ai-reasoning';
import { v4 as uuidv4 } from 'uuid';

interface OpenAIConfig {
  apiKey: string;
  maxRetries?: number;
  retryDelayMs?: number;
}

/**
 * Model Resolution Engine: Maps reasoning tiers to OpenAI model IDs.
 * This is the ONLY place model names are hardcoded.
 */
const TIER_MODEL_MAP: Record<AIReasoningTier, string> = {
  DIAGNOSTIC: 'gpt-5-mini', // Cost-effective, structured legal analysis
  DEEP_LEGAL: 'gpt-4o',       // Full flagship model for complex cases
};

export class OpenAIService implements IAIService {
  private apiKey: string;
  private maxRetries: number;
  private retryDelayMs: number;
  private baseUrl = 'https://api.openai.com/v1';

  constructor(config?: Partial<OpenAIConfig>) {
    this.apiKey = config?.apiKey ?? process.env.OPENAI_API_KEY ?? '';
    this.maxRetries = config?.maxRetries ?? 3;
    this.retryDelayMs = config?.retryDelayMs ?? 1000;

    if (!this.apiKey) {
      console.warn('OpenAI API key not configured');
    }
  }

  /**
   * Resolves the OpenAI model ID for a given reasoning tier.
   * Supports AI_MODEL_OVERRIDE for emergencies/experiments.
   */
  private resolveModel(tier: AIReasoningTier): string {
    const override = process.env.AI_MODEL_OVERRIDE;
    if (override) {
      console.log(`[AI] Using model override: ${override}`);
      return override;
    }
    return TIER_MODEL_MAP[tier];
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async callOpenAI(
    messages: Array<{ role: string; content: string }>,
    model: string,
    attempt = 1
  ): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.3,
          response_format: { type: 'json_object' },
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        if (response.status === 429 || response.status >= 500) {
          throw new Error(`RETRYABLE: ${error}`);
        }
        throw new Error(`OpenAI API error: ${error}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error: any) {
      if (error.message?.startsWith('RETRYABLE:') && attempt < this.maxRetries) {
        const delay = this.retryDelayMs * Math.pow(2, attempt - 1);
        await this.sleep(delay);
        return this.callOpenAI(messages, model, attempt + 1);
      }
      throw error;
    }
  }

  async analyzeForDiagnosis(input: AIAnalysisInput): Promise<AIAnalysisResult> {
    const tier: AIReasoningTier = input.tier ?? 'DIAGNOSTIC';
    const model = this.resolveModel(tier);

    console.log(`[AI] Analyzing with tier=${tier}, model=${model}`);

    const systemPrompt = `Você é um assistente jurídico especializado em análise de transações imobiliárias no Brasil.
Analise os dados fornecidos e produza um diagnóstico jurídico estruturado.

Responda SEMPRE em JSON com a seguinte estrutura:
{
  "propertyStatus": "string descrevendo status geral do imóvel",
  "risks": [
    {
      "category": "categoria do risco",
      "description": "descrição detalhada",
      "level": "LOW|MEDIUM|HIGH|CRITICAL",
      "recommendation": "recomendação para mitigar"
    }
  ],
  "pathways": [
    {
      "title": "título do caminho",
      "description": "descrição",
      "steps": ["passo 1", "passo 2"],
      "estimatedDuration": "ex: 15-30 dias",
      "estimatedCost": { "min": 1000, "max": 2000 },
      "prerequisites": ["prerequisito 1"]
    }
  ],
  "summary": "resumo executivo do diagnóstico",
  "confidence": 0.85
}`;

    const userContent = this.formatInputForAnalysis(input);

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ];

    const responseText = await this.callOpenAI(messages, model);
    const parsed = JSON.parse(responseText);

    return {
      propertyStatus: parsed.propertyStatus || 'Status não determinado',
      risks: (parsed.risks || []).map((r: any) => ({
        id: uuidv4(),
        category: r.category || 'Geral',
        description: r.description || '',
        level: this.normalizeRiskLevel(r.level),
        recommendation: r.recommendation || '',
        estimatedCost: r.estimatedCost,
      })),
      pathways: (parsed.pathways || []).map((p: any) => ({
        id: uuidv4(),
        title: p.title || '',
        description: p.description || '',
        steps: p.steps || [],
        estimatedDuration: p.estimatedDuration || 'A definir',
        estimatedCost: p.estimatedCost || { min: 0, max: 0, currency: 'BRL' },
        prerequisites: p.prerequisites || [],
      })),
      summary: parsed.summary || '',
      confidence: Math.min(1, Math.max(0, parsed.confidence || 0.7)),
      metadata: {
        tierUsed: tier,
        modelUsed: model,
        analyzedAt: new Date(),
      },
    };
  }


  private formatInputForAnalysis(input: AIAnalysisInput): string {
    const parts: string[] = [];

    parts.push('=== QUESTIONÁRIO ===');
    if (input.questionnaire?.answers) {
      input.questionnaire.answers.forEach((a) => {
        parts.push(`Pergunta ${a.questionId}: ${JSON.stringify(a.value)}`);
      });
    }

    parts.push('\n=== DOCUMENTOS ===');
    input.documents.forEach((doc) => {
      parts.push(`- ${doc.type}: ${doc.fileName} (Status: ${doc.status})`);
    });

    if (input.documentContents.length > 0) {
      parts.push('\n=== CONTEÚDO EXTRAÍDO ===');
      input.documentContents.forEach((content) => {
        parts.push(`[Doc ${content.documentId}]:`);
        parts.push(content.extractedText.substring(0, 3000));
      });
    }

    return parts.join('\n');
  }

  private normalizeRiskLevel(level: string): RiskLevel {
    const normalized = (level || '').toUpperCase();
    if (['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(normalized)) {
      return normalized as RiskLevel;
    }
    return 'MEDIUM';
  }

  async extractDocumentData(
    documentContent: Buffer,
    mimeType: string
  ): Promise<Record<string, unknown>> {
    const base64Content = documentContent.toString('base64');

    if (mimeType.startsWith('image/')) {
      const messages = [
        {
          role: 'system',
          content:
            'Extraia todas as informações relevantes do documento imobiliário. Responda em JSON.',
        },
        {
          role: 'user',
          content: JSON.stringify({
            type: 'image',
            image_url: { url: `data:${mimeType};base64,${base64Content}` },
          }),
        },
      ];
      const response = await this.callOpenAI(messages as any, TIER_MODEL_MAP.DIAGNOSTIC);
      return JSON.parse(response);
    }

    return {
      text: documentContent.toString('utf-8').substring(0, 5000),
      extractedAt: new Date().toISOString(),
    };
  }

  async classifyIntent(userMessage: string): Promise<string> {
    const messages = [
      {
        role: 'system',
        content: `Classifique a intenção do usuário em uma das categorias:
- SALE: venda de imóvel
- PURCHASE: compra de imóvel  
- RENTAL: aluguel
- FINANCING: financiamento
- REFINANCING: refinanciamento
- REGULARIZATION: regularização
- OTHER: outro

Responda apenas com o nome da categoria.`,
      },
      { role: 'user', content: userMessage },
    ];

    const response = await this.callOpenAI(messages, TIER_MODEL_MAP.DIAGNOSTIC);
    return response.trim().toUpperCase();
  }
}
