
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { useAuth } from "@/contexts/AuthContext";

const LanguageWelcomeDialog = () => {
    const { t, i18n } = useTranslation();
    const { isAuthenticated, isLoading } = useAuth();
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (isLoading || !isAuthenticated) return;

        // Check if language has been set in localStorage
        const savedLanguage = localStorage.getItem("app-language");

        // If no language is saved, open the dialog
        if (!savedLanguage) {
            setOpen(true);
        }
    }, [isAuthenticated, isLoading]);

    const handleLanguageSelect = (language: string) => {
        i18n.changeLanguage(language);
        localStorage.setItem("app-language", language);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md [&>button]:hidden">
                <DialogHeader>
                    <DialogTitle className="text-center text-2xl font-serif">
                        {t("welcome_title")}
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        {t("welcome_subtitle")}
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-4">
                    <Button
                        className="w-full h-16 text-lg bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700"
                        onClick={() => handleLanguageSelect('en')}
                    >
                        English
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full h-16 text-lg border-orange-500 text-orange-600 hover:bg-orange-50"
                        onClick={() => handleLanguageSelect('hi')}
                    >
                        हिंदी (Hindi)
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default LanguageWelcomeDialog;
