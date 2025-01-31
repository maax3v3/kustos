import { Outlet } from "react-router";
import { SidebarProvider } from "../ui/sidebar";
import AppSidebar from "../app-sidebar";
import { useQuery } from "react-query";
import { getAllTags } from "@/lib/queries/get-all-tags";

export default function MainLayout() {
    const { data: tagsLists } = useQuery({
        queryKey: ['tags-lists'],
        queryFn: () => getAllTags(),
        staleTime: 1 * 60 * 1000,
    });

    return (

        <SidebarProvider className="flex w-full h-full">
            <AppSidebar />
            <main>
                <Outlet context={{ tagsLists: tagsLists ?? [] }}></Outlet>
            </main>
        </SidebarProvider>

    )
}