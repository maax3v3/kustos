import { env } from "./env"
import { useAuthStore } from "../stores/auth-store"

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD';

const httpMethodHasBody = (method: HttpMethod) => method === 'POST' || method === 'PUT';

export const makeRequestRaw = async <I>(method: HttpMethod, path: string, params?: I, headers?: Record<string, string>): Promise<Response> => {
    const authHeader = useAuthStore.getState().getAuthHeader();
    const baseUrl = env('VITE_KUSTOS_REGISTRY_URL');
    if (!httpMethodHasBody(method) && params) {
        path += `?${new URLSearchParams(params as Record<string, string>).toString()}`;
    }

    return fetch(`${baseUrl}${path}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': authHeader,
            ...headers
        },
        body: httpMethodHasBody(method) && params ? JSON.stringify(params) : undefined,
    });
}

export const makeRequest = async <I, O>(method: HttpMethod, path: string, params?: I): Promise<O> => {
    return makeRequestRaw(method, path, params, {}).then(res => {
        if (res.status === 401) {
            throw new Error('Unauthorized');
        }
        if (!res.ok) {
            throw new Error(`HTTP error: Status: ${res.status}`);
        }
        return res.json()
    });
}