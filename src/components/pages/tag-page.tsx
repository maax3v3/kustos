import { Link, useParams } from "react-router";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "../ui/breadcrumb";
import { ImageMetadata } from "../image-metadata";

export default function TagPage() {
    const params = useParams();
    const { repository, tag } = params;

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
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link to={`/repositories/${params.repository}/tags/${params.tag}`}>{params.tag}</Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>

        {/* Display comprehensive Docker image metadata */}
        {repository && tag && (
            <ImageMetadata repository={repository} tag={tag} />
        )}
    </div>
}
