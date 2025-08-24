import { getLayerSize } from "./api";
import { env } from "./env";
import {
  AnyManifest,
  ManifestList,
  ManifestV2,
  ManifestV1,
  DockerConfig,
  NormalizedImageMetadata,
  MEDIA_TYPES,
  Platform,
  Layer,
  ConfigBlob
} from "@/types/docker-metadata";

// Accept header for all supported manifest types
const MANIFEST_ACCEPT_HEADER = [
  MEDIA_TYPES.MANIFEST_LIST_V2,
  MEDIA_TYPES.MANIFEST_V2,
  MEDIA_TYPES.OCI_INDEX,
  MEDIA_TYPES.OCI_MANIFEST,
  MEDIA_TYPES.MANIFEST_V1
].join(',');

/**
 * Make a request to the Docker registry with proper headers
 */
async function makeRegistryRequest(path: string, acceptHeader?: string): Promise<Response> {
  const baseUrl = env('VITE_KUSTOS_REGISTRY_URL');
  
  const response = await fetch(`${baseUrl}${path}`, {
    method: 'GET',
    headers: {
      'Accept': acceptHeader || MANIFEST_ACCEPT_HEADER,
      'Content-Type': 'application/json',
    },
  });

  if (response.status === 401) {
    throw new Error('Unauthorized');
  }
  if (!response.ok) {
    throw new Error(`HTTP error: Status: ${response.status}`);
  }

  return response;
}

/**
 * Fetch manifest with digest information
 */
