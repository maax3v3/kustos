import { AuthMethod, registryAuthMethod } from "@/lib/auth";
import { useState } from "react";
import { useQuery } from "react-query";

export function useAuthMethod() {
    const [authMethod, setAuthMethod] = useState<AuthMethod | null>(null);
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
