import { env } from "./env"

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

const httpMethodHasBody = (method: HttpMethod) => method === 'POST' || method === 'PUT';

export const makeRequest = async <I,O>(method: HttpMethod, path: string, params?: I): Promise<O> => {
    const baseUrl = env('KUSTOS_REGISTRY_URL');
    if (!httpMethodHasBody(method) && params) {
        path += `?${new URLSearchParams(params as Record<string, string>).toString()}`;
    }

    return fetch(`${baseUrl}${path}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: httpMethodHasBody(method) && params ? JSON.stringify(params) : undefined,
    }).then(res => {
        if (res.status === 401) {
            throw new Error('Unauthorized');
        }
        if (!res.ok) {
            throw new Error(`HTTP error: Status: ${res.status}`);
        }
        return res.json()
    });
}