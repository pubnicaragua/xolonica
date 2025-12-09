// Servicio para el chatbot con Groq AI
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: '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',
  dangerouslyAllowBrowser: true,
});

const XOLONICA_CONTEXT = `
Eres un asistente virtual de Xolonica.store, una plataforma nicaragüense que conecta clientes con negocios verificados.

INFORMACIÓN CLAVE:
- Plataforma de directorio de negocios verificados en Nicaragua
- Los negocios pagan C$199 al mes por su perfil
- Cada negocio puede mostrar hasta 10 productos/servicios
- Sistema de verificación de 3 niveles (estrellas):
  * 1 estrella: Verificación básica con nombre
  * 2 estrellas: Cédula verificada con foto
  * 3 estrellas: Tienda física + RUC + cuenta bancaria verificada
- Los pagos se realizan directamente entre cliente y negocio (Xolonica NO procesa pagos)
- Los clientes pueden dejar reseñas y chatear con los negocios
- Cobertura en las principales ciudades de Nicaragua

Tu trabajo es ayudar a los usuarios a encontrar negocios o productos, explicar cómo funciona la plataforma,
guiar a los negocios interesados en registrarse y responder preguntas sobre verificación, pagos y funcionalidades.
Sé amable, profesional y usa lenguaje nicaragüense cuando sea apropiado.
`;

export async function sendChatMessage(
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<string> {
  try {
    const messages: any[] = [
      { role: 'system', content: XOLONICA_CONTEXT },
      ...conversationHistory,
      { role: 'user', content: userMessage },
    ];

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    return completion.choices[0]?.message?.content || 'Lo siento, no pude procesar tu mensaje.';
  } catch (error) {
    console.error('Error en Groq AI:', error);
    return 'Lo siento, hubo un error. Por favor intenta de nuevo.';
  }
}
