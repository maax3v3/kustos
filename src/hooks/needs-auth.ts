import { registryNeedsAuth } from "@/lib/auth";
import { useState } from "react";
import { useQuery } from "react-query";

export function useNeedsAuth() {
    const [needsAuth, setNeedsAuth] = useState<boolean | null>(null);
    useQuery({
        queryKey: ['needsAuth'],
        queryFn: () => registryNeedsAuth(),
        onSuccess(data) {
            setNeedsAuth(data);
        },
        staleTime: 1 * 60 * 1000,
    });

    return needsAuth;
}
