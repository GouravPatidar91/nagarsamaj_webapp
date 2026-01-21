import {
    SignedIn,
    SignedOut,
    SignInButton,
    SignUpButton,
    UserButton,
} from "@clerk/clerk-react";

export const ClerkAuth = () => {
    return (
        <div className="flex items-center gap-4 p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
            <span className="text-sm font-medium">Clerk Auth:</span>
            <SignedOut>
                <div className="flex gap-2">
                    <SignInButton />
                    <SignUpButton />
                </div>
            </SignedOut>
            <SignedIn>
                <UserButton />
            </SignedIn>
        </div>
    );
};
