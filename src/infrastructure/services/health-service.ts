import { createClient } from '@supabase/supabase-js';

export interface ServiceHealth {
    name: string;
    status: 'operational' | 'degraded' | 'down' | 'maintenance';
    latency?: string;
    error?: string;
}

export interface SystemHealthResult {
    services: ServiceHealth[];
    overallStatus: 'operational' | 'degraded' | 'down';
    checkedAt: Date;
}

export class HealthService {
    private supabaseUrl: string;
    private supabaseKey: string;
    private openaiKey: string;
    private abacateApiKey: string;

    constructor() {
        this.supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        this.supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
        this.openaiKey = process.env.OPENAI_API_KEY || '';
        this.abacateApiKey = process.env.ABACATEPAY_API_KEY || '';
    }

    async checkAll(): Promise<SystemHealthResult> {
        const services: ServiceHealth[] = await Promise.all([
            this.checkSupabaseDatabase(),
            this.checkSupabaseStorage(),
            this.checkOpenAI(),
            this.checkAbacatePay(),
        ]);

        const downCount = services.filter(s => s.status === 'down').length;
        const degradedCount = services.filter(s => s.status === 'degraded').length;

        let overallStatus: 'operational' | 'degraded' | 'down' = 'operational';
        if (downCount > 0) {
            overallStatus = downCount >= services.length / 2 ? 'down' : 'degraded';
        } else if (degradedCount > 0) {
            overallStatus = 'degraded';
        }

        return {
            services,
            overallStatus,
            checkedAt: new Date(),
        };
    }

    private async checkSupabaseDatabase(): Promise<ServiceHealth> {
        const start = Date.now();
        try {
            const supabase = createClient(this.supabaseUrl, this.supabaseKey);
            // Simple health check query
            const { error } = await supabase.from('users').select('id').limit(1);

            if (error) {
                return {
                    name: 'Database (Supabase)',
                    status: 'degraded',
                    error: error.message,
                };
            }

            const latency = Date.now() - start;
            return {
                name: 'Database (Supabase)',
                status: 'operational',
                latency: `${latency}ms`,
            };
        } catch (err: any) {
            return {
                name: 'Database (Supabase)',
                status: 'down',
                error: err.message,
            };
        }
    }

    private async checkSupabaseStorage(): Promise<ServiceHealth> {
        const start = Date.now();
        try {
            const supabase = createClient(this.supabaseUrl, this.supabaseKey);
            // List buckets to check storage is accessible
            const { error } = await supabase.storage.listBuckets();

            if (error) {
                return {
                    name: 'Storage',
                    status: 'degraded',
                    error: error.message,
                };
            }

            const latency = Date.now() - start;
            return {
                name: 'Storage',
                status: 'operational',
                latency: `${latency}ms`,
            };
        } catch (err: any) {
            return {
                name: 'Storage',
                status: 'down',
                error: err.message,
            };
        }
    }

    private async checkOpenAI(): Promise<ServiceHealth> {
        if (!this.openaiKey) {
            return {
                name: 'IA Engine (OpenAI)',
                status: 'down',
                error: 'API key not configured',
            };
        }

        const start = Date.now();
        try {
            // Light-weight models endpoint check
            const response = await fetch('https://api.openai.com/v1/models', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.openaiKey}`,
                },
                signal: AbortSignal.timeout(5000),
            });

            const latency = Date.now() - start;

            if (response.ok) {
                return {
                    name: 'IA Engine (OpenAI)',
                    status: 'operational',
                    latency: `${latency}ms`,
                };
            } else if (response.status === 429) {
                return {
                    name: 'IA Engine (OpenAI)',
                    status: 'degraded',
                    latency: `${latency}ms`,
                    error: 'Rate limited',
                };
            } else {
                return {
                    name: 'IA Engine (OpenAI)',
                    status: 'degraded',
                    error: `HTTP ${response.status}`,
                };
            }
        } catch (err: any) {
            return {
                name: 'IA Engine (OpenAI)',
                status: 'down',
                error: err.message,
            };
        }
    }

    private async checkAbacatePay(): Promise<ServiceHealth> {
        if (!this.abacateApiKey) {
            return {
                name: 'Payment Gateway',
                status: 'down',
                error: 'API key not configured',
            };
        }

        const start = Date.now();
        try {
            // AbacatePay health check (adjust endpoint as needed)
            const response = await fetch('https://api.abacatepay.com/v1/billing/list', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.abacateApiKey}`,
                },
                signal: AbortSignal.timeout(5000),
            });

            const latency = Date.now() - start;

            if (response.ok || response.status === 401) {
                // 401 means the API is reachable but auth might need refresh - still operational
                return {
                    name: 'Payment Gateway',
                    status: response.ok ? 'operational' : 'degraded',
                    latency: `${latency}ms`,
                    error: response.ok ? undefined : 'Auth issue',
                };
            } else {
                return {
                    name: 'Payment Gateway',
                    status: 'degraded',
                    error: `HTTP ${response.status}`,
                };
            }
        } catch (err: any) {
            return {
                name: 'Payment Gateway',
                status: 'down',
                error: err.message,
            };
        }
    }
}
