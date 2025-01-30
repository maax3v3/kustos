import { QueryClient, QueryClientProvider } from "react-query";
import { ThemeProvider } from "./components/providers/theme-provider";

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
                {children}
            </ThemeProvider>
        </QueryClientProvider>
    )
}