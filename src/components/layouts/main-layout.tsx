import { Outlet } from "react-router";
import { SidebarProvider } from "../ui/sidebar";
import AppSidebar from "../app-sidebar";

export default function MainLayout() {
    return (

        <SidebarProvider>
            <main className="flex w-full h-full">
                <AppSidebar />
                <Outlet></Outlet>
            </main>
        </SidebarProvider>

    )
}