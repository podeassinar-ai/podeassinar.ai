export function mapAuthError(message: string): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('invalid login credentials')) {
    return 'Email ou senha incorretos.';
  }
  if (lowerMessage.includes('email not confirmed')) {
    return 'Email não confirmado. Verifique sua caixa de entrada.';
  }
  if (lowerMessage.includes('user already registered')) {
    return 'Este email já está cadastrado.';
  }
  if (lowerMessage.includes('password should be at least')) {
    return 'A senha deve ter pelo menos 6 caracteres.';
  }
  if (lowerMessage.includes('rate limit exceeded') || lowerMessage.includes('too many requests')) {
    return 'Muitas tentativas. Tente novamente mais tarde.';
  }
  if (lowerMessage.includes('error sending user recovery email')) {
    return 'Erro ao enviar email de recuperação. Tente novamente.';
  }
  
  return 'Ocorreu um erro. Tente novamente.';
}

export function mapGenericError(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('network error') || lowerMessage.includes('fetch failed')) {
        return 'Erro de conexão. Verifique sua internet.';
    }
    
    // Fallback to auth mapping if applicable, or return original if it looks like a custom message, 
    // but here we simply return a default or the message if it's not mapped but safe.
    // For safety and full translation, we default to a generic message if we don't recognize it,
    // or try to pass it through if it's likely already in PT.
    
    // Simple heuristic: if it contains typical English words
    if (/[a-zA-Z]/.test(message) && !/[ãõáéíóúç]/i.test(message) && message.split(' ').length > 2) {
         // Likely English, try to map
         if (lowerMessage.includes('error')) return 'Ocorreu um erro inesperado.';
         return mapAuthError(message);
    }

    return message;
}
