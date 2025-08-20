import { makeRequest } from "./http"

export const registryNeedsAuth = (): Promise<boolean> => {
    return makeRequest('GET', '/v2/')
        .then(() => false)
        .catch(() => true);
}
