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
