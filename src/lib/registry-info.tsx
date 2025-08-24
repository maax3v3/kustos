import { env } from "./env";

export const getRegistryHost = () => {
    const registryUrl = env('VITE_KUSTOS_REGISTRY_URL');
    if (!registryUrl) {
        return undefined;
    }

    const url = URL.parse(registryUrl);
    if (!url) {
        return undefined;
    }

    return url.host;
}

export const getOrgName = () => {
    return env('VITE_KUSTOS_ORG_NAME');
}
