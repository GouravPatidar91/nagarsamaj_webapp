import { motion } from 'framer-motion';

import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Briefcase, Users, MessageSquare } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { Button } from '@/components/ui/button';
import { articles, events, jobs } from '@/data/mockData';
import { useTranslation } from 'react-i18next';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};



export default function Index() {
  const { t } = useTranslation();
  return (
    <Layout>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/20" />
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal/5 rounded-full blur-3xl" />

        <div className="section-container relative z-10 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-block text-primary text-sm font-medium tracking-wider uppercase mb-6">
                {t('hero_welcome')}
              </span>
              <h1 className="heading-display mb-6">
                {t('hero_title_1')}
                <span className="block gradient-text">{t('hero_title_2')}</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-lg leading-relaxed">
                {t('hero_subtitle')}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/signup">
                  <Button size="lg" className="btn-gold text-lg px-8">
                    {t('btn_join_community')}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/news">
                  <Button variant="outline" size="lg" className="text-lg px-8">
                    {t('btn_latest_news')}
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="card-elevated p-8">
                <span className="text-primary text-sm font-medium uppercase tracking-wider">{t('featured_label')}</span>
                <h3 className="text-2xl font-display font-semibold mt-3 mb-4">
                  {articles[0].title}
                </h3>
                <p className="text-muted-foreground mb-6">{articles[0].excerpt}</p>
                <Link to={`/news/${articles[0].id}`} className="inline-flex items-center text-primary font-medium hover:underline">
                  {t('read_more')} <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </div>
              <div className="absolute -bottom-4 -right-4 w-full h-full bg-primary/10 rounded-xl -z-10" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-border/50">
        <div className="section-container">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              { value: '10K+', label: t('stats_members') },
              { value: '500+', label: t('stats_businesses') },
              { value: '1200+', label: t('stats_jobs') },
              { value: '50+', label: t('stats_events') },
            ].map((stat, index) => (
              <motion.div key={index} variants={itemVariants} className="text-center">
                <div className="text-4xl md:text-5xl font-display font-bold gradient-text">{stat.value}</div>
                <div className="text-muted-foreground mt-2">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Latest News */}
      <section className="py-20">
        <div className="section-container">
          <SectionHeader
            title={t('news_section')}
            subtitle={t('news_subtitle')}
            link={{ text: t('view_all_news'), href: '/news' }}
          />
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {articles.slice(0, 3).map((article) => (
              <motion.div key={article.id} variants={itemVariants}>
                <Link to={`/news/${article.id}`} className="block card-elevated group overflow-hidden p-0">
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6">
                    <span className="text-primary text-sm font-medium">{article.category}</span>
                    <h3 className="text-xl font-display font-semibold mt-2 mb-3 group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-muted-foreground text-sm line-clamp-2">{article.excerpt}</p>
                    <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                      <span>{article.author}</span>
                      <span>•</span>
                      <span>{article.readTime}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-20 bg-card/30">
        <div className="section-container">
          <SectionHeader
            title={t('events_section')}
            subtitle={t('events_subtitle')}
            link={{ text: t('view_all_events'), href: '/events' }}
          />
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-6"
          >
            {events.filter(e => e.status === 'upcoming').slice(0, 2).map((event) => (
              <motion.div key={event.id} variants={itemVariants}>
                <Link to={`/events/${event.id}`} className="flex gap-6 card-elevated group">
                  <div className="w-24 h-24 bg-primary/10 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6 text-primary mb-1" />
                    <span className="text-2xl font-display font-bold">{new Date(event.date).getDate()}</span>
                    <span className="text-xs text-muted-foreground uppercase">
                      {new Date(event.date).toLocaleString('default', { month: 'short' })}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-display font-semibold group-hover:text-primary transition-colors">
                      {event.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mt-2 line-clamp-2">{event.description}</p>
                    <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                      <span>{event.time}</span>
                      <span>•</span>
                      <span>{event.location}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Jobs Preview */}
      <section className="py-20">
        <div className="section-container">
          <SectionHeader
            title={t('jobs_title')}
            subtitle={t('jobs_subtitle')}
            link={{ text: t('view_all_jobs'), href: '/jobs' }}
          />
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {jobs.slice(0, 3).map((job) => (
              <motion.div key={job.id} variants={itemVariants}>
                <Link to="/jobs" className="block card-elevated group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-xs bg-secondary px-3 py-1 rounded-full">{job.type}</span>
                  </div>
                  <h3 className="text-lg font-display font-semibold group-hover:text-primary transition-colors">
                    {job.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mt-1">{job.company}</p>
                  <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                    <span>{job.location}</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <span className="text-primary font-medium">{job.salary}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Community CTA */}
      <section className="py-20 bg-card/30">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="heading-section mb-6">
              {t('cta_title_1')} <span className="gradient-text">{t('cta_title_2')}</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-10">
              {t('cta_subtitle')}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/signup">
                <Button size="lg" className="btn-gold text-lg px-10">
                  <Users className="mr-2 w-5 h-5" />
                  {t('cta_btn_member')}
                </Button>
              </Link>
              <Link to="/chat">
                <Button variant="outline" size="lg" className="text-lg px-10">
                  <MessageSquare className="mr-2 w-5 h-5" />
                  {t('cta_btn_conversation')}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}