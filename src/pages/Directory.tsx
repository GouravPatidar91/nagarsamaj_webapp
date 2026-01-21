import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Phone, Star, MapPin } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Input } from '@/components/ui/input';
import { businesses, directoryCategories } from '@/data/mockData';

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

export default function Directory() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBusinesses = businesses.filter(business => {
    const matchesCategory = activeCategory === 'All' || business.category === activeCategory;
    const matchesSearch = business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          business.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <Layout>
      <section className="py-12 md:py-20">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mb-12"
          >
            <h1 className="heading-display mb-4">Business Directory</h1>
            <p className="text-xl text-muted-foreground">
              Discover trusted businesses and professionals from our community.
            </p>
          </motion.div>

          {/* Search and Filter */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6 mb-10"
          >
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search businesses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 bg-secondary border-border h-12"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {directoryCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeCategory === category
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Business Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredBusinesses.map((business) => (
              <motion.div
                key={business.id}
                variants={itemVariants}
                className="card-elevated group p-0 overflow-hidden"
              >
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src={business.image}
                    alt={business.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      {business.category}
                    </span>
                    <div className="flex items-center gap-1 text-primary">
                      <Star className="w-4 h-4 fill-primary" />
                      <span className="text-sm font-medium">{business.rating}</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-display font-semibold mt-3 mb-2 group-hover:text-primary transition-colors">
                    {business.name}
                  </h3>

                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {business.description}
                  </p>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{business.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{business.phone}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border/50 flex gap-3">
                    <a
                      href={`tel:${business.phone.replace(/\D/g, '')}`}
                      className="flex-1 text-center py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 text-sm font-medium transition-colors"
                    >
                      Call
                    </a>
                    <a
                      href={`https://wa.me/${business.phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors"
                    >
                      WhatsApp
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {filteredBusinesses.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground">No businesses found matching your criteria.</p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}