const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
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
