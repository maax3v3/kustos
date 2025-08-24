import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "react-query";
import * as z from "zod";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { validateBasicAuth } from "@/lib/auth";
import { useAuthStore } from "@/stores/auth-store";

const formSchema = z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof formSchema>;

interface BasicAuthDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function BasicAuthDialog({ open, onOpenChange }: BasicAuthDialogProps) {
    const [error, setError] = useState<string | null>(null);
    const { setCredentials } = useAuthStore();

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    });

    const validateMutation = useMutation({
        mutationFn: async (data: FormData) => {
            const isValid = await validateBasicAuth(data.username, data.password);
            if (!isValid) {
                throw new Error("Invalid credentials");
            }
            return data;
        },
        onSuccess: (data) => {
            setCredentials(data);
            setError(null);
            onOpenChange(false);
            form.reset();
        },
        onError: () => {
            setError("Invalid username or password. Please try again.");
        },
    });

    const onSubmit = (data: FormData) => {
        setError(null);
        validateMutation.mutate(data);
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="sm:max-w-[425px]">
                <AlertDialogHeader>
                    <AlertDialogTitle>Authentication Required</AlertDialogTitle>
                    <AlertDialogDescription>
                        Please enter your credentials to access the registry.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter your username"
                                            {...field}
                                            disabled={validateMutation.isLoading}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            placeholder="Enter your password"
                                            {...field}
                                            disabled={validateMutation.isLoading}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={validateMutation.isLoading}
                        >
                            {validateMutation.isLoading ? "Validating..." : "Validate"}
                        </Button>
                    </form>
                </Form>
            </AlertDialogContent>
        </AlertDialog>
    );
}
