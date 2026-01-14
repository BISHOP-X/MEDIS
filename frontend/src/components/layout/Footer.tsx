import { Link } from "react-router-dom";
import { Activity, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="footer-dark py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
                <Activity className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold font-display text-background dark:text-foreground">
                MEDIS
              </span>
            </Link>
            <p className="text-background/70 dark:text-muted-foreground text-sm leading-relaxed max-w-md mb-6">
              Medical Early Diabetes Insight System - Using advanced AI to predict 
              and prevent Type 2 Diabetes. Moving healthcare from reactive treatment 
              to proactive prevention.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-background/10 dark:bg-muted flex items-center justify-center hover:bg-background/20 dark:hover:bg-muted/80 transition-colors">
                <Mail className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-background/10 dark:bg-muted flex items-center justify-center hover:bg-background/20 dark:hover:bg-muted/80 transition-colors">
                <Phone className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-background/10 dark:bg-muted flex items-center justify-center hover:bg-background/20 dark:hover:bg-muted/80 transition-colors">
                <MapPin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4 text-background dark:text-foreground">Quick Links</h4>
            <ul className="space-y-2 text-sm text-background/70 dark:text-muted-foreground">
              <li><Link to="/" className="hover:text-background dark:hover:text-foreground transition-colors">Home</Link></li>
              <li><Link to="/assessment" className="hover:text-background dark:hover:text-foreground transition-colors">Risk Assessment</Link></li>
              <li><Link to="/dashboard" className="hover:text-background dark:hover:text-foreground transition-colors">Dashboard</Link></li>
              <li><Link to="/auth" className="hover:text-background dark:hover:text-foreground transition-colors">Login</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4 text-background dark:text-foreground">Legal</h4>
            <ul className="space-y-2 text-sm text-background/70 dark:text-muted-foreground">
              <li><a href="#" className="hover:text-background dark:hover:text-foreground transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-background dark:hover:text-foreground transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-background dark:hover:text-foreground transition-colors">HIPAA Compliance</a></li>
              <li><a href="#" className="hover:text-background dark:hover:text-foreground transition-colors">Data Security</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/10 dark:border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-background/50 dark:text-muted-foreground">
            © 2024 MEDIS. All rights reserved. For educational purposes only.
          </p>
          <p className="text-xs text-background/40 dark:text-muted-foreground/70">
            This tool is not a substitute for professional medical advice.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
