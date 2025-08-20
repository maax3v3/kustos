// Comprehensive Docker manifest and metadata types

export interface Platform {
  os: string;
  architecture: string;
  variant?: string;
}

export interface Layer {
  digest: string;
  size: number;
  mediaType: string;
}

export interface ConfigBlob {
  digest: string;
  created?: string;
  env?: string[];
  cmd?: string[];
  labels?: Record<string, string>;
  architecture?: string;
  os?: string;
}

export interface NormalizedImageMetadata {
  digest: string;
  mediaType: string;
  tag: string;
  platform: Platform;
  layers: Layer[];
  size: number;
  config: ConfigBlob;
}

// Manifest List / OCI Index types
export interface ManifestListEntry {
  digest: string;
  mediaType: string;
  platform: Platform;
  size?: number;
}

export interface ManifestList {
  schemaVersion: number;
  mediaType: string;
  manifests: ManifestListEntry[];
}

// Schema v2 / OCI Manifest types
export interface ManifestV2Config {
  digest: string;
  mediaType: string;
  size: number;
}

export interface ManifestV2Layer {
  digest: string;
  mediaType: string;
  size: number;
  urls?: string[];
}

export interface ManifestV2 {
  schemaVersion: number;
  mediaType: string;
  config: ManifestV2Config;
  layers: ManifestV2Layer[];
}

// Config blob structure
export interface DockerConfig {
  architecture: string;
  os: string;
  created?: string;
  config?: {
    Env?: string[];
    Cmd?: string[];
    Labels?: Record<string, string>;
  };
  history?: Array<{
    created?: string;
    created_by?: string;
    empty_layer?: boolean;
  }>;
}

// Legacy Schema v1 types (existing)
export interface ManifestV1 {
  schemaVersion: number;
  name: string;
  tag: string;
  architecture: string;
  fsLayers: Array<{
    blobSum: string;
  }>;
  history: Array<{
    v1Compatibility: string;
  }>;
  signatures?: Array<{
    header: {
      jwk: {
        crv: string;
        kid: string;
        kty: string;
        x: string;
        y: string;
      };
      alg: string;
    };
    signature: string;
    protected: string;
  }>;
}

// Union type for all manifest types
export type AnyManifest = ManifestList | ManifestV2 | ManifestV1;

// Media type constants
export const MEDIA_TYPES = {
  MANIFEST_LIST_V2: 'application/vnd.docker.distribution.manifest.list.v2+json',
  MANIFEST_V2: 'application/vnd.docker.distribution.manifest.v2+json',
  MANIFEST_V1: 'application/vnd.docker.distribution.manifest.v1+json',
  OCI_INDEX: 'application/vnd.oci.image.index.v1+json',
  OCI_MANIFEST: 'application/vnd.oci.image.manifest.v1+json',
  CONFIG_V1: 'application/vnd.docker.container.image.v1+json',
  OCI_CONFIG: 'application/vnd.oci.image.config.v1+json',
} as const;
