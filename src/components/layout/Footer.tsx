import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/30">
      <div className="section-container py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <span className="font-display text-xl text-primary-foreground font-bold">न</span>
              </div>
              <span className="font-display text-xl font-semibold">Nagar Samaj</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A premium platform connecting our Nagar Samaj community through shared experiences, opportunities, and meaningful connections.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground">Explore</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/news" className="text-muted-foreground hover:text-primary transition-colors">News</Link></li>
              <li><Link to="/events" className="text-muted-foreground hover:text-primary transition-colors">Events</Link></li>
              <li><Link to="/jobs" className="text-muted-foreground hover:text-primary transition-colors">Jobs</Link></li>
              <li><Link to="/directory" className="text-muted-foreground hover:text-primary transition-colors">Directory</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground">Connect</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/matrimony" className="text-muted-foreground hover:text-primary transition-colors">Matrimony</Link></li>
              <li><Link to="/chat" className="text-muted-foreground hover:text-primary transition-colors">Community Chat</Link></li>
              <li><Link to="/signup" className="text-muted-foreground hover:text-primary transition-colors">Join Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><span className="text-muted-foreground">Privacy Policy</span></li>
              <li><span className="text-muted-foreground">Terms of Service</span></li>
              <li><span className="text-muted-foreground">Contact</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Nagar Samaj. All rights reserved.</p>
          <p>Made by DNP Studio</p>
        </div>
      </div>
    </footer>
  );
}