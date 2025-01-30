import { Catalog } from "@/types/catalog";
import { makeRequest } from "./http";
import { Manifest } from "@/types/manifest";
import { TagsList } from "@/types/tags-list";

export const getCatalog = () => {
    return makeRequest<{}, Catalog>('GET', '/v2/catalog');
}

export const getTags = (repository: string) => {
    return makeRequest<{}, TagsList>('GET', `/v2/${repository}/tags/list`);
}

export const getManifest = (repository: string, tag: string) => {
    return makeRequest<{}, Manifest>('GET', `/v2/${repository}/manifests/${tag}`);
}
