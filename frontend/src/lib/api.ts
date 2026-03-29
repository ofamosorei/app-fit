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

  let response: Response;
  try {
    response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error('Falha de conexao com o servidor. Tente novamente em instantes.');
  }

  if (!response.ok) {
    let errorMessage = 'Erro ao processar requisição.';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // Falha ao fazer parse do json de erro
    }
    
    // 401 indica sessão inválida; 403 pode ser apenas falta de acesso pago.
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('@appfit:token');
        window.location.href = '/login';
      }
    }
    
    throw new Error(errorMessage);
  }

  return response.json();
};
