export interface TokenPayload {
    userId: number;
    tenantId?: number;
    tenantSlug?: string;
    tenantName?: string;
    role: string;
}