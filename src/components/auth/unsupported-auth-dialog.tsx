import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UnsupportedAuthDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    authMethod: string;
}

export function UnsupportedAuthDialog({
    open,
    onOpenChange,
    authMethod
}: UnsupportedAuthDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Authentication Not Supported</AlertDialogTitle>
                    <AlertDialogDescription>
                        The registry requires {authMethod} authentication, which is not supported yet.
                        Please contact your administrator or try a different registry.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={() => onOpenChange(false)}>
                        OK
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