async function fetchManifestWithDigest(repo: string, reference: string): Promise<{
  manifest: AnyManifest;
  digest: string;
  mediaType: string;
}> {
  const response = await makeRegistryRequest(`/v2/${repo}/manifests/${reference}`);
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
async function fetchConfigBlob(repo: string, configDigest: string): Promise<DockerConfig> {
  const response = await makeRegistryRequest(`/v2/${repo}/blobs/${configDigest}`);
  return response.json();
}

/**
 * Check if manifest is a manifest list or OCI index
 */
function isManifestList(manifest: AnyManifest, mediaType: string): manifest is ManifestList {
  return mediaType === MEDIA_TYPES.MANIFEST_LIST_V2 || 
         mediaType === MEDIA_TYPES.OCI_INDEX ||
         ('manifests' in manifest && Array.isArray(manifest.manifests));
}

/**
 * Check if manifest is schema v2 or OCI manifest
 */
function isManifestV2(manifest: AnyManifest, mediaType: string): manifest is ManifestV2 {
  return mediaType === MEDIA_TYPES.MANIFEST_V2 || 
         mediaType === MEDIA_TYPES.OCI_MANIFEST ||
         ('config' in manifest && 'layers' in manifest);
}

/**
 * Check if manifest is legacy schema v1
 */
function isManifestV1(manifest: AnyManifest, mediaType: string): manifest is ManifestV1 {
  return mediaType === MEDIA_TYPES.MANIFEST_V1 ||
         ('fsLayers' in manifest && 'history' in manifest);
}

/**
 * Process schema v2/OCI manifest
 */
async function processManifestV2(
  repo: string,
  tag: string,
  manifest: ManifestV2,
  digest: string,
  mediaType: string
): Promise<NormalizedImageMetadata> {
  // Fetch config blob
  const configData = await fetchConfigBlob(repo, manifest.config.digest);

  // Process layers
  const layers: Layer[] = manifest.layers.map(layer => ({
    digest: layer.digest,
    size: layer.size,
    mediaType: layer.mediaType
  }));

  // Calculate total size
  const size = layers.reduce((total, layer) => total + layer.size, 0);

  // Extract platform info
  const platform: Platform = {
    os: configData.os,
    architecture: configData.architecture
  };

  // Extract config info
  const config: ConfigBlob = {
    digest: manifest.config.digest,
    size: manifest.config.size,
    mediaType: manifest.config.mediaType,
    created: configData.created,
    env: configData.config?.Env,
    cmd: configData.config?.Cmd,
    labels: configData.config?.Labels,
    architecture: configData.architecture,
    os: configData.os,
    workingDir: configData.config?.WorkingDir,
    user: configData.config?.User,
    exposedPorts: configData.config?.ExposedPorts,
    volumes: configData.config?.Volumes,
    entrypoint: configData.config?.Entrypoint
  };

  return {
    digest,
    mediaType,
    tag,
    platform,
    layers,
    size,
    config,
    history: configData.history
  };
}

/**
 * Process legacy schema v1 manifest
 */
async function processManifestV1(
  repo: string,
  tag: string,
  manifest: ManifestV1,
  digest: string,
  mediaType: string
): Promise<NormalizedImageMetadata> {
  // Process layers - for v1, we need to fetch sizes separately
  const layers: Layer[] = [];
  
  for (const fsLayer of manifest.fsLayers) {
    const size = await getLayerSize(repo, fsLayer.blobSum);
    layers.push({
      digest: fsLayer.blobSum,
      size,
      mediaType: 'application/vnd.docker.image.rootfs.diff.tar.gzip'
    });
  }

  // Calculate total size
  const size = layers.reduce((total, layer) => total + layer.size, 0);

  // Extract platform info
  const platform: Platform = {
    os: 'linux', // Default for v1
    architecture: manifest.architecture || 'amd64'
  };

  // Try to extract additional info from v1Compatibility
  let config: ConfigBlob = {
    digest: '', // v1 doesn't have config digest
    architecture: manifest.architecture
  };

  if (manifest.history && manifest.history.length > 0) {
    try {
      const v1Compat = JSON.parse(manifest.history[0].v1Compatibility);
      config = {
        ...config,
        created: v1Compat.created,
        env: v1Compat.config?.Env,
        cmd: v1Compat.config?.Cmd,
        labels: v1Compat.config?.Labels,
        os: v1Compat.os
      };
      
      if (v1Compat.os) {
        platform.os = v1Compat.os;
      }
    } catch (e) {
      // Ignore JSON parsing errors
    }
  }

  return {
    digest,
    mediaType,
    tag,
    platform,
    layers,
    size,
    config,
    history: manifest.history?.map(entry => {
      try {
        const v1Compat = JSON.parse(entry.v1Compatibility);
        return {
          created: v1Compat.created,
          created_by: v1Compat.container_config?.Cmd?.join(' '),
          empty_layer: v1Compat.throwaway || false
        };
      } catch (e) {
        return {
          created: undefined,
          created_by: undefined,
          empty_layer: false
        };
      }
    })
  };
}

/**
 * Fetch complete metadata for a Docker image tag
 */
export async function fetchImageMetadata(repo: string, tag: string): Promise<NormalizedImageMetadata[]> {
  const { manifest, digest, mediaType } = await fetchManifestWithDigest(repo, tag);

  // Handle manifest list (multi-arch)
  if (isManifestList(manifest, mediaType)) {
    const results: NormalizedImageMetadata[] = [];
    
    for (const entry of manifest.manifests) {
      try {
        const { manifest: subManifest, digest: subDigest, mediaType: subMediaType } = 
          await fetchManifestWithDigest(repo, entry.digest);
        
        let metadata: NormalizedImageMetadata;
        
        if (isManifestV2(subManifest, subMediaType)) {
          metadata = await processManifestV2(repo, tag, subManifest, subDigest, subMediaType);
        } else if (isManifestV1(subManifest, subMediaType)) {
          metadata = await processManifestV1(repo, tag, subManifest, subDigest, subMediaType);
        } else {
          continue; // Skip unsupported manifest types
        }
        
        // Override platform info from manifest list
        metadata.platform = entry.platform;
        results.push(metadata);
      } catch (error) {
        console.warn(`Failed to fetch sub-manifest ${entry.digest}:`, error);
        // Continue with other manifests
      }
    }
    
    return results;
  }

  // Handle single manifest
  let metadata: NormalizedImageMetadata;
  
  if (isManifestV2(manifest, mediaType)) {
    metadata = await processManifestV2(repo, tag, manifest, digest, mediaType);
  } else if (isManifestV1(manifest, mediaType)) {
    metadata = await processManifestV1(repo, tag, manifest, digest, mediaType);
  } else {
    throw new Error(`Unsupported manifest type: ${mediaType}`);
  }

  return [metadata];
}

/**
 * Fetch metadata for a specific platform (useful for multi-arch images)
 */
export async function fetchImageMetadataForPlatform(
  repo: string, 
  tag: string, 
  targetPlatform: Partial<Platform>
): Promise<NormalizedImageMetadata | null> {
  const allMetadata = await fetchImageMetadata(repo, tag);
  
  // Find matching platform
  return allMetadata.find(metadata => {
    const platform = metadata.platform;
    return (!targetPlatform.os || platform.os === targetPlatform.os) &&
           (!targetPlatform.architecture || platform.architecture === targetPlatform.architecture) &&
           (!targetPlatform.variant || platform.variant === targetPlatform.variant);
  }) || null;
}
