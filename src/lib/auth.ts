import { env } from "./env";

export enum AuthMethod {
    None,
    Basic,
    Bearer,
    Unknown,
}

export const registryAuthMethod = (): Promise<AuthMethod> => {
    const baseUrl = env('VITE_KUSTOS_REGISTRY_URL');

    return fetch(`${baseUrl}/v2/`, {
        method: 'GET',
    }).then(res => {
        if (res.status === 401) {
            const authHeader = res.headers.get('WWW-Authenticate');
            if (authHeader?.includes('Basic')) {
                return AuthMethod.Basic;
            }
            if (authHeader?.includes('Bearer')) {
                return AuthMethod.Bearer;
            }
            return AuthMethod.Unknown;
        }
        return AuthMethod.None;
    });
}

export const validateBasicAuth = async (username: string, password: string): Promise<boolean> => {
    const baseUrl = env('VITE_KUSTOS_REGISTRY_URL');
    const credentials = btoa(`${username}:${password}`);

    try {
        const response = await fetch(`${baseUrl}/v2/`, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${credentials}`,
            },
        });

        // Consider 2xx and 3xx as successful
        return response.status >= 200 && response.status < 400;
    } catch (error) {
        return false;
    }
}
