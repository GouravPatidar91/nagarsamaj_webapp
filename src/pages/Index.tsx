import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Briefcase, Users, MessageSquare, ExternalLink, Volume2, VolumeX } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect, useRef } from 'react';

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
  const { isAuthenticated } = useAuth();
  const [isMuted, setIsMuted] = useState(false); // Default unmuted as requested
  const videoRef = useRef<HTMLVideoElement>(null);
  const heroRef = useRef<HTMLElement>(null);

  // Handle auto-mute on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Unmute when in view
          setIsMuted(false);
          if (videoRef.current) {
            videoRef.current.muted = false;
            // Attempt playback if paused
            videoRef.current.play().catch(() => {
              // Browser policy might block unmuted autoplay
              console.log('Autoplay blocked, muting video');
              setIsMuted(true);
              if (videoRef.current) videoRef.current.muted = true;
            });
          }
        } else {
          // Mute when out of view
          setIsMuted(true);
          if (videoRef.current) videoRef.current.muted = true;
        }
      },
      { threshold: 0.5 } // Trigger when 50% visible
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Fetch News
  const { data: articles, isLoading: articlesLoading } = useQuery({
    queryKey: ['home-articles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(3);
      if (error) throw error;
      return data;
    },
  });

  // Fetch Events
  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ['home-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'approved')
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true })
        .limit(2);
      if (error) throw error;
      return data;
    },
  });

  // Fetch Jobs
  const { data: jobs, isLoading: jobsLoading } = useQuery({
    queryKey: ['home-jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(3);
      if (error) throw error;
      return data;
    },
  });

  return (
    <Layout>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background Video */}
        <video
          ref={videoRef}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          className="absolute inset-0 w-full h-full object-cover -z-20"
        >
          <source src="/video/video2.mp4" type="video/mp4" />
        </video>
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/60 -z-10" />

        <div className="section-container relative z-10 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-block text-amber-400 text-sm font-medium tracking-wider uppercase mb-6">
                Welcome to Nagar Brahman Samaj
              </span>
              <h1 className="heading-display mb-6 text-white">
                Connect with <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500 pb-2">Nagar Samaj</span>
              </h1>
              <p className="text-xl text-gray-200 mb-8 max-w-lg leading-relaxed">
                The official digital platform for the Nagar Brahman Community. Connect with professionals, find opportunities, and celebrate our heritage together.
              </p>
              <div className="flex flex-wrap gap-4">
                {!isAuthenticated && (
                  <Link to="/signup">
                    <Button size="lg" className="btn-gold text-lg px-8">
                      {t('btn_join_community')}
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                )}
                <Link to="/news">
                  <Button variant="outline" size="lg" className="text-lg px-8 border-white/20 text-white hover:bg-white/10 hover:text-white">
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
              {// Show featured/latest article if available
                articles && articles.length > 0 ? (
                  <div className="backdrop-blur-md bg-white/10 border border-white/20 p-8 rounded-2xl shadow-xl">
                    <span className="text-amber-400 text-sm font-medium uppercase tracking-wider">{t('featured_label')}</span>
                    <h3 className="text-2xl font-display font-semibold mt-3 mb-4 text-white">
                      {articles[0].title}
                    </h3>
                    <p className="text-gray-300 mb-6 line-clamp-3">{articles[0].excerpt}</p>
                    <Link
                      to={`/news/${articles[0].id}`}
                      className="inline-flex items-center text-white font-medium hover:text-amber-400 transition-colors"
                      aria-label={`${t('read_more')} about ${articles[0].title}`}
                    >
                      {t('read_more')} <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </div>
                ) : (
                  <div className="backdrop-blur-md bg-white/10 border border-white/20 p-8 rounded-2xl shadow-xl flex items-center justify-center min-h-[300px]">
                    <p className="text-gray-300">No featured articles available</p>
                  </div>
                )
              }
              <div className="absolute -bottom-4 -right-4 w-full h-full bg-amber-500/10 rounded-xl -z-10" />
            </motion.div>
          </div>
        </div>

        {/* Audio Toggle Button */}
        <button
          onClick={toggleMute}
          className="absolute bottom-8 right-8 z-30 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm border border-white/20 transition-all hover:scale-110"
          aria-label={isMuted ? "Unmute video" : "Mute video"}
        >
          {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
        </button>
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
            {articlesLoading ? (
              [...Array(3)].map((_, i) => <Skeleton key={i} className="h-[400px] w-full rounded-xl" />)
            ) : articles && articles.length > 0 ? (
              articles.map((article) => (
                <motion.div key={article.id} variants={itemVariants}>
                  <Link
                    to={`/news/${article.id}`}
                    className="block card-elevated group overflow-hidden p-0 h-full"
                    aria-label={`Read article: ${article.title}`}
                  >
                    <div className="aspect-video overflow-hidden bg-muted">
                      {article.image_url ? (
                        <img
                          src={article.image_url}
                          alt={article.title}
                          loading="lazy"
                          width="400"
                          height="225"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <ExternalLink className="w-10 h-10 opacity-20" />
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <span className="text-primary text-sm font-medium">{article.category}</span>
                      <h3 className="text-xl font-display font-semibold mt-2 mb-3 group-hover:text-primary transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-muted-foreground text-sm line-clamp-2">{article.excerpt}</p>
                      <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                        {/* We can add author/read time if available in the future */}
                        <span>{new Date(article.published_at || article.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-10 text-muted-foreground">No news articles found.</div>
            )}
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
            {eventsLoading ? (
              [...Array(2)].map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-xl" />)
            ) : events && events.length > 0 ? (
              events.map((event) => (
                <motion.div key={event.id} variants={itemVariants}>
                  <Link to={`/events/${event.id}`} className="flex gap-6 card-elevated group h-full">
                    <div className="w-24 h-24 bg-primary/10 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                      <Calendar className="w-6 h-6 text-primary mb-1" />
                      <span className="text-2xl font-display font-bold">{new Date(event.event_date).getDate()}</span>
                      <span className="text-xs text-muted-foreground uppercase">
                        {new Date(event.event_date).toLocaleString('default', { month: 'short' })}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-display font-semibold group-hover:text-primary transition-colors line-clamp-1">
                        {event.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mt-2 line-clamp-2">{event.description}</p>
                      <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                        <span>{new Date(event.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span>•</span>
                        <span className="line-clamp-1">{event.location}</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-10 text-muted-foreground">No upcoming events found.</div>
            )}
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
            {jobsLoading ? (
              [...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-xl" />)
            ) : jobs && jobs.length > 0 ? (
              jobs.map((job) => (
                <motion.div key={job.id} variants={itemVariants}>
                  <Link to="/jobs" className="block card-elevated group h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Briefcase className="w-6 h-6 text-primary" />
                      </div>
                      <span className="text-xs bg-secondary px-3 py-1 rounded-full">{job.job_type}</span>
                    </div>
                    <h3 className="text-lg font-display font-semibold group-hover:text-primary transition-colors line-clamp-1">
                      {job.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mt-1">{job.company}</p>

                    {isAuthenticated ? (
                      <>
                        <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                          <span>{job.location}</span>
                        </div>
                        <div className="mt-4 pt-4 border-t border-border/50">
                          <span className="text-primary font-medium">{job.salary_range || 'Salary not specified'}</span>
                        </div>
                      </>
                    ) : (
                      <div className="mt-4 pt-4 border-t border-border/50 text-center">
                        <p className="text-sm text-muted-foreground italic">Login to view details</p>
                      </div>
                    )}
                  </Link>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-10 text-muted-foreground">No recent jobs found.</div>
            )}
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
            {isAuthenticated ? (
              <h2 className="heading-section mb-6">
                Thank You for Being a Member! <span className="gradient-text">Of Our Community</span>
              </h2>
            ) : (
              <h2 className="heading-section mb-6">
                {t('cta_title_1')} <span className="gradient-text">{t('cta_title_2')}</span>
              </h2>
            )}

            <p className="text-xl text-muted-foreground mb-10">
              {isAuthenticated ? "We appreciate your contribution to our thriving community. Together we grow stronger." : t('cta_subtitle')}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {!isAuthenticated && (
                <Link to="/signup">
                  <Button size="lg" className="btn-gold text-lg px-10">
                    <Users className="mr-2 w-5 h-5" />
                    {t('cta_btn_member')}
                  </Button>
                </Link>
              )}
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