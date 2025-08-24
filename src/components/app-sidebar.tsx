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
    SidebarSeparator,
} from "@/components/ui/sidebar";
import { useAuthMethod } from "@/hooks/use-auth-method";
import { getAllTags } from "@/lib/queries/get-all-tags";
import { getOrgName, getRegistryHost } from "@/lib/registry-info";
import { TagsList } from "@/types/tags-list";
import { BuildingIcon, ChevronRight, HomeIcon, LinkIcon, ListIcon, LockIcon, LockOpenIcon, TagIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { useQuery } from "react-query";
import { ThemeToggle } from "./theme-toggle";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Link } from "react-router";
import { AuthMethod } from "@/lib/auth";

export default function AppSidebar() {
    const [tagsLists, setTagsLists] = useState<TagsList[]>([]);
    const authMethod = useAuthMethod();

    useQuery({
        queryKey: ['tags-lists'],
        queryFn: () => getAllTags(),
        onSuccess(data) {
            setTagsLists(data);
        },
        staleTime: 1 * 60 * 1000,
    })

    const registryHost = useMemo(() => getRegistryHost(), []);
    const orgName = useMemo(() => getOrgName(), []);

    return (
        <Sidebar>
            <SidebarHeader>
                <SidebarGroup>
                    <SidebarGroupContent className="flex items-center flex-col">
                        <h1>Kustos</h1>
                        <h2>Docker Registry UI</h2>
                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarGroupLabel>Registry</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem className="flex px-2 gap-2 py-1">
                                <BuildingIcon className="h-4 w-4" />
                                <span>{orgName}</span>
                            </SidebarMenuItem>
                        </SidebarMenu>
                        <SidebarMenu>
                            <SidebarMenuItem className="flex px-2 gap-2 py-1">
                                <LinkIcon className="h-4 w-4" />
                                <span>{registryHost}</span>
                            </SidebarMenuItem>
                        </SidebarMenu>
                        <SidebarMenu>
                            <SidebarMenuItem className="flex px-2 gap-2 py-1">
                                {
                                    authMethod === AuthMethod.None && (
                                        <>
                                            <LockOpenIcon className="h-4 w-4" />
                                            <span>Auth disabled</span>
                                        </>
                                    )
                                }
                                {
                                    authMethod === AuthMethod.Basic && (
                                        <>
                                            <LockIcon className="h-4 w-4" />
                                            <span>Basic auth</span>
                                        </>
                                    )
                                }
                                {
                                    authMethod === AuthMethod.Bearer && (
                                        <>
                                            <LockIcon className="h-4 w-4" />
                                            <span>Bearer auth</span>
                                        </>
                                    )
                                }
                                {
                                    authMethod === AuthMethod.Unknown && (
                                        <>
                                            <LockIcon className="h-4 w-4" />
                                            <span>Unknown auth method</span>
                                        </>
                                    )
                                }
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarHeader>
            <SidebarSeparator />
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem className="flex">
                                <SidebarMenuButton asChild>
                                    <Link to="/">
                                        <HomeIcon></HomeIcon>
                                        <span>Home</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
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
                                                <SidebarMenuSubItem>
                                                    <SidebarMenuSubButton asChild>
                                                        <Link to={`/repositories/${tagsList.name}`}>
                                                            <ListIcon></ListIcon>
                                                            <span>Index</span>
                                                        </Link>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                                {tagsList.tags.map(tag => (
                                                    <SidebarMenuSubItem key={tag}>
                                                        <SidebarMenuSubButton asChild>
                                                            <Link to={`/repositories/${tagsList.name}/tags/${tag}`}>
                                                                <TagIcon></TagIcon>
                                                                <span>{tag}</span>
                                                            </Link>
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
            <SidebarSeparator />
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem className="flex justify-between">
                        <DropdownMenu>
                            <DropdownMenuTrigger className="flex items-center gap-2 text-sm">
                                <LinkIcon className="h-4 w-4" />
                                <span>Links</span>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuLabel>Related</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    <a href="https://github.com/maaxleq/kustos" target="_blank" rel="noopener noreferrer" className="w-full h-full">
                                        Github
                                    </a>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <ThemeToggle />
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
