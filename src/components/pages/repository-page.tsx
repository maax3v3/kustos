import { getManifestOfTag } from "@/lib/queries/get-manifest-of-tag";
import { Manifest } from "@/types/manifest";
import { TagsList } from "@/types/tags-list";
import { useMemo } from "react";
import { useQueries } from "react-query";
import { Link, useOutletContext, useParams } from "react-router";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "../ui/breadcrumb";
import { Separator } from "../ui/separator";

export default function RepositoryPage() {
    const params = useParams();

    const {
        tagsLists
    } = useOutletContext() as { tagsLists: TagsList[] };

    const tagsList = useMemo(() => tagsLists.find(tagsList => tagsList.name === params.repository), [tagsLists, params]);

    const manifestsQueries = useQueries((tagsList?.tags ?? []).map(tag => {
        return {
            queryKey: ['manifest', tagsList?.name, tag],
            queryFn: () => tagsList && getManifestOfTag(tagsList.name, tag),
            staleTime: 1 * 60 * 1000,
        };
    }));

    const manifestsOfTags = useMemo(() => {
        return manifestsQueries.reduce((acc, manifestQuery) => {
            if (manifestQuery.data) {
                acc[manifestQuery.data.name] = manifestQuery.data;
            }
            return acc;
        }, {} as Record<string, Manifest>);
    }, [manifestsQueries]);

    return <div className="flex flex-col gap-4 h-full">
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link to="/">Repositories</Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link to={`/repositories/${params.repository}`}>{params.repository}</Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
        <section className="grow flex flex-col justify-center items-center">
            <div className="flex flex-col gap-6 w-1/2 max-w-96">
                <h1>{ tagsList?.name } - { tagsList?.tags.length } tags</h1>
                <div className="flex flex-col gap-1">
                    {
                        tagsList?.tags.map((tag, index) => (
                            <div key={tag} className="flex flex-col gap-1">
                                <Link className="flex justify-between items-center" to={`/repositories/${tagsList.name}/tags/${tag}`}>
                                    <span>{ tag }</span>
                                </Link>

                                {
                                    index < tagsList.tags.length - 1 && <Separator></Separator>
                                }
                            </div>
                        ))
                    }
                </div>
            </div>
        </section>
        </div>
}
