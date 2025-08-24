import { Catalog } from "@/types/catalog";
import { makeRequest, makeRequestRaw } from "./http";
import { Manifest } from "@/types/manifest";
import { TagsList } from "@/types/tags-list";
import { fetchImageMetadata, fetchImageMetadataForPlatform } from "./docker-metadata";
import { NormalizedImageMetadata, Platform, AnyManifest, DockerConfig, MEDIA_TYPES } from "@/types/docker-metadata";

export const getCatalog = () => {
    return makeRequest<{}, Catalog>('GET', '/v2/_catalog');
}

export const getTags = (repository: string) => {
    return makeRequest<{}, TagsList>('GET', `/v2/${repository}/tags/list`);
}

export const getManifest = (repository: string, tag: string) => {
    return makeRequest<{}, Manifest>('GET', `/v2/${repository}/manifests/${tag}`);
}

export const getImageMetadata = async (repository: string, tag: string): Promise<NormalizedImageMetadata[]> => {
    return fetchImageMetadata(repository, tag);
}

export const getLayerSize = async (repo: string, layerDigest: string): Promise<number> => {
    return makeRequestRaw('HEAD', `/v2/${repo}/blobs/${layerDigest}`)
        .then(res => parseInt(res.headers.get('Content-Length') || '0'))
        .catch(() => 0);
}

export const getImageMetadataForPlatform = async (
    repository: string, 
    tag: string, 
    platform: Partial<Platform>
): Promise<NormalizedImageMetadata | null> => {
    return fetchImageMetadataForPlatform(repository, tag, platform);
}

// Accept header for all supported manifest types
const MANIFEST_ACCEPT_HEADER = [
    MEDIA_TYPES.MANIFEST_LIST_V2,
    MEDIA_TYPES.MANIFEST_V2,
    MEDIA_TYPES.OCI_INDEX,
    MEDIA_TYPES.OCI_MANIFEST,
    MEDIA_TYPES.MANIFEST_V1
].join(',');

/**
 * Fetch manifest with digest information
 */
export const getManifestWithDigest = async (repo: string, reference: string): Promise<{
    manifest: AnyManifest;
    digest: string;
    mediaType: string;
}> => {
    const response = await makeRequestRaw('GET', `/v2/${repo}/manifests/${reference}`, undefined, {
        'Accept': MANIFEST_ACCEPT_HEADER,
        'Content-Type': 'application/json',
    });
    const manifestText = await response.text();
    const manifest = JSON.parse(manifestText) as AnyManifest;
    
    // Try multiple header names for digest (different registries use different headers)
    let digest = response.headers.get('Docker-Content-Digest') || 
                 response.headers.get('docker-content-digest') ||
                 response.headers.get('Content-Digest') ||
                 response.headers.get('Digest') ||
                 '';
    
    // If no digest in headers, calculate it ourselves using SHA256
    if (!digest && typeof crypto !== 'undefined' && crypto.subtle) {
        try {
            const encoder = new TextEncoder();
            const data = encoder.encode(manifestText);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            digest = `sha256:${hashHex}`;
        } catch (error) {
            console.warn('Failed to calculate manifest digest:', error);
            // Fallback to a truncated version of the reference or config digest
            digest = reference.startsWith('sha256:') ? reference : `sha256:${reference}`;
        }
    }
    
    const mediaType = response.headers.get('Content-Type') || '';

    return { manifest, digest, mediaType };
}

/**
 * Fetch config blob for schema v2/OCI manifests
 */
export const getConfigBlob = async (repo: string, configDigest: string): Promise<DockerConfig> => {
    const response = await makeRequestRaw('GET', `/v2/${repo}/blobs/${configDigest}`, undefined, {
        'Accept': MANIFEST_ACCEPT_HEADER,
        'Content-Type': 'application/json',
    });
    return response.json();
}
