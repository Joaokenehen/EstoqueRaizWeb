import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
  console.warn("⚠️ AVISO: GEMINI_API_KEY não configurada no ambiente.");
}

// Inicializa o SDK do Google com a sua chave
export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
