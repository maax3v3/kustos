import { Outlet } from "react-router";
import { SidebarProvider } from "../ui/sidebar";
import AppSidebar from "../app-sidebar";

export default function MainLayout() {
    return (

        <SidebarProvider className="flex w-full h-full">
            <AppSidebar />
            <main className="grow">
                <Outlet></Outlet>
            </main>
        </SidebarProvider>

    )
}