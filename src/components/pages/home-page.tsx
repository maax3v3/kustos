import { TagsList } from "@/types/tags-list";
import { Link, useOutletContext } from "react-router";
import { Badge } from "../ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from "../ui/breadcrumb";
import { Separator } from "../ui/separator";

export default function HomePage() {
    const {
        tagsLists
    } = useOutletContext() as { tagsLists: TagsList[] };

    return <div className="flex flex-col gap-4 h-full">
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link to="/">Repositories</Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
        <section className="grow flex flex-col justify-center items-center">
            <div className="flex flex-col gap-6 w-1/2 max-w-96">
                <h1>{tagsLists.length} repositories</h1>
                <div className="flex flex-col gap-1">
                    {
                        tagsLists.map((tagsList, index) => (
                            <div key={tagsList.name} className="flex flex-col gap-1">
                                <Link className="flex justify-between items-center" to={`/repositories/${tagsList.name}`}>
                                    <span>{tagsList.name}</span>
                                    <Badge variant="outline">{tagsList.tags.length} tags</Badge>
                                </Link>
                                {
                                    index !== tagsLists.length - 1 && (
                                        <>
                                            <Separator/>
                                        </>
                                    )
                                }
                            </div>
                        ))
                    }
                </div>
            </div>
        </section>
    </div>
}
