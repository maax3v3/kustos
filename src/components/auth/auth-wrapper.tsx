import { useState, useEffect } from "react";
import { AuthMethod } from "@/lib/auth";
import { useNeedsAuth } from "@/hooks/use-needs-auth";
import { useAuthMethod } from "@/hooks/use-auth-method";
import { BasicAuthDialog } from "./basic-auth-dialog";
import { UnsupportedAuthDialog } from "./unsupported-auth-dialog";

interface AuthWrapperProps {
  children: React.ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const needsAuth = useNeedsAuth();
  const authMethod = useAuthMethod();
  const [showBasicAuthDialog, setShowBasicAuthDialog] = useState(false);
  const [showUnsupportedDialog, setShowUnsupportedDialog] = useState(false);
  const [unsupportedAuthType, setUnsupportedAuthType] = useState<string>("");

  useEffect(() => {
    if (!needsAuth) {
      // No auth needed, continue normally
      return;
    }

    if (authMethod === null) {
      // Still determining auth method, wait
      return;
    }

    if (authMethod === AuthMethod.Basic) {
      setShowBasicAuthDialog(true);
    } else if (authMethod === AuthMethod.Bearer) {
      setUnsupportedAuthType("Bearer");
      setShowUnsupportedDialog(true);
    } else if (authMethod === AuthMethod.Unknown) {
      setUnsupportedAuthType("Unknown");
      setShowUnsupportedDialog(true);
    }
  }, [needsAuth, authMethod]);

  // If we need auth and haven't resolved it yet, don't render children
  if (needsAuth && authMethod !== AuthMethod.None && (showBasicAuthDialog || showUnsupportedDialog)) {
    return (
      <>
        <BasicAuthDialog
          open={showBasicAuthDialog}
          onOpenChange={setShowBasicAuthDialog}
        />
        <UnsupportedAuthDialog
          open={showUnsupportedDialog}
          onOpenChange={setShowUnsupportedDialog}
          authMethod={unsupportedAuthType}
        />
      </>
    );
  }

  return <>{children}</>;
}
