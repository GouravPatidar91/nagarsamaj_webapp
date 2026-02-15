import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const LanguageWelcomeDialog = () => {
    const { t, i18n } = useTranslation();
    const { isAuthenticated, isLoading } = useAuth();
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (isLoading || !isAuthenticated) return;

        // Check if language has been explicitly set by user
        const preferenceSet = localStorage.getItem("language-preference-set");

        // If no preference is saved, open the dialog
        if (!preferenceSet) {
            setOpen(true);
        }
    }, [isAuthenticated, isLoading]);

    const handleLanguageSelect = (language: string) => {
        i18n.changeLanguage(language);
        localStorage.setItem("app-language", language);
        localStorage.setItem("language-preference-set", "true");
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-xl p-0 overflow-hidden border-none bg-transparent shadow-none [&>button]:hidden">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative bg-background/80 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden shadow-2xl"
                >
                    {/* Decorative background gradients */}
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-orange-400/20 to-rose-500/20 blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 right-0 w-full h-32 bg-gradient-to-tl from-blue-400/20 to-purple-500/20 blur-3xl pointer-events-none" />

                    <div className="relative p-8 md:p-12 text-center space-y-8">
                        <div className="space-y-4">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <h2 className="text-3xl md:text-4xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-rose-600">
                                    Welcome to Nagar Brahmin Samaj
                                </h2>
                                <h3 className="text-xl md:text-2xl font-serif text-muted-foreground mt-2">
                                    नगर ब्राह्मण समाज में आपका स्वागत है
                                </h3>
                            </motion.div>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="text-muted-foreground"
                            >
                                Please select your preferred language
                                <br />
                                कृपया अपनी पसंदीदा भाषा चुनें
                            </motion.p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <motion.button
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleLanguageSelect('en')}
                                className="group relative p-6 rounded-2xl border border-border/50 bg-card/50 hover:bg-card hover:border-primary/50 transition-all duration-300 shadow-md hover:shadow-xl"
                            >
                                <div className="flex flex-col items-center gap-3">
                                    <span className="text-4xl">🇬🇧</span>
                                    <div className="space-y-1">
                                        <h3 className="text-lg font-semibold">English</h3>
                                        <p className="text-xs text-muted-foreground">Continue in English</p>
                                    </div>
                                    {i18n.language === 'en' && (
                                        <div className="absolute top-4 right-4 text-primary">
                                            <Check className="w-5 h-5" />
                                        </div>
                                    )}
                                </div>
                                <div className="absolute inset-0 border-2 border-primary/0 rounded-2xl group-hover:border-primary/10 transition-colors pointer-events-none" />
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleLanguageSelect('hi')}
                                className="group relative p-6 rounded-2xl border border-border/50 bg-card/50 hover:bg-card hover:border-orange-500/50 transition-all duration-300 shadow-md hover:shadow-xl"
                            >
                                <div className="flex flex-col items-center gap-3">
                                    <span className="text-4xl">🇮🇳</span>
                                    <div className="space-y-1">
                                        <h3 className="text-lg font-semibold font-serif">हिंदी</h3>
                                        <p className="text-xs text-muted-foreground">हिंदी में जारी रखें</p>
                                    </div>
                                    {i18n.language === 'hi' && (
                                        <div className="absolute top-4 right-4 text-orange-600">
                                            <Check className="w-5 h-5" />
                                        </div>
                                    )}
                                </div>
                                <div className="absolute inset-0 border-2 border-orange-500/0 rounded-2xl group-hover:border-orange-500/10 transition-colors pointer-events-none" />
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
};

export default LanguageWelcomeDialog;
