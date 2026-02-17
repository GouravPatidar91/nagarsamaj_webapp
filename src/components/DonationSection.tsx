import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { Card } from '@/components/ui/card';

export function DonationSection() {
    const { t } = useTranslation();

    return (
        <section className="py-20 bg-gradient-to-b from-card/30 to-background/50">
            <div className="section-container">
                <SectionHeader
                    title={t('donation_title')}
                    subtitle={t('donation_subtitle')}
                />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center justify-center"
                >
                    <Card className="p-8 bg-white/5 border-amber-500/20 backdrop-blur-sm max-w-md w-full flex flex-col items-center gap-6 shadow-2xl hover:shadow-amber-500/10 transition-shadow duration-300">
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-yellow-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                            <div className="relative bg-white p-4 rounded-xl">
                                <img
                                    src="/qr.jpeg"
                                    alt="Donation QR Code"
                                    className="w-64 h-64 object-contain"
                                />
                            </div>
                        </div>

                        <div className="text-center space-y-2">
                            <p className="text-lg font-medium text-amber-500 font-display">
                                {t('donation_cta')}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                MP Nagar Brahmin Parishad
                            </p>
                        </div>
                    </Card>
                </motion.div>
            </div>
        </section>
    );
}
