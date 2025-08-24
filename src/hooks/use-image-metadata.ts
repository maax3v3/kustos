import { useQuery } from 'react-query';
import { NormalizedImageMetadata, Platform } from '@/types/docker-metadata';
import { getImageMetadataQuery, getImageMetadataForPlatformQuery } from '@/lib/queries/get-image-metadata';

interface UseImageMetadataOptions {
    repository: string;
    tag: string;
    platform?: Partial<Platform>;
    enabled?: boolean;
}

interface UseImageMetadataResult {
    data: NormalizedImageMetadata[] | undefined;
    singlePlatformData: NormalizedImageMetadata | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export function useImageMetadata({
    repository,
    tag,
    platform,
    enabled = true
}: UseImageMetadataOptions): UseImageMetadataResult {
    // Create separate queries for different use cases to avoid type conflicts
    const allPlatformsQuery = useQuery(
        ['imageMetadata', repository, tag],
        () => getImageMetadataQuery(repository, tag),
        {
            enabled: enabled && Boolean(repository && tag) && !platform,
            staleTime: 5 * 60 * 1000, // 5 minutes
            cacheTime: 10 * 60 * 1000, // 10 minutes
        }
    );

    const specificPlatformQuery = useQuery(
        ['imageMetadata', repository, tag, 'platform', platform],
        () => getImageMetadataForPlatformQuery(repository, tag, platform!),
        {
            enabled: enabled && Boolean(repository && tag && platform),
            staleTime: 5 * 60 * 1000, // 5 minutes
            cacheTime: 10 * 60 * 1000, // 10 minutes
        }
    );

    // Use the appropriate query based on whether platform is specified
    const activeQuery = platform ? specificPlatformQuery : allPlatformsQuery;

    // Process the data to provide both formats
    let processedData: NormalizedImageMetadata[] | undefined;
    let singlePlatformData: NormalizedImageMetadata | null = null;

    if (platform && specificPlatformQuery.data) {
        // For platform-specific queries, data is a single metadata object or null
        const platformData = specificPlatformQuery.data;
        processedData = platformData ? [platformData] : [];
        singlePlatformData = platformData;
    } else if (!platform && allPlatformsQuery.data) {
        // For general queries, data is an array of metadata objects
        processedData = allPlatformsQuery.data;
        singlePlatformData = processedData.length > 0 ? processedData[0] : null;
    }

    return {
        data: processedData,
        singlePlatformData,
        loading: activeQuery.isLoading,
        error: activeQuery.error instanceof Error ? activeQuery.error.message : null,
        refetch: () => {
            activeQuery.refetch();
        }
    };
}
