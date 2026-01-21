import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Loader2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { useEvents } from '@/hooks/useEvents';

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

export default function Events() {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');
  const { data: events, isLoading } = useEvents(filter);

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
            <h1 className="heading-display mb-4">Community Events</h1>
            <p className="text-xl text-muted-foreground">
              Join us for memorable experiences, networking opportunities, and celebrations.
            </p>
          </motion.div>

          {/* Filter Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex gap-2 mb-10"
          >
            {(['all', 'upcoming', 'past'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium capitalize transition-all ${filter === status
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
              >
                {status === 'all' ? 'All Events' : status}
              </button>
            ))}
          </motion.div>

          {/* Events Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-2 gap-8"
          >
            {events?.map((event) => {
              const eventDate = new Date(event.event_date);
              const isUpcoming = eventDate >= new Date();

              return (
                <motion.div key={event.id} variants={itemVariants}>
                  <Link to={`/events/${event.id}`} className="block card-elevated group p-0 overflow-hidden">
                    <div className="aspect-[16/9] overflow-hidden relative">
                      {event.image_url ? (
                        <img
                          src={event.image_url}
                          alt={event.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            if (e.currentTarget.nextElementSibling) {
                              (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                            }
                          }}
                        />
                      ) : null}
                      <div
                        className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/20 flex items-center justify-center"
                        style={{ display: event.image_url ? 'none' : 'flex' }}
                      >
                        <Calendar className="w-20 h-20 text-primary/30" />
                      </div>
                      <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium uppercase backdrop-blur-sm ${isUpcoming
                          ? 'bg-primary/90 text-primary-foreground'
                          : 'bg-muted/90 text-muted-foreground'
                        }`}>
                        {isUpcoming ? 'Upcoming' : 'Past'}
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{eventDate.toLocaleDateString('en-US', { dateStyle: 'medium' })}</span>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span className="truncate">{event.location}</span>
                          </div>
                        )}
                      </div>
                      <h3 className="text-2xl font-display font-semibold mb-3 group-hover:text-primary transition-colors">
                        {event.title}
                      </h3>
                      <p className="text-muted-foreground line-clamp-2">{event.description}</p>
                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/50">
                        {event.max_attendees && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="w-4 h-4" />
                            <span>Max {event.max_attendees} attendees</span>
                          </div>
                        )}
                        <span className="text-primary font-medium text-sm ml-auto">
                          {isUpcoming ? 'Register Now →' : 'View Details →'}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>

          {(!events || events.length === 0) && (
            <div className="text-center py-20">
              <p className="text-muted-foreground">No events found.</p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}