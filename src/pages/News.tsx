import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useArticles } from '@/hooks/useArticles';
import { Loader2 } from 'lucide-react';
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

export default function News() {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState('All');
  const { data: articles, isLoading } = useArticles(activeCategory === 'All' ? undefined : activeCategory);

  // Get unique categories from articles
  const categories = ['All', ...Array.from(new Set(articles?.map(a => a.category) || []))];

  const filteredArticles = articles || [];

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-12 md:py-20">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mb-12"
          >
            <h1 className="heading-display mb-4">{t('news_page_title')}</h1>
            <p className="text-xl text-muted-foreground">
              {t('news_page_subtitle')}
            </p>
          </motion.div>

          {/* Category Filters */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-2 mb-10"
          >
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeCategory === category
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
              >
                {t(`cat_${category.toLowerCase()}`)}
              </button>
            ))}
          </motion.div>

          {/* Featured Article */}
          {filteredArticles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-12"
            >
              <Link to={`/news/${filteredArticles[0].id}`} className="block group">
                <div className="grid md:grid-cols-2 gap-8 card-elevated p-0 overflow-hidden">
                  <div className="aspect-[4/3] md:aspect-auto overflow-hidden">
                    <img
                      src={filteredArticles[0].image_url || 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=800'}
                      alt={filteredArticles[0].title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6 md:p-8 flex flex-col justify-center">
                    <span className="text-primary text-sm font-medium uppercase tracking-wider">
                      {filteredArticles[0].category}
                    </span>
                    <h2 className="text-2xl md:text-3xl font-display font-bold mt-3 mb-4 group-hover:text-primary transition-colors">
                      {filteredArticles[0].title}
                    </h2>
                    <p className="text-muted-foreground mb-6">{filteredArticles[0].excerpt}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{new Date(filteredArticles[0].published_at || filteredArticles[0].created_at).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{filteredArticles[0].category}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          )}

          {/* Article Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredArticles.slice(1).map((article) => (
              <motion.div key={article.id} variants={itemVariants}>
                <Link to={`/news/${article.id}`} className="block card-elevated group overflow-hidden p-0">
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={article.image_url || 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=800'}
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6">
                    <span className="text-primary text-sm font-medium">{article.category}</span>
                    <h3 className="text-lg font-display font-semibold mt-2 mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-muted-foreground text-sm line-clamp-2">{article.excerpt}</p>
                    <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                      <span>{new Date(article.published_at || article.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {filteredArticles.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground">{t('no_articles')}</p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}