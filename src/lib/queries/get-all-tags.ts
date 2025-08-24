import { TagsList } from "@/types/tags-list";
import { getCatalog, getTags } from "../api";

export const getAllTags = async (): Promise<TagsList[]> => {
    const catalog = await getCatalog();
    const tagsListsPromises = catalog.repositories.map(repository => getTags(repository));
    const tagsLists = await Promise.all(tagsListsPromises);
    return tagsLists;
}
