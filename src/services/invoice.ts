
interface InvoicePayload {
    tenantId: string;
    amount: number;
    customerName: string;
    customerEmail: string;
    customerDoc: string; // CPF/CNPJ
    description: string;
}

export type InvoiceProvider = 'enotas' | 'focus' | 'asaas';

export async function issueInvoice(payload: InvoicePayload, provider: InvoiceProvider = 'enotas') {
    // 1. Get API Key from System Settings (Mocked for now as we don't have a DB table yet)
    const apiKey = process.env.INVOICE_API_KEY;

    if (!apiKey) {
        console.warn("⚠️ Sem API Key de Nota Fiscal configurada. Simulando emissão.");
        return { success: true, status: 'simulated', id: 'mock-nfe-123' };
    }

    // 2. Call the specific provider
    try {
        switch (provider) {
            case 'enotas':
                return await issueENotas(payload, apiKey);
            case 'focus':
                return await issueFocusNFe(payload, apiKey);
            default:
                throw new Error(`Provider ${provider} not implemented`);
        }
    } catch (error) {
        console.error(`Error issuing invoice with ${provider}:`, error);
        return { success: false, error };
    }
}

async function issueENotas(payload: InvoicePayload, apiKey: string) {
    // Mock implementation of eNotas API call
    // Docs: https://docs.enotas.com.br/

    console.log('🚀 Calling eNotas API...', payload);

    // const response = await fetch('https://api.enotas.com.br/v1/notas-fiscais', { ... })

    return { success: true, provider: 'enotas', id: 'def-456' };
}

async function issueFocusNFe(payload: InvoicePayload, apiKey: string) {
    // Mock implementation of Focus NFe API call
    // Docs: https://focusnfe.com.br/doc

    console.log('🚀 Calling Focus NFe API...', payload);

    return { success: true, provider: 'focus', id: 'ghi-789' };
}
