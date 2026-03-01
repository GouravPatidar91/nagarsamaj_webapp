import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-[#F1E0C9] bg-[#FDF6ED]">
      <div className="section-container py-12 md:py-16">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden">
                <img src="/Logo.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-display text-xl font-semibold">{t('app_title')}</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('footer_description')}
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground">{t('footer_explore')}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/news" className="text-muted-foreground hover:text-primary transition-colors">{t('nav_news')}</Link></li>
              <li><Link to="/events" className="text-muted-foreground hover:text-primary transition-colors">{t('nav_events')}</Link></li>
              <li><Link to="/jobs" className="text-muted-foreground hover:text-primary transition-colors">{t('nav_jobs')}</Link></li>
              <li><Link to="/directory" className="text-muted-foreground hover:text-primary transition-colors">{t('nav_directory')}</Link></li>
              <li><Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">{t('about_title')}</Link></li>
              <li><a href="https://acrobat.adobe.com/id/urn:aaid:sc:AP:6d0ae172-7bcf-41a9-ab4b-9b5d8e11d18d" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">{t('footer_core_members')}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground">{t('footer_connect')}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/matrimony" className="text-muted-foreground hover:text-primary transition-colors">{t('nav_matrimony')}</Link></li>
              <li><Link to="/chat" className="text-muted-foreground hover:text-primary transition-colors">{t('nav_chat')}</Link></li>
              <li><Link to="/signup" className="text-muted-foreground hover:text-primary transition-colors">{t('nav_join_community')}</Link></li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} {t('app_title')}. {t('footer_rights')}</p>
          <p>{t('footer_made_by')}</p>
        </div>
      </div>
    </footer>
  );
}