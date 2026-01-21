import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  link?: {
    text: string;
    href: string;
  };
}

export function SectionHeader({ title, subtitle, link }: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 md:mb-12"
    >
      <div>
        <h2 className="heading-section">{title}</h2>
        {subtitle && (
          <p className="text-muted-foreground mt-2 max-w-xl">{subtitle}</p>
        )}
      </div>
      {link && (
        <Link
          to={link.href}
          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors group"
        >
          {link.text}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      )}
    </motion.div>
  );
}