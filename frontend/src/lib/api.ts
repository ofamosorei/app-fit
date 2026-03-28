export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://api.secaapp.com').replace(/\/$/, '');
  const token = typeof window !== 'undefined' ? localStorage.getItem('@appfit:token') : null;

  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = 'Erro ao processar requisição.';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // Falha ao fazer parse do json de erro
    }
    
    // Se a api retornar 401 ou 403, podemos forçar o logout (limpar localStorage) e recarregar
    if (response.status === 401 || response.status === 403) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('@appfit:token');
        window.location.href = '/login';
      }
    }
    
    throw new Error(errorMessage);
  }

  return response.json();
};
