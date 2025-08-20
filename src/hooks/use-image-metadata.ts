import { useState, useEffect } from 'react';
import { getImageMetadata, getImageMetadataForPlatform } from '@/lib/api';
import { NormalizedImageMetadata, Platform } from '@/types/docker-metadata';

interface UseImageMetadataOptions {
  repository: string;
  tag: string;
  platform?: Partial<Platform>;
  enabled?: boolean;
}

interface UseImageMetadataResult {
  data: NormalizedImageMetadata[] | null;
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
  const [data, setData] = useState<NormalizedImageMetadata[] | null>(null);
  const [singlePlatformData, setSinglePlatformData] = useState<NormalizedImageMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!enabled || !repository || !tag) return;

    setLoading(true);
    setError(null);

    try {
      if (platform) {
        // Fetch for specific platform
        const result = await getImageMetadataForPlatform(repository, tag, platform);
        setSinglePlatformData(result);
        setData(result ? [result] : []);
      } else {
        // Fetch all platforms
        const result = await getImageMetadata(repository, tag);
        setData(result);
        setSinglePlatformData(result.length > 0 ? result[0] : null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch image metadata');
      setData(null);
      setSinglePlatformData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [repository, tag, platform, enabled]);

  return {
    data,
    singlePlatformData,
    loading,
    error,
    refetch: fetchData
  };
}
