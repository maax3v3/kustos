import { Manifest } from "@/types/manifest";
import { getManifest } from "../api";

export const getManifestOfTag = async (repository: string, tag: string): Promise<Manifest> => {
    return getManifest(repository, tag);
}
