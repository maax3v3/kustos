import { NormalizedImageMetadata, Platform } from '@/types/docker-metadata';

/**
 * Utility functions for working with Docker metadata
 */

/**
 * Format bytes to human readable format
 */
export function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format platform string
 */
export function formatPlatform(platform: Platform): string {
    return `${platform.os}/${platform.architecture}${platform.variant ? `/${platform.variant}` : ''
        }`;
}

/**
 * Check if an image is multi-architecture
 */
export function isMultiArch(metadata: NormalizedImageMetadata[]): boolean {
    return metadata.length > 1;
}

/**
 * Get unique platforms from metadata array
 */
export function getUniquePlatforms(metadata: NormalizedImageMetadata[]): Platform[] {
    const seen = new Set<string>();
    return metadata
        .map(m => m.platform)
        .filter(platform => {
            const key = formatPlatform(platform);
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
}

/**
 * Find metadata for a specific platform
 */
export function findMetadataForPlatform(
    metadata: NormalizedImageMetadata[],
    targetPlatform: Partial<Platform>
): NormalizedImageMetadata | undefined {
    return metadata.find(m => {
        const platform = m.platform;
        return (!targetPlatform.os || platform.os === targetPlatform.os) &&
            (!targetPlatform.architecture || platform.architecture === targetPlatform.architecture) &&
            (!targetPlatform.variant || platform.variant === targetPlatform.variant);
    });
}

/**
 * Calculate total size across all platforms
 */
export function getTotalSize(metadata: NormalizedImageMetadata[]): number {
    return metadata.reduce((total, m) => total + m.size, 0);
}

/**
 * Get the most recent creation date across all platforms
 */
export function getMostRecentCreationDate(metadata: NormalizedImageMetadata[]): Date | null {
    const dates = metadata
        .map(m => m.config.created)
        .filter(Boolean)
        .map(date => new Date(date!));

    if (dates.length === 0) return null;

    return new Date(Math.max(...dates.map(d => d.getTime())));
}

/**
 * Extract all unique environment variables across platforms
 */
export function getAllEnvironmentVariables(metadata: NormalizedImageMetadata[]): string[] {
    const envSet = new Set<string>();

    metadata.forEach(m => {
        if (m.config.env) {
            m.config.env.forEach(env => envSet.add(env));
        }
    });

    return Array.from(envSet).sort();
}

/**
 * Extract all unique labels across platforms
 */
export function getAllLabels(metadata: NormalizedImageMetadata[]): Record<string, string[]> {
    const labelMap = new Map<string, Set<string>>();

    metadata.forEach(m => {
        if (m.config.labels) {
            Object.entries(m.config.labels).forEach(([key, value]) => {
                if (!labelMap.has(key)) {
                    labelMap.set(key, new Set());
                }
                labelMap.get(key)!.add(value);
            });
        }
    });

    const result: Record<string, string[]> = {};
    labelMap.forEach((values, key) => {
        result[key] = Array.from(values);
    });

    return result;
}

/**
 * Validate if metadata is complete
 */
export function validateMetadata(metadata: NormalizedImageMetadata): {
    isValid: boolean;
    issues: string[];
} {
    const issues: string[] = [];

    if (!metadata.digest) {
        issues.push('Missing digest');
    }

    if (!metadata.mediaType) {
        issues.push('Missing media type');
    }

    if (!metadata.platform.os) {
        issues.push('Missing platform OS');
    }

    if (!metadata.platform.architecture) {
        issues.push('Missing platform architecture');
    }

    if (metadata.layers.length === 0) {
        issues.push('No layers found');
    }

    if (metadata.size === 0 && metadata.layers.length > 0) {
        issues.push('Zero size but has layers');
    }

    return {
        isValid: issues.length === 0,
        issues
    };
}
