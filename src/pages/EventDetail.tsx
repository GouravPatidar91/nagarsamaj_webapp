import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, MapPin, Users, Check } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { events } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

export default function EventDetail() {
  const { id } = useParams();
  const event = events.find(e => e.id === id);
  const [isRegistered, setIsRegistered] = useState(false);
  const { toast } = useToast();

  if (!event) {
    return (
      <Layout>
        <div className="section-container py-20 text-center">
          <h1 className="text-2xl font-display font-bold mb-4">Event Not Found</h1>
          <Link to="/events" className="text-primary hover:underline">
            ← Back to Events
          </Link>
        </div>
      </Layout>
    );
  }

  const handleRegister = () => {
    setIsRegistered(true);
    toast({
      title: 'Successfully registered!',
      description: `You're now registered for ${event.title}`,
    });
  };

  return (
    <Layout>
      <article className="py-12 md:py-20">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Link to="/events" className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Link>

            <div className="grid lg:grid-cols-3 gap-10">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium uppercase mb-4 ${
                  event.status === 'upcoming' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {event.status}
                </div>

                <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">
                  {event.title}
                </h1>

                <div className="aspect-video rounded-xl overflow-hidden mb-8">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="prose prose-invert prose-lg max-w-none">
                  <h2 className="text-2xl font-display font-semibold mb-4">About This Event</h2>
                  <p className="text-foreground/90 leading-relaxed mb-6">
                    {event.description}
                  </p>
                  <p className="text-foreground/90 leading-relaxed">
                    Join us for an unforgettable experience that brings together community members from all walks of life. 
                    This event promises to be a celebration of our shared values, traditions, and aspirations for the future.
                  </p>
                  <p className="text-foreground/90 leading-relaxed">
                    Whether you're a long-time community member or new to our network, this is the perfect opportunity to 
                    connect, learn, and grow alongside fellow members who share your commitment to excellence.
                  </p>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="card-elevated sticky top-28">
                  <h3 className="text-xl font-display font-semibold mb-6">Event Details</h3>
                  
                  <div className="space-y-5">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Date</p>
                        <p className="font-medium">
                          {new Date(event.date).toLocaleDateString('en-US', { dateStyle: 'full' })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Clock className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Time</p>
                        <p className="font-medium">{event.time}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p className="font-medium">{event.location}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Capacity</p>
                        <p className="font-medium">{event.registrations} / {event.capacity} registered</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-border/50">
                    {event.status === 'upcoming' ? (
                      isRegistered ? (
                        <Button className="w-full" variant="secondary" disabled>
                          <Check className="w-4 h-4 mr-2" />
                          Registered
                        </Button>
                      ) : (
                        <Button className="w-full btn-gold" onClick={handleRegister}>
                          Register for Event
                        </Button>
                      )
                    ) : (
                      <Button className="w-full" variant="secondary" disabled>
                        Event Ended
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </article>
    </Layout>
  );
}