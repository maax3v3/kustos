import { registryAuthMethod } from "@/lib/auth";
import { useAuthStore } from "@/stores/auth-method-store";
import { useQuery } from "react-query";

export function useAuthMethod() {
    const { authMethod, setAuthMethod } = useAuthStore();
    useQuery({
        queryKey: ['authMethod'],
        queryFn: () => registryAuthMethod(),
        onSuccess(data) {
            setAuthMethod(data);
        },
        staleTime: 1 * 60 * 1000,
    });

    return authMethod;
}
