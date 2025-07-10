import { WhatsAppMessage } from '../interface/whatsapp.interface';

// Función modificada para procesar mensajes entrantes
export function generateAutoResponse(message: WhatsAppMessage): string {
  switch (message.type) {
    case 'text':
      const userText = message.text?.body?.toLowerCase() || '';
      
      // Respuestas simples basadas en el texto
      if (userText.includes('hola')) {
        return '¡Hola! 👋 ¿Cómo puedo ayudarte?';
      }
      if (userText.includes('gracias')) {
        return '¡De nada! 😊 ¿Hay algo más en lo que pueda ayudarte?';
      }
      if (userText.includes('adiós') || userText.includes('bye')) {
        return '¡Hasta luego! 👋 Que tengas un buen día.';
      }
      
      // Respuesta por defecto
      return `Recibí tu mensaje: "${message.text?.body}". ¿En qué puedo ayudarte?`;
      
    case 'image':
      return '📸 ¡Bonita imagen! Gracias por compartirla.';
      
    case 'document':
      return '📄 Documento recibido. Lo revisaré pronto.';
      
    case 'audio':
      return '🎵 Audio recibido. Lo escucharé en un momento.';
      
    case 'video':
      return '🎥 Video recibido. Lo veré pronto.';
      
    case 'location':
      return '📍 Ubicación recibida. ¡Gracias por compartirla!';
      
    default:
      return 'Mensaje recibido. ¿En qué puedo ayudarte?';
  }
}