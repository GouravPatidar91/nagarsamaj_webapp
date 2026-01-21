import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, Share2, Bookmark, Loader2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { useArticle, useArticles } from '@/hooks/useArticles';

export default function NewsDetail() {
  const { id } = useParams();
  const { data: article, isLoading } = useArticle(id || '');
  const { data: allArticles } = useArticles(article?.category);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

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

  const relatedArticles = allArticles?.filter(a => a.id !== id).slice(0, 3) || [];

  return (
    <Layout>
      <article className="py-8 md:py-16">
        <div className="section-container max-w-5xl">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Link to="/news" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors group">
              <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
              Back to News
            </Link>
          </motion.div>

          {/* Article Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl shadow-2xl border border-border/50 overflow-hidden"
          >
            {/* Hero Image */}
            {article.image_url && (
              <div className="relative aspect-[21/9] overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20">
                <img
                  src={article.image_url}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>
            )}

            {/* Article Content */}
            <div className="p-8 md:p-12">
              {/* Category Badge */}
              <div className="flex items-center gap-4 mb-6">
                <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold uppercase tracking-wider">
                  {article.category}
                </span>
                <div className="flex-1" />
                <button className="p-2 rounded-full hover:bg-secondary transition-colors" title="Share article">
                  <Share2 className="w-5 h-5 text-muted-foreground" />
                </button>
                <button className="p-2 rounded-full hover:bg-secondary transition-colors" title="Bookmark article">
                  <Bookmark className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-5xl font-display font-bold mb-6 leading-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">
                {article.title}
              </h1>

              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-6 pb-8 mb-8 border-b border-border/50">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">
                    {new Date(article.published_at || article.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">5 min read</span>
                </div>
              </div>

              {/* Excerpt */}
              {article.excerpt && (
                <div className="mb-10">
                  <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed font-light italic border-l-4 border-primary pl-6">
                    {article.excerpt}
                  </p>
                </div>
              )}

              {/* Main Content */}
              <div className="prose prose-invert prose-lg md:prose-xl max-w-none">
                <div
                  className="text-foreground/90 leading-relaxed [&>p]:mb-6 [&>h2]:text-2xl [&>h2]:font-display [&>h2]:font-bold [&>h2]:mt-10 [&>h2]:mb-4 [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:mt-8 [&>h3]:mb-3 [&>ul]:my-6 [&>ul]:ml-6 [&>ol]:my-6 [&>ol]:ml-6 [&>blockquote]:border-l-4 [&>blockquote]:border-primary [&>blockquote]:pl-6 [&>blockquote]:italic [&>blockquote]:text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
              </div>

              {/* Article Footer */}
              <div className="mt-12 pt-8 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Last updated: {new Date(article.updated_at).toLocaleDateString()}
                  </div>
                  <div className="flex gap-2">
                    <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-sm">
                      <Share2 className="w-4 h-4" />
                      Share
                    </button>
                    <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-sm">
                      <Bookmark className="w-4 h-4" />
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-16"
            >
              <h2 className="text-2xl font-display font-bold mb-8">More in {article.category}</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedArticles.map((related) => (
                  <Link
                    key={related.id}
                    to={`/news/${related.id}`}
                    className="group bg-card rounded-xl overflow-hidden border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                  >
                    <div className="aspect-video overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10">
                      <img
                        src={related.image_url || 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=800'}
                        alt={related.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    </div>
                    <div className="p-5">
                      <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-3">
                        {related.category}
                      </span>
                      <h3 className="font-display font-bold text-lg group-hover:text-primary transition-colors line-clamp-2 mb-2">
                        {related.title}
                      </h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        {new Date(related.published_at || related.created_at).toLocaleDateString()}
                      </p>
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