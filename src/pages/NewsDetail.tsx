import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { articles } from '@/data/mockData';

export default function NewsDetail() {
  const { id } = useParams();
  const article = articles.find(a => a.id === id);

  if (!article) {
    return (
      <Layout>
        <div className="section-container py-20 text-center">
          <h1 className="text-2xl font-display font-bold mb-4">Article Not Found</h1>
          <Link to="/news" className="text-primary hover:underline">
            ← Back to News
          </Link>
        </div>
      </Layout>
    );
  }

  const relatedArticles = articles.filter(a => a.id !== id && a.category === article.category).slice(0, 3);

  return (
    <Layout>
      <article className="py-12 md:py-20">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <Link to="/news" className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to News
            </Link>

            <span className="inline-block text-primary text-sm font-medium uppercase tracking-wider mb-4">
              {article.category}
            </span>

            <h1 className="text-4xl md:text-5xl font-display font-bold mb-6 leading-tight">
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-muted-foreground mb-8">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{article.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(article.date).toLocaleDateString('en-US', { dateStyle: 'long' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{article.readTime}</span>
              </div>
            </div>

            <div className="aspect-video rounded-xl overflow-hidden mb-10">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="prose prose-invert prose-lg max-w-none">
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                {article.excerpt}
              </p>
              {article.content.split('\n\n').map((paragraph, index) => (
                <p key={index} className="text-foreground/90 leading-relaxed mb-6">
                  {paragraph}
                </p>
              ))}
            </div>
          </motion.div>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-20 pt-12 border-t border-border/50"
            >
              <h2 className="heading-section mb-8">Related Articles</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedArticles.map((related) => (
                  <Link key={related.id} to={`/news/${related.id}`} className="card-elevated group p-0 overflow-hidden">
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={related.image}
                        alt={related.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="font-display font-semibold group-hover:text-primary transition-colors line-clamp-2">
                        {related.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-2">{related.readTime}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </article>
    </Layout>
  );
}