import { NormalizedImageMetadata, Platform } from "@/types/docker-metadata";
import { getImageMetadata, getImageMetadataForPlatform } from "../api";

export const getImageMetadataQuery = async (repository: string, tag: string): Promise<NormalizedImageMetadata[]> => {
    return getImageMetadata(repository, tag);
}

export const getImageMetadataForPlatformQuery = async (
    repository: string,
    tag: string,
    platform: Partial<Platform>
): Promise<NormalizedImageMetadata | null> => {
    return getImageMetadataForPlatform(repository, tag, platform);
}
