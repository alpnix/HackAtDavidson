import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState, useEffect } from "react";
import RegistrationDialog from "./RegistrationDialog";
import logo from "@/assets/hack-davidson-logo.png";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === "/";

  const scrollToSection = (id: string) => {
    // If we're on the home page, scroll directly
    if (isHomePage) {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        setIsOpen(false);
        return;
      }
    }
    
    // If we're on a different page, navigate to home with hash
    navigate(`/#${id}`);
    setIsOpen(false);
  };

  // Handle scrolling when arriving at home page with hash
  useEffect(() => {
    if (isHomePage && location.hash) {
      const id = location.hash.substring(1); // Remove the #
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100); // Small delay to ensure page is rendered
    }
  }, [isHomePage, location.hash]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto pr-4 sm:pr-6 pl-16 sm:pl-20 md:pl-24 lg:pl-28 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <img 
              src={logo} 
              alt="Hack@Davidson Logo" 
              className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
            />
            <h2 className="text-xl sm:text-2xl font-bold text-primary">Hack@Davidson</h2>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <button onClick={() => scrollToSection("about")} className="text-foreground hover:text-primary transition-colors">
              About
            </button>
            <button onClick={() => scrollToSection("schedule")} className="text-foreground hover:text-primary transition-colors">
              Schedule
            </button>
            <button onClick={() => scrollToSection("projects")} className="text-foreground hover:text-primary transition-colors">
              Projects
            </button>
            <button onClick={() => scrollToSection("team")} className="text-foreground hover:text-primary transition-colors">
              Team
            </button>
            <button onClick={() => scrollToSection("faq")} className="text-foreground hover:text-primary transition-colors">
              FAQ
            </button>
            <button onClick={() => scrollToSection("sponsors")} className="text-foreground hover:text-primary transition-colors">
              Sponsors
            </button>
            <Link to="/blog" className="text-foreground hover:text-primary transition-colors">
              Blog
            </Link>
            <RegistrationDialog open={registrationOpen} onOpenChange={setRegistrationOpen} />
          </div>

          {/* Mobile Navigation */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-3">
            <button onClick={() => scrollToSection("about")} className="block w-full text-left py-2.5 text-base text-foreground hover:text-primary transition-colors">
              About
            </button>
            <button onClick={() => scrollToSection("schedule")} className="block w-full text-left py-2.5 text-base text-foreground hover:text-primary transition-colors">
              Schedule
            </button>
            <button onClick={() => scrollToSection("projects")} className="block w-full text-left py-2.5 text-base text-foreground hover:text-primary transition-colors">
              Projects
            </button>
            <button onClick={() => scrollToSection("team")} className="block w-full text-left py-2.5 text-base text-foreground hover:text-primary transition-colors">
              Team
            </button>
            <button onClick={() => scrollToSection("faq")} className="block w-full text-left py-2.5 text-base text-foreground hover:text-primary transition-colors">
              FAQ
            </button>
            <button onClick={() => scrollToSection("sponsors")} className="block w-full text-left py-2.5 text-base text-foreground hover:text-primary transition-colors">
              Sponsors
            </button>
            <Link to="/blog" onClick={() => setIsOpen(false)} className="block w-full text-left py-2.5 text-base text-foreground hover:text-primary transition-colors">
              Blog
            </Link>
            <RegistrationDialog 
              open={registrationOpen} 
              onOpenChange={setRegistrationOpen}
              trigger={<Button size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">Register Now</Button>}
            />
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
