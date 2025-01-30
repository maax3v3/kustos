import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { getAllTags } from "@/lib/queries/get-all-tags";
import { TagsList } from "@/types/tags-list";
import { useState } from "react";
import { useQuery } from "react-query";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { ChevronRight } from "lucide-react";

export default function AppSidebar() {
    const [tagsLists, setTagsLists] = useState<TagsList[]>([]);

    useQuery({
        queryKey: ['tags-lists'],
        queryFn: () => getAllTags(),
        onSuccess(data) {
            setTagsLists(data);
        },
    })

    return (
        <Sidebar>
            <SidebarHeader />
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Catalog</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {tagsLists.map((tagsList) => (
                                <Collapsible
                                    key={tagsList.name}
                                    asChild
                                    className="group/collapsible"
                                >
                                    <SidebarMenuItem key={tagsList.name}>
                                        <CollapsibleTrigger asChild>
                                            <SidebarMenuButton>
                                                <span>{tagsList.name}</span>
                                                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                            </SidebarMenuButton>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <SidebarMenuSub>
                                                {tagsList.tags.map(tag => (
                                                    <SidebarMenuSubItem key={tag}>
                                                        <SidebarMenuSubButton>
                                                            <span>{tag}</span>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                ))}
                                            </SidebarMenuSub>
                                        </CollapsibleContent>
                                    </SidebarMenuItem>
                                </Collapsible>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter />
        </Sidebar>
    )
}
