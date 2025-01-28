import { makeRequest } from "./api"

export const registryNeedsAuth = (): Promise<boolean> => {
    return makeRequest('GET', '/v2')
        .then(() => false)
        .catch(err => {
            if (err === 'Unauthorized') {
                return true;
            }
            throw err;
        });
}
