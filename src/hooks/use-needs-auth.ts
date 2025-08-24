import { AuthMethod } from "@/lib/auth";
import { useAuthMethod } from "./use-auth-method";

export function useNeedsAuth(): boolean {
    const authMethod = useAuthMethod();

    // If we haven't determined the auth method yet, assume we need auth
    if (authMethod === null) {
        return true;
    }

    // Only return false if auth method is explicitly None
    return authMethod !== AuthMethod.None;
}
