const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, { headers: { Accept: "application/json" } });
  if (!response.ok) throw await toApiError(response);
  return (await response.json()) as T;
}

export async function apiPost<TResponse, TBody>(path: string, body: TBody): Promise<TResponse> {
  return apiWrite<TResponse, TBody>(path, "POST", body);
}

export async function apiPut<TResponse, TBody>(path: string, body: TBody): Promise<TResponse> {
  return apiWrite<TResponse, TBody>(path, "PUT", body);
}

async function apiWrite<TResponse, TBody>(path: string, method: "POST" | "PUT", body: TBody) {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw await toApiError(response);
  return (await response.json()) as TResponse;
}

async function toApiError(response: Response): Promise<Error> {
  try {
    const body = (await response.json()) as { message?: string };
    return new Error(body.message ?? `API request failed (${response.status})`);
  } catch {
    return new Error(`API request failed (${response.status})`);
  }
}
