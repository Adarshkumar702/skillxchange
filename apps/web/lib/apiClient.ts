// Clean API Base URL resolution for Localhost and Production Cloud
const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // Localhost development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000/api';
    }
    // Production Vercel deployment
    return process.env.NEXT_PUBLIC_API_URL || 'https://skillxchange-api-olgv.onrender.com/api';
  }
  return process.env.NEXT_PUBLIC_API_URL || 'https://skillxchange-api-olgv.onrender.com/api';
};

export async function fetchApi<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; message: string; data?: T; errors?: string[] }> {
  let token = '';
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('accessToken') || '';
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const apiBase = getApiBaseUrl();

  try {
    const res = await fetch(`${apiBase}${endpoint}`, {
      ...options,
      headers,
    });

    const body = await res.json();
    if (!res.ok) {
      return {
        success: false,
        message: body.message || 'An API error occurred',
        errors: body.errors || [],
      };
    }
    return body;
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Network connection failed',
      errors: [err.message],
    };
  }
}
